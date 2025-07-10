class ProductCardUpsell extends HTMLElement {
    constructor() {
      super();
  
      this.changeEvent = new Event('change', { bubbles: true })
      this.selectors = {
        quickAdd: '[js-quick-add]'
      }
    }
  
    connectedCallback(){
      this.quickAdd = this.querySelectorAll(this.selectors.quickAdd);
      this.cart = document.querySelector('cart-drawer');
      this.cartDrawer = document.querySelector('#CartDrawer');

      this._initQuickAdd();
    }
  
    _initQuickAdd() {
      if ((this.quickAdd) != null) {
        this.quickAdd.forEach(button => {
          button.addEventListener('click', this._submitSingle.bind(this));
        });
      }
    }
    
    _submitSingle(e) {
      e.preventDefault();
      console.log('e.target', e.target);
      let variantId = e.target.dataset.variantId
      let data = {
        items: [{
          'id': variantId,
          'quantity': 1
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
        sessionStorage.setItem('noCartWatcherHandle', 'true');
        this.cart.renderContents(response);
        if (!window.location.pathname.includes('/cart')) this.cartDrawer.open();
        
      })
      .then((response) => {
        const cartMain = document.querySelector('cart-items')
        if (cartMain) cartMain.onCartUpdate()
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

class VariantCardUpsell extends ProductCardUpsell {
    constructor() {
        super();
        console.log('VariantCardUpsell constructor called');

        this.selectors = {
            swatch: '[js-product-card-swatch]',
            image: '[js-product-card-image]',
            soldOutTag: '[js-product-card-sold-out-tag]',
            productLink: '[js-product-link]',
            price: '[js-product-card-price]',
            currentSwatchLabel: '[js-product-card-current-swatch-label]',
            quickAdd: '[js-quick-add]'
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.swatches = this.querySelectorAll(this.selectors.swatch);
        this.soldOutTag = this.querySelector(this.selectors.soldOutTag);
        this.productLinks = this.querySelectorAll(this.selectors.productLink);
        this.price = this.querySelector(this.selectors.price);
        this.currentSwatchLabel = this.querySelector(this.selectors.currentSwatchLabel);
        this.moneyFormat = `${window.currency.symbol || "$"}{{amount}}`;

        this._setListeners();
    }

    _setListeners() {
        this.swatches.forEach(swatch => {
            swatch.addEventListener('click', this._swatchOnClick);
        });
    }

    _updateImage = (swatchName) => {
      const prevImage = this.querySelector(`${this.selectors.image}:not(.hidden)`);
      if (prevImage) prevImage.classList.add('hidden');
      const newImage = this.querySelector(`${this.selectors.image}[data-swatch="${swatchName}"]`);
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
      const currentPrice = parseFloat(price.split('|')[1]);
  
      let priceMarkup;
      if (compareAtPrice && compareAtPrice > currentPrice) {
        priceMarkup = `<s class="product-card__price product-card__price--compare">${theme.utils.formatMoney(compareAtPrice, this.moneyFormat)}</s>
                      <span class="product-card__price product-card__price--current">${theme.utils.formatMoney(currentPrice, this.moneyFormat)}</span>`;
      } else {
        priceMarkup = `<span class="product-card__price product-card__price--current">${theme.utils.formatMoney(currentPrice, this.moneyFormat)}</span>`;
      }
  
      this.price.innerHTML = priceMarkup;
    }

    _updateQuickAdd = (variantId) => {
      this.quickAdd.forEach(button => {
        button.dataset.variantId = variantId;
      });
    }
  
    _swatchOnClick = (e) => {
        e.preventDefault();

        const swatchTarget = e.currentTarget;
        
        if (swatchTarget.dataset.selected == 'true') {
          return;
        }
    
        const prevSelectedSwatch = this.querySelector(`${this.selectors.swatch}[data-selected="true"]`);
        if (prevSelectedSwatch) prevSelectedSwatch.dataset.selected = 'false';
        swatchTarget.dataset.selected = 'true';
    
        this.currentSwatchLabel.textContent = swatchTarget.dataset.swatch;
    
        this._updateImage(swatchTarget.dataset.swatch);
        this._toggleSoldOutTag(swatchTarget.dataset.available == 'true');
        this._updateProductLink(swatchTarget.dataset.url);
        this._updatePrice(swatchTarget.dataset.price);
        this._updateQuickAdd(swatchTarget.dataset.id);
    }
}
