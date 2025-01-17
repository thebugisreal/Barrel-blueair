class SubscriptionQuiz extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      navBtn: '[js-quiz-nav-btn]',
      currentStepLabel: '[js-quiz-current-step]',
      stepSection: '[js-quiz-step]',
      selectionGroup: '[js-quiz-selection-group]',
      selection: '[js-quiz-selection]',
      frequencySelection: '[js-quiz-subscription-frequency]',
      frequencyForm: '[js-quiz-subscription-frequncy-form]',
      frequencyFormSubmitBtn: '[js-quiz-subscription-frequncy-form-submit-btn]',
      error: '[js-quiz-subscription-submit-error]'
    }
  }

  connectedCallback() {
    this.navBtns = this.querySelectorAll(this._selectors.navBtn);
    this.navPrevBtn = this.querySelector(`${this._selectors.navBtn}[data-type="prev"]`);
    this.navNextBtn = this.querySelector(`${this._selectors.navBtn}[data-type="next"]`);
    this.currentStepLabel = this.querySelector(this._selectors.currentStepLabel);
    this.selections = this.querySelectorAll(this._selectors.selection);
    this.frequencySelections = this.querySelectorAll(this._selectors.frequencySelection);
    this.frequencyForm = this.querySelector(this._selectors.frequencyForm);
    this.frequencyFormSubmitBtn = this.frequencyForm.querySelector(this._selectors.frequencyFormSubmitBtn);
    this.error = this.querySelector(this._selectors.error);

    this.mode = this.dataset.mode;
    this.currentStep = 1;
    this.currentStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${this.currentStep}"]`);
    
    this._setListeners();
  }

  _setListeners() {
    this.navBtns.forEach((navBtn) => {
      navBtn.addEventListener('click', this._navBtnOnClick);
    });
    this.selections.forEach((selection) => {
      selection.addEventListener('click', this._selectionOnClick);
    });
    this.frequencySelections.forEach((selection) => {
      selection.addEventListener('click', this._frequencySelectionOnClick);
    });
    this.frequencyForm.addEventListener('submit', this._addToCart);
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
      return;
    }

    this.frequencyFormSubmitBtn.setAttribute('disabled', '');

    const variantId = selectedFrequency.dataset.variant;
    const sellingPlanId = selectedFrequency.dataset.sellingPlanId;
    const quantity = parseInt(selectedFrequency.dataset.quantity);
    
    console.log(variantId, sellingPlanId, quantity)
    let data = {
      items: [{ id: variantId, quantity: quantity, selling_plan: sellingPlanId }]
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
      return;
    }

    for (let i = this.currentStep; i < 4; i++) {
      const prevSelected = this.querySelectorAll(`${this._selectors.stepSection}[data-step="${i}"] ${this._selectors.selection}[data-selected="true"]`);
      prevSelected.forEach((selection) => {
        selection.dataset.selected = 'false';
      });
    }

    currentTarget.dataset.selected = 'true';

    this._changeQuizStep('next');

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
      }
    }

    window.scrollTo({ top: 0 });
  }

  _navBtnOnClick = (evt) => {
    evt.preventDefault();

    const type = evt.currentTarget.dataset.type;
    this._changeQuizStep(type);
  }

  _changeQuizStep = (type) => {
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

    this.currentStepLabel.textContent = stepTarget;
    this.currentStep = stepTarget;

    if (stepTarget == 4) {
      this.navNextBtn.setAttribute('disabled', '');
    } else {
      const currentStepSelectedSelection = this.currentStepSection.querySelector(`${this._selectors.selection}[data-selected="true"]`);
      if (currentStepSelectedSelection) {
        this.navNextBtn.removeAttribute('disabled');
      } else {
        this.navNextBtn.setAttribute('disabled', '');
      }

      if (stepTarget == 1) {
        this.navPrevBtn.setAttribute('disabled', '');
      } else {
        this.navPrevBtn.removeAttribute('disabled');
      }
    }
  }
}