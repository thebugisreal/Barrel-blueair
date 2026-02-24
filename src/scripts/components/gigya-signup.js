/**
  * Gigya Signup Component
  * --------------------------------------------------------------------
  * @summary Handles Gigya registration functionality with form validation and user registration
  *
  * @usage
  *   <div js-gigya-signup>
  *     <div id="formErrors" js-signup-errors></div>
  *     <form id="registrationForm" js-signup-submit>
  *       <input type="email" id="email" name="email" js-signup-email>
  *       <input type="text" id="firstName" name="firstName" js-signup-firstname>
  *       <input type="text" id="lastName" name="lastName" js-signup-lastname>
  *       <input type="password" id="reg_password" name="password" js-signup-password>
  *       <input type="password" id="reg_confirm_password" name="confirm_password" js-signup-confirm-password>
  *       <input type="checkbox" id="over16" name="over16" js-signup-age-consent>
  *       <input type="checkbox" id="blueairUpdates" name="blueairUpdates" js-signup-blueair-updates>
  *       <input type="checkbox" id="unileverConsent" name="unileverConsent" js-signup-unilever-consent>
  *       <button type="submit">Register</button>
  *     </form>
  *   </div>
  *
  * The following are selectors that the component searches for
  * [js-gigya-signup] - required
  * [js-signup-submit] - required
  * [js-signup-email] - required
  * [js-signup-firstname] - required
  * [js-signup-lastname] - required
  * [js-signup-password] - required
  * [js-signup-confirm-password] - required
  * [js-signup-age-consent] - required
  * [js-signup-blueair-updates] - optional
  * [js-signup-unilever-consent] - optional
  * [js-signup-errors] - required
*/

class GigyaSignup extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      signupSubmit: '[js-signup-submit]',
      signupEmail: '[js-signup-email]',
      signupFirstname: '[js-signup-firstname]',
      signupLastname: '[js-signup-lastname]',
      signupPassword: '[js-signup-password]',
      signupConfirmPassword: '[js-signup-confirm-password]',
      signupAgeConsent: '[js-signup-age-consent]',
      signupBlueairUpdates: '[js-signup-blueair-updates]',
      signupUnileverConsent: '[js-signup-unilever-consent]',
      signupErrors: '[js-signup-errors]'
    };

    this._xecurifyId = window.Shopify?.settings?.xecurify_id;
  }

  connectedCallback() {
    this._initializeElements();
    this._bindEvents();
  }

  _initializeElements() {
    this.signupErrors = this.querySelector(this._selectors.signupErrors);
  }

  _bindEvents() {
    const signupSubmitForm = this.querySelector(this._selectors.signupSubmit);
    if (signupSubmitForm) {
      signupSubmitForm.addEventListener('submit', this._handleSignupSubmit.bind(this));
    }
  }

  _handleSignupSubmit(event) {
    event.preventDefault();
    
    if (this.signupErrors) {
      this.signupErrors.innerHTML = "";
    }

    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');

    // Validate passwords match
    if (password !== confirmPassword) {
      this._showError('Passwords do not match.');
      return;
    }

    // Validate age consent
    const ageConsentCheckbox = this.querySelector(this._selectors.signupAgeConsent);
    if (!ageConsentCheckbox?.checked) {
      this._showError('You must confirm that you are over 16 years old.');
      return;
    }

    const data = {
      loginID: formData.get('email'),
      password: password,
      email: formData.get('email'),
      profile: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        address: formData.get('address'),
      },
      preferences: {
        ageConsentGranted: { isConsentGranted: ageConsentCheckbox.checked },
        cookies: { isConsentGranted: true },
      },
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
    if (this.signupErrors) {
      this.signupErrors.innerHTML = '<div class="text-green">User registered successfully</div>';
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
      if (this.signupErrors) {
        this.signupErrors.innerHTML = `<ul>${errorList.join('')}</ul>`;
      }
    } else {
      console.warn('Technical validation errors:', validationErrors);
      this._showError('An unknown error occurred. Please try again.');
    }
  }

  _showError(message) {
    if (this.signupErrors) {
      this.signupErrors.textContent = message;
    } else {
      alert(message);
    }
  }
} 