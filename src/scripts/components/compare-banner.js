class CompareBanner extends HTMLElement {
    constructor() {
      super();
  
      this.selectors = {
        data: '[js-bundle-data]'
      }
    }
  
    connectedCallback() {
      this.initializeApp()
    }
  
    initializeApp() {
      const { createApp } = Vue;
      this.app = createApp(this.vueApp());
      this.app.mount(this);
    }
  
    /**
     * Returns vue app instance to be passed to create app
     */
    vueApp(data) {
      const { ref, computed, onBeforeMount, onBeforeUnmount, onMounted } = Vue;
      return {
        delimiters: ["${", "}"],
        setup: () => {
          // State =========================================
          const message = ref('Hello vue!')
          const porductsSelected = 0
  
          // export values to be used in template/html
          return {
            message,
            porductsSelected,
          }
        }
      }
    }

  }