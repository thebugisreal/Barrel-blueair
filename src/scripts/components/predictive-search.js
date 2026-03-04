class PredictiveSearch extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector('[js-predictive-search-results]');
    this.popularSearches = this.querySelector('[js-popular-searches]');
    this.clearBtn = this.querySelector('[js-clear]');
    this.searchSubmit = this.querySelector('[js-search-submit]');

    this.input.addEventListener('focus', this.open);
    this.input.addEventListener('input', theme.utils.debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.clearBtn.addEventListener('click', this.clearSearch);

    document.addEventListener('MobileNavDrawer:close', () => {
      this.close();
      this.clearSearch();
    });

    document.addEventListener('DesktopSearchDrawer:open', () => {
      if (this.dataset.scope == 'mobile') {
        return;
      }
      this.input.focus();
    });
  }

  submitSearch = () => {
    this.searchSubmit.click();
  }

  clearSearch = () => {
    this.input.value = '';
    const inputEvent = new Event('input', {
      'bubbles': true,
      'cancelable': true
    });
    this.input.dispatchEvent(inputEvent);
  }

  onChange() {
    const searchTerm = this.input.value.trim();

    if (!searchTerm.length) {
      this.popularSearches?.classList.remove('hidden');
      this.clearBtn.classList.add('hidden');
      this.predictiveSearchResults.classList.add('hidden');

      return;
    }

    this.getSearchResults(searchTerm);
    this.predictiveSearchResults.classList.remove('hidden');
    this.clearBtn.classList.remove('hidden');
    this.popularSearches?.classList.add('hidden');
  }

  getSearchResults(searchTerm) {
    let predictiveFetchUrl
    if (this.dataset.market && !this.dataset.market.includes('us')) {
      predictiveFetchUrl = `/${this.dataset.market}/search?q=${searchTerm}`
    } else {
      predictiveFetchUrl = `/search?q=${searchTerm}`
    }
    fetch(predictiveFetchUrl)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#fetchSearch').innerHTML;
        this.predictiveSearchResults.innerHTML = resultsMarkup;

        const searchText = document.querySelector('[js-search-term]')

        if (searchText) {
          searchText.textContent = searchTerm
        }

        document.querySelectorAll('[js-view-more]').forEach(button => {
          button.addEventListener('click', this.submitSearch);
        });

        this.open();
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  open = () => {
    if (this.dataset.scope == 'desktop') {
      return;
    }

    if (this.dataset.open == 'true') {
      return;
    }

    this.dataset.open = 'true';
  }

  close = () => {
    if (this.dataset.scope == 'desktop') {
      return;
    }

    if (this.dataset.open == 'false') {
      return;
    }

    this.dataset.open = 'false';
  }
}

export default PredictiveSearch;