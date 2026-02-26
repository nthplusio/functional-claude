---
name: obsidian-dev
description: |
  This skill should be used when the user asks about "obsidian plugin", "build an obsidian plugin",
  "obsidian development", "obsidian API", "obsidian typescript", "create obsidian extension",
  "obsidian plugin development", or needs general guidance on developing plugins for Obsidian.
  For specific topics, focused skills are available.
version: 0.1.0
---

# Obsidian Plugin Development

Build Obsidian plugins with TypeScript: setup, core APIs, UI components, and publishing.

## Quick Reference

```
vault/.obsidian/plugins/my-plugin/
├── main.ts          # TypeScript source
├── main.js          # Compiled output
├── manifest.json    # Plugin metadata (required)
└── styles.css       # Optional
```

**Every plugin extends the `Plugin` class:**

```typescript
import { Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() { /* register commands, events, views, settings */ }
  onunload() { /* release resources */ }
}
```

## Focused Skills

| Topic | Skill | Use when… |
|-------|-------|-----------|
| Setup & manifest | `/obsidian-dev:obsidian-setup` | Starting a new plugin, build config, manifest.json |
| Commands | `/obsidian-dev:obsidian-commands` | Adding commands, hotkeys, palette entries |
| Settings | `/obsidian-dev:obsidian-settings` | Settings tabs, persistence, PluginSettingTab |
| Vault & files | `/obsidian-dev:obsidian-vault` | Reading/writing notes, file events |
| UI components | `/obsidian-dev:obsidian-ui` | Views, Modals, Notices, Ribbon, Status bar |
| Editor | `/obsidian-dev:obsidian-editor` | Accessing and modifying the active markdown editor |

## Core APIs at a Glance

| API | Access | Purpose |
|-----|--------|---------|
| `Vault` | `this.app.vault` | File read/write/create/delete |
| `Workspace` | `this.app.workspace` | Panels, leaves, active view |
| `MetadataCache` | `this.app.metadataCache` | Frontmatter, links, tags |
| `Commands` | `this.addCommand()` | Register palette commands |
| `Settings` | `this.addSettingTab()` | Plugin settings UI |

## Common Patterns

### Plugin with settings and a command

```typescript
import { Plugin, Notice } from 'obsidian';

interface Settings { greeting: string; }
const DEFAULTS: Settings = { greeting: 'Hello' };

export default class MyPlugin extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new MySettingTab(this.app, this));
    this.addCommand({
      id: 'greet',
      name: 'Show greeting',
      callback: () => new Notice(this.settings.greeting),
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Registering events safely

Always use `registerEvent()` — it auto-detaches on plugin unload:

```typescript
this.registerEvent(
  this.app.vault.on('create', (file) => console.log('Created:', file.path))
);
```

## Reference Documentation

Cached docs in `${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/`:
- **`getting-started.md`** — Setup, manifest, build process, anatomy
- **`api-reference.md`** — Commands, Settings, Vault, Events, Views, Modals, Editor

Official docs: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
