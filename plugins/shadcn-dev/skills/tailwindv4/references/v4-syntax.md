# Tailwind CSS v4 Complete Syntax Reference

Comprehensive reference for all Tailwind CSS v4 syntax and configuration.

## CSS-First Configuration

### @import

```css
/* Entry point - imports all of Tailwind */
@import "tailwindcss";

/* With layers explicitly */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

### @theme Block

Define design tokens directly in CSS:

```css
@theme {
  /* All values become CSS variables and utility classes */
  --color-brand: oklch(0.7 0.15 200);
  --font-display: "Cal Sans", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 1920px;
}
```

## Color Configuration

### OKLCH Format (Recommended)

```css
@theme {
  /* OKLCH: Lightness (0-1), Chroma (0-0.4), Hue (0-360) */
  --color-primary: oklch(0.6 0.18 250);
  --color-primary-light: oklch(0.8 0.10 250);
  --color-primary-dark: oklch(0.4 0.15 250);
}
```

### Full Color Scale

```css
@theme {
  --color-blue-50: oklch(0.97 0.01 240);
  --color-blue-100: oklch(0.93 0.03 240);
  --color-blue-200: oklch(0.87 0.06 240);
  --color-blue-300: oklch(0.79 0.10 240);
  --color-blue-400: oklch(0.70 0.14 240);
  --color-blue-500: oklch(0.60 0.18 240);
  --color-blue-600: oklch(0.50 0.18 240);
  --color-blue-700: oklch(0.42 0.15 240);
  --color-blue-800: oklch(0.35 0.12 240);
  --color-blue-900: oklch(0.28 0.08 240);
  --color-blue-950: oklch(0.20 0.06 240);
}
```

### Other Formats

```css
@theme {
  /* Hex */
  --color-brand: #3b82f6;

  /* RGB */
  --color-brand: rgb(59 130 246);

  /* HSL */
  --color-brand: hsl(217 91% 60%);

  /* Named colors */
  --color-brand: blue;
}
```

## Typography

### Font Families

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Merriweather", ui-serif, Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-display: "Cal Sans", "Inter", sans-serif;
}
```

### Font Sizes

```css
@theme {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Custom sizes */
  --text-tiny: 0.625rem;
  --text-huge: 4rem;
}
```

### Font Weights

```css
@theme {
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;
}
```

### Line Heights

```css
@theme {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Letter Spacing

```css
@theme {
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

## Spacing

```css
@theme {
  --spacing-0: 0px;
  --spacing-px: 1px;
  --spacing-0.5: 0.125rem;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
  --spacing-32: 8rem;
  --spacing-40: 10rem;
  --spacing-48: 12rem;
  --spacing-56: 14rem;
  --spacing-64: 16rem;
  --spacing-72: 18rem;
  --spacing-80: 20rem;
  --spacing-96: 24rem;

  /* Custom */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;
}
```

## Border Radius

```css
@theme {
  --radius-none: 0px;
  --radius-sm: 0.125rem;
  --radius-default: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* Custom */
  --radius-4xl: 2rem;
}
```

## Shadows

```css
@theme {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-none: 0 0 #0000;
}
```

## Breakpoints

```css
@theme {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Custom */
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;
}
```

## Transitions

```css
@theme {
  /* Durations */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* Timing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Custom */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

## Animations

```css
@theme {
  --animate-spin: spin 1s linear infinite;
  --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-bounce: bounce 1s infinite;

  /* Custom */
  --animate-fade-in: fade-in 0.3s var(--ease-fluid);
  --animate-slide-up: slide-up 0.3s var(--ease-out);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## CSS Variable Syntax

### In HTML Classes

```html
<!-- v4: Use parentheses for CSS variables -->
<div class="bg-(--brand-color)"></div>
<div class="text-(--text-primary)"></div>
<div class="border-(--border-color)"></div>

<!-- v3 (old): Square brackets - deprecated -->
<div class="bg-[--brand-color]"></div>
```

### In CSS

```css
/* v4: Direct CSS variable usage */
.custom {
  background: var(--color-brand);
  padding: var(--spacing-4);
  font-family: var(--font-display);
}

/* v3 (old): theme() function - deprecated */
.custom {
  background: theme(colors.brand);
  padding: theme(spacing.4);
}
```

## Content Sources

### Automatic Detection

v4 automatically detects content from imports:

```css
@import "tailwindcss";
/* Content sources automatically detected */
```

### Explicit Sources

```css
@import "tailwindcss";

/* Add additional sources */
@source "../components/**/*.tsx";
@source "../lib/**/*.ts";
```

## Layers

```css
@import "tailwindcss";

@layer base {
  /* Base styles */
  html {
    font-family: var(--font-sans);
  }
}

@layer components {
  /* Component classes */
  .btn-primary {
    @apply bg-primary text-primary-foreground px-4 py-2 rounded-md;
  }
}

@layer utilities {
  /* Custom utilities */
  .text-balance {
    text-wrap: balance;
  }
}
```

## Generated Output

All `@theme` values become CSS variables:

```css
/* Generated :root styles */
:root {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-brand-500: oklch(0.6 0.18 250);
  --spacing-18: 4.5rem;
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

These can be used anywhere:

```css
.custom {
  font-family: var(--font-display);
  color: var(--color-brand-500);
  padding: var(--spacing-18);
  transition: all 0.3s var(--ease-spring);
}
```

```js
// In JavaScript
const brandColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-brand-500')
```

## Dark Mode

```css
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.1 0 0);
  }

  .dark {
    --background: oklch(0.1 0 0);
    --foreground: oklch(0.98 0 0);
  }
}
```

Usage remains the same:

```html
<div class="bg-background text-foreground">
  Content adapts to theme
</div>
```

## Container Queries

Native container query support:

```html
<div class="@container">
  <div class="@md:flex @lg:grid @lg:grid-cols-2">
    <!-- Responds to container width -->
  </div>
</div>
```

## Resources

- Tailwind v4 Docs: https://tailwindcss.com/docs
- Upgrade Guide: https://tailwindcss.com/docs/upgrade-guide
- OKLCH Picker: https://oklch.com
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
