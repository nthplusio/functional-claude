# Pre-Built Color Palettes

Ready-to-use color palettes for shadcn/ui themes.

## Default shadcn Palettes

### Slate (Default)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Zinc

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
}
```

### Stone

```css
:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --primary: 24 9.8% 10%;
  --primary-foreground: 60 9.1% 97.8%;
  --secondary: 60 4.8% 95.9%;
  --secondary-foreground: 24 9.8% 10%;
}
```

## Brand Color Examples

### Blue Brand

```css
:root {
  --primary: 221.2 83.2% 53.3%;      /* Blue-600 */
  --primary-foreground: 210 40% 98%;
  --accent: 217.2 91.2% 59.8%;       /* Blue-500 */
  --accent-foreground: 222.2 47.4% 11.2%;
}
```

### Green Brand

```css
:root {
  --primary: 142.1 76.2% 36.3%;      /* Green-600 */
  --primary-foreground: 0 0% 100%;
  --accent: 142.1 70.6% 45.3%;       /* Green-500 */
  --accent-foreground: 0 0% 100%;
}
```

### Purple Brand

```css
:root {
  --primary: 262.1 83.3% 57.8%;      /* Purple-500 */
  --primary-foreground: 0 0% 100%;
  --accent: 263.4 70% 50.4%;         /* Purple-600 */
  --accent-foreground: 0 0% 100%;
}
```

### Orange Brand

```css
:root {
  --primary: 24.6 95% 53.1%;         /* Orange-500 */
  --primary-foreground: 0 0% 100%;
}
```

## OKLCH Palettes (Tailwind v4)

### Modern Blue

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
}
```

### Vibrant Cyan

```css
@theme {
  --color-cyan-50: oklch(0.98 0.02 195);
  --color-cyan-500: oklch(0.75 0.15 195);
  --color-cyan-900: oklch(0.30 0.08 195);
}
```

## Semantic Colors

### Status Colors

```css
:root {
  /* Success */
  --success: 142.1 76.2% 36.3%;
  --success-foreground: 0 0% 100%;

  /* Warning */
  --warning: 45.4 93.4% 47.5%;
  --warning-foreground: 0 0% 0%;

  /* Info */
  --info: 199 89% 48%;
  --info-foreground: 0 0% 100%;

  /* Error (use destructive) */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
}
```

## Using Radix Colors

Radix provides accessible color scales:

```css
/* Import from Radix */
@import "@radix-ui/colors/blue.css";
@import "@radix-ui/colors/blue-dark.css";

:root {
  --primary: var(--blue-9);
  --primary-foreground: var(--blue-1);
}
```

## Tools

- shadcn Theme Builder: https://ui.shadcn.com/themes
- Radix Colors: https://www.radix-ui.com/colors
- OKLCH Color Picker: https://oklch.com
- Tailwind Color Generator: https://uicolors.app
