---
name: obsidian-commands
description: |
  This skill should be used when the user asks to "add a command to obsidian", "obsidian addCommand",
  "obsidian command palette", "obsidian hotkey", "obsidian checkCallback", "obsidian editorCallback",
  "obsidian editor command", "obsidian keyboard shortcut", or needs help registering commands
  in an Obsidian plugin.
version: 0.1.0
---

# Obsidian Commands

Register commands that appear in the Command Palette and can be bound to hotkeys.

## Basic Command

```typescript
this.addCommand({
  id: 'my-command',        // unique within your plugin
  name: 'My Command Name', // shown in palette
  callback: () => {
    // executes when user runs the command
  },
});
```

All `addCommand()` calls go inside `onload()`.

## Command Types

### Simple (`callback`)
Always visible in the palette. Use for actions that never need to be hidden.

```typescript
this.addCommand({
  id: 'show-greeting',
  name: 'Show greeting',
  callback: () => new Notice('Hello!'),
});
```

### Conditional (`checkCallback`)
Hides itself from the palette when its prerequisites aren't met.

```typescript
this.addCommand({
  id: 'process-active-file',
  name: 'Process active file',
  checkCallback: (checking: boolean) => {
    const file = this.app.workspace.getActiveFile();
    if (file) {
      if (!checking) {
        this.processFile(file);
      }
      return true;  // command is available
    }
    return false;   // command is hidden
  },
});
```

The function runs twice:
- `checking = true` → only check availability, don't act
- `checking = false` → actually perform the action

### Editor Command (`editorCallback`)
Only visible when a markdown editor is active. Gets the editor directly.

```typescript
this.addCommand({
  id: 'uppercase-selection',
  name: 'Uppercase selection',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    const sel = editor.getSelection();
    editor.replaceSelection(sel.toUpperCase());
  },
});
```

Use `editorCheckCallback` for conditional editor commands (combines both patterns).

## Adding a Hotkey

```typescript
this.addCommand({
  id: 'my-command',
  name: 'My Command',
  hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'g' }],
  callback: () => { /* ... */ },
});
```

Modifier keys: `'Mod'` (Ctrl/Cmd), `'Shift'`, `'Alt'`, `'Ctrl'`

`'Mod'` is the cross-platform modifier: Ctrl on Windows/Linux, Cmd on macOS.

**Avoid setting default hotkeys** in community plugins — high chance of conflicts with other plugins or user bindings.

## Imports Needed

```typescript
import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
```

## Full Example

```typescript
export default class MyPlugin extends Plugin {
  async onload() {
    // Simple command
    this.addCommand({
      id: 'insert-timestamp',
      name: 'Insert current timestamp',
      editorCallback: (editor: Editor) => {
        const ts = new Date().toISOString();
        editor.replaceSelection(ts);
      },
    });

    // Conditional command — only when a file is open
    this.addCommand({
      id: 'copy-file-path',
      name: 'Copy file path to clipboard',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (!checking) {
          navigator.clipboard.writeText(file.path);
          new Notice('Path copied!');
        }
        return true;
      },
    });
  }
}
```

## API Reference

Full documentation: `${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/api-reference.md` → Commands API section
