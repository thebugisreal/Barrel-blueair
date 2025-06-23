class GigyaLogin extends HTMLElement {
  constructor() {
    super();
    
    this.selectors = {
      toggleLogin: '#toggleLogin',
      toggleRegister: '#toggleRegister',
      loginForm: '#loginForm',
      registerForm: '#registerForm',
      loginFormErrors: '#loginFormErrors',
      registrationFormErrors: '#formErrors',
      loginFormEl: '#customer_login',
      registrationFormEl: '#registrationForm'
    };

    this._xecurifyId = window.SHOPIFY_SETTINGS?.xecurify_id;
  }

  connectedCallback() {
    this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    this.toggleLoginBtn = document.querySelector(this.selectors.toggleLogin);
    this.toggleRegisterBtn = document.querySelector(this.selectors.toggleRegister);
    this.loginForm = document.querySelector(this.selectors.loginForm);
    this.registerForm = document.querySelector(this.selectors.registerForm);
    this.loginFormErrors = document.querySelector(this.selectors.loginFormErrors);
    this.registrationFormErrors = document.querySelector(this.selectors.registrationFormErrors);
    this.loginFormEl = document.querySelector(this.selectors.loginFormEl);
    this.registrationFormEl = document.querySelector(this.selectors.registrationFormEl);
  }

  bindEvents() {
    this.toggleLoginBtn?.addEventListener('click', () => this.toggleForms('login'));
    this.toggleRegisterBtn?.addEventListener('click', () => this.toggleForms('register'));
    this.loginFormEl?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    this.registrationFormEl?.addEventListener('submit', (e) => this.handleRegistrationSubmit(e));
  }

  toggleForms(view) {
    const showLogin = view === 'login';
    this.loginForm.style.display = showLogin ? 'block' : 'none';
    this.registerForm.style.display = showLogin ? 'none' : 'block';

    this.toggleLoginBtn.classList.toggle('border-b-2', showLogin);
    this.toggleLoginBtn.classList.toggle('border-blue', showLogin);
    this.toggleLoginBtn.classList.toggle('font-bold', showLogin);

    this.toggleRegisterBtn.classList.toggle('border-b-2', !showLogin);
    this.toggleRegisterBtn.classList.toggle('border-blue', !showLogin);
    this.toggleRegisterBtn.classList.toggle('font-bold', !showLogin);
  }

  handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('CustomerEmail')?.value;
    const password = document.getElementById('CustomerPassword')?.value;

    gigya.accounts.login({
      loginID: email,
      password,
      callback: (response) => {
        if (response.errorCode === 0) {
          gigya.accounts.getJWT({
            callback: (jwtResponse) => {
              if (jwtResponse.errorCode === 0) {
                const token = jwtResponse.id_token;
                const xecurifyId = this._xecurifyId;
                const shop = window.Shopify?.shop;

                if (xecurifyId && shop) {
                  window.location.href = `https://store.xecurify.com/moas/broker/login/jwt/callback/${xecurifyId}/jwt_H1X/${token}?relay=https://store.xecurify.com/moas/broker/login/shopify/${shop}/account`;
                } else {
                  // Fallback redirect
                  window.location.href = '/account';
                }
              }
            },
            fields: "email,profile",
            expiration: 3600
          });
        } else {
          if (this.loginFormErrors) {
            this.loginFormErrors.textContent = "Invalid email or password";
          } else {
            alert("Invalid email or password");
          }
        }
      }
    });
  }

  handleRegistrationSubmit(event) {
    event.preventDefault();
    this.registrationFormErrors.innerHTML = "";

    const formData = new FormData(event.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm_password");

    if (password !== confirmPassword) {
      this.registrationFormErrors.textContent = "Passwords do not match.";
      return;
    }

    if (!document.getElementById("over16").checked) {
      this.registrationFormErrors.textContent = "You must confirm that you are over 16 years old.";
      return;
    }

    const data = {
      loginID: formData.get("email"),
      password,
      email: formData.get("email"),
      profile: {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName")
      },
      preferences: {
        ageConsentGranted: { isConsentGranted: true },
        cookies: { isConsentGranted: true }
      }
    };

    this._performRegistration(data);
  }

  _performRegistration(data) {
    if (typeof gigya === 'undefined') {
      this._showError('Gigya service is not available');
      return;
    }

    gigya.accounts.initRegistration({
      callback: (response) => {
        if (response.errorCode === 0) {
          data.regToken = response.regToken;
          this._completeRegistration(data);
        } else if (response.validationErrors && response.validationErrors.length > 0) {
          this._handleValidationErrors(response.validationErrors);
        } else if (response.errorMessage) {
          this._showError(response.errorMessage);
        }
      },
    });
  }

  _completeRegistration(data) {
    gigya.accounts.register({
      ...data,
      ignoreInterruptions: true,
      finalizeRegistration: true,
      callback: (response) => {
        if (response.errorCode === 0) {
          this._onRegistrationSuccess();
        } else if (response.validationErrors && response.validationErrors.length > 0) {
          this._handleValidationErrors(response.validationErrors);
        } else if (response.errorMessage) {
          this._showError(response.errorMessage);
        }
      },
    });
  }

  _onRegistrationSuccess() {
    // Show success message
    if (this.registrationFormErrors) {
      this.registrationFormErrors.innerHTML = '<div class="text-green">User registered successfully</div>';
    } else {
      alert("User registered successfully");
    }

    // Get JWT and redirect
    this._getJWTAndRedirect();
  }

  _getJWTAndRedirect() {
    gigya.accounts.getJWT({
      callback: (response) => {
        if (response.errorCode === 0) {
          const token = response.id_token;
          const xecurifyId = this._xecurifyId;
          
          if (xecurifyId && window.Shopify?.shop) {
            window.location.href = `https://store.xecurify.com/moas/broker/login/jwt/callback/${xecurifyId}/jwt_H1X/${token}?relay=https://store.xecurify.com/moas/broker/login/shopify/${window.Shopify.shop}/account`;
          } else {
            // Fallback redirect
            window.location.href = '/account';
          }
        } else {
          this._showError('Authentication failed. Please try again.');
        }
      },
      fields: "email,profile",
      expiration: 3600
    });
  }

  _handleValidationErrors(validationErrors) {
    const userFields = ['password', 'email', 'firstName', 'lastName', 'confirm_password'];
    const hasPasswordError = validationErrors.some(err => err.fieldName === 'password');
    const errorList = [];

    if (hasPasswordError) {
      errorList.push(
        `<li>Password must be at least 10 characters, contain uppercase and lowercase letters, a number, and a special character.</li>`
      );
    }

    // Add other user field errors (excluding password)
    validationErrors
      .filter(err => userFields.includes(err.fieldName) && err.fieldName !== 'password')
      .forEach(err => {
        errorList.push(`<li>${err.message}</li>`);
      });

    if (errorList.length > 0) {
      if (this.registrationFormErrors) {
        this.registrationFormErrors.innerHTML = `<ul>${errorList.join('')}</ul>`;
      }
    } else {
      console.warn('Technical validation errors:', validationErrors);
      this._showError('An unknown error occurred. Please try again.');
    }
  }

  _showError(message) {
    if (this.registrationFormErrors) {
      this.registrationFormErrors.textContent = message;
    } else {
      alert(message);
    }
  }
} 