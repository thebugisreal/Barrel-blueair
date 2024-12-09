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
      productCount: '[js-products-count]',
      desktopFilterTrigger: '[js-desktop-filter-trigger]',
      desktopFilterTriggerLabel: '[js-desktop-filter-trigger-label]',
      desktopFilters: '[js-desktop-filters]',
      sortTrigger: '[js-sort-trigger]',
      filterForm: '[js-filter-form]',
      sort: '[js-sort]',
      sortTriggerAccordionHeader: '[js-sort-trigger-accoridon-header]',
      pagination: '[js-pagination]',
      showMoreBtn: '[js-show-more-btn]',
      loader: '[js-show-more-loader]',
      breadcrumb: '[js-breadcrumb]',
      collectionLink: '[js-collection-link]'
    }

    this._refresh = [
      '[js-products-count]',
      '[js-active-fitlers-count]',
      '[js-products-grid]',
      '[js-current-sort-label]',
      '[js-sort-triggers]',
      '[js-pagination]'
    ]

    // cache fetches for performance
    this._cache = []
  }

  connectedCallback() {
    this.productGrid = this.querySelector(this._selectors.productGrid);
    this.productCount = this.querySelector(this._selectors.productCount);
    this.desktopFilterTrigger = this.querySelector(this._selectors.desktopFilterTrigger);
    this.desktopFilterTriggerLabel = this.querySelector(this._selectors.desktopFilterTriggerLabel);
    this.desktopFilters = this.querySelector(this._selectors.desktopFilters);
    this.mainFilterForm = document.querySelector(this._selectors.filterForm);
    this.mainSort = this.mainFilterForm.querySelector(this._selectors.sort);
    this.sortTriggerAccordionHeader = this.querySelector(this._selectors.sortTriggerAccordionHeader);
    this.pagination = this.querySelector(this._selectors.pagination);
    this.loader = this.querySelector(this._selectors.loader);
    this.breadcrumb = this.querySelector(this._selectors.breadcrumb);
    this.collectionLinks = this.querySelectorAll(this._selectors.collectionLink);

    this._setListeners();
    this._updateBreadcrumb();
    this._handleShowMoreBtn();
    this._handleSortTrigger();
  }

  _setListeners() {
    this.desktopFilterTrigger?.addEventListener('click', this._toggleDesktopFilters);
    document.addEventListener('filter:change', this._handleFilterChange);
    document.addEventListener('click', this._closeSortTriggerAcoordion);
    this.collectionLinks.forEach((link) => {
      link.addEventListener('click', this._saveBreadcrumb);
    });
  }

  _saveBreadcrumb = (evt) => {
    evt.preventDefault();

    const currentCollectionData = evt.currentTarget.dataset.breadcrumb.split('|');
    if (currentCollectionData[0] != 'shop-all' && currentCollectionData[0] != this.breadcrumbData.breadcrumbs[this.breadcrumbData.breadcrumbs.length - 1]?.handle) {
      const data = {
        handle: currentCollectionData[0],
        url: currentCollectionData[1],
        title: currentCollectionData[2]
      }
      this.breadcrumbData.breadcrumbs.push(data);
    }
    
    if (this.desktopFilters.dataset.opened == 'false') {
      this.breadcrumbData.desktopFiltersOpened = false;
    } else {
      this.breadcrumbData.desktopFiltersOpened = true;
    }

    sessionStorage.setItem('collectionBreadcrumb', JSON.stringify(this.breadcrumbData));
    
    location.href = evt.currentTarget.href;
  }

  _updateBreadcrumb = () => {
    const savedBreadcrumb = sessionStorage.getItem('collectionBreadcrumb');
    if (!savedBreadcrumb || this.dataset.handle == 'shop-all') {
      this.breadcrumbData = {
        desktopFiltersOpened: false,
        breadcrumbs: []
      };
      return;
    }
    
    let breadcrumbMarkup = '';
    this.breadcrumbData = JSON.parse(savedBreadcrumb);
    this.breadcrumbData.breadcrumbs.forEach((data) => {
      if (data.handle != this.dataset.handle) {
        breadcrumbMarkup = `${breadcrumbMarkup}<span class="w-[4px] h-[4px] rounded-full bg-blue"></span><a href="${data.url}" class="link link--underline">${data.title}</a>`;
      }
    });
    this.breadcrumb.insertAdjacentHTML('afterend', breadcrumbMarkup);

    if (this.breadcrumbData.desktopFiltersOpened) {
      this.desktopFilterTrigger.click();
    }

    sessionStorage.removeItem('collectionBreadcrumb');
  }

  _closeSortTriggerAcoordion = (evt) => {
    if (this.sortTriggerAccordionHeader.contains(evt.target)) {
      return;
    }

    if (this.sortTriggerAccordionHeader.getAttribute('aria-expanded') == 'false') {
      return;
    }

    this.sortTriggerAccordionHeader.click();
  }

  _handleSortTrigger = () => {
    this.sortTriggers = this.querySelectorAll(this._selectors.sortTrigger);
    this.sortTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (evt) => {
        evt.preventDefault();

        const inputEvent = new Event('input', {
          'bubbles': true,
          'cancelable': true
        });

        this.mainSort.value = evt.currentTarget.dataset.value;
        this.mainFilterForm.dispatchEvent(inputEvent);
      });
    });
  }

  _toggleDesktopFilters = () => {
    if (this.desktopFilters.dataset.opened == 'false') {
      this.desktopFilters.dataset.opened = 'true';
      this.desktopFilterTriggerLabel.textContent = 'Hide Filters';
    } else {
      this.desktopFilters.dataset.opened = 'false';
      this.desktopFilterTriggerLabel.textContent = 'Show Filters';
    }
  }

  _getProducts = (url) => {
    const results = fetch(url)
      .then(response => response.text())
      .then((text) => {
        const html = text;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        return parsedHTML;
      });
    return results;
  }

  _showMoreProducts = () => {
    const showMore = async () => {
      this.loader.setAttribute('loading', '');

      const pageUrl = this.showMoreBtn.dataset.url;
      const parsedHTML = await this._getProducts(pageUrl);
      const newProducts = parsedHTML.querySelector(this._selectors.productGrid).innerHTML;
      const newShowMoreBtn = parsedHTML.querySelector(this._selectors.showMoreBtn);
      
      this.productGrid.insertAdjacentHTML('beforeend', newProducts);
      
      if (newShowMoreBtn) {
        this.showMoreBtn.setAttribute('data-url', newShowMoreBtn.dataset.url);
        this.showMoreBtn.blur();
      } else {
        this.showMoreBtn.remove();
      }
      
      this.loader.removeAttribute('loading');
    };

    showMore();
  }

  _handleShowMoreBtn = () => {
    this.showMoreBtn = this.querySelector(this._selectors.showMoreBtn);

    if (!this.showMoreBtn) {
      return;
    }

    this.showMoreBtn.addEventListener('click', this._showMoreProducts);
  }

  _handleFilterChange = (evt) => {
    const { parsedHTML } = evt.detail;
    const scopedHTML = parsedHTML.querySelector(`[data-id="${this.dataset.id}"]`)
    theme.utils.refreshElements(this._refresh, scopedHTML, this);

    this._handleShowMoreBtn();
    this._handleSortTrigger();
  }
}