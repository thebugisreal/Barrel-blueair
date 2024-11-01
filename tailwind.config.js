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
      // add custom colors here, refer to: https://tailwindcss.com/docs/customizing-colors
    },
    fontWeight: {
      400: 400,
      700: 700,
    },
    fontFamily: {
      // add font families here:
      // ex: sans: ['Helvetica', 'sans-serif']
    },
    fontSize: {
      16: "16px",
    },
    spacing: {
      //add spacing as needed. keep multiples of 4, comment any anomalies
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
