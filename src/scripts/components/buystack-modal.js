import FocusableWidget from '../global/focusable-widget.js';

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
    this.mainCarouselSwiper = null;
    this.mainCarouselContainer = null;
    this.videos = []; // Array of video elements only
    this.isChainPlaying = false;
    this.currentVideoIndex = 0;
  }

  connectedCallback() {
    // super.connectedCallback();
    this._findMainCarouselContainer();
    this._initializeCarouselSlides();
    this._initEventListeners();
    this._initializeMainCarouselAutoplay();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  /**
   * Find and cache the main carousel container
   */
  _findMainCarouselContainer() {
    this.mainCarouselContainer = document.querySelector(`#${this.dataset.carouselId}`);
  }

  /**
   * Initialize carousel slides with click handlers
   */
  _initializeCarouselSlides() {
    // Wait for DOM to be ready and use cached carousel container
    const checkForCarousel = () => {
      if (this.mainCarouselContainer) {
        this._setupSlideHandlers(this.mainCarouselContainer);
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

  /**
   * Initialize main carousel autoplay chain functionality
   */
  _initializeMainCarouselAutoplay() {
    const checkForMainCarousel = () => {
      if (this.mainCarouselContainer) {
        this._setupMainCarouselChain(this.mainCarouselContainer);
      } else {
        setTimeout(checkForMainCarousel, 100);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForMainCarousel);
    } else {
      checkForMainCarousel();
    }
  }

  /**
   * Setup autoplay chain for main carousel
   */
  _setupMainCarouselChain(carouselContainer) {
    // Get reference to main carousel swiper
    const carouselElement = carouselContainer.closest('.pdp-buystack-carousel').querySelector('s-carousel');

    if (carouselElement) {
      const waitForSwiper = () => {
        if (carouselElement.carousel) {
          this.mainCarouselSwiper = carouselElement.carousel;
          this._initializeVideoChain(carouselContainer);
        } else {
          setTimeout(waitForSwiper, 100);
        }
      };
      waitForSwiper();
    }
  }

  /**
   * Initialize video chain events
   */
  _initializeVideoChain(carouselContainer) {
    const videos = carouselContainer.querySelectorAll('video[data-video-index]');
    this.videos = Array.from(videos); // Cache video elements

    this.videos.forEach((video, videoArrayIndex) => {
      // Listen for video ended event
      video.addEventListener('ended', () => {
        this._handleMainVideoEnded(videoArrayIndex);
      });

      // Listen for user interaction to pause chain
      video.addEventListener('play', () => {
        if (videoArrayIndex === this.currentVideoIndex) {
          this.isChainPlaying = true;
        }
      });

      video.addEventListener('pause', () => {
        // Don't stop chain if video ended naturally
        if (!video.ended) {
          this.isChainPlaying = false;
        }
      });

      // Add hover functionality
      video.addEventListener('mouseenter', () => {
        this._handleVideoHover(videoArrayIndex);
      });

      video.addEventListener('mouseleave', () => {
        this._handleVideoUnhover(videoArrayIndex);
      });
    });

    // Listen for manual swiper navigation
    if (this.mainCarouselSwiper) {
      this.mainCarouselSwiper.on('slideChange', () => {
        this._handleManualSlideChange();
      });
    }

    // Start the chain with first video
    this.isChainPlaying = true;
    this.currentVideoIndex = 0;
  }

  /**
   * Handle video ended in main carousel
   */
  _handleMainVideoEnded(videoArrayIndex) {
    if (!this.isChainPlaying) return;

    const nextVideoIndex = videoArrayIndex + 1;

    if (nextVideoIndex < this.videos.length) {
      // Play next video in array
      this.currentVideoIndex = nextVideoIndex;
      this._playVideoByArrayIndex(nextVideoIndex);
    } else {
      // End of video chain
      this.isChainPlaying = false;
      // Optionally restart: this._restartVideoChain();
    }
  }

  /**
   * Play video by array index
   */
  _playVideoByArrayIndex(arrayIndex) {
    if (arrayIndex >= 0 && arrayIndex < this.videos.length) {
      const video = this.videos[arrayIndex];
      video.currentTime = 0;
      video.play().catch(e => {
        console.log('Autoplay prevented for main carousel video:', e);
        this.isChainPlaying = false;
      });
    }
  }

  /**
   * Handle video hover - pause chain and play hovered video
   */
  _handleVideoHover(videoArrayIndex) {
    // Pause chain
    this.isChainPlaying = false;

    // Pause all videos
    this._pauseAllMainCarouselVideos();

    // Play hovered video and update current index
    this.currentVideoIndex = videoArrayIndex;
    this._playVideoByArrayIndex(videoArrayIndex);
  }

  /**
   * Handle video unhover - resume chain from current video
   */
  _handleVideoUnhover(videoArrayIndex) {
    // Resume chain from current video
    this.isChainPlaying = true;
  }

  /**
   * Handle manual slide change (user interaction)
   */
  _handleManualSlideChange() {
    if (!this.mainCarouselSwiper) return;

    const newIndex = this.mainCarouselSwiper.activeIndex;

    // Pause all videos first
    this._pauseAllMainCarouselVideos();

    // Update current index
    this.currentVideoIndex = newIndex;

    // Find if current slide has a video and resume chain
    const currentSlideVideo = this.videos.find(video =>
      parseInt(video.dataset.videoIndex, 10) === newIndex
    );

    if (currentSlideVideo) {
      const videoArrayIndex = this.videos.indexOf(currentSlideVideo);
      this.currentVideoIndex = videoArrayIndex;
      this._playVideoByArrayIndex(videoArrayIndex);
      this.isChainPlaying = true;
    }
  }


  /**
   * Pause all videos in main carousel
   */
  _pauseAllMainCarouselVideos() {
    this.videos.forEach(video => {
      video.pause();
    });
  }

  /**
   * Restart video chain from beginning
   */
  _restartVideoChain() {
    this.currentVideoIndex = 0;
    this.isChainPlaying = true;
    this._playVideoByArrayIndex(0);
  }
}

export default BuystackModal;