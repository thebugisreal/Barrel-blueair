// Apply safari-glass-ui class to body if iOS 26 or higher in order to account for safari glass UI.
document.addEventListener("DOMContentLoaded", () => {
    if(theme.utils.isIOS26()){
        document.body.classList.add("safari-glass-ui")
        document.documentElement.classList.add("safari-glass-ui")
    }
});

/*================ Global ================*/
import '../scripts/global/theme.js';
import '../scripts/global/shopify_common.js';
import '../scripts/global/config.js';
import '../scripts/global/utils.js';

/*================ Components ================*/
import Drawer from '../scripts/components/drawers.js';
import Modal from '../scripts/components/modals.js';
import Accordion from '../scripts/components/accordion.js';
import Tabs from '../scripts/components/tabs.js';
import Carousel from '../scripts/components/carousel.js';
import Video from '../scripts/components/video.js';
import SiteHeader from '../scripts/components/header.js';

import { CartRemoveButton, CartItems, CartNote, CartDrawer, CartDrawerItems, CartSubscription } from '../scripts/components/cart.js';
import ProductOptions from '../scripts/components/product-options.js';
import QuantityInput from '../scripts/components/quantity-input.js';
import LoadingSpinner from '../scripts/components/loading-spinner.js';
import PredictiveSearch from '../scripts/components/predictive-search.js';
import FilterSort from '../scripts/components/filter-sort.js';
import ActiveFilters from '../scripts/components/active-filters.js';
import PriceRange from '../scripts/components/price-range.js';
import ProductCard from '../scripts/components/product-card.js';
import QuickView from '../scripts/components/quick-view.js';
import CountrySelect from '../scripts/components/country-select.js';
import CountrySelectModal from '../scripts/components/country-select-modal.js';
import ImageCaptionModal from '../scripts/components/section__image-caption-modal.js';
import { ProductCardUpsell, VariantCardUpsell } from '../scripts/components/product-card__upsell.js';
import ProductUpsell from '../scripts/components/product-upsell.js';
import CompareBanner from '../scripts/components/compare-banner.js';
import CompareGrid from '../scripts/components/compare-grid.js';
import SoundComparison from '../scripts/components/sound-comparison.js';
import { FaqPosts, FaqSearchResults } from '../scripts/components/faq.js';
import ProductViewer from '../scripts/components/product-viewer.js';
import BuystackModal from '../scripts/components/buystack-modal.js';

customElements.define("s-drawer", Drawer);
customElements.define("s-modal", Modal);
customElements.define("s-accordion", Accordion);
customElements.define("s-tabs", Tabs);
customElements.define("s-carousel", Carousel);
customElements.define("s-video", Video);

customElements.define('cart-remove-button', CartRemoveButton);
customElements.define('cart-items', CartItems);
customElements.define('cart-note', CartNote);
customElements.define('cart-drawer', CartDrawer);
customElements.define('cart-drawer-items', CartDrawerItems);
customElements.define('cart-subscription', CartSubscription);

customElements.define("s-header", SiteHeader);

customElements.define("product-options", ProductOptions);
customElements.define("quantity-input", QuantityInput);
customElements.define("loading-spinner", LoadingSpinner);
customElements.define("predictive-search", PredictiveSearch);
customElements.define("filter-sort", FilterSort);
customElements.define('active-filters', ActiveFilters);
customElements.define('price-range', PriceRange);
customElements.define('product-card', ProductCard);
customElements.define('product-card-upsell', ProductCardUpsell);
customElements.define('variant-card-upsell', VariantCardUpsell);
customElements.define('product-upsell', ProductUpsell);
customElements.define('compare-banner', CompareBanner);
customElements.define('compare-grid', CompareGrid);
customElements.define('s-sound-comparison', SoundComparison);
customElements.define('product-viewer', ProductViewer);
customElements.define('quick-view', QuickView);

customElements.define('faq-posts', FaqPosts);
customElements.define('faq-search-results', FaqSearchResults);

customElements.define('country-select', CountrySelect);
customElements.define('country-select-modal', CountrySelectModal);

customElements.define('image-caption-modal', ImageCaptionModal);
customElements.define('buystack-modal', BuystackModal);

/*================ Sections ================*/
import CollectionGrid from '../scripts/sections/collection__grid.js';
import ProductMain from '../scripts/sections/product__main.js';
import ProductRecommendations from '../scripts/sections/product__recommendations.js';
import Hotspot from '../scripts/sections/section__hotspot.js';
import SubscriptionQuiz from '../scripts/sections/section__subscription-quiz.js';

customElements.define("s-collection-grid", CollectionGrid);

// end of collection elements

customElements.define('s-product', ProductMain)
customElements.define('product-recommendations', ProductRecommendations);

customElements.define('s-hotspot', Hotspot);
customElements.define('subscription-quiz', SubscriptionQuiz);


/*================ Templates ================*/
import WarrantyDevices from '../scripts/components/warranty-devices.js';
import Account from '../scripts/templates/account.js';
import Login from '../scripts/templates/login.js';

customElements.define('warranty-devices', WarrantyDevices);
customElements.define("s-account", Account);
customElements.define("s-login", Login);
