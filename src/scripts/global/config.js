/**
 * Theme Configuration
 * ----------------------------------------------------------
 */
theme.config = {
  mediaQueries: {
    landscapeAll: 'screen and (orientation: landscape)',
    landscape: 'screen and (orientation: landscape), screen and (min-width: 48rem)',
    belowTablet: 'screen and (max-width: 47.99rem)',
    tablet: 'screen and (min-width: 48rem)',
    belowLaptop: 'screen and (max-width: 63.99rem)',
    laptop: 'screen and (min-width: 64rem)',
    belowDesktop: 'screen and (max-width: 64rem)',
    desktop: 'screen and (min-width: 64.01rem)',
    belowWidescreen: 'screen and (max-width: 79.99rem)',
    widescreen: 'screen and (min-width: 80rem)',
    belowExtrawide: 'screen and (max-width: 89.99rem)',
    extrawide: 'screen and (min-width: 90rem)'
  },
  money: {
    format: `${window.currency.symbol || "$"}{{amount}}`,
    currencySymbols: {
        USD: "$", // US Dollar
        CAD: "$", // CA Dollar
        EUR: "€", // Euro
        CRC: "₡", // Costa Rican Colón
        GBP: "£", // British Pound Sterling
        ILS: "₪", // Israeli New Sheqel
        INR: "₹", // Indian Rupee
        JPY: "¥", // Japanese Yen
        KRW: "₩", // South Korean Won
        NGN: "₦", // Nigerian Naira
        PHP: "₱", // Philippine Peso
        PLN: "zł", // Polish Zloty
        PYG: "₲", // Paraguayan Guarani
        THB: "฿", // Thai Baht
        UAH: "₴", // Ukrainian Hryvnia
        VND: "₫", // Vietnamese Dong
    }
  },
  upsellLimit: 6
};