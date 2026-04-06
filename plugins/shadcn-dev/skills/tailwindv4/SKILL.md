---
name: tailwindv4
description: This skill should be used when the user asks about "tailwind v4", "tailwindcss 4", "tailwind css v4", "@theme", "css-first config", "tailwind css variables", "oklch colors", "tailwind upgrade", "migrate to tailwind 4", or mentions Tailwind CSS v4 configuration, new syntax, or migration from v3.
version: 0.3.0
---

# Tailwind CSS v4

Configure and use Tailwind CSS v4 with its CSS-first configuration and new features.

## Key Changes in v4

### CSS-First Configuration

No more `tailwind.config.js` — configure directly in CSS:

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
/* v3: @tailwind base; @tailwind components; @tailwind utilities; */
/* v4: */
@import "tailwindcss";
```

### CSS Variable Syntax Change

```html
<!-- v3: bg-[--brand-color]  →  v4: bg-(--brand-color) -->
```

### theme() Function Replacement

Use `var(--color-red-500)` instead of `theme(colors.red.500)`.

## Upgrading to v4

Always read the [upgrade guide](https://tailwindcss.com/docs/upgrade-guide) first. Run the automated upgrade tool:

```bash
npx @tailwindcss/upgrade@latest
```

For detailed step-by-step migration, see [references/migration-guide.md](references/migration-guide.md).

## Installation

### New Project

```bash
npm install tailwindcss @tailwindcss/postcss
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

Define design tokens directly in CSS. All theme values become CSS variables at `:root`.

### Colors

```css
@theme {
  --color-brand-50: oklch(0.98 0.02 200);
  --color-brand-500: oklch(0.7 0.15 200);
  --color-brand-900: oklch(0.3 0.1 200);
}
```

v4 encourages OKLCH for perceptually uniform colors. For complete color scale patterns, see [references/oklch-colors.md](references/oklch-colors.md).

### Typography

```css
@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Satoshi", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

For spacing, breakpoints, animations, and full `@theme` syntax, see [references/v4-syntax.md](references/v4-syntax.md).

## Container Queries

```html
<div class="@container">
  <div class="@lg:flex @lg:gap-4">
    <!-- Responds to container width, not viewport -->
  </div>
</div>
```

## Renamed Utilities (v4)

ALWAYS use the v4 name — the v3 names no longer work:

| v3 | v4 |
|----|-----|
| `bg-gradient-*` | `bg-linear-*` |
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm` |
| `drop-shadow-sm` / `drop-shadow` | `drop-shadow-xs` / `drop-shadow-sm` |
| `blur-sm` / `blur` | `blur-xs` / `blur-sm` |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (default) | `ring-3` |

## Removed Utilities (v4)

NEVER use these — use the replacement:

| Removed | Replacement |
|---------|-------------|
| `bg-opacity-*`, `text-opacity-*` | Opacity modifiers: `bg-black/50` |
| `flex-shrink-*` / `flex-grow-*` | `shrink-*` / `grow-*` |
| `tailwind.config.js` | `@theme` in CSS |
| `bg-[--var]` | `bg-(--var)` |
| `theme(colors.x)` | `var(--color-x)` |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `autoprefixer` | Built-in |

## Key Rules

- **Never use `@apply`** — use CSS variables or framework components
- **Use `gap` not `space-x-*`/`space-y-*`** in flex/grid layouts
- **Use line-height modifiers** — `text-base/7` not `text-base leading-7`
- **Use `min-h-dvh`** not `min-h-screen` (mobile Safari bug)
- **Use `size-*`** when width and height are equal
- **Use opacity modifiers** — `bg-red-500/60` not `bg-red-500 bg-opacity-60`

For the complete rules reference, see [references/tailwind-rules.md](references/tailwind-rules.md).

## v4.1 Features

```html
<!-- Text Shadows -->
<h1 class="text-shadow-lg">Large shadow</h1>

<!-- Masking -->
<div class="mask-t-from-50%">Top fade</div>

<!-- New Gradient Types -->
<div class="bg-radial-[at_50%_75%] from-sky-200 to-indigo-900"></div>
<div class="bg-conic-180 from-indigo-600 via-indigo-50 to-indigo-600"></div>
```

## shadcn/ui with Tailwind v4

Update globals.css for v4 syntax:

```css
@import "tailwindcss";

@theme {
  --radius: 0.5rem;
}

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

## Reference Files

| File | Contents | Read when... |
|------|----------|-------------|
| [references/tailwind-rules.md](references/tailwind-rules.md) | v4.1+ best practices, removed/renamed utilities, layout rules, common pitfalls | Writing or reviewing Tailwind classes |
| [references/v4-syntax.md](references/v4-syntax.md) | Complete @theme, variables, layers, spacing, shadows, animations | Configuring theme or writing custom CSS |
| [references/migration-guide.md](references/migration-guide.md) | Step-by-step v3→v4 migration | Upgrading an existing project |
| [references/oklch-colors.md](references/oklch-colors.md) | OKLCH color system, scales, semantic colors, conversion | Designing custom color palettes |

## Resources

- Tailwind v4 docs: https://tailwindcss.com/docs
- Upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- OKLCH color picker: https://oklch.com
