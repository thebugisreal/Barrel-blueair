class ProductCardUpsell extends HTMLElement {
    constructor() {
      super();
  
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
