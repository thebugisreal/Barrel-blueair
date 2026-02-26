import shopify from 'vite-plugin-shopify';
import pageReload from 'vite-plugin-page-reload';
import cleanup from '@by-association-only/vite-plugin-shopify-clean';
import shopifyThemeDevPlugin from './src/vite-plugins/shopify-theme-dev';

export default {
  plugins: [
    cleanup({
      manifestFileName: 'manifest.json',
    }),
    shopify({
      themeRoot: './',
      sourceCodeDir: 'src',
      entrypointsDir: 'src/entrypoints',
    }),
    pageReload('/tmp/theme.update', {
      log: false,
      delay: 20000,
    }),
    shopifyThemeDevPlugin(),
  ],
  build: {
    emptyOutDir: false,
    manifest: 'manifest.json',
  },
  css: {
    devSourceMap: true,
  },
  server: {
    cors: true,
  },
};
