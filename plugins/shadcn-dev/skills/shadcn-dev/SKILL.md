---
name: shadcn-dev
description: This skill should be used when the user asks to "set up shadcn", "configure shadcn", "shadcn project setup", "install shadcn", "shadcn init", "ui components for react", or mentions general shadcn/ui configuration questions. For specific topics like theming, forms, or data tables, focused skills may be more appropriate.
version: 0.1.4
---

# shadcn/ui Development

Configure and build React applications with shadcn/ui components and Tailwind CSS v4.

## Documentation Cache

The plugin automatically maintains a documentation cache at `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`. This cache is refreshed automatically via SessionStart hook when stale (>7 days) or missing.

**To use cached documentation:** Read the cache file for up-to-date component APIs and patterns.

**Cache sources are defined in:** `${CLAUDE_PLUGIN_ROOT}/.cache/sources.json`

## shadcn/ui Overview

shadcn/ui is not a component library - it's a collection of reusable components that are copied directly into projects. Components are:

- **Accessible**: Built on Radix UI primitives
- **Customizable**: Full source code ownership
- **Composable**: Combine components freely
- **Framework-agnostic**: Works with Next.js, Vite, TanStack Start, Remix, Astro, Expo

## Installation

### Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configuration prompts:
- Style (New York or Default)
- Base color
- CSS variables for colors
- Global CSS file location
- Tailwind config location
- Component import alias (@/components)
- Utility import alias (@/lib/utils)

### Add Components

```bash
# Single component
npx shadcn@latest add button

# Multiple components
npx shadcn@latest add button card dialog

# All components
npx shadcn@latest add --all
```

## Project Structure

After initialization:

```
project/
├── components/
│   └── ui/           # shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   └── utils.ts      # cn() utility
├── components.json   # shadcn config
└── app/
    └── globals.css   # CSS variables + Tailwind
```

## The cn() Utility

Located in `lib/utils.ts`, combines clsx and tailwind-merge:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Use for conditional and merged class names:

```tsx
<Button className={cn("w-full", isLoading && "opacity-50")} />
```

## Focused Skills

For specific topics, use these focused skills:

| Topic | Skill | Trigger Phrases |
|-------|-------|-----------------|
| Component Usage | shadcn-components | "add button", "dialog component", "card usage" |
| Theming | shadcn-theming | "dark mode", "custom colors", "css variables" |
| Forms | shadcn-forms | "form validation", "react-hook-form", "zod" |
| Data Tables | shadcn-data-tables | "data table", "tanstack table", "sortable" |
| Tailwind v4 | tailwindv4 | "tailwind v4", "@theme", "css-first config" |

## Troubleshooting

For debugging issues, the shadcn-troubleshoot agent can autonomously diagnose and fix common problems including:
- Component import errors
- Styling conflicts
- Hydration mismatches
- Missing dependencies

## Framework-Specific Setup

### Next.js (App Router)

```bash
npx create-next-app@latest my-app --typescript --tailwind
cd my-app
npx shadcn@latest init
```

### Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

### TanStack Start

```bash
npx create-tanstack-start my-app
cd my-app
npx shadcn@latest init
```

### Expo (React Native Web)

See the Expo-specific setup guide in shadcn docs for React Native Web integration.

## Key Dependencies

shadcn/ui components typically require:

- `tailwindcss` - Styling
- `@radix-ui/*` - Accessible primitives
- `class-variance-authority` - Variant management
- `clsx` - Conditional classes
- `tailwind-merge` - Class deduplication
- `lucide-react` - Icons

## Reference Files

- **`references/community-repositories.md`** - Top 10 community repos for learning
- **`references/cache-management.md`** - Cache system documentation
- **`references/component-patterns.md`** - Common composition patterns

## Resources

- Official docs: https://ui.shadcn.com
- GitHub: https://github.com/shadcn-ui/ui
- Components: https://ui.shadcn.com/docs/components
