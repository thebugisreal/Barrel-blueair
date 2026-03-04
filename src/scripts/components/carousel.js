/**
 * Carousel Component
 * --------------------------------------------------------------------
 * @summary carousel, uses swiper, dots are optional, and arrows are optional
 *
 * See https://swiperjs.com/swiper-api#parameters for more carousel options
 *
 * @usage
 *
 *     {%- capture carousel_options -%}
 *       {
 *         "slidesPerView": "auto",
 *         "loop": false,
 *         ...
 *       }
 *     {%- endcapture -%}
 *      <s-carousel data-options='{{carousel_options}}' data-init="{{breakpoint}}">
 *        <div id="{{custom_id}}" class="swiper" js-carousel>
 *          <div class="swiper-wrapper">
 *            <div class="swiper-slide" js-carousel-slide></div>
 *            ...
 *          </div>
 *          <div class="swiper-button-prev {{prev_button_class}}"></div>
 *          <div class="swiper-button-next {{next_button_class}}"></div>
 *          <div class="swiper-pagination {{pagination_class}}"></div>
 *        </div>
 *      </s-carousel>
 *
 * The following parameters are attributes that the <s-carousel> element takes
 * @param data-options - object containing swiper options
 *                       ex.{"slidesPerView":"auto", "loop":false}
 *                       only needed if modifying or extending on default options
 *                       be careful with syntax here you have to use single quote on the outside,
 *                       and double quotes in the capture so that the JSON.parse() doesn't error.
 *                       DEFAULT OPTIONS:
 *                          loop: true,
 *                          slidesPerView: 'auto',
 *                          grabCursor: true,
 *                          centeredSlides: false,
 *                          on: {init: this._onReady},
 *
 * @param data-init - use to initialize or destroy carousel at certain widths.
 *                    pass in variable from theme.config.mediaQueries (/global/config.js)
 *
 *                    enquire match/unmatch is pretty specific, so follow the rules below:
 *                    if mobile = destroyed, higher width = initialized, use a max-width variable
 *                    if mobile = intialized, higher width = destroyed, use a min-width variable
 *
 *                    if breakpoint does not exist, feel free to add to config.js
 *
 * The following are selectors that the <s-carousel> searches for
 * [js-carousel] - required, this contains the slides and the arrows.
 * id - required, should be same element as [js-carousel]
 * .swiper - required class
 * .swiper-wrapper - required class
 * [js-carousel-slide] - required, each slide element needs this (differentiates from the arrows)
 * .swiper-slide - required class
 * .swiper-pagination - optional, custom {{pagination_class}} required if using pagination
 * .swiper-button-prev - optional, custom {{prev_button_class}} required if using navigation
 * .swiper-button-next - optional, custom {{next_button_class}} required if using navigation
 */

 class Carousel extends HTMLElement {
  constructor() {
    super();

    this.selectors = {
      carousel: '[js-carousel]'
    }

    this.options = {
      loop: true,
      slidesPerView: 'auto',
      grabCursor: true,
      centeredSlides: false,
      navigation: false,
      pagination: false,
    }
  }

  connectedCallback() {
    const extendedOptions = this.dataset.options ? JSON.parse(this.dataset.options) : {}
    this.options = Object.assign(this.options, extendedOptions)
    this._initCarousel();

    if (this.hasAttribute('data-controller')) {
      // Ensure carousel is initialized before linking
      setTimeout(() => {
        this._linkCarousels(this.dataset.controller);
      }, 100);
    }
  }

  // Initialize carousel
  _initCarousel() {
    let id = `#${this.querySelector(this.selectors.carousel).id}`;
    if (typeof this.dataset.init !== 'undefined') {
      //do nothing initially, init at larger points
      enquire.register(theme.config.mediaQueries[this.dataset.init],{
        match: function(){
          this.carousel = new Swiper(id, this.options)
        }.bind(this),
        unmatch: function(){
          if (this.carousel.el.classList.contains('swiper-initialized')) {
            this.carousel.destroy(true, true);
          }
        }.bind(this)
      })
    }else{
      this.carousel = new Swiper(id, this.options)
    }
  }

  _linkCarousels(controllerId) {
    const controllerElement = document.querySelector(`#${controllerId}`);
    if (!controllerElement || !controllerElement.parentElement) {
      console.warn(`Controller carousel #${controllerId} not found`);
      return;
    }

    const controllerCarousel = controllerElement.parentElement.carousel;
    if (!controllerCarousel) {
      console.warn(`Controller carousel not initialized for #${controllerId}`);
      return;
    }

    if (!this.carousel || !this.carousel.thumbs) {
      console.warn('Thumbs module not available or carousel not initialized');
      return;
    }

    this.carousel.thumbs.swiper = controllerCarousel;
    this.carousel.thumbs.init();
  }
}

export default Carousel;