class ActiveFilters extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      remove: '[js-remove]',
      clearAll: '[js-clear-all]'
    }

    this._refresh = [
      '[js-active-filter]'
    ]
  }

  connectedCallback() {
    document.addEventListener('filter:change', this._handleFilterChange);
    this._setListeners();
  }

  _setListeners() {
    const clearAll = this.querySelector(this._selectors.clearAll);
    if (clearAll) {
      clearAll.addEventListener('click', this._triggerClearAll);
    }
    
    this.querySelectorAll(this._selectors.remove).forEach(remove => remove.addEventListener('click', this._handleRemove))
  } 

  _handleRemove = (evt) => {
    evt.preventDefault();
    const { name, value } = evt.currentTarget.dataset;
    const input = document.querySelector(`filter-sort [name="${name}"][value="${value}"]`);
    if (input) input.click();
  }

  _handleFilterChange = (evt) => {
    const { parsedHTML } = evt.detail;
    const scopedHTML = parsedHTML.querySelector('active-filters')
    this.innerHTML = scopedHTML.innerHTML;
    this._setListeners();
  }

  _triggerClearAll = (evt) => {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    document.dispatchEvent(new CustomEvent('filter:clearAll'))
  }
}