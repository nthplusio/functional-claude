# OKLCH Color System Guide

Understanding and using OKLCH colors in Tailwind CSS v4.

## What is OKLCH?

OKLCH is a perceptually uniform color space with:
- **L** (Lightness): 0 (black) to 1 (white)
- **C** (Chroma): 0 (gray) to ~0.4 (most saturated)
- **H** (Hue): 0-360 degrees on the color wheel

```css
/* Format */
oklch(Lightness Chroma Hue)
oklch(0.7 0.15 200)
```

## Why OKLCH?

### Perceptual Uniformity

Unlike HSL, OKLCH maintains consistent perceived lightness:

```css
/* HSL: Same L values, different perceived brightness */
hsl(0 100% 50%)    /* Red - appears dark */
hsl(60 100% 50%)   /* Yellow - appears bright */

/* OKLCH: Same L values, consistent brightness */
oklch(0.7 0.2 25)  /* Red - same perceived brightness */
oklch(0.7 0.2 100) /* Yellow - same perceived brightness */
```

### Better Color Scales

OKLCH creates more uniform color progressions:

```css
@theme {
  /* Consistent lightness steps */
  --color-blue-100: oklch(0.95 0.03 240);
  --color-blue-300: oklch(0.80 0.10 240);
  --color-blue-500: oklch(0.65 0.18 240);
  --color-blue-700: oklch(0.50 0.15 240);
  --color-blue-900: oklch(0.30 0.08 240);
}
```

### Wider Gamut

OKLCH supports P3 and wider color gamuts:

```css
/* Regular sRGB */
--color-red: oklch(0.6 0.25 25);

/* P3 wide gamut (more saturated) */
--color-vibrant-red: oklch(0.6 0.35 25);
```

## Hue Reference

| Hue | Color |
|-----|-------|
| 0-30 | Red |
| 30-60 | Orange |
| 60-90 | Yellow |
| 90-150 | Green |
| 150-200 | Cyan |
| 200-260 | Blue |
| 260-310 | Purple |
| 310-360 | Magenta/Pink |

## Building Color Scales

### Standard Scale Pattern

```css
@theme {
  /* Base hue and chroma */
  /* Hue: 250 (blue-purple), Peak chroma: 0.18 */

  --color-brand-50: oklch(0.98 0.01 250);   /* Near white */
  --color-brand-100: oklch(0.95 0.03 250);  /* Very light */
  --color-brand-200: oklch(0.90 0.06 250);  /* Light */
  --color-brand-300: oklch(0.82 0.10 250);  /* Light-medium */
  --color-brand-400: oklch(0.72 0.14 250);  /* Medium-light */
  --color-brand-500: oklch(0.60 0.18 250);  /* Base/Primary */
  --color-brand-600: oklch(0.50 0.18 250);  /* Medium-dark */
  --color-brand-700: oklch(0.42 0.15 250);  /* Dark */
  --color-brand-800: oklch(0.35 0.12 250);  /* Very dark */
  --color-brand-900: oklch(0.28 0.08 250);  /* Near black */
  --color-brand-950: oklch(0.20 0.05 250);  /* Darkest */
}
```

### Chroma Guidelines

| Lightness (L) | Recommended Chroma (C) |
|---------------|------------------------|
| 0.95+ | 0.01-0.03 |
| 0.85-0.95 | 0.03-0.08 |
| 0.70-0.85 | 0.10-0.15 |
| 0.50-0.70 | 0.15-0.20 |
| 0.35-0.50 | 0.12-0.18 |
| 0.20-0.35 | 0.06-0.12 |
| 0.20- | 0.02-0.06 |

## Common Color Values

### Reds

```css
@theme {
  --color-red-50: oklch(0.97 0.01 25);
  --color-red-100: oklch(0.94 0.04 25);
  --color-red-200: oklch(0.88 0.08 25);
  --color-red-300: oklch(0.80 0.14 25);
  --color-red-400: oklch(0.70 0.20 25);
  --color-red-500: oklch(0.60 0.25 25);
  --color-red-600: oklch(0.52 0.24 25);
  --color-red-700: oklch(0.44 0.20 25);
  --color-red-800: oklch(0.36 0.15 25);
  --color-red-900: oklch(0.28 0.10 25);
}
```

### Blues

```css
@theme {
  --color-blue-50: oklch(0.97 0.01 240);
  --color-blue-100: oklch(0.93 0.03 240);
  --color-blue-200: oklch(0.87 0.08 240);
  --color-blue-300: oklch(0.78 0.12 240);
  --color-blue-400: oklch(0.68 0.16 240);
  --color-blue-500: oklch(0.58 0.19 240);
  --color-blue-600: oklch(0.50 0.18 240);
  --color-blue-700: oklch(0.42 0.15 240);
  --color-blue-800: oklch(0.35 0.12 240);
  --color-blue-900: oklch(0.28 0.08 240);
}
```

### Greens

```css
@theme {
  --color-green-50: oklch(0.97 0.02 145);
  --color-green-100: oklch(0.94 0.04 145);
  --color-green-200: oklch(0.88 0.08 145);
  --color-green-300: oklch(0.80 0.12 145);
  --color-green-400: oklch(0.72 0.16 145);
  --color-green-500: oklch(0.62 0.18 145);
  --color-green-600: oklch(0.52 0.16 145);
  --color-green-700: oklch(0.44 0.14 145);
  --color-green-800: oklch(0.36 0.10 145);
  --color-green-900: oklch(0.28 0.06 145);
}
```

### Neutrals (Gray)

```css
@theme {
  /* Chroma 0 = pure gray */
  --color-gray-50: oklch(0.98 0 0);
  --color-gray-100: oklch(0.95 0 0);
  --color-gray-200: oklch(0.90 0 0);
  --color-gray-300: oklch(0.82 0 0);
  --color-gray-400: oklch(0.70 0 0);
  --color-gray-500: oklch(0.55 0 0);
  --color-gray-600: oklch(0.45 0 0);
  --color-gray-700: oklch(0.37 0 0);
  --color-gray-800: oklch(0.27 0 0);
  --color-gray-900: oklch(0.18 0 0);
  --color-gray-950: oklch(0.10 0 0);
}
```

### Cool Grays (Slight blue tint)

```css
@theme {
  --color-slate-50: oklch(0.98 0.005 250);
  --color-slate-100: oklch(0.95 0.008 250);
  --color-slate-200: oklch(0.90 0.01 250);
  --color-slate-300: oklch(0.82 0.012 250);
  --color-slate-400: oklch(0.70 0.015 250);
  --color-slate-500: oklch(0.55 0.015 250);
  --color-slate-600: oklch(0.45 0.012 250);
  --color-slate-700: oklch(0.37 0.01 250);
  --color-slate-800: oklch(0.27 0.008 250);
  --color-slate-900: oklch(0.18 0.005 250);
}
```

## Semantic Colors

### Status Colors

```css
@theme {
  /* Success - Green */
  --color-success: oklch(0.65 0.18 145);
  --color-success-light: oklch(0.92 0.05 145);
  --color-success-dark: oklch(0.45 0.14 145);

  /* Warning - Yellow/Orange */
  --color-warning: oklch(0.80 0.16 85);
  --color-warning-light: oklch(0.95 0.06 85);
  --color-warning-dark: oklch(0.55 0.14 60);

  /* Error - Red */
  --color-error: oklch(0.60 0.24 25);
  --color-error-light: oklch(0.92 0.06 25);
  --color-error-dark: oklch(0.45 0.20 25);

  /* Info - Blue */
  --color-info: oklch(0.65 0.16 240);
  --color-info-light: oklch(0.94 0.04 240);
  --color-info-dark: oklch(0.45 0.14 240);
}
```

## Converting to OKLCH

### From Hex

Use an online converter:
- https://oklch.com
- https://colorjs.io/apps/convert

```
#3b82f6 → oklch(0.59 0.18 262)
```

### From HSL

1. Convert HSL to RGB
2. Convert RGB to OKLCH

Or use CSS color-mix:

```css
/* Browser converts automatically */
background: oklch(from hsl(217 91% 60%) l c h);
```

## Best Practices

### 1. Start with Lightness

Define your scale with consistent lightness steps first:

```css
/* 50: 0.97-0.98, 100: 0.93-0.95, ..., 900: 0.25-0.30 */
```

### 2. Adjust Chroma Naturally

Higher lightness = lower chroma, lower lightness = lower chroma:

```css
/* Peak chroma around L=0.5-0.7 */
```

### 3. Keep Hue Consistent

Use the same hue throughout a color scale for harmony.

### 4. Test Accessibility

Check contrast ratios - OKLCH makes this easier since lightness is perceptually uniform.

### 5. Use Browser DevTools

Modern browsers show OKLCH values in the color picker.

## Resources

- OKLCH Color Picker: https://oklch.com
- Color.js Converter: https://colorjs.io/apps/convert
- OKLCH Palette Generator: https://huetone.ardov.me
- Accessibility Checker: https://webaim.org/resources/contrastchecker
