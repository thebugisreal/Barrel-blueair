class SubscriptionQuiz extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      navBtn: '[js-quiz-nav-btn]',
      currentStep: '[js-quiz-current-step]',
      stepSection: '[js-quiz-step]'
    }
  }

  connectedCallback() {
    this.navBtns = this.querySelectorAll(this._selectors.navBtn);
    this.navPrevBtn = this.querySelector(`${this._selectors.navBtn}[data-type="prev"]`);
    this.navNextBtn = this.querySelector(`${this._selectors.navBtn}[data-type="next"]`);
    this.currentStep = this.querySelector(this._selectors.currentStep);
    
    this._setListeners();
  }

  _setListeners() {
    this.navBtns.forEach((navBtn) => {
      navBtn.addEventListener('click', this._navBtnOnClick);
    })
  }

  _navBtnOnClick = (evt) => {
    const target = evt.currentTarget;
    const type = target.dataset.type;
    const currentStep = parseInt(this.currentStep.textContent);

    this._changeQuizStep(currentStep, type);
  }

  _changeQuizStep = (currentStep, type) => {
    let selectedStep;
    if (type == 'next') {
      selectedStep = currentStep + 1;
    } else {
      selectedStep = currentStep - 1;
    }

    this.currentStep.textContent = selectedStep;

    if (selectedStep == 1) {
      this.navPrevBtn.setAttribute('disabled', '');
    } else if (selectedStep == 4) {
      this.navNextBtn.setAttribute('disabled', '');
    } else {
      this.navPrevBtn.removeAttribute('disabled');
      this.navNextBtn.removeAttribute('disabled');
    }

    const currentStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${currentStep}"]`);
    const selectedStepSection = this.querySelector(`${this._selectors.stepSection}[data-step="${selectedStep}"]`);

    currentStepSection.dataset.active = 'false';
    selectedStepSection.dataset.active = 'true';
  }
}