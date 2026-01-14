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
    this.toggleBtn = this.querySelector(this._selectors.toggleWarrantyForm);

    /* Script Data */
    this.families = JSON.parse(document.getElementById('warranty-unit-families').textContent);
  }

  connectedCallback() {
    this._toggleWarrantyForm();
    this._cancelButton();
    this._dateFormatter();
    this._setupCalendarPicker();
    this._initListeners();

    this._productImageLookup = {};
    document.querySelectorAll('#unit-model option[data-image][value]').forEach(opt => {
      this._productImageLookup[opt.value] = opt.getAttribute('data-image');
    });
  }

  _initListeners() {
    if (!this.unitFamilySelect || !this.unitModelSelect) {
      return;
    }

    this.form.addEventListener('submit', this._formSubmitHandler.bind(this));
    this.form.addEventListener('change', this._formChangeHandler.bind(this));
    this.form.addEventListener('input', this._formChangeHandler.bind(this));

    document.querySelector('input[value="devices-warranty"]').addEventListener('change', this._tabChangeHandler.bind(this));
    this.toggleBtn.addEventListener('click', this._toggleWarrantyForm.bind(this));

    const debouncedSerialHandler = theme.utils.debounce((evt) => {
      this._serialNumberInputHandler(evt);
    }, 500);
    
    this.serialNumberInput.addEventListener('input', debouncedSerialHandler);
  }

  async _serialNumberInputHandler(evt) {
    const serialNumber = evt.target.value.trim();
    
    if (!serialNumber || serialNumber.length < 6) {
      this.unitFamilySelect.value = '';
      this.unitModelSelect.value = '';
      this.serialNumberError.textContent = "";
      this.serialNumberError.classList.add('hidden');
      this._formChangeHandler();
      return;
    }

    try {
      const result = await this.warrantyAPI.lookupDeviceModel(serialNumber);

      if (!result.success || !result.payload) {
        this.serialNumberError.textContent = "The serial number you entered is not valid.";
        this.serialNumberError.classList.remove('hidden');
        this.unitFamilySelect.value = '';
        this.unitModelSelect.value = '';
        this._formChangeHandler();
        return;
      }

      const { family: familyName, series: seriesName } = result.payload;

      this.serialNumberError.textContent = "";
      this.serialNumberError.classList.add('hidden');
      
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

  async _formSubmitHandler(evt) {
    evt.preventDefault();

    this.saveBtn.disabled = true;
    this.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
    this.spinner.setAttribute('loading', '');

    const formData = new FormData(this.form)
    const result = await this.warrantyAPI.registerDevice(Object.fromEntries(formData));

    if (result.success) {
      this._showSuccessMessage('Device registered successfully!');
      this.form.reset();
      if (this.formContainer) this.formContainer.classList.add('hidden');
      await this._renderDevices();
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
  }

  _renderDevices = async (showLoading = false) => {
    const container = document.querySelector('.device-card-content');
    if (!container) {
      console.warn('No .device-card-content found in DOM');
      return;
    }
    if (showLoading) {
      container.innerHTML = '<p>Loading your devices...</p>';
    }

    const result = await this.warrantyAPI.getDevices();

    if (!result.success) {
      console.error('Failed to load devices:', result.error);
      container.innerHTML = `
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
      container.innerHTML = '<p class="account__rte h-full p2">No devices registered yet.</p>';
      return;
    }

    container.innerHTML = devices.map(device => this._deviceCardHTML(device)).join('');
  }

  _deviceCardHTML(device) {
    let imageUrl = '';
    if (this.families) {
      imageUrl = this.families.find(family => family.collection === device.family)?.products.find(product => product.id === device.series)?.featuredImage || '';
    }

    let familyGid = device.family;
    const handle = window.collectionGidToHandle?.[familyGid];

    return `
      <div class="device-card mt-md grid gap-md">
        <div class="account-content">
          <div class="my-devices-content flex justify-between p-sm bg-white w-full max-w-full">
            <!-- Image column -->
            <div class="flex mr-20 tabletp:w-1/4">
              <div class="product-card__image aspect-square overflow-hidden flex items-center justify-center">
                ${imageUrl ?
                  `<img src="${imageUrl}" alt="${this._handleToTitle(handle)}" class="object-cover object-center w-full h-full tabletp:object-contain" />`
                  :
                  `
                  <svg viewBox="0 0 141 24" class="logo" xmlns="http://www.w3.org/2000/svg">
                  <title>Blueair</title>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3552 23.5C17.6264 23.5 22.7103 18.3513 22.7103 12C22.7103 8.95001 21.514 6.02494 19.3845 3.86827C17.255 1.7116 14.3667 0.5 11.3552 0.5C5.08388 0.5 0 5.64873 0 12C0 18.3513 5.08388 23.5 11.3552 23.5ZM126.569 2.65363L125.949 5.61226H121.356L121.965 2.65363H126.569ZM43.9957 2.6537H30.0288L26.0339 21.5451H39.3194C44.966 21.5451 46.7932 18.346 47.3196 15.8264C47.7326 13.7982 47.0512 11.6446 44.966 11.2578V11.1951C46.6466 10.6171 47.8995 9.18121 48.259 7.42097C48.9919 3.9187 46.7106 2.6537 43.9957 2.6537ZM41.9316 15.7218C41.7352 17.0221 40.6185 17.9742 39.3199 17.9486H31.8565L32.7959 13.4532H39.7432C41.529 13.4532 42.2826 14.2477 41.9729 15.7218H41.9316ZM40.5277 10.1705C41.7172 10.2169 42.7421 9.32923 42.8813 8.13185V8.18412C43.1187 6.94003 42.7574 6.09321 40.6928 6.09321H34.3339L33.4771 10.1705H40.5277ZM53.3585 2.6537H57.9625L53.9985 21.5451H49.4048L53.3585 2.6537ZM76.8848 7.35819H72.2911L70.9182 14.4568C70.624 16.8442 68.5631 18.5988 66.1903 18.4818C64.0741 18.4818 63.238 17.52 63.6612 15.565L65.3851 7.35819H60.7811L58.7165 16.9659C57.8288 21.1477 61.2766 22.0782 63.6612 22.0782C65.9571 22.0969 68.1732 21.2254 69.8549 19.6423L69.4626 21.545H73.9118L76.8848 7.35819ZM89.1273 6.83543C83.5892 6.83834 79.413 9.11794 78.2886 14.4568C77.1634 19.7991 80.3531 22.0782 85.9481 22.0782C90.1599 22.0782 93.6283 20.6772 95.6723 17.3109H90.7586C89.7331 18.5817 88.1637 19.2712 86.5468 19.1613C83.45 19.1613 82.5003 17.0704 82.7893 15.7532V15.7009H96.271L96.3432 15.2722C97.4678 9.93291 95.1999 6.83883 89.1273 6.83543ZM89.1273 6.83543L89.1172 6.83543H89.1379L89.1273 6.83543ZM92.0902 12.9514V12.8991H92.0799C92.245 12.1464 91.7702 9.76274 88.3946 9.76274C86.2319 9.63388 84.2199 10.8865 83.3571 12.8991V12.9514H92.0902ZM109.515 6.83543C105.747 6.83543 101.67 7.33725 100.225 11.7072H104.664C105.696 9.74179 106.728 9.61634 108.793 9.61634C111.456 9.61634 112.292 10.1704 112.034 11.31C111.776 12.4495 111.27 12.69 109.866 12.7945L104.901 13.1395C102.052 13.3172 98.8827 14.0595 98.1808 17.4991C97.4788 20.9386 99.7705 22.1095 103.435 22.1095C105.5 22.1095 108.504 21.66 110.413 20.0709C110.346 20.5704 110.346 21.0768 110.413 21.5763H115.007C114.831 20.63 114.86 19.6565 115.09 18.7222L116.555 11.6863C117.123 9.03088 116.163 6.86679 109.577 6.86679L109.515 6.83543ZM105.603 19.3601C107.926 19.3601 110.754 18.2205 111.25 15.8369L111.477 14.6764C110.577 15.0352 109.625 15.2401 108.659 15.2828L105.944 15.5232C104.292 15.6487 103.374 16.1087 103.115 17.3737C102.857 18.6387 103.879 19.3601 105.603 19.3601ZM125.588 7.35819H120.984L118.011 21.545H122.605L125.588 7.35819ZM141 7.12828L140.082 11.4878C139.287 11.2304 138.459 11.0896 137.625 11.0696C134.528 11.0696 132.659 12.6796 132.092 15.4396L130.812 21.5451H126.208L129.191 7.35828H133.63L133.052 10.1392C135.168 7.9751 136.685 7.00283 139.297 7.00283C139.851 6.99482 140.404 7.04033 140.949 7.13874L141 7.12828Z" fill="#002955"></path>
                  </svg>
                  `
                }
              </div>
            </div>
            <!-- Details column -->
            <div class="flex flex-col w-1/2 my-auto">
              <div>
                <h3 class="device-card__title font-700 text-20 tabletp:text-22 font-gilroy mb-12 tabletp:mb-24">
                  ${this._handleToTitle(handle)}
                </h3>
              </div>
              <div class="flex flex-col gap-24 tabletp:flex-row tabletp:gap-0">
                <div class="text-22 font-400 mr-60">
                  <p>Serial number</p>
                  <p>${this._formatSerialNumber(device.sn)}</p>
                </div>
                <div class="text-22 font-400 mr-60">
                  <p>Date of purchase</p>
                  <p>${device.dateOfPurchase || 'N/A'}</p>
                </div>
              </div>
            </div>
            <!-- Button column -->
            <div class="tabletp:w-1/4 flex justify-end items-start">
              <a href="https://www.blueair.com/pages/subscribe-quiz" class="text-16 font-400 pb-xxs border-b border-blue hidden tabletp:inline-block no-underline hover:no-underline flex items-center justify-center">
                Add a filter subscription
              </a>
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
        const form = this.querySelector(this._selectors.warrantyDeviceForm);
        const formContainer = this.querySelector(this._selectors.warrantyForm);
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

      return { calendar, monthYear, daysGrid };
    };

    const renderCalendar = () => {
      const { calendar, monthYear, daysGrid } = calendarElements;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      monthYear.textContent = `${new Date(year, month).toLocaleDateString('en-US', { month: 'long' })} ${year}`;

      daysGrid.innerHTML = '';

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const today = new Date();
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

