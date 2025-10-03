class CompareGrid extends HTMLElement {
  constructor() {
    super();

    this.selectors = {
      atcBtn: '[js-atc-btn]',
      compareItem: '[js-compare-item]',
      additionalColumn: '[js-additional-column]'
    };

    this._labelsObserver = null;
  }
  
    connectedCallback() {
      this.atcBtn = this.querySelector(this.selectors.atcBtn)
      this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
      this.additionalColumn = this.querySelector(this.selectors.additionalColumn)
      this.initCompareGrid()
      this.setListeners()
    }

  disconnectedCallback() {
    if (this._labelsObserver) {
      this._labelsObserver.disconnect();
      this._labelsObserver = null;
    }
  }

  setListeners() {
    window.addEventListener("seed:compare:itemchange", this._handleItemChange.bind(this));
    document.addEventListener("shopify:section:load", this._handleItemChange.bind(this));
  }

  _handleItemChange() {
    this.initCompareGrid();
  }

  initCompareGrid() {
    // Get stored Data
    let compareProductArray;
    const stored = sessionStorage.getItem('compareProductArray');
    if (stored) {
      try {
        compareProductArray = JSON.parse(stored) || [];
      } catch {
        compareProductArray = [];
      }
    } else {
      compareProductArray = [];
    }

    // Remove all grid items
    const allGridItem = this.querySelectorAll(this.selectors.compareItem);
    for (let i = 0; i < allGridItem.length; i++) {
      allGridItem[i].remove();
    }

    // Add in grid items
    for (let i = 0; i < compareProductArray.length; i++) {
      this._createDataColumn(compareProductArray[i], i);
    }

    this._handeleHeightChange();

    _createDataColumn(product, index) {
      const columnContainer =  document.createElement('ul')
      columnContainer.classList.add('compare__grid-item')
      columnContainer.setAttribute('js-compare-item', '')
      columnContainer.dataset.productId = product.id
      columnContainer.dataset.index = index

  _handeleHeightChange() {
    // Adjusting Height 
    let maxHeight = 0;
    const compareProductTitles = document.querySelectorAll('[js-compare-product-title]');
    compareProductTitles.forEach(title => {
      const height = title.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    document.documentElement.style.setProperty('--compare-product-height', `${maxHeight}px`);
  }

  _getLocalizedProductUrl(handle) {
    const origin = window.location.origin;
    const localePrefixMatch = window.location.pathname.match(/^\/[a-z]{2}(-[a-z]{2})?\//);
    const localePrefix = localePrefixMatch ? localePrefixMatch[0].replace(/\/$/, '') : '';
    return `${origin}${localePrefix}/products/${handle}`;
  }

  // ---- label detection & prune ----
  _hasPriceLabel() {
    // Look ONLY in the labels column for a row whose text is “Price”
    const p = Array.from(
      this.querySelectorAll('.compare__grid-info-column .compare__item .p1')
    ).find(node => (node.textContent || '').trim().toLowerCase() === 'price');
    return !!p;
  }

  _prunePriceRowIfNoLabel() {
    if (this._hasPriceLabel()) return;
    // For each product column, the first data row (right after .compare__title) is the price row — remove it.
    this.querySelectorAll('.compare__grid-item').forEach(col => {
      const title = col.querySelector('.compare__title');
      const firstDataRow = title ? title.nextElementSibling : null;
      if (firstDataRow && firstDataRow.classList.contains('compare__item')) {
        firstDataRow.remove();
      }
    });
  }

  _observeLabelsColumn() {
    const labels = this.querySelector('.compare__grid-info-column');
    if (!labels || this._labelsObserver) return;

      // Compare Price
      const productComparePriceContainer = this._createCompareItem(theme.utils.formatMoney(product.price, this.moneyFormat));
      productComparePriceContainer.classList.add('compare__price')

    this._labelsObserver = new MutationObserver(() => {
      const nowHasPrice = this._hasPriceLabel();
      if (nowHasPrice !== lastHadPrice) {
        lastHadPrice = nowHasPrice;
        // Label visibility changed (e.g., country switch) — rebuild so price rows are re-added/removed
        this.initCompareGrid();
      }
    });

    // Watch for label li’s being added/removed or text changes
    this._labelsObserver.observe(labels, { childList: true, subtree: true, characterData: true });
  }
  // --------------------------------

  _createDataColumn(product, index) {
    const columnContainer =  document.createElement('ul');
    columnContainer.classList.add('compare__grid-item');
    columnContainer.setAttribute('js-compare-item', '');
    columnContainer.dataset.productId = product.id;
    columnContainer.dataset.index = index;

    // Product Title
    const productTitleContainer = document.createElement('li');
    productTitleContainer.classList.add('compare-product__title');
    productTitleContainer.setAttribute('js-compare-product-title', '');
    const productTitleLink = document.createElement('a');
    productTitleLink.classList.add('compare-product__title-text');
    productTitleLink.href = this._getLocalizedProductUrl(product.handle);
    productTitleLink.innerText = product.title;
    productTitleContainer.appendChild(productTitleLink);

    // Product Image
    const productImageContainer = document.createElement('li');
    productImageContainer.classList.add('compare__image-container');
    const productImage = document.createElement('img');
    productImage.classList.add('compare__image');
    if (product.productCompareInfo && product.productCompareInfo.product_card_image) {
      productImage.src = product.productCompareInfo.product_card_image;
    } else {
      productImage.src = product.featured_image;
    }
    productImage.alt = (product.featured_image && product.featured_image.alt) || '';
    productImage.setAttribute('loading', "lazy");
    productImageContainer.appendChild(productImage);

    // Product Button
    const productCompareAtcContainer = document.createElement('li');
    productCompareAtcContainer.classList.add('compare__atc');
    const productCompareAtc = this.atcBtn ? this.atcBtn.cloneNode(true) : document.createElement('a');
    productCompareAtc.setAttribute('href', this._getLocalizedProductUrl(product.handle));
    if (!this.atcBtn) productCompareAtc.className = 'btn';
    productCompareAtcContainer.appendChild(productCompareAtc);

    // Compare Title
    const productCompareTitleContainer = document.createElement('li');
    productCompareTitleContainer.classList.add('compare__title');

    // Price (always create; pruning happens after build if label is absent)
    const productComparePriceContainer = this._createCompareItem(
      theme.utils.formatMoney(product.price, this.moneyFormat)
    );

    // Overview items
    const productCompareRoomSizeContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_recommendedRoomSize : '-'
    );
    const productCompareDimensionContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_dimensions: '-'
    );
    const productCompareWeightContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_weight : '-'
    );
    const productCompareWifiContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_wifi : '-'
    );

    // Specifications title
    const productSpecificationTitle = this._createCompareTitle();

    // Specifications
    const productCompareEnergyConsumptionContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_energyConsumption : '-'
    );
    const productCompareSoundLevelContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_soundlevel : '-'
    );
    const productCompareAirChangesContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_airchanges : '-'
    );

    const productCompareCleanAirContainer = this._createCompareItem(" ");
    const productComparePollenContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_CADR_pollen : '-'
    );
    const productCompareDustContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_CADR_dust: '-'
    );
    const productCompareSmokeContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_CADR_smoke: '-'
    );

    // Features
    const productFeaturesTitle = this._createCompareTitle();
    const productCompareAirQualitySensorContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_airSensor : '-'
    );
    const productCompareFilterReplacementIndicatorContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.filter_replacement_indicator : '-'
    );
    const productCompareOnOffTimerContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.on_off_timer : '-'
    );
    const productCompareSpeedControlOptionsContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_fanspeed : '-'
    );
    const productCompareWheelsContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.wheels : '-'
    );
    const productCompareMaxRoomSizeContainer = this._createCompareItem(
      product.productCompareInfo ? product.productCompareInfo.max_room_size: '-'
    );

    // Append to column
    columnContainer.appendChild(productTitleContainer);
    columnContainer.appendChild(productImageContainer);
    columnContainer.appendChild(productCompareAtcContainer);
    columnContainer.appendChild(productCompareTitleContainer);
    columnContainer.appendChild(productComparePriceContainer);
    columnContainer.appendChild(productCompareRoomSizeContainer);
    columnContainer.appendChild(productCompareDimensionContainer);
    columnContainer.appendChild(productCompareWeightContainer);
    columnContainer.appendChild(productCompareWifiContainer);

    columnContainer.appendChild(productSpecificationTitle);
    columnContainer.appendChild(productCompareEnergyConsumptionContainer);
    columnContainer.appendChild(productCompareSoundLevelContainer);
    columnContainer.appendChild(productCompareAirChangesContainer);
    columnContainer.appendChild(productCompareCleanAirContainer);
    columnContainer.appendChild(productComparePollenContainer);
    columnContainer.appendChild(productCompareDustContainer);
    columnContainer.appendChild(productCompareSmokeContainer);

    columnContainer.appendChild(productFeaturesTitle);
    columnContainer.appendChild(productCompareAirQualitySensorContainer);
    columnContainer.appendChild(productCompareFilterReplacementIndicatorContainer);
    columnContainer.appendChild(productCompareOnOffTimerContainer);
    columnContainer.appendChild(productCompareSpeedControlOptionsContainer);
    columnContainer.appendChild(productCompareWheelsContainer);
    columnContainer.appendChild(productCompareMaxRoomSizeContainer);

    // Append to the compare Grid
    this.insertBefore(columnContainer, this.additionalColumn);
  }

  _createCompareItem(data) {
    const compareItemContainer = document.createElement('li');
    compareItemContainer.classList.add('compare__item');
    const compareItem = document.createElement('p');
    compareItem.classList.add('p1');
    if (data === 'true') {
      compareItem.classList.add('compare-item-true');
    } else if (data === 'false') {
      compareItem.classList.add('compare-item-false');
    } else {
      compareItem.textContent = data ? data : '-';
    }
    compareItemContainer.appendChild(compareItem);
    return compareItemContainer;
  }

  _createCompareTitle(title) {
    const compareItemTitleContainer = document.createElement('li');
    compareItemTitleContainer.classList.add('compare__title');
    const compareItemTitle = document.createElement('p');
    compareItemTitle.classList.add('s1');
    compareItemTitle.textContent = title ? title : " ";
    compareItemTitleContainer.appendChild(compareItemTitle);
    return compareItemTitleContainer;
  }
}