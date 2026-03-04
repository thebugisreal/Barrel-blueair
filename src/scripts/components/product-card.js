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
      imagePopulate: '[js-populate-image]',
      optionSwatchesContainers: '[js-product-option-swatches-container]',
      scentImageContainer: '[js-product-card-scent-image-container]'
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
    this._initScentOptionSwatches();
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

  async _initScentOptionSwatches() {
    const containers = this.querySelectorAll(`${this._selectors.optionSwatchesContainers}[data-option="scent"]`);
    if (!containers.length) return;

    for (const container of containers) {
      const currentHandle = container.dataset.handle;
      const collectionTagRaw = container.dataset.collection || '';
      if (!collectionTagRaw) continue;

      const looksEncoded = /%[0-9A-F]{2}/i.test(collectionTagRaw) || !collectionTagRaw.includes(':');
      const tagForUrl = looksEncoded ? collectionTagRaw : encodeURIComponent(collectionTagRaw);
      const targetURL = `/collections/all/${tagForUrl}?view=json`;

      try {
        const products = await this._getRelatedSwatchesJSON(targetURL);
        if (!Array.isArray(products) || products.length === 0) continue;

        const imageContainer = this.querySelector(this._selectors.scentImageContainer);
        if (imageContainer && !this.dataset.scentImagesPopulated) {
          products.forEach((p) => {
            if (p.handle === currentHandle) return;
            const imgDiv = document.createElement('div');
            imgDiv.className = 'product-card__image aspect-square hidden';
            imgDiv.dataset.handle = p.handle;
            imgDiv.setAttribute('js-product-card-image', '');
            imgDiv.innerHTML = `<img class="object-contain w-full h-full" src="${p.swatchProductImage || ''}" alt="${(p.colorTitle || p.title || '').replace(/"/g, '&quot;')}" loading="lazy">`;
            imageContainer.appendChild(imgDiv);
          });
          this.dataset.scentImagesPopulated = 'true';
        }

        const labelEl = container.closest('.product-card__related-scent')?.querySelector(this._selectors.currentSwatchLabel);
        let html = '';
        products.forEach((p) => {
          const label = p.colorTitle || p.color || p.title || '';
          const swatchStyle = (p.swatchImage && p.swatchImage !== '')
            ? `background-image:url('${String(p.swatchImage).replace(/'/g, "\\'")}');background-size:cover;background-position:center;`
            : (p.colorHex ? `background-color:${p.colorHex};` : '');
          const isCurrent = p.handle === currentHandle;
          const orderClass = isCurrent ? 'order-1' : 'order-2';
          const baseClasses = `product-card__swatch product-card__swatch--color w-[36px] h-[36px] rounded-full ${orderClass}`;
          const escapedLabel = String(label).replace(/"/g, '&quot;');
          const escapedUrl = (p.url || '').replace(/"/g, '&quot;');
          html += `<button type="button" class="${baseClasses}" aria-label="Aroma: ${escapedLabel}" data-handle="${p.handle}" data-swatch="${escapedLabel}" data-available="${p.available}" data-price="${p.price || ''}" data-url="${escapedUrl}" data-selected="${isCurrent}" title="${escapedLabel}" js-product-card-scent-swatch><div class="block w-full h-full rounded-full overflow-hidden" style="${swatchStyle}"></div></button>`;
        });
        container.insertAdjacentHTML('beforeend', html);

        const scentSwatches = container.querySelectorAll('[js-product-card-scent-swatch]');
        scentSwatches.forEach((el) => {
          el.addEventListener('click', (evt) => {
            evt.preventDefault();
            const t = evt.currentTarget;
            if (t.dataset.selected === 'true') return;
            this._scentSwatchOnClick(t, labelEl, container);
          });
        });
      } catch (err) {
        console.warn('[product-card] scent swatches init failed', err);
      }
    }
  }

  _getRelatedSwatchesJSON(url) {
    return fetch(url)
      .then((r) => r.text())
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const script = doc.querySelector('script[js-collection-json]');
        if (!script) throw new Error('JSON container [js-collection-json] not found at ' + url);
        const raw = (script.textContent || script.innerHTML || '').trim();
        return JSON.parse(raw);
      });
  }

  _updateImageByHandle(handle) {
    const images = this.querySelectorAll(`${this._selectors.image}[data-handle]`);
    images.forEach((img) => {
      if (img.dataset.handle === handle) {
        img.classList.remove('hidden');
      } else {
        img.classList.add('hidden');
      }
    });
  }

  _scentSwatchOnClick = (swatchEl, labelEl, container) => {
    const handle = swatchEl.dataset.handle;
    const url = swatchEl.dataset.url;
    const price = swatchEl.dataset.price;
    const available = swatchEl.dataset.available === 'true';
    const label = swatchEl.dataset.swatch || '';

    this._updateImageByHandle(handle);
    this._updateProductLink(url);
    this._updatePrice(price);
    this._toggleSoldOutTag(available);
    if (labelEl) labelEl.textContent = label;

    if (container) {
      container.querySelectorAll('[js-product-card-scent-swatch]').forEach((el) => {
        const isSelected = el === swatchEl;
        el.dataset.selected = isSelected ? 'true' : 'false';
        el.classList.toggle('order-1', isSelected);
        el.classList.toggle('order-2', !isSelected);
      });
    }
  };

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

export default ProductCard;