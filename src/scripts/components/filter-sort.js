class FilterSort extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      container: 'filter-sort',
      form: '[js-filter-form]',
      filter: '[js-filter]',
      clearAll: '[js-clear-all]',
      loader: '[js-filter-sort-loader]'
    }

    this._events = {
      change: "filter:change"
    }

    this._refresh = [
      '[js-filter]',
      '[js-sort]',
      '[js-results-count]'
    ]

    this._cache = [];

    this._debouncedOnSubmit = theme.utils.debounce((event) => {
      this._onSubmitHandler(event);
    }, 500);
  }

  connectedCallback() {
    this._scope = this.dataset.scope;
    this._form = this.querySelector(this._selectors.form);
    this._clearAll = this.querySelector(this._selectors.clearAll);
    this._loader = document.querySelector(this._selectors.loader);
    this._setListeners();

    if (!this._scope) {
      throw new Error("filter-sort must have scope set. See file for docs.");
    }
  }

  _setListeners() {
    window.addEventListener('popstate', this._onHistoryChange);
    this._form.addEventListener('input', this._debouncedOnSubmit);
    this._clearAll.addEventListener('click', this._onClearAllHandler);
    document.addEventListener('filter:change', this._onFilterChange);
    document.addEventListener('filter:clearAll', this._onClearAllHandler);
  }

  _renderComponent(parsedHTML) {
    const scopedHTML = parsedHTML.querySelector(`${this._selectors.container}[data-scope="${this._scope}"]`) || parsedHTML.querySelector(this._selectors.container);
    theme.utils.refreshElements(this._refresh, scopedHTML, this);

    this.querySelectorAll('s-accordion').forEach(accordion => {
      accordion.connectedCallback();
    });
  }

  _onSubmitHandler = evt => {
    evt.preventDefault();
    const formData = new FormData(this._form);
    const searchParams = new URLSearchParams(formData).toString();
    this._propagateChange(searchParams);
  }

  _onClearAllHandler = evt => {
    evt.preventDefault();
    const searchParams = '';
    this._propagateChange(searchParams);
  }

  _onFilterChange = evt => {
    const { parsedHTML, scope } = evt.detail;
    // If the scope is the same, it means this instance triggered the change,
    // so no need to re-render. Only update other instances of filter-sort
    if (scope !== this._scope) {
      this._renderComponent(parsedHTML);
    }
  }

  _onHistoryChange = evt => {
    const searchParams = evt.state ? evt.state.searchParams : FilterSort.searchParamsInitial;
    if (searchParams === FilterSort.searchParamsPrev) return;
    this._propagateChange(searchParams, false)
    // change didn't come from submit, so reset field
    this._onSubmitHandlerEvent = null; 
  }

  async _propagateChange(searchParams, updateURLHash = true) {
    this._loader.setAttribute('loading', '');
    const url = `${window.location.pathname}?${searchParams}`
    const filterDataUrl = element => element.url === url;
    const parsedHTML = this._cache.some(filterDataUrl) ? this._markupFromCache(filterDataUrl) : (await this._markupFromFetch(url));
    document.dispatchEvent(new CustomEvent('filter:change', {
      detail: { parsedHTML, scope: this._scope }
    }))
    this._renderComponent(parsedHTML) // re-render myself
    if (updateURLHash){
      history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);      
    };
    this._loader.removeAttribute('loading', '');
  }

  _markupFromCache(url) {
    const html = this._cache.find(url).html;
    return new DOMParser().parseFromString(html, 'text/html')
  }

  _markupFromFetch(url) {
    let cache = this._cache
    return fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        cache = [...cache, { html, url }];
        return parsedHTML;
      });
  }

}
// Class variables
FilterSort.searchParamsInitial = window.location.search.slice(1);
FilterSort.searchParamsPrev = window.location.search.slice(1);