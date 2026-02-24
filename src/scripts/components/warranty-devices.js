function formatWarrantyErrorMessage(apiMessage) {
  if (/serial number/i.test(apiMessage)) {
    return "Please enter a valid serial number";
  }
  if (/dateofpurchase.*within the last 3 years/i.test(apiMessage) || /date of purchase.*within the last 3 years/i.test(apiMessage)) {
    return "Date of Purchase must be within the last 3 years";
  }
  return apiMessage.charAt(0).toUpperCase() + apiMessage.slice(1);
}

class WarrantyDevices extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      getDeviceButton: '[js-register-device]',
      toggleWarrantyForm: '[js-toggle-warranty-form]',
      warrantyForm: '[js-device-warranty-form]',
      cancelButton: '[js-cancel-warranty-form]',
      successMessage: '.warranty-success-message',
      familySelect: '#unit-family',
      serialNumberInput: '#serial-number',
      modelSelect: '#unit-model',
      saveButton: '#warranty-save-btn',
      spinner: '#warranty-save-spinner',
      serialNumberError: '#serial-number-error',
      formContainer: '[js-device-warranty-wrapper]'
    }

    this.warrantyAPI = new WarrantyAPI();

    /* Selectors */
    this.formContainer = this.querySelector(this._selectors.formContainer);

    /* Form Elements */
    this.unitFamilySelect = this.querySelector(this._selectors.familySelect);
    this.unitModelSelect = this.querySelector(this._selectors.modelSelect);
    this.form = this.querySelector(this._selectors.warrantyForm);
    this.serialNumberInput = this.querySelector(this._selectors.serialNumberInput);
    this.serialNumberError = this.querySelector(this._selectors.serialNumberError);

    /* Buttons */
    this.saveBtn = this.querySelector(this._selectors.saveButton);
    this.spinner = this.querySelector(this._selectors.spinner);
    this.toggleBtns = this.querySelectorAll(this._selectors.toggleWarrantyForm);

    /* Script Data */
    const familiesEl = document.getElementById('warranty-unit-families');
    this.families = familiesEl ? JSON.parse(familiesEl.textContent || '[]') : [];
  }

  connectedCallback() {
    this._cancelButton();
    this._dateFormatter();
    this._setupCalendarPicker();
    this._initListeners();

    this._productImageLookup = {};
    this.querySelectorAll('#unit-model option[data-image][value]').forEach(opt => {
      this._productImageLookup[opt.value] = opt.getAttribute('data-image');
    });
  }

  _initListeners() {
    if (!this.form || !this.unitFamilySelect || !this.unitModelSelect) {
      return;
    }

    this.form.addEventListener('submit', this._formSubmitHandler.bind(this));
    this.form.addEventListener('change', this._formChangeHandler.bind(this));
    this.form.addEventListener('input', this._formChangeHandler.bind(this));

    const tabInput = document.querySelector('input[value="devices-warranty"]');
    if (tabInput) {
      tabInput.addEventListener('change', this._tabChangeHandler.bind(this));
    }
    this.toggleBtns.forEach(btn => btn.addEventListener('click', this._toggleWarrantyForm.bind(this)));

    const debouncedSerialHandler = theme.utils.debounce((evt) => {
      this._serialNumberInputHandler(evt);
    }, 500);

    if (this.serialNumberInput) {
      this.serialNumberInput.addEventListener('input', debouncedSerialHandler);
    }
  }

  async _serialNumberInputHandler(evt) {
    const serialNumber = evt.target.value.trim();
    
    if (!serialNumber || serialNumber.length < 6) {
      if (this.unitFamilySelect) this.unitFamilySelect.value = '';
      if (this.unitModelSelect) this.unitModelSelect.value = '';
      if (this.serialNumberError) {
        this.serialNumberError.textContent = "";
        this.serialNumberError.classList.add('hidden');
      }
      this._formChangeHandler();
      return;
    }

    try {
      const result = await this.warrantyAPI.lookupDeviceModel(serialNumber);

      if (!result.success || !result.payload) {
        if (this.serialNumberError) {
          this.serialNumberError.textContent = "The serial number you entered is not valid.";
          this.serialNumberError.classList.remove('hidden');
        }
        this.unitFamilySelect.value = '';
        this.unitModelSelect.value = '';
        this._formChangeHandler();
        return;
      }

      const { family: familyName, series: seriesName } = result.payload;

      if (this.serialNumberError) {
        this.serialNumberError.textContent = "";
        this.serialNumberError.classList.add('hidden');
      }

      // Set the family and model inputs
      this.unitFamilySelect.value = familyName;
      this.unitModelSelect.value = seriesName;
      this._formChangeHandler();
    } catch (error) {
      console.error('Error looking up device model:', error);
      this.unitFamilySelect.value = '';
      this.unitModelSelect.value = '';
      this._formChangeHandler();
    }
  }

  _formChangeHandler() {
    if (!this.form || !this.saveBtn) return;

    const requiredFields = this.form.querySelectorAll('[required]');
    const allFilled = Array.from(requiredFields).every(field => {
      if (field.tagName === 'SELECT') {
        return field.value && field.value !== '';
      }
      return field.value.trim() !== '';
    });

    this.saveBtn.disabled = !allFilled;
    if (allFilled) {
      this.saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      this.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  _parseDateOfPurchase(value) {
    if (!value || typeof value !== 'string') return null;
    const parts = value.trim().split(/[/-]/);
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year) || month < 0 || month > 11) return null;
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return date;
  }

  _isDateInFuture(date) {
    if (!date || !(date instanceof Date)) return false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return date.getTime() > todayStart.getTime();
  }

  async _formSubmitHandler(evt) {
    evt.preventDefault();

    const dateInput = this.form.querySelector('input[name="dateOfPurchase"]');
    const dateValue = dateInput?.value?.trim();
    if (dateValue) {
      const purchaseDate = this._parseDateOfPurchase(dateValue);
      if (purchaseDate && this._isDateInFuture(purchaseDate)) {
        this._showErrorMessage('Date of purchase cannot be in the future.');
        return;
      }
    }

    this.saveBtn.disabled = true;
    this.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
    this.spinner.setAttribute('loading', '');

    const formData = new FormData(this.form)
    const result = await this.warrantyAPI.registerDevice(Object.fromEntries(formData));

    if (result.success) {
      this._showSuccessDeviceRegistration(result.payload);
      this.form.reset();
    } else {
      this._showErrorMessage(formatWarrantyErrorMessage(result.error));
    }

    // Reset button state
    this.saveBtn.disabled = false;
    this.saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    this.spinner.removeAttribute('loading');
  }

  _tabChangeHandler = (evt) => {
    if (evt.target.checked) {
      this._renderDevices(true);
    }
  }

  _toggleWarrantyForm = () => {
    this.formContainer.classList.toggle('hidden');
    const newlyRegistered = this.querySelector('[js-newly-registered-devices]');
    if (newlyRegistered && !this.formContainer.classList.contains('hidden')) {
      newlyRegistered.classList.add('hidden');
    }
    if (!this.formContainer.classList.contains('hidden')) {
      const formEl = document.getElementById('warranty-device-form');
      if (formEl) {
        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 68;
        const top = formEl.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }

  _registeredDevicesHeaderHTML = () => `
    <h4 class="text-26 font-400 leading-[32px] text-center min-h-[50px] flex items-center desktop:mt-0 desktop:text-left desktop:justify-start">
      Registered devices
    </h4>
  `;

  _renderDevices = async (showLoading = false) => {
    const container = this.querySelector('.device-card-content');
    if (!container) {
      console.warn('No .device-card-content found in DOM');
      return;
    }
    if (showLoading) {
      container.innerHTML = this._registeredDevicesHeaderHTML() + '<p>Loading your devices...</p>';
    }

    const result = await this.warrantyAPI.getDevices();

    if (!result.success) {
      console.error('Failed to load devices:', result.error);
      container.innerHTML = this._registeredDevicesHeaderHTML() + `
        <div class="account-content block">
          <div class="account__rte h-full p2 bg-[#D6E4F3] text-[#002955]">
            Failed to load devices, please contact support if the problem persists.
          </div>
        </div>
      `;
      return;
    }

    const devices = result.payload;
    if (!devices || !devices.length) {
      container.innerHTML = this._registeredDevicesHeaderHTML() + '<p class="account__rte h-full p2">No devices registered yet.</p>';
      return;
    }

    container.innerHTML = this._registeredDevicesHeaderHTML() + devices.map(device => this._deviceCardHTML(device)).join('');

    const filterSubscriptionHTML = `
    <div class="w-full mt-24 pt-16">
      <a href="https://www.blueair.com/pages/subscribe-quiz" class="inline-flex items-center underline text-16 font-400 leading-[26px] text-blue hover:opacity-80">Add a filter subscription</a>
    </div>
    `
    container.innerHTML += filterSubscriptionHTML;
  }

  _deviceCardHTML(device) {
    let familyGid = device.family;
    const handle = window.collectionGidToHandle?.[familyGid];
    const displayName = (device.name && device.name.trim()) ? device.name.trim() : this._handleToTitle(handle);
    const unitFamily = (typeof device.family === 'string' && !device.family.startsWith('gid://'))
      ? device.family
      : (this.families?.find(f => f.collection === device.family)?.name || '');

    return `
      <div class="device-card mt-md grid gap-md border border-[#D6E4F3] rounded-[5px] p-xxs desktop:p-sm">
        <div class="account-content">
          <div class="my-devices-content flex justify-between p-sm bg-white w-full max-w-full">
            <!-- Details column -->
            <div class="flex flex-col my-auto">
              <div class="device-card__title-container flex flex-col gap-4 mb-md">
                <h3 class="device-card__title text-22 font-400 leading-[28px] font-gilroy">
                  ${displayName}
                </h3>
                <p class="text-14 font-400 leading-[22px] font-gilroy">${unitFamily}</p>
              </div>
              <div class="device-card__serial-number flex flex-col gap-4 mb-md">
                <h3 class="device-card__serial-number text-22 font-400 leading-[28px] font-gilroy">Serial number</h3>
                <p class="text-14 font-400 leading-[22px] font-gilroy">${device.sn}</p>
              </div>
              <div class="device-card__purchase-date flex flex-col gap-4">
                <h3 class="device-card__purchase-date text-22 font-400 leading-[28px] font-gilroy">Date of purchase</h3>
                <p class="text-14 font-400 leading-[22px] font-gilroy">${device.dateOfPurchase || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _formatSerialNumber(sn) {
    if (!sn) return '';
    return sn.slice(0, 6) + 'xxxxxx';
  }

  _handleToTitle(handle) {
    if (!handle || typeof handle !== 'string') return '';
    return handle
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  _cancelButton = () => {
    const cancelBtn = this.querySelector(this._selectors.cancelButton);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const form = this.querySelector(this._selectors.warrantyForm);
        const formContainer = this.querySelector(this._selectors.formContainer);
        if (form) {
          form.reset();
        }
        if (formContainer) {
          formContainer.classList.add('hidden');
        }
      });
    }
  }

  _dateFormatter = () => {
    const dateInput = this.querySelector('input[name="purchase_date"]');
    if (dateInput) {
      dateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length >= 4) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
        } else if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
      });
    }
  }

  _setupCalendarPicker = () => {
    const dateInput = this.querySelector('input[name="dateOfPurchase"]');
    const calendarBtn = this.querySelector('[js-calendar-picker]');

    if (!dateInput || !calendarBtn) return;

    let calendarOpen = false;
    let currentDate = new Date();
    let selectedDate = null;

    const createCalendar = () => {
      const calendar = document.createElement('div');
      calendar.className = 'calendar-picker absolute top-full left-0 mt-1 bg-white border border-[#D6E4F3] rounded-lg shadow-lg z-50 p-3 min-w-[280px]';
      calendar.style.display = 'none';

      const header = document.createElement('div');
      header.className = 'flex justify-between items-center mb-3';

      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '‹';
      prevBtn.className = 'text-[#002D72] hover:bg-[#D6E4F3] rounded p-1 text-lg font-bold';
      prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });

      const monthYear = document.createElement('span');
      monthYear.className = 'text-[#002D72] font-medium';

      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '›';
      nextBtn.className = 'text-[#002D72] hover:bg-[#D6E4F3] rounded p-1 text-lg font-bold';
      nextBtn.type = 'button';
      nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });

      header.appendChild(prevBtn);
      header.appendChild(monthYear);
      header.appendChild(nextBtn);

      const weekdays = document.createElement('div');
      weekdays.className = 'grid grid-cols-7 gap-1 mb-2';
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'text-center text-sm text-[#002D72] font-medium p-1';
        dayEl.textContent = day;
        weekdays.appendChild(dayEl);
      });

      const daysGrid = document.createElement('div');
      daysGrid.className = 'grid grid-cols-7 gap-1';

      calendar.appendChild(header);
      calendar.appendChild(weekdays);
      calendar.appendChild(daysGrid);

      return { calendar, monthYear, daysGrid, nextBtn };
    };

    const renderCalendar = () => {
      const { calendar, monthYear, daysGrid, nextBtn } = calendarElements;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const today = new Date();
      const isViewingCurrentOrFutureMonth =
        year > today.getFullYear() ||
        (year === today.getFullYear() && month >= today.getMonth());

      nextBtn.disabled = isViewingCurrentOrFutureMonth;
      nextBtn.classList.toggle('opacity-50', isViewingCurrentOrFutureMonth);
      nextBtn.classList.toggle('cursor-not-allowed', isViewingCurrentOrFutureMonth);
      nextBtn.style.pointerEvents = isViewingCurrentOrFutureMonth ? 'none' : '';

      monthYear.textContent = `${new Date(year, month).toLocaleDateString('en-US', { month: 'long' })} ${year}`;

      daysGrid.innerHTML = '';

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayEl = document.createElement('button');
        dayEl.className = 'p-2 text-sm rounded hover:bg-[#D6E4F3] transition-colors';

        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isDisabled = date < threeYearsAgo || date > today;

        if (!isCurrentMonth) {
          dayEl.className += ' text-gray-400';
        } else if (isDisabled) {
          dayEl.className += ' text-gray-300 cursor-not-allowed';
          dayEl.disabled = true;
        } else if (isToday) {
          dayEl.className += ' bg-[#002D72] text-white';
        } else if (isSelected) {
          dayEl.className += ' bg-[#D6E4F3] text-[#002D72]';
        } else {
          dayEl.className += ' text-[#002D72]';
        }

        dayEl.textContent = date.getDate();

        if (!isDisabled) {
          dayEl.addEventListener('click', () => {
            selectedDate = date;
            const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
            dateInput.value = formattedDate;
            calendar.style.display = 'none';
            calendarOpen = false;
          });
        }

        daysGrid.appendChild(dayEl);
      }
    };

    const calendarElements = createCalendar();
    calendarBtn.parentElement.style.position = 'relative';
    calendarBtn.parentElement.appendChild(calendarElements.calendar);

    calendarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (calendarOpen) {
        calendarElements.calendar.style.display = 'none';
        calendarOpen = false;
      } else {
        calendarElements.calendar.style.display = 'block';
        calendarOpen = true;
        renderCalendar();
      }
    });

    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
      if (!calendarBtn.contains(e.target) && !calendarElements.calendar.contains(e.target)) {
        calendarElements.calendar.style.display = 'none';
        calendarOpen = false;
      }
    });

    // Close calendar on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && calendarOpen) {
        calendarElements.calendar.style.display = 'none';
        calendarOpen = false;
      }
    });
  }

  _newlyRegisteredCardHTML(device) {
    const handle = window.collectionGidToHandle?.[device.family];
    const displayName = (device.name?.trim()) ? device.name.trim() : this._handleToTitle(handle);
    const unitFamily = (typeof device.family === 'string' && !device.family.startsWith('gid://'))
      ? device.family
      : (this.families?.find(f => f.collection === device.family)?.name || '');

    return `
      <div class="device-card grid gap-md border border-[#D6E4F3] rounded-[5px] p-xxs desktop:p-sm">
        <div class="account-content">
          <div class="my-devices-content flex flex-col gap-32 desktop:flex-row desktop:gap-0 justify-between p-sm bg-white w-full max-w-full">
            <div class="flex flex-col my-auto">
              <div class="device-card__title-container flex flex-col gap-4 mb-md">
                <h3 class="device-card__title text-22 font-400 leading-[28px] font-gilroy">${displayName}</h3>
                <p class="text-14 font-400 leading-[28px] font-gilroy">${unitFamily}</p>
              </div>
              <div class="device-card__serial-number flex flex-col gap-4 mb-md">
                <h3 class="device-card__serial-number text-22 font-400 leading-[28px] font-gilroy">Serial number</h3>
                <p class="text-14 font-400 leading-[28px] font-gilroy">${device.sn}</p>
              </div>
              <div class="device-card__purchase-date flex flex-col gap-4">
                <h3 class="device-card__purchase-date text-22 font-400 leading-[28px] font-gilroy">Date of purchase</h3>
                <p class="text-14 font-400 leading-[28px] font-gilroy">${device.dateOfPurchase || 'N/A'}</p>
              </div>
            </div>
            <div class="w-full tabletp:w-1/4 flex-shrink-0 flex justify-start tabletp:justify-end items-start mt-md tabletp:mt-0">
              <a href="https://www.blueair.com/pages/subscribe-quiz" class="inline-flex items-center underline text-16 font-400 leading-[26px] text-blue hover:opacity-80">Add a filter subscription</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _showSuccessDeviceRegistration(payload) {
    const section = this.querySelector('[js-newly-registered-devices]');
    const cardsContainer = section?.querySelector('.newly-registered-devices__cards');
    if (!section || !cardsContainer) return;

    const devices = Array.isArray(payload) ? payload : (payload?.device ? [payload.device] : payload ? [payload] : []);
    if (!devices.length) return;

    cardsContainer.innerHTML = devices.map(d => this._newlyRegisteredCardHTML(d)).join('');
    section.classList.remove('hidden');
  }

  _showSuccessMessage(message) {
    this._clearMessages();
    let msgDiv = document.createElement('div');
    msgDiv.className = 'warranty-success-message w-full flex justify-center items-center bg-[#D6E4F3] p-xxs p2 mb-md text-[#002955]';
    msgDiv.textContent = message;
    this.prepend(msgDiv);

    // Scroll to top to show the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _clearMessages() {
    const existingMsg = this.querySelector('.warranty-success-message');
    if (existingMsg) {
      existingMsg.remove();
    }
  }

  _showErrorMessage(message) {
    this._clearMessages();
    let msgDiv = document.createElement('div');
    msgDiv.className = 'warranty-success-message w-full flex justify-center items-center bg-[#FFD6D6] p-xxs p2 mb-md text-[#721c24]';
    msgDiv.textContent = message;
    this.prepend(msgDiv);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

class WarrantyAPI {
  constructor() {
    this.apiBase = 'https://hkgmr8v960.execute-api.eu-west-1.amazonaws.com/prod/c/warranty';
    this.jwtCookie = 'gigya_access_token';
  }

  getJwtToken() {
    return theme.utils.getCookie(this.jwtCookie);
  }

  async lookupDeviceModel(identifier) {
    try {
      const res = await fetch(`${this.apiBase}/device-model?identifier=${encodeURIComponent(identifier)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getJwtToken()}`
        }
        }
      );
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          payload: null,
          error: data.error || data.message || `HTTP ${res.status}: ${res.statusText}`
        };
      }

      return {
        success: true,
        payload: data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        payload: null,
        error: error.message || 'Failed to lookup device model'
      };
    }
  }

  async getDevices() {
    try {
      const jwtToken = this.getJwtToken();
      if (!jwtToken) {
        return {
          success: false,
          payload: null,
          error: 'No authentication token found'
        };
      }

      const res = await fetch(this.apiBase, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          payload: null,
          error: data.error || data.message || `HTTP ${res.status}: ${res.statusText}`
        };
      }

      return {
        success: true,
        payload: data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        payload: null,
        error: error.message || 'Failed to fetch devices'
      };
    }
  }

  async registerDevice(formData) {
    try {
      const jwtToken = this.getJwtToken();
      if (!jwtToken) {
        return {
          success: false,
          payload: null,
          error: 'No authentication token found'
        };
      }

      const res = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || (res?.status !== 200 && res?.status !== 201)) {
        return {
          success: false,
          payload: data,
          error: data.error || data.message || `HTTP ${res.status}: ${res.statusText}`
        };
      }

      return {
        success: true,
        payload: data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        payload: null,
        error: error.message || 'Failed to register device'
      };
    }
  }
}

