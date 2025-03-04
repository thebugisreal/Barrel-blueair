class ProductUpsell extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      variantBtn: '[js-product-upsell-variant]',
      atcBtn: '[js-product-upsell-atc]',
      price: '[js-product-upsell-price]',
      currentColorLabel: '[js-product-upsell-current-color-label]',
      cartDrawer: '#CartDrawer',
      cart: 'cart-drawer',
      error: '[js-product-upsell-error]'
    }
  }

  connectedCallback() {
    this.variantBtns = this.querySelectorAll(this._selectors.variantBtn);
    this.atcBtn = this.querySelector(this._selectors.atcBtn);
    this.price = this.querySelector(this._selectors.price);
    this.currentColorLabel = this.querySelector(this._selectors.currentColorLabel);
    this.cartDrawer = document.querySelector(this._selectors.cartDrawer);
    this.cart = document.querySelector(this._selectors.cart);
    this.error = this.querySelector(this._selectors.error);
    
    this._setListeners();
  }

  _setListeners() {
    this.variantBtns.forEach((variantBtn) => {
      variantBtn.addEventListener('click', this._variantBtnOnClick);
    });
    this.atcBtn.addEventListener('click', this._addToCart);
  }

  _handleErrorMessage(errorMessage = false) {
    if (errorMessage) {
      this.error.textContent = errorMessage;
      this.error.classList.remove('hidden');
    } else {
      this.error.classList.add('hidden');
    }
  }

  _addToCart = (evt) => {
    evt.preventDefault();

    this._handleErrorMessage();

    const target = evt.currentTarget;
    target.setAttribute('disabled', '');

    this.cart.setActiveElement(document.activeElement);

    let data = {
      items: [{ id: target.dataset.variantId, quantity: 1 }],
      sections: this.cart.getSectionsToRender().map((section) => section.id)
    };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
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
          return;
        }

        this.cart.renderContents(response);
        this.cartDrawer.open();
      })
      .catch((e) => {
        this._handleErrorMessage(e.description);
        console.log(e);
      })
      .finally(() => {
        target.removeAttribute('disabled');
      });
  }

  _variantBtnOnClick = (evt) => {
    evt.preventDefault();

    this._handleErrorMessage();
    
    const target = evt.currentTarget;

    if (target.dataset.selected == 'true') {
      return;
    }

    const prevSelectedBtn = this.querySelector(`${this._selectors.variantBtn}[data-selected="true"]`);
    if (prevSelectedBtn) prevSelectedBtn.dataset.selected = 'false';
    target.dataset.selected = 'true';

    if (this.currentColorLabel) {
      this.currentColorLabel.textContent = target.title;
    }

    this.atcBtn.setAttribute('data-variant-id', target.dataset.variantId);
    if (target.dataset.available == 'true') {
      this.atcBtn.querySelector('.btn__text').textContent = 'Add to Cart';
      this.atcBtn.removeAttribute('disabled');
    } else {
      this.atcBtn.querySelector('.btn__text').textContent = 'Out of Stock';
      this.atcBtn.setAttribute('disabled', '');
    }

    this.price.textContent = target.dataset.price;
  }
}