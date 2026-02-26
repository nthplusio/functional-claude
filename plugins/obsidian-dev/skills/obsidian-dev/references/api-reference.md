# Obsidian Plugin API Reference

Source: https://docs.obsidian.md/Plugins/

---

## Commands API

Source: https://docs.obsidian.md/Plugins/User+interface/Commands

### Basic Command

```typescript
this.addCommand({
  id: 'my-command',
  name: 'My Command Name',
  callback: () => {
    // Executes when user runs the command
  },
});
```

### Conditional Command (checkCallback)

Runs twice: once to check availability, once to execute.

```typescript
this.addCommand({
  id: 'conditional-command',
  name: 'Conditional Command',
  checkCallback: (checking: boolean) => {
    const value = getSomeValue();
    if (value) {
      if (!checking) {
        doSomething(value);
      }
      return true; // Command is available
    }
    return false; // Command is hidden from palette
  },
});
```

### Editor Command

```typescript
this.addCommand({
  id: 'editor-command',
  name: 'Editor Command',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    const selection = editor.getSelection();
    editor.replaceSelection(selection.toUpperCase());
  },
});
```

Use `editorCheckCallback` for conditional editor commands.

### Hotkeys

```typescript
this.addCommand({
  id: 'my-command',
  name: 'My Command',
  hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
  callback: () => { /* ... */ },
});
```

`Mod` maps to Ctrl on Windows/Linux and Cmd on macOS. Avoid setting default hotkeys in community plugins — high conflict risk.

---

## Settings API

Source: https://docs.obsidian.md/Plugins/User+interface/Settings

### Settings Interface & Defaults

```typescript
interface MyPluginSettings {
  apiKey: string;
  enableFeature: boolean;
  mode: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  apiKey: '',
  enableFeature: true,
  mode: 'auto',
};
```

### Plugin Class — Load/Save

```typescript
export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new MySettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Settings Tab

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
    containerEl.empty();

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your API key for the service.')
      .addText((text) =>
        text
          .setPlaceholder('Enter API key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Enable feature')
      .setDesc('Turn this feature on or off.')
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
      .addDropdown((dropdown) =>
        dropdown
          .addOption('auto', 'Automatic')
          .addOption('manual', 'Manual')
          .setValue(this.plugin.settings.mode)
          .onChange(async (value) => {
            this.plugin.settings.mode = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
```

### Available Setting Input Types

| Method | Input type |
|--------|-----------|
| `addText(cb)` | Single-line text |
| `addTextArea(cb)` | Multi-line text |
| `addToggle(cb)` | Boolean toggle |
| `addDropdown(cb)` | Select dropdown |
| `addSlider(cb)` | Numeric slider |
| `addButton(cb)` | Action button |
| `addColorPicker(cb)` | Color picker |
| `addSearch(cb)` | Search with suggestions |

---

## Vault API

Source: https://docs.obsidian.md/Plugins/Vault

### Listing Files

```typescript
// All markdown files
const files = this.app.vault.getMarkdownFiles();

// All files (including non-markdown)
const allFiles = this.app.vault.getFiles();
```

### Reading Files

```typescript
// For display (uses cache when possible)
const content = await this.app.vault.cachedRead(file);

// For modification (always reads from disk)
const content = await this.app.vault.read(file);
```

### Writing Files

```typescript
// Replace entire file content
await this.app.vault.modify(file, newContent);

// Safe atomic update (preferred for concurrent access)
await this.app.vault.process(file, (content) => {
  return content.replace('old', 'new');
});
```

### Creating & Deleting Files

```typescript
// Create a new file
const file = await this.app.vault.create('folder/note.md', 'Initial content');

// Move to trash (safe)
await this.app.vault.trash(file, true); // true = system trash, false = .trash folder

// Permanent delete
await this.app.vault.delete(file);
```

### Type Checking

```typescript
import { TFile, TFolder, TAbstractFile } from 'obsidian';

const item: TAbstractFile = this.app.vault.getAbstractFileByPath('some/path.md');
if (item instanceof TFile) {
  // it's a file
} else if (item instanceof TFolder) {
  // it's a folder
}
```

---

## Events API

Source: https://docs.obsidian.md/Plugins/Events

Always use `registerEvent()` — it automatically detaches listeners when the plugin unloads:

```typescript
// Vault events
this.registerEvent(
  this.app.vault.on('create', (file) => {
    console.log('File created:', file.path);
  })
);

this.registerEvent(
  this.app.vault.on('modify', (file) => { /* ... */ })
);

this.registerEvent(
  this.app.vault.on('delete', (file) => { /* ... */ })
);

this.registerEvent(
  this.app.vault.on('rename', (file, oldPath) => { /* ... */ })
);

// Workspace events
this.registerEvent(
  this.app.workspace.on('active-leaf-change', (leaf) => { /* ... */ })
);

this.registerEvent(
  this.app.workspace.on('file-open', (file) => { /* ... */ })
);
```

### Interval Events

```typescript
// Run every 5 seconds, auto-clears on unload
this.registerInterval(
  window.setInterval(() => {
    // periodic work
  }, 5000)
);
```

---

## Views API

Source: https://docs.obsidian.md/Plugins/User+interface/Views

### Custom View Class

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example View';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: 'Hello from my view!' });
  }

  async onClose() {
    // Cleanup if needed
  }
}
```

### Registering the View

```typescript
async onload() {
  this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));
  this.addRibbonIcon('layout-dashboard', 'Open Example View', () => {
    this.activateView();
  });
}

async activateView() {
  const { workspace } = this.app;
  let leaf = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0];
  if (!leaf) {
    leaf = workspace.getRightLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
  }
  workspace.revealLeaf(leaf);
}
```

**Critical:** Never store direct references to view instances. Always retrieve via `getLeavesOfType()`.

---

## Modals API

Source: https://docs.obsidian.md/Plugins/User+interface/Modals

### Basic Modal

```typescript
import { App, Modal, Setting } from 'obsidian';

class ExampleModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Enter a value' });

    new Setting(contentEl)
      .setName('Value')
      .addText((text) =>
        text.onChange((value) => {
          this.result = value;
        })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Submit')
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.result);
          })
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}

// Usage
new ExampleModal(this.app, (result) => {
  console.log('User submitted:', result);
}).open();
```

### Fuzzy Suggest Modal

```typescript
import { FuzzySuggestModal } from 'obsidian';

class BookSuggestModal extends FuzzySuggestModal<string> {
  getItems(): string[] {
    return ['The Great Gatsby', 'Dune', 'Foundation'];
  }

  getItemText(item: string): string {
    return item;
  }

  onChooseItem(item: string) {
    console.log('Chosen:', item);
  }
}
```

---

## Editor API

Source: https://docs.obsidian.md/Plugins/Editor/Editor

### Accessing the Editor

```typescript
import { MarkdownView } from 'obsidian';

// Inside an editorCallback (preferred)
editorCallback: (editor: Editor, view: MarkdownView) => {
  // editor is directly available
}

// Anywhere else
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view) {
  const editor = view.editor;
}
```

### Reading Content

```typescript
// Get selected text
const selection = editor.getSelection();

// Get cursor position
const cursor = editor.getCursor(); // { line, ch }

// Get entire document content
const content = editor.getValue();

// Get a specific line
const line = editor.getLine(lineNumber);
```

### Modifying Content

```typescript
// Replace selection
editor.replaceSelection('new text');

// Insert at cursor position
editor.replaceRange('inserted text', editor.getCursor());

// Set cursor position
editor.setCursor({ line: 0, ch: 0 });

// Set selection
editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: 5 });
```

---

## Notices & Ribbon

```typescript
import { Notice } from 'obsidian';

// Show a notification (disappears after ~4 seconds)
new Notice('Operation complete!');

// Custom duration (milliseconds)
new Notice('This lasts longer', 10000);

// Ribbon icon
this.addRibbonIcon('star', 'My Plugin', (evt) => {
  new Notice('Ribbon clicked!');
});

// Status bar item
const statusBar = this.addStatusBarItem();
statusBar.createEl('span', { text: 'My Plugin Active' });
```

Icon names use Lucide icons — browse at https://lucide.dev/icons/

---

## Metadata Cache (Frontmatter)

```typescript
// Get frontmatter for a file
const cache = this.app.metadataCache.getFileCache(file);
const frontmatter = cache?.frontmatter;
// frontmatter is the parsed YAML object, or undefined if none

// Get all links from a file
const links = cache?.links ?? [];

// React to metadata changes
this.registerEvent(
  this.app.metadataCache.on('changed', (file) => {
    // file's cache was updated
  })
);
```
