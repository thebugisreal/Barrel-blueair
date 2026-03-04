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


class FaqSearchResults extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      supportTaggedArticlesTitle: '[js-support-tagged-articles-title]',
      supportTaggedArticle: '[js-support-tagged-article]',
      supportTaggedShowMoreBtn: '[js-support-tagged-show-more-btn]',
      nonSupportTaggedArticlesTitle: '[js-non-support-tagged-articles-title]',
      nonSupportTaggedArticle: '[js-non-support-tagged-article]',
      nonSupportTaggedShowMoreBtn: '[js-non-support-tagged-show-more-btn]',
    }
  }

  connectedCallback() {
    this.supportTaggedShowMoreBtn = this.querySelector(this._selectors.supportTaggedShowMoreBtn);
    this.nonSupportTaggedShowMoreBtn = this.querySelector(this._selectors.nonSupportTaggedShowMoreBtn);

    this._checkBlog();
    this._initArticles();
    this._setListeners();
  }

  _setListeners() {
    this.supportTaggedShowMoreBtn.addEventListener('click', () => {
      this._showArticles(true);
    });
    this.nonSupportTaggedShowMoreBtn.addEventListener('click', () => {
      this._showArticles(false);
    });
  }

  _showArticles = (supportTagged = true, init = false) => {
    const hiddenArticles = this.querySelectorAll(`${supportTagged ? this._selectors.supportTaggedArticle : this._selectors.nonSupportTaggedArticle}${this.blog ? `[data-blog="${this.blog}"]` : ''}.hidden`);

    if (hiddenArticles.length == 0 && init) {
      const articlesTitle = this.querySelector(`${supportTagged ? this._selectors.supportTaggedArticlesTitle : this._selectors.nonSupportTaggedArticlesTitle}`);
      articlesTitle.classList.add('hidden');
      return;
    }

    const firstFiveHiddenArticles = Array.from(hiddenArticles).slice(0, 5);
    firstFiveHiddenArticles.forEach((article) => {
      article.classList.remove('hidden');
    });

    const showMoreBtn = supportTagged ? this.supportTaggedShowMoreBtn : this.nonSupportTaggedShowMoreBtn;
    const anyHiddenArticle = this.querySelector(`${supportTagged ? this._selectors.supportTaggedArticle : this._selectors.nonSupportTaggedArticle}${this.blog ? `[data-blog="${this.blog}"]` : ''}.hidden`);
    if (anyHiddenArticle) {
      showMoreBtn.classList.remove('hidden');
    } else {
      showMoreBtn.classList.add('hidden');
    }
  }
  _initArticles = () => {
    this._showArticles(true, true);
    this._showArticles(false, true);
  }

  _checkBlog = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const blog = searchParams.get('blog');

    if (blog) {
      this.blog = blog;
    }
  }
}

export { FaqPosts, FaqSearchResults };