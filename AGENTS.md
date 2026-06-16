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

### CSS `:empty` Does Not Work in Liquid Templates — CRITICAL

The CSS `:empty` pseudo-class (and its Tailwind equivalent `empty:hidden`) requires **zero child nodes**, including whitespace text nodes. Liquid tags (`{% for %}`, `{% if %}`, `{% assign %}`, etc.) produce whitespace text nodes in rendered HTML, so `:empty` almost never matches a Liquid-rendered container.

**This does not work as intended — flag it:**
```html
<div class="... empty:hidden">
  {% for item in collection %}
    {% if item.visible %}
      <span>{{ item.title }}</span>
    {% endif %}
  {% endfor %}
</div>
```
Even when the loop renders nothing visible, whitespace text nodes from Liquid tags remain, so `:empty` never fires and the element (with its border, padding, etc.) still renders.

**Correct pattern — use a Liquid boolean flag:**
```liquid
{% assign show_container = false %}
{% for item in collection %}
  {% if item.visible %}
    {% assign show_container = true %}
  {% endif %}
{% endfor %}

{% if show_container %}
  <div class="...">
    {% for item in collection %}
      {% if item.visible %}<span>{{ item.title }}</span>{% endif %}
    {% endfor %}
  </div>
{% endif %}
```

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

### Cross-file DOM Dependency Verification — CRITICAL

When a PR touches both a template file (Liquid, PHP, HubL, HTML) and a JavaScript file, **always verify** that every DOM selector queried in JS is actually rendered by the template. This is a common source of silent runtime errors that only surface on specific page types or component states.

**Process:**
1. Identify all DOM selectors referenced in changed JS files — attribute selectors, class selectors, IDs, data attributes, custom `js-*` hooks, etc.
2. Search the corresponding template files for each selector — including partials, snippets, or includes rendered via `{% render %}`, `<?php get_template_part() ?>`, `{% include %}`, etc.
3. If a JS selector has no corresponding element in the rendered output for any code path in the PR, flag it as a potential TypeError during initialization.

**Example — flag this:**
```js
// JS expects this element to exist
this.priceCopy = this.container.querySelector('[js-filter-price-copy]');
this.priceCopy.innerHTML = updatedContent; // throws TypeError if element absent
```
```liquid
{# The PR adds this JS but never renders an element with js-filter-price-copy #}
```

**Correct fix:** either render the element in the template, or add a null guard in JS (`this.priceCopy?.innerHTML = ...`).

**Also flag the reverse:** template attributes or IDs that no JS in the PR queries — likely dead markup from a refactor.

This applies to all template engines used in this team's projects: Shopify Liquid, WordPress PHP, HubSpot HubL.

---

### Null Safety for Optional DOM Elements

When querying elements that may not exist in all render contexts (quick view, additional subscription, different `pdp_type`), always guard before accessing properties:

```js
// Bad — throws when element absent
this.filterPriceCopy.innerHTML = content;
el.querySelector('.hidden').classList.remove('hidden');

// Good
this.filterPriceCopy?.innerHTML = content;
el.querySelector('.hidden')?.classList.remove('hidden');
```

If `querySelector` result is used immediately, store it and guard:
```js
const priceCopy = triggerTarget.querySelector(this._selectors.priceCopy);
if (priceCopy && this.filterPriceCopy) {
  this.filterPriceCopy.innerHTML = priceCopy.innerHTML;
}
```

---

### General

- Check that `prefers-reduced-motion` is respected before applying animations.
- Web Components must implement `disconnectedCallback` to clean up event listeners.
- Prefer `const`; use `let` only when reassignment is necessary.
- Use optional chaining (`?.`) instead of verbose null/undefined guards.
- Store DOM selectors in a `_selectors` object (this project convention) or a `SELECTORS` constant.
- Use `trapFocus()` / `removeTrapFocus()` from `@/lib/a11y` for focus management in modals and overlays.
- In Shadow DOM, use `:focus:not(:focus-visible) { outline: none; }` to remove focus rings for pointer interactions while keeping keyboard accessibility.

---

## CSS / SCSS

### Tailwind Arbitrary Value Syntax — CRITICAL

Square-bracket syntax (`[value]`) is **only** for raw CSS values that don't exist as Tailwind tokens. It is **not** for Tailwind named tokens.

**This is invalid — flag it:**
```html
<div class="gap-[sm] p-[md] text-[blue] mt-[xs]">
```
The browser receives `gap: sm` (or `padding: md`, etc.) which is not valid CSS and is silently dropped. The rule has no effect.

**This is correct:**
```html
<div class="gap-sm p-md text-blue mt-xs">     <!-- named Tailwind tokens: no brackets -->
<div class="gap-[22px] p-[1.5rem] mt-[3px]">  <!-- raw CSS values: brackets required -->
```

**Rule of thumb:** if the value inside `[...]` is a Tailwind spacing/color/size token (sm, md, lg, xs, xl, blue, gray, etc.), remove the brackets. If it's a pixel value, rem, percentage, or other raw CSS unit, brackets are correct.

---

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

---

## SVG

- If a path uses `stroke` for rendering (not `fill`), always set `fill="none"` explicitly on the path element. Without it, the default black fill overlaps the stroke.

```svg
<!-- Bad: black fill will overlay the stroke -->
<path d="..." stroke="currentColor" stroke-width="2"/>

<!-- Good -->
<path d="..." stroke="currentColor" stroke-width="2" fill="none"/>
```
