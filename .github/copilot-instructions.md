# Blueair Shopify Theme - Copilot Instructions

## Repository Overview

This is a modern Shopify theme for Blueair, built with Vite for fast development and optimized production builds. The theme is a large e-commerce project with extensive customization including custom components, product templates, and multi-store support.

## Tech Stack & Versions

- **Node.js**: v18+ (tested with v20.19.4)
- **Package Manager**: pnpm (v10.12.2) - **Always use pnpm, not npm or yarn**
- **Build Tool**: Vite v5.0.11
- **CSS Framework**: Tailwind CSS v3.4.3 (JIT mode)
- **CSS Processor**: PostCSS v8.4.33
- **Shopify CLI**: Required for development (installed globally at `~/.local/share/pnpm/shopify`)
- **Runtime**: ES Modules (`"type": "module"` in package.json)

## Project Structure

```
/
├── src/                           # Source files (Vite input)
│   ├── entrypoints/              # Vite entry points
│   │   ├── theme.js              # Main JS entry (imports all components)
│   │   ├── theme.css             # Main CSS entry (imports all styles)
│   │   ├── vendor.js             # Vendor JS (Swiper)
│   │   └── vendor.css            # Vendor CSS
│   ├── scripts/                  # JavaScript modules
│   │   ├── components/          # Web components & UI elements
│   │   ├── global/              # Global utilities & configs
│   │   ├── sections/            # Section-specific scripts
│   │   ├── templates/           # Template-specific scripts
│   │   └── vendor/              # Third-party integrations
│   ├── styles/                   # CSS/PostCSS files
│   │   ├── components/          # Component styles
│   │   ├── global/              # Global styles & layouts
│   │   ├── sections/            # Section styles
│   │   ├── templates/           # Template styles
│   │   └── account/             # Account page styles
│   └── vite-plugins/            # Custom Vite plugins
│       └── shopify-theme-dev.js # Auto-starts Shopify CLI dev
│
├── assets/                        # Compiled assets (Vite output)
│   ├── manifest.json             # Vite manifest
│   ├── theme-*.css               # Compiled main styles
│   ├── theme-*.js                # Compiled main scripts
│   ├── vendor-*.css              # Compiled vendor styles
│   └── vendor-*.js               # Compiled vendor scripts
│
├── config/                        # Shopify theme configuration
│   ├── settings_schema.json     # Theme settings definition
│   └── settings_data.json       # Theme settings data
│
├── layout/                        # Shopify layouts
│   ├── theme.liquid              # Main layout
│   └── password.liquid           # Password page layout
│
├── sections/                      # Shopify sections (~150+ files)
├── snippets/                      # Reusable Liquid snippets
├── templates/                     # Page templates (300+ variants)
│   └── customers/                # Customer account templates
├── locales/                       # Translation files (en, de, fr, zh-CN, zh-TW)
│
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.cjs            # PostCSS configuration (CommonJS)
├── package.json                  # Dependencies & scripts
├── .shopifyignore                # Files ignored by Shopify
└── .gitignore                    # Git ignore rules
```

## Build & Development Commands

### Installation (ALWAYS FIRST)
```bash
pnpm install
```
**Never skip this step after pulling changes.** Dependencies are managed with pnpm.

### Development
```bash
# Default US store
pnpm dev

# Or specify store:
pnpm dev:us    # US store (5ef43d-4a)
pnpm dev:eu    # EU store (blueeudev)
pnpm dev:uk    # UK store (uk-blueair)
```

**What happens during dev:**
1. Vite dev server starts at `http://localhost:5173`
2. Custom plugin automatically spawns Shopify CLI: `shopify theme dev -s <store>`
3. Shopify preview available at `http://127.0.0.1:9292`
4. Hot Module Replacement (HMR) enabled
5. Theme changes trigger Shopify refresh via `/tmp/theme.update` notify file

**Store Configuration:**
- Store can be specified via `--store` CLI parameter, `SHOPIFY_STORE` env var, or `package.json`
- Theme ID can be specified via `--theme` or `--theme-id` CLI parameter, or `THEME_ID` env var
- Supports both bare names (`5ef43d-4a`) and full domains (`5ef43d-4a.myshopify.com`)

### Production Build
```bash
pnpm build
```

**Build output:**
- Compiles to `assets/` directory
- Generates `manifest.json` for asset mapping
- Does NOT empty output dir (`emptyOutDir: false`)
- Typical build time: ~4 seconds
- Output files use content hashes (e.g., `theme-BNnm26OX.css`)

**Build verification:**
After running `pnpm build`, verify these files exist:
- `assets/manifest.json`
- `assets/theme-*.css` and `assets/theme-*.js`
- `assets/vendor-*.css` and `assets/vendor-*.js`

## Configuration Files

### vite.config.js
- Uses `vite-plugin-shopify` for Shopify integration
- Custom cleanup plugin: `@by-association-only/vite-plugin-shopify-clean`
- Page reload plugin watches `/tmp/theme.update`
- Custom plugin `shopify-theme-dev.js` handles Shopify CLI spawning
- CORS enabled for dev server
- Source maps enabled in development

### tailwind.config.js
- **JIT mode enabled**
- Content paths include: `assets/`, `config/`, `layout/`, `sections/`, `snippets/`, `templates/`, `src/`
- Custom breakpoints: `mobile`, `tabletp`, `tabletl`, `desktop`, `laptop`, `widescreen`, `extrawide`
- Custom color palette (blue, green, pink, yellow, brown, gray)
- Custom font families: Gilroy (primary), Roboto (secondary)
- Custom spacing scale: `xxxs` (4px) to `xxxxl` (160px)
- Custom font sizes: 12px to 72px
- Extended: `minHeight.header` uses CSS variable `--header-height`

### postcss.config.cjs (CommonJS format)
Plugin order matters:
1. `postcss-import` - Process @import statements
2. `postcss-mixins` - Enable CSS mixins
3. `tailwindcss/nesting` - Tailwind nesting support
4. `tailwindcss` - Process Tailwind directives
5. `postcss-preset-env` - Modern CSS features (nesting disabled)
6. `postcss-flexbugs-fixes` - Fix flexbox bugs
7. `postcss-nested` - Nested CSS rules

### .shopifyignore
**Critical:** These files are NOT uploaded to Shopify:
- Source directory: `src/*`
- Config files: `vite.config.js`, `tailwind.config.js`, `postcss.config.cjs`
- Lock files: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
- Package manager: `package.json`, `README.md`

## Key Architectural Notes

### Custom Web Components
The theme uses custom elements defined in `theme.js`:
- `<s-drawer>` - Drawer component
- `<s-modal>` - Modal dialogs
- `<s-accordion>` - Accordion panels
- `<s-tabs>` - Tab navigation
- `<s-carousel>` - Carousel/slider (uses Swiper)

### Entry Points
Two main entry points in `src/entrypoints/`:
1. **theme.js** - Imports all component scripts, defines custom elements
2. **theme.css** - Imports all styles (Tailwind + custom CSS)
3. **vendor.js** - Third-party libraries (Swiper v12.1.1)
4. **vendor.css** - Vendor styles

### Asset Compilation Flow
1. Source files in `src/` → Vite processes → Output to `assets/`
2. Liquid files reference compiled assets via manifest
3. Vite manifest maps original filenames to hashed output filenames

### Multi-Store Support
Theme supports multiple Shopify stores with store-specific dev scripts. Each store may have different theme IDs and configurations.

## Common Pitfalls & Solutions

### Always Use pnpm
**Do NOT use npm or yarn.** The project is configured for pnpm. Using other package managers may cause dependency resolution issues.

### Shopify CLI Authentication
First time running dev commands requires Shopify CLI authentication. If you see authentication prompts, follow them to log in to the Shopify partner account.

### Build Before Deployment
**Always run `pnpm build` before deploying or committing theme changes.** The `assets/` directory must contain up-to-date compiled files.

### Hot Reload Delay
The page reload plugin has a 20-second delay (`delay: 20000`) to account for Shopify theme upload time. This is intentional.

### File Watching
If HMR stops working, check that `/tmp/theme.update` file is writable. The Shopify CLI uses this file with `--notify` flag to trigger reloads.

### PostCSS Configuration
`postcss.config.cjs` uses CommonJS (`.cjs` extension) because of specific plugin requirements. Do not convert to ES modules.

## Validation Steps

### After Making Changes:
1. Run `pnpm build` - Should complete in ~4 seconds without errors
2. Check `assets/` directory for updated files with new hashes
3. Verify `assets/manifest.json` is updated
4. Test in dev mode: `pnpm dev` and check preview at `http://127.0.0.1:9292`

### Before Committing:
1. Ensure `pnpm build` runs successfully
2. Verify no TypeScript or linting errors (none configured currently)
3. Test theme functionality in Shopify preview
4. Check that only necessary files are staged (don't commit `node_modules/`)

## No CI/CD Pipelines
**Important:** This repository has no CI/CD or automated testing configured (no `.github/workflows/`). All validation is manual through Shopify preview.

## Performance Notes
- Typical Vite build time: ~3-4 seconds
- Vite dev server starts in ~1-2 seconds
- Shopify CLI dev mode takes ~10-20 seconds to initialize
- Large repository: 150+ sections, 300+ template variants, extensive component library

## Available Skills

This project includes specialized skills for common workflows. Skills are documented in `.github/skills/` and are automatically available to Copilot.

### Backup Themes Skill
**Location**: `.github/skills/create-backup-themes/SKILL.md`

Creates date-stamped backup branches from the remote `live/*` branches for all 3 stores (US, EU, UK).

**Usage**: Say "create backup", "backup themes", "backup live", or run `pnpm backup-themes`

### Release Skill
**Location**: `.github/skills/release/SKILL.md`

Manages the Shopify theme release process end-to-end. Handles creating release branches, merging Jira ticket branches, version bumping, changelog updates, and merging to main.

**Usage**: Say "release", "prepare release", "create release", or reference ticket IDs (e.g., "release RET-123, RET-124")

**Key Features**:
- Main is the source of truth (deployed via CI/CD)
- Automatic backup of live themes before release
- Smart merge strategy (direct merge vs cherry-pick)
- Integrates with Jira MCP and GitHub MCP
- No asset building required (handled by CI/CD)
- Local merge to main (user pushes manually)

## Trust These Instructions
These instructions were validated by running actual commands and exploring the codebase thoroughly. Only search for additional information if:
- The instructions are incomplete for your specific task
- You encounter errors not documented here
- The codebase structure has significantly changed

When in doubt, refer to these instructions first to minimize exploration time and build failures.
