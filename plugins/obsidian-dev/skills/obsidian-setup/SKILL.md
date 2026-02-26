---
name: obsidian-setup
description: |
  This skill should be used when the user asks to "start an obsidian plugin", "create a new obsidian plugin",
  "obsidian plugin template", "obsidian manifest", "manifest.json obsidian", "obsidian build setup",
  "obsidian tsconfig", "obsidian esbuild", "obsidian sample plugin", or needs help setting up the
  initial project structure and build tooling for an Obsidian plugin.
version: 0.1.0
---

# Obsidian Plugin Setup

Bootstrap a new Obsidian plugin from the official sample template.

## Step-by-Step Setup

### 1. Create a development vault

Never develop in your primary vault. Create a dedicated one:

```
~/ObsidianDev/      ← development vault root
└── .obsidian/
    └── plugins/
        └── my-plugin/   ← your plugin lives here
```

### 2. Clone the sample plugin

```bash
cd ~/ObsidianDev/.obsidian/plugins
git clone https://github.com/obsidianmd/obsidian-sample-plugin my-plugin
cd my-plugin
npm install
```

### 3. Configure manifest.json

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

**Rules:**
- `id` must match the folder name exactly
- `id` must be lowercase, kebab-case
- `minAppVersion` — check https://github.com/obsidianmd/obsidian-releases for current version
- `isDesktopOnly: true` only if using Node.js/Electron APIs unavailable on mobile

### 4. Build and watch

```bash
npm run dev    # Watch mode: rebuilds on every save
npm run build  # Production build
```

### 5. Enable in Obsidian

1. Open Settings → Community Plugins → Turn off Safe Mode
2. Your plugin appears under "Installed Plugins"
3. Toggle it on

## Project File Structure

```
my-plugin/
├── main.ts          # Your plugin code
├── main.js          # Compiled (do not edit)
├── manifest.json    # Required metadata
├── styles.css       # Optional CSS
├── package.json     # npm config
├── tsconfig.json    # TypeScript config
├── esbuild.config.mjs  # Build config
├── .hotreload       # Optional: enables hot-reload plugin
└── .gitignore
```

## tsconfig.json (standard)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "strict": true,
    "lib": ["ES6", "DOM"]
  },
  "include": ["**/*.ts"]
}
```

## Hot Reloading

Install the [Hot-Reload plugin](https://github.com/pjeby/hot-reload) in your dev vault, then touch `.hotreload` in your plugin directory:

```bash
touch .hotreload
```

Now every `npm run dev` recompile automatically reloads your plugin.

## Reloading Without Hot-Reload

- Command palette → "Reload app without saving" (after code changes)
- Fully restart Obsidian after `manifest.json` changes

## .gitignore

```gitignore
node_modules/
main.js
*.js.map
```

Keep `manifest.json` and `styles.css` in git. The compiled `main.js` is optional — some authors ship it, others build on install.

## Detailed Reference

Read `${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/getting-started.md` for the full setup walkthrough.
