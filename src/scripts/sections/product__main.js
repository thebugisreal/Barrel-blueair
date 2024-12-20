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
      subscriptionOffer: '[js-subscription-offer]',
      subscriptionPrice: '[js-subscription-price]',
      nonSubscription: '[js-non-subscription]',
      nonSubscriptionToggle: '[js-non-subscription-toggle]',
      optionSelector: '[js-product-option-selector]',
      filterSubscriptionVariant: '[js-fitler-subscription-variant]',
      filterSubscriptionDescription: '[js-filter-subscription-description]',
      filterSubscriptionSellingPlansGroup: '[js-filter-subscription-selling-plans-group]',
      filterSubscriptionSellingPlan: '[js-filter-subscription-selling-plan]',
      filterSubscriptionSelectedVariantInput: '[js-filter-subscription-selected-variant-input]',
      filterSubscriptionSelectedVariantSellingPlanInput: '[js-filter-subscription-selected-variant-selling-plan-input]'
    };
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll(this._selectors.addToCart);
    this.mainSlides = this.querySelectorAll(this._selectors.mainSlide);
    this.thumbSlides = this.querySelectorAll(this._selectors.thumbSlide);
    this.prices = this.querySelectorAll(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.subscription = this.querySelector(this._selectors.subscription);

    if (this.dataset.currentSwatch) {
      this.swatchOption = parseInt(this.dataset.swatchOption);
      this.currentSwatch = this.dataset.currentSwatch;
      this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    }

    this._handleSubscription();
    this.addEventListener("variant:change", this._handleVariantChange);
    this._initProductForm();
  }

  _handleSubscription() {
    if (!this.subscription) {
      return;
    }

    this.subscriptionType = this.subscription.dataset.type;
    this.subscriptionToggle = this.subscription.querySelector(this._selectors.subscriptionToggle);
    this.subscriptionOfferToggle = this.subscription.querySelector(`${this._selectors.subscriptionOffer} og-optin-toggle`);
    this.nonSubscription = this.querySelector(this._selectors.nonSubscription);
    this.nonSubscriptionToggle = this.querySelector(this._selectors.nonSubscriptionToggle);
    this.filterSubscriptionVariants = this.querySelectorAll(this._selectors.filterSubscriptionVariant);
    this.subscriptionPrice = this.querySelector(this._selectors.subscriptionPrice);
    
    if (this.subscriptionType == 'filter') {
      if (this.subscriptionOfferToggle && !this.subscriptionOfferToggle.hasAttribute('subscribed')) {
        this.subscriptionOfferToggle.click();
      }
    } else {
      this.filterSubscriptionSelectedVariantInput = this.querySelector(this._selectors.filterSubscriptionSelectedVariantInput);
      this.filterSubscriptionSelectedVariantSellingPlanInput = this.querySelector(this._selectors.filterSubscriptionSelectedVariantSellingPlanInput);
      this.filterSubscriptionSellingPlans = this.subscription.querySelectorAll(this._selectors.filterSubscriptionSellingPlan);
      this.filterSubscriptionSellingPlans.forEach((sellingPlan) => {
        sellingPlan.addEventListener('click' , this.filterSubscriptionSellingPlanOnClick);
      });

      const currentSelectedFilterSubscriptionVariant = this.subscription.querySelector(`${this._selectors.filterSubscriptionVariant}[data-selected="true"]`);
      if (currentSelectedFilterSubscriptionVariant) {
        const filterSubscriptionSellingPlanToClick = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-variant="${currentSelectedFilterSubscriptionVariant.dataset.variant}"]`);
        filterSubscriptionSellingPlanToClick?.click();
      }
    }
    

    this.subscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (this.subscription.dataset.selected == 'true') {
        return;
      }

      this.subscription.dataset.selected = 'true';
      this.nonSubscription.dataset.selected = 'false';
      if (this.subscriptionType == 'filter' && this.subscriptionOfferToggle && !this.subscriptionOfferToggle.hasAttribute('subscribed')) {
        this.subscriptionOfferToggle.click();
      }
    });

    this.nonSubscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (this.nonSubscription.dataset.selected == 'true') {
        return;
      }

      this.nonSubscription.dataset.selected = 'true';
      this.subscription.dataset.selected = 'false';
      if (this.subscriptionType == 'filter' && this.subscriptionOfferToggle && this.subscriptionOfferToggle.hasAttribute('subscribed')) {
        this.subscriptionOfferToggle.click();
      }
    });

    this.filterSubscriptionVariants.forEach((trigger) => {
      trigger.addEventListener('click', this._filterSubscriptionVariantOnClick);
    });
  }

  _filterSubscriptionVariantOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    if (this.subscription.dataset.type == 'filter') {
      const optionSelectorTarget = this.querySelector(`${this._selectors.optionSelector}[value="${triggerTarget.dataset.value}"]`);
      optionSelectorTarget?.click();
    } else {
      const sellingPlanTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-variant="${triggerTarget.dataset.variant}"]`);
      sellingPlanTarget?.click();
    }
    
    const prevSelectedTriggers = this.querySelectorAll(`${this._selectors.filterSubscriptionVariant}[data-selected="true"]`);
    prevSelectedTriggers.forEach((prevSelectedTrigger) => {
      prevSelectedTrigger.dataset.selected = 'false';
    });
    const newSelectedTriggers = this.querySelectorAll(`${this._selectors.filterSubscriptionVariant}[data-variant="${triggerTarget.dataset.variant}"]`);
    newSelectedTriggers.forEach((newSelectedTrigger) => {
      newSelectedTrigger.dataset.selected = 'true';
    });

    const prevFilterDescriptions = this.querySelectorAll(`${this._selectors.filterSubscriptionDescription}:not(.hidden)`);
    prevFilterDescriptions.forEach((prevFilterDescription) => {
      prevFilterDescription.classList.add('hidden');
    });
    const newFilterDescriptions = this.querySelectorAll(`${this._selectors.filterSubscriptionDescription}[data-variant="${triggerTarget.dataset.variant}"]`);
    newFilterDescriptions.forEach((newFilterDescription) => {
      newFilterDescription.classList.remove('hidden');
    });

    if (this.subscription.dataset.type == 'airpurifier_and_filter') {
      const prevSellingPlansGroup = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}:not(.hidden)`);
      prevSellingPlansGroup?.classList.add('hidden');
      const newSellingPlansGroup = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}[data-variant="${triggerTarget.dataset.variant}"]`);
      newSellingPlansGroup?.classList.remove('hidden');
    } 
  }

  filterSubscriptionSellingPlanOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    const prevSelectedTrigger = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
    if (prevSelectedTrigger) {
      prevSelectedTrigger.dataset.selected = 'false';
    }
    triggerTarget.dataset.selected = 'true';

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
    console.log(formData)

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

  _confirmSubscriptionOnVariantChange() {
    if (!this.subscription) {
      return;
    }

    if (!this.subscriptionOfferToggle) {
      return;
    }

    if (this.subscription.dataset.selected == 'true') {
      setTimeout(() => {
        if (!this.subscriptionOfferToggle.hasAttribute('subscribed')) {
          this.subscriptionOfferToggle.click();
        }
      }, 400);
    } else {
      setTimeout(() => {
        if (this.subscriptionOfferToggle.hasAttribute('subscribed')) {
          this.subscriptionOfferToggle.click();
        }
      }, 400);
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
      if (this.subscriptionPrice) this._updateSubscriptionPrice(variant);
    }

    this._confirmSubscriptionOnVariantChange();
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

  _updateSubscriptionPrice(variant) {
    let priceMarkup;

    if (variant.selling_plan_allocations.length > 0) {
      if (variant.selling_plan_allocations[0].compare_at_price && variant.selling_plan_allocations[0].compare_at_price > variant.selling_plan_allocations[0].price) {
        priceMarkup = `<s class="product-subscription__price product-subscription__price--compare">${theme.utils.formatMoney(variant.selling_plan_allocations[0].compare_at_price, this.moneyFormat)}</s><span class="product-subscription__price product-subscription__price--current font-700">${theme.utils.formatMoney(variant.selling_plan_allocations[0].price, this.moneyFormat)}</span>`;
      } else {
        priceMarkup = `<span class="product-subscription__price product-subscription__price--current font-700">${theme.utils.formatMoney(variant.selling_plan_allocations[0].price, this.moneyFormat)}</span>`;
      }
    } else {
      priceMarkup = '';
    }

    this.subscriptionPrice.innerHTML = priceMarkup;
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
