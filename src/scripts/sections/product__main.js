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
      subscription: '[js-subscription]',
      subscriptionToggle: '[js-subscription-toggle]',
      nonSubscriptionToggle: '[js-non-subscription-toggle]',
      subscriptionPrice: '[js-subscription-price]',
      priceCopy: '[js-price-copy]',
      filterSubscriptionVariant: '[js-fitler-subscription-variant]',
      filterSubscriptionDescription: '[js-filter-subscription-description]',
      filterSubscriptionSellingPlansGroup: '[js-filter-subscription-selling-plans-group]',
      filterSubscriptionSellingPlan: '[js-filter-subscription-selling-plan]',
      filterSubscriptionSelectedVariantInput: '[js-filter-subscription-selected-variant-input]',
      filterSubscriptionSelectedVariantSellingPlanInput: '[js-filter-subscription-selected-variant-selling-plan-input]',
      subscriptionContainer: '[js-subscription-container]',
      subscriptionOffer: '[js-subscription-offer]',
      subscriptionCustomization: '[js-subscription-customization]',
      noSubscriptionBtn: '[js-no-subscription-btn]',
      stickyBar: '[js-product-sticky-bar]',
      stickyAtc: '[js-sticky-atc]',
      stickyPrice: '[js-sticky-price]',
      stickySelectOptionsBtn: '[js-sticky-select-options]',
      stickyLoader: '[js-sticky-loader]',
    };
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll(this._selectors.addToCart);
    this.stickyPrice = document.querySelector(this._selectors.stickyPrice);
    this.mainSlides = this.querySelectorAll(this._selectors.mainSlide);
    this.thumbSlides = this.querySelectorAll(this._selectors.thumbSlide);
    this.prices = this.querySelectorAll(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.subscription = this.querySelector(this._selectors.subscription);
    this.subscriptionContainer = this.querySelector(this._selectors.subscriptionContainer);
    this.addToCart = this.querySelector(this._selectors.addToCart)
    this.stickyBars = document.querySelectorAll(this._selectors.stickyBar);
    this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);

    this._toggleStickyBar();

    if (this.dataset.currentSwatch) {
      this.swatchOption = parseInt(this.dataset.swatchOption);
      this.currentSwatch = this.dataset.currentSwatch;
    } else {
      this.currentSwatch = 'Default Swatch'
      this.swatchOption = 0
    }
    
    this._handleSubscription();
    this.addEventListener("variant:change", this._handleVariantChange);
    this._initProductForm();
    this._handleSubscription();
    this._handleStickyBar();
  }

  _handleStickyBar = () => {
    this.stickyBars = document.querySelectorAll(this._selectors.stickyBar);
    this.stickyAtcBtns = document.querySelectorAll(this._selectors.stickyAtc);
    this.buttons = [...this.buttons, ...this.stickyAtcBtns];
    this.stickySelectOptionsBtns = document.querySelectorAll(this._selectors.stickySelectOptionsBtn);
    const stickyLoaders = document.querySelectorAll(this._selectors.stickyLoader);
    this.stickyAtcClicked = false;

    this._toggleStickyBar();
    document.addEventListener('scroll', this._toggleStickyBar);
    this.stickyAtcBtns.forEach((stickyAtc) => {
      stickyAtc.addEventListener('click', this._stickyAtcOnClick);
    });
    this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
      selectOptionsBtn.addEventListener('click', () => {
        this.querySelector('[js-product-info]').scrollIntoView();
      });
    });
  }

  _toggleStickyBar = () => {
    this.stickyBars.forEach((stickyBar) => {
      if (this._checkVisible(this.addToCart)) {
        stickyBar.classList.add('hidden');
      } else {
          stickyBar.classList.remove('hidden');
      }
    });
  }
  
  _stickyAtcOnClick = (evt) => {
    evt.preventDefault();
    this.stickyAtcClicked = true;
    this.addToCart.click();
  }

 _checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
  }

  _handleSubscription() {
    if (!this.subscription) {
      return;
    }

    this.subscriptionType = this.subscription.dataset.type;
    this.subscriptionToggle = this.subscription.querySelector(this._selectors.subscriptionToggle);
    this.nonSubscriptionToggle = this.querySelector(this._selectors.nonSubscriptionToggle);
    this.subscriptionPrice = this.querySelector(this._selectors.subscriptionPrice);
    this.filterSubscriptionVariants = this.querySelectorAll(this._selectors.filterSubscriptionVariant);
    this.filterSubscriptionSellingPlans = this.subscription.querySelectorAll(this._selectors.filterSubscriptionSellingPlan);
    this.filterSubscriptionSelectedVariantInput = this.querySelector(this._selectors.filterSubscriptionSelectedVariantInput);
    this.filterSubscriptionSelectedVariantSellingPlanInput = this.querySelector(this._selectors.filterSubscriptionSelectedVariantSellingPlanInput);

    this.filterSubscriptionVariants.forEach((trigger) => {
      trigger.addEventListener('click', this._filterSubscriptionVariantOnClick);
    });
    
    this.filterSubscriptionSellingPlans.forEach((sellingPlan) => {
      sellingPlan.addEventListener('click' , this.filterSubscriptionSellingPlanOnClick);
    });
    
    this.subscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (this.subscription.dataset.selected == 'true') {
        return;
      }

      this.subscription.dataset.selected = 'true';
      this.nonSubscriptionToggle.dataset.selected = 'false';

      const selectedFilterSubscriptionVariant = this.querySelector(`${this._selectors.filterSubscriptionVariant}[data-selected="true"]`);
      if (selectedFilterSubscriptionVariant) {
        if (selectedFilterSubscriptionVariant.dataset.available == 'true') {
          this._toggleFilterSubscriptionFormInputs(true);
        }
        this._updateAtcStateOnFilterChange(selectedFilterSubscriptionVariant);
      }
    });

    this.nonSubscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (evt.currentTarget.dataset.selected == 'true') {
        return;
      }

      evt.currentTarget.dataset.selected = 'true';
      this.subscription.dataset.selected = 'false';

      this._toggleFilterSubscriptionFormInputs(false);
      this._updateAtcStateOnFilterChange(this.nonSubscriptionToggle);
    });

    const filterSubscriptionVariantToBeSelectedOnLoad = this.subscription.querySelector(`${this._selectors.filterSubscriptionVariant}[current-on-load]`);
    filterSubscriptionVariantToBeSelectedOnLoad?.click();
  }

  _toggleFilterSubscriptionFormInputs = (enable) => {
    if (enable) {
      this.filterSubscriptionSelectedVariantInput.removeAttribute('disabled');
      this.filterSubscriptionSelectedVariantSellingPlanInput.removeAttribute('disabled');
    } else {
      this.filterSubscriptionSelectedVariantInput.setAttribute('disabled', '');
      this.filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('disabled', '');
    }
  }

  _updateAtcStateOnFilterChange = (selectedTrigger) => {
    let btnPrice;
    let btnDisabled;
    if (selectedTrigger.hasAttribute('js-non-subscription-toggle') || this.subscriptionType == 'filter') {
      btnPrice = selectedTrigger.querySelector(`${this._selectors.priceCopy} span`).textContent;
    } else {
      btnPrice = theme.utils.formatMoney(parseInt(selectedTrigger.querySelector(`${this._selectors.priceCopy} span`).dataset.price) + parseInt(this.nonSubscriptionToggle.querySelector(`${this._selectors.priceCopy} span`).dataset.price), this.moneyFormat);
    }
    if (selectedTrigger.dataset.available == 'true') {
      btnDisabled = false;
    } else {
      btnDisabled = true;
    }

    this.buttons.forEach((btn) => {
      if (btn.querySelector(this._selectors.price)) {
        btn.querySelector(this._selectors.price).textContent = btnPrice;
      }
      if (btnDisabled) {
        btn.querySelector(this._selectors.atcText).textContent = 'Out of Stock';
        btn.setAttribute('disabled', '');
      } else {
        btn.querySelector(this._selectors.atcText).textContent = 'Add to Cart';
        btn.removeAttribute('disabled');
      }
    });
  }

  _filterSubscriptionVariantOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    const sellingPlanTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-variant="${triggerTarget.dataset.variant}"]`);
    sellingPlanTarget?.click();
    
    const prevSelectedTrigger = this.querySelector(`${this._selectors.filterSubscriptionVariant}[data-selected="true"]`);
    if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
    triggerTarget.dataset.selected = 'true';

    const prevSellingPlansGroup = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}:not(.hidden)`);
    prevSellingPlansGroup?.classList.add('hidden');
    const newSellingPlansGroup = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}[data-variant="${triggerTarget.dataset.variant}"]`);
    newSellingPlansGroup?.classList.remove('hidden');

    if (triggerTarget.dataset.available == 'true') {
      this._toggleFilterSubscriptionFormInputs(true);
    } else {
      this._toggleFilterSubscriptionFormInputs(false);
    }

    if (this.subscriptionType == 'filter') {
      this.subscriptionPrice.innerHTML = triggerTarget.querySelector(this._selectors.priceCopy).innerHTML;
    }

    this._updateAtcStateOnFilterChange(triggerTarget);
  }

  filterSubscriptionSellingPlanOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    const prevSelectedTrigger = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
    if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
    triggerTarget.dataset.selected = 'true';

    if (this.subscriptionType == 'filter') {
      this.filterSubscriptionSelectedVariantInput.setAttribute('name', 'id');
      this.filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('name', 'selling_plan');
    } else {
      this.filterSubscriptionSelectedVariantInput.setAttribute('name', 'items[1][id]');
      this.filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('name', 'items[1][selling_plan]');
    }
    this.filterSubscriptionSelectedVariantInput.setAttribute('value', triggerTarget.dataset.variant);
    this.filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('value', triggerTarget.dataset.sellingPlanId);
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

    this._updateAddToCartState(variant);

    if (this.currentSwatch && variant.options[this.swatchOption] != this.currentSwatch) {
      this.currentSwatch = variant.options[this.swatchOption];
      this.currentSwatchLabel.textContent = this.currentSwatch;
      this._updateImageCarousel(this.currentSwatch);
    }
    this._updateStickyBar(variant)
    if (variant) {
      if (priceChange) this._updatePrice(variant);
    }
  };

  _updateStickyBar(variant) {
    if (variant) {
      this.stickyAtcBtns.forEach((stickyAtc) => {
        stickyAtc.classList.remove('hidden')
      });
      this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
        selectOptionsBtn.classList.add('hidden')
      });
      this.stickyPrice.innerHTML = `${theme.utils.formatMoney(variant.price, this.moneyFormat)}`
    } else {
      this.stickyAtcBtns.forEach((stickyAtc) => {
        stickyAtc.classList.add('hidden')
      });
      this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
        selectOptionsBtn.classList.remove('hidden')
      });
      this.stickyPrice.innerHTML = ''
    }

  }

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
          if (btn.querySelector(this._selectors.atcText).textContent) {
            btn.querySelector(this._selectors.atcText).textContent = 'Add to Cart';
          }
          btn.removeAttribute('disabled');
        });
      } else {
        this.buttons.forEach((btn) => {
          if (btn.querySelector(this._selectors.atcText)) {
            btn.querySelector(this._selectors.atcText).textContent = 'Out of Stock';
          }
          btn.setAttribute('disabled', '');
        });
      }
    } else {
      this.buttons.forEach((btn) => {
        if (btn.querySelector(this._selectors.atcText).textContent ) {
          btn.querySelector(this._selectors.atcText).textContent = 'Unavailable';
        }
        btn.setAttribute('disabled', '');
      });
    }
  }

  _updatePrice(variant) {
    this.prices.forEach((price) => {
      let priceMarkup;

      if (price.hasAttribute('js-full-price')) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          priceMarkup = `<s class="product__price product__price--compare">${theme.utils.formatMoney(variant.compare_at_price, this.moneyFormat)}</s><span class="product__price product__price--current font-700">${theme.utils.formatMoney(variant.price, this.moneyFormat)}</span>`;
        } else {
          priceMarkup = `<span class="product__price product__price--current font-700">${theme.utils.formatMoney(variant.price, this.moneyFormat)}</span>`;
        }
      } else {
        priceMarkup = `${theme.utils.formatMoney(variant.price, this.moneyFormat)}`;
      }
      price.innerHTML = priceMarkup;
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
