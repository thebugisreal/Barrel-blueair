class ProductMain extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      addToCart: '[js-add-to-cart]',
      atcText: '[js-atc-text]',
      error: '[js-error-message]',
      form: "[js-product-form]",
      loader: "loading-spinner",
      carousel: '[js-pdp-carousel]',
      mainSlide: '[js-main-carousel-slide]',
      thumbSlide: '[js-thumb-carousel-slide]',
      price: '[js-price]',
      currentSwatchLabel: '[js-current-swatch-label]',
      subscriptionContainer: '[js-subscription-container]',
      subscriptionOffer: '[js-subscription-offer]',
      subscriptionCustomization: '[js-subscription-customization]',
      noSubscriptionBtn: '[js-no-subscription-btn]'
    };
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll(this._selectors.addToCart);
    this.mainSlides = this.querySelectorAll(this._selectors.mainSlide);
    this.thumbSlides = this.querySelectorAll(this._selectors.thumbSlide);
    this.prices = this.querySelectorAll(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.subscriptionContainer = this.querySelector(this._selectors.subscriptionContainer);

    if (this.dataset.currentSwatch) {
      this.swatchOption = parseInt(this.dataset.swatchOption);
      this.currentSwatch = this.dataset.currentSwatch;
      this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    }

    this.addEventListener("variant:change", this._handleVariantChange);
    this._initProductForm();
    this._handleSubscription();
  }

  _test() {
    console.log('test')
  }

  _handleSubscription() {
    if (!this.subscriptionContainer) {
      return;
    }

    this.subscriptionOffer = this.subscriptionContainer.querySelector(this._selectors.subscriptionOffer);
    this.subscriptionCustomization = this.subscriptionContainer.querySelector(this._selectors.subscriptionCustomization);
    this.offerBtn = this.subscriptionOffer.querySelector('og-optin-toggle');
    this.noSubscriptionBtn = this.subscriptionContainer.querySelector(this._selectors.noSubscriptionBtn);
    this.noSubscriptionBtnJustClicked = false;

    this.offerBtn.addEventListener('click', () => {
      if (this.noSubscriptionBtnJustClicked) {
        this.noSubscriptionBtn.dataset.selected = 'false';
        this.noSubscriptionBtnJustClicked = false;
      }
      if (!this.offerBtn.hasAttribute('subscribed')) {
        this.offerBtn.click();
      }
    })

    this.noSubscriptionBtn.addEventListener('click', (evt) => {
      evt.preventDefault();

      console.log(evt.currentTarget.dataset.selected)

      if (evt.currentTarget.dataset.selected == 'true') {
        return;
      }

      evt.currentTarget.dataset.selected = 'true';
      if (this.offerBtn.hasAttribute('subscribed')) {
        this.offerBtn.click();
      }
      this.noSubscriptionBtnJustClicked = true;
    });
    /*
    console.log(this.subscriptionOffer.querySelector('.og-text'))
    let array = [];
    array.push(this.dataset.productId);
    console.log(array)
    const offers = window.og.offers.getOptins([49364636860702])
    console.log(offers)
    console.log(this.subscriptionOffer, this.subscriptionCustomization)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        console.log(mutation)
        if (mutation.type === 'childList') {
          console.log('Child node added:');
          console.log('node')
          this._test();
          // Check if the added node is the one you're looking for
          mutation.addedNodes.forEach(node => {
            
            if (node.id === 'specificChildId') {
              console.log('Specific child node added!');
            }
          });
        }
      });
    });
    
    observer.observe(this.subscriptionOffer, { childList: true, subtree: true });
    */
  }

  _initProductForm() {
    this.form = this.querySelector(this._selectors.form);
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-drawer');
    this.cartDrawer = document.querySelector('#CartDrawer')
  }

  onSubmitHandler(evt) {
    evt.preventDefault();

    this.handleErrorMessage();

    this._disableButtons();

    const config = {
      method: 'POST',
      headers: { Accept: `application/javascript`, 'X-Requested-With': 'XMLHttpRequest' },
    }

    const formData = new FormData(this.form);
    if (this.cart) {
      formData.append(
        'sections',
        this.cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append('sections_url', window.location.pathname);
      this.cart.setActiveElement(document.activeElement);
    }
    config.body = formData;

    fetch(`${window.routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartError, {
            source: 'product-form',
            productVariantId: formData.get('id'),
            errors: response.errors || response.description,
            message: response.message,
          });
          this.handleErrorMessage(response.description);
          this.error = true;
          return;
        } else if (!this.cart) {
          window.location = window.routes.cart_url;
          return;
        }

        if (!this.error)
          theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
          this.error = false;
          this.cart.renderContents(response);
          this.cartDrawer.open();
        })
        .catch((e) => {
          this.handleErrorMessage(e.description)
          console.error(e);
        })
      .finally(() => {
        this._enableButtons();
      });
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.querySelector(this._selectors.error)

    if (errorMessage) {
      this.errorMessageWrapper.innerHTML = errorMessage;
      this.errorMessageWrapper.classList.remove('hidden');
    }else{
      this.errorMessageWrapper.classList.add('hidden');
    }
  }

  _handleVariantChange = (evt) => {
    const { variant, priceChange } = evt.detail;

    console.log(variant)

    this._updateAddToCartState(variant);

    if (this.currentSwatch && variant.options[this.swatchOption] != this.currentSwatch) {
      this.currentSwatch = variant.options[this.swatchOption];
      this.currentSwatchLabel.textContent = this.currentSwatch;
      this._updateImageCarousel(this.currentSwatch);
    }

    if (variant) {
      if (priceChange) this._updatePrice(variant);
    }
  };

  _updateImageCarousel(swatchName) {
    let current_thumb_slides_count = 0
    this.thumbSlides.forEach((slide) => {
      slide.classList.remove('hidden', 'swiper-slide', 'swiper-slide-thumb', 'swiper-slide-thumb-active');
      if (slide.dataset.swatch && slide.dataset.swatch != swatchName) {
        slide.classList.add('hidden');
      } else {
        slide.classList.add('swiper-slide', 'swiper-slide-thumb');
        current_thumb_slides_count++;
      }
    });

    this.mainSlides.forEach((slide) => {
      slide.classList.remove('hidden', 'swiper-slide', 'swiper-slide-active');
      if (slide.dataset.swatch && slide.dataset.swatch != swatchName) {
        slide.classList.add('hidden');
      } else {
        slide.classList.add('swiper-slide');
      }
    });

    const carousels = this.querySelectorAll(this._selectors.carousel);
    carousels.forEach((carousel) => {
      carousel.swiper.update();

      if (carousel.hasAttribute('is-thumb-carousel')) {
        if (current_thumb_slides_count < 2) {
          carousel.querySelector('[js-pdp-thumb-next]').classList.add('hide-thumb-carousel');
        } else {
          carousel.querySelector('[js-pdp-thumb-next]').classList.remove('hide-thumb-carousel');
        }
      }
    });
  }

  _updateAddToCartState(variant) {
    if (variant) {
      if (variant.available) {
        this.buttons.forEach((btn) => {
          btn.querySelector(this._selectors.atcText).textContent = 'Add to Cart';
          btn.removeAttribute('disabled');
        });
      } else {
        this.buttons.forEach((btn) => {
          btn.querySelector(this._selectors.atcText).textContent = 'Out of Stock';
          btn.setAttribute('disabled', '');
        });
      }
    } else {
      this.buttons.forEach((btn) => {
        btn.querySelector(this._selectors.atcText).textContent = 'Unavailable';
        btn.setAttribute('disabled', '');
      });
    }
  }

  _updatePrice(variant) {
    /*
    let priceMarkup = '';
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      priceMarkup = `<span class="product__price product__price--current text-red">${theme.utils.formatMoney(variant.price, this.moneyFormat)}</span><s class="product__price product__price--compare ml-3">${theme.utils.formatMoney(variant.compare_at_price, this.moneyFormat)}</s>`;
    } else {
      priceMarkup = `<span class="product__price product__price--current">${theme.utils.formatMoney(variant.price, this.moneyFormat)}</span>`;
    }
      */

    this.prices.forEach((price) => {
      price.innerHTML = `${theme.utils.formatMoney(variant.price, this.moneyFormat)}`;
    })
  }

  _disableButtons() {
    this.buttons.forEach((button) => {
      button.setAttribute("disabled", "");
      const loader = button.querySelector(this._selectors.loader);
      if (loader) {
        loader.setAttribute("loading", "");
      }
    });
  }

  _enableButtons() {
    this.buttons.forEach((button) => {
      button.removeAttribute("disabled");
      const loader = button.querySelector(this._selectors.loader);
      if (loader) {
        loader.removeAttribute("loading");
      }
    });
  }
}
