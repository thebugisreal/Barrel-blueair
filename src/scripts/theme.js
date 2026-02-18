window.theme = window.theme || {};

// Apply safari-glass-ui class to body if iOS 26 or higher in order to account for safari glass UI.
document.addEventListener("DOMContentLoaded", () => {
    if(theme.utils.isIOS26()){
        document.body.classList.add("safari-glass-ui")
        document.documentElement.classList.add("safari-glass-ui")
    }
});

/*================ Global ================*/
// =require global/shopify_common.js
// =require global/config.js
// =require global/utils.js
// =require global/focusable-widget.js

/*================ Components ================*/
// =require components/drawers.js
// =require components/modals.js
// =require components/accordion.js
// =require components/tabs.js
// =require components/carousel.js
// =require components/video.js
// =require components/header.js

// =require components/cart.js
// =require components/product-options.js
// =require components/quantity-input.js
// =require components/loading-spinner.js
// =require components/predictive-search.js
// =require components/filter-sort.js
// =require components/active-filters.js
// =require components/price-range.js
// =require components/product-card.js
// =require components/country-select.js
// =require components/country-select-modal.js
// =require components/section__image-caption-modal.js
// =require components/product-card__upsell.js
// =require components/product-upsell.js
// =require components/compare-banner.js
// =require components/compare-grid.js
// =require components/faq.js
// =require components/product-viewer.js
// =require components/buystack-modal.js

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
// =require sections/collection__grid.js
// =require sections/product__main.js
// =require sections/product__recommendations.js
// =require sections/section__hotspot.js
// =require sections/section__subscription-quiz.js

customElements.define("s-collection-grid", CollectionGrid);

// end of collection elements

customElements.define('s-product', ProductMain)
customElements.define('product-recommendations', ProductRecommendations);

customElements.define('s-hotspot', Hotspot);
customElements.define('subscription-quiz', SubscriptionQuiz);


/*================ Templates ================*/
// =require components/warranty-devices.js
// =require templates/account.js
// =require templates/login.js

customElements.define('warranty-devices', WarrantyDevices);
customElements.define("s-account", Account);
customElements.define("s-login", Login);
