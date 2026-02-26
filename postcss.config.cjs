module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-mixins': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
    },
    'postcss-flexbugs-fixes': {},
    'postcss-nested': {},
  },
};
