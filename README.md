# Blueair Shopify Theme

### Theme Version: Vite + Shopify CLI Integration

Modern Shopify theme built with Vite for fast development and optimized builds.

### Tech Stack
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformations
- **Shopify CLI** - Theme development and deployment
- **vite-plugin-shopify** - Shopify-specific Vite integration

### Dependencies

- Node.js (v18+ recommended)
- pnpm, yarn, or npm
- Shopify CLI

  > Install with: `npm install -g @shopify/cli @shopify/theme`
  > Documentation: https://shopify.dev/docs/themes/tools/cli

### Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Login to Shopify CLI**
   ```bash
   shopify theme dev --store <your-store>
   ```
   Follow prompts to authenticate with your store.

3. **Start development**
   ```bash
   # Development with specific store
   pnpm dev           # Default store (5ef43d-4a)
   pnpm dev:us        # US store (5ef43d-4a)
   pnpm dev:eu        # EU store (blueeudev)
   pnpm dev:uk        # UK store (uk-blueair)
   ```

   This starts:
   - Vite dev server at `http://localhost:5173`
   - Shopify theme preview at `http://127.0.0.1:9292`

4. **Build for production**
   ```bash
   pnpm build
   ```

### Project Structure

```
/
├── assets/              # Shopify theme assets
├── config/              # Theme configuration
├── layout/              # Theme layouts
├── sections/            # Theme sections
├── snippets/            # Liquid snippets
├── templates/           # Page templates
├── locales/            # Translation files
└── src/                # Source files (Vite)
    ├── entrypoints/     # Vite entry points
    ├── scripts/         # JavaScript modules
    ├── styles/          # CSS/PostCSS files
    └── vite-plugins/    # Custom Vite plugins
```

### Available Scripts

- `pnpm dev` - Start development (default US store)
- `pnpm dev:us` - Start development (US store)
- `pnpm dev:eu` - Start development (EU store)
- `pnpm dev:uk` - Start development (UK store)
- `pnpm build` - Build for production

### Features

- **Hot Module Replacement** via Vite
- **Live Theme Preview** via Shopify CLI
- **Multi-store Support** with store-specific scripts
- **Automatic Asset Optimization**
- **Tailwind CSS** with JIT compilation
- **Modern CSS** with PostCSS plugins
- **Source Maps** for debugging
