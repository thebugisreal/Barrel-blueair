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
      filterSubscriptionVariant: '[js-fitler-subscription-variant]',
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
      relatedOptionSwatch: '[js-related-option-swatch]'
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

    if (this.dataset.currentSwatch) {
      this.swatchOption = parseInt(this.dataset.swatchOption);
      this.currentSwatch = this.dataset.currentSwatch;
      this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    }

    this.currentQuantity = 1;
    this.currentPrice = parseInt(this.dataset.currentPrice);
    this.currentPriceCompareAt = parseInt(this.dataset.currentPriceCompareAt);
    
    this._checkCartSubscriptionEdit();
    this._handleStickyBar();
    this._handleSubscription();
    this._handleQuantityVariant();
    this.addEventListener("variant:change", this._handleVariantChange);
    this._initProductForm();
    this.optionSwatchesContainers = this.querySelectorAll(this._selectors.optionSwatchesContainers);
    if (this.optionSwatchesContainers.length > 0) {
      this.optionSwatchesContainers.forEach((option) => this._initOptionSwatches(option));
    }
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
          } else {
            stickyBar.classList.add('hidden');
          }
        });
      }
      
      // Reset the updating flag after DOM settles
      requestAnimationFrame(() => {
        this.isUpdating = false;
      });
    }, 150); 

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
    // Deselect main subscription
    this.subscription.dataset.selected = 'false';
    this._toggleFilterSubscriptionFormInputs(false);
    
    // Deselect additional subscription
    const additionalSubscription = this.querySelector('[js-additional-subscription]');
    if (additionalSubscription) {
      additionalSubscription.dataset.selected = 'false';
      const additionalFormInputs = additionalSubscription.querySelectorAll('[js-filter-subscription-form-input]');
      additionalFormInputs.forEach(input => input.setAttribute('disabled', ''));
    }
    
    // Deselect non-subscription
    this.nonSubscriptionToggle.dataset.selected = 'false';
  }

  _handleSubscription() {
    if (!this.subscription) {
      return;
    }

    this.subscriptionType = this.subscription.dataset.type;
    this.subscriptionToggle = this.subscription.querySelector(this._selectors.subscriptionToggle);
    this.nonSubscriptionToggle = this.querySelector(this._selectors.nonSubscriptionToggle);
    this.subscriptionPrice = this.subscription.querySelector(this._selectors.subscriptionPrice);
    this.filterSubscriptionVariants = this.subscription.querySelectorAll(this._selectors.filterSubscriptionVariant);
    this.filterSubscriptionSellingPlans = this.subscription.querySelectorAll(this._selectors.filterSubscriptionSellingPlan);
    this.filterSubscriptionMasterFrequencies = this.querySelectorAll(this._selectors.filterSubscriptionMasterFrequency);
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

    this.filterSubscriptionVariants.forEach((trigger) => {
      trigger.addEventListener('click', this._filterSubscriptionVariantOnClick);
    });
    
    this.filterSubscriptionSellingPlans.forEach((sellingPlan) => {
      sellingPlan.addEventListener('click' , this._filterSubscriptionSellingPlanOnClick);
    });
    
    this.filterSubscriptionMasterFrequencies.forEach((masterFrequency) => {
      masterFrequency.addEventListener('click', this._filterSubscriptionMasterFrequencyOnClick);
    });
    
    this.subscriptionToggle.addEventListener('click', (evt) => {
      evt.preventDefault();

      if (this.subscription.dataset.selected == 'true') {
        return;
      }

      this._deselectAllSubscriptions();
      this.subscription.dataset.selected = 'true';

      // Always initialize the subscription when opened
      if (this.selectedFilterSubscriptionVariant) {
        if (this.selectedFilterSubscriptionVariant.dataset.available == 'true') {
          this._toggleFilterSubscriptionFormInputs(true);
        }
        this._updateAtcStateOnFilterChange(this.selectedFilterSubscriptionVariant);
      } else if (this.subscriptionType == '2in1_purify_humidify' && this.purifyHumidifySubscriptionAvailable) {
        this._toggleFilterSubscriptionFormInputs(true);
        this._updateAtcStateOnFilterChange(false);
        // Select the first master frequency option
        const firstMasterFrequency = this.filterSubscriptionMasterFrequencies[0];
        if (firstMasterFrequency) {
          firstMasterFrequency.click();
        }
      } else {
        const filterSubscriptionVariantToBeSelectedOnLoad = this.subscription.querySelector(`${this._selectors.filterSubscriptionVariant}[current-on-load]`);
        if (filterSubscriptionVariantToBeSelectedOnLoad) {
          filterSubscriptionVariantToBeSelectedOnLoad.click();
        }
      }

      this._updateAtcSubscriptionPrice();
    });

    // Handle additional subscription toggle
    const additionalSubscriptionToggle = this.querySelector('[js-additional-subscription-toggle]');
    if (additionalSubscriptionToggle) {
      additionalSubscriptionToggle.addEventListener('click', (evt) => {
        evt.preventDefault();
        
        const additionalSubscription = evt.currentTarget.closest('[js-additional-subscription]');
        if (additionalSubscription.dataset.selected == 'true') {
          return;
        }

        this._deselectAllSubscriptions();
        additionalSubscription.dataset.selected = 'true';

        // Enable form inputs for additional subscription
        const additionalFormInputs = additionalSubscription.querySelectorAll('[js-filter-subscription-form-input]');
        additionalFormInputs.forEach(input => input.removeAttribute('disabled'));

        // Always initialize the additional subscription when opened
        if (additionalSubscription.dataset.type == '2in1_purify_humidify') {
          // For 2in1_purify_humidify, select first master frequency
          const firstMasterFrequency = additionalSubscription.querySelector('[js-filter-subscription-master-frequency]');
          if (firstMasterFrequency) {
            firstMasterFrequency.click();
          }
        } else {
          // For other types, try to select the first available variant
          const firstVariant = additionalSubscription.querySelector('[js-fitler-subscription-variant][current-on-load]');
          if (firstVariant) {
            firstVariant.click();
          }
        }
      });
    }

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
    if (this.stickyPrices.length > 0) {
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
    if (this.stickyPrices.length > 0) {
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

    if (triggerTarget.hasAttribute('is-variant-link')) {
      if (this.pdpToEditCartSubscription != false) {
        sessionStorage.setItem('pdpToEditCartSubscription', JSON.stringify(this.pdpToEditCartSubscription));
      }
      window.location.href = triggerTarget.getAttribute('is-variant-link');
      return;
    }

    const relatedSubscriptions = this.subscription.querySelectorAll(`${this._selectors.filterSubscriptionSellingPlan}[data-variant="${triggerTarget.dataset.variant}"]`);
    if (relatedSubscriptions[1]) {
      relatedSubscriptions[1].click();
    } else if (relatedSubscriptions[0]) {
      relatedSubscriptions[0].click();
    }
    
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

    if (this.subscriptionPrice) this._updateSubscriptionPrice(triggerTarget, false);

    this._updateAtcStateOnFilterChange(triggerTarget);

    this.selectedFilterSubscriptionVariant = triggerTarget;
  }

  _filterSubscriptionSellingPlanOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    if (this.subscriptionType == '2in1_purify_humidify') {
      const prevSelectedTrigger = triggerTarget.closest(this._selectors.filterSubscriptionSellingPlansGroup).querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
      if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
      triggerTarget.dataset.selected = 'true';

      const filterSubscriptionSelectedVariantInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionSelectedVariantInput}[name="items[${triggerTarget.dataset.index}][id]"]`);
      const filterSubscriptionSelectedVariantSellingPlanInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionSelectedVariantSellingPlanInput}[name="items[${triggerTarget.dataset.index}][selling_plan]"]`);
      filterSubscriptionSelectedVariantInputTarget.setAttribute('value', triggerTarget.dataset.variant);
      filterSubscriptionSelectedVariantSellingPlanInputTarget.setAttribute('value', triggerTarget.dataset.sellingPlanId);
      
      const frequency = parseInt(triggerTarget.textContent.toLowerCase().replace('months', '').trim());
      const filterSubscriptionFrequencyInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionFrequencyInput}[name="items[${triggerTarget.dataset.index}][properties[_Frequency]]"]`);
      filterSubscriptionFrequencyInputTarget.setAttribute('value', frequency + ' months');
      const filterSubscriptionFrequencyIntegerInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionFrequencyIntegerInput}[name="items[${triggerTarget.dataset.index}][properties[_frequency_integer]]"]`);
      filterSubscriptionFrequencyIntegerInputTarget.setAttribute('value', frequency);

      const filterSubscriptionFirstOrderDateInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionFirstOrderDateInput}[name="items[${triggerTarget.dataset.index}][properties[First Order Date]]"]`);
      const filterSubscriptionOgDateInputTarget = this.subscription.querySelector(`${this._selectors.filterSubscriptionOgDateInput}[name="items[${triggerTarget.dataset.index}][properties[_og_first_order_place_date]]"]`);
      const date = new Date();
      const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
      const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
      filterSubscriptionFirstOrderDateInputTarget.setAttribute('value', formattedOrderDate);
      filterSubscriptionOgDateInputTarget.setAttribute('value', formattedOrderDate);
    } else {
      const prevSelectedTrigger = this.subscription.querySelector(`${this._selectors.filterSubscriptionSellingPlan}[data-selected="true"]`);
      if (prevSelectedTrigger) prevSelectedTrigger.dataset.selected = 'false';
      triggerTarget.dataset.selected = 'true';

      this.filterSubscriptionSelectedVariantInput.setAttribute('value', triggerTarget.dataset.variant);
      this.filterSubscriptionSelectedVariantSellingPlanInput.setAttribute('value', triggerTarget.dataset.sellingPlanId);
      
      const frequency = parseInt(triggerTarget.textContent.toLowerCase().replace('months', '').trim());
      this.filterSubscriptionFrequencyInput.setAttribute('value', frequency + ' months');
      this.filterSubscriptionFrequencyIntegerInput.setAttribute('value', frequency);

      const date = new Date();
      if (this.subscriptionType == 'filter') {
        const formattedOrderDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        this.filterSubscriptionFirstOrderDateInput.setAttribute('value', formattedOrderDate);
      } else if (this.filterSubscriptionOgDateInput) {
        const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
        const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
        this.filterSubscriptionFirstOrderDateInput.setAttribute('value', formattedOrderDate);
        this.filterSubscriptionOgDateInput.setAttribute('value', formattedOrderDate);
      }
    }

    if (this.filterSubscriptionTempIdInputs.length > 0) {
      const tempId = Date.now();
      this.filterSubscriptionTempIdInputs.forEach((input) => {
        input.setAttribute('value', `subscription${tempId}`);
      });
    }
  }

  _filterSubscriptionMasterFrequencyOnClick = (evt) => {
    evt.preventDefault();

    const triggerTarget = evt.currentTarget;
    if (triggerTarget.dataset.selected == 'true') {
      return;
    }

    // Deselect all other master frequency options
    this.filterSubscriptionMasterFrequencies.forEach((frequency) => {
      frequency.dataset.selected = 'false';
    });
    triggerTarget.dataset.selected = 'true';

    const selectedFrequency = triggerTarget.dataset.frequency;
    const frequency = parseInt(selectedFrequency.toLowerCase().replace('months', '').trim());

    // Find the subscription container that contains this master frequency button
    const subscriptionContainer = triggerTarget.closest('[js-subscription]');
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
          // Update the form inputs for this filter product
          const filterSubscriptionSelectedVariantInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSelectedVariantInput}[name="items[${index + 1}][id]"]`);
          const filterSubscriptionSelectedVariantSellingPlanInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionSelectedVariantSellingPlanInput}[name="items[${index + 1}][selling_plan]"]`);
          
          if (filterSubscriptionSelectedVariantInputTarget) {
            filterSubscriptionSelectedVariantInputTarget.setAttribute('value', variantId);
          }
          if (filterSubscriptionSelectedVariantSellingPlanInputTarget) {
            filterSubscriptionSelectedVariantSellingPlanInputTarget.setAttribute('value', targetSellingPlan.dataset.sellingPlanId);
          }

          const filterSubscriptionFrequencyInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFrequencyInput}[name="items[${index + 1}][properties[_Frequency]]"]`);
          const filterSubscriptionFrequencyIntegerInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFrequencyIntegerInput}[name="items[${index + 1}][properties[_frequency_integer]]"]`);
          
          if (filterSubscriptionFrequencyInputTarget) {
            filterSubscriptionFrequencyInputTarget.setAttribute('value', frequency + ' months');
          }
          if (filterSubscriptionFrequencyIntegerInputTarget) {
            filterSubscriptionFrequencyIntegerInputTarget.setAttribute('value', frequency);
          }

          const filterSubscriptionFirstOrderDateInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionFirstOrderDateInput}[name="items[${index + 1}][properties[First Order Date]]"]`);
          const filterSubscriptionOgDateInputTarget = subscriptionContainer.querySelector(`${this._selectors.filterSubscriptionOgDateInput}[name="items[${index + 1}][properties[_og_first_order_place_date]]"]`);
          
          if (filterSubscriptionFirstOrderDateInputTarget && filterSubscriptionOgDateInputTarget) {
            const date = new Date();
            const firstOrderDate = new Date(date.setMonth(date.getMonth() + frequency));
            const formattedOrderDate = `${firstOrderDate.getMonth() + 1}/${firstOrderDate.getDate()}/${firstOrderDate.getFullYear()}`;
            filterSubscriptionFirstOrderDateInputTarget.setAttribute('value', formattedOrderDate);
            filterSubscriptionOgDateInputTarget.setAttribute('value', formattedOrderDate);
          }
        }
    });

    // Update temp ID for all items in this subscription
    const tempIdInputs = subscriptionContainer.querySelectorAll('[js-filter-subscription-temp-id-input]');
    if (tempIdInputs.length > 0) {
      const tempId = Date.now();
      tempIdInputs.forEach((input) => {
        input.setAttribute('value', `subscription${tempId}`);
      });
    }
  }

  _initProductForm() {
    this.form = this.querySelector(this._selectors.form);
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cart = document.querySelector('cart-drawer');
    this.cartDrawer = document.querySelector('#CartDrawer')
  }

  _updateCartItems = (type, data, render = true) => {
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
          this.handleErrorMessage(response.description);
          sessionStorage.setItem('cartSubscriptionError', response.description);
          window.location.href = window.Shopify.routes.root + 'cart';
          return response;
        }

        if (render) {
          window.location.href = window.Shopify.routes.root + 'cart';
        }
        
        return response;
      })
      .catch((e) => {
        this.handleErrorMessage(e.description)
        console.log(e);
      })
      .finally(() => {
        this._enableButtons();
      });

    return res;
  }

  _editCartSubscription = (formData) => {
    const init = async () => {
      let index = 1;
      if (this.pdpToEditCartSubscription.isTwoInOneSubscription == true) {
        const variantId = this.pdpToEditCartSubscription.filter.itemKey.split(':')[0];
        index = this.querySelector(`${this._selectors.filterSubscriptionSelectedVariantInput}[value="${variantId}"]`).dataset.index;
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
      if (this.pdpToEditCartSubscription.filter.itemKey.split(':')[0] !== newSelectedSubscription.id) {
        replaceItem = true;
      }

      if (replaceItem) {
        const removeData = {
          id: this.pdpToEditCartSubscription.filter.itemKey,
          quantity: 0
        };
        const res = await  this._updateCartItems('change', removeData, false);

        if (res.status) {
          return;
        }

        const addData = {
          items: [
            { 
              id: newSelectedSubscription.id, 
              quantity: parseInt(newQuantity), 
              selling_plan: parseInt(newSelectedSubscription.selling_plan),
              properties: newProperties
            }
          ]
        }
        this._updateCartItems('add', addData, true);

      } else {
        let render = true;
        if (this.pdpToEditCartSubscription.isTwoInOneSubscription == true) {
          render = false;
        }

        const changeData = {
          id: this.pdpToEditCartSubscription.filter.itemKey,
          quantity: parseInt(newQuantity),
          selling_plan: parseInt(newSelectedSubscription.selling_plan),
          properties: newProperties
        };
        const res = await this._updateCartItems('change', changeData, render);

        if (res.status) {
          return;
        }

        if (this.pdpToEditCartSubscription.isTwoInOneSubscription == true) {
          let otherItemIndex;
          if (index == 1 || index == '1') {
            otherItemIndex = 2;
          } else {
            otherItemIndex = 1;
          }
          const newOtherItemSelectedSubscription = {};
          for (const [key, value] of formData.entries()) {
            if (key == `items[${otherItemIndex}][id]`) {
              newOtherItemSelectedSubscription['id'] = value;
            } else if (key == `items[${otherItemIndex}][selling_plan]`) {
              newOtherItemSelectedSubscription['selling_plan'] = value;
            } else if (key == `items[${otherItemIndex}][properties[_Frequency]]`) {
              newOtherItemSelectedSubscription['frequency'] = value;
            } else if (key == `items[${otherItemIndex}][properties[_frequency_integer]]`) {
              newOtherItemSelectedSubscription['frequencyInteger'] = value;
            } else if (key == `items[${otherItemIndex}][properties[First Order Date]]`) {
              newOtherItemSelectedSubscription['firstOrderDate'] = value;
            } else if (key == `items[${otherItemIndex}][properties[_og_first_order_place_date]]`) {
              newOtherItemSelectedSubscription['ogDate'] = value;
            }
          }

          const cartSubscriptionElement = this.cart.querySelector(`cart-subscription[data-index="${this.pdpToEditCartSubscription.index}"]`);
          let otherItemCartSubscriptionElement;
          if (cartSubscriptionElement.previousElementSibling.tagName == 'CART-SUBSCRIPTION') {
            otherItemCartSubscriptionElement = cartSubscriptionElement.previousElementSibling;
          } else if (cartSubscriptionElement.nextElementSibling.tagName == 'CART-SUBSCRIPTION') {
            otherItemCartSubscriptionElement = cartSubscriptionElement.nextElementSibling;
          }

          if (otherItemCartSubscriptionElement.querySelector('[js-cart-subscription-checkbox]').dataset.checked == 'true') {
            const otherItemSubscriptionData = JSON.parse(otherItemCartSubscriptionElement.querySelector('[js-subscription-data-json]').innerHTML);
            let newOtherItemProperties = otherItemSubscriptionData.filter.properties;
            if (newOtherItemSelectedSubscription.frequency) {
              newOtherItemProperties['_Frequency'] = newOtherItemSelectedSubscription.frequency;
            }
            if (newOtherItemSelectedSubscription.frequencyInteger) {
              newOtherItemProperties['_frequency_integer'] = newOtherItemSelectedSubscription.frequencyInteger;
            }
            if (newOtherItemSelectedSubscription.firstOrderDate) {
              newOtherItemProperties['First Order Date'] = newOtherItemSelectedSubscription.firstOrderDate;
            }
            if (newOtherItemSelectedSubscription.ogDate) {
              newOtherItemProperties['_og_first_order_place_date'] = newOtherItemSelectedSubscription.ogDate;
            }

            const changeData = {
              id: otherItemSubscriptionData.filter.itemKey,
              quantity: parseInt(otherItemSubscriptionData.filter.itemQuantity),
              selling_plan: parseInt(newOtherItemSelectedSubscription.selling_plan),
              properties: newOtherItemProperties
            };
            this._updateCartItems('change', changeData, true);
          } else {
            const addData = {
              items: [
                { 
                  id: newOtherItemSelectedSubscription.id, 
                  selling_plan: newOtherItemSelectedSubscription.selling_plan,
                  quantity: 1,
                  properties: { 
                    '_unitSubscriptionTempId': this.pdpToEditCartSubscription.filter.properties._unitSubscriptionTempId,
                    '_Frequency': newOtherItemSelectedSubscription.frequency,
                    '_frequency_integer': newOtherItemSelectedSubscription.frequencyInteger,
                    'First Order Date': newOtherItemSelectedSubscription.firstOrderDate,
                    '_og_first_order_place_date': newOtherItemSelectedSubscription.ogDate
                  }
                }
              ]
            }
            this._updateCartItems('add', addData, true);
          }
        }
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
      .then((response) => response.json())
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
          this.cartDrawer.open();
          
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
      this._updateImageCarousel(this.currentSwatch);
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
    try {
      const currentProductHandle = option.dataset.handle;                      
      const collectionTagRaw = option.dataset.collection || '';                
      const optionKind = (option.dataset.option || '').toLowerCase();          
  
      const looksEncoded = /%[0-9A-F]{2}/i.test(collectionTagRaw) || !collectionTagRaw.includes(':');
      const tagForUrl = looksEncoded ? collectionTagRaw : encodeURIComponent(collectionTagRaw);
      const targetURL = `/collections/all/${tagForUrl}?view=json`;
  
      const products = await this._getRelatedSwatchesJSON(targetURL);
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
  
      let html = '';
      products.forEach((p) => {
        const label = p.colorTitle || p.color || p.title; // you have "colorTitle" in the JSON
        const swatchStyle = (p.swatchImage && p.swatchImage !== '')
          ? `background-image:url('${p.swatchImage}');background-size:cover;background-position:center;`
          : (p.colorHex ? `background-color:${p.colorHex};` : '');
  
        const isCurrent = p.handle === currentProductHandle;
  
        const href = !window.location.pathname.includes('/en-us/')
          ? (window.location.pathname.split('/products/')[0] + p.url)
          : p.url;
  
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
      });
  
      option.insertAdjacentHTML('beforeend', html);
      const swatches = option.querySelectorAll('[js-related-option-swatch]');
      Array.from(swatches)
        .sort((a, b) => a.dataset.swatch.toLowerCase().localeCompare(b.dataset.swatch.toLowerCase()))
        .forEach(el => el.parentNode.appendChild(el));
  
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
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        const oldSections = document.querySelectorAll('.shopify-section');
        const newSections = html.querySelectorAll('.shopify-section');
        oldSections.forEach((section, index) => {
          section.innerHTML = newSections[index].innerHTML;
        })

        window.history.pushState({}, "", url);

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

}
