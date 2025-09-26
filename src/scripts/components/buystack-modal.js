/**
 * Buystack Modal Component
 * --------------------------------------------------------------------
 * @summary Modal component for displaying buystack carousel videos in a phone-like interface
 * 
 * Features:
 * - Desktop: Fixed bottom-right position with 9:16 aspect ratio (phone-like)
 * - Mobile: Full-screen overlay
 * - Vertical carousel with up/down navigation (handled by s-carousel)
 * - Auto-play videos when active
 * - Keyboard and touch navigation support
 * - Accessible focus management
 *
 * @usage
 * <buystack-modal id="buystack-modal">
 *   <!-- Modal content generated in Liquid -->
 * </buystack-modal>
 *
 * @emits buystack-modal:open on document
 * @emits buystack-modal:close on document
 * @emits open on element
 * @emits close on element
 */

class BuystackModal extends FocusableWidget {
  constructor() {
    super({
      name: "buystack-modal",
      background: ".buystack-modal-background",
      bodyOpenClasses: 'js-buystack-modal-open'
    });

    this.selectors = {
      closeBtn: '[js-buystack-modal-close]',
      carousel: '[js-buystack-carousel]',
      video: 'video',
      slide: '.swiper-slide'
    };

    this.swiper = null;
  }

  connectedCallback() {
    this._initializeCarouselSlides();
    this._initEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  /**
   * Initialize carousel slides with click handlers
   */
  _initializeCarouselSlides() {
    // Wait for DOM to be ready and find the carousel container
    const checkForCarousel = () => {

      const carouselContainer = document.querySelector(`#${this.dataset.carouselId}`);
      console.log(carouselContainer);
      
      if (carouselContainer) {
        this._setupSlideHandlers(carouselContainer);
      } else {
        // If carousel not found, try again after a short delay
        setTimeout(checkForCarousel, 100);
      }
    };

    // Start checking for carousel
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForCarousel);
    } else {
      checkForCarousel();
    }
  }

  /**
   * Setup click and keyboard handlers for carousel slides
   */
  _setupSlideHandlers(carouselContainer) {
    const slides = carouselContainer.querySelectorAll('[js-buystack-slide]');

    
    slides.forEach((slide) => {
      // Click handler
      slide.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slideIndex = parseInt(slide.dataset.slideIndex, 10);
        this.openAtSlide(slideIndex);
      });

      // Keyboard handler
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          const slideIndex = parseInt(slide.dataset.slideIndex, 10);
          this.openAtSlide(slideIndex);
        }
      });

      // Make slides focusable for accessibility
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('role', 'button');
      slide.setAttribute('aria-label', 'Open video in modal');
    });
  }

  /**
   * Initialize event listeners
   */
  _initEventListeners() {
    // Close button
    const closeBtn = this.querySelector(this.selectors.closeBtn);
    if (closeBtn) {
      closeBtn.addEventListener('click', this.close.bind(this));
    }

    // Keyboard events
    this.addEventListener('keydown', this._handleKeydown.bind(this));

    // Background click to close
    const background = this.querySelector('.buystack-modal-background');
    if (background) {
      background.addEventListener('click', this.close.bind(this));
    }

    // Get reference to the swiper instance from s-carousel component
    this._initSwiper();
  }

  /**
   * Initialize swiper reference and slide change events
   */
  _initSwiper() {
    const carouselElement = this.querySelector('s-carousel');
    if (carouselElement) {
      // Wait for s-carousel to initialize
      const checkSwiper = () => {
        if (carouselElement.carousel) {
          this.swiper = carouselElement.carousel;
          this.swiper.on('slideChange', this._onSlideChange.bind(this));
        } else {
          setTimeout(checkSwiper, 100);
        }
      };
      checkSwiper();
    }
  }

  /**
   * Handle keyboard navigation
   */
  _handleKeydown(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.swiper) this.swiper.slidePrev();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.swiper) this.swiper.slideNext();
        break;
    }
  }

  /**
   * Slide change callback
   */
  _onSlideChange() {
    this._pauseAllVideos();
    this._playCurrentVideo();
  }

  /**
   * Pause all videos in the modal
   */
  _pauseAllVideos() {
    const videos = this.querySelectorAll(this.selectors.video);
    videos.forEach(video => {
      video.pause();
    });
  }

  /**
   * Play the current slide's video if it exists
   */
  _playCurrentVideo() {
    if (!this.swiper) return;
    
    const activeSlide = this.swiper.slides[this.swiper.activeIndex];
    if (!activeSlide) return;

    const video = activeSlide.querySelector(this.selectors.video);
    if (video) {
      video.currentTime = 0;
      video.play().catch(e => {
        // Auto-play failed, which is expected in some browsers
        console.log('Auto-play prevented:', e);
      });
    }
  }

  /**
   * Open modal at specific slide index
   */
  openAtSlide(slideIndex = 0) {
    this.open();
    
    // Navigate to the specified slide after modal opens
    requestAnimationFrame(() => {
      if (this.swiper) {
        this.swiper.slideTo(slideIndex, 0);
        this._playCurrentVideo();
      }
    });
  }

  /**
   * Override open method to handle video playback
   */
  open() {
    super.open();
    
    // Wait for modal to be visible, then play current video
    requestAnimationFrame(() => {
      this._playCurrentVideo();
    });
  }

  /**
   * Override close method to pause videos
   */
  close() {
    this._pauseAllVideos();
    super.close();
  }
}