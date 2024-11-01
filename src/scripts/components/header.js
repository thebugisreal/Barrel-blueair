class SiteHeader extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      header: "#shopify-section-header"
    }
  }

  connectedCallback() {
    this.header = document.querySelector(this._selectors.header);

    this._setVariables();
    this._watchWindowResize();
  }

  _watchWindowResize = evt => {
    window.addEventListener('resize', this._setVariables)
  }

  _setVariables = evt => {
    document.documentElement.style.setProperty('--header-height', `${this.header.clientHeight}px`)
  }
}