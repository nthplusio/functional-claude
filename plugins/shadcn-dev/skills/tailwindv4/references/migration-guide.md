# Tailwind CSS v3 to v4 Migration Guide

Complete migration guide for upgrading from Tailwind CSS v3 to v4.

## Prerequisites

Before migrating:
- Ensure your project runs correctly on v3
- Commit all changes to version control
- Review breaking changes below

## Before Upgrading

- Always read the [upgrade documentation](https://tailwindcss.com/docs/upgrade-guide) first
- Ensure the git repository is in a clean state

## Step-by-Step Migration

### 1. Run Automated Upgrade

```bash
npx @tailwindcss/upgrade@latest
```

The tool converts JavaScript config files to CSS format. Review all changes to clean up false positives. Test thoroughly.

### 1a. Manual Install (if not using the upgrade tool)

```bash
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss @tailwindcss/postcss
```

### 2. Update PostCSS Configuration

**Before (v3):**
```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**After (v4):**
```js
// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

### 3. Update Vite Configuration (if using Vite)

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### 4. Convert CSS Imports

**Before (v3):**
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (v4):**
```css
/* globals.css */
@import "tailwindcss";
```

### 5. Migrate tailwind.config.js to CSS

**Before (v3) - tailwind.config.js:**
```js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Satoshi', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
```

**After (v4) - globals.css:**
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand-50: #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-500: #0ea5e9;
  --color-brand-900: #0c4a6e;

  /* Fonts */
  --font-sans: "Inter", sans-serif;
  --font-display: "Satoshi", sans-serif;

  /* Spacing */
  --spacing-128: 32rem;

  /* Border Radius */
  --radius-4xl: 2rem;
}
```

### 6. Update CSS Variable References

**Before (v3):**
```html
<div class="bg-[--brand-color]"></div>
<div class="text-[color:var(--text-primary)]"></div>
```

**After (v4):**
```html
<div class="bg-(--brand-color)"></div>
<div class="text-(--text-primary)"></div>
```

### 7. Replace theme() Function

**Before (v3):**
```css
.custom {
  background: theme(colors.blue.500);
  padding: theme(spacing.4);
  font-family: theme(fontFamily.sans);
}
```

**After (v4):**
```css
.custom {
  background: var(--color-blue-500);
  padding: var(--spacing-4);
  font-family: var(--font-sans);
}
```

### 8. Update Dark Mode (if using class strategy)

v4 continues to support class-based dark mode:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

## Breaking Changes Reference

### Syntax Changes

| v3 | v4 | Notes |
|----|-----|-------|
| `bg-[--var]` | `bg-(--var)` | CSS variable syntax |
| `theme(x.y)` | `var(--x-y)` | Theme function |
| `@tailwind base` | `@import "tailwindcss"` | Import syntax |
| `@apply ...` | CSS variables / components | Never use @apply in v4 |

### Renamed Utilities

| v3 | v4 |
|----|-----|
| `bg-gradient-*` | `bg-linear-*` |
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm` |
| `drop-shadow-sm` / `drop-shadow` | `drop-shadow-xs` / `drop-shadow-sm` |
| `blur-sm` / `blur` | `blur-xs` / `blur-sm` |
| `backdrop-blur-sm` / `backdrop-blur` | `backdrop-blur-xs` / `backdrop-blur-sm` |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (default) | `ring-3` |

### Removed Utilities

| Removed | Replacement |
|---------|-------------|
| `bg-opacity-*` | `bg-black/50` (opacity modifier) |
| `text-opacity-*` | `text-black/50` |
| `border-opacity-*` | `border-black/50` |
| `flex-shrink-*` / `flex-grow-*` | `shrink-*` / `grow-*` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice` / `decoration-clone` | `box-decoration-slice` / `box-decoration-clone` |

### Removed Features

1. **tailwind.config.js** - Use CSS `@theme` instead
2. **autoprefixer requirement** - Built into v4
3. **purge/content config** - Auto-detected from imports
4. **safelist** - Use CSS @source directive instead

### Changed Behavior

1. **Content detection** - Automatic, no config needed
2. **CSS output** - All theme values as CSS variables
3. **Plugin API** - New CSS-based plugin system

## Common Migration Issues

### Issue: Styles not applying

**Cause:** Content paths not detected
**Fix:** Ensure your CSS file imports components:

```css
@import "tailwindcss";
@source "../components/**/*.tsx";
```

### Issue: Custom colors not working

**Cause:** Config not migrated to CSS
**Fix:** Move colors to `@theme` block

### Issue: Dark mode broken

**Cause:** Class strategy needs explicit setup
**Fix:** Ensure `.dark` class variables defined

### Issue: Custom fonts not loading

**Cause:** Font family syntax changed
**Fix:** Use `--font-*` naming in `@theme`

## Verification Checklist

After migration, verify:

- [ ] Dev server starts without errors
- [ ] Styles render correctly
- [ ] Dark mode toggles properly
- [ ] Custom colors appear
- [ ] Custom fonts load
- [ ] Responsive breakpoints work
- [ ] Production build succeeds
- [ ] No console warnings about Tailwind

## Rollback Plan

If migration fails, rollback:

```bash
# Restore from git — the upgrade tool modified files in-place
git checkout -- .

# If you already committed, revert the commit
git revert HEAD
```

## Resources

- Official upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- v4 documentation: https://tailwindcss.com/docs
- GitHub discussions: https://github.com/tailwindlabs/tailwindcss/discussions
