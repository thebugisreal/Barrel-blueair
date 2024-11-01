/**
 * Main Collection Section Logic (filter and sorting)
 * ------------------------------------------------------------------------
 * @summary ajax-based js logic on top of filter-sort form. Filtering and 
 * sorting works natively without any js which means it's all handled server
 * side, js just makes it dynamic. 
 * 
 * How works: everytime an input is changed inside the filter-sort forms,
 * an event is fired ('filter:changed'), <main-collection> listens for that
 * event and then fetches the new section from the server. CollectionGrid then
 * refreshes it's own UI and fires back an event to <filter-sort> with the new
 * html so that <filter-sort> can take care re-rendering it's own UI elements.
 */

class CollectionGrid extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      productGrid: '[js-products-grid]',
      toggleGrid: '[js-toggle-grid]',
      filterSort: '[js-filter-sort]'
    }

    this._refresh = [
      '[js-products-grid]',
      '[js-pagination]',
    ]

    // cache fetches for performance
    this._cache = []
  }

  connectedCallback() {
    this._setListeners();
  }

  _setListeners() {
    document.addEventListener('filter:change', this._handleFilterChange);
  }

  _handleFilterChange = (evt) => {
    const { parsedHTML } = evt.detail;
    const scopedHTML = parsedHTML.querySelector(`[data-id="${this.dataset.id}"]`)
    theme.utils.refreshElements(this._refresh, scopedHTML, this);
  }
}