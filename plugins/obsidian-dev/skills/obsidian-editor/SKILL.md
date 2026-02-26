---
name: obsidian-editor
description: |
  This skill should be used when the user asks about "obsidian editor API", "obsidian edit note",
  "obsidian getSelection", "obsidian replaceSelection", "obsidian cursor", "obsidian Editor class",
  "obsidian MarkdownView", "obsidian insert text", "obsidian modify active file", "obsidian CodeMirror",
  "obsidian editorCallback", or needs help reading or modifying the active markdown editor in an
  Obsidian plugin.
version: 0.1.0
---

# Obsidian Editor API

Read and modify the active markdown editor via the `Editor` class.

## Accessing the Editor

### Inside an editor command (preferred)

```typescript
import { Editor, MarkdownView } from 'obsidian';

this.addCommand({
  id: 'my-editor-command',
  name: 'My editor command',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    // editor is directly available here
  },
});
```

### From anywhere else

```typescript
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (!view) {
  new Notice('No active markdown editor');
  return;
}
const editor = view.editor;
```

## Reading Content

```typescript
// Selected text
const selection = editor.getSelection();

// Cursor position
const cursor = editor.getCursor();  // { line: number, ch: number }

// Entire document
const content = editor.getValue();

// A specific line
const lineText = editor.getLine(lineNumber);  // 0-indexed

// Number of lines
const lineCount = editor.lineCount();
```

## Modifying Content

```typescript
// Replace selected text
editor.replaceSelection('replacement text');

// Insert at cursor
editor.replaceRange('inserted text', editor.getCursor());

// Insert at specific position
editor.replaceRange('text', { line: 5, ch: 0 });

// Replace a range
editor.replaceRange(
  'new content',
  { line: 2, ch: 0 },   // from
  { line: 2, ch: 20 }   // to
);

// Replace entire document
editor.setValue('entirely new content');
```

## Cursor & Selection Control

```typescript
// Move cursor
editor.setCursor({ line: 0, ch: 0 });

// Set a selection
editor.setSelection(
  { line: 1, ch: 0 },   // anchor (start)
  { line: 1, ch: 10 }   // head (end)
);

// Focus the editor
editor.focus();
```

## Common Patterns

### Wrap selection in Markdown

```typescript
editorCallback: (editor: Editor) => {
  const sel = editor.getSelection();
  if (sel) {
    editor.replaceSelection(`**${sel}**`);
  } else {
    // No selection — insert at cursor
    const cursor = editor.getCursor();
    editor.replaceRange('**bold text**', cursor);
    // Move cursor inside the markers
    editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
  }
}
```

### Insert a template at cursor

```typescript
editorCallback: (editor: Editor) => {
  const template = `## Section\n\n- Item 1\n- Item 2\n`;
  const cursor = editor.getCursor();
  editor.replaceRange(template, cursor);
}
```

### Get the active file + its content

```typescript
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view?.file) {
  const file = view.file;
  const content = view.editor.getValue();
  // Now you have both the TFile metadata and the raw content
}
```

## Notes on CodeMirror

Obsidian uses CodeMirror 6 as the underlying editor, but the `Editor` abstraction ensures your plugin works across both CM6 and legacy desktop. Use the Obsidian `Editor` API rather than accessing the CodeMirror instance directly unless you need advanced features not exposed by Obsidian.

## Full API Reference

`${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/api-reference.md` → Editor API section
