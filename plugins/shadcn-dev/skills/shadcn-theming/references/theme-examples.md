# Complete Theme Examples

Full theme configurations for different use cases.

## Minimal Dark Theme

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}
```

## Corporate Blue Theme

```css
@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
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
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.375rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 40% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 40% 8%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
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
    --ring: 224.3 76.3% 48%;
  }
}
```

## Warm Earth Theme

```css
@layer base {
  :root {
    --background: 30 20% 98%;
    --foreground: 20 14.3% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 20 14.3% 4.1%;
    --primary: 24 9.8% 10%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 60 4.8% 95.9%;
    --secondary-foreground: 24 9.8% 10%;
    --muted: 60 4.8% 95.9%;
    --muted-foreground: 25 5.3% 44.7%;
    --accent: 30 80% 55%;
    --accent-foreground: 60 9.1% 97.8%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 24 9.8% 10%;
    --radius: 0.75rem;
  }
}
```

## Green Eco Theme

```css
@layer base {
  :root {
    --background: 138 76% 97%;
    --foreground: 142.1 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 142.1 84% 4.9%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 0 0% 100%;
    --secondary: 138 40% 96.1%;
    --secondary-foreground: 142.1 47.4% 11.2%;
    --muted: 138 40% 96.1%;
    --muted-foreground: 138 16.3% 46.9%;
    --accent: 142.1 70.6% 45.3%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 138 31.8% 91.4%;
    --input: 138 31.8% 91.4%;
    --ring: 142.1 76.2% 36.3%;
    --radius: 0.5rem;
  }
}
```

## Tailwind v4 Theme

```css
@import "tailwindcss";

@theme {
  /* Brand colors in OKLCH */
  --color-brand-50: oklch(0.98 0.01 250);
  --color-brand-100: oklch(0.95 0.03 250);
  --color-brand-200: oklch(0.90 0.06 250);
  --color-brand-300: oklch(0.82 0.10 250);
  --color-brand-400: oklch(0.72 0.14 250);
  --color-brand-500: oklch(0.60 0.18 250);
  --color-brand-600: oklch(0.50 0.18 250);
  --color-brand-700: oklch(0.42 0.15 250);
  --color-brand-800: oklch(0.35 0.12 250);
  --color-brand-900: oklch(0.28 0.08 250);

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Cal Sans", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  /* Custom radius */
  --radius-4xl: 2rem;

  /* Custom animations */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 250 84% 4.9%;
    --primary: var(--color-brand-500);
    --primary-foreground: 0 0% 100%;
    /* ... rest of shadcn variables */
  }

  .dark {
    --background: 250 84% 4.9%;
    --foreground: 0 0% 98%;
    --primary: var(--color-brand-400);
    /* ... dark mode variables */
  }
}
```

## Multi-Theme Setup

Support multiple color themes:

```css
/* globals.css */
@layer base {
  :root,
  .theme-blue {
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
  }

  .theme-green {
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 0 0% 100%;
  }

  .theme-purple {
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 0 0% 100%;
  }

  .theme-orange {
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 0 0% 100%;
  }
}
```

```tsx
// theme-provider.tsx
<ThemeProvider
  themes={["light", "dark", "theme-blue", "theme-green", "theme-purple"]}
  attribute="class"
>
```
