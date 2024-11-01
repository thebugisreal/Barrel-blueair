/**
 * Product Options Component
 * --------------------------------------------------------------------------------
 * @summary Component for handling variant selection through product's options. 
 * Fires events when a variant changes, and keeps a master variant select in sync 
 * (if one is provided as a param). Other parts of the code must listen for the events 
 * and react accordingly
 * 
 * @usage 
   <script type="application/json" id="ProductJSON">{{ product | json }}</script> 
   <product-options data-product='ProductJSON' master-select-id="MasterSelect">
    {% for option in product.options_with_values %}
      {% render 'product-option-selector' 
        option: 'swatch'
        type: option_type
        section_id: section.id
        product_id: product.id
      %}
    {% endfor %}
   </product-options
 * 
 * The following parameters are attributes that <product-options> take:
 * @param data-product - id of script that contains product JSON - required (if no product-handle)
 * @param data-product-handle - optional, alternatively to passing the product as
 *                              JSON, you can pass a product handle and the product
 *                              will be fetched upon first option select, this is 
 *                              less taxing on page load if there are multiple products. 
 * @param data-enable-history-state - default to false, updates url on variant change
 *                                    for product deep linking
 * 
 * @param master-select-id - optional id to a master variant selector, if 
 *                             provided, it will keep it in sync.
 * @param data-disable-option-binding - optional, by default, component checks which options
 *                                 are available according to user input and disable invalid
 *                                 options, with this param that feature is disabled.
 *                                 Only works for 2 options
 * 
 * These events bubble up from the input that was changed, so any ancestor
 * element can listen to it. 
 * @emits variant:change - event.detail.variant {Object} new variant
 *                       - event.detail.changedPrice {Boolean} if price has changed
 * 
 * Fetch events, fire upon first option selection. Only if you're using 
 * data-product-handle. These events don't include any data.
 * @emits variant:fetch:before 
 * @emits variant:fetch:after 
 * @emits variant:fetch:error 
 *
 * The following are selectors that the <product-options> searches for:
 * - [js-product-option-selector] - required, every option selector input must have
 * - every input must have data-index="option{{ option.position }}"
 * 
 * @scenario if you need more info than the variant event gives you (like
 * inventory qty), use a master select and grab data from that master select
 * on variant change.
 * 
 * @scenario if you need to dynamically render options using js, just adapt snippet 
 * markup, and on the component itself, don't pass data-product or data-product-handle,
 * do: 'this.querySelector('product-options').product = product' after you've render it
 * into the page, this avoids costly parsing/serializing.
 */

class ProductOptions extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      singleOptionSelector: "[js-product-option-selector]",
    };

    this._events = {
      change: "variant:change",
      fetchBefore: "variant:fetch:before",
      fetchAfter: "variant:fetch:after",
      fetchError: "variant:fetch:error",
    };
  }

  connectedCallback() {
    this._handle = this.dataset.productHandle;
    this._masterSelect = document.getElementById(this.dataset.masterSelectId);

    this._checkAvailableOptions = !this.hasAttribute(
      "data-disable-option-binding"
    );

    this._optionSelectors = [
      ...this.querySelectorAll(this._selectors.singleOptionSelector),
    ];

    if (this._checkAvailableOptions) {
      this._availableValues = {};
      this._lastSelectedOption = null;
      this._option1Values = this._option2Values = null;
    }

    if (this.dataset.product) {
      const json = document.getElementById(this.dataset.product);
      if (json) this._product = JSON.parse(json.innerHTML);
    }

    if (this._product) {
      this._currentVariant = this._getVariantFromOptions();
      if (this._checkAvailableOptions)
        this._setupOptionsAvailability(this._product);
    }

    if (this._product || this._handle) this._setupListeners();
  }

  set product(product) {
    this._product = product;
    // reinit when product changes
    this.disconnectedCallback();
    this.connectedCallback();
  }

  _setupListeners() {
    this._optionSelectors.forEach((selector) =>
      selector.addEventListener("change", this._handleOptionChange)
    );
  }

  /* Find variant based on selected options */
  _getVariantFromOptions() {
    if (!this._product) return;
    const selectedOptions = this._getCurrentOptions();
    const { variants } = this._product;

    return variants.find((variant) =>
      selectedOptions.every((option) => option.value === variant[option.index].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, ''))
    );
  }

  /* Get the currently selected options */
  _getCurrentOptions() {
    return this._optionSelectors
      .map((selector) => {
        const type = selector.getAttribute("type");
        const currentOption = {};

        if (type === "radio" || type === "checkbox") {
          if (selector.checked) {
            currentOption.value = selector.value;
            currentOption.index = selector.dataset.index;

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = selector.value;
          currentOption.index = selector.dataset.index;
          return currentOption;
        }
      })
      .filter((option) => option); // filter falsy values
  }

  /** Prepares options values data, followed by refreshing the UI */
  _setupOptionsAvailability(product) {
    // set so we don't have duplicates
    this._option1Values = new Set();
    this._option2Values = new Set();
    product.variants.forEach((variant) => {
      const { option1, option2 } = variant;
      if (option1) this._option1Values.add(option1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, ''));
      if (option2) this._option2Values.add(option2.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, ''));
    });
    // turn to array
    this._option1Values = [...this._option1Values];
    this._option2Values = [...this._option2Values];

    this._optionSelectors.forEach((option) => {
      if (this._lastSelectedOption == null && option.checked) {
        this._lastSelectedOption = {
          key: option.dataset.index,
          value: option.value,
        };
      }
    })

    this._availableValues = this._getAvailableValues(this._product, this._lastSelectedOption);

    this._refreshValuesUI(this._availableValues);
  }

  /* Dispatches variant events and makes necessary updates */
  _handleOptionChange = (e) => {
    if (!this._product) {
      this._fetchProduct(this._handle)
        .then((product) => { 
          this._product = product;
          if (this._checkAvailableOptions) this._setupOptionsAvailability(this._product);
          this._updateVariant(e)
        })
        .catch((e) => console.log(e));
    } else {
      this._updateVariant(e)
    }
  };

  _updateVariant(e) {
    this._lastSelectedOption = {
      key: e.target.dataset.index,
      value: e.target.value,
    };

    const variant = this._getVariantFromOptions();
    this.dispatchEvent(
      new CustomEvent(this._events.change, {
        detail: {
          variant,
          priceChange: this._hasPriceChanged(variant),
        },
        bubbles: true,
      })
    );

    // Update available values
    if (this._checkAvailableOptions) {
      const availableValues = this._getAvailableValues(
        this._product,
        this._lastSelectedOption
      );
      const updatedValues = this._getDifference(
        this._availableValues,
        availableValues
      );
      this._refreshValuesUI(updatedValues);
      this._availableValues = availableValues;
    }

    if (this.hasAttribute("data-enable-history-state"))
      this._updateHistoryState(variant);
    if (this._masterSelect) this._updateMasterSelect(variant);

    this._currentVariant = variant;
  }

  /* Returns whether or not price has changed for new variant */
  _hasPriceChanged(variant) {
    if (!variant || !this._currentVariant) return false;
    return !(
      variant.price === this._currentVariant.price &&
      variant.compare_at_price === this._currentVariant.compare_at_price
    );
  }

  /**
   * Given the last selected option, goes through the other options values
   * and checks if they are valid/available. If no selected option, returns an object
   * with all values as available.
   * @return {Object} - Boolean object where the key is an options's value and the
   *                    value is a Boolean indicating whether that value is available
   *                    or not
   */
  _getAvailableValues(product, selectedOption) {
    if (selectedOption) {
      const availableValues = {};
      const optionsToExplore = ["option1", "option2"];
      const dictionary = {
        option1: this._option1Values,
        option2: this._option2Values,
      };
      // don't explore last selected option, use it as base
      const explore = optionsToExplore.find(
        (option) => option !== selectedOption.key
      );

      // Get available values based on last selected option
      const values = dictionary[explore];
      values.forEach((value) => {
        const available = product.variants.findIndex(
          (variant) =>
            variant[selectedOption.key].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '') === selectedOption.value &&
            variant[explore].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '') === value &&
            variant.available
        );
        availableValues[value] = available >= 0;
      });

      return availableValues;
    } else {
      // All values are possible
      return product.variants.reduce((values, variant) => {
        const { option1, option2 } = variant;
        if (option1) values[option1] = true;
        if (option2) values[option2] = true;
        return values;
      }, {});
    }
  }

  /**
   * Enabled/disable values given a values boolean object.
   *
   * If you need to add classes instead of disabling (or run
   * some other logic) here's the place to do it
   */
  _refreshValuesUI(values) {
    for (const key in values) {
      const value = this.querySelector(`[value="${key}"]`);
      /** Update values as needed */
      if (value) {
        value.disabled = !values[key];
      }
    }
  }

  /* Update history state for product deeplinking */
  _updateHistoryState(variant) {
    if (!history.replaceState || !variant) return;

    const newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?variant=" +
      variant.id;
    window.history.replaceState({ path: newurl }, "", newurl);
  }

  /* Update hidden master select of variant change */
  _updateMasterSelect(variant) {
    if (variant) this._masterSelect.value = variant.id;
  }

  /* Fetch product by handle and return it. Fire fetch events */
  async _fetchProduct(handle) {
    this.dispatchEvent(
      new CustomEvent(this._events.fetchBefore, { bubbles: true })
    );

    try {
      const res = await fetch(`/products/${handle}.js`);
      const product = await res.json();

      this.dispatchEvent(
        new CustomEvent(this._events.fetchAfter, { bubbles: true })
      );

      return product;
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent(this._events.fetchError, {
          details: { error },
          bubbles: true,
        })
      );
    }
  }

  /** Gets difference from given boolean objects */
  _getDifference(obj1, obj2) {
    const result = {};
    if (!obj1 && !obj2) return result;
    if (!obj1) return obj2;
    if (!obj2) return obj1;

    for (const key in obj2) {
      if (obj2[key] !== obj1[key]) {
        result[key] = obj2[key];
      }
    }

    return result;
  }

  /* Clean up */
  disconnectedCallback() {
    this._optionSelectors.forEach((selector) =>
      selector.removeEventListener("change", this._handleOptionChange)
    );
  }
}
