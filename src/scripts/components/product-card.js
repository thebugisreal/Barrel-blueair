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
      productCompareInfo:'[js-product-compare-info]',
      filterSwatch: '[js-product-card-filter-swatch]',
      quickAdd: '[js-quick-add]',
      swatchPopulate: '[js-populate-swatch]',
      imagePopulate: '[js-populate-image]'
    }
  }

  connectedCallback() {
    this.soldOutTag = this.querySelector(this._selectors.soldOutTag);
    this.swatchPopulate = this.querySelector(this._selectors.swatchPopulate)
    this.imagePopulate = this.querySelector(this._selectors.imagePopulate)
    this.swatches = this.querySelectorAll(this._selectors.swatch);
    this.filterSwatches = this.querySelectorAll(this._selectors.filterSwatch)
    this.currentSwatchLabel = this.querySelector(this._selectors.currentSwatchLabel);
    this.productLinks = this.querySelectorAll(this._selectors.productLink);
    this.price = this.querySelector(this._selectors.price);
    this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
    this.productCompareCheckbox = this.querySelector(this._selectors.productCompareCheckbox)
    this.quickAdd = this.querySelectorAll(this._selectors.quickAdd);
    this.cart = document.querySelector('cart-drawer');
    this.cartDrawer = document.querySelector('#CartDrawer');
    if (this.querySelector(this._selectors.productCompareProduct)) {
      this.productCompareProduct = JSON.parse(this.querySelector(this._selectors.productCompareProduct).innerHTML)
    }
    if (this.querySelector(this._selectors.productCompareInfo)) {
      this.productCompareInfo = JSON.parse(this.querySelector(this._selectors.productCompareInfo).innerHTML)
      if (this.productCompareProduct) {
        this.productCompareProduct['productCompareInfo'] = this.productCompareInfo
      }
    }

    this._initRelatedSwatches();
    this._setListeners();

  }

  _initRelatedSwatches() {
    const self = this;

    if(this.swatchPopulate) {
      const swatchFamily = this.swatchPopulate.dataset.swatchFamily
      const url = `/collections/all/${swatchFamily}?view=json`

      fetch(url)
        .then(response => response.text())
        .then(text => {
            const html = document.createElement('div');
            html.innerHTML = text;

            const productJson = html.querySelector('[js-collection-json]')
            const parsedJson = JSON.parse(productJson.textContent) 

            self._populateSwatches(parsedJson)
        })
        .catch(e => {
          console.error(e);
        });
    }
  }

  _populateSwatches(products) {
    const placeToAppend = this.swatchPopulate;
    console.log('card', this)
    const mainImage = this.querySelector('[js-product-card-main-image]');
    const mainImageData = mainImage.dataset.swatch;
    const imagesToAppend = this.imagePopulate;

    products.forEach((swatch, index) => {
      let selected = 'false';
      let swatchOrder = 'order-2'


      if(swatch.color == mainImageData) {
        selected = 'true'
        swatchOrder = 'order-1'
      } 

      const swatchButton = `<button class="egg order-1 product-card__swatch product-card__swatch--color w-[36px] h-[36px] rounded-full ${swatchOrder}" data-swatch="${ swatch.color }" data-available="${swatch.available}" data-price="${swatch.price}" data-selected="${selected}" data-url="${swatch.url}" title="${swatch.colorTitle}" js-product-card-swatch>
              <div class="block w-full h-full rounded-full overflow-hidden" style="background-color: ;">
                  <img src="${swatch.swatchImage}" alt="Nordic Fog" class="block h-full w-full">
              </div>
      </button>`

      console.log('swatchButton', swatchButton)

      const swatchImage = `<div class="product-card__image aspect-square hidden" data-swatch="${ swatch.color }" js-product-card-image>
            <img class="product-card__inner-image" src="${ swatch.swatchProductImage }"/>
      </div>`

      placeToAppend.insertAdjacentHTML('beforeend', swatchButton)

      if(swatch.color !== mainImageData) {
        imagesToAppend.insertAdjacentHTML('beforeend', swatchImage)
      }

    })

    this.swatches = this.querySelectorAll(this._selectors.swatch);

    this._setListeners();
  }

  _setListeners() {

    this.swatches.forEach((swatch) => {
      swatch.addEventListener('click', this._swatchOnClick);
    });

    this.filterSwatches.forEach((swatch) => {
      swatch.addEventListener('click', this._filterSwatchOnClick);
    });

    if (this.productCompareCheckbox) {
      this._initProductCompare()
      this.productCompareCheckbox.addEventListener('change', this._handleProductCompareCheckToggle.bind(this))
      window.addEventListener("seed:compare:itemchange", this._handleItemChange.bind(this));
    }

    if ((this.quickAdd) != null) {
      this.quickAdd.forEach(button => {
        button.addEventListener('click', this._submitSingle.bind(this));
      });
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

  _filterSwatchOnClick = (evt) => {
    evt.preventDefault();

    const swatchTarget = evt.currentTarget;
    
    if (swatchTarget.dataset.selected == 'true') {
      return;
    }

    const prevSelectedSwatch = this.querySelector(`${this._selectors.filterSwatch}[data-selected="true"]`);
    if (prevSelectedSwatch) prevSelectedSwatch.dataset.selected = 'false';
    swatchTarget.dataset.selected = 'true';

    this.currentSwatchLabel.textContent = swatchTarget.dataset.swatch;
    this._toggleSoldOutTag(swatchTarget.dataset.available == 'true');
    this._updateProductLink(swatchTarget.dataset.url);
    this._updatePrice(swatchTarget.dataset.price);
    this._updateImage(swatchTarget.dataset.swatch);
  }

  _submitSingle(e) {
    e.preventDefault();
    console.log('e.currentTarget', e.currentTarget);
    let variantId = e.currentTarget.dataset.variantId
    console.log('variantId', variantId);
    let variantCompareAtPrice = e.currentTarget.dataset.variantCompareAtPrice
    console.log('variantCompareAtPrice', variantCompareAtPrice);
    let data = {
      items: [{
        'id': variantId,
        'quantity': 1,
        'properties': {
          '_compare_at_price': variantCompareAtPrice
        }
      }],
      sections: this.getSectionsToRender().map((section) => section.section)
    }
    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((response) => {
      this.cart.renderContents(response);
      this.cartDrawer.open();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart',
        section: 'cart',
        selector: '[js-cart-drawer-contents]',
      },
      {
        id: 'cart-count',
        section: 'cart-count',
        selector: '.shopify-section',
      }
    ];
  }
}