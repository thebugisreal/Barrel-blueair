/**
  * Quantity Input Component
  * --------------------------------------------------------------------------------
  * @summary wrapper for quantity input and it's buttons.
  * @emits change
  * @usage
    <quantity-input class="quantity">
    <button class="quantity__button" name="minus" type="button">
      <span class="sr-only">Decrease quantity for {{ product.title }}</span>
      &minus;
    </button>
    <input class="quantity__input"
        type="number"
        name="quantity"
        id="Quantity-{{ section.id }}"
        min="1"
        value="1"
        form="{{ product_form_id }}"
      >
    <button class="quantity__button" name="plus" type="button">
      <span class="sr-only">Increase quantity for {{ product.title }}</span>
      &plus;
    </button>
  </quantity-input>
*/

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.currentTarget.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}
