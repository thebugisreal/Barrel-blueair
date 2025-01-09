class Account extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      addressCountrySelect: '[js-country-select]',
      editAddressModal: '[js-edit-address-modal]',
      editAddressOpen: '[js-edit-address]',
      editAddressForm: '[js-edit-address-form]',
      deleteAddressButton: '[js-delete-address]',
      ordersContainerMobile: '[js-orders-mobile]',
      ordersContainerDesktop: '[js-orders-desktop]',
      ordersContainerTabs: '[js-orders-tabs]',
      ordersPagination: '[js-next-page]',
      orderMobile: '[js-order-mobile]',
      orderDesktop: '[js-order-desktop]',
      accountTriggerAccordionHeader: '[js-account-trigger-accoridon-header]',
      accountLabel: '[js-account-label]',
      accountTabsContainer: '[js-account-tabs-container]',
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
    this.ordersContainerMobile = this.querySelector(this._selectors.ordersContainerMobile);
    this.ordersContainerDesktop = this.querySelector(this._selectors.ordersContainerDesktop);
    this.ordersContainerTabs = this.querySelector(this._selectors.ordersContainerTabs);
    this.ordersPagination = this.querySelector(this._selectors.ordersPagination);
    this.accountTriggerAccordionHeader = this.querySelector(this._selectors.accountTriggerAccordionHeader);
    this.accountLabel = this.querySelector(this._selectors.accountLabel);
    this.accountTabsContainer = this.querySelector(this._selectors.accountTabsContainer);
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
    const newOrdersMobile = parsedHTML.querySelector(this._selectors.ordersContainerMobile).innerHTML;
    const newOrdersDesktop = parsedHTML.querySelector(this._selectors.ordersContainerDesktop).innerHTML;
    const newOrdersTabs = parsedHTML.querySelector(this._selectors.ordersContainerTabs).innerHTML;
    const newPagination = parsedHTML.querySelector(this._selectors.ordersPagination);

    this.ordersContainerMobile.insertAdjacentHTML('beforeend', newOrdersMobile);
    this.ordersContainerDesktop.insertAdjacentHTML('beforeend', newOrdersDesktop);
    this.ordersContainerTabs.insertAdjacentHTML('beforeend', newOrdersTabs);

    if (newPagination) {
      this.ordersPagination.dataset.url = newPagination.dataset.url;
    }else{
      this.ordersPagination.remove();
    }

    this.connectedCallback();

    this._elements = {
      tabs: this.querySelectorAll('[js-tab]')
    };

    this._tabEventListener();
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

  _tabEventListener = () => {
    const { tabs } = this._elements;
    tabs.forEach((tab) =>
      tab.addEventListener("click", this._showTabPanel)
    );
  }

  _showTabPanel = (el) => {
    const { tabs } = this._elements;
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute('aria-selected', 'false');
    }
    el.currentTarget.setAttribute('aria-selected', 'true');
    var tabPanelToOpen = el.currentTarget.getAttribute('aria-controls');
    var tabPanels = this.querySelectorAll('[role=tabpanel]');
    for (let i = 0; i < tabPanels.length; i++) {
      tabPanels[i].setAttribute('aria-hidden', 'true');
    }
    this.querySelector(`[id="${tabPanelToOpen}"]`).setAttribute('aria-hidden', 'false');
  }

  _tabListKeydown = (e) => {
    if (e.keyCode == 37) {
      $("[aria-selected=true]").prev().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 38) {
      $("[aria-selected=true]").prev().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 39) {
      $("[aria-selected=true]").next().click().focus();
      e.preventDefault();
    }
    if (e.keyCode == 40) {
      $("[aria-selected=true]").next().click().focus();
      e.preventDefault();
    }
  }
}
