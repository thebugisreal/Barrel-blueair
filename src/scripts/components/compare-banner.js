class CompareBanner extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        removeAll: '[js-remove-all]'
      }
    }

    connectedCallback() {
      this.initializeApp()
    }

    initializeApp() {
      const { createApp } = Vue;
      let compareProductArray = sessionStorage.getItem('compareProductArray');
      compareProductArray = JSON.parse(compareProductArray)
      this.app = createApp(this.vueApp(compareProductArray));

      this.app.mount(this);
    }
    /**
     * Returns vue app instance to be passed to create app
     */
    vueApp() {
        const { ref, computed, onBeforeMount, onBeforeUnmount, onMounted } = Vue;

        return {
            delimiters: ["${", "}"],
            setup: () => {
            // State =========================================
            const productsSelected = ref(0)
            const products = ref(0)

            // Life Cycle Hooks
            onBeforeMount(() => {
                _initCompareProducts()
                window.addEventListener("seed:compare:itemchange", _handleItemChange.bind(this));
            })

            onMounted(() => {
            })

            onBeforeUnmount(() => {
                window.removeEventListener("seed:compare:itemchange", _handleItemChange.bind(this));
            })

            // Methods

            function onRemove(e) {
                let compareProductArray
                if (sessionStorage.getItem('compareProductArray')) {
                  compareProductArray = sessionStorage.getItem('compareProductArray');
                  compareProductArray = JSON.parse(compareProductArray)
                } else {
                  compareProductArray = [];
                }

                for (let i = 0; i < compareProductArray.length ; i++ ) {
                    if (compareProductArray[i].id == e.currentTarget.dataset.productId) {
                      compareProductArray.splice(i, 1)
                    }
                  }

                // Uncheck Product Card
                const compareProductInput = document.querySelectorAll('[js-product-compare-checkbox]')
                for ( let i = 0; i < compareProductInput.length; i++ ) {
                    if (compareProductInput[i].dataset.productId == e.currentTarget.dataset.productId) {
                        compareProductInput[i].checked = false
                    }
                }


                sessionStorage.setItem("compareProductArray", JSON.stringify(compareProductArray));
                window.dispatchEvent(new CustomEvent("seed:compare:itemchange", {
                    detail: { compareProductArray }
                }))
            }

            function _handleItemChange(e) {
                productsSelected.value = e.detail.compareProductArray.length
                products.value = e.detail.compareProductArray
            };

            // Other Functions
            function _initCompareProducts() {
                let compareProductArray
                if (sessionStorage.getItem('compareProductArray')) {
                    compareProductArray = sessionStorage.getItem('compareProductArray');
                    compareProductArray = JSON.parse(compareProductArray)
                } else {
                    compareProductArray = [];
                }

                productsSelected.value = compareProductArray.length
                products.value = compareProductArray
            }

            function removeAll() {
              const compareProductArray = []
              sessionStorage.setItem("compareProductArray", JSON.stringify(compareProductArray));
              window.dispatchEvent(new CustomEvent("seed:compare:itemchange", {
                  detail: { compareProductArray }
              }))
            }

            // export values to be used in template/html
            return {
                productsSelected,
                products,
                onRemove,
                removeAll
            }
          }
        }
    }
  }

export default CompareBanner;