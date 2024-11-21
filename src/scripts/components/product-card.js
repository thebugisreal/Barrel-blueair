class ProductCard extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      header: "#shopify-section-header"
    }
  }

  connectedCallback() {
    console.log('d')
    this._setListeners();
  }

  _setListeners() {
    
  }
}