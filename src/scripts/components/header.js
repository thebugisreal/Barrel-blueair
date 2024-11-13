class SiteHeader extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      mobileNavDrawer: '#MobileNavDrawer',
      mobileSubnav: '[js-mobile-subnav]',
      mobileSubnavTrigger: '[js-mobile-subnav-trigger]',
      mobileSubnavClose: '[js-mobile-subnav-close]'
    }
  }

  connectedCallback() {
    this.mobileSubnavTriggers = document.querySelectorAll(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnavTrigger}`);
    this.mobileSubnavCloseBtns = document.querySelectorAll(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnavClose}`);

    this._setVariables();
    this._watchWindowResize();
    this.mobileSubnavTriggers.forEach((trigger) => {
      trigger.addEventListener('click', this._openMobileSubNav);
    });
    this.mobileSubnavCloseBtns.forEach((btn) => {
      btn.addEventListener('click', this._closeMobileSubNav);
    });
  }

  _closeMobileSubNav = (evt) => {
    const subnavTarget = evt.currentTarget.closest(this._selectors.mobileSubnav);
    subnavTarget.dataset.active = 'false';
  }

  _openMobileSubNav = (evt) => {
    const subnavTarget = document.querySelector(`${this._selectors.mobileNavDrawer} ${this._selectors.mobileSubnav}[id="${evt.currentTarget.dataset.target}"]`);
    subnavTarget.dataset.active = 'true';
  }

  _watchWindowResize = evt => {
    window.addEventListener('resize', this._setVariables)
  }

  _setVariables = evt => {
    document.documentElement.style.setProperty('--header-height', `${this.clientHeight}px`)
  }
}