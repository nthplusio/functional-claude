# Obsidian Plugin Development — Getting Started

Source: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
Source: https://docs.obsidian.md/Plugins/Getting+started/Anatomy+of+a+plugin

---

## Prerequisites

- Git
- Node.js
- Code editor (VS Code recommended)
- A **separate vault** dedicated to plugin development (never develop in your primary vault)

---

## Required File Structure

```
vault/.obsidian/plugins/plugin-id/
├── main.ts          # TypeScript source
├── main.js          # Compiled output (gitignored or built)
├── manifest.json    # Plugin metadata (required)
└── styles.css       # Optional stylesheet
```

---

## manifest.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "What this plugin does.",
  "author": "Your Name",
  "authorUrl": "https://yoursite.com",
  "isDesktopOnly": false
}
```

Fields:
- `id` — unique identifier, must match the folder name
- `name` — human-readable name shown in community plugins list
- `minAppVersion` — minimum Obsidian version required
- `isDesktopOnly` — set `true` if using Node.js or Electron APIs

---

## Build Setup (sample plugin template)

```bash
# Clone the sample plugin into your vault's plugins folder
cd vault/.obsidian/plugins
git clone https://github.com/obsidianmd/obsidian-sample-plugin my-plugin
cd my-plugin
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build
```

Obsidian sample plugin uses esbuild. `npm run dev` keeps running and rebuilds on every save.

---

## Anatomy of a Plugin

### Core Class

Every Obsidian plugin is a TypeScript class extending `Plugin`:

```typescript
import { Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    // Called when user enables the plugin
    // Register commands, events, views, settings here
    console.log('Plugin loaded');
  }

  onunload() {
    // Called when user disables the plugin
    // Clean up resources
    console.log('Plugin unloaded');
  }
}
```

### Lifecycle

| Method | When called | Purpose |
|--------|------------|---------|
| `onload()` | Plugin enabled | Register all capabilities |
| `onunload()` | Plugin disabled | Release all resources |

`onload()` is `async` — use `await` for async initialization.

### The `app` Object

`this.app` is the global entry point to all Obsidian APIs:

```typescript
this.app.vault       // File system operations
this.app.workspace   // Panel/leaf management
this.app.metadataCache  // Frontmatter & link cache
```

---

## Reloading During Development

After code changes:
- Command palette → "Reload app without saving"
- Or toggle the plugin off/on in Community Plugins settings

After `manifest.json` changes:
- Fully restart Obsidian

**Tip:** Install the [Hot-Reload plugin](https://github.com/pjeby/hot-reload) to auto-reload on file save.

---

## TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler"
  }
}
```

---

## Debugging

Open DevTools: Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (macOS)

Console messages from `onload()` and `onunload()` appear in the Console tab.
