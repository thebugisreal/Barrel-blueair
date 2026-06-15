# Code Review Guidelines

These guidelines apply to all code reviews in this Shopify theme project.

---

## Shopify Liquid

### Color Settings — CRITICAL

Shopify `color` type settings **never** return blank. They always resolve to one of two values:
- The color the merchant configured, OR
- `rgba(0,0,0,0)` (fully transparent) when no color is set

**This is a bug — always flag it:**
```liquid
{% if section.settings.background_color != blank %}
{% if block.settings.text_color != blank %}
{% if section.settings.button_color != blank %}
```

**This is correct:**
```liquid
{% if section.settings.background_color != 'rgba(0,0,0,0)' %}
{% if block.settings.text_color != 'rgba(0,0,0,0)' %}
```

How to identify a color setting: check the section schema for `"type": "color"`, or look for setting IDs containing `_color` (e.g., `background_color`, `text_color`, `border_color`, `button_color`, `icon_color`).

Do **not** suggest adding `!= blank` checks to color settings either — the only valid guard is `!= 'rgba(0,0,0,0)'`.

---

### Section Schema

Every section file must include a `{% schema %}` block with at minimum:
- `name`
- `settings`
- `presets`

`tag`, `class`, and `blocks` are optional — only include when functionally required. Do not require `blocks` unless the section actually supports dynamic blocks.

---

### Whitespace Control

Do **not** apply `{%-` or `-%}` whitespace control to `{% if %}` / `{% endif %}` tags placed inside an HTML element's opening tag attribute list. Whitespace between HTML attributes does not affect rendering.

Inside a `{%- liquid -%}` block, control-flow statements (`if`, `elsif`, `else`, `endif`) do **not** use `{% %}` delimiters — this is correct syntax, not a bug.

---

### Liquid Variable Assignment

You cannot directly assign the result of a conditional expression to a variable in Liquid — flag this pattern as invalid.

`!= blank` is valid Liquid syntax for checking if a variable is not blank (for non-color settings).

---

### HTML & Accessibility

- Enforce semantic HTML with proper heading hierarchy and landmark elements.
- Use `<button>` for actions, `<a>` for navigation — flag misuse.
- Clickable overlay patterns must use `aria-hidden="true"` and `tabindex="-1"` on the overlay link, with a separate visible accessible text link as the primary interaction.

---

## JavaScript / TypeScript

- Check that `prefers-reduced-motion` is respected before applying animations.
- Web Components must implement `disconnectedCallback` to clean up event listeners.
- Prefer `const`; use `let` only when reassignment is necessary.
- Use optional chaining (`?.`) instead of verbose null/undefined guards.
- Store DOM selectors in a `SELECTORS` constant and CSS class names in a `CLASSES` constant.
- Use `trapFocus()` / `removeTrapFocus()` from `@/lib/a11y` for focus management in modals and overlays.
- In Shadow DOM, use `:focus:not(:focus-visible) { outline: none; }` to remove focus rings for pointer interactions while keeping keyboard accessibility.

---

## CSS / SCSS

### Tailwind v4

- `!important` uses **postfix** notation: `border-0!`, `hover:bg-red-500!` — do **not** flag this as invalid, and do **not** suggest the v3 prefix notation (`!border-0`).
- `min-h-auto` is valid in Tailwind v4.
- `not-last:` variant (e.g., `not-last:mr-1`) is valid native Tailwind v4 syntax.
- `@utility`, `@apply`, `@layer`, `@theme`, `@custom-variant` are first-class Tailwind v4 directives — do **not** flag them as unknown at-rules.
- Stylelint `nesting-selector-no-missing-scoping-root` errors in Tailwind v4 files are false positives.

### General

- Do **not** suggest splitting `@apply` onto multiple lines.
- `@import` is acceptable only in Vite entry point files (e.g., `theme.css`) that aggregate styles for bundling — in all other files, let Vite handle imports.
- CSS variable inconsistencies may be intentional during codebase migrations — do not flag without clear evidence of a bug.
