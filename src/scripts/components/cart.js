class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

class CartItems extends HTMLElement {
  constructor() {
    super();

    const debouncedOnChange = theme.utils.debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = theme.utils.subscriptions.subscribe(window.PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  onCartUpdate() {
    fetch(`${routes.cart_url}?section_id=cart__main`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const sourceQty = html.querySelector('cart-items');
        this.innerHTML = sourceQty.innerHTML;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartPage-CartItems',
        section: document.getElementById('CartPage-CartItems').dataset.id,
        selector: '[js-cart-page-contents]'
      },
      {
        id: 'cart',
        section: 'cart',
        selector: '[js-cart-drawer-contents]',
      },
      {
        id: 'cart-count',
        section: 'cart-count',
        selector: '.shopify-section',
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...{method: 'POST',headers: { 'Content-Type': 'application/json', Accept: `application/json` },}, ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('[js-cart-item]');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        const cartDrawerWrapper = document.querySelector('cart-drawer');

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = `There was an error while updating your cart. Please try again.`;
          } else {
            message = `You can only add ${updatedValue} of this item to your cart.`;
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? theme.utils.a11y.trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          theme.utils.a11y.trapFocus(cartDrawerWrapper.querySelector('[js-empty-cart]'), cartDrawerWrapper.querySelector('[js-cart-continue-link]'));
        } else if (document.querySelector('[js-cart-item]') && cartDrawerWrapper) {
          theme.utils.a11y.trapFocus(cartDrawerWrapper, document.querySelector('[js-cart-item-image]'));
        }
        theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
      })
      .catch((error) => {
        console.log(error)
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = `There was an error while updating your cart. Please try again.`;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) {
      lineItemError.innerHTML = message;
    }

    const CartPageLineItemError = document.getElementById(`CartMain-LineItemError-${line}`);
    if (CartPageLineItemError) {
      CartPageLineItemError.innerHTML = message;
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('CartPage-CartItems') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} loading-spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} loading-spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((spinner) => spinner.setAttribute("loading", ""));

    document.activeElement.blur();
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('CartPage-CartItems') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} loading-spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} loading-spinner`);
    
    [...cartItemElements, ...cartDrawerItemElements].forEach((spinner) => spinner.removeAttribute("loading"));
  }
}

class CartNote extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      'change',
      theme.utils.debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...{method: 'POST',headers: { 'Content-Type': 'application/json', Accept: `application/json` },}, ...{ body } });
      }, 500)
    );
  }
}

class CartDrawer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const openCart = new URLSearchParams(window.location.search).get('viewcart');
    this.cartDrawer = document.querySelector('#CartDrawer');
    if (openCart === 'true'){
      this.cartDrawer.open();
    }
  }

  renderContents(parsedState) {
    this.productId = parsedState.id;

    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });
    const cartMain = document.querySelector('cart-items')
    if (cartMain) cartMain.onCartUpdate()
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart',
        selector: '#cart',
      },
      {
        id: 'cart-count'
      },
      
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}


class CartDrawerItems extends CartItems {
  getSectionsToRender() {

    if (window.location.pathname.includes('/cart')) {
      return [
        {
          id: 'cart',
          section: 'cart',
          selector: '[js-cart-drawer-contents]',
        },
        {
          id: 'cart-count',
          section: 'cart-count',
          selector: '.shopify-section',
        },
        {
          id: 'CartPage-CartItems',
          section: document.getElementById('CartPage-CartItems').dataset.id,
          selector: '[js-cart-page-contents]'
        }
      ];
    } else {
      return [
        {
          id: 'cart',
          section: 'cart',
          selector: '[js-cart-drawer-contents]',
        },
        {
          id: 'cart-count',
          section: 'cart-count',
          selector: '.shopify-section',
        }
      ];
    }

  }
}