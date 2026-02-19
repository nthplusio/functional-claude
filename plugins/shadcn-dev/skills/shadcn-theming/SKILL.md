---
name: shadcn-theming
description: This skill should be used when the user asks about "dark mode", "light mode", "theme colors", "css variables", "color scheme", "customize theme", "shadcn colors", "theme provider", or mentions theming, color customization, or dark/light mode implementation.
version: 0.2.1
---

# shadcn/ui Theming

Configure themes, colors, and dark mode for shadcn/ui applications.

## CSS Variables Foundation

shadcn/ui uses CSS variables for theming, defined in your global CSS:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
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
    --radius: 0.5rem;
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
}
```

## Color Format

Colors use HSL format without the `hsl()` wrapper:

```css
/* Format: H S% L% */
--primary: 222.2 47.4% 11.2%;

/* Usage in Tailwind */
.bg-primary {
  background-color: hsl(var(--primary));
}
```

## Dark Mode Setup

### 1. Install next-themes

```bash
npm install next-themes
```

### 2. Create Theme Provider

```tsx
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### 3. Add to Layout

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 4. Create Theme Toggle

```tsx
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Custom Color Themes

### Using shadcn Theme Builder

Visit https://ui.shadcn.com/themes to generate custom themes.

### Manual Color Customization

Modify CSS variables in globals.css:

```css
@layer base {
  :root {
    /* Custom blue theme */
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    /* Custom accent */
    --accent: 262.1 83.3% 57.8%;
    --accent-foreground: 210 40% 98%;
  }
}
```

### Brand Colors Example

```css
@layer base {
  :root {
    /* Brand colors */
    --brand: 199 89% 48%;      /* Cyan */
    --brand-foreground: 0 0% 100%;

    /* Success/Error states */
    --success: 142.1 76.2% 36.3%;
    --success-foreground: 0 0% 100%;
    --warning: 45.4 93.4% 47.5%;
    --warning-foreground: 0 0% 0%;
  }
}
```

Use in Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "hsl(var(--brand))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
      },
    },
  },
}
```

## Theme Variable Reference

| Variable | Purpose |
|----------|---------|
| `--background` | Page background |
| `--foreground` | Default text color |
| `--card` | Card backgrounds |
| `--card-foreground` | Card text |
| `--popover` | Popover backgrounds |
| `--primary` | Primary buttons, links |
| `--secondary` | Secondary elements |
| `--muted` | Muted backgrounds |
| `--muted-foreground` | Muted text |
| `--accent` | Accented elements |
| `--destructive` | Error states |
| `--border` | Border colors |
| `--input` | Input borders |
| `--ring` | Focus rings |
| `--radius` | Border radius |

## Multiple Themes

Support multiple themes beyond light/dark:

```css
/* globals.css */
.theme-blue {
  --primary: 221.2 83.2% 53.3%;
}

.theme-green {
  --primary: 142.1 76.2% 36.3%;
}

.theme-purple {
  --primary: 262.1 83.3% 57.8%;
}
```

```tsx
// Usage with next-themes
<ThemeProvider
  themes={["light", "dark", "blue", "green", "purple"]}
  attribute="class"
>
```

## Tailwind v4 Integration

With Tailwind CSS v4, theme configuration moves to CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.7 0.15 200);
  --color-brand-light: oklch(0.9 0.05 200);
  --color-brand-dark: oklch(0.5 0.2 200);
}
```

See the tailwindv4 skill for more v4-specific theming.

## Reference Files

- **`references/color-palettes.md`** - Pre-built color schemes
- **`references/theme-examples.md`** - Complete theme configurations

## Resources

- Theme builder: https://ui.shadcn.com/themes
- Color converter: https://oklch.com
- Radix colors: https://www.radix-ui.com/colors
