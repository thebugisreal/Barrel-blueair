
class ImageCaptionModal extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.selectors = {
        modalOpen:'[js-modal-open]',
        modalBody: '[js-modal-body]',
        modalClose: '[js-modal-close]',
        imageContainer: '[js-image-container]'
      };

      this.modalOpen = this.querySelector(this.selectors.modalOpen)
      this.modalBody = this.querySelector(this.selectors.modalBody)
      this.modalClose = this.querySelector(this.selectors.modalClose)

      this._initEventListener()
    }
  
  
    _initEventListener = () => {
      this.modalClose.addEventListener('click', this._handleCloseClick.bind(this))
      this.modalOpen.addEventListener('click', this._handleOpenClick.bind(this))
      this.style.width='168px';
      this.style.height='48px';
    }

    _handleOpenClick(e) {
  
      this.modalBody.classList.add('fadeIn')
      this.modalBody.classList.remove('fadeOut')

      this.modalClose.classList.remove('fadeOut')
      this.modalClose.classList.add('fadeIn')
      this.modalClose.classList.remove('hidden')

      this.modalOpen.classList.add('fadeOut')
      this.modalOpen.classList.remove('fadeIn')

      if (window.innerWidth > 1025) {
        this.style.width='250px';
        this.style.height='318px';
      } else {
        let closestImageContainer = this.parentElement.parentElement
        let width =  closestImageContainer.getBoundingClientRect().width - 48
        this.style.width=`${width}px`;
        this.style.height='auto';
      }
    }

    _handleCloseClick(e) {
      this.modalBody.classList.remove('fadeIn')
      this.modalBody.classList.add('fadeOut')

      this.modalOpen.classList.remove('fadeOut')
      this.modalOpen.classList.add('fadeIn')

      this.modalClose.classList.add('fadeOut')
      this.modalClose.classList.remove('fadeIn')
      this.modalClose.classList.add('hidden')

      this.style.width='168px';
      this.style.height='48px';
    }
  }