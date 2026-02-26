---
name: obsidian-ui
description: |
  This skill should be used when the user asks about "obsidian custom view", "obsidian ItemView",
  "obsidian modal", "obsidian Notice", "obsidian ribbon icon", "obsidian status bar",
  "obsidian sidebar panel", "obsidian WorkspaceLeaf", "obsidian FuzzySuggestModal",
  "obsidian SuggestModal", "obsidian UI components", or needs help building user interface
  elements in an Obsidian plugin.
version: 0.1.0
---

# Obsidian UI Components

Build views, modals, notices, ribbon icons, and status bar items.

## Notices (Toasts)

```typescript
import { Notice } from 'obsidian';

new Notice('Operation complete!');            // ~4 seconds
new Notice('Custom duration', 8000);         // 8 seconds
new Notice('Error occurred', 0);             // stays until dismissed
```

## Ribbon Icons

```typescript
const ribbonIconEl = this.addRibbonIcon('star', 'My Plugin', (evt) => {
  new Notice('Ribbon clicked!');
});
// Optional: add a CSS class for styling
ribbonIconEl.addClass('my-plugin-ribbon-icon');
```

Icon names use [Lucide](https://lucide.dev/icons/). Common icons:
`'star'`, `'file-text'`, `'settings'`, `'layout-dashboard'`, `'search'`, `'pencil'`

## Status Bar

```typescript
const statusBar = this.addStatusBarItem();
statusBar.createEl('span', { text: 'My Plugin' });

// Update dynamically
this.registerInterval(window.setInterval(() => {
  statusBar.setText(new Date().toLocaleTimeString());
}, 1000));
```

## Custom Views (Sidebar Panels)

### 1. Define the view

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_MY_VIEW = 'my-view';

export class MyView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_MY_VIEW;
  }

  getDisplayText(): string {
    return 'My View';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: 'My View' });
    container.createEl('p', { text: 'Content goes here.' });
  }

  async onClose(): Promise<void> {
    // Clean up if needed
  }
}
```

### 2. Register and activate

```typescript
async onload() {
  this.registerView(VIEW_TYPE_MY_VIEW, (leaf) => new MyView(leaf));

  this.addRibbonIcon('layout-dashboard', 'Open My View', () => {
    this.activateView();
  });
}

async activateView() {
  const { workspace } = this.app;

  // Don't create a second instance if one exists
  let leaf = workspace.getLeavesOfType(VIEW_TYPE_MY_VIEW)[0];
  if (!leaf) {
    leaf = workspace.getRightLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE_MY_VIEW, active: true });
  }
  workspace.revealLeaf(leaf);
}
```

**Critical:** Never store a direct reference to the view instance. Always retrieve it via `getLeavesOfType()`.

## Modals

### Basic Modal

```typescript
import { App, Modal, Setting } from 'obsidian';

class InputModal extends Modal {
  result: string = '';
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
      .addText((text) => text.onChange((val) => { this.result = val; }));

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText('Submit').setCta().onClick(() => {
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
new InputModal(this.app, (result) => {
  new Notice(`You entered: ${result}`);
}).open();
```

### Fuzzy Suggest Modal

Built-in fuzzy search — easiest way to let users pick from a list:

```typescript
import { FuzzySuggestModal } from 'obsidian';

class FileSuggestModal extends FuzzySuggestModal<TFile> {
  constructor(app: App, private onChoose: (file: TFile) => void) {
    super(app);
  }

  getItems(): TFile[] {
    return this.app.vault.getMarkdownFiles();
  }

  getItemText(file: TFile): string {
    return file.path;
  }

  onChooseItem(file: TFile): void {
    this.onChoose(file);
  }
}

// Usage
new FileSuggestModal(this.app, (file) => {
  new Notice(`Selected: ${file.path}`);
}).open();
```

## DOM Helpers

Obsidian extends HTMLElement with helpers so you rarely need raw DOM APIs:

```typescript
const div = containerEl.createEl('div', { cls: 'my-class', text: 'content' });
const btn = containerEl.createEl('button', { text: 'Click me' });
btn.addEventListener('click', () => { /* ... */ });
```

## Full API Reference

`${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/api-reference.md` → Views API, Modals API, Notices & Ribbon sections
