class Account extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      addressCountrySelect: '[js-country-select]',
      editAddressModal: '[js-edit-address-modal]',
      editAddressOpen: '[js-edit-address]',
      editAddressForm: '[js-edit-address-form]',
      deleteAddressButton: '[js-delete-address]',
      ordersContainer: '[js-orders]',
      ordersPagination: '[js-next-page]',
      order: '[js-order]',
      accountTriggerAccordionHeader: '[js-account-trigger-accoridon-header]',
      accountLabel: '[js-account-label]',
      accountTab: '[js-account-tab]',
      returnButton: '[js-return-button]',
      accountSubscription: '[js-account-subscription]'
    }
  }

  connectedCallback() {
    this.countrySelects = this.querySelectorAll(this._selectors.addressCountrySelect);
    this.editAddressModal = this.querySelector(this._selectors.editAddressModal);
    this.openEditAddress = this.querySelectorAll(this._selectors.editAddressOpen);
    this.editAddressForms = this.querySelectorAll(this._selectors.editAddressForm);
    this.deleteAddressButtons = this.querySelectorAll(this._selectors.deleteAddressButton);
    this.ordersContainer = this.querySelector(this._selectors.ordersContainer);
    this.ordersPagination = this.querySelector(this._selectors.ordersPagination);
    this.accountTriggerAccordionHeader = this.querySelector(this._selectors.accountTriggerAccordionHeader);
    this.accountLabel = this.querySelector(this._selectors.accountLabel);
    this.accountTabs = this.querySelectorAll(this._selectors.accountTab);
    this.returnButtons = this.querySelectorAll(this._selectors.returnButton);

    this._setupKlaviyo();
    this._setupCountries();
    this._setupEventListeners();
  }

  _setupKlaviyo() {
    if (this.querySelector('.klaviyo_form_trigger')) {
      this.querySelector('.klaviyo_form_trigger').addEventListener('click', function () {
        window._klOnsite = window._klOnsite || [];
        window._klOnsite.push(['openForm', 'UhyuJV']);
      });
    }

    // const options = {
    //   method: 'GET',
    //   headers: {
    //     accept: 'application/vnd.api+json',
    //     revision: '2024-10-15',
    //     Authorization: 'Klaviyo-API-Key your-private-api-key'
    //   }
    // };

    // fetch('https://a.klaviyo.com/api/profiles?filter=equals(email,"don@seedcms.com")', options)
    //   .then(res => res.json())
    //   .then(res => console.log(res))
    //   .catch(err => console.error(err));

  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
      this.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
        });
      });
    }
  }

  _setupEventListeners() {
    if (this.ordersPagination) {
      this.ordersPagination.addEventListener('click', this._addOrders);  
    }

    this.openEditAddress.forEach((button) => {
      button.addEventListener('click', this._handleOpenEditAddress);
    });

    this.deleteAddressButtons.forEach((button) => {
      button.addEventListener('click', this._handleDeleteAddress);
    })

    this.editAddressModal.addEventListener('close', this._handleCloseEditAddress);

    this.accountTabs.forEach((button) => {
      button.addEventListener('click', this._setAccountLabel);
    })

    this.returnButtons.forEach((button) => {
      button.addEventListener('click', this._returnToOrderHistory);
    })   

    document.addEventListener('click', this._closeAccountTriggerAccordion);
  }

  _addOrders = async () => {
    const url = this.ordersPagination.dataset.url;
    const parsedHTML = await this._getOrders(url);
    const newOrders = parsedHTML.querySelector(this._selectors.ordersContainer).innerHTML;
    const newPagination = parsedHTML.querySelector(this._selectors.ordersPagination);

    this.ordersContainer.insertAdjacentHTML('beforeend', newOrders)

    if (newPagination) {
      this.ordersPagination.dataset.url = newPagination.dataset.url;
    }else{
      this.ordersPagination.remove();
    }

    this.ordersContainer.connectedCallback();
  }

  _getOrders(url) {
    return fetch(url)
      .then(response => response.text())
      .then((text) => {
        const html = text;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        return parsedHTML;
      })
  }

  _handleOpenEditAddress = (e) => {
    e.stopPropagation();
    const formID = e.currentTarget.dataset.form;
    const editForm = document.querySelector('#address_form_'+ formID)
    editForm.classList.remove('hidden');
    this.editAddressModal.open();
    editForm.querySelector('[name="address[first_name]"]').focus();
  }

  _handleDeleteAddress = (e) => {
    const form = e.currentTarget.dataset.target;
    if (confirm('Are you sure you want to delete this address?')) {
      Shopify.postLink(form, {
        parameters: { _method: 'delete' },
      });
    }
  }

  _handleCloseEditAddress = (e) => {
    this.editAddressForms.forEach((form) => {
      form.classList.add('hidden')
    });
  }

  _setAccountLabel = (e) => {
    let label = e.currentTarget.dataset.label;
    this.accountLabel.innerHTML = label;
    this.accountTabs.forEach((button) => {
      if (button.dataset.label == label) {
        button.click();
      }
    })

  }

  _closeAccountTriggerAccordion = (e) => {
    if (this.accountTriggerAccordionHeader.contains(e.currentTarget)) {
      return;
    }

    if (this.accountTriggerAccordionHeader.getAttribute('aria-expanded') == 'false') {
      return;
    }

    this.accountTriggerAccordionHeader.click();
  }

  _returnToOrderHistory = (e) => {
    document.querySelector('label[aria-controls="order-history-content-panel"]').click();
  }
}
