class AnnouncementBar extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this._selectors = {
        closeBtn: '[js-close-announcement]'
      };

      this.closeBtn = this.querySelector(this._selectors.closeBtn)

      this.closeBtn.addEventListener('click', this._handleCloseClick.bind(this))
      
      this._init();
    }

    _init() {
        const hideAnnouncement = sessionStorage.getItem("hideAnnouncement");
        if (hideAnnouncement) {
            this.classList.add('hidden')
        } else {
            this.classList.remove('hidden')
        }
    }
    _handleCloseClick() {
        sessionStorage.setItem("hideAnnouncement", "true");
        this._init();
    }
  }