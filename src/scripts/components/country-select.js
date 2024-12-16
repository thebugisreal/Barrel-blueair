class CountrySelect extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      form: '[js-country-form]',
      select: '[js-country-select]',
      languageSelect: '[js-language-select]',
      languageInput: '[js-language-input]',
      languageInputLabel: '[js-language-input-label]',
      countryLabel: '[js-country-input-label]'
    }
  }

  connectedCallback() {
    this.form = this.querySelector(this._selectors.form);
    this.select = this.querySelector(this._selectors.select);
    this.languageSelect = this.querySelector(this._selectors.languageSelect)
    this.languageInput = this.querySelector(this._selectors.languageInput)
    this.languageInputLabel = this.querySelector(this._selectors.languageInputLabel)
    this.countryLabel = this.querySelector(this._selectors.countryLabel)

    this.select.addEventListener('change', this._submitForm);
    if (this.languageSelect) {
      this.languageSelect.addEventListener('change', this._handleLanguageChange.bind(this));
    }
  }

  _submitForm = () => {
    this.form.submit();
  }

  _handleLanguageChange(e) {
    this.languageInput.value = e.target.value
    if (this.languageInputLabel) {
      this.languageInputLabel.innerHTML =  e.target.options[e.target.selectedIndex].dataset.endonymName
    }
  }
}