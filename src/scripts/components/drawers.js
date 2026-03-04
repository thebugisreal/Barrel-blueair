import FocusableWidget from '../global/focusable-widget.js';

/**
 * Drawer Component
 * --------------------------------------------------------------------
 * @summary drawer custom element component, must have an id, position and
 * specified open/close triggers. There must be a close trigger inside
 * the drawer container.
 *
 * See parent focusable-widget.js events and public methods for complete documentation.
 *
 * @usage <s-drawer id="MyDrawer" position="left" open="[open-my-drawer]" close="[close-my-drawer]">CONTENT</s-drawer>
 * @usage to manipulate programatically: document.querySelector('#MyDrawer').open();
 *
 * @emits drawer:open on document
 * @emits drawer:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 *
 * The following parameters are attributes that the <s-drawer> element takes
 * @param id - required
 * @param position - 'left', 'right', 'top', 'bottom'
 * @param open - Query Selector to all the drawer's open triggers
 * @param close - Query Selector to all the drawer's close triggers
 * @param [open-class] - Optional class to add to drawer when opened
 * @param [body-open-class] - Optional class to add to body when opened
 * @module
 *
 * If you must extend the drawer's functionality, use inheritance:
 * class Ajaxcart extends Drawer {...}
 */
class Drawer extends FocusableWidget {
  constructor() {
    super({
      name: "drawer",
      background: ".drawer-background"
    });

    const position = this.getAttribute("position");
    if (!position) throw new Error("drawer must have position attribute");

    /** @type {string} @private */
    this._position = position;

    // Add position class to body when drawer opens
    this._config.bodyOpenClasses.push(`js-drawer-${position}-open`);

    // This makes it persist if the widget gets re-initialized
    this._clientConfig.bodyOpenClasses = [`js-drawer-${position}-open`]
  }

  /**
   * Drawer position: 'top', 'right', 'bottom', 'left'
   * @usage const position = document.querySelector('[js-my-drawer]').position;
   * @type {string}
   * @public
   */
  get position() {
    return this._position;
  }
}

export default Drawer;
