class SubscriptionQuiz extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      searchNav: '[js-quiz-search-nav]',
      familyNav: '[js-quiz-family-nav]',
      navBtn: '[js-quiz-nav-btn]',
      currentStepLabel: '[js-quiz-current-step]',
      tab: '[js-tab]',
      stepSection: '[js-quiz-step]',
      selectionGroup: '[js-quiz-selection-group]',
      selection: '[js-quiz-selection]',
      frequencySelection: '[js-quiz-subscription-frequency]',
      frequencyForm: '[js-quiz-subscription-frequncy-form]',
      frequencyFormSubmitBtn: '[js-quiz-subscription-frequncy-form-submit-btn]',
      error: '[js-quiz-subscription-submit-error]',
      searchForm: '[js-quiz-search-form]',
      searchClear: '[js-quiz-search-clear]',
      searchNoResults: '[js-quiz-search-no-results]',
      searchResults: '[js-quiz-search-results]',
      filterSelection: '[js-quiz-filter-selection]'
    }
  }

  connectedCallback() {
    this.tabs = this.querySelectorAll(this._selectors.tab);
    this.navBtns = this.querySelectorAll(this._selectors.navBtn);

    this.searchNav = this.querySelector(this._selectors.searchNav);
    this.searchNavPrevBtn = this.searchNav.querySelector(`${this._selectors.navBtn}[data-type="prev"]`);
    this.searchNavNextBtn = this.searchNav.querySelector(`${this._selectors.navBtn}[data-type="next"]`);
    this.searchCurrentStepLabel = this.searchNav.querySelector(this._selectors.currentStepLabel);

    this.familyNav = this.querySelector(this._selectors.familyNav);
    this.familyNavPrevBtn = this.familyNav.querySelector(`${this._selectors.navBtn}[data-type="prev"]`);
    this.familyNavNextBtn = this.familyNav.querySelector(`${this._selectors.navBtn}[data-type="next"]`);
    this.familyCurrentStepLabel = this.familyNav.querySelector(this._selectors.currentStepLabel);

    this.selections = this.querySelectorAll(this._selectors.selection);
    this.frequencySelections = this.querySelectorAll(this._selectors.frequencySelection);
    this.frequencyForm = this.querySelector(this._selectors.frequencyForm);
    this.frequencyFormSubmitBtn = this.frequencyForm.querySelector(this._selectors.frequencyFormSubmitBtn);
    this.error = this.querySelector(this._selectors.error);
    this.searchForm = this.querySelector(this._selectors.searchForm);
    this.searchInput = this.searchForm.querySelector('input[type="text"]');
    this.searchClear = this.searchForm.querySelector(this._selectors.searchClear);
    this.searchNoResults = this.querySelector(this._selectors.searchNoResults);
    this.searchResults = this.querySelector(this._selectors.searchResults);
    this.filterSelections = this.querySelectorAll(this._selectors.filterSelection);

    this.mode = 'family';
    this.currentStep = 1;
    this.currentStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${this.currentStep}"]`);

    this._setListeners();
  }

  _setListeners() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', this._changeMode);
    });
    this.navBtns.forEach((navBtn) => {
      navBtn.addEventListener('click', this._navBtnOnClick);
    });
    this.searchForm.addEventListener('submit', this._searchModelNumber);
    this.searchInput.addEventListener('input', this._toggleSearchClearBtn);
    this.searchClear.addEventListener('click', this._clearSearchInput);
    this.selections.forEach((selection) => {
      selection.addEventListener('click', this._selectionOnClick);
    });
    this.frequencySelections.forEach((selection) => {
      selection.addEventListener('click', this._frequencySelectionOnClick);
    });
    this.frequencyForm.addEventListener('submit', this._addToCart);
  }

  _changeMode = (evt) => {
    const newMode = evt.currentTarget.dataset.mode;

    if (this.mode == newMode) {
      return;
    }

    this.mode = newMode;

    const prevSelected = this.querySelectorAll(`${this._selectors.selection}[data-selected="true"]`);
    prevSelected.forEach((selection) => {
      selection.dataset.selected = 'false';
    });

    const prevActiveSelectionGroups = this.querySelectorAll(`${this._selectors.selectionGroup}[data-active="true"]`);
    prevActiveSelectionGroups.forEach((selectionGroup) => {
      selectionGroup.dataset.active = 'false';
    });

    const prevSelectedFrequency = this.querySelectorAll(`${this._selectors.frequencySelection}[data-selected="true"]`);
    prevSelectedFrequency.forEach((selection) => {
      selection.dataset.selected = 'false';
    });

    if (this.mode == 'search') {
      this.searchNav.classList.remove('hidden');
      this.familyNav.classList.add('hidden');
      this.searchResults.classList.remove('hidden');
    } else {
      this.searchNav.classList.add('hidden');
      this.familyNav.classList.remove('hidden');
      this.familyNavPrevBtn.setAttribute('disabled', '');
      this.familyNavNextBtn.setAttribute('disabled', '');
      this.searchResults.classList.add('hidden');
    }
  }

  _clearSearchInput = (evt) => {
    evt.preventDefault();
    this.searchInput.value = '';
    this.searchNoResults.classList.add('hidden');
    this.searchClear.classList.add('hidden');
  }

  _toggleSearchClearBtn = () => {
    const search = this.searchInput.value.trim();
    if (!search.length) {
      this.searchClear.classList.add('hidden');
    } else {
      this.searchClear.classList.remove('hidden');
    }

    this.searchNoResults.classList.add('hidden');
  }

  _searchModelNumber = (evt) => {
    evt.preventDefault();

    const formData = new FormData(this.searchForm);
    const modelSearchNumber = formData.get('modelNumber').toLowerCase().trim();

    let filterResults = [];
    let fitlerResultsMarkup = '';
    this.filterSelections.forEach((filterSelection) => {
      const modelNumbers = filterSelection.dataset.modelNumbers.toLowerCase().split(',');
      const filterId = filterSelection.dataset.groupTarget;

      if (modelNumbers.includes(modelSearchNumber) && !filterResults.includes(filterId)) {
        filterResults.push(filterId);
        fitlerResultsMarkup = fitlerResultsMarkup + filterSelection.outerHTML;
      }
    });

    if (filterResults.length > 0) {
      this.searchNoResults.classList.add('hidden');
      this.searchResults.innerHTML = '';
      this.searchResultSelections?.forEach((searchResultSelection) => {
        searchResultSelection.removeEventListener('click', this._selectionOnClick);
      });

      this.searchResults.innerHTML = fitlerResultsMarkup;
      this.searchResultSelections = this.searchResults.querySelectorAll(this._selectors.filterSelection);
      this.searchResultSelections.forEach((searchResultSelection) => {
        searchResultSelection.addEventListener('click', this._selectionOnClick);
      });

      this._changeSearchModeQuizStep('next');
    } else {
      this.searchNoResults.textContent = `No Results Found for "${modelSearchNumber}"`;
      this.searchNoResults.classList.remove('hidden');
    }
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

    const selectedFrequency = this.currentStepSection.querySelector(`${this._selectors.selectionGroup}[data-active="true"] ${this._selectors.frequencySelection}[data-selected="true"]`);
    if (!selectedFrequency) {
      this._handleErrorMessage('Select a frequency.');
      return;
    }

    this.frequencyFormSubmitBtn.setAttribute('disabled', '');

    const variantId = selectedFrequency.dataset.variant;
    const sellingPlanId = selectedFrequency.dataset.sellingPlanId;
    const quantity = parseInt(selectedFrequency.dataset.quantity);
    const frequency = selectedFrequency.dataset.frequency;
    const frequencyInteger = frequency.replace('months', '').trim();
    const date = new Date();
    const formattedOrderDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    let data = {
      items: [{ id: variantId, quantity: quantity, selling_plan: sellingPlanId, properties: { '_Frequency': frequency, '_frequency_integer': frequencyInteger, 'First Order Date': formattedOrderDate } }]
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

        this.frequencyForm.submit();
      })
      .catch((e) => {
        this._handleErrorMessage(e.description);
        console.log(e);
      })
      .finally(() => {
        this.frequencyFormSubmitBtn.removeAttribute('disabled');
      });
  }

  _frequencySelectionOnClick = (evt) => {
    evt.preventDefault();

    this._handleErrorMessage();

    const currentTarget = evt.currentTarget;
    if (currentTarget.dataset.selected == 'true') {
      return;
    }

    const prevSelected = this.querySelectorAll(`${this._selectors.frequencySelection}[data-selected="true"]`);
    prevSelected.forEach((selection) => {
      selection.dataset.selected = 'false';
    });

    currentTarget.dataset.selected = 'true';
  }

  _selectionOnClick = (evt) => {
    evt.preventDefault();

    const currentTarget = evt.currentTarget;
    if (currentTarget.dataset.selected == 'true') {
      if (this.mode == 'search') {
        this._changeSearchModeQuizStep('next');
      } else {
        this._changeFamilyModeQuizStep('next');
      }

      return;
    }

    for (let i = this.currentStep; i < 4; i++) {
      const prevSelected = this.querySelectorAll(`${this._selectors.stepSection}[data-step="${i}"] ${this._selectors.selection}[data-selected="true"]`);
      prevSelected.forEach((selection) => {
        selection.dataset.selected = 'false';
      });
    }

    currentTarget.dataset.selected = 'true';

    if (this.mode == 'search') {
      this._changeSearchModeQuizStep('next');
    } else {
      this._changeFamilyModeQuizStep('next');
    }

    const prevActiveSelectionGroups = this.currentStepSection.querySelectorAll(`${this._selectors.selectionGroup}[data-active="true"]`);
    prevActiveSelectionGroups.forEach((selectionGroup) => {
      selectionGroup.dataset.active = 'false';
    });

    const selectionGroupTarget = this.currentStepSection.querySelector(`${this._selectors.selectionGroup}[data-group-id="${currentTarget.dataset.groupTarget}"]`);
    if (selectionGroupTarget) {
      selectionGroupTarget.dataset.active = 'true';

      if (this.currentStep == 4) {
        if (selectionGroupTarget.dataset.variantAvailable == 'false') {
          this.frequencyFormSubmitBtn.setAttribute('disabled', '');
          this.frequencyFormSubmitBtn.querySelector('.btn__text').textContent = 'Out of Stock';
        } else {
          this.frequencyFormSubmitBtn.removeAttribute('disabled');
          this.frequencyFormSubmitBtn.querySelector('.btn__text').textContent = 'Go to Checkout';
        }

        this._handleErrorMessage();
      }
    }

    window.scrollTo({ top: 0 });
  }

  _navBtnOnClick = (evt) => {
    evt.preventDefault();

    const type = evt.currentTarget.dataset.type;

    if (this.mode == 'search') {
      this._changeSearchModeQuizStep(type);
    } else {
      this._changeFamilyModeQuizStep(type);
    }
  }

  _changeSearchModeQuizStep = (type) => {
    let stepTarget;
    if (type == 'next') {
      if (this.currentStep == 1) {
        stepTarget = this.currentStep + 2;
      } else {
        stepTarget = this.currentStep + 1;
      }
    } else {
      if (this.currentStep == 3) {
        stepTarget = this.currentStep - 2;
      } else {
        stepTarget = this.currentStep - 1;
      }
    }

    // hide old current section
    this.currentStepSection.dataset.active = 'false';

    // set new current section
    this.currentStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${stepTarget}"]`);
    this.currentStepSection.dataset.active = 'true';

    this.searchCurrentStepLabel.textContent = `${stepTarget != 1 ? stepTarget - 1 : stepTarget}`;
    this.currentStep = stepTarget;

    if (stepTarget == 4) {
      this.searchNavNextBtn.setAttribute('disabled', '');
    } else if (stepTarget == 1) {
      this.searchNavPrevBtn.setAttribute('disabled', '');
      this.searchNavNextBtn.setAttribute('disabled', '');
    } else {
      const currentStepSelectedSelection = this.searchResults.querySelector(`${this._selectors.filterSelection}[data-selected="true"]`);
      if (currentStepSelectedSelection) {
        this.searchNavNextBtn.removeAttribute('disabled');
      } else {
        this.searchNavNextBtn.setAttribute('disabled', '');
      }

      this.searchNavPrevBtn.removeAttribute('disabled');
    }
  }

  _changeFamilyModeQuizStep = (type) => {
    let stepTarget;
    if (type == 'next') {
      stepTarget = this.currentStep + 1;
    } else {
      stepTarget = this.currentStep - 1;
    }

    // hide old current section
    this.currentStepSection.dataset.active = 'false';

    // set new current section
    this.currentStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${stepTarget}"]`);
    this.currentStepSection.dataset.active = 'true';

    this.familyCurrentStepLabel.textContent = stepTarget;
    this.currentStep = stepTarget;

    if (stepTarget == 4) {
      this.familyNavNextBtn.setAttribute('disabled', '');
    } else {
      const currentStepSelectedSelection = this.currentStepSection.querySelector(`${this._selectors.selection}[data-selected="true"]`);
      if (currentStepSelectedSelection) {
        this.familyNavNextBtn.removeAttribute('disabled');
      } else {
        this.familyNavNextBtn.setAttribute('disabled', '');
      }

      if (stepTarget == 1) {
        this.familyNavPrevBtn.setAttribute('disabled', '');
      } else {
        this.familyNavPrevBtn.removeAttribute('disabled');
      }
    }
  }
}

export default SubscriptionQuiz;