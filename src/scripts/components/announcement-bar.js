class AnnouncementBar extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this._selectors = {

      };
  
    }
  
    _setVariables = evt => {
        document.documentElement.style.setProperty('--announcement-height', `${this.clientHeight}px`)
    }

  
  }