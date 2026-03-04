// Import vendor libraries
import '../scripts/vendor/enquire-wrapper.js';  // Exposes window.enquire
import '../scripts/vendor/vue@3.2.6.min.js';

// Import Swiper with modern ES modules
import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

// Configure Swiper to use modules
Swiper.use([Navigation, Pagination, Thumbs]);

// Expose Swiper globally for carousel component
window.Swiper = Swiper;
