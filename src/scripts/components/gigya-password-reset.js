/**
  * Gigya Password Reset Component
  * --------------------------------------------------------------------
  * @summary Handles Gigya password reset functionality
  *
  * @usage
  *   <div js-gigya-password-reset>
  *     <form id="passwordResetForm" js-password-reset-submit>
  *       <input type="email" id="email" name="email" js-password-reset-email>
  *       <button type="submit">Send Reset Email</button>
  *     </form>
  *   </div>
  *
  * The following are selectors that the component searches for
  * [js-gigya-password-reset] - required
  * [js-password-reset-submit] - required
  * [js-password-reset-email] - required
*/

class GigyaPasswordReset extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      passwordResetSubmit: '[js-password-reset-submit]',
      passwordResetEmail: '[js-password-reset-email]'
    };
  }

  connectedCallback() {
    this._initializeElements();
    this._bindEvents();
  }

  _initializeElements() {
    // No specific elements to initialize for this component
  }

  _bindEvents() {
    const passwordResetForm = this.querySelector(this._selectors.passwordResetSubmit);
    if (passwordResetForm) {
      passwordResetForm.addEventListener('submit', this._handlePasswordResetSubmit.bind(this));
    }
  }

  _handlePasswordResetSubmit(event) {
    event.preventDefault();
    
    const email = this.querySelector(this._selectors.passwordResetEmail)?.value;

    if (!email) {
      this._showError('Please enter your email address');
      return;
    }

    this._performPasswordReset(email);
  }

  _performPasswordReset(email) {
    if (typeof gigya === 'undefined') {
      this._showError('Gigya service is not available');
      return;
    }

    gigya.accounts.resetPassword({
      loginID: email,
      lang: "en",
      callback: (response) => {
        if (response.errorCode === 0) {
          this._showSuccess("Password reset email sent successfully.");
        } else {
          this._showError("Error sending password reset email: " + response.errorMessage);
        }
      }
    });
  }

  _showSuccess(message) {
    // You can customize this to show success messages in a more user-friendly way
    alert(message);
  }

  _showError(message) {
    // You can customize this to show error messages in a more user-friendly way
    alert(message);
  }
} 