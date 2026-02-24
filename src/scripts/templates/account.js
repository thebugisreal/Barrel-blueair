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
      accountSubscribed: '[js-account-subscribed]',
      accountNotSubscribed: '[js-account-not-subscribed]',
      unsubscribeBtn: '[js-unsubscribe-btn]'
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
    this.accountSubscribed = this.querySelector(this._selectors.accountSubscribed);
    this.accountNotSubscribed = this.querySelector(this._selectors.accountNotSubscribed);
    this.unsubscribeBtn = this.querySelector(this._selectors.unsubscribeBtn);

    this._setupKlaviyoNewsletter();
    this._setupKlaviyoFormTrigger();
    this._setupCountries();
    this._setupEventListeners();
    this._saveJwtToken();
    this._openSectionFromUrl();
  }

  _openSectionFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (!section) return;

    const tabButton = this.querySelector(`[js-account-tab][aria-controls="${section}-content-panel"]`);
    const radioInput = document.getElementById(`AccountSection-${section}`);
    const targetPanel = this.querySelector(`#${section}-content-panel`);

    if (!tabButton || !targetPanel) return;

    // Desktop: check the radio input
    if (radioInput) {
      radioInput.checked = true;
    }

    // Update accordion header label (mobile)
    const displayLabel = tabButton.dataset.label || tabButton.textContent?.trim();
    if (this.accountLabel && displayLabel) {
      this.accountLabel.textContent = displayLabel;
    }

    // Show target panel, hide others
    this.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      panel.setAttribute('aria-hidden', panel.id === `${section}-content-panel` ? 'false' : 'true');
    });

    // Update tab aria-selected (mobile buttons)
    this.querySelectorAll('[js-account-tab][role="tab"]').forEach((tab) => {
      tab.setAttribute('aria-selected', tab.getAttribute('aria-controls') === `${section}-content-panel` ? 'true' : 'false');
    });

    // Trigger devices load when opening devices-warranty (warranty-devices listens for change event)
    if (section === 'devices-warranty' && radioInput) {
      setTimeout(() => radioInput.dispatchEvent(new Event('change', { bubbles: true })), 0);
    }
  }

  _saveJwtToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 12);
      document.cookie = `gigya_access_token=${token}; path=/; expires=${expirationDate.toUTCString()};`;
    }
  }

  async _setupKlaviyoNewsletter() {
    let customerEmail = this.dataset.customerEmail;
    let response = await fetch("https://us-central1-blueair-shopify.cloudfunctions.net/app/klaviyo/customer", {
      method: "POST",
      body: JSON.stringify({
        "email": customerEmail
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then(({ success, found }) => {
        if (!success) throw new Error('Failed to query klaviyo customer');

        if (found) {
          this.accountSubscribed?.classList.remove('hidden');
        } else {
          this.accountNotSubscribed?.classList.remove('hidden');
        }
      }).catch((err) => {
        console.log(err)
        this.accountNotSubscribed?.classList.remove('hidden');
      })
  }

  _setupKlaviyoFormTrigger() {
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

    if (this.editAddressModal) {
      this.editAddressModal.addEventListener('close', this._handleCloseEditAddress);
    }

    this.accountTabs.forEach((button) => {
      button.addEventListener('click', this._setAccountLabel);
    })

    this.returnButtons.forEach((button) => {
      button.addEventListener('click', this._returnToOrderHistory);
    })

    if (this.unsubscribeBtn) {
      this.unsubscribeBtn.addEventListener('click', this._handleUnsubscribeClick.bind(this))
    }

    document.addEventListener('click', this._closeAccountTriggerAccordion);
    window.addEventListener("klaviyoForms", this._handleKlaviyoEvents.bind(this));
  }

  _handleKlaviyoEvents(e) {
    if (e.detail.type == 'submit') {
      this.accountNotSubscribed?.classList.add('hidden');
      this.accountSubscribed?.classList.remove('hidden');
    }
  }

  _handleUnsubscribeClick(e) {
    e.preventDefault()
    let customerEmail = this.dataset.customerEmail;
    let response = fetch("https://us-central1-blueair-shopify.cloudfunctions.net/app/klaviyo/customer/unsubscribe", {
      method: "POST",
      body: JSON.stringify({
        "email": customerEmail
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then(({ success }) => {
        if (!success) throw new Error('Failed to query klaviyo customer');
        if (success) {
          this.accountNotSubscribed?.classList.remove('hidden');
          this.accountSubscribed?.classList.add('hidden');
        } else {
          this.accountNotSubscribed?.classList.add('hidden');
          this.accountSubscribed?.classList.remove('hidden');
        }
      }).catch((err) => {
        console.log(err)
        this.accountNotSubscribed?.classList.remove('hidden');
      })
  }

  _addOrders = async () => {
    const url = this.ordersPagination?.dataset?.url;
    if (!url) return;

    const parsedHTML = await this._getOrders(url);
    const ordersMobileEl = parsedHTML.querySelector(this._selectors.ordersContainerMobile);
    const newOrdersDesktop = parsedHTML.querySelectorAll(this._selectors.orderDesktop);
    const ordersTabsEl = parsedHTML.querySelector(this._selectors.ordersContainerTabs);
    const newPagination = parsedHTML.querySelector(this._selectors.ordersPagination);

    if (ordersMobileEl && this.ordersContainerMobile) {
      this.ordersContainerMobile.insertAdjacentHTML('beforeend', ordersMobileEl.innerHTML);
    }
    if (this.ordersContainerDesktop) {
      newOrdersDesktop.forEach(order => {
        this.ordersContainerDesktop.insertAdjacentHTML('beforeend', order.innerHTML);
      });
    }
    if (ordersTabsEl && this.ordersContainerTabs) {
      this.ordersContainerTabs.insertAdjacentHTML('beforeend', ordersTabsEl.innerHTML);
    }

    if (newPagination) {
      this.ordersPagination.dataset.url = newPagination.dataset.url;
    } else if (this.ordersPagination) {
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
    const editForm = document.querySelector('#address_form_' + formID);
    if (!editForm) return;

    editForm.classList.remove('hidden');
    this.editAddressModal?.open();
    const focusEl = editForm.querySelector('[name="address[first_name]"]');
    if (focusEl) focusEl.focus();
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
    if (this.accountLabel) this.accountLabel.innerHTML = label;
    this.accountTabs.forEach((button) => {
      if (button.dataset.label == label) {
        button.click();
      }
    });

    // Update URL with section param for reload persistence
    const ariaControls = e.currentTarget.getAttribute('aria-controls');
    if (ariaControls && ariaControls.endsWith('-content-panel')) {
      const section = ariaControls.replace(/-content-panel$/, '');
      const url = new URL(window.location.href);
      url.searchParams.set('section', section);
      window.history.replaceState({}, '', url);
    }
  }

  _closeAccountTriggerAccordion = (e) => {
    if (!this.accountTriggerAccordionHeader) return;
    if (this.accountTriggerAccordionHeader.contains(e.target)) {
      return;
    }

    if (this.accountTriggerAccordionHeader.getAttribute('aria-expanded') == 'false') {
      return;
    }

    this.accountTriggerAccordionHeader.click();
  }

  _returnToOrderHistory = (e) => {
    const label = document.querySelector('label[aria-controls="order-history-content-panel"]');
    if (label) label.click();
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
    const targetPanel = this.querySelector(`[id="${tabPanelToOpen}"]`);
    if (targetPanel) targetPanel.setAttribute('aria-hidden', 'false');
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
