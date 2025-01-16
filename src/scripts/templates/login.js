class Login extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      login: '[js-login]'
    }
  }

  connectedCallback() {
    this.login = this.querySelector(this._selectors.login);
    this._setupEventListeners();

    this._waitForElement('.gigya-screen-dialog', (element) => {
      console.log('Element exists:', element);
    });
  }

  _setupEventListeners() {
    if (this.login) {
      this.login.click();
    }
  }

  _waitForElement(selector, callback) {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        callback(element);
      }
    }, 100);
  }
}
