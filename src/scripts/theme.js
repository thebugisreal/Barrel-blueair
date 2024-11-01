window.theme = window.theme || {};

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
// =require components/header.js

// =require components/cart.js
// =require components/product-options.js
// =require components/quantity-input.js
// =require components/loading-spinner.js
// =require components/predictive-search.js
// =require components/filter-sort.js
// =require components/active-filters.js
// =require components/price-range.js

customElements.define("s-drawer", Drawer);
customElements.define("s-modal", Modal);
customElements.define("s-accordion", Accordion);
customElements.define("s-tabs", Tabs);
customElements.define("s-carousel", Carousel);

customElements.define('cart-remove-button', CartRemoveButton);
customElements.define('cart-items', CartItems);
customElements.define('cart-note', CartNote);
customElements.define('cart-drawer', CartDrawer);
customElements.define('cart-drawer-items', CartDrawerItems);

customElements.define("s-header", SiteHeader);

customElements.define("product-options", ProductOptions);
customElements.define("quantity-input", QuantityInput);
customElements.define("loading-spinner", LoadingSpinner);
customElements.define("predictive-search", PredictiveSearch);
customElements.define("filter-sort", FilterSort);
customElements.define('active-filters', ActiveFilters);
customElements.define('price-range', PriceRange);

/*================ Sections ================*/
// =require sections/collection__grid.js
// =require sections/product__main.js
// =require sections/product__recommendations.js

customElements.define("s-collection-grid", CollectionGrid);

// end of collection elements

customElements.define('s-product', ProductMain)
customElements.define('product-recommendations', ProductRecommendations);

/*================ Templates ================*/
// =require templates/account.js

customElements.define("s-account", Account);
