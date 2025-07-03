class ProductUpsell extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      variantBtn: '[js-product-upsell-variant]',
      atcBtn: '[js-product-upsell-atc]',
      bisBtn: '[js-klaviyo-bis-modal-trigger]',
      upsellTitle: '[js-upsell-title]',
      price: '[js-product-upsell-price]',
      currentColorLabel: '[js-product-upsell-current-color-label]',
      cartDrawer: '#CartDrawer',
      cart: 'cart-drawer',
      error: '[js-product-upsell-error]'
    }

    this._klaviyoBis = {
      modal: '[js-klaviyo-bis-modal]',
      productTitle: '[js-bis-product-title]',
      form: '[js-bis-form]',
      email: 'input[type="email"]',
      submit: '[js-bis-submit]',
      success: '[js-bis-success]',
      error: '[js-bis-error]'
    }
  }

  connectedCallback() {
    this.variantBtns = this.querySelectorAll(this._selectors.variantBtn);
    this.atcBtn = this.querySelector(this._selectors.atcBtn);
    this.bisBtn = this.querySelector(this._selectors.bisBtn);
    this.upsellTitle = this.querySelector(this._selectors.upsellTitle);
    this.price = this.querySelector(this._selectors.price);
    this.currentColorLabel = this.querySelector(this._selectors.currentColorLabel);
    this.cartDrawer = document.querySelector(this._selectors.cartDrawer);
    this.cart = document.querySelector(this._selectors.cart);
    this.error = this.querySelector(this._selectors.error);
  
    this.bisModal = document.querySelector(this._klaviyoBis.modal);
    this.bisForm = this.bisModal.querySelector(this._klaviyoBis.form);
    this.bisSubmit = this.bisModal.querySelector(this._klaviyoBis.submit);

    this._setListeners();
  }

  _setListeners() {
    this.variantBtns.forEach((variantBtn) => {
      variantBtn.addEventListener('click', this._variantBtnOnClick);
    });
    this.atcBtn.addEventListener('click', this._addToCart);
    this.bisBtn.addEventListener('click', this._openBisModal.bind(this));
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
      this.atcBtn.classList.remove('hidden');
      this.bisBtn.classList.add('hidden');
    } else {
      this.atcBtn.querySelector('.btn__text').textContent = 'Out of Stock';
      this.atcBtn.setAttribute('disabled', '');
      this.bisBtn.classList.remove('hidden');
      this.atcBtn.classList.add('hidden');
    }

    this.price.textContent = target.dataset.price;
  }

  _openBisModal(evt) {
    evt.stopImmediatePropagation();
    this._updateBisModal();
    this.bisModal.open();
  }

  _updateBisModal() {
    this._updateBisTitle();
    this._insertBisSelect();
    this._updateBisSubmit();
  }

  _updateBisTitle() {
    if (!this.upsellTitle) return;
    
    this.bisModal.querySelector(this._klaviyoBis.productTitle).textContent = this.upsellTitle.textContent;
  }

  _insertBisSelect() {
    const unavailableVariants = this.querySelectorAll(`${this._selectors.variantBtn}[data-available="false"]`);
    const selectedVariant = this.querySelector(`${this._selectors.variantBtn}[data-selected="true"]`);

    const existingBisSelect = this.bisForm.querySelector('[js-bis-select]');
    if (existingBisSelect) {
      existingBisSelect.remove();
    }

    const bisSelect = document.createElement('div');
    bisSelect.classList.add('form__field');
    bisSelect.setAttribute('js-bis-select', '');
    bisSelect.innerHTML = `
      <label for="bis-variant" class="form__label sr-only">Select Variant</label>
      <select id="bis-variant" name="variant" class="form__element px-sm py-xs border border-gray">
        ${Array.from(unavailableVariants).map(variant => `
          <option value="${variant.dataset.variantId}" ${selectedVariant.dataset.variantId == variant.dataset.variantId ? 'selected' : ''}>${variant.title}</option>
        `).join('')}
      </select>
    `;

    const emailField = this.bisForm.querySelector('[js-bis-email-field]');
    this.bisForm.insertBefore(bisSelect, emailField);
  }

  _updateBisSubmit() {
    this.bisSubmit.dataset.variantId = this.bisForm.querySelector('select').value;
  }
}