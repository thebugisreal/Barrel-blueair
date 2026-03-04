class ProductViewer extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        imageContainer: '[js-360-image-container]',
        imageJSON: '[js-product-viewer-image-json]'
      }

      this.states = {
        dragging: false,
        index: 0,
        animateInterval: null,
        pressMouseX: null,
        pressIndex: 0,
        difference: 0
      }
    }

    connectedCallback() {
      this.imageContainer = this.querySelector(this.selectors.imageContainer)
      if (this.querySelector(this.selectors.imageJSON)) {
        this.productViewerJSON = JSON.parse(this.querySelector(this.selectors.imageJSON).innerHTML)
      }

      this._setListeners();
      this._initProductViewer()
    }

    _setListeners() {
        this.addEventListener('mousedown', this._handleOnPress.bind(this), false)
        this.addEventListener('touchstart', this._handleOnPress.bind(this), false)
        document.addEventListener('mouseup', this._handleOnRelease.bind(this), false)
        document.addEventListener('touchend', this._handleOnRelease.bind(this), false)
        document.addEventListener('mousemove', this._handleOnMove.bind(this), false)
        document.addEventListener('touchmove', this._handleOnMove.bind(this), false)
    }

    _initProductViewer() {
        // Set the initial Image
        this._createImage(this.productViewerJSON.image_urls[0], 0)
        this.states.index = 0
    }

    // Event handlets
    _handleOnPress(e) {
        e.preventDefault()
        this.states.dragging = true;

        this.classList.add('product-viewer--js-press-active')
        this.states.pressMouseX = this._getPageXByEvent(e)
        this.states.pressIndex = this.imageContainer.querySelector('img').dataset.pressedIndex
    }

    _handleOnRelease(e) {
        this.states.dragging = false;
        this.states.pressMouseX = null
        this.classList.remove('product-viewer--js-press-active')
    }

    _handleOnMove(e) {
        if (!this.states.dragging) return true
        const offsetX = this._getPageXByEvent(e) - (this.states.pressMouseX || 0)
        const indexPerPixel = this.productViewerJSON.image_urls.length / this.offsetWidth
        let offsetIndex = Math.round(offsetX * indexPerPixel)
        let newIndex = this._mod((Number(this.states.pressIndex) + offsetIndex), this.productViewerJSON.image_urls.length)

        newIndex = newIndex < 0 ? this.productViewerJSON.image_urls.length - Math.abs(newIndex) : newIndex
        const difference = Math.abs(this.states.index - newIndex)
        if (this.states.index != newIndex && (difference == 1 || difference == (this.productViewerJSON.image_urls.length - 1)) ) {
          this._updateIndex(newIndex)
        }
    }

    // Helper Functions

    _createImage(src, pressedIndex) {
        const newImage = document.createElement('img')
        newImage.src = src
        newImage.dataset.pressedIndex = Number(pressedIndex)
        newImage.classList.add('product-viewer__image')
        this.imageContainer.appendChild(newImage)
    }

    _getPageXByEvent(e) {
        return !!e.touches ? e.touches[0].pageX : e.pageX
    }

    _updateIndex(index) {
        if (this.states.pressIndex === index) return false
        if (index == this.productViewerJSON.image_urls.length ) {
            index = 0
        }
        this.states.index = index
        const image = this.imageContainer.querySelector('img')
        image.dataset.pressedIndex = index
        image.src = this.productViewerJSON.image_urls[Number(index)]
    }

    _mod = function (n, m) {
        var remain = n % m;
        return Math.floor(remain >= 0 ? remain : remain + m);
    };

  }

export default ProductViewer;