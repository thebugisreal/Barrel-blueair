window.theme = window.theme || {};

// Apply safari-glass-ui class to body if iOS 26 or higher in order to account for safari glass UI.
document.addEventListener("DOMContentLoaded", () => {
    if(theme.utils.isIOS26()){
        document.body.classList.add("safari-glass-ui")
        document.documentElement.classList.add("safari-glass-ui")
    }
});

/*================ Global ================*/
import '../scripts/global/shopify_common.js';
import '../scripts/global/config.js';
import '../scripts/global/utils.js';
import '../scripts/global/focusable-widget.js';

/*================ Components ================*/
import '../scripts/components/drawers.js';
import '../scripts/components/modals.js';
import '../scripts/components/accordion.js';
import '../scripts/components/tabs.js';
import '../scripts/components/carousel.js';
import '../scripts/components/video.js';
import '../scripts/components/header.js';

import '../scripts/components/cart.js';
import '../scripts/components/product-options.js';
import '../scripts/components/quantity-input.js';
import '../scripts/components/loading-spinner.js';
import '../scripts/components/predictive-search.js';
import '../scripts/components/filter-sort.js';
import '../scripts/components/active-filters.js';
import '../scripts/components/price-range.js';
import '../scripts/components/product-card.js';
import '../scripts/components/country-select.js';
import '../scripts/components/country-select-modal.js';
import '../scripts/components/section__image-caption-modal.js';
import '../scripts/components/product-card__upsell.js';
import '../scripts/components/product-upsell.js';
import '../scripts/components/compare-banner.js';
import '../scripts/components/compare-grid.js';
import '../scripts/components/faq.js';
import '../scripts/components/product-viewer.js';
import '../scripts/components/buystack-modal.js';

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
customElements.define('product-viewer', ProductViewer);

customElements.define('faq-posts', FaqPosts);
customElements.define('faq-search-results', FaqSearchResults);

customElements.define('country-select', CountrySelect);
customElements.define('country-select-modal', CountrySelectModal);

customElements.define('image-caption-modal', ImageCaptionModal);
customElements.define('buystack-modal', BuystackModal);

/*================ Sections ================*/
import '../scripts/sections/collection__grid.js';
import '../scripts/sections/product__main.js';
import '../scripts/sections/product__recommendations.js';
import '../scripts/sections/section__hotspot.js';
import '../scripts/sections/section__subscription-quiz.js';

customElements.define("s-collection-grid", CollectionGrid);

// end of collection elements

customElements.define('s-product', ProductMain)
customElements.define('product-recommendations', ProductRecommendations);

customElements.define('s-hotspot', Hotspot);
customElements.define('subscription-quiz', SubscriptionQuiz);


/*================ Templates ================*/
import '../scripts/components/warranty-devices.js';
import '../scripts/templates/account.js';
import '../scripts/templates/login.js';

customElements.define('warranty-devices', WarrantyDevices);
customElements.define("s-account", Account);
customElements.define("s-login", Login);
