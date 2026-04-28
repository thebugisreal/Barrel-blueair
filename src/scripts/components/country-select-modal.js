class CountrySelectModal extends HTMLElement {
    constructor() {
      super();

      this._selectors = {
        form: '[js-country-form]',
        select: '[js-country-select]',
        languageSelect: '[js-language-select]',
        languageInput: '[js-language-input]',
        languageInputLabel: '[js-language-input-label]',
        countryLabel: '[js-country-input-label]',
        submitBtn: '[js-localization-submit]'
      }

      this._languagePicker = [
        { country: "EU", languages: [ { code: "EN", label: "English" } ]},
        { country: "AF", languages: [ { code: "AR", label: "العربية" },{ code: "EN", label: "English" } ]},
        { country: "AX", languages: [ { code: "EN", label: "English" } ]},
        { country: "AX", languages: [ { code: "EN", label: "English"} ]},
        { country: "AL", languages: [ { code:"EN", label: "English"} ] },
        { country: "DZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "AD", languages: [ { code:"EN", label: "English"} ] },
        { country: "AE", languages: [ { code: "EN", label: "English" } ]},
        { country: "AO", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "AC", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "AU", languages: [ { code:"EN", label: "English"} ] },
        { country: "AT", languages: [ { code:"EN", label: "English"} ] },
        { country: "AZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "BH", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "BD", languages: [ { code:"EN", label: "English"} ] },
        { country: "BY", languages: [ { code:"EN", label: "English"} ] },
        { country: "BE", languages: [ { code:"EN", label: "English"} ] },
        { country: "BJ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "BA", languages: [ { code:"EN", label: "English"} ] },
        { country: "BW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "IO", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "BG", languages: [ { code:"EN", label: "English"} ] },
        { country: "BF", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "BI", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CA", languages: [ { code:"EN", label: "English", currency: "CAD" } , { code:"FR", label: "Français", currency: "CAD" } ] },
        { country: "CV", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CF", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ES", languages: [ { code:"EN", label: "English"}, {code: "ES", label: "Español"} ] },
        { country: "TD", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CN", languages: [ { code:"EN", label: "English"} , { code:"ZH", label: "简体中文"} ] },
        { country: "KM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CD", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CI", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "HR", languages: [ { code:"EN", label: "English"} ] },
        { country: "CY", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "CZ", languages: [ { code:"EN", label: "English"} ] },
        { country: "DK", languages: [ { code:"EN", label: "English"} ] },
        { country: "DJ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "EG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GQ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ER", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "EE", languages: [ { code:"EN", label: "English"} ] },
        { country: "SZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ET", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "FO", languages: [ { code:"EN", label: "English"} ] },
        { country: "FI", languages: [ { code:"EN", label: "English"} ] },
        { country: "FR", languages: [ { code:"EN", label: "English"}, { code:"FR", label: "Français"} ] },
        { country: "TF", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GE", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "DE", languages: [ { code:"EN", label: "English"}, { code:"DE", label: "Deutsch"} ] },
        { country: "GH", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GI", languages: [ { code:"EN", label: "English"} ] },
        { country: "GR", languages: [ { code:"EN", label: "English"} ] },
        { country: "GG", languages: [ { code:"EN", label: "English"} ] },
        { country: "GN", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "GW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "HK", languages: [ { code:"EN", label: "English"} , { code:"ZH", label: "简体中文"} ] },
        { country: "HU", languages: [ { code:"EN", label: "English"} ] },
        { country: "IS", languages: [ { code:"EN", label: "English"} ] },
        { country: "ID", languages: [ { code:"EN", label: "English"} , { code:"ID", label: "Indonesia"} ] },
        { country: "IQ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "IE", languages: [ { code:"EN", label: "English"} ] },
        { country: "IM", languages: [ { code:"EN", label: "English"} ] },
        { country: "IL", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "IT", languages: [ { code:"EN", label: "English"} ] },
        { country: "JP", languages: [ { code:"EN", label: "English"} , { code:"JA", label: "日本語"} ] },
        { country: "JE", languages: [ { code:"EN", label: "English"} ] },
        { country: "JO", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "KZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "KE", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "XK", languages: [ { code:"EN", label: "English"} ] },
        { country: "KW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "KG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "LV", languages: [ { code:"EN", label: "English"} ] },
        { country: "LB", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "LS", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "LR", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "LY", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "LI", languages: [ { code:"EN", label: "English"} ] },
        { country: "LT", languages: [ { code:"EN", label: "English"} ] },
        { country: "LU", languages: [ { code:"EN", label: "English"} ] },
        { country: "MO", languages: [ { code:"EN", label: "English"} , { code:"ZH", label: "简体中文"} ] },
        { country: "MG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MY", languages: [ { code:"EN", label: "English"} ] },
        { country: "ML", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MT", languages: [ { code:"EN", label: "English"} ] },
        { country: "MR", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MU", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "YT", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MD", languages: [ { code:"EN", label: "English"} ] },
        { country: "MC", languages: [ { code:"EN", label: "English"} ] },
        { country: "ME", languages: [ { code:"EN", label: "English"} ] },
        { country: "MA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "NA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "NP", languages: [ { code:"EN", label: "English"} ] },
        { country: "NL", languages: [ { code:"EN", label: "English"} ] },
        { country: "NZ", languages: [ { code:"EN", label: "English"} ] },
        { country: "NE", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "NG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "MK", languages: [ { code:"EN", label: "English"} ] },
        { country: "NO", languages: [ { code:"EN", label: "English"} ] },
        { country: "OM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "PK", languages: [ { code:"EN", label: "English"} ] },
        { country: "PS", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "PH", languages: [ { code:"EN", label: "English"} ] },
        { country: "PL", languages: [ { code:"EN", label: "English"} ] },
        { country: "PT", languages: [ { code:"EN", label: "English"} ] },
        { country: "QA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "RE", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "RO", languages: [ { code:"EN", label: "English"} ] },
        { country: "RU", languages: [ { code:"EN", label: "English"} ] },
        { country: "RW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SM", languages: [ { code:"EN", label: "English"} ] },
        { country: "ST", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SN", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "RS", languages: [ { code:"EN", label: "English"} ] },
        { country: "SC", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SL", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SG", languages: [ { code:"EN", label: "English"} ] },
        { country: "SK", languages: [ { code:"EN", label: "English"} ] },
        { country: "SI", languages: [ { code:"EN", label: "English"} ] },
        { country: "SO", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ZA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "KR", languages: [ { code:"EN", label: "English"} , { code:"KO", label: "한국어"} ] },
        { country: "SS", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SH", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SD", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "SJ", languages: [ { code:"EN", label: "English"} ] },
        { country: "SE", languages: [ { code:"EN", label: "English"} ] },
        { country: "CH", languages: [ { code:"EN", label: "English"} ] },
        { country: "TW", languages: [ { code:"EN", label: "English"} , { code:"ZH", label: "简体中文"} ] },
        { country: "TJ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TH", languages: [ { code:"EN", label: "English"} , { code:"TH", label: "ภาษาไทย"} ] },
        { country: "TG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TA", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TN", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TR", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "TM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "UG", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "UA", languages: [ { code:"EN", label: "English"} ] },
        { country: "GB", languages: [ { code:"EN", label: "English"} ] },
        { country: "US", languages: [ { code:"EN", label: "English"} ] },
        { country: "UZ", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "VA", languages: [ { code:"EN", label: "English"} ] },
        { country: "VN", languages: [ { code:"EN", label: "English"} ] },
        { country: "EH", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "YE", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ZM", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] },
        { country: "ZW", languages: [ { code:"EN", label: "English"} , { code:"AR", label: "العربية"} ] }
      ]
    }

    connectedCallback() {
      this.init()
    }

    async init() {
      // Handle URL redirects immediately for Safari compatibility
      this._handleUrlRedirects();

      const euCountriesRaw = this.dataset.euCountries || ''
      this._euCountries = new Set(
        euCountriesRaw.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
      )

      this.form = this.querySelector(this._selectors.form);
      this.select = this.querySelector(this._selectors.select);
      this.languageSelect = this.querySelector(this._selectors.languageSelect)
      this.languageInput = this.querySelector(this._selectors.languageInput)
      this.languageInputLabel = this.querySelector(this._selectors.languageInputLabel)
      this.countryLabel = document.querySelectorAll(this._selectors.countryLabel)
      this.submitBtn = this.querySelector(this._selectors.submitBtn)

      this.select.addEventListener('change', this._handleCountryChange.bind(this));
      this.selectedCountry = this.select.value;

      await this._checkCurrentCountry();
      this._checkAutoRedirect();
      if (this.languageSelect) {
        this.selectedLanguage = this.languageSelect.value;
        this.languageSelect.addEventListener('change', this._handleLanguageChange.bind(this));
      }

      if (this.submitBtn) {
        this.submitBtn.addEventListener('click', this._submitForm )
      }

      // No need for close listeners since we track when modal is shown, not dismissed

    }

    _checkCurrentCountry = async () => {
      try {
        const response = await fetch(
          window.Shopify.routes.root
            + 'browsing_context_suggestions.json'
            + '?country[enabled]=true'
            + `&country[exclude]=${window.Shopify.country}`
            + '&language[enabled]=true'
            + `&language[exclude]=${window.Shopify.language}`
        )
        const data = await response.json()
        const detectedCountry = data.detected_values?.country?.handle
        if (!detectedCountry) return

        this._detectedCountry = detectedCountry.toUpperCase()

        const selectedOption = this._euCountries.has(detectedCountry) ? 'EU' : detectedCountry
        const optionExists = Array.from(this.select.options).some(
          opt => opt.value === selectedOption
        )
        if (optionExists) {
          this.select.value = selectedOption
          this.select.dispatchEvent(new Event('change'))
        }
      } catch (err) {
        console.warn('Could not fetch browsing context suggestions:', err)
      }
    }

    _handleUrlRedirects = () => {
      const _params = new URLSearchParams(window.location.search);
      if (_params.has('currency')) {
        _params.delete('currency');
        const _newSearch = _params.toString();
        const _newUrl = window.location.pathname + (_newSearch ? '?' + _newSearch : '') + window.location.hash;
        history.replaceState(null, '', _newUrl);
      }

      // Handle URL path corrections for blueeudev.myshopify.com
      if (window.permanent_domain == `blueeudev.myshopify.com`) {
        const currentPath = window.location.pathname;

        // Redirect /de-us/ to /
        if (currentPath.startsWith('/de-us')) {
          const newPath = currentPath.replace('/de-us', '');
          console.log('Redirecting /de-us/ to /:', newPath);
          const newUrl = window.location.origin + newPath;

          // Immediate redirect for Safari compatibility
          window.location.replace(newUrl);
          return true; // Indicate redirect happened
        }

        // Redirect /en-us/ to /en/
        if (currentPath.startsWith('/en-us')) {
          const newPath = currentPath.replace('/en-us', '/en');
          console.log('Redirecting /en-us/ to /en/:', newPath);
          const newUrl = window.location.origin + newPath;

          // Immediate redirect for Safari compatibility
          window.location.replace(newUrl);
          return true; // Indicate redirect happened
        }
      }
      return false; // No redirect needed
    }

    _checkAutoRedirect = () => {
      const country = this.selectedCountry.toLowerCase();
      const language = this.selectedLanguage.toLowerCase();
      const target = 'https://blueair.co';
      const autoRedirect = theme.utils.getCookie('seedAutoRedirect');
      if (
        country !== 'us'
        && country !== 'ca'
        && country !== 'gb'
        && window.permanent_domain == 'blueeudev.myshopify.com'
        && !autoRedirect
      ) {
        theme.utils.setCookie('seedAutoRedirect', true, 30);
        const currentPath = window.location.pathname;
        let newPath = `/${language}-${country}/` + currentPath.slice(1)
        if (country == 'de' && language == 'de'){
          newPath = '/'
        } else if (country == 'de' && language == 'en'){
          newPath = '/en/' + currentPath.slice(1)
        } else if (country == 'eu'){
          newPath = '/en-eu/' + currentPath.slice(1)
        }
        window.location.href = target + newPath
      }

      const searchParams = new URLSearchParams(window.location.search);

      if(searchParams.get('manual-redirect') == 'true') {
        theme.utils.setCookie('seedManualRedirect', true, 30);
      }

      const manualRedirect = theme.utils.getCookie('seedManualRedirect');
      const modalShown = theme.utils.getCookie('countryModalShown');

      if (manualRedirect == 'true' || modalShown == 'true') {
        return;
      }

      // Get current country from the select element
      const detectedCountry = this._detectedCountry
      console.log('Current country detected:', detectedCountry)
      if (!detectedCountry) return

      let isOutsideRegion = false

      if (window.permanent_domain === '5ef43d-4a.myshopify.com') {
        isOutsideRegion = detectedCountry !== 'US' && detectedCountry !== 'CA';
      } else if (window.permanent_domain === 'blueeudev.myshopify.com') {
        isOutsideRegion = !this._euCountries.has(detectedCountry);
      } else if (window.permanent_domain === 'uk-blueair.myshopify.com') {
        isOutsideRegion = detectedCountry !== 'GB';
      }

      if (isOutsideRegion) {
        console.log(`Visitor from ${detectedCountry} is outside the current store's region. attempting to open modal...`);
        setTimeout(() => {
          const modalTrigger = document.querySelector('[js-open-country-market-selector-modal]');
          if (modalTrigger) {
            console.log('Modal trigger found, clicking...');
            modalTrigger.click();
            console.log('Modal shown, cookie set');
          } else {
            console.log('Modal trigger not found');
          }
        }, 100);
      }
    }

    _cleanPathname = () => {
      const pathURL = window.pathURL;

      if (!pathURL) return '';

      // Using a regex pattern to match the start of the string with two-letter language and country codes
      const pattern = /^\/[a-z]{2}-[a-z]{2}/;

      // Check if the pattern is matched
      if (pattern.test(pathURL)) {
        // If matched, use replace() to remove the matched part from the beginning of the pathURL string
        const updatePathURL = pathURL.replace(pattern, '');
        return updatePathURL;
      } else {
        // If not matched, return the original string
        return pathURL;
      }
    }

    _submitForm = () => {
      // Set cookie to remember modal was shown
      theme.utils.setCookie('countryModalShown', true, 1); // 1 day expiry
      const country = this.selectedCountry.toLowerCase();
      const language = this.selectedLanguage.toLowerCase();
      const pathname = this._cleanPathname();
      let target = 'https://blueair.co';

      if (country == 'us' || country == 'ca') {
        target = 'https://www.blueair.com'
      }else if (country == 'gb'){
        target = 'https://blueair.co.uk'
      }

      if (window.domain == target) {
        this.form.submit();
      }else{
        const currencyParam = this.selectedCurrency ? `&currency=${this.selectedCurrency}` : '';
        if (country == 'us') {
          window.location.href = `${target}?manual-redirect=true${currencyParam}`
        } else if (country == 'ca'){
          window.location.href = `${target}/${language}-${country}?manual-redirect=true${currencyParam}`
        } else if (country == 'gb'){
          window.location.href = `${target}?manual-redirect=true${currencyParam}`
        } else if (country == 'de' && language == 'de'){
          window.location.href = `${target}?manual-redirect=true${currencyParam}`
        } else if (country == 'de' && language == 'en'){
          window.location.href = `${target}/en?manual-redirect=true${currencyParam}`
        } else if (country == 'eu'){
          window.location.href = `${target}/en-eu?manual-redirect=true${currencyParam}`
        } else{
          window.location.href = `${target}/${language}-${country}?manual-redirect=true${currencyParam}`
        }
      }
    }

    _handleCountryChange(e) {
      console.log('handle country change', e.target.options[e.target.selectedIndex].dataset.countryName)
      this.countryLabel.forEach(el => {
        el.innerHTML = e.target.options[e.target.selectedIndex].dataset.countryName
      })
      const selectedValue = e.target.options[e.target.selectedIndex].value
      this.selectedCountry = selectedValue;

      for (let i = 0; i < this._languagePicker.length; i++) {
        if (this._languagePicker[i].country == selectedValue) {
          this._removeOptions()
          for (let j = 0; j < this._languagePicker[i].languages.length; j++) {
            if (j === 0) {
              if (this.languageInputLabel) {
                this.languageInputLabel.innerHTML = this._languagePicker[i].languages[j].label
              }
            }
            const lang = this._languagePicker[i].languages[j]
            this._createOption(lang.code, lang.label, lang.currency, this.languageSelect)
          }
          break
        }
      }

      this.selectedLanguage = this.languageSelect.options[0].value.toLowerCase();
      this.selectedCurrency = this.languageSelect.options[0].dataset.currency || '';
    }

    _handleLanguageChange(e) {
      this.languageInput.value = e.target.value
      this.selectedLanguage = e.target.value;
      this.selectedCurrency = e.target.options[e.target.selectedIndex].dataset.currency || '';

      if (this.languageInputLabel) {
        this.languageInputLabel.innerHTML =  e.target.options[e.target.selectedIndex].dataset.endonymName
      }
    }

    _removeOptions() {
      this.languageSelect.innerHTML = ''
    }

    _createOption(value, label, currency, parent) {
      const option = document.createElement('option');
      option.value = value;
      option.innerText = label;
      option.dataset.endonymName = label;
      option.dataset.currency = currency || '';
      parent.appendChild(option);

      return option
    }

  }

export default CountrySelectModal;