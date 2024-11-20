class CountrySelect extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      form: '[js-country-form]',
      select: '[js-country-select]'
    }
  }

  connectedCallback() {
    this.form = this.querySelector(this._selectors.form);
    this.select = this.querySelector(this._selectors.select);

    this.select.addEventListener('change', this._submitForm);
  }

  _submitForm = () => {
    console.log('change')
    this.form.submit();
  }
}