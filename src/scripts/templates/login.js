class Login extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      login: '[js-login]'
    }
  }

  connectedCallback() {
    this.login = this.querySelector(this._selectors.login);
  }
}

export default Login;
