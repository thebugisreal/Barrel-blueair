class FaqPosts extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      accordion: 's-accordion',
      post: '[js-accordion-item]',
      loadMoreBtn: '[js-load-more-btn]',
      section: 'faq-posts'
    }
  }

  connectedCallback() {
    this.type = this.dataset.type;
    this.accordion = this.querySelector(this._selectors.accordion);
    this.loadMoreBtn = this.querySelector(this._selectors.loadMoreBtn);

    this._setListeners();
  }

  _setListeners() {
    if (!this.loadMoreBtn) {
      return;
    }

    this.loadMoreBtn.addEventListener('click', this._loadMoreBtnOnClick);
  }

  _loadMoreBtnOnClick = (evt) => {
    evt.preventDefault();

    if (this.type == 'tagged') {
      const hiddenPosts = this.querySelectorAll(`${this._selectors.post}.hidden`);
      const firstFiveHiddenPosts = Array.from(hiddenPosts).slice(0, 5); 
      firstFiveHiddenPosts.forEach((post) => {
        post.classList.remove('hidden');
      });

      const anyHiddenPost = this.querySelector(`${this._selectors.post}.hidden`);
      if (!anyHiddenPost) {
        evt.currentTarget.remove();
      }
    } else {
      this._loadMorePosts();
    }
  }

  _loadMorePosts = () => {
    const loadMore = async () => {
      const pageUrl = this.loadMoreBtn.dataset.url;
      const parsedHTML = await this._getPosts(pageUrl);
      const newSection = parsedHTML.querySelector(`${this._selectors.section}[data-type="all"]`);
      const newPosts = newSection.querySelector(this._selectors.accordion).innerHTML;
      const newLoadMoreBtn = newSection.querySelector(this._selectors.loadMoreBtn);

      this.accordion.insertAdjacentHTML('beforeend', newPosts);
      this.accordion.connectedCallback();

      if (newLoadMoreBtn) {
        this.loadMoreBtn.setAttribute('data-url', newLoadMoreBtn.dataset.url);
      } else {
        this.loadMoreBtn.remove();
      }
    };

    loadMore();
  }

  _getPosts = (url) => {
    const results = fetch(url)
      .then(response => response.text())
      .then((text) => {
        const html = text;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        return parsedHTML;
      });
    return results;
  }
}