---
name: tailwindv4
description: This skill should be used when the user asks about "tailwind v4", "tailwindcss 4", "tailwind css v4", "@theme", "css-first config", "tailwind css variables", "oklch colors", "tailwind upgrade", "migrate to tailwind 4", or mentions Tailwind CSS v4 configuration, new syntax, or migration from v3.
version: 0.1.3
---

# Tailwind CSS v4

Configure and use Tailwind CSS v4 with its CSS-first configuration and new features.

## Key Changes in v4

### CSS-First Configuration

No more `tailwind.config.js` - configure directly in CSS:

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --color-brand: oklch(0.7 0.15 200);
  --breakpoint-3xl: 1920px;
}
```

### New Import Syntax

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

### CSS Variable Syntax Change

```html
<!-- v3: Square brackets -->
<div class="bg-[--brand-color]"></div>

<!-- v4: Parentheses -->
<div class="bg-(--brand-color)"></div>
```

### theme() Function Replacement

```css
/* v3 */
.my-class {
  background-color: theme(colors.red.500);
}

/* v4: Use CSS variables */
.my-class {
  background-color: var(--color-red-500);
}
```

## Installation

### New Project

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

### PostCSS Configuration

```js
// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

### Vite Configuration

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss()],
})
```

## @theme Block

Define design tokens directly in CSS:

### Colors

```css
@theme {
  /* OKLCH format (recommended) */
  --color-brand-50: oklch(0.98 0.02 200);
  --color-brand-100: oklch(0.95 0.04 200);
  --color-brand-500: oklch(0.7 0.15 200);
  --color-brand-900: oklch(0.3 0.1 200);

  /* HSL also supported */
  --color-accent: hsl(262 83% 58%);
}
```

### Typography

```css
@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Satoshi", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Font sizes */
  --text-tiny: 0.625rem;
  --text-huge: 4rem;
}
```

### Spacing

```css
@theme {
  --spacing-128: 32rem;
  --spacing-144: 36rem;
}
```

### Breakpoints

```css
@theme {
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;
}
```

### Animations

```css
@theme {
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);

  --animate-fade-in: fade-in 0.3s var(--ease-fluid);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Generated CSS Variables

All theme values become CSS variables at `:root`:

```css
/* Generated output */
:root {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-brand-500: oklch(0.7 0.15 200);
}
```

Use anywhere in your CSS or JavaScript:

```css
.custom-element {
  font-family: var(--font-display);
  color: var(--color-brand-500);
}
```

```js
// Access in JavaScript
const brandColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-brand-500')
```

## Migration from v3

### 1. Update Dependencies

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
npm uninstall autoprefixer  # No longer needed
```

### 2. Convert Configuration

**v3 tailwind.config.js:**
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#3b82f6',
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
      },
    },
  },
}
```

**v4 CSS equivalent:**
```css
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-display: "Satoshi", sans-serif;
}
```

### 3. Update Import Syntax

Replace Tailwind directives with single import.

### 4. Update CSS Variable References

Replace square brackets with parentheses for CSS variables.

### 5. Replace theme() Calls

Use CSS variables instead of `theme()` function.

## OKLCH Color Format

v4 encourages OKLCH for perceptually uniform colors:

```css
/* Format: oklch(Lightness Chroma Hue) */
--color-blue: oklch(0.7 0.15 240);
/*              L: 0-1   C: 0-0.4  H: 0-360 */
```

Benefits:
- Perceptually uniform lightness
- Better for generating color scales
- Wider gamut support

### Color Scale Example

```css
@theme {
  --color-blue-50: oklch(0.97 0.02 240);
  --color-blue-100: oklch(0.93 0.04 240);
  --color-blue-200: oklch(0.87 0.08 240);
  --color-blue-300: oklch(0.79 0.12 240);
  --color-blue-400: oklch(0.70 0.15 240);
  --color-blue-500: oklch(0.60 0.18 240);
  --color-blue-600: oklch(0.50 0.18 240);
  --color-blue-700: oklch(0.40 0.16 240);
  --color-blue-800: oklch(0.32 0.12 240);
  --color-blue-900: oklch(0.25 0.08 240);
}
```

## Container Queries

Native support for container queries:

```html
<div class="@container">
  <div class="@lg:flex @lg:gap-4">
    <!-- Responds to container width, not viewport -->
  </div>
</div>
```

## Removed/Changed Features

| v3 | v4 |
|----|-----|
| `tailwind.config.js` | `@theme` in CSS |
| `bg-[--var]` | `bg-(--var)` |
| `theme(colors.x)` | `var(--color-x)` |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `autoprefixer` required | Built-in |
| `purge/content` config | Auto-detected |

## shadcn/ui with Tailwind v4

Update globals.css for v4 syntax:

```css
@import "tailwindcss";

@theme {
  /* shadcn theme variables */
  --radius: 0.5rem;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... rest of shadcn variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

## Reference Files

- **`references/v4-syntax.md`** - Complete v4 syntax reference
- **`references/migration-guide.md`** - Detailed migration steps
- **`references/oklch-colors.md`** - OKLCH color system guide

## Resources

- Tailwind v4 docs: https://tailwindcss.com/docs
- Upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- OKLCH color picker: https://oklch.com
