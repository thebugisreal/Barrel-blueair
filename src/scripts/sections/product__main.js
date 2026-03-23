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
      discountSubscriptionPrice: '[js-discount-subscription-price]',
      priceCopy: '[js-price-copy]',
      filterSubscriptionVariant: '[js-filter-subscription-variant]',
      filterSubscriptionDescription: '[js-filter-subscription-description]',
      filterSubscriptionSellingPlansGroup: '[js-filter-subscription-selling-plans-group]',
      filterSubscriptionSellingPlan: '[js-filter-subscription-selling-plan]',
      filterSubscriptionMasterFrequency: '[js-filter-subscription-master-frequency]',
      filterSubscriptionFormInput: '[js-filter-subscription-form-input]',
      filterSubscriptionSelectedVariantInput: '[js-filter-subscription-selected-variant-input]',
      filterSubscriptionSelectedVariantSellingPlanInput: '[js-filter-subscription-selected-variant-selling-plan-input]',
      filterSubscriptionFrequencyInput: '[js-filter-subscription-frequency-input]',
      filterSubscriptionFrequencyIntegerInput: '[js-filter-subscription-frequency-integer-input]',
      filterSubscriptionFirstOrderDateInput: '[js-filter-subscription-first-order-date-input]',
      filterSubscriptionTempIdInput: '[js-filter-subscription-temp-id-input]',
      filterSubscriptionTwoPackQuantityInput: '[js-filter-subscription-two-pack-quantity-input]',
      filterSubscriptionOgDateInput: '[js-filter-subscription-og-date-input]',
      subscriptionContainer: '[js-subscription-container]',
      subscriptionOffer: '[js-subscription-offer]',
      subscriptionCustomization: '[js-subscription-customization]',
      noSubscriptionBtn: '[js-no-subscription-btn]',
      stickyBar: '[js-product-sticky-bar]',
      stickyAtc: '[js-sticky-atc]',
      stickyPrice: '[js-sticky-price]',
      stickySelectOptionsBtn: '[js-sticky-select-options]',
      stickyLoader: '[js-sticky-loader]',
      qunatityOption: '[js-quantity-option]',
      quantityVariant: '[js-quantity-variant]',
      quanityOptionImages: '[js-quanity-option-image]',
      optionSwatchesContainers: '[js-product-option-swatches-container]',
      relatedOptionSwatch: '[js-related-option-swatch]',
      filterPackQuantity: '[js-filter-pack-quantity]'
    };
  }

  connectedCallback() {
    window.addEventListener("popstate", this._popStateRender);
    this.buttons = this.querySelectorAll(this._selectors.addToCart);
    this.mainSlides = this.querySelectorAll(this._selectors.mainSlide);
    this.thumbSlides = this.querySelectorAll(this._selectors.thumbSlide);
    this.prices = this.querySelectorAll(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.subscription = this.querySelector(this._selectors.subscription);
    this.subscriptionContainer = this.querySelector(this._selectors.subscriptionContainer);
    this.addToCart = this.querySelector(this._selectors.addToCart)
    this.stickyBars = document.querySelectorAll(this._selectors.stickyBar);
    this.filterPackQuantity = this.querySelectorAll(this._selectors.filterPackQuantity);

    this.isQuickView = this.hasAttribute('data-is-quick-view')

    if (this.dataset.currentSwatch) {
      this.swatchOption = parseInt(this.dataset.swatchOption);
      this.currentSwatch = this.dataset.currentSwatch;
      this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    }

    this.currentQuantity = 1;
    this.currentPrice = parseInt(this.dataset.currentPrice);
    this.currentPriceCompareAt = parseInt(this.dataset.currentPriceCompareAt);

    this._checkCartSubscriptionEdit();
    this._handleFilterPack();

    if (window.innerWidth <= 768) {
      this._handleStickyBar();
      this._watchWindowResize();
    }
    this._handleSubscription();
    this._handleQuantityVariant();
    this.addEventListener("variant:change", this._handleVariantChange);
    this._initProductForm();
    this.optionSwatchesContainers = this.querySelectorAll(this._selectors.optionSwatchesContainers);
    if (this.optionSwatchesContainers.length > 0) {
      this.optionSwatchesContainers.forEach((option) => this._initOptionSwatches(option));
    }
    this._initGiftCardSelects();
  }

  _initGiftCardSelects = () => {
    const selectWrappers = this.querySelectorAll('.product-option__select-wrapper');
    selectWrappers.forEach((wrapper) => {
      const select = wrapper.querySelector('.product-option__select');
      const displayValue = wrapper.querySelector('.product-option__select-value');

      if (!select || !displayValue) return;

      const updateDisplay = () => {
        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption) {
          displayValue.textContent = selectedOption.textContent;
        }
      };

      select.addEventListener('change', updateDisplay);

      updateDisplay();
    });
  }

  _handleFilterPack = () => {
    if (!this.filterPackQuantity) {
      return;
    }

    this.filterPackQuantity.forEach((button) => {
      button.addEventListener('change', this._filterPackQuantityOnClick.bind(this));
    });
  }

  _filterPackQuantityOnClick = (evt) => {
    evt.preventDefault();
    // Check if the quantity is already selected
    this.filterPackQuantity.forEach((quantity) => {
      quantity.checked = false;
    });

    // Update the image index
    const imageIndex = evt.currentTarget.dataset.imageIndex;

    const carousels = this.querySelectorAll(this._selectors.carousel);
    carousels.forEach((carousel) => {
      carousel.swiper.slideTo(imageIndex);
    });

    evt.currentTarget.checked = true;

    // Update the filter quantity
    this.currentQuantity = evt.currentTarget.value;

    // Update the prices
    if (this.subscription) {
      if (this.selectedFilterSubscriptionVariant && this.subscriptionPrice) {
        this._updateSubscriptionPrice(this.selectedFilterSubscriptionVariant, true);
      }
    }
    this._updatePrice(this.currentPrice, this.currentPriceCompareAt, this.currentQuantity);

    // Update the filter quantity label

    const filterQuantityLabel = this.querySelector('[js-filter-subscription-quantity-label]');
    if (filterQuantityLabel) {
      filterQuantityLabel.textContent = `${evt.currentTarget.value} Replacement Filter${ parseInt(evt.currentTarget.value) > 1 ? 's' : '' }`;
    }
  }

  _formatPrice = (priceString) => {
    priceString = +priceString.replace('$', '').replace(',', '');
    return priceString * 100;
  }

  disconnectedCallback() {
    this._disconnectStickyBarObserver();
    window.removeEventListener("popstate", this._popStateRender);
  }

  _checkCartSubscriptionEdit = () => {
    this.pdpToEditCartSubscription = false;
    if (sessionStorage.getItem('pdpToEditCartSubscription')) {
      this.pdpToEditCartSubscription = JSON.parse(sessionStorage.getItem('pdpToEditCartSubscription'));
      sessionStorage.removeItem('pdpToEditCartSubscription');
    }
  }

  _updateQuanityImage(selectedQuantity) {
    const quanityOptionImages = this.querySelectorAll(this._selectors.quanityOptionImages)
    if (!quanityOptionImages) {
      return
    }

    quanityOptionImages.forEach((image) => {
      if (selectedQuantity == image.dataset.quanity) {
        image.classList.remove('hidden')
      } else {
        image.classList.add('hidden')
      }
    });
  }

  _handleQuantityVariant = () => {
    this.qunatityOption = this.querySelector(this._selectors.qunatityOption);

    if (!this.qunatityOption) {
      return;
    }

    this.qunatityOption.addEventListener('change', (evt) => {
      const selectedQuantity = parseInt(evt.target.value);
      if (selectedQuantity != this.currentQuantity) {
        this.currentQuantity = parseInt(evt.target.value);
        this._updatePrice(this.currentPrice, this.currentPriceCompareAt, this.currentQuantity);
        this._updateQuanityImage(selectedQuantity)
      }

      if (this.subscription) {
        if (this.selectedFilterSubscriptionVariant && this.subscriptionPrice) {
          this._updateSubscriptionPrice(this.selectedFilterSubscriptionVariant, true);

          if (this.subscription.dataset.selected == 'true') {
            this._updateAtcStateOnFilterChange(this.selectedFilterSubscriptionVariant);
          }
        }

        if (evt.target.dataset.pack == 'true') {
          if (selectedQuantity == 1) {
            if (this.subscription.dataset.selected == 'true') {
              this.nonSubscriptionToggle.click();
            }
            if (this.subscriptionType == 'filter') {
              this.subscriptionToggle.setAttribute('disabled', '');
            }
            if (this.subscriptionPrice) this.subscriptionPrice.innerHTML = '';
          } else {
            this.subscriptionToggle.removeAttribute('disabled');
          }
        }
      }
    });

    if (this.qunatityOption.querySelector(`${this._selectors.quantityVariant}[data-pack="true"]`)) {
      this.qunatityOption.querySelector(`${this._selectors.quantityVariant}[value="2"]`).click();
    } else {
      this.qunatityOption.querySelector(this._selectors.quantityVariant).click();
    }
  }

  _handleStickyBar = () => {
    this.stickyBars = document.querySelectorAll(this._selectors.stickyBar);
    this.stickyAtcBtns = document.querySelectorAll(this._selectors.stickyAtc);
    this.buttons = [...this.buttons, ...this.stickyAtcBtns];
    this.stickyPrices = document.querySelectorAll(this._selectors.stickyPrice);
    this.prices = [...this.prices, ...this.stickyPrices]
    this.stickySelectOptionsBtns = document.querySelectorAll(this._selectors.stickySelectOptionsBtn);
    const stickyLoaders = document.querySelectorAll(this._selectors.stickyLoader);
    this.stickyAtcClicked = false;

    this._initStickyBarObserver();
    this.stickyAtcBtns.forEach((stickyAtc) => {
      stickyAtc.addEventListener('click', this._stickyAtcOnClick);
    });
    this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
      selectOptionsBtn.addEventListener('click', () => {
        this.querySelector('[js-product-info]').scrollIntoView();
      });
    });
  }

  _initStickyBarObserver = () => {
    if (!this.addToCart) return;

    const observeTarget = this.addToCart;

    this.stickyBarVisible = false;
    this.isUpdating = false;

    this.debouncedStickyBarUpdate = theme.utils.debounce((shouldShowStickyBar) => {
      if (this.isUpdating) return;

      this.isUpdating = true;

      // Double-check the state hasn't changed during debounce delay
      if (shouldShowStickyBar !== this.stickyBarVisible) {
        this.stickyBarVisible = shouldShowStickyBar;

        this.stickyBars.forEach((stickyBar) => {
          if (shouldShowStickyBar) {
            stickyBar.classList.remove('hidden');
            document.documentElement.style.setProperty('--sticky-bar-height', `${stickyBar.clientHeight}px`)
          } else {
            stickyBar.classList.add('hidden');
          }
        });

        // Add/remove body class for layout adjustments
        if (shouldShowStickyBar) {
          document.body.classList.add('sticky-bar-visible');
        } else {
          document.body.classList.remove('sticky-bar-visible');
        }
      }

      // Reset the updating flag after DOM settles
      requestAnimationFrame(() => {
        this.isUpdating = false;
      });
    }, 500);

    this.stickyBarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const shouldShowStickyBar = !entry.isIntersecting;

        // Only update if state actually changed and we're not currently updating
        if (shouldShowStickyBar !== this.stickyBarVisible && !this.isUpdating) {
          this.debouncedStickyBarUpdate(shouldShowStickyBar);
        }
      });
      }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0
      });

    this.stickyBarObserver.observe(observeTarget);
  }

  _stickyAtcOnClick = (evt) => {
    evt.preventDefault();
    this.stickyAtcClicked = true;
    this.addToCart.click();
  }


  _disconnectStickyBarObserver = () => {
    if (this.stickyBarObserver) {
      this.stickyBarObserver.disconnect();
      this.stickyBarObserver = null;
    }

    // Clean up debounced function reference
    this.debouncedStickyBarUpdate = null;
  }

  _deselectAllSubscriptions() {
    // Deselect all subscriptions
    const allSubscriptions = this.querySelectorAll('[js-subscription]');
    allSubscriptions.forEach((subscription) => {
      subscription.dataset.selected = 'false';
      const formInputs = subscription.querySelectorAll('[js-filter-subscription-form-input]');
      formInputs.forEach(input => input.setAttribute('disabled', ''));
    });

    // Deselect non-subscription
    this.nonSubscriptionToggle.dataset.selected = 'false';
  }

  _handleSubscription() {
    // Get all subscriptions
    const allSubscriptions = this.querySelectorAll('[js-subscription]');
    if (allSubscriptions.length === 0) {
      return;
    }

    this.subscription = allSubscriptions[0];
    this.subscriptionType = this.subscription.dataset.type;
    this.subscriptionToggle = this.subscription.querySelector(this._selectors.subscriptionToggle);
    this.nonSubscriptionToggle = this.querySelector(this._selectors.nonSubscriptionToggle);
    this.subscriptionPrice = this.subscription.querySelector(this._selectors.subscriptionPrice);
    this.filterSubscriptionFormInputs = this.subscription.querySelectorAll(this._selectors.filterSubscriptionFormInput);
    this.filterSubscriptionSelectedVariantInput = this.subscription.querySelector(this._selectors.filterSubscriptionSelectedVariantInput);
    this.filterSubscriptionSelectedVariantSellingPlanInput = this.subscription.querySelector(this._selectors.filterSubscriptionSelectedVariantSellingPlanInput);
    this.filterSubscriptionFrequencyInput = this.subscription.querySelector(this._selectors.filterSubscriptionFrequencyInput);
    this.filterSubscriptionFrequencyIntegerInput = this.subscription.querySelector(this._selectors.filterSubscriptionFrequencyIntegerInput);
    this.filterSubscriptionFirstOrderDateInput = this.subscription.querySelector(this._selectors.filterSubscriptionFirstOrderDateInput);
    this.filterSubscriptionTempIdInputs = this.subscription.querySelectorAll(this._selectors.filterSubscriptionTempIdInput);
    this.filterSubscriptionOgDateInput = this.subscription.querySelector(this._selectors.filterSubscriptionOgDateInput);
    this.subscriptionSelectedOnLoad = this.subscription.dataset.selected == 'true' ? true : false;

    if (this.subscription.hasAttribute('is-airpurifier-type-two-pack')) {
      this.currentQuantity = 2;
      this.filterSubscriptionTwoPackQuantityInput = this.querySelector(this._selectors.filterSubscriptionTwoPackQuantityInput);
    }

    // Get all subscription elements
    this.filterSubscriptionVariants = this.querySelectorAll(this._selectors.filterSubscriptionVariant);
    this.filterSubscriptionSellingPlans = this.querySelectorAll(this._selectors.filterSubscriptionSellingPlan);
    this.filterSubscriptionMasterFrequencies = this.querySelectorAll(this._selectors.filterSubscriptionMasterFrequency);

    if (this.subscriptionType == '2in1_purify_humidify') {
      this.filterSubscriptionSellingPlansGroups = this.querySelectorAll(this._selectors.filterSubscriptionSellingPlansGroup);
      this.purifyHumidifySubscriptionAvailable = true;
      if (this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}:disabled`)) {
        this.purifyHumidifySubscriptionAvailable = false;
        this.filterSubscriptionSellingPlans.forEach((sellingPlan) => {
          sellingPlan.setAttribute('disabled', '');
        });
      }
      if (this.subscriptionSelectedOnLoad) {
        if (this.purifyHumidifySubscriptionAvailable) {
          this._toggleFilterSubscriptionFormInputs(true);
        }
        this._updateAtcStateOnFilterChange(false);
      }
    }

    // Set event listeners for all subscription elements
    this.filterSubscriptionVariants.forEach((trigger) => {
      trigger.addEventListener('click', this._filterSubscriptionVariantOnClick);
    });

    this.filterSubscriptionSellingPlans.forEach((sellingPlan) => {
      sellingPlan.addEventListener('click' , this._filterSubscriptionSellingPlanOnClick);
    });

    this.filterSubscriptionMasterFrequencies.forEach((masterFrequency) => {
      masterFrequency.addEventListener('click', this._filterSubscriptionMasterFrequencyOnClick);
    });

    // Set toggle handlers for all subscriptions
    allSubscriptions.forEach((subscription) => {
      const subscriptionToggle = subscription.querySelector(this._selectors.subscriptionToggle);
      if (subscriptionToggle) {
        subscriptionToggle.addEventListener('click', (evt) => {
          evt.preventDefault();

          if (subscription.dataset.selected == 'true') {
            return;
          }

          this._deselectAllSubscriptions();
          subscription.dataset.selected = 'true';

          // Enable form inputs for this subscription
          const formInputs = subscription.querySelectorAll('[js-filter-subscription-form-input]');
          formInputs.forEach(input => input.removeAttribute('disabled'));

          // Initialize subscription when opened
          const subscriptionType = subscription.dataset.type;
          if (subscriptionType == '2in1_purify_humidify') {
            // For 2in1_purify_humidify, try to select the first available scent variant
            const firstVariant = subscription.querySelector('[js-scent-subscription-variant][current-on-load]');
            if (firstVariant) {
              firstVariant.click();
            }
            // Then select first master frequency
            const firstMasterFrequency = subscription.querySelector('[js-filter-subscription-master-frequency]');
            if (firstMasterFrequency) {
              firstMasterFrequency.click();
            }
          } else {
            // For other types, try to select the first available variant
            const firstVariant = subscription.querySelector('[js-filter-subscription-variant][current-on-load]');
            if (firstVariant) {
              firstVariant.click();
            }
          }

          // Update ATC subscription price only for main subscription
          if (subscription === this.subscription) {
            this._updateAtcSubscriptionPrice();
          }
        });
      }
    });

    this.nonSubscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (evt.currentTarget.dataset.selected == 'true') {
        return;
      }

      this._deselectAllSubscriptions();
      evt.currentTarget.dataset.selected = 'true';

      this._toggleFilterSubscriptionFormInputs(false);
      this._updateAtcStateOnFilterChange(this.nonSubscriptionToggle);
    });

    if (this.subscriptionSelectedOnLoad) {
      const filterSubscriptionVariantToBeSelectedOnLoad = this.subscription.querySelector(`${this._selectors.filterSubscriptionVariant}[current-on-load]`);
      if (filterSubscriptionVariantToBeSelectedOnLoad) {
        filterSubscriptionVariantToBeSelectedOnLoad.click();
      } else if (this.subscriptionType == '2in1_purify_humidify' && this.purifyHumidifySubscriptionAvailable) {
        // Select the first master frequency option
        const firstMasterFrequency = this.filterSubscriptionMasterFrequencies[0];
        if (firstMasterFrequency) {
          firstMasterFrequency.click();
        }
      }
    }

    if (this.pdpToEditCartSubscription) {
      this.subscriptionToggle.click();
    }
  }

  _toggleFilterSubscriptionFormInputs = (enable) => {
    if (enable) {
      this.filterSubscriptionFormInputs.forEach((input) => {
        input.removeAttribute('disabled');
      });
    } else {
      this.filterSubscriptionFormInputs.forEach((input) => {
        input.setAttribute('disabled', '');
      });
    }
  }

  _updateAtcSubscriptionPrice = () => {
    const discountSubscriptionPrice = this.querySelector(this._selectors.discountSubscriptionPrice);
    if (!discountSubscriptionPrice) {
      return;
    }
    if (this.stickyPrices && this.stickyPrices.length > 0) {
      this.stickyPrices.forEach((price) => {
        price.textContent = discountSubscriptionPrice.textContent;
      });
    }
    this.buttons.forEach((btn) => {
      btn.querySelector(this._selectors.price).textContent = discountSubscriptionPrice.textContent;
    });
  }

  _updateAtcStateOnFilterChange = (selectedTrigger) => {
    let btnPrice;
    let btnDisabled;

    if (selectedTrigger && selectedTrigger.hasAttribute('js-non-subscription-toggle')) {
      btnPrice = selectedTrigger.querySelector(`${this._selectors.priceCopy} span`).textContent;
    } else if (this.subscriptionType == 'filter') {
      btnPrice = theme.utils.formatMoney(parseInt(selectedTrigger.querySelector(this._selectors.priceCopy).dataset.price * this.currentQuantity), this.moneyFormat);
    } else {
      btnPrice = theme.utils.formatMoney(parseInt(this.nonSubscriptionToggle.querySelector(this._selectors.priceCopy).dataset.price), this.moneyFormat);
    }

    if ((selectedTrigger && selectedTrigger.hasAttribute('js-non-subscription-toggle')) || this.subscriptionType == 'filter') {
      if (selectedTrigger.dataset.available == 'true') {
        btnDisabled = false;
      } else {
        btnDisabled = true;
      }
    } else if (this.subscriptionType =='airpurifier_and_filter') {
      if (selectedTrigger.dataset.available == 'true' && this.nonSubscriptionToggle.dataset.available == 'true') {
        btnDisabled = false;
      } else {
        btnDisabled = true;
      }
    } else {
      if (this.purifyHumidifySubscriptionAvailable == true && this.nonSubscriptionToggle.dataset.available == 'true') {
        btnDisabled = false;
      } else {
        btnDisabled = true;
      }
    }

    this.buttons.forEach((btn) => {
      if (btn.querySelector(this._selectors.price)) {
        btn.querySelector(this._selectors.price).textContent = btnPrice;
      }
      if (btnDisabled) {
        btn.querySelector(this._selectors.atcText).textContent = 'Out of Stock';
        btn.setAttribute('disabled', '');
      } else {
        btn.querySelector(this._selectors.atcText).textContent = `${this.pdpToEditCartSubscription == false ? 'Add to Cart' : 'Update'}`;
        btn.removeAttribute('disabled');
      }
    });
    if (this.stickyPrices && this.stickyPrices.length > 0) {
      this.stickyPrices.forEach((price) => {
        price.textContent = btnPrice;
      });
    }
  }

  _updateSubscriptionPrice = (selectedFilterSubscriptionVariant, updateFilterSubscriptionVariantPriceLabel = false) => {
    const subscriptionPrice = selectedFilterSubscriptionVariant.querySelector(this._selectors.priceCopy).dataset.price;
    const subscriptionPriceCompareAt = selectedFilterSubscriptionVariant.querySelector(this._selectors.priceCopy).dataset.priceCompareAt;

    let subscriptionPriceMarkup;
    if (subscriptionPriceCompareAt && subscriptionPriceCompareAt > subscriptionPrice) {
      subscriptionPriceMarkup = `<s>${theme.utils.formatMoney(subscriptionPriceCompareAt * this.currentQuantity, this.moneyFormat)}</s><span class="font-700">${theme.utils.formatMoney(subscriptionPrice * this.currentQuantity, this.moneyFormat)}</span>`;
    } else {
      subscriptionPriceMarkup = `<span class="font-700">${theme.utils.formatMoney(subscriptionPrice * this.currentQuantity, this.moneyFormat)}</span>`;
    }
    this.subscriptionPrice.innerHTML = subscriptionPriceMarkup;


    if (updateFilterSubscriptionVariantPriceLabel) {
      this.filterSubscriptionVariants.forEach((filterSubscriptionVariant) => {
        const label = filterSubscriptionVariant.querySelector(this._selectors.priceCopy);
        let labelMarkup;
        if (label.dataset.labelPriceCompareAt && label.dataset.labelPriceCompareAt > label.dataset.labelPrice) {
          labelMarkup = `<s>${theme.utils.formatMoney(label.dataset.labelPriceCompareAt * this.currentQuantity, this.moneyFormat)}</s><span class="font-700">${theme.utils.formatMoney(label.dataset.labelPrice * this.currentQuantity, this.moneyFormat)}</span>`;
        } else {
          labelMarkup = `<span class="font-700">${theme.utils.formatMoney(label.dataset.labelPrice * this.currentQuantity, this.moneyFormat)}</span>`;
        }
        label.innerHTML = labelMarkup;
      });
    }
  }

  _filterSubscriptionVariantOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    // Find the subscription container (main or additional)
    const subscriptionContainer = triggerTarget.closest('[js-subscription]');
    if (!subscriptionContainer) return;

    if (triggerTarget.hasAttribute('is-variant-link')) {
      if (this.pdpToEditCartSubscription != false) {
        sessionStorage.setItem('pdpToEditCartSubscription', JSON.stringify(this.pdpToEditCartSubscription));
      }
      window.location.href = triggerTarget.getAttribute('is-variant-link');
      return;
    }

    // Only deselect within the same subscription container
    const prevSelectedTrigger = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionVariant}[data-selected="true"]`);
    if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
    triggerTarget.dataset.selected = 'true';

    // Check if this is a scent subscription variant
    const isScentVariant = triggerTarget.hasAttribute('js-scent-subscription-variant');

    if (isScentVariant) {
      // Handle scent variant: update js-scent-subscription-form-input
      const scentVariantId = triggerTarget.dataset.variant;
      const scentItemIndex = triggerTarget.dataset.index;

      // Update variant ID in scent subscription form inputs
      const scentVariantInput = subscriptionContainer.querySelector(`[js-scent-subscription-form-input][name="items[${scentItemIndex}][id]"]`);
      if (scentVariantInput) {
        scentVariantInput.setAttribute('value', scentVariantId);
      }
    } else {
      // Handle filter variant: find and click related selling plans, show/hide selling plan groups
    const relatedSubscriptions = subscriptionContainer.querySelectorAll(`${this._selectors.filterSubscriptionSellingPlan}[data-variant="${triggerTarget.dataset.variant}"]`);

    if (relatedSubscriptions[1]) {
      relatedSubscriptions[1].click();
    } else if (relatedSubscriptions[0]) {
      relatedSubscriptions[0].click();
    }

    const prevSellingPlansGroup = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}:not(.hidden)`);
      if (prevSellingPlansGroup) prevSellingPlansGroup.classList.add('hidden');
    const newSellingPlansGroup = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSellingPlansGroup}[data-variant="${triggerTarget.dataset.variant}"]`);
      if (newSellingPlansGroup) newSellingPlansGroup.classList.remove('hidden');
    }

    if (triggerTarget.dataset.available == 'true') {
      const formInputs = subscriptionContainer.querySelectorAll('[js-filter-subscription-form-input]');
      formInputs.forEach(input => input.removeAttribute('disabled'));
      const scentFormInputs = subscriptionContainer.querySelectorAll('[js-scent-subscription-form-input]');
      scentFormInputs.forEach(input => input.removeAttribute('disabled'));
    } else {
      const formInputs = subscriptionContainer.querySelectorAll('[js-filter-subscription-form-input]');
      formInputs.forEach(input => input.setAttribute('disabled', ''));
      const scentFormInputs = subscriptionContainer.querySelectorAll('[js-scent-subscription-form-input]');
      scentFormInputs.forEach(input => input.setAttribute('disabled', ''));
    }

    // Update subscription price for the appropriate subscription container
    const subscriptionPriceElement = subscriptionContainer.querySelector('[js-subscription-price]');
    if (subscriptionPriceElement && subscriptionContainer.dataset.type === 'filter') {
      const priceData = triggerTarget.querySelector(this._selectors.priceCopy);
      if (priceData) {
        const subscriptionPrice = priceData.dataset.price;
        const subscriptionPriceCompareAt = priceData.dataset.priceCompareAt;

        let subscriptionPriceMarkup;
        if (subscriptionPriceCompareAt && subscriptionPriceCompareAt > subscriptionPrice) {
          subscriptionPriceMarkup = `<s>${theme.utils.formatMoney(subscriptionPriceCompareAt * this.currentQuantity, this.moneyFormat)}</s><span class="font-700">${theme.utils.formatMoney(subscriptionPrice * this.currentQuantity, this.moneyFormat)}</span>`;
        } else {
          subscriptionPriceMarkup = `<span class="font-700">${theme.utils.formatMoney(subscriptionPrice * this.currentQuantity, this.moneyFormat)}</span>`;
        }
        subscriptionPriceElement.innerHTML = subscriptionPriceMarkup;
      }
    } else if (subscriptionContainer === this.subscription && this.subscriptionPrice) {
      this._updateSubscriptionPrice(triggerTarget, false);
    }

    this._updateAtcStateOnFilterChange(triggerTarget);

    // Store selected variant if it's the main subscription
    if (subscriptionContainer === this.subscription) {
      this.selectedFilterSubscriptionVariant = triggerTarget;
    }
  }

  _filterSubscriptionSellingPlanOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    // Find the subscription container (main or additional)
    const subscriptionContainer = triggerTarget.closest('[js-subscription]');
    if (!subscriptionContainer) return;

    const subscriptionType = subscriptionContainer.dataset.type;

    if (subscriptionType == '2in1_purify_humidify') {
      const prevSelectedTrigger = triggerTarget.closest(this._selectors.filterSubscriptionSellingPlansGroup).querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
      if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
      triggerTarget.dataset.selected = 'true';

      const filterSubscriptionSelectedVariantInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSelectedVariantInput}[name="items[${triggerTarget.dataset.index}][id]"]`);
      const filterSubscriptionSelectedVariantSellingPlanInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSelectedVariantSellingPlanInput}[name="items[${triggerTarget.dataset.index}][selling_plan]"]`);
      if (filterSubscriptionSelectedVariantInputTarget) {
        filterSubscriptionSelectedVariantInputTarget.setAttribute('value', triggerTarget.dataset.variant);
        console.log(`Set variant input [items[${triggerTarget.dataset.index}][id]] to:`, triggerTarget.dataset.variant);
      }
      if (filterSubscriptionSelectedVariantSellingPlanInputTarget) {
        filterSubscriptionSelectedVariantSellingPlanInputTarget.setAttribute('value', triggerTarget.dataset.sellingPlanId);
        console.log(`Set selling plan input [items[${triggerTarget.dataset.index}][selling_plan]] to:`, triggerTarget.dataset.sellingPlanId);
      }

      const frequency = parseInt(triggerTarget.textContent.toLowerCase().replace('months', '').trim());
      const filterSubscriptionFrequencyInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFrequencyInput}[name="items[${triggerTarget.dataset.index}][properties[_Frequency]]"]`);
      const filterSubscriptionFrequencyIntegerInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFrequencyIntegerInput}[name="items[${triggerTarget.dataset.index}][properties[_frequency_integer]]"]`);
      if (filterSubscriptionFrequencyInputTarget) {
        filterSubscriptionFrequencyInputTarget.setAttribute('value', frequency + ' months');
      }
      if (filterSubscriptionFrequencyIntegerInputTarget) {
        filterSubscriptionFrequencyIntegerInputTarget.setAttribute('value', frequency);
      }

      const filterSubscriptionFirstOrderDateInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFirstOrderDateInput}[name="items[${triggerTarget.dataset.index}][properties[First Order Date]]"]`);
      const filterSubscriptionOgDateInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionOgDateInput}[name="items[${triggerTarget.dataset.index}][properties[_og_first_order_place_date]]"]`);
      if (filterSubscriptionFirstOrderDateInputTarget && filterSubscriptionOgDateInputTarget) {
        const date = new Date();
        const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
        const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
        filterSubscriptionFirstOrderDateInputTarget.setAttribute('value', formattedOrderDate);
        filterSubscriptionOgDateInputTarget.setAttribute('value', formattedOrderDate);
      }
    } else {
      const prevSelectedTrigger = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
      if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
      triggerTarget.dataset.selected = 'true';

      const filterSubscriptionSelectedVariantInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionSelectedVariantInput);
      const filterSubscriptionSelectedVariantSellingPlanInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionSelectedVariantSellingPlanInput);
      const filterSubscriptionFrequencyInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionFrequencyInput);
      const filterSubscriptionFrequencyIntegerInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionFrequencyIntegerInput);
      const filterSubscriptionFirstOrderDateInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionFirstOrderDateInput);
      const filterSubscriptionOgDateInput = subscriptionContainer.querySelector(this._selectors.filterSubscriptionOgDateInput);

      if (filterSubscriptionSelectedVariantInput) {
        filterSubscriptionSelectedVariantInput.setAttribute('value', triggerTarget.dataset.variant);
        console.log('Set variant input [id] to:', triggerTarget.dataset.variant);
      }
      if (filterSubscriptionSelectedVariantSellingPlanInput) {
        filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('value', triggerTarget.dataset.sellingPlanId);
        console.log('Set selling plan input [selling_plan] to:', triggerTarget.dataset.sellingPlanId);
      }

      const frequency = parseInt(triggerTarget.textContent.toLowerCase().replace('months', '').trim());
      if (filterSubscriptionFrequencyInput) {
        filterSubscriptionFrequencyInput.setAttribute('value', frequency + ' months');
      }
      if (filterSubscriptionFrequencyIntegerInput) {
        filterSubscriptionFrequencyIntegerInput.setAttribute('value', frequency);
      }

      const date = new Date();
      if (subscriptionType == 'filter') {
        if (filterSubscriptionFirstOrderDateInput) {
          const formattedOrderDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          filterSubscriptionFirstOrderDateInput.setAttribute('value', formattedOrderDate);
        }
      } else if (filterSubscriptionOgDateInput) {
        const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
        const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
        if (filterSubscriptionFirstOrderDateInput) {
          filterSubscriptionFirstOrderDateInput.setAttribute('value', formattedOrderDate);
        }
        filterSubscriptionOgDateInput.setAttribute('value', formattedOrderDate);
      }
    }

    // Update temp ID for all items in this subscription container
    const tempIdInputs = subscriptionContainer.querySelectorAll('[js-filter-subscription-temp-id-input]');
    if (tempIdInputs.length > 0) {
      const tempId = Date.now();
      tempIdInputs.forEach((input) => {
        input.setAttribute('value', `subscription${tempId}`);
      });
    }

    // Update quantity duration only if it's in the main subscription
    if (subscriptionContainer === this.subscription) {
      const packQuantityDuration = this.querySelector('[js-filter-subscription-quantity-duration]');
      if (packQuantityDuration) {
        packQuantityDuration.textContent = ` ${triggerTarget.textContent}`;
      }
    }
  }

  _updateSubscriptionFormInputs = (subscriptionContainer, itemIndex, variantId, sellingPlanId, frequency, isScentSubscription = false) => {
    const baseSelector = isScentSubscription ? '[js-scent-subscription-form-input]' : '[js-filter-subscription-form-input]';

    // Update variant ID
    const variantInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][id]"]`);
    if (variantInput) {
      variantInput.removeAttribute('disabled');
      variantInput.setAttribute('value', variantId);
    }

    // Update selling plan ID
    const sellingPlanInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][selling_plan]"]`);
    if (sellingPlanInput && sellingPlanId) {
      sellingPlanInput.removeAttribute('disabled');
      sellingPlanInput.setAttribute('value', sellingPlanId);
    }

    // Update frequency
    const frequencyInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][properties[_Frequency]]"]`);
    const frequencyIntegerInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][properties[_frequency_integer]]"]`);
    if (frequencyInput) {
      frequencyInput.removeAttribute('disabled');
      frequencyInput.setAttribute('value', frequency + ' months');
    }
    if (frequencyIntegerInput) {
      frequencyIntegerInput.removeAttribute('disabled');
      frequencyIntegerInput.setAttribute('value', frequency);
    }

    // Update dates
    const firstOrderDateInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][properties[First Order Date]]"]`);
    const ogDateInput = subscriptionContainer.querySelector(`${baseSelector}[name="items[${itemIndex}][properties[_og_first_order_place_date]]"]`);
    if (firstOrderDateInput && ogDateInput) {
      const date = new Date();
      const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
      const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
      firstOrderDateInput.removeAttribute('disabled');
      firstOrderDateInput.setAttribute('value', formattedOrderDate);
      ogDateInput.removeAttribute('disabled');
      ogDateInput.setAttribute('value', formattedOrderDate);
    }
  }

  _filterSubscriptionMasterFrequencyOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    // Find the subscription container that contains this master frequency button
    const subscriptionContainer = triggerTarget.closest('[js-subscription]');
    if (!subscriptionContainer) return;

    // Deselect all other master frequency options within this subscription container
    const masterFrequencies = subscriptionContainer.querySelectorAll('[js-filter-subscription-master-frequency]');
    masterFrequencies.forEach((freqBtn) => {
      freqBtn.dataset.selected = 'false';
    });
    triggerTarget.dataset.selected = 'true';

    const selectedFrequency = triggerTarget.dataset.frequency;
    const frequency = parseInt(selectedFrequency.toLowerCase().replace('months', '').trim());
    const sellingPlansGroups = subscriptionContainer.querySelectorAll('[js-filter-subscription-selling-plans-group]');

    // Update all filter subscription inputs with the selected frequency
    sellingPlansGroups.forEach((group, index) => {
      const variantId = group.dataset.variant;

      // Find the selling plan that matches the selected frequency for this variant
      const sellingPlanButtons = group.querySelectorAll(this._selectors.filterSubscriptionSellingPlan);
      let targetSellingPlan = null;

      for (const button of sellingPlanButtons) {
        const buttonFrequency = parseInt(button.textContent.toLowerCase().replace('months', '').trim());
        if (buttonFrequency === frequency) {
          targetSellingPlan = button;
          break;
        }
      }

      if (targetSellingPlan) {
        this._updateSubscriptionFormInputs(subscriptionContainer, index + 1, variantId, targetSellingPlan.dataset.sellingPlanId, frequency);
      }
    });

    // Handle scent subscriptions (for 2in1_purify_humidify type)
    if (subscriptionContainer.dataset.type === '2in1_purify_humidify') {
      const filterSubscriptionCount = sellingPlansGroups.length;
      const selectedScentVariants = Array.from(subscriptionContainer.querySelectorAll(this._selectors.filterSubscriptionVariant))
        .filter(variant => variant.dataset.selected === 'true' && variant.hasAttribute('js-scent-subscription-variant'));

      selectedScentVariants.forEach((scentVariant, scentIndex) => {
        const scentVariantId = scentVariant.dataset.variant;
        const scentItemIndex = scentVariant.dataset.index || (filterSubscriptionCount + scentIndex + 1);
        const targetSellingPlanId = scentVariant.getAttribute(`data-selling-plan-${frequency}`);

        if (targetSellingPlanId) {
          this._updateSubscriptionFormInputs(subscriptionContainer, scentItemIndex, scentVariantId, targetSellingPlanId, frequency, true);
        }
      });
    }

    // Update temp ID for all subscription inputs
    const tempId = Date.now();
    const allTempIdInputs = subscriptionContainer.querySelectorAll('[js-filter-subscription-temp-id-input], [js-scent-subscription-form-input][name*="properties[_unitSubscriptionTempId]"]');
    allTempIdInputs.forEach((input) => {
        input.setAttribute('value', `subscription${tempId}`);
      });
  }

  _initProductForm() {
    this.form = this.querySelector(this._selectors.form);
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-drawer');
    this.cartDrawerTrigger = document.querySelector('[js-open-cart]')
  }

  _updateCartItems = (type, data, render = true) => {
    if (!data) {
      console.error('_updateCartItems: No data provided');
      return Promise.reject(new Error('No data provided'));
    }

    if (type === 'change') {
      if (!data.id) {
        console.error('_updateCartItems: Missing id for change operation', data);
        return Promise.reject(new Error('Missing id parameter for cart change operation'));
      }
      if (data.quantity === undefined && !data.selling_plan && (!data.properties || Object.keys(data.properties).length === 0)) {
        console.error('_updateCartItems: Missing required fields for change operation', data);
        return Promise.reject(new Error('Missing required fields for cart change operation'));
      }
    } else if (type === 'add') {
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.error('_updateCartItems: Missing or invalid items array for add operation', data);
        return Promise.reject(new Error('Missing or invalid items array for cart add operation'));
      }
      data.items.forEach((item, index) => {
        if (!item.id) {
          console.error(`_updateCartItems: Missing id for item ${index} in add operation`, item);
        }
        if (item.quantity === undefined) {
          console.error(`_updateCartItems: Missing quantity for item ${index} in add operation`, item);
        }
      });
    }

    console.log(`_updateCartItems [${type}]:`, JSON.stringify(data, null, 2));

    const res = fetch(window.Shopify.routes.root + `cart/${type}.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`_updateCartItems [${type}] HTTP error ${response.status}:`, errorText);
          return {
            status: response.status,
            description: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
          };
        }

        const responseData = await response.json();
        console.log(`_updateCartItems [${type}] response:`, responseData);

        sessionStorage.setItem('noCartWatcherHandle', 'true');

        if (responseData.status) {
          console.error(`_updateCartItems [${type}] failed:`, responseData);
          this.handleErrorMessage(responseData.description);
          sessionStorage.setItem('cartSubscriptionError', responseData.description);

          if (render) {
            window.location.href = window.Shopify.routes.root + 'cart';
          }
          return responseData;
        }

        if (type === 'change' && responseData.items) {
          const updatedItem = responseData.items.find(item => {
            return item.key === data.id || String(item.variant_id) === String(data.id);
          });

          if (!updatedItem && data.quantity !== 0) {
            console.warn(`_updateCartItems [${type}]: Item not found in response`, {
              requestedId: data.id,
              cartItems: responseData.items.map(item => ({ key: item.key, variant_id: item.variant_id }))
            });
          } else if (updatedItem && data.selling_plan) {
            const sellingPlanId = updatedItem.selling_plan_allocation?.selling_plan?.id;
            if (sellingPlanId != data.selling_plan) {
              console.warn(`_updateCartItems [${type}]: Selling plan mismatch`, {
                requested: data.selling_plan,
                actual: sellingPlanId,
                itemKey: updatedItem.key
              });
            } else {
              console.log(`_updateCartItems [${type}]: Selling plan updated successfully`);
            }
          }
        }

        if (render) {
          window.location.href = window.Shopify.routes.root + 'cart';
        }

        return responseData;
      })
      .catch((e) => {
        console.error(`_updateCartItems [${type}] error:`, e);
        this.handleErrorMessage(e.description || e.message || 'Failed to update cart');
        return { status: 'error', description: e.message || 'Unknown error' };
      })
      .finally(() => {
        this._enableButtons();
      });

    return res;
  }

  _editCartSubscription = (formData) => {
    const init = async () => {
      let index = 1;
      let removeScent = null;
      let variantId = this.pdpToEditCartSubscription.filter.itemKey.split(':')[0];

      if (this.pdpToEditCartSubscription.subscribedScent && this.pdpToEditCartSubscription.isTwoInOneSubscription == true) {
        const selectedScentVariant = document.querySelector('[js-scent-subscription-variant][data-selected="true"]');
        if (selectedScentVariant) {
          const scentFormInputs = document.querySelectorAll('[js-scent-subscription-form-input]');
          const firstScentFormInput = Array.from(scentFormInputs).find(input => input.hasAttribute('data-index'));
          if (firstScentFormInput && firstScentFormInput.dataset.index) {
            index = parseInt(firstScentFormInput.dataset.index);
          }
        } else {
          const selectedScentVariant = document.querySelector('[js-scent-subscription-variant][data-selected="false"]').dataset.variant;
          console.log(selectedScentVariant)
          removeScent = {
            id: selectedScentVariant,
            quantity: 0
          };
        }
      } else if (this.pdpToEditCartSubscription.isTwoInOneSubscription == true) {
        index = document.querySelector(`${this._selectors.filterSubscriptionSelectedVariantInput}[value="${variantId}"]`).dataset.index;
      }

      const newSelectedSubscription = {};
      for (const [key, value] of formData.entries()) {
        if (this.pdpToEditCartSubscription.airPurifier) {
          if (key == `items[${index}][id]`) {
            newSelectedSubscription['id'] = value;
          } else if (key == `items[${index}][selling_plan]`) {
            newSelectedSubscription['selling_plan'] = value;
          } else if (key == `items[${index}][quantity]`) {
            newSelectedSubscription['quantity'] = value;
          } else if (key == `items[${index}][properties[_Frequency]]`) {
            newSelectedSubscription['frequency'] = value;
          } else if (key == `items[${index}][properties[_frequency_integer]]`) {
            newSelectedSubscription['frequencyInteger'] = value;
          } else if (key == `items[${index}][properties[First Order Date]]`) {
            newSelectedSubscription['firstOrderDate'] = value;
          } else if (key == `items[${index}][properties[_og_first_order_place_date]]`) {
            newSelectedSubscription['ogDate'] = value;
          }
        } else {
          if (key == 'id' || key == 'selling_plan' || key == 'quantity') {
            newSelectedSubscription[key] = value;
          } else if (key == 'properties[_Frequency]') {
            newSelectedSubscription['frequency'] = value;
          } else if (key == 'properties[_frequency_integer]') {
            newSelectedSubscription['frequencyInteger'] = value;
          } else if (key == 'properties[First Order Date]') {
            newSelectedSubscription['firstOrderDate'] = value;
          }
        }
      }

      let newQuantity;
      if (newSelectedSubscription.quantity) {
        newQuantity = newSelectedSubscription.quantity;
      } else {
        newQuantity = this.pdpToEditCartSubscription.filter.itemQuantity;
      }

      let newProperties = this.pdpToEditCartSubscription.filter.properties;
      if (newSelectedSubscription.frequency) {
        newProperties['_Frequency'] = newSelectedSubscription.frequency;
      }
      if (newSelectedSubscription.frequencyInteger) {
        newProperties['_frequency_integer'] = newSelectedSubscription.frequencyInteger;
      }
      if (newSelectedSubscription.firstOrderDate) {
        newProperties['First Order Date'] = newSelectedSubscription.firstOrderDate;
      }
      if (newSelectedSubscription.ogDate) {
        newProperties['_og_first_order_place_date'] = newSelectedSubscription.ogDate;
      }

      let replaceItem = false;
      if (variantId != newSelectedSubscription.id) {
        replaceItem = true;
      }

      const itemsToAdd = [];
      const itemsToUpdate = [];
      const itemsToRemove = [];

      const existingItemKey = this.pdpToEditCartSubscription.filter.itemKey;

      if (replaceItem) {
        if (!existingItemKey) {
          console.error('Missing itemKey for remove operation');
          this.handleErrorMessage('Unable to update cart: missing item information');
          return;
        }
        itemsToRemove.push({
          id: existingItemKey.split(':')[0],
          quantity: 0
        });

        if (!newSelectedSubscription.id) {
          console.error('Missing variant ID for add operation');
          this.handleErrorMessage('Unable to add item: missing variant information');
          return;
        }
        const addItem = {
          id: newSelectedSubscription.id.split(':')[0],
          quantity: 1,
          properties: newProperties
        };

        if (newSelectedSubscription.selling_plan) {
          const sellingPlanValue = parseInt(newSelectedSubscription.selling_plan);
          if (!isNaN(sellingPlanValue)) {
            addItem.selling_plan = sellingPlanValue;
          }
        }

        itemsToAdd.push(addItem);
      } else {
        if (!existingItemKey) {
          console.error('Missing itemKey for update operation');
          this.handleErrorMessage('Unable to update cart: missing item information');
          return;
        }

        const updateItem = {
          id: existingItemKey,
          quantity: 1,
          properties: newProperties
        };

        if (newSelectedSubscription.selling_plan) {
          const sellingPlanValue = parseInt(newSelectedSubscription.selling_plan);
          if (!isNaN(sellingPlanValue)) {
            updateItem.selling_plan = sellingPlanValue;
          }
        }

        itemsToUpdate.push(updateItem);

        if (removeScent != null) {
          itemsToRemove.push(removeScent);
        }
      }

      console.log('itemsToAdd:', itemsToAdd);
      console.log('itemsToUpdate:', itemsToUpdate);
      console.log('itemsToRemove:', itemsToRemove);

      try {
        if (itemsToRemove.length > 0) {
          for (let i = 0; i < itemsToRemove.length; i++) {
            const removeItem = itemsToRemove[i];
            console.log(`Removing item ${i + 1}/${itemsToRemove.length}:`, removeItem);

            try {
              const removeResult = await this._updateCartItems('change', removeItem, false);

              // Wait for the promise to fully resolve
              if (removeResult && typeof removeResult.then === 'function') {
                await removeResult;
              }

              if (removeResult && removeResult.status) {
                console.error('Failed to remove item:', removeResult);
                this.handleErrorMessage(removeResult.description || 'Failed to remove item');
                return;
              }

              console.log(`Remove operation ${i + 1} completed successfully`);

              // Small delay to ensure cart state is fully updated
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error(`Error removing item ${i + 1}:`, error);
              this.handleErrorMessage('Failed to remove item');
              return;
            }
          }
        }

        // Then, update items sequentially - wait for each to finish
        if (itemsToUpdate.length > 0) {
          for (let i = 0; i < itemsToUpdate.length; i++) {
            const updateItem = itemsToUpdate[i];
            console.log(`Updating item ${i + 1}/${itemsToUpdate.length}:`, updateItem);

            try {
              const updateResult = await this._updateCartItems('change', updateItem, false);

              // Wait for the promise to fully resolve
              if (updateResult && typeof updateResult.then === 'function') {
                await updateResult;
              }

              if (updateResult && updateResult.status) {
                console.error('Failed to update item:', updateResult);
                this.handleErrorMessage(updateResult.description || 'Failed to update item');
                return;
              }

              console.log(`Update operation ${i + 1} completed successfully`);

              // Small delay to ensure cart state is fully updated
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error(`Error updating item ${i + 1}:`, error);
              this.handleErrorMessage('Failed to update item');
              return;
            }
          }
        }

        // Finally, add items - wait for it to finish
        if (itemsToAdd.length > 0) {
          console.log(`Adding ${itemsToAdd.length} item(s):`, itemsToAdd);

          try {
            const addResult = await this._updateCartItems('add', { items: itemsToAdd }, false);

            // Wait for the promise to fully resolve
            if (addResult && typeof addResult.then === 'function') {
              await addResult;
            }

            if (addResult && addResult.status) {
              console.error('Failed to add items:', addResult);
              this.handleErrorMessage(addResult.description || 'Failed to add items');
              return;
            }

            console.log('Add operation completed successfully');

            // Small delay to ensure cart state is fully updated
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error('Error adding items:', error);
            this.handleErrorMessage('Failed to add items');
            return;
          }
        }

        try {
          const cartResponse = await fetch(`${window.Shopify.routes.root}cart.js`);
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            console.log('Cart items before redirect:', cartData.items);
            console.log('Cart total items:', cartData.items.length);

            const subscriptionItemsToFix = cartData.items.filter(item =>
              item.selling_plan_allocation != null && item.quantity !== 1
            );

            if (subscriptionItemsToFix.length > 0) {
              console.log('Found subscription items with quantity != 1:', subscriptionItemsToFix);

              for (const item of subscriptionItemsToFix) {
                try {
                  const fixResult = await this._updateCartItems('change', {
                    id: item.key,
                    quantity: 1
                  }, false);

                  if (fixResult && typeof fixResult.then === 'function') {
                    await fixResult;
                  }

                  if (fixResult && fixResult.status) {
                    console.error(`Failed to fix quantity for item ${item.key}:`, fixResult);
                  } else {
                    console.log(`Fixed quantity for item ${item.key} to 1`);
                  }

                  await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                  console.error(`Error fixing quantity for item ${item.key}:`, error);
                }
              }
            }

            window.location.href = window.Shopify.routes.root + 'cart';
          }
        } catch (error) {
          console.error('Error fetching cart before redirect:', error);
        }
      } catch (error) {
        console.error('Error updating cart:', error);
        this.handleErrorMessage('Failed to update cart');
        return;
      }

      this.pdpToEditCartSubscription = false;
    }

    init();
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

    if (this.pdpToEditCartSubscription != false) {
      if (this.nonSubscriptionToggle.dataset.selected == 'true') {
        alert('Please select subscription options to edit.');
        this._enableButtons();
        return;
      }

      this._editCartSubscription(formData);
      return;
    }

    if (this.cart) {
      formData.append(
        'sections',
        this.cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append('sections_url', window.location.pathname);
      formData.append('properties[_compare_at_price]', this.currentPriceCompareAt);
      this.cart.setActiveElement(document.activeElement);
    }
    config.body = formData;
    fetch(`${window.routes.cart_add_url}`, config)
      .then(async (response) => {
        // Get response text first, then parse as JSON
        const responseText = await response.clone().text();

        // Try to parse as JSON, but handle errors
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          // Return an error object if we can't parse
          return {
            status: response.status,
            description: `Failed to parse response. Status: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 500)}`,
            rawResponse: responseText
          };
        }
      })
      .then((response) => {
        sessionStorage.setItem('noCartWatcherHandle', 'true');

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

        if (!this.error) {
          theme.utils.subscriptions.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
          this.error = false;
          this.cart.renderContents(response);
          this.cartDrawerTrigger.click();

          if (window.Shopify.shop === '5ef43d-4a.myshopify.com') {
            amzn('trackEvent', 'AddToCart');
          }
        }
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
      if (this.dataset.shopDomain == 'blueeudev') {
        this._updateImageCarouselEU(this.currentSwatch);
      } else {
        this._updateImageCarousel(this.currentSwatch);
      }

    }
    this._updateStickyBar(variant)
    if (variant) {
      if (priceChange) {
        this.currentPrice = variant.price;
        this.currentPriceCompareAt = variant.compare_at_price;
        this._updatePrice(this.currentPrice, this.currentPriceCompareAt, this.currentQuantity);
      }
    }
  };

  _updateStickyBar(variant) {
    // Only update sticky bar if it was initialized (mobile view)
    if (!this.stickyAtcBtns || !this.stickySelectOptionsBtns) {
      return;
    }

    if (variant) {
      this.stickyAtcBtns.forEach((stickyAtc) => {
        stickyAtc.classList.remove('hidden')
      });
      this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
        selectOptionsBtn.classList.add('hidden')
      });
    } else {
      this.stickyAtcBtns.forEach((stickyAtc) => {
        stickyAtc.classList.add('hidden')
      });
      this.stickySelectOptionsBtns.forEach((selectOptionsBtn) => {
        selectOptionsBtn.classList.remove('hidden')
      });
    }

  }

  _updateImageCarouselEU(swatchName) {
    console.log('updateImageCarouselEU', swatchName);
    let current_thumb_slides_count = 0
    for (const slide of this.thumbSlides) {
      if (slide.dataset.swatch == swatchName) {
        break;
      }
      current_thumb_slides_count++;
    }

    console.log('current_thumb_slides_count', current_thumb_slides_count);

    const carousels = this.querySelectorAll(this._selectors.carousel);
    carousels.forEach((carousel) => {
      carousel.swiper.slideTo(current_thumb_slides_count);

      if (carousel.hasAttribute('is-thumb-carousel')) {
        if (parseInt(carousel.dataset.slideCount) < 2) {
          carousel.querySelector('[js-pdp-thumb-next]').classList.add('hide-thumb-carousel');
        } else {
          carousel.querySelector('[js-pdp-thumb-next]').classList.remove('hide-thumb-carousel');
        }
      }
    });
  }

  _updateImageCarousel(swatchName) {
    let current_thumb_slides_count = 0
    this.thumbSlides.forEach((slide) => {
      slide.classList.remove('hidden', 'swiper-slide', 'swiper-slide-thumb', 'swiper-slide-thumb-active');
      if (slide.dataset.swatch && slide.dataset.swatch != swatchName && slide.dataset.swatch != 'All') {
        slide.classList.add('hidden');
      } else {
        slide.classList.add('swiper-slide', 'swiper-slide-thumb');
        current_thumb_slides_count++;
      }
    });

    this.mainSlides.forEach((slide) => {
      slide.classList.remove('hidden', 'swiper-slide', 'swiper-slide-active');
      if (slide.dataset.swatch && slide.dataset.swatch != swatchName && slide.dataset.swatch != 'All') {
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
            if (btn.querySelector(this._selectors.atcText).dataset.addCartText) {
              btn.querySelector(this._selectors.atcText).textContent = btn.querySelector(this._selectors.atcText).dataset.addCartText;
            } else {
              btn.querySelector(this._selectors.atcText).textContent = 'Add to Cart';
            }
          }
          btn.removeAttribute('disabled');
        });
      } else {
        this.buttons.forEach((btn) => {
          if (btn.querySelector(this._selectors.atcText)) {
            if (btn.querySelector(this._selectors.atcText).dataset.outOfStockText) {
              btn.querySelector(this._selectors.atcText).textContent = btn.querySelector(this._selectors.atcText).dataset.outOfStockText;
            } else {
              btn.querySelector(this._selectors.atcText).textContent = 'Out of Stock';
            }
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

  _updatePrice(currentPrice, currentCompareAtPrice, quantity) {
    this.prices.forEach((price) => {
      let priceMarkup;

      if (price.hasAttribute('js-full-price')) {
        if (currentCompareAtPrice && currentCompareAtPrice > currentPrice) {
          priceMarkup = `<s class="product__price product__price--compare">${theme.utils.formatMoney(currentCompareAtPrice * quantity, this.moneyFormat)}</s><span class="product__price product__price--current font-700">${theme.utils.formatMoney(currentPrice * quantity, this.moneyFormat)}</span>`;
        } else {
          priceMarkup = `<span class="product__price product__price--current font-700">${theme.utils.formatMoney(currentPrice * quantity, this.moneyFormat)}</span>`;
        }
      } else {
        priceMarkup = `${theme.utils.formatMoney(currentPrice * quantity, this.moneyFormat)}`;
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

  async _initOptionSwatches(option) {
    console.log('initOptionSwatches', option);
    try {
      const currentProductHandle = option.dataset.handle;
      const collectionTagRaw = option.dataset.collection || '';
      const optionKind = (option.dataset.option || '').toLowerCase();

      const looksEncoded = /%[0-9A-F]{2}/i.test(collectionTagRaw) || !collectionTagRaw.includes(':');
      const tagForUrl = looksEncoded ? collectionTagRaw : encodeURIComponent(collectionTagRaw);
      const targetURL = `/collections/all/${tagForUrl}?view=json`;

      const products = await this._getRelatedSwatchesJSON(targetURL);
      console.log('products', products, targetURL);
      if (!Array.isArray(products) || products.length === 0) {
        console.warn('[pdp swatches] No products for', collectionTagRaw);
        return;
      }

      if (optionKind === 'material') {
        const labelEl = option.closest('.product__related-color')?.querySelector('.product__related-color-label');
        if (labelEl) {
          const txt = (labelEl.textContent || '').trim();
          if (/^Type:\s*$/.test(txt)) {
            const current = products.find(p => p.handle === currentProductHandle) || products[0];
            if (current?.colorTitle) labelEl.textContent = `Type: ${current.colorTitle}`;
          }
        }
      }

      const isUpsellContext = option.closest('product-upsell') !== null;

      let html = '';
      products.forEach((p, index) => {
        const label = p.colorTitle || p.color || p.title;
        const swatchStyle = (p.swatchImage && p.swatchImage !== '')
          ? `background-image:url('${p.swatchImage}');background-size:cover;background-position:center;`
          : (p.colorHex ? `background-color:${p.colorHex};` : '');
        const isCurrent = p.handle === currentProductHandle;
        const href = !window.location.pathname.includes('/en-us/')
          ? (window.location.pathname.split('/products/')[0] + p.url)
          : p.url;

        if (isUpsellContext && p.variantId) {
          const variantPrice = p.variantPrice || (p.price ? p.price.split('|')[1] : '') || '';
          const variantImage = p.variantImage || p.swatchProductImage || '';
          const productUrl = (p.url && !p.url.startsWith('http')) ? (window.location.origin + p.url) : (p.url || '');
          const available = (p.variantAvailable !== undefined ? p.variantAvailable : p.available) !== false;
          const selected = index === 0 ? 'true' : 'false';

          if (optionKind === 'size') {
            const sizeLabel = p.size || label;
            html += `
              <div>
                <button type="button"
                  class="product-upsell__variant product-upsell__variant--filter-type product-related-size px-xs py-xxs rounded border border-gray text-12"
                  data-variant-id="${p.variantId}"
                  data-available="${available}"
                  data-price="${variantPrice}"
                  data-selected="${selected}"
                  title="${sizeLabel}"
                  data-variant-image="${variantImage}"
                  data-product-url="${productUrl}"
                  js-product-upsell-variant>
                  ${sizeLabel}
                </button>
              </div>`;
          } else {
            const baseClasses = optionKind === 'material'
              ? 'w-40 h-40 rounded-full flex relative'
              : 'w-[22px] h-[22px] rounded-full flex relative';
            html += `
              <div>
                <button type="button"
                  class="product-upsell__variant product-upsell__variant--filter-type product-related-color ${baseClasses}"
                  data-variant-id="${p.variantId}"
                  data-available="${available}"
                  data-price="${variantPrice}"
                  data-selected="${selected}"
                  title="${label}"
                  data-variant-image="${variantImage}"
                  data-product-url="${productUrl}"
                  js-product-upsell-variant>
                  <span class="product__related-color w-full h-full flex relative rounded-full" style="${swatchStyle}"></span>
                </button>
              </div>`;
          }
          return;
        }

        // Main product: original link/redirect behavior
        // Handle size options differently from color/material options
        if (optionKind === 'size') {
          const aria = `${p.title} – Size ${p.size || label}`;
          const sizeLabel = p.size || label;
          const optionTag = p.optionTag ? `<span class="product__related-size-option-tag">${p.optionTag}</span>` : '';

          if (isCurrent) {
            html += `
              <div class="product__related-size-current" aria-label="${aria}" data-swatch="${sizeLabel}" js-related-option-swatch>
                ${sizeLabel}
                ${optionTag}
              </div>`;
          } else {
            html += `
              <a href="${href}" class="product-related-size" aria-label="${aria}" data-swatch="${sizeLabel}" js-related-option-swatch js-option-swatch-link>
                ${sizeLabel}
                ${optionTag}
              </a>`;
          }
        } else {
          // Original color/material swatch logic
          const baseClasses = optionKind === 'material'
            ? 'w-40 h-40 rounded-full flex relative'
            : 'w-[22px] h-[22px] rounded-full flex relative';
          const aria = optionKind === 'material'
            ? `${p.title} – Type ${label}`
            : `${p.title} in ${label} color`;

          if (isCurrent) {
            html += `
              <div class="product__related-color-current ${baseClasses}" aria-label="${aria}" data-swatch="${label}" js-related-option-swatch>
                <span class="product__related-color w-full h-full flex relative rounded-full" style="${swatchStyle}"></span>
              </div>`;
          } else {
            html += `
              <a href="${href}" class="product-related-color ${baseClasses}" aria-label="${aria}" data-swatch="${label}" js-related-option-swatch js-option-swatch-link>
                <span class="product__related-color w-full h-full flex relative rounded-full" style="${swatchStyle}"></span>
              </a>`;
          }
        }
      });

      option.insertAdjacentHTML('beforeend', html);
      const swatches = option.querySelectorAll('[js-related-option-swatch]');
      Array.from(swatches)
        .sort((a, b) => a.dataset.swatch?.toLowerCase().localeCompare(b.dataset.swatch?.toLowerCase() || '') || 0)
        .forEach(el => el.parentNode.appendChild(el));

      if (isUpsellContext) {
        const upsell = option.closest('product-upsell');
        if (upsell?.querySelectorAll('[js-product-upsell-variant]').length > 0) {
          upsell.dispatchEvent(new CustomEvent('upsell-swatches-loaded'));
        }
      }

      this._optionSwatchLinksOnClick();
    } catch (err) {
      console.error('[pdp swatches] init failed', err);
    }
  }



  _getRelatedSwatchesJSON(url) {
    return fetch(url)
      .then(r => r.text())
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const script = doc.querySelector('script[js-collection-json]');
        if (!script) throw new Error('JSON container [js-collection-json] not found at ' + url);
        const raw = (script.textContent || script.innerHTML || '').trim();
        return JSON.parse(raw);
      });
  }



  _optionSwatchLinksOnClick = () => {
    const swatchLinks = this.querySelectorAll('[js-option-swatch-link]');
    swatchLinks.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();

        let url = evt.currentTarget.href;
        this._renderSwatchLink(url);
      })
    })
  }

  _renderSwatchLink = (url) => {
    fetch(!this.isQuickView ? url : `${url}${url.includes('?') ? '&' : '?'}view=quick-view`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        
        if (!this.isQuickView) {
          const oldSections = document.querySelectorAll('#MainContent .shopify-section');
          const newSections = html.querySelectorAll('#MainContent .shopify-section');

          oldSections.forEach((section, index) => {
            section.innerHTML = newSections[index].innerHTML;
          })

          window.history.pushState({}, "", url);
        } else {
          document.dispatchEvent(new CustomEvent('quick-view:render', {
            detail: html
          }))
          return;
        }

        window.removeEventListener('popstate', this._popStateRender);

        this.connectedCallback();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  _popStateRender = () => {
    this._renderSwatchLink(document.location)
  }

  _watchWindowResize = () => {
    window.addEventListener('resize', this._setVariables)
  }

  _setVariables = () => {
    this.stickyBars.forEach((stickyBar) => {
      document.documentElement.style.setProperty('--sticky-bar-height', `${stickyBar.clientHeight}px`)
    })
  }

}

export default ProductMain;
