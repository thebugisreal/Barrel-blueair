class CompareGrid extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        atcBtn: '[js-atc-btn]',
        compareItem: '[js-compare-item]',
        additionalColumn: '[js-additional-column]'
      }
    }
  
    connectedCallback() {
      this.atcBtn = this.querySelector(this.selectors.atcBtn)
      this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;
      this.additionalColumn = this.querySelector(this.selectors.additionalColumn)

      this.initCompareGrid()
      this.setListeners()
    }

    setListeners() {
      window.addEventListener("seed:compare:itemchange", this._handleItemChange.bind(this));
    }

    initCompareGrid() {
      // Get stored Data
      let compareProductArray
      if (sessionStorage.getItem('compareProductArray')) {
          compareProductArray = sessionStorage.getItem('compareProductArray');
          compareProductArray = JSON.parse(compareProductArray)
      } else {
          compareProductArray = [];
      }

      // Remove all grid items

      const allGridItem = this.querySelectorAll(this.selectors.compareItem)
      for (let i = 0; i < allGridItem.length; i++) {
        allGridItem[i].remove()
      }

      // Add in grid items
      for (let i = 0; i < compareProductArray.length; i++) {
        this._createDataColumn(compareProductArray[i], i)
      }
      this._handeleHeightChange()

    }

    _handleItemChange(e) {
      this.initCompareGrid()
    }

    _handeleHeightChange() {
      // Adjusting Height 
      let maxHeight = 0;
      const compareProductTitles = document.querySelectorAll('[js-compare-product-title]')
      compareProductTitles.forEach(title => {
        const height = title.offsetHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      });
      document.documentElement.style.setProperty('--compare-product-height', `${maxHeight}px`)
    }

    _createDataColumn(product, index) {
      const columnContainer =  document.createElement('ul')
      columnContainer.classList.add('compare__grid-item')
      columnContainer.setAttribute('js-compare-item', '')
      columnContainer.dataset.productId = product.id
      columnContainer.dataset.index = index

      // Product Title
      const productTitleContainer = document.createElement('li')
      productTitleContainer.classList.add('compare-product__title')
      productTitleContainer.setAttribute('js-compare-product-title', '')
      const productTitleLink = document.createElement('a')
      productTitleLink.classList.add('compare-product__title-text')
      productTitleLink.href = `https://blueairdev.myshopify.com/products/${product.handle}`
      productTitleLink.innerText = product.title
      productTitleContainer.appendChild(productTitleLink)

      // Product Image
      const productImageContainer = document.createElement('li')
      productImageContainer.classList.add('compare__image-container')
      const productImage = document.createElement('img')
      productImage.classList.add('compare__image')
      productImage.src = product.featured_image
      productImage.alt = product.featured_image.alt
      productImage.setAttribute('loading', "lazy")
      productImageContainer.appendChild(productImage)

      // Product Button
      const productCompareAtcContainer = document.createElement('li')
      productCompareAtcContainer.classList.add('compare__atc')
      const productCompareAtc = this.atcBtn.cloneNode(true);
      productCompareAtc.setAttribute('href', `https://blueairdev.myshopify.com/products/${product.handle}`)
      productCompareAtcContainer.appendChild(productCompareAtc)

      // Compare Title
      const productCompareTitleContainer = document.createElement('li')
      productCompareTitleContainer.classList.add('compare__title')


      // Compare Price
      const productComparePriceContainer = this._createCompareItem(theme.utils.formatMoney(product.price, this.moneyFormat))

      // Compare Max Room Size
      const productCompareRoomSizeContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_recommendedRoomSize : '-')
  
      // Compare Dimensions
      const productCompareDimensionContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_dimensions: '-')

      // Compare Weight
      const productCompareWeightContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_weight : '-')

      // Compare Weight
      const productCompareWifiContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_wifi : '-')

      // Specification Title
      const productSpecificationTitle = this._createCompareTitle()

      // Energy Consumption
      const productCompareEnergyConsumptionContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_energyConsumption : '-')

      // Sound Level
      const productCompareSoundLevelContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_soundlevel : '-')

      // Air Changes
      const productCompareAirChangesContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_airchanges : '-')

      // CleanAir Delivery Rate
      const productCompareCleanAirContainer = this._createCompareItem(" ")

      // Pollen
      const productComparePollenContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_CADR_pollen : '-')

      // Dust
      const productCompareDustContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_CADR_dust: '-')

      // Smoke
      const productCompareSmokeContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_CADR_smoke: '-')

      // Features
      const productFeaturesTitle = this._createCompareTitle()

      // Air Quality Sensors
      const productCompareAirQualitySensorContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_airSensor : '-')

      // Filter Replacement Indicator
      const productCompareFilterReplacementIndicatorContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.filter_replacement_indicator : '-')

      // On/Off Timer
      const productCompareOnOffTimerContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.on_off_timer : '-')

      // Speed Control Options
      const productCompareSpeedControlOptionsContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.blair_productSpecification_fanspeed : '-')

      // Wheels
      const productCompareWheelsContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.wheels : '-')

      // Max Room Size
      const productCompareMaxRoomSizeContainer = this._createCompareItem(product.productCompareInfo ? product.productCompareInfo.max_room_size: '-')

      // Adding Components to columnContainer
        // Overview
      columnContainer.appendChild(productTitleContainer)
      columnContainer.appendChild(productImageContainer)
      columnContainer.appendChild(productCompareAtcContainer)
      columnContainer.appendChild(productCompareTitleContainer)
      columnContainer.appendChild(productComparePriceContainer)
      columnContainer.appendChild(productCompareRoomSizeContainer)
      columnContainer.appendChild(productCompareDimensionContainer)
      columnContainer.appendChild(productCompareWeightContainer)
      columnContainer.appendChild(productCompareWifiContainer)

        // Specifications
      columnContainer.appendChild(productSpecificationTitle)
      columnContainer.appendChild(productCompareEnergyConsumptionContainer)
      columnContainer.appendChild(productCompareSoundLevelContainer)
      columnContainer.appendChild(productCompareAirChangesContainer)
      columnContainer.appendChild(productCompareCleanAirContainer)
      columnContainer.appendChild(productComparePollenContainer)
      columnContainer.appendChild(productCompareDustContainer)
      columnContainer.appendChild(productCompareSmokeContainer)

        // Features
      columnContainer.appendChild(productFeaturesTitle)
      columnContainer.appendChild(productCompareAirQualitySensorContainer)
      columnContainer.appendChild(productCompareFilterReplacementIndicatorContainer)
      columnContainer.appendChild(productCompareOnOffTimerContainer)
      columnContainer.appendChild(productCompareSpeedControlOptionsContainer)
      columnContainer.appendChild(productCompareWheelsContainer)
      columnContainer.appendChild(productCompareMaxRoomSizeContainer)

      // Append to the compare Grid

      this.insertBefore(columnContainer, this.additionalColumn)
    }

    _createCompareItem(data) {
      const compareItemContainer = document.createElement('li')
      compareItemContainer.classList.add('compare__item')
      const compareItem = document.createElement('p')
      compareItem.classList.add('p1')
      compareItem.textContent = data ? data : '-'
      compareItemContainer.appendChild(compareItem)
      return compareItemContainer
    }

    _createCompareTitle(title) {
      const compareItemTitleContainer = document.createElement('li')
      compareItemTitleContainer.classList.add('compare__title')
      const compareItemTitle = document.createElement('p')
      compareItemTitle.classList.add('s1')
      compareItemTitle.textContent = title? title : " "
      return compareItemTitleContainer
    }
  }