# Tailwind CSS v4.1+ Rules and Best Practices

Authoritative rules for writing correct Tailwind CSS v4.1+ code. Consult this reference when writing or reviewing Tailwind classes.

## Table of Contents

- [Removed Utilities](#removed-utilities)
- [Renamed Utilities](#renamed-utilities)
- [Layout and Spacing](#layout-and-spacing)
- [Typography](#typography)
- [Color and Opacity](#color-and-opacity)
- [Gradients](#gradients)
- [Responsive Design](#responsive-design)
- [Dark Mode](#dark-mode)
- [CSS Variables and Theme](#css-variables-and-theme)
- [Container Queries](#container-queries)
- [v4.1 Features](#v41-features)
- [Component Patterns](#component-patterns)
- [CSS Nesting](#css-nesting)
- [Common Pitfalls](#common-pitfalls)

## Removed Utilities

NEVER use these — they were removed in v4:

| Removed | Replacement |
|---|---|
| `bg-opacity-*` | `bg-black/50` (opacity modifier) |
| `text-opacity-*` | `text-black/50` |
| `border-opacity-*` | `border-black/50` |
| `divide-opacity-*` | `divide-black/50` |
| `ring-opacity-*` | `ring-black/50` |
| `placeholder-opacity-*` | `placeholder-black/50` |
| `flex-shrink-*` | `shrink-*` |
| `flex-grow-*` | `grow-*` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice` | `box-decoration-slice` |
| `decoration-clone` | `box-decoration-clone` |

## Renamed Utilities

ALWAYS use the v4 name:

| v3 Name | v4 Name |
|---|---|
| `bg-gradient-*` | `bg-linear-*` |
| `shadow-sm` | `shadow-xs` |
| `shadow` (default) | `shadow-sm` |
| `drop-shadow-sm` | `drop-shadow-xs` |
| `drop-shadow` (default) | `drop-shadow-sm` |
| `blur-sm` | `blur-xs` |
| `blur` (default) | `blur-sm` |
| `backdrop-blur-sm` | `backdrop-blur-xs` |
| `backdrop-blur` (default) | `backdrop-blur-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` (default) | `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (default) | `ring-3` |

## Layout and Spacing

### Gap over Space

Always use `gap` in flex/grid layouts. Never use `space-x-*` or `space-y-*` — they add margins to children and break with `flex-wrap`.

```html
<!-- Don't -->
<div class="flex flex-wrap space-x-4">...</div>

<!-- Do -->
<div class="flex flex-wrap gap-4">...</div>
```

### General Spacing

- Prefer top/left margins over bottom/right (unless conditionally rendered)
- Use padding on parent containers instead of bottom margins on last child
- Always use `min-h-dvh` instead of `min-h-screen` — `min-h-screen` is buggy on mobile Safari
- Prefer `size-*` over separate `w-*` and `h-*` when dimensions are equal
- For max-widths, prefer the container scale (e.g., `max-w-2xs` over `max-w-72`)

## Typography

### Line Heights

Never use separate `leading-*` classes. Always use line height modifiers with text size, using fixed values from the spacing scale:

```html
<!-- Don't -->
<p class="text-base leading-7">Text</p>
<p class="text-lg leading-relaxed">Text</p>

<!-- Do -->
<p class="text-base/7">Text with line height modifier</p>
<p class="text-lg/8">Text with specific line height</p>
```

### Font Size Reference

| Utility | Pixels |
|---|---|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |

## Color and Opacity

Never use `bg-opacity-*`, `text-opacity-*`, etc. Use the opacity modifier syntax:

```html
<!-- Don't -->
<div class="bg-red-500 bg-opacity-60">...</div>

<!-- Do -->
<div class="bg-red-500/60">...</div>
```

## Gradients

Always use `bg-linear-*` — the `bg-gradient-*` utilities were renamed in v4.

```html
<!-- Don't -->
<div class="bg-gradient-to-br from-violet-500 to-fuchsia-500"></div>

<!-- Do -->
<div class="bg-linear-to-br from-violet-500 to-fuchsia-500"></div>
```

New gradient types in v4:

```html
<!-- Radial gradients -->
<div class="bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90%"></div>

<!-- Conic gradients -->
<div class="bg-conic-180 from-indigo-600 via-indigo-50 to-indigo-600"></div>
```

## Responsive Design

Only add breakpoint variants when values actually change:

```html
<!-- Don't — redundant breakpoint classes -->
<div class="px-4 md:px-4 lg:px-4">...</div>

<!-- Do -->
<div class="px-4 lg:px-8">...</div>
```

## Dark Mode

Put light mode styles first, then `dark:` variants. Ensure `dark:` comes before other variants:

```html
<div class="bg-white text-black dark:bg-black dark:text-white">
  <button class="hover:bg-gray-100 dark:hover:bg-gray-800">Click</button>
</div>
```

## CSS Variables and Theme

### Accessing Theme Values

All theme values are exposed as CSS variables:

```css
.custom-element {
  background: var(--color-red-500);
  border-radius: var(--radius-lg);
}
```

### The `--spacing()` Function

Use `--spacing()` for spacing calculations:

```css
.custom-class {
  margin-top: calc(100vh - --spacing(16));
}
```

### Extending Theme

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}
```

```html
<div class="bg-mint-500">...</div>
```

### Never Use @apply

Use CSS variables, the `--spacing()` function, or framework components instead. Extract repeated patterns into framework components, not CSS classes.

## Container Queries

### Size Variants

```html
<article class="@container">
  <div class="flex flex-col @md:flex-row @lg:gap-8">
    <img class="w-full @md:w-48" />
    <div class="mt-4 @md:mt-0">...</div>
  </div>
</article>
```

### Container Query Units

Use `cqw` for container-responsive sizing:

```html
<div class="@container">
  <h1 class="text-[50cqw]">Responsive to container width</h1>
</div>
```

## v4.1 Features

### Text Shadows

Utilities from `text-shadow-2xs` to `text-shadow-lg`:

```html
<h1 class="text-shadow-lg">Large shadow</h1>
<p class="text-shadow-sm/50">Small shadow with opacity</p>
```

### Masking

Composable mask utilities for image and gradient masks:

```html
<!-- Linear gradient masks -->
<div class="mask-t-from-50%">Top fade</div>
<div class="mask-b-from-20% mask-b-to-80%">Bottom gradient</div>
<div class="mask-linear-from-white mask-linear-to-black/60">Custom fade</div>

<!-- Radial gradient masks -->
<div class="mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left">Radial mask</div>
```

## Component Patterns

### Avoid Utility Inheritance

Don't add utilities to parents that children override:

```html
<!-- Don't -->
<div class="text-center">
  <h1>Centered</h1>
  <div class="text-left">Left-aligned</div>
</div>

<!-- Do -->
<div>
  <h1 class="text-center">Centered</h1>
  <div>Left-aligned</div>
</div>
```

### Component Extraction

- Extract repeated patterns into framework components, not CSS classes
- Keep utility classes in templates/JSX
- Use data attributes for state-based styling

## CSS Nesting

Use nesting when styling both parent and children. Avoid empty parent selectors:

```css
/* Good — parent has styles */
.card {
  padding: --spacing(4);

  > .card-title {
    font-weight: bold;
  }
}

/* Avoid — empty parent */
ul {
  > li { /* Parent has no styles */ }
}
```

## Common Pitfalls

1. **Old opacity utilities** — use `/opacity` syntax (`bg-red-500/60`)
2. **Redundant breakpoint classes** — only specify changes
3. **`space-*` in flex/grid** — use `gap`
4. **Separate `leading-*`** — use line-height modifiers (`text-sm/6`)
5. **`@apply`** — use components or CSS variables
6. **`min-h-screen`** — use `min-h-dvh`
7. **Separate `w-*`/`h-*`** — use `size-*` when equal
8. **Arbitrary values** — prefer Tailwind's predefined scale (`ml-4` over `ml-[16px]`)
9. **`bg-gradient-*`** — use `bg-linear-*`
10. **`shadow`/`rounded`/`blur` defaults** — these were renamed (see Renamed Utilities table)
