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
  if (!jwt) throw new Error('Not authenticated (no JWT)');
  return await exchangeJwtForAccessToken(jwt);
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
    throw new Error(err.error || err.message || 'Failed to register device');
  }
  return res.json();
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
    this._setupFormHandler();
    this._setupFamilyModelDropdown();
    this._productLookup = {};

    document.querySelectorAll('.product-data').forEach(el => {
      this._productLookup[el.dataset.handle] = {
        featured_image: el.dataset.featuredImage
      };
    });
  }

  _renderDevices = async (e) => {
    const container = document.querySelector('.device-card-content');
    if (!container) {
      console.warn('No .device-card-content found in DOM');
      return;
    }
    try {
      container.innerHTML = '<p>Loading your devices...</p>';
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
    // Use the product handle to get the image from the lookup
    let imageUrl = '';
    if (this._productLookup && device.family) {
      const product = this._productLookup[device.family];
      if (product && product.featured_image) {
        imageUrl = product.featured_image;
      }
    }
    return `
      <div class="device-card mt-md grid gap-md">
        <div class="account-content">
          <div class="my-devices-content flex justify-between p-sm tabletp:p-md bg-white w-full max-w-full">
            <!-- Image column -->
            <div class="flex mr-20 tabletp:w-1/4 tabletp:mr-0">
              <div class="product-card__image aspect-square overflow-hidden">
                <img src="${imageUrl}" alt="${this._handleToTitle(device.family)}" class="object-cover object-center w-full h-full tabletp:object-contain" />
              </div>
            </div>
            <!-- Details column -->
            <div class="flex flex-col w-1/2 my-auto">
              <div>
                <h3 class="device-card__title font-700 text-20 tabletp:text-22 font-gilroy mb-12 tabletp:mb-24">
                  ${this._handleToTitle(device.family)}
                </h3>
              </div>
              <div class="flex flex-col gap-24 tabletp:flex-row tabletp:gap-0">
                <div class="text-16 font-400 mr-60">
                  <p>Serial number</p>
                  <p>${this._formatSerialNumber(device.sn)}</p>
                </div>
                <div class="text-16 font-400 mr-60">
                  <p>Date of purchase</p>
                  <p>${device.dateOfPurchase || 'N/A'}</p>
                </div>
              </div>
            </div>
            <!-- Button column -->
            <div>
              <button class="underline hidden tabletp:block">Add a filter subscription +</button>
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
          this._renderDevices();
        }
      });
    }
  }

  _dateFormatter = () => {
    const dateInput = this.querySelector('input[name="purchase_date"]');
    if (dateInput) {
      dateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits
        // Add slashes
        if (value.length >= 4) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
        } else if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
      });
    }
  }

  _setupFormHandler() {
    const form = document.getElementById('warranty-device-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

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
          this._renderDevices();
        } catch (err) {
          this._showErrorMessage('Failed to register device: ' + err.message);
        }
      });
    }
  }

  _showSuccessMessage(message) {
    let msgDiv = this.querySelector('.warranty-success-message');
    if (!msgDiv) {
      msgDiv = document.createElement('div');
      msgDiv.className = 'warranty-success-message w-full flex justify-center items-center bg-[#D6E4F3] p-xxs p2 mb-md';
      this.prepend(msgDiv);
    }
    msgDiv.textContent = message;
    msgDiv.style.display = 'flex';
    setTimeout(() => {
      msgDiv.style.display = 'none';
    }, 4000);
  }

  _showErrorMessage(message) {
    let msgDiv = this.querySelector('.warranty-success-message');
    if (!msgDiv) {
      msgDiv = document.createElement('div');
      msgDiv.className = 'warranty-success-message w-full flex justify-center items-center bg-[#D6E4F3] p-xxs p2 mb-md';
      this.prepend(msgDiv);
    }
    msgDiv.textContent = message;
    msgDiv.style.display = 'flex';
    msgDiv.style.backgroundColor = '#FFD6D6';
  }

  _setupFamilyModelDropdown() {
    let familySelect = this.querySelector('#unit-family');
    let modelSelect = this.querySelector('#unit-model');
    if (familySelect && modelSelect) {
      familySelect.addEventListener('change', function() {
        const handle = this.value;
        const models = window.collectionProducts[handle] || [];
        // Clear previous options
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

// customElements.define('warranty-devices', WarrantyDevices);
