import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin to run Shopify theme dev concurrently
 */
export default function shopifyDevPlugin() {
  let shopifyProcess = null;

  return {
    name: 'vite-plugin-shopify-theme-dev',

    configureServer() {
      // Get store from CLI parameter
      const storeArgIndex = process.argv.indexOf('--store');
      let store = null;
      let storeSource = null;

      if (storeArgIndex !== -1 && process.argv[storeArgIndex + 1]) {
        store = process.argv[storeArgIndex + 1];
        storeSource = 'CLI parameter';
      }
      // Fallback to environment variable
      else if (process.env.SHOPIFY_STORE || process.env.STORE) {
        store = process.env.SHOPIFY_STORE || process.env.STORE;
        storeSource = 'environment variable';
      }
      // Fallback to package.json
      else {
        const packageJsonPath = path.resolve(__dirname, '../..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        store = packageJson.store;
        storeSource = 'package.json';
      }

      if (!store) {
        console.error('❌ Error: No store specified. Use --store flag, SHOPIFY_STORE env variable, or set "store" in package.json');
        return;
      }

      // Normalize: support both bare name ("5ef43d-4a") and full domain ("5ef43d-4a.myshopify.com")
      const storeDomain = store.endsWith('.myshopify.com') ? store : `${store}.myshopify.com`;

      console.log(`📦 Using store from ${storeSource}: ${storeDomain}`);

      // Build Shopify CLI command
      const args = ['theme', 'dev', '-s', storeDomain];

      // Get theme ID from CLI parameter -> env variable
      const themeArgIndex = process.argv.indexOf('--theme');
      const themeIdArgIndex = process.argv.indexOf('--theme-id');
      let themeId = null;
      let themeSource = null;

      if (themeArgIndex !== -1 && process.argv[themeArgIndex + 1]) {
        themeId = process.argv[themeArgIndex + 1];
        themeSource = 'CLI parameter';
      } else if (themeIdArgIndex !== -1 && process.argv[themeIdArgIndex + 1]) {
        themeId = process.argv[themeIdArgIndex + 1];
        themeSource = 'CLI parameter';
      }
      // Fallback to environment variable
      else if (process.env.THEME_ID) {
        themeId = process.env.THEME_ID;
        themeSource = 'environment variable';
      }

      if (themeId) {
        args.push('-t', themeId);
        console.log(`🎨 Using theme ID from ${themeSource}: ${themeId}`);
      }

      args.push('--notify', '/tmp/theme.update');

      console.log(
        `🛍️  Starting Shopify theme dev: ${storeDomain}${
          themeId ? ` (Theme ID: ${themeId})` : ''
        }`
      );

      // Spawn the Shopify CLI process
      shopifyProcess = spawn('shopify', args, {
        stdio: 'inherit',
        shell: true,
      });

      shopifyProcess.on('error', (err) => {
        console.error('❌ Failed to start Shopify theme dev:', err);
      });

      shopifyProcess.on('close', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`❌ Shopify theme dev exited with code ${code}`);
        }
      });
    },

    closeBundle() {
      // Clean up Shopify process when Vite closes
      if (shopifyProcess) {
        shopifyProcess.kill();
      }
    },
  };
}
