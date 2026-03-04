import FocusableWidget from '../global/focusable-widget.js';

/**
 * Modal Component
 * --------------------------------------------------------------------
 * @summary modal custom element component, must have an id and
 * specified open/close triggers. There must be a close trigger inside
 * the modal container.
 *
 * See parent focusable-widget.js events and public methods for complete documentation.
 *
 * @usage
 * <s-modal id="MyModal" class="{{styling classes}}" open="[open-my-modal]" close="[close-my-modal]">
 *   CONTENTS, make sure to include a close button in here.
 * </s-modal>
 * @usage to manipulate programatically: document.querySelector('#MyModal').open();
 *
 * @emits modal:open on document
 * @emits modal:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 *
 * The following parameters are attributes that the <modal> element takes
 * @param id - required
 * @param open - Query Selector to all the drawer's open triggers
 * @param close - Query Selector to all the drawer's close triggers
 * @param [open-class] - Optional class to add to drawer when opened
 * @param [body-open-class] - Optional class to add to body when opened
 */
class Modal extends FocusableWidget {
  constructor() {
    super({
      name: "modal",
      background: ".modal-background",
      bodyOpenClasses: 'js-modal-open'
    });
  }
}

export default Modal;