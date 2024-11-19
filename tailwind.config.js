module.exports = {
  mode: "jit",
  purge: {
    content: [
      './src/**/*.html',
      './src/**/*.json',
      './src/**/*.svg',
      './src/**/*.liquid',
      './src/**/*.js',
      './src/**/*.svg',
    ],
    safelist: [
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      landscape: { raw: "(orientation: landscape), (min-width: 768px)" },
      "landscape-all": { raw: "(orientation: landscape)" },
      tabletp: "768px",
      tabletl: "1024px",
      desktop: "1025px",
      laptop: "1140px",
      widescreen: "1280px",
      extrawide: "1440px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: {
        true: "#000000",
        DEFAULT: "#000000",
      },
      blue: {
        light: "#F0F3F6",
        sky: "#BAE6FF",
        medium: "#405D7F",
        DEFAULT: "#002955"
      },
      green: {
        light: "#C9EADC",
        dark: "#558080"
      },
      pink: {
        light: "#FFE2E2",
        fuschia:"#F65275",
        dark: "#80556F"
      },
      yellow: {
        light: "#FFF7CA",
        dark: "#807955"
      },
      brown: {
        light: "#F8E6C6",
        dark: "#805F55"
      },
      gray: {
        DEFAULT: "#D8DBDE",
        athans: "#F0F3F6"
      }
      // add custom colors here, refer to: https://tailwindcss.com/docs/customizing-colors
    },
    fontWeight: {
      300: 300,
      400: 400,
      500: 500,
      700: 700,
      900: 900
    },
    fontFamily: {
      // add font families here:
      // ex: sans: ['Helvetica', 'sans-serif']
      gilroy: ['Gilroy', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif']
    },
    fontSize: {
      12: "12px",
      14: "14px",
      16: "16px",
      18: "18px",
      20: "20px",
      22: "22px",
      26: "26px",
      28: "28px",
      30: "30px",
      40: "40px",
      50: "50px",
      60: "60px",
      72: "72px"
    },
    spacing: {
      //add spacing as needed. keep multiples of 4, comment any anomalies
      "xxxs": "4px",
      "xxs": "8px",
      "xs": "12px",
      "sm": "16px",
      "md": "24px",
      "lg": "36px",
      "xl": "64px",
      "xxl": "80px",
      "xxxl": "128px",
      "xxxxl": "160px",
      0: "0",
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      28: "28px",
      32: "32px",
      36: "36px",
      40: "40px",
      44: "44px",
      48: "48px",
      64: "64px", //used by default for ajax cart placeholders
      72: "72px", //used by default for ajax cart placeholders
    },
    extend: {
      minHeight: {
        header: "calc(100vh - var(--header-height))"
      },
    },
  },
  // include if more variants are necessary. for defaults, refer to: https://tailwindcss.com/docs/configuring-variants
  variants: {
    extend: {
      cursor: ["disabled"],
    },
  },
  plugins: [],
};