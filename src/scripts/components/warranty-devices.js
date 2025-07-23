const WARRANTY_API_BASE = 'https://ychmmhbbi1.execute-api.us-east-2.amazonaws.com/qa/c/warranty';
const LOGIN_API_URL = 'https://ychmmhbbi1.execute-api.us-east-2.amazonaws.com/qa/c/login?client_id=4p5qzjra8vdd558fnl9ndn3kj3&client_secret=3t374rg84d2plhdi1ceqorqnop2op0jdmn5lkl5rj888q7fem5u3';
const JWT_COOKIE_NAME = 'gigya_access_token';
const ACCESS_TOKEN_COOKIE_NAME = 'warranty_access_token';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function exchangeJwtForAccessToken(jwt) {
  const res = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: {
      'idtoken': jwt,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
          if (res.status === 401 || res.status === 403 || err.error?.includes('expired') || err.error?.includes('invalid')) {
        clearAuthTokens();
        window.location.href = '/account/logout';
        throw new Error('JWT token expired or invalid. Please log in again.');
      }
    throw new Error(err.error || err.message || 'Failed to exchange JWT for access token');
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('No access token returned');
  return data.access_token;
}

async function getApiAccessToken() {
  let accessToken = getCookie(ACCESS_TOKEN_COOKIE_NAME);
  if (accessToken) return accessToken;
  const jwt = getCookie(JWT_COOKIE_NAME);
      if (!jwt) {
      clearAuthTokens();
      window.location.href = '/account/logout';
      throw new Error('Authentication error, please log in again.');
    }
  return await exchangeJwtForAccessToken(jwt);
}

function clearAuthTokens() {
  document.cookie = `${JWT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

async function getDevices() {
  const token = await getApiAccessToken();
  const res = await fetch(WARRANTY_API_BASE, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
          if (res.status === 401 || res.status === 403 || data.error?.includes('expired') || data.error?.includes('invalid')) {
        clearAuthTokens();
        window.location.href = '/account/logout';
        throw new Error('Authentication expired. Please log in again.');
      }
    throw new Error(data.error || data.message || 'Failed to fetch devices');
  }
  return data;
}

async function registerDevice(formData) {
  const token = await getApiAccessToken();
  const res = await fetch(WARRANTY_API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
          if (res.status === 401 || res.status === 403 || err.error?.includes('expired') || err.error?.includes('invalid')) {
        clearAuthTokens();
        window.location.href = '/account/logout';
        throw new Error('Authentication expired. Please log in again.');
      }
    throw new Error(err.error || err.message || 'Failed to register device');
  }
  return res.json();
}

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
      modelSelect: '#unit-model'
    }
  }

  connectedCallback() {
    this.button = this.querySelector(this._selectors.getDeviceButton);
    if (this.button) {
      this.button.addEventListener('click', this._renderDevices);
    }
    this._toggleWarrantyForm();
    this._cancelButton();
    this._setupTabListener();
    this._dateFormatter();
    this._setupCalendarPicker();
    this._setupFormHandler();
    this._setupFamilyModelDropdown();
    this._productLookup = {};
    this._familySelectListener();

    document.querySelectorAll('.product-data').forEach(el => {
      this._productLookup[el.dataset.handle] = {
        featured_image: el.dataset.featuredImage
      };
    });

    this._productImageLookup = {};
    document.querySelectorAll('#unit-model option[data-image][value]').forEach(opt => {
      this._productImageLookup[opt.value] = opt.getAttribute('data-image');
    });
  }

  _familySelectListener() {
    const familySelect = this.querySelector(this._selectors.familySelect);
    const modelSelect = this.querySelector(this._selectors.modelSelect);
  
    if (!familySelect || !modelSelect) {
      console.warn('Unit family or model select not found in DOM');
      return;
    }
  
    familySelect.addEventListener('change', function() {
      const selectedOption = familySelect.options[familySelect.selectedIndex];
      const gid = selectedOption.value;
      const handle = window.collectionGidToHandle[gid];
  
      modelSelect.innerHTML = '<option value="" disabled selected>Select model</option>';
  
      if (!handle) return;
  
      const models = window.collectionProducts[handle] || [];
      if (models.length) {
        models.forEach(function(model) {
          const opt = document.createElement('option');
          opt.value = model.id;
          opt.textContent = model.title;
          modelSelect.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No models found';
        modelSelect.appendChild(opt);
      }
    });
  }
  
  _renderDevices = async (showLoading = false) => {
    const container = document.querySelector('.device-card-content');
    if (!container) {
      console.warn('No .device-card-content found in DOM');
      return;
    }
    try {
      if (showLoading) {
        container.innerHTML = '<p>Loading your devices...</p>';
      }
      const devices = await getDevices();
      if (!devices.length) {
        container.innerHTML = '<p class="account__rte h-full p2">No devices registered yet.</p>';
        return;
      }
      container.innerHTML = devices.map(device => this._deviceCardHTML(device)).join('');
    } catch (err) {
      console.error('Failed to load devices:', err);
      container.innerHTML = `
        <div class="account-content block">
          <div class="account__rte h-full p2 bg-[#D6E4F3] text-[#002955]">
            Failed to load devices: ${err.message}
          </div>
        </div>
      `;
    }
  }

  _deviceCardHTML(device) {
    let imageUrl = '';
    if (this._productImageLookup && device.series) {
      imageUrl = this._productImageLookup[device.series] || '';
    }

    let familyGid = device.family;
    const handle = window.collectionGidToHandle?.[familyGid];
   
    return `
      <div class="device-card mt-md grid gap-md">
        <div class="account-content">
          <div class="my-devices-content flex justify-between p-sm bg-white w-full max-w-full">
            <!-- Image column -->
            <div class="flex mr-20 tabletp:w-1/4">
              <div class="product-card__image aspect-square overflow-hidden">
                <img src="${imageUrl}" alt="${this._handleToTitle(handle)}" class="object-cover object-center w-full h-full tabletp:object-contain" />
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
              <a href="https://www.blueair.com/pages/subscribe-quiz" class="text-16 font-400 pb-xxs border-b border-blue hidden tabletp:inline-block no-underline hover:no-underline">
                Add a filter subscription <span class="account-content__icon inline-block align-middle ml-xxxs">

                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon--plus" viewBox="0 0 25 26" width="15" height="15">
                    <title>Plus-smaller</title>
                    <polygon points="25 12.5 13 12.5 13 .5 12 .5 12 12.5 0 12.5 0 13.5 12 13.5 12 25.5 13 25.5 13 13.5 25 13.5 25 12.5"/>
                  </svg>

                </span>
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

  _toggleWarrantyForm = () => {
    const toggleBtn = this.querySelector(this._selectors.toggleWarrantyForm);
    const form = this.querySelector(this._selectors.warrantyForm);
    if (toggleBtn && form) {
      toggleBtn.addEventListener('click', () => {
        form.classList.toggle('hidden');
      });
    }
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

  _setupTabListener = () => {
    const devicesWarrantyTab = document.querySelector('input[value="devices-warranty"]');
    if (devicesWarrantyTab) {
      devicesWarrantyTab.addEventListener('change', (e) => {
        if (e.target.checked) {
          this._renderDevices(true);
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
    const dateInput = this.querySelector('input[name="purchase_date"]');
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

  _setupFormHandler() {
    const form = document.getElementById('warranty-device-form');
    const saveBtn = document.getElementById('warranty-save-btn');
    const spinner = document.getElementById('warranty-save-spinner');
    const formContainer = this.querySelector('[js-device-warranty-form]');
    
    
    if (form && saveBtn && spinner) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
        spinner.setAttribute('loading', '');

        const formData = {
          family: form.unit_family.value,
          series: form.unit_model.value,
          sn: form.serial_number.value,
          dateOfPurchase: form.purchase_date.value,
          wherePurchased: form.place_of_purchase.value,
          name: form.device_name.value,
          country: form.country.value
        };
        try {
          await registerDevice(formData);
          this._showSuccessMessage('Device registered successfully!');
          form.reset();
          if (formContainer) formContainer.classList.add('hidden');
          await this._renderDevices();
        } catch (err) {
          this._showErrorMessage(formatWarrantyErrorMessage(err.message));
        } finally {
          saveBtn.disabled = false;
          saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          spinner.removeAttribute('loading');
        }
      });
    }
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

  _setupFamilyModelDropdown() {
    let familySelect = this.querySelector('#unit-family');
    let modelSelect = this.querySelector('#unit-model');
    if (familySelect && modelSelect) {
      familySelect.addEventListener('change', function() {
        const selectedOption = familySelect.options[familySelect.selectedIndex];
        const handle = selectedOption.getAttribute('data-collection-handle');
        if (!handle) {
          modelSelect.innerHTML = '<option value="" disabled selected>Select model</option>';
          return;
        }
        const models = window.collectionProducts[handle] || [];
        modelSelect.innerHTML = '<option value="" disabled selected>Select model</option>';
        if (models.length) {
          models.forEach(function(model) {
            const opt = document.createElement('option');
            opt.value = model.id;
            opt.textContent = model.title;
            modelSelect.appendChild(opt);
          });
        } else {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = 'No models found';
          modelSelect.appendChild(opt);
        }
      });
    }
  }
}

