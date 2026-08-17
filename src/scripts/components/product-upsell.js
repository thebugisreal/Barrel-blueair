class ProductUpsell extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      variantBtn: '[js-product-upsell-variant]',
      atcBtn: '[js-product-upsell-atc]',
      addedBtn: '[js-product-upsell-added]',
      bisBtn: '[js-klaviyo-bis-modal-trigger]',
      upsellTitle: '[js-upsell-title]',
      price: '[js-product-upsell-price]',
      mainImage: '.product-upsell__variant-image, [class*="product-upsell__variant-image"]',
      cartDrawer: '#CartDrawer',
      cart: 'cart-drawer',
      error: '[js-product-upsell-error]',
      upsellLink: '.upsell-link',
      upsellImageLink: '.upsell-image-link'
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
    this._cacheElements();
    this._initBis();
    this._setListeners();
    this.addEventListener('upsell-swatches-loaded', this._syncFromSelectedVariant);
    requestAnimationFrame(() => this._syncFromSelectedVariant());
  }

  _cacheElements() {
    this.atcBtn = this.querySelector(this._selectors.atcBtn);
    this.addedBtn = this.querySelector(this._selectors.addedBtn);
    this.bisBtn = this.querySelector(this._selectors.bisBtn);
    this.upsellTitle = this.querySelectorAll(this._selectors.upsellTitle);
    this.price = this.querySelectorAll(this._selectors.price);
    this.mainImage = this.querySelector(this._selectors.mainImage);
    this.cartDrawer = document.querySelector(this._selectors.cartDrawer);
    this.cart = document.querySelector(this._selectors.cart);
    this.error = this.querySelector(this._selectors.error);
    this.upsellLinks = this.querySelectorAll(this._selectors.upsellLink);
    this.upsellImageLinks = this.querySelectorAll(this._selectors.upsellImageLink);
  }

  _initBis() {
    this.bisModal = document.querySelector(this._klaviyoBis.modal);
    if (!this.bisModal) return;

    this.bisForm = this.bisModal.querySelector(this._klaviyoBis.form);
    this.bisSubmit = this.bisModal.querySelector(this._klaviyoBis.submit);
    this.bisSuccess = this.bisModal.querySelector(this._klaviyoBis.success);
    this.bisError = this.bisModal.querySelector(this._klaviyoBis.error);

    if (this.bisBtn) this.bisBtn.addEventListener('click', this._openBisModal.bind(this));
    if (this.bisForm) this.bisForm.addEventListener('submit', this._handleBisFormSubmit.bind(this));
  }

  _setListeners() {
    this.addEventListener('click', this._handleVariantClick);
    if (this.atcBtn) this.atcBtn.addEventListener('click', this._addToCart);
  }

  _handleVariantClick = (evt) => {
    const target = evt.target.closest(this._selectors.variantBtn);
    if (!target || !this.contains(target)) return;
    evt.preventDefault();
    evt.stopPropagation();
    this._variantBtnOnClick(evt, target);
  };

  _handleErrorMessage(errorMessage = false) {
    if (!this.error) return;
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

    const data = {
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
        if (this.atcBtn && this.addedBtn) {
          this.atcBtn.classList.add('hidden');
          this.addedBtn.classList.remove('hidden');
        }
      })
      .catch((e) => {
        this._handleErrorMessage(e.description || 'Something went wrong');
      })
      .finally(() => {
        target.removeAttribute('disabled');
      });
  }

  _variantBtnOnClick = (evt, target, forceSync = false) => {
    this._handleErrorMessage();

    target = target || (evt && evt.currentTarget);
    if (!target) return;

    if (!forceSync && target.dataset.selected == 'true') {
      return;
    }

    const selectedVariantId = target.dataset.variantId;
    this.querySelectorAll(this._selectors.variantBtn).forEach((btn) => {
      btn.dataset.selected = btn.dataset.variantId === selectedVariantId ? 'true' : 'false';
    });

    if (this.mainImage && target.dataset.variantImage) {
      this._updateVariantImage(target.dataset.variantImage);
    }

    if (this.upsellTitle?.length) {
      this.upsellTitle.forEach((title) => {
        const baseTitle = title.getAttribute('data-base-title') || title.textContent.trim();
        const colorName = target.title;

        if (!title.getAttribute('data-base-title')) {
          title.setAttribute('data-base-title', baseTitle);
        }

        const templateColor = title.querySelector('.color-name');
        if (templateColor) {
          templateColor.textContent = colorName;
          templateColor.classList.add('italic');
          templateColor.style.fontWeight = '400';
        }
      });
    }

    if (this.atcBtn) {
      this.atcBtn.setAttribute('data-variant-id', target.dataset.variantId);
      const btnText = this.atcBtn.querySelector('.btn__text');
      if (target.dataset.available == 'true') {
        if (btnText) btnText.textContent = 'Add to Cart';
        this.atcBtn.removeAttribute('disabled');
        this.atcBtn.classList.remove('hidden');
        if (this.addedBtn) this.addedBtn.classList.add('hidden');
        if (this.bisBtn) this.bisBtn.classList.add('hidden');
      } else {
        if (btnText) btnText.textContent = 'Out of Stock';
        this.atcBtn.setAttribute('disabled', '');
        if (this.bisBtn) this.bisBtn.classList.remove('hidden');
        this.atcBtn.classList.add('hidden');
        if (this.addedBtn) this.addedBtn.classList.add('hidden');
      }
    }

    if (this.price) {
      this.price.forEach(price => {
        price.textContent = target.dataset.price;
      });
    }

    const productUrl = target.dataset.productUrl;
    this._updateUpsellLinks(target.dataset.variantId, productUrl);
  }

  _updateVariantImage(url) {
    const img = this.mainImage?.querySelector('img');
    if (img) {
      const cacheBust = url.includes('?') ? '&cb=' : '?cb=';
      img.src = url + cacheBust + Date.now();
      img.srcset = img.src;
    }
    const pictureImg = this.mainImage?.querySelector('picture img');
    if (pictureImg) {
      pictureImg.src = url;
      pictureImg.srcset = url;
    }
  }

  _updateUpsellLinks(variantId, productUrl) {
    const baseUrl = productUrl || this.upsellLinks[0]?.href?.split('?')[0];
    if (!baseUrl) return;

    this.upsellLinks?.forEach((link) => {
      link.href = `${baseUrl}?variant=${variantId}`;
    });
    this.upsellImageLinks?.forEach((link) => {
      link.href = `${baseUrl}?variant=${variantId}`;
    });
  }

  _syncFromSelectedVariant = () => {
    const variantBtns = this.querySelectorAll(this._selectors.variantBtn);
    if (variantBtns.length === 0) return;

    const selectedBtn = variantBtns[0];
    variantBtns.forEach((btn, i) => {
      btn.dataset.selected = i === 0 ? 'true' : 'false';
    });
    this._variantBtnOnClick(null, selectedBtn, true);
  }

  _openBisModal(evt) {
    evt.stopImmediatePropagation();
    if (!this.bisModal) return;
    this._updateBisModal(evt);
    this.bisModal.open();
  }

  _handleBisFormSubmit = (evt) => {
    evt.preventDefault();

    const formData = new FormData(this.bisForm);
    const email = formData.get('email');
    const variant = formData.get('variant');

    const region = Shopify.shop.replace('.myshopify.com', '');
    const submitId = `$shopify:::$default:::${variant}`;

    let apiKey = '';
    if (region == '5ef43d-4a') {
      apiKey = window.klaviyo.apiKeyUS;
    } else if (region == 'uk-blueair') {
      apiKey = window.klaviyo.apiKeyUK;
    } else if (region == 'blueeudev') {
      apiKey = window.klaviyo.apiKeyEU;
    }

    const url = `https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${apiKey}`;

    const payload = {
      "data": {
        "type": "back-in-stock-subscription",
        "attributes": {
          "profile": {
            "data": {
                "type": "profile",
                "attributes": {
                    "email": email,
                }
            }
          },
          "channels": ["EMAIL"],
        },
        "relationships": {
          "variant": {
            "data": {
              "type": "catalog-variant",
              "id": submitId
            }
          }
        }
      }
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'revision': '2024-06-15'
      },
      body: JSON.stringify(payload)
    };

    fetch(url, requestOptions)
      .then((result) => {
        if (result.ok) {
          this.bisSubmit.classList.add('hidden');
          this.bisSuccess.classList.remove('hidden');
        } else {
          this.bisError.classList.remove('hidden');
        }
      })
      .catch(() => {
        this.bisError.classList.remove('hidden');
      });
  }

  _updateBisModal(evt) {
    this._resetBisModal();
    this._updateBisTitle();
    this._insertBisSelect(evt);
    this._handleBisVariantChange();
  }

  _handleBisVariantChange() {
    const bisSelect = this.bisForm.querySelector('[js-bis-select]');
    if (bisSelect) {
      bisSelect.addEventListener('change', this._resetBisModal.bind(this));
    }
  }

  _updateBisTitle() {
    const titleEl = this.upsellTitle?.[0];
    const bisTitle = this.bisModal?.querySelector(this._klaviyoBis.productTitle);
    if (titleEl && bisTitle) {
      bisTitle.textContent = titleEl.textContent;
    }
  }

  _insertBisSelect(evt) {
    const unavailableVariants = this.querySelectorAll(`${this._selectors.variantBtn}[data-available="false"]`);
    const selectedVariant = this.querySelector(`${this._selectors.variantBtn}[data-selected="true"]`);

    const existingBisSelect = this.bisForm.querySelector('[js-bis-select]');
    if (existingBisSelect) {
      existingBisSelect.remove();
    }

    const bisSelect = document.createElement('div');
    bisSelect.classList.add('form__field');
    bisSelect.setAttribute('js-bis-select', '');
    if (unavailableVariants?.length && selectedVariant) {
      bisSelect.innerHTML = `
      <label for="bis-variant" class="form__label sr-only">Select Variant</label>
      <select id="bis-variant" name="variant" class="form__element px-sm py-xs border border-gray">
        ${Array.from(unavailableVariants).map(variant => `
          <option value="${variant.dataset.variantId}" ${selectedVariant.dataset.variantId == variant.dataset.variantId ? 'selected' : ''}>${variant.title}</option>
        `).join('')}
      </select>
    `;
    } else {
      bisSelect.innerHTML = `
        <label for="bis-variant" class="form__label sr-only">Select Variant</label>
        <select id="bis-variant" name="variant" class="form__element px-sm py-xs border border-gray">
          <option value="${evt.currentTarget.dataset.variantId}" selected>${evt.currentTarget.dataset.variantTitle}</option>
        </select>
      `;
    }

    const emailField = this.bisForm.querySelector('[js-bis-email-field]');
    this.bisForm.insertBefore(bisSelect, emailField);
  }

  _resetBisModal() {
    this.bisSubmit.classList.remove('hidden');
    this.bisSuccess.classList.add('hidden');
    this.bisError.classList.add('hidden');
  }
}

export default ProductUpsell;