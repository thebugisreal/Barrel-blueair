/**
  * Accordion Component
  * --------------------------------------------------------------------
  * @summary accordion component, hides/shows elements based on header button click, auto-collapses sibling accordions by default
  *
  * @usage
  *   <s-accordion data-manual-collapse="false" js-accordion>
  *      <div class="accordion-item" js-accordion-item>
  *        <button class="accordion-header" aria-expanded="true" aria-controls="accordionID" js-accordion-header>Description</button>
  *        <div id="accordionID" class="accordion-content" aria-hidden="false" js-accordion-content>
  *          ...
  *        </div>
  *      </div>
  *    </s-accordion>
  *
  * The following parameters are attributes that the <s-accordion> element takes
  * @param data-manual-collapse - set attribute to "true" to disable auto-collapse siblings
  * @param data-manual-children - set attribute to "false" to disable auto-collapsing children accordions
  *
  * The following are selectors that the <s-accordion> searches for
  * [js-accordion] - required
  * [js-accordion-item] - required
  * [js-accordion-header] - required
  * [js-accordion-content] - required
  * [data-manual-collapse] - optional
  *
  * .accordion-content[aria-hidden="false"] - this styling can be adjusted based on content + desired animation
*/

class Accordion extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      accordion: '[js-accordion]',
      accordionItem: '[js-accordion-item]',
      accordionHeader: '[js-accordion-header]',
      accordionContent: '[js-accordion-content]'
    }
  }

  connectedCallback(){
    this.buttons = this.querySelectorAll(this._selectors.accordionHeader);
    this.buttons.forEach(button => {
      button.addEventListener('click', this._toggleContent)
    })

    this.content = this.querySelectorAll(this._selectors.accordionContent);
  }

  _toggleContent = (e) => {
    e.stopImmediatePropagation();
    const trigger = e.currentTarget;
    const content = this.querySelector(`#${trigger.getAttribute('aria-controls')}`);
    const siblings = theme.utils.getSiblings(trigger.parentElement, this._selectors.accordionItem)
    let isExpanded = trigger.getAttribute('aria-expanded');
    if (isExpanded == 'false') {
      trigger.setAttribute('aria-expanded', true);
      theme.utils.prepareTransition(content);
      this._expandSection(content);

      if (!this.dataset.manualCollapse || this.dataset.manualCollapse == 'false') {
        siblings.forEach((sibling) => {
          const siblingTrigger = sibling.querySelector(this._selectors.accordionHeader);
          const siblingContent = sibling.querySelector(`#${siblingTrigger.getAttribute('aria-controls')}`);
          if (siblingTrigger.getAttribute('aria-expanded') == 'true') {
            siblingTrigger.setAttribute('aria-expanded', false);
            this._collapseSection(siblingContent)
          }
        })
      }
    }else{
      trigger.setAttribute('aria-expanded', false);
      this._collapseSection(content);
    }
  }

  _collapseSection(element) {
    // mark the section as "currently hidden"
    element.setAttribute('aria-hidden', true);

    const buttons = element.querySelectorAll('button');
    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.setAttribute('disabled', '');
      });
    }

  }

  _expandSection(element) {
    // mark the section as "currently not hidden"
    element.style.setProperty('--content-height', `${element.scrollHeight}px`);
    element.setAttribute('aria-hidden', false);

    const buttons = element.querySelectorAll('button');
    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.removeAttribute('disabled');
      });
    }
  }
}

export default Accordion;
