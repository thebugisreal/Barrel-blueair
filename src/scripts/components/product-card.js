class ProductCard extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      image: '[js-product-card-image]',
      soldOutTag: '[js-product-card-sold-out-tag]',
      swatch: '[js-product-card-swatch]',
      currentSwatchLabel: '[js-product-card-current-swatch-label]',
      productLink: '[js-product-link]',
      price: '[js-product-card-price]'
    }
  }

  connectedCallback() {
    this.soldOutTag = this.querySelector(this._selectors.soldOutTag);
    this.swathces = this.querySelectorAll(this._selectors.swatch);
    this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    this.productLinks = this.querySelectorAll(this._selectors.productLink);
    this.price = this.querySelector(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;

    this._setListeners();
  }

  _setListeners() {
    this.swathces.forEach((swatch) => {
      swatch.addEventListener('click', this._swatchOnClick);
    });
  }

  _updateImage = (swatchName) => {
    const prevImage = this.querySelector(`${this._selectors.image}:not(.hidden)`);
    if (prevImage) prevImage.classList.add('hidden');
    const newImage = this.querySelector(`${this._selectors.image}[data-swatch="${swatchName}"]`);
    if (newImage) newImage.classList.remove('hidden');
  }

  _toggleSoldOutTag = (variantAvailable) => {
    if (variantAvailable) {
      this.soldOutTag.classList.add('hidden');
    } else {
      this.soldOutTag.classList.remove('hidden');
    }
  }

  _updateProductLink = (url) => {
    this.productLinks.forEach((link) => {
      link.href = url;
    });
  }

  _updatePrice = (price) => {
    const compareAtPrice = parseFloat(price.split('|')[0]);
    const currenttPrice = parseFloat(price.split('|')[1]);

    let priceMarkup;
    if (compareAtPrice && compareAtPrice > currenttPrice) {
      priceMarkup = `<s class="product-card__price product-card__price--compare">${theme.utils.formatMoney(compareAtPrice, this.moneyFormat)}</s>
                    <span class="product-card__price product-card__price--current font-700">${theme.utils.formatMoney(currenttPrice, this.moneyFormat)}</span>`;
    } else {
      priceMarkup = `<span class="product-card__price product-card__price--current font-700">${theme.utils.formatMoney(currenttPrice, this.moneyFormat)}</span>`;
    }

    this.price.innerHTML = priceMarkup;
  }

  _swatchOnClick = (evt) => {
    evt.preventDefault();

    const swatchTarget = evt.currentTarget;
    
    if (swatchTarget.dataset.selected == 'true') {
      return;
    }

    const prevSelectedSwatch = this.querySelector(`${this._selectors.swatch}[data-selected="true"]`);
    if (prevSelectedSwatch) prevSelectedSwatch.dataset.selected = 'false';
    const newSelectedSwatch = this.querySelector(`${this._selectors.swatch}[data-swatch="${swatchTarget.dataset.swatch}"]`);
    if (newSelectedSwatch) newSelectedSwatch.dataset.selected = 'true';

    this.currentSwatchLabel.textContent = swatchTarget.dataset.swatch;

    this._updateImage(swatchTarget.dataset.swatch);
    this._toggleSoldOutTag(swatchTarget.dataset.available == 'true');
    this._updateProductLink(swatchTarget.dataset.url);
    this._updatePrice(swatchTarget.dataset.price);
  }
}