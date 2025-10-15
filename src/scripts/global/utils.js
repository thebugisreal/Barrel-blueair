/**
 * Global Utilities
 *
 * @summary a set of utility functions used throughout the theme
 * @namespace theme.utils
 * @memberof theme
 * @property {object} a11y - accessibility related utility functions
 */
theme.utils = {
  subscriptions: {
    subscribers: {},
    subscribe(eventName, callback) {
      if (theme.utils.subscriptions.subscribers[eventName] === undefined) {
        theme.utils.subscriptions.subscribers[eventName] = [];
      }

      theme.utils.subscriptions.subscribers[eventName] = [...theme.utils.subscriptions.subscribers[eventName], callback];

      return function unsubscribe() {
        theme.utils.subscriptions.subscribers[eventName] = theme.utils.subscriptions.subscribers[eventName].filter((cb) => {
          return cb !== callback;
        });
      };
    },
    publish(eventName, data) {
      if (theme.utils.subscriptions.subscribers[eventName]) {
        theme.utils.subscriptions.subscribers[eventName].forEach((callback) => {
          callback(data);
        });
      }
    }
  },
  a11y: {
    /**
     * Gets all focusable elements from a given container
     * @memberof theme.utils.a11y
     * @param {HTMLElement} container 
     * @returns {array} focusable elements
     */
    getFocusableElements(container) {
      return Array.from(
        container.querySelectorAll(
          "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
        )
      );
    },

    /** @private */
    _trapFocusHandlers: {},

    /**
     * @memberof theme.utils.a11y
     * @param {HTMLElement} container 
     * @param {HTMLElement} [elementToFocus = container] - 1st element to focus in 
     */
    trapFocus(container, elementToFocus = container) {
      var elements = theme.utils.a11y.getFocusableElements(container);
      var first = elements[0];
      var last = elements[elements.length - 1];
    
      theme.utils.a11y.removeTrapFocus();
    
      theme.utils.a11y._trapFocusHandlers.focusin = (event) => {
        if (
          event.target !== container &&
          event.target !== last &&
          event.target !== first
        )
          return;
    
        document.addEventListener('keydown', theme.utils.a11y._trapFocusHandlers.keydown);
      };
    
      theme.utils.a11y._trapFocusHandlers.focusout = function() {
        document.removeEventListener('keydown', theme.utils.a11y._trapFocusHandlers.keydown);
      };
    
      theme.utils.a11y._trapFocusHandlers.keydown = function(event) {
        if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
          event.preventDefault();
          first.focus();
        }
    
        //  On the first focusable element and tab backward, focus the last element.
        if (
          (event.target === container || event.target === first) &&
          event.shiftKey
        ) {
          event.preventDefault();
          last.focus();
        }
      };
    
      document.addEventListener('focusout', theme.utils.a11y._trapFocusHandlers.focusout);
      document.addEventListener('focusin', theme.utils.a11y._trapFocusHandlers.focusin);
    
      elementToFocus.focus();
    },

    /**
     * @memberof theme.utils.a11y
     * @param {HTMLElement} [elementToFocus = null] - 1st element to focus in after untrapping
     */
    removeTrapFocus(elementToFocus = null) {
      document.removeEventListener('focusin', theme.utils.a11y._trapFocusHandlers.focusin);
      document.removeEventListener('focusout', theme.utils.a11y._trapFocusHandlers.focusout);
      document.removeEventListener('keydown', theme.utils.a11y._trapFocusHandlers.keydown);
    
      if (elementToFocus) elementToFocus.focus();
    }
    
  },

  /**
   * Prepares transition to animate between display: none and display: block
   * @memberof theme.utils
   * @param {HTMLElement} element 
   */
  prepareTransition(element) {
    element.addEventListener('transitionend', () => {
      element.classList.remove('is-transitioning');
    })
  
    // check the various CSS properties to see if a duration has been set
    var cl = ["transition-duration", "-moz-transition-duration", "-webkit-transition-duration", "-o-transition-duration"];
    let duration = 0;
    const computedStyles = getComputedStyle(element)
    cl.forEach((prop) => duration || (duration = parseFloat(computedStyles.getPropertyValue(prop))));
  
    // if I have a duration then add the class
    if (duration != 0) {
      element.classList.add('is-transitioning');
      element.offsetWidth; // check offsetWidth to force the style rendering
    }
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  },

  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @param  {String} format - shop money_format setting
   * @return {String} value - formatted value
   */
  formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || theme.config.money.format);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = theme.utils.defaultTo(precision, 2);
      thousands = theme.utils.defaultTo(thousands, ',');
      decimal = theme.utils.defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      let centsAmount = parts[1] ? (decimal + parts[1]) : '';

      if (formatString.match(placeholderRegex)[1] == 'no_trailing_zeros' && centsAmount == '.00') {
        centsAmount = '';
      }

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'no_trailing_zeros':
        value = formatWithDelimiters(cents, 2);
        break;
    }

    return formatString.replace(placeholderRegex, value);
  },

  /**
   * Similiar to jQuery.serialize
   * @param {HTMLElement} form 
   * @returns json object
   */
  serializeForm: form => {
    const obj = {};
    const formData = new FormData(form);

    for (const key of formData.keys()) {
      const regex = /(?:^(properties\[))(.*?)(?:\]$)/;

      if (regex.test(key)) {
        obj.properties = obj.properties || {};
        obj.properties[regex.exec(key)[2]] = formData.get(key);
      } else {
        obj[key] = formData.get(key);
      }
    }

    return JSON.stringify(obj);
  },

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  /**
   * Throttle function: ensures fn is only called once every wait ms.
   * @param {Function} fn - Function to throttle
   * @param {number} wait - Milliseconds to wait
   * @returns {Function}
   */
  throttle(fn, wait = 100) {
    let lastTime = 0;
    let timeout;
    return function(...args) {
      const now = Date.now();
      const remaining = wait - (now - lastTime);
      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        lastTime = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastTime = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  },


  getSiblings(element, selector) {
    let siblings = [];
    let targets;
    
    if (selector) {
      targets = element.parentNode.querySelectorAll(':scope > ' + selector)
    } else {
      targets = element.parentNode.children;
    }

    
    for (let target of targets) {
      if (target !== element)
        siblings.push(target);
    }

    return siblings;
  },

  /**
   * Refreshes UI elements
   * @param {Array} selectors -
   * @param {HTMLDocument} newHTML 
   * @param {HTMLElement} container 
   */
  refreshElements(selectors, newHTML, container) {
    selectors.forEach(selector => {
      const newEls = newHTML.querySelectorAll(selector)
      const oldEls = container.querySelectorAll(selector)
      oldEls.forEach((oldEl, idx) => {
        if (newEls[idx]){
          if (oldEl.getAttribute('js-accordion-item') != null) {
            const oldHeaderStatus = oldEl.querySelector('[js-accordion-header]').getAttribute('aria-expanded')
            const oldContentStatus = oldEl.querySelector('[js-accordion-content]').getAttribute('aria-hidden')
            const newEl = newEls[idx]
            newEl.querySelector('[js-accordion-header]').setAttribute('aria-expanded', oldHeaderStatus);
            newEl.querySelector('[js-accordion-content]').setAttribute('aria-hidden', oldContentStatus);
            oldEl.innerHTML = newEl.innerHTML
          } else {
            oldEl.innerHTML = newEls[idx].innerHTML
          }
        } else {
          oldEl.remove();
        }
      })
    })
  },

  /* behaves like liquid handleize, for js matching purposes */
  handleize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '')
  },

  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },

  setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },

  isIOS26() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
  
    // Check if it's an iPhone (not iPad or iPod)
    const isIPhone = /iPhone/.test(ua);
    if (!isIPhone) return false;
  
    // Check for Safari/Browser version (e.g., "Version/26.0.1")
    const versionMatch = ua.match(/Version\/([\d.]+)/);
    if (!versionMatch) return false;
  
    const version = versionMatch[1].split(".").map(Number);
    const majorVersion = version[0];
    
    return majorVersion >= 26 ? true : false;
  }

}