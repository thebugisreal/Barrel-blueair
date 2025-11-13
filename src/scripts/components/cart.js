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
    this.cart = document.querySelector('cart-drawer');
    this.cartUpdateUnsubscriber = theme.utils.subscriptions.subscribe(window.PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });

    this.discountFormBtn = document.querySelector('.cart-drawer-discounts [js-cart-discount-form-submit]');
    this.discountFormInput = document.querySelector('.cart-drawer-discounts [js-cart-discount-form-input]');
    this.discountFormBtn?.addEventListener('click', this.applyDiscount);

    this.discountPillRemove = document.querySelectorAll('.cart-drawer-discounts [js-cart-discount-pill-remove]');
    this.discountPillRemove?.forEach((pill) => {
      pill.addEventListener('click', this.removeDiscount);
    });


    this.checkIneligibleCartItems();
    this.checkGWP();
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  fetchCart = async () => {
    const response = await fetch('/cart.js');
    return response.json();
  }

  checkGWP = async () => {
    const newCart = await this.fetchCart();

    let hasGwpList = [];
    let isGwpList = [];

    newCart.items.forEach((item) => {
      if(item.properties['_gwp-product']) {
        let itemObject = {};

        itemObject.gwpProductId = parseInt(item.properties['_gwp-product']);
        itemObject.parentProductId = parseInt(item.properties['_parent-product']);

        hasGwpList.push(itemObject)
      }
      if(item.properties['_isGWP']) {
        let giftObject = {};
        
        giftObject.isGWP = item.properties['_isGWP'];
        giftObject.parentProductId = item.properties['_parentProductId'];
        giftObject.giftId = item.properties['_giftId'];
        giftObject.lineItemKey = item.key;

        isGwpList.push(giftObject)
      }
    })


    const missingGifts = hasGwpList.filter((expected) => {
      return !isGwpList.some(actual => 
        parseInt(actual.giftId) === expected.gwpProductId
      );
    });

    if (missingGifts.length > 0) {

      missingGifts.forEach((product) => {
        const gwpData = {
          items: [
            { 
              id: product.gwpProductId, 
              quantity: 1,
              properties: { 
                '_isGWP': true,
                '_parentProductId': product.parentProductId,
                '_giftId': product.gwpProductId 
              }
            }
          ],
          sections: this.cart.getSectionsToRender().map((section) => section.id)
        };
        this.cart._updateCartItems('add', gwpData, true);
      });
    }

    const orphanedGifts = isGwpList.filter((actual) => {
      return !hasGwpList.some(expected =>
        expected.gwpProductId === parseInt(actual.giftId)
      );
    });
    
    if (orphanedGifts.length > 0) {
      orphanedGifts.forEach((gift) => {

        const gwpRemovalData = {
            id: gift.lineItemKey,
            quantity: 0,
            sections: this.cart.getSectionsToRender().map((section) => section.id)
        }

        this.cart._updateCartItems('change', gwpRemovalData, true);
      })
    }
  }

  _adjustCartItems = (type, data) => {
    const loadings = document.querySelectorAll('[js-cart-container-loading]');
    const cart = document.querySelector('cart-drawer');

    loadings.forEach((loading) => {
      loading.setAttribute('loading', '');
    });

    cart.setActiveElement(document.activeElement);

    const res = fetch(window.Shopify.routes.root + `cart/${type}.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((response) => {
        sessionStorage.setItem('noCartWatcherHandle', 'true');

        if (response.status) {
          return;
        }

        if (cart) cart.renderContents(response);
        
        return response;
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        loadings.forEach((loading) => {
          loading.removeAttribute('loading');
        });
      });

    return res;
  }

  checkIneligibleCartItems() {
    if (this.dataset.type == 'cartPage') {
      return;
    }

    const itemToRemoveSellingPlan = this.querySelector('[auto-item-remove-selling-plan]');
    if (itemToRemoveSellingPlan) {
      const update = async () => {
        const  changeData = {
          id: itemToRemoveSellingPlan.dataset.key,
          quantity: parseInt(itemToRemoveSellingPlan.dataset.quantity),
          selling_plan: '',
          properties: { '_Frequency': '', '_frequency_integer': '', 'First Order Date': '', '_unitSubscriptionTempId': '', '_og_first_order_place_date': '' },
          sections: document.querySelector('cart-drawer').getSectionsToRender().map((section) => section.id)
        };
        this._adjustCartItems('change', changeData);
      }
      update();
      return;
    }

    const itemsToRemove = this.querySelectorAll('[auto-item-remove]');
    if (itemsToRemove.length > 0) {
      const update = async () => {
        let updates = {};
        itemsToRemove.forEach((item) => {
          updates[item.dataset.key] = 0;
        });
        const data = { 
          updates,     
          sections: document.querySelector('cart-drawer').getSectionsToRender().map((section) => section.id) 
        };
        this._adjustCartItems('update', data);
      }
      update();
      return;
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

  getConfigToRender(){
    return [
      {
        id: '',

      }
    ]
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

        sessionStorage.setItem('noCartWatcherHandle', 'true');

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
          const emptyCartContainer = cartDrawerWrapper.querySelector('[js-empty-cart]');
          const continueLink = cartDrawerWrapper.querySelector('[js-cart-continue-link]');
          if (emptyCartContainer && continueLink) {
            theme.utils.a11y.trapFocus(emptyCartContainer, continueLink);
          } else if (emptyCartContainer) {
            theme.utils.a11y.trapFocus(emptyCartContainer);
          } else if (continueLink) {
            continueLink.focus();
          }
        } else if (document.querySelector('[js-cart-item]') && cartDrawerWrapper) {
          theme.utils.a11y.trapFocus(cartDrawerWrapper, document.querySelector('[js-cart-item-image]'));
        }
        theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
      })
      .catch((error) => {
        console.log(error)
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if (errors) {
          errors.textContent = `There was an error while updating your cart. Please try again.`;
        }
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

  applyDiscount = async (event) => {
    event.preventDefault();
    console.log('CHECKING')
    const cartDiscountError = document.querySelector('.cart-drawer-discounts [js-cart-discount-error]');
    const cartDiscountErrorDiscountCode = document.querySelector('.cart-drawer-discounts [js-cart-discount-error-discount-code]');
    const cartDiscountErrorShipping = document.querySelector('.cart-drawer-discounts [js-cart-discount-error-shipping]');

    const discountCodeValue = this.discountFormInput.value;

    try {
      const existingDiscounts = this.existingDiscounts();
      if (existingDiscounts.includes(discountCodeValue)) {
        return;
      }

      cartDiscountError.classList.add('hidden');
      cartDiscountErrorDiscountCode.classList.add('hidden');
      cartDiscountErrorShipping.classList.add('hidden');

      const response = await fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discount: [...existingDiscounts, discountCodeValue].join(','),
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname,
        }),
      });

      const data = await response.json();

      if (
        data.discount_codes.find((discount) => {
          return discount.code === discountCodeValue && discount.applicable === false;
        })
      ) {
        this.discountFormInput.value = '';
        this.handleDiscountError('discount_code');
        return;
      }

      const newHtml = data.sections[this.dataset.sectionId];
      const parsedHtml = new DOMParser().parseFromString(newHtml, 'text/html');
      const section = parsedHtml.getElementById(`shopify-section-${this.dataset.sectionId}`);
      const discountCodes = section?.querySelectorAll('.cart-discount__pill-code') || [];

      if (section) {
        const codes = Array.from(discountCodes)
          .map((element) => (element instanceof HTMLLIElement ? element.dataset.discountCode : null))
          .filter(Boolean);
        // Before morphing, we need to check if the shipping discount is applicable in the UI
        // we check the liquid logic compared to the cart payload to assess whether we leveraged
        // a valid shipping discount code.
        if (
          codes.length === existingDiscounts.length &&
          codes.every((code) => existingDiscounts.includes(code)) &&
          data.discount_codes.find((discount) => {
            return discount.code === discountCodeValue && discount.applicable === true;
          })
        ) {
          this.handleDiscountError('shipping');
          this.discountFormInput.value = '';
          // return;
        }
      }

      this.disconnectedCallback();
      
      // Update cart sections directly instead of using onCartUpdate
      this.getSectionsToRender().forEach((section) => {
        const elementToReplace =
          document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id);
        if (elementToReplace && data.sections[section.section]) {
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            data.sections[section.section],
            section.selector
          );
        }
      });
      
      // Reattach event listeners to new DOM elements
      this.connectedCallback();
      
      // Publish cart update event
      theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
    } catch (error) {
      console.error(error);
    }
  }

  handleDiscountError = (errorType) => {
    const cartDiscountError = document.querySelector('.cart-drawer-discounts [js-cart-discount-error]');
    const cartDiscountErrorDiscountCode = document.querySelector('.cart-drawer-discounts [js-cart-discount-error-discount-code]');
    const cartDiscountErrorShipping = document.querySelector('.cart-drawer-discounts [js-cart-discount-error-shipping]');

    const target = errorType === 'discount_code' ? cartDiscountErrorDiscountCode : cartDiscountErrorShipping;
    cartDiscountError.classList.remove('hidden');
    target.classList.remove('hidden');   
  }

  existingDiscounts = () => {
    const discountCodes = [];
    const existingDiscounts = document.querySelectorAll('.cart-drawer-discounts [js-cart-discount-pill-code]');
    existingDiscounts.forEach((discount) => {
      discountCodes.push(discount.textContent.trim());
    });
    return discountCodes;
  }

  updateCheckoutUrls = () => {
    const discountCodes = this.existingDiscounts();
    const discountParam = discountCodes.length > 0 ? `?discount=${discountCodes.join(',')}` : '';
    
    // Update cart page checkout form
    const cartPageForm = document.getElementById('CartPage-Form');
    if (cartPageForm) {
      const newAction = `${window.routes.cart_url}${discountParam}`;
      cartPageForm.action = newAction;
    }
    
    // Update cart drawer checkout form
    const cartDrawerForm = document.getElementById('CartDrawer-Form');
    if (cartDrawerForm) {
      const newAction = `${window.routes.cart_url}${discountParam}`;
      cartDrawerForm.action = newAction;
    }
  }

  removeDiscount = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const discountCode = event.currentTarget.dataset.discountCode;
    if (!discountCode) return;

    const existingDiscounts = this.existingDiscounts();
    const index = existingDiscounts.indexOf(discountCode);
    // if (index === -1) return;

    existingDiscounts.splice(index, 1);
    
    try {
      const response = await fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discount: [...existingDiscounts].join(','),
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname,
        }),
      });

      const data = await response.json();

      this.disconnectedCallback();
      
      // Update cart sections directly instead of using onCartUpdate
      this.getSectionsToRender().forEach((section) => {
        const elementToReplace =
          document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id);
        if (elementToReplace && data.sections[section.section]) {
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            data.sections[section.section],
            section.selector
          );
        }
      });
      
      // Reattach event listeners to new DOM elements
      this.connectedCallback();
      
      // Update checkout URLs with discount codes (after DOM update)
      this.updateCheckoutUrls();
      
      // Publish cart update event
      theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' });
    } catch (error) {
      console.error(error);
    }
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
    const myCartWatcher = new CartWatcher;
    myCartWatcher.init(this);
    window.addEventListener("cart_changed", this._handleCartChange.bind(this));


    const openCart = new URLSearchParams(window.location.search).get('viewcart');
    this.cartDrawer = document.querySelector('#CartDrawer');
    if (openCart === 'true'){
      this.cartDrawer.open();
    }
  }

  _handleCartChange(e) {
    if (sessionStorage.getItem('noCartWatcherHandle')) {
      sessionStorage.removeItem('noCartWatcherHandle');
      return;
    }
    
    fetch(window.location.href)
      .then((response) => response.text())
      .then((response) => {
        const parser = new DOMParser();
        const newDom = parser.parseFromString(response, "text/html");
        this.getSectionsToRender().forEach((section) => {
          const sectionElement = section.selector
            ? document.querySelector(section.selector)
            : document.getElementById(section.id);
          const newContent = section.selector
            ? newDom.querySelector(section.selector)
            : newDom.getElementById(section.id);
          
          if (sectionElement.innerHTML != newContent.innerHTML) {
            sectionElement.innerHTML = newContent.innerHTML
          }
        })
      })
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

_updateCartItems = (type, data, render = true) => {
  this.setActiveElement(document.activeElement); 

  return fetch(window.Shopify.routes.root + `cart/${type}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((response) => {
      sessionStorage.setItem('noCartWatcherHandle', 'true');

      if (response.status) {
        this._handleErrorMessage?.(response.description); 
        this.subscriptionError = true;
        return response;
      }

      if (!this.subscriptionError && render && this.renderContents) {
        this.renderContents(response);
      }

      return response;
    })
    .catch((e) => {
      this._handleErrorMessage?.(e.description);
      console.error(e);
    })
    .finally(() => {
      this.loading?.removeAttribute('loading');
    });
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

class CartSubscription extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      cart: 'cart-drawer',
      editBtn: '[js-cart-subscription-edit]',
      checkbox: '[js-cart-subscription-checkbox]',
      cartItem: '[js-cart-item]',
      loading: 'loading-spinner',
      error: '[js-cart-subscription-error]',
      subscriptionData: '[js-subscription-data-json]'
    }
  }

  connectedCallback() {
    this.cart = document.querySelector(this._selectors.cart);
    this.editBtn = this.querySelector(this._selectors.editBtn);
    this.checkbox = this.querySelector(this._selectors.checkbox);
    this.loading = this.closest(this._selectors.cartItem).querySelector(this._selectors.loading);
    this.error = this.querySelector(this._selectors.error);
    this.subscriptionData = JSON.parse(this.querySelector(this._selectors.subscriptionData).innerHTML);
    
    this.showErrorFromPdp();
    this.editBtn?.addEventListener('click', this.editBtnOnClick);
    this.checkbox.addEventListener('click', this.checkboxOnClick);
  }

  showErrorFromPdp = () => {
    const error = sessionStorage.getItem('cartSubscriptionError');
    if (!error) {
      return;
    }

    if (this.dataset.scope == 'cart-drawr') {
      return;
    }

    alert(error);
    sessionStorage.removeItem('cartSubscriptionError');
  }

  editBtnOnClick = (evt) => {
    evt.preventDefault();

    sessionStorage.setItem('pdpToEditCartSubscription', JSON.stringify(this.subscriptionData));
    window.location.href = evt.currentTarget.href;
  }

  checkboxOnClick = (evt) => {
    evt.preventDefault();

    this.loading.setAttribute('loading', '');

    const init = async () => {
      if (evt.currentTarget.dataset.checked == 'true') {
        let changeData;
        if (this.subscriptionData.airPurifier) {
          changeData = {
            id: this.subscriptionData.filter.itemKey,
            quantity: 0,
            sections: this.cart.getSectionsToRender().map((section) => section.id)
          };
        } else {
          let newProperties = this.subscriptionData.filter.properties;
          newProperties['_Frequency'] = '';
          newProperties['_frequency_integer'] = '';
          newProperties['First Order Date'] = '';
          changeData = {
            id: this.subscriptionData.filter.itemKey,
            quantity: parseInt(this.subscriptionData.filter.itemQuantity),
            selling_plan: '',
            properties: newProperties,
            sections: this.cart.getSectionsToRender().map((section) => section.id)
          };
        }
        this._updateCartItems('change', changeData, true);
      } else {
        if (this.subscriptionData.filter) {
          let newProperties = this.subscriptionData.filter.properties;
          newProperties['_Frequency'] = this.subscriptionData.preSelectedFilter.frequency + ' months';
          newProperties['_frequency_integer'] = this.subscriptionData.preSelectedFilter.frequency;
          const date = new Date();
          const formattedOrderDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          newProperties['First Order Date'] = formattedOrderDate;
          const changeData = {
            id: this.subscriptionData.preSelectedFilter.id,
            selling_plan: this.subscriptionData.preSelectedFilter.sellingPlanId,
            quantity: parseInt(this.subscriptionData.preSelectedFilter.quantity),
            properties: newProperties,
            sections: this.cart.getSectionsToRender().map((section) => section.id)
          };
          this._updateCartItems('change', changeData, true);
        } else {
          let subscriptionTempId;
          if (this.subscriptionData.airPurifier.properties['_unitSubscriptionTempId']) {
            subscriptionTempId = this.subscriptionData.airPurifier.properties['_unitSubscriptionTempId'];
          } else {
            subscriptionTempId = `subscription${Date.now()}`
          }
          const frequency = parseInt(this.subscriptionData.preSelectedFilter.frequency);
          const date = new Date();
          const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
          const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
          const airPurifierProperties = this.subscriptionData.airPurifier.properties;
          airPurifierProperties['_unitSubscriptionTempId'] = subscriptionTempId;

          const changeData = {
            id: this.subscriptionData.airPurifier.itemKey,
            quantity: parseInt(this.subscriptionData.airPurifier.itemQuantity),
            properties: airPurifierProperties
          };

          const res = await this._updateCartItems('change', changeData, false);

          if (res.status) {
            console.log(res.status)
            return;
          }

          const addData = {
            items: [
              { 
                id: this.subscriptionData.preSelectedFilter.id, 
                selling_plan: this.subscriptionData.preSelectedFilter.sellingPlanId,
                quantity: parseInt(this.subscriptionData.preSelectedFilter.quantity),
                properties: { 
                  '_unitSubscriptionTempId': subscriptionTempId,
                  '_Frequency': this.subscriptionData.preSelectedFilter.frequency + ' months',
                  '_frequency_integer': this.subscriptionData.preSelectedFilter.frequency,
                  'First Order Date': formattedOrderDate,
                  '_og_first_order_place_date': formattedOrderDate
                }
              }
            ],
            sections: this.cart.getSectionsToRender().map((section) => section.id)
          }

          if (addData.items[0].quantity == 2) {
            addData.items[0].properties['_two_pack'] = 'true';
          }

          this._updateCartItems('add', addData, true);
        }
      }
    }
    
    init();
  }

  _handleErrorMessage(errorMessage = false) {
    if (errorMessage) {
      this.error.innerHTML = errorMessage;
      this.error.classList.remove('hidden');
    } else {
      this.error.classList.add('hidden');
    }
  }

  _getCartItems = async () => {
    const res = await fetch(window.Shopify.routes.root + 'cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .catch((e) => {
      console.error(e)
    })

    return res
  }

  _updateCartItems = (type, data, render = true) => {
    this.cart.setActiveElement(document.activeElement);

    const res = fetch(window.Shopify.routes.root + `cart/${type}.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((response) => {
        sessionStorage.setItem('noCartWatcherHandle', 'true');

        if (response.status) {
          this._handleErrorMessage(response.description);
          this.subscriptionError = true;
          return response;
        }

        if (!this.subscriptionError) {
          this.subscriptionError = false;
          if (render) {
            if (this.cart) this.cart.renderContents(response);
          }
        }
        
        return response;
      })
      .catch((e) => {
        this._handleErrorMessage(e.description)
        console.log(e);
      })
      .finally(() => {
        this.loading.removeAttribute('loading');
      });

    return res;
  }
}

class CartWatcher {

  init(cartInstance) {
    this.cart = cartInstance; 

    this.emitCartChanges().then(() => {
      this.observeCartChanges();
    });
  }
  

  async fetchCart() {
    const response = await fetch('/cart.js');
    return response.json();
  }

  async emitCartChanges() {
    const newCart = await this.fetchCart();

    const event = new CustomEvent("cart_changed", { detail: newCart });
    window.dispatchEvent(event);
  }

 observeCartChanges() {
    const cartObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const isValidRequestType = ['xmlhttprequest', 'fetch'].includes(entry.initiatorType);
        const isCartChangeRequest = /\/cart\//.test(entry.name);
        if (isValidRequestType && isCartChangeRequest) {
          this.emitCartChanges();
        }
      });
    });
    cartObserver.observe({ entryTypes: ["resource"] });
  }
}