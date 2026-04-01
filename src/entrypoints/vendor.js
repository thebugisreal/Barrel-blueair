// Import vendor libraries
import '../scripts/vendor/enquire-wrapper.js';  // Exposes window.enquire
import '../scripts/vendor/vue@3.2.6.min.js';

// Import Swiper with modern ES modules
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs, Scrollbar } from 'swiper';

// Configure Swiper to use modules
Swiper.use([Navigation, Pagination, Thumbs, Scrollbar]);

// Expose Swiper globally for carousel component
window.Swiper = Swiper;
