class ProductCard extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      image: '[js-product-card-image]',
      soldOutTag: '[js-product-card-sold-out-tag]',
      swatch: '[js-product-card-swatch]',
      currentSwatchLabel: '[js-product-card-current-swatch-label]',
      productLink: '[js-product-link]',
      price: '[js-product-card-price]',
      productCompareCheckbox: '[js-product-compare-checkbox]',
      productCompareProduct: '[js-product-compare-product]',
      productCompareInfo:'[js-product-compare-info]'
    }
  }

  connectedCallback() {
    this.soldOutTag = this.querySelector(this._selectors.soldOutTag);
    this.swatches = this.querySelectorAll(this._selectors.swatch);
    this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    this.productLinks = this.querySelectorAll(this._selectors.productLink);
    this.price = this.querySelector(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.productCompareCheckbox = this.querySelector(this._selectors.productCompareCheckbox)
    if (this.querySelector(this._selectors.productCompareProduct)) {
      this.productCompareProduct = JSON.parse(this.querySelector(this._selectors.productCompareProduct).innerHTML)
    }
    if (this.querySelector(this._selectors.productCompareInfo)) {
      this.productCompareInfo = JSON.parse(this.querySelector(this._selectors.productCompareInfo).innerHTML)
      if (this.productCompareProduct) {
        this.productCompareProduct['productCompareInfo'] = this.productCompareInfo
      }
    }

    this._setListeners();
  }

  _setListeners() {
    this.swatches.forEach((swatch) => {
      swatch.addEventListener('click', this._swatchOnClick);
    });

    if (this.productCompareCheckbox) {
      this._initProductCompare()
      this.productCompareCheckbox.addEventListener('change', this._handleProductCompareCheckToggle.bind(this))
      window.addEventListener("seed:compare:itemchange", this._handleItemChange.bind(this));
    }
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

  _initProductCompare() {
    let compareProductArray
    if (sessionStorage.getItem('compareProductArray')) {
      compareProductArray = sessionStorage.getItem('compareProductArray');
      compareProductArray = JSON.parse(compareProductArray)

      for (let i = 0; i < compareProductArray.length ; i++ ) {
        if (compareProductArray[i].id === this.productCompareProduct.id) {
          this.productCompareCheckbox.checked = true
        }
      }

      if (compareProductArray.length > 2) {
        for (let i = 0; i < compareProductArray.length ; i++ ) {
          if (compareProductArray[i].id === this.productCompareProduct.id ) {
            this.productCompareCheckbox.disabled = false
            return
          }
        }
        this.productCompareCheckbox.disabled = true
      } else {
        this.productCompareCheckbox.disabled = false
      }
    }
  }

  _handleItemChange(e) {
    let compareProductArray
    if (sessionStorage.getItem('compareProductArray')) {
      compareProductArray = sessionStorage.getItem('compareProductArray');
      compareProductArray = JSON.parse(compareProductArray)

      if (compareProductArray.length === 0) {
        this.productCompareCheckbox.checked = false
      } else if (compareProductArray.length > 2) {
        for (let i = 0; i < compareProductArray.length ; i++ ) {
          if (compareProductArray[i].id === this.productCompareProduct.id ) {
            this.productCompareCheckbox.disabled = false
            return
          }
        }
        this.productCompareCheckbox.disabled = true
      } else {
        this.productCompareCheckbox.disabled = false
      }
    }
  }

  _handleProductCompareCheckToggle(e) {
    let compareProductArray
    if (sessionStorage.getItem('compareProductArray')) {
      compareProductArray = sessionStorage.getItem('compareProductArray');
      compareProductArray = JSON.parse(compareProductArray)
    } else {
      compareProductArray = [];
    }

    if (this.productCompareCheckbox.checked) {
      // check if obj is in the array
      for (let i = 0; i < compareProductArray.length ; i++ ) {
        if (compareProductArray[i].id === this.productCompareProduct.id) {
          return true;
        }
      }
      compareProductArray.push(this.productCompareProduct)
      sessionStorage.setItem("compareProductArray", JSON.stringify(compareProductArray));
    } else {
      for (let i = 0; i < compareProductArray.length ; i++ ) {
        if (compareProductArray[i].id === this.productCompareProduct.id) {
          compareProductArray.splice(i, 1)
        }
      }
      sessionStorage.setItem("compareProductArray", JSON.stringify(compareProductArray));
    }

    window.dispatchEvent(new CustomEvent("seed:compare:itemchange", {
      detail: { compareProductArray }
    }))
  }

  _updateProductLink = (url) => {
    this.productLinks.forEach((link) => {
      link.href = url;
    });
  }

  _updatePrice = (price) => {
    const compareAtPrice = parseFloat(price.split('|')[0]);
    const currentPrice = parseFloat(price.split('|')[1]);

    let priceMarkup;
    if (compareAtPrice && compareAtPrice > currentPrice) {
      priceMarkup = `<s class="product-card__price product-card__price--compare">${theme.utils.formatMoney(compareAtPrice, this.moneyFormat)}</s>
                    <span class="product-card__price product-card__price--current font-700">${theme.utils.formatMoney(currentPrice, this.moneyFormat)}</span>`;
    } else {
      priceMarkup = `<span class="product-card__price product-card__price--current font-700">${theme.utils.formatMoney(currentPrice, this.moneyFormat)}</span>`;
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
    swatchTarget.dataset.selected = 'true';

    this.currentSwatchLabel.textContent = swatchTarget.dataset.swatch;

    this._updateImage(swatchTarget.dataset.swatch);
    this._toggleSoldOutTag(swatchTarget.dataset.available == 'true');
    this._updateProductLink(swatchTarget.dataset.url);
    this._updatePrice(swatchTarget.dataset.price);
  }
}