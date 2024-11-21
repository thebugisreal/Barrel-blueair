
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
        console.log('this.modalOpen', this.modalOpen)
        console.log('this.modalBody', this.modalBody)
        console.log('this.modalClose', this.modalClose)
        this.modalClose.addEventListener('click', this._handleCloseClick.bind(this))
        this.modalOpen.addEventListener('click', this._handleOpenClick.bind(this))

    }

    _handleOpenClick(e) {
        this.modalClose.classList.remove('expanded')
        this.modalOpen.classList.add('hidden')
        this.modalBody.classList.add('expanded')
    }

    _handleCloseClick(e) {
        this.modalClose.classList.add('expanded')
        this.modalOpen.classList.remove('hidden')
        this.modalBody.classList.remove('expanded')
    }
  }