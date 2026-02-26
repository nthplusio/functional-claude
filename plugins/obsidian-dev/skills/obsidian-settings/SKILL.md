---
name: obsidian-settings
description: |
  This skill should be used when the user asks about "obsidian plugin settings", "obsidian settings tab",
  "PluginSettingTab obsidian", "obsidian addSettingTab", "obsidian saveData", "obsidian loadData",
  "obsidian Setting class", "obsidian toggle setting", "obsidian text setting", "obsidian dropdown setting",
  or needs help implementing persistent settings in an Obsidian plugin.
version: 0.1.0
---

# Obsidian Plugin Settings

Persist user preferences with `loadData`/`saveData` and display them via `PluginSettingTab`.

## Pattern Overview

1. Define a settings interface with defaults
2. Load settings in `onload()`
3. Register a settings tab
4. Use the `Setting` class to build the UI
5. Save on every `onChange`

## Complete Settings Implementation

### 1. Define Interface & Defaults

```typescript
interface MyPluginSettings {
  apiKey: string;
  enableFeature: boolean;
  mode: 'auto' | 'manual';
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  apiKey: '',
  enableFeature: true,
  mode: 'auto',
};
```

### 2. Plugin Class

```typescript
export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new MySettingTab(this.app, this));
  }

  async loadSettings() {
    // Object.assign ensures new fields get defaults even when loading old saves
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### 3. Settings Tab

```typescript
import { App, PluginSettingTab, Setting } from 'obsidian';

class MySettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty(); // clear before rebuilding

    containerEl.createEl('h2', { text: 'My Plugin Settings' });

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your API key for the external service.')
      .addText((text) =>
        text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable feature')
      .setDesc('Toggle the main plugin feature on or off.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableFeature)
          .onChange(async (value) => {
            this.plugin.settings.enableFeature = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Mode')
      .setDesc('How the plugin should operate.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('auto', 'Automatic')
          .addOption('manual', 'Manual')
          .setValue(this.plugin.settings.mode)
          .onChange(async (value: 'auto' | 'manual') => {
            this.plugin.settings.mode = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
```

## Available Setting Input Types

| Method | Control | Use for |
|--------|---------|---------|
| `addText(cb)` | Text input | Short strings, API keys |
| `addTextArea(cb)` | Textarea | Multi-line content, templates |
| `addToggle(cb)` | On/off toggle | Boolean flags |
| `addDropdown(cb)` | Select menu | Enum-like choices |
| `addSlider(cb)` | Range slider | Numeric values |
| `addButton(cb)` | Action button | Triggers, resets, imports |
| `addColorPicker(cb)` | Color picker | Theme colors |
| `addSearch(cb)` | Search box | File/note pickers |

## Organizing Complex Settings

For many settings, group with `containerEl.createEl('h3', { text: 'Section' })`:

```typescript
display(): void {
  const { containerEl } = this;
  containerEl.empty();

  containerEl.createEl('h2', { text: 'My Plugin' });

  // Section heading
  containerEl.createEl('h3', { text: 'API Configuration' });
  // ... API settings ...

  containerEl.createEl('h3', { text: 'Appearance' });
  // ... appearance settings ...
}
```

## Where Data is Stored

Settings are stored in `vault/.obsidian/plugins/my-plugin/data.json` — never access this file directly; always use `loadData()`/`saveData()`.

## Full API Reference

`${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/api-reference.md` → Settings API section
