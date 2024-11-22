
class ImageCaptionModal extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.selectors = {
        modalOpen:'[js-modal-open]',
        modalBody: '[js-modal-body]',
        modalClose: '[js-modal-close]'
      };

      this.modalOpen = this.querySelector(this.selectors.modalOpen)
      this.modalBody = this.querySelector(this.selectors.modalBody)
      this.modalClose = this.querySelector(this.selectors.modalClose)

      this._initEventListener()
    }
  
  
    _initEventListener = () => {
        this.modalClose.addEventListener('click', this._handleCloseClick.bind(this))
        this.modalOpen.addEventListener('click', this._handleOpenClick.bind(this))
        this.modalBody.addEventListener('transitionend', this._handleAnimationEnd.bind(this))
    }

    _handleOpenClick(e) {
        this.modalClose.classList.remove('hidden')
        this.modalOpen.classList.add('hidden')
        this.modalBody.classList.add('expanded')
    }

    _handleCloseClick(e) {
        this.modalBody.classList.remove('expanded')
    }

    _handleAnimationEnd(e) {
      this.modalOpen.classList.remove('hidden')
      this.modalClose.classList.add('hidden')
    }
  }