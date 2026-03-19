/**
 * Focusable Widget Class
 * --------------------------------------------------------------
 * @summary High-level general Class for creating focusable widgets
 * (drawers, modals, etc). Provides css-based open/close/toggle
 * functionality, as well as programatically manipulation of the widget,
 * and handles a11y.
 *
 * @usage class widget extends FocusableWidget {...}
 *
 * @emits focusable-widget:open on document
 * @emits focusable-widget:close on document
 * @emits <config.name>:open on document
 * @emits <config.name>:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 *
 * The following parameters are attributes that any children of FocusableWidget
 * element accepts
 * @param id - required
 * @param open - Query Selector to all the widget's open triggers
 * @param close - Query Selector to all the widget's close triggers
 * @param [open-class] - Optional class to add to widget when opened
 * @param [body-open-class] - Optional class to add to body when opened
 * @class
 */
class FocusableWidget extends HTMLElement {
  /**
   * Creates Focusable Widget
   * @param {Object} config - Configuration object
   * @param {String} config.name - widget name, used for classnames and for providing useful error messages
   * @param {String} config.background - query selector to widget background
   * @param {Array} [config.widgetOpenClasses] - optional classes to add to widget when opened
   * @param {Array} [config.bodyOpenClasses] - optional classes to add to body when widget is opened
   * @param {Object} [config.attributes] - optional attributes to add to element upon initialization.
   *                                       example: {'data-custom-attr': true }
   */
  constructor(config = {}) {
    super();

    if (!config.name)
      throw new Error(`Focusable Widget(${config.name}) must have a name`);
    if (!this.id) throw new Error(`${config.name} must have an id`);
    if (!config.background)
      throw new Error(
        `Focusable Widget(${config.name}) must have a background`
      );

    /**
     * Save client config for reinit method
     * @private
     */
    this._clientConfig = config;

    this._init(config);
  }

  /**
   * Opens widget. If already opened, does nothing.
   * @usage document.querySelector('[js-my-widget]').open()
   * @returns {HTMLElement} widget
   * @public
   */
  open = (evt) => {
    if (this._isOpen) return;
    this._closeFocusableWidgets();
    return this.toggle(evt);
  }

  /**
   * Closes widget. If already closed, does nothing.
   * @usage document.querySelector('[js-my-widget]').close()
   * @returns {HTMLElement} widget
   * @public
   */
  close = () => {
    if (!this._isOpen) return;
    return this.toggle();
  }

  /**
   * Toggles widget.
   * @usage document.querySelector('[js-my-widget]').toggle()
   * @returns {HTMLElement} widget
   * @public
   */
  toggle = (evt) => {
    theme.utils.prepareTransition(this);
    this._toggleClasses();
    this._toggleAccessibilityAttributes();

    if (!this._isOpen) {
      theme.utils.a11y.trapFocus(
        this
      );
      this._bindEvents();
      this._dispatchEvents(this._events.open, ['open'], { detail: evt.target });
    } else {
      theme.utils.a11y.removeTrapFocus(this);
      this._unbindEvents();
      this._dispatchEvents(this._events.close, ['close']);
    }

    this._isOpen = !this._isOpen;
    return this;
  }

  /**
   * Reinitializes the widget
   * @usage document.querySelector('[js-my-widget]').reinitWidget()
   * @public
   */
  reinitWidget = () => {
    this._init(this._clientConfig);
  }

  /**
   * @usage const open = document.querySelector('[js-my-widget]').isOpen;
   * @type {Boolean}
   * @public
   */
  get isOpen() {
    return this._isOpen;
  }

  // ======================================================== PRIVATE METHODS

  /**
   * Initializes entire logic and state
   * @param {Object} config - constructor config param
   * @private
   */
  _init({
    name,
    background,
    widgetOpenClasses = [],
    bodyOpenClasses = [],
    attributes = {},
  }) {
    /**
     * Widget name
     * @type {String} @private
     * */
    this._name = name;

    /** @type {Boolean} @private */
    this._isOpen = false;

    /**
     * @property {String} background - widget background selector
     * @property {String} open - selector to all open triggers
     * @property {String} close - selector to all close triggers
     * @private
     */
    this._selectors = {
      background,
      open: this.getAttribute("open"),
      close: this.getAttribute("close"),
    };

    /**
     * Nodes the widget depends on
     * @property {HTMLElement} background - widget background
     * @private
     */
    this._nodes = {
      background: document.querySelector(this._selectors.background),
    };

    /**
     * Widget events fired on actions to document
     * @private
     */
    this._events = {
      open: ["focusable-widget:open", `${name}:open`, `${this.id}:open`],
      close: ["focusable-widget:close", `${name}:close`, `${this.id}:close`],
    };

    /**
     * Private Widget configuration
     * @property {HTMLAllCollection} open - open triggers
     * @property {HTMLAllCollection} close - close triggers
     * @property {Array} attributes - attributes added to widget upon initialization
     * @property {Array} widgetOpenClasses - classes added to widget when opened
     * @property {String} bodyOpenClasses - classes added to body when widget opened
     * @private
     */
    this._config = {
      open: document.querySelectorAll(this._selectors.open),
      close: document.querySelectorAll(this._selectors.close),
      attributes: {
        "data-focusable-widget": "true",
        "aria-hidden": "true",
        tabindex: 0,
        ...attributes,
      },
      widgetOpenClasses: ["open", this.getAttribute("open-class")].concat(
        widgetOpenClasses
      ),
      bodyOpenClasses: [
        "js-focusable-widget-open",
        `js-${name}-open`,
        this.getAttribute("body-open-class"),
      ].concat(bodyOpenClasses),
    };

    this._validateConfig();
    this._addAccessibilityAttributes();
    this._setupListeners();
  }

  /**
   * Validates widget config, throwing useful errors if invalid
   * @private
   */
  _validateConfig() {
    if (!this._config.open || !this._config.open.length)
      console.warn(`WARN: ${this._name}: no open triggers found. Check your ${this._name} 'open' attribute, or add a trigger (if needed)`)

    if (!this._config.close || !this._config.close.length)
      throw new Error(
        `${this._name}: invalid close trigger selector, no elements found. Check your ${this._name} 'close' attribute`
      );
  }

  /**
   * Setups initialization event listeners
   * @private
   */
  _setupListeners() {
    this._config.open.forEach((open) =>
      open.addEventListener("click", this._open.bind(this))
    );
    this._config.close.forEach((close) =>
      close.addEventListener("click", this._close.bind(this))
    );
    this.addEventListener("click", (e) => e.stopPropagation());
  }

  /**
   * Internal open wrapper, to keep our public methods clean, internally deals with event object
   * @param {object} event
   * @private
   */
  _open(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.open(event);
  }

  /**
   * Internal close wrapper, to keep our public methods clean, internally deals with event object
   * @param {object} event
   * @private
   */
  _close = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close();
  }

  /**
   * Closes any open focusable widgets
   * @private
   */
  _closeFocusableWidgets() {
    const openWidgets = document.querySelectorAll(
      "[data-focusable-widget].open"
    );
    openWidgets.forEach((widget) => widget.close());
  }

  /**
   * Dispatches an array of custom events on document
   * @param {Array} events - this._events.<event>
   */
  _dispatchEvents(globalEvents, elementEvents, detail = {}) {
    globalEvents.forEach(e => document.dispatchEvent(new CustomEvent(e, detail)))
    if (elementEvents && elementEvents.length)
    elementEvents.forEach(e => this.dispatchEvent(new CustomEvent(e, detail)))
  }

  /**
   * Binds events needed for opened widget
   * @private
   */
  _bindEvents() {
    document.addEventListener("keyup", this._onKeyUp);
    this._nodes.background.addEventListener("click", this._close);
    this._nodes.background.addEventListener("touchmove", this._onTouchMove);
  }

  /**
   * Unbinds events added when widget was opened
   * @private
   */
  _unbindEvents() {
    document.removeEventListener("keyup", this._onKeyUp);
    this._nodes.background.removeEventListener("click", this._close);
    this._nodes.background.removeEventListener(
      "touchmove",
      this._onTouchMove
    );
  }

  /**
   * Toggles classes based on current widget state
   * @private
   */
  _toggleClasses() {
    if (this._isOpen) {
      // Body classes
      this._config.bodyOpenClasses.forEach((className) => {
        if (!className) return;
        document.body.classList.remove(className);
      });

      // Widget Classes
      this._config.widgetOpenClasses.forEach((className) => {
        if (!className) return;
        this.classList.remove(className);
      });
    } else {
      // Body classes
      this._config.bodyOpenClasses.forEach((className) => {
        if (!className) return;
        document.body.classList.add(className);
      });

      // Widget Classes
      this._config.widgetOpenClasses.forEach((className) => {
        if (!className) return;
        this.classList.add(className);
      });
    }
  }

  /**
   * Toggles a11y attributes based on current widget state
   * @private
   */
  _toggleAccessibilityAttributes() {
    if (this._isOpen) {
      this.setAttribute("aria-hidden", "true");
      this.setAttribute("tabindex", "-1");
      this._config.open.forEach((open) =>
        open.setAttribute("aria-expanded", "false")
      );
      this._config.close.forEach((close) =>
        close.setAttribute("aria-expanded", "false")
      );
    } else {
      this.setAttribute("aria-hidden", "false");
      this.setAttribute("tabindex", "0");
      this._config.open.forEach((open) =>
        open.setAttribute("aria-expanded", "true")
      );
      this._config.close.forEach((close) =>
        close.setAttribute("aria-expanded", "true")
      );
    }
  }

  /**
   * Adds a11y attributes to widget and triggers
   * @private
   */
  _addAccessibilityAttributes() {
    const addA11yAttributes = (el) => {
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", this.id);
    };

    for (const attr in this._config.attributes) {
      this.setAttribute(attr, this._config.attributes[attr]);
    }
    this._config.open.forEach(addA11yAttributes);
    this._config.close.forEach(addA11yAttributes);
  }

  /**
   * Closes widget on esc key press
   * @param {object} event
   * @private
   */
  _onKeyUp = (event) => {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.close();
  }

  /**
   * Lock scrolling on mobile
   * @returns {Boolean}
   * @private
   */
  _onTouchMove = () => {
    return false;
  }
}

export default FocusableWidget;
