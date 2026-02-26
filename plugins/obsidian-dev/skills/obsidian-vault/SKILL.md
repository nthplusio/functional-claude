---
name: obsidian-vault
description: |
  This skill should be used when the user asks about "obsidian vault API", "obsidian read file",
  "obsidian write file", "obsidian create note", "obsidian delete file", "obsidian list files",
  "obsidian TFile", "obsidian TFolder", "obsidian file events", "obsidian vault.modify",
  "obsidian vault.process", "obsidian metadataCache", "obsidian frontmatter", or needs help
  reading, writing, or reacting to files in an Obsidian vault.
version: 0.1.0
---

# Obsidian Vault API

Read, write, and react to files in the vault via `this.app.vault` and `this.app.metadataCache`.

## Listing Files

```typescript
// All markdown files
const markdownFiles = this.app.vault.getMarkdownFiles(); // TFile[]

// All files (markdown + attachments)
const allFiles = this.app.vault.getFiles(); // TFile[]

// Get a specific file by path
const file = this.app.vault.getFileByPath('folder/note.md'); // TFile | null
```

## Reading Files

```typescript
// For display — uses cache, avoids disk reads
const content = await this.app.vault.cachedRead(file);

// For modification — always reads fresh from disk
const content = await this.app.vault.read(file);
```

Use `cachedRead()` when you only need to display content. Use `read()` when you plan to write it back.

## Writing Files

```typescript
// Replace entire file content
await this.app.vault.modify(file, newContent);

// Safe atomic update (preferred — prevents lost writes)
await this.app.vault.process(file, (currentContent) => {
  return currentContent + '\n\nAppended text';
});
```

`process()` is the safest option for concurrent access: it receives the current content at write time, not at read time.

## Creating Files

```typescript
// Create at a path
const file = await this.app.vault.create('folder/note.md', '# Initial content');

// Create a folder
await this.app.vault.createFolder('my-folder');
```

## Deleting Files

```typescript
// Move to trash (preferred — recoverable)
await this.app.vault.trash(file, true);  // true = system trash
await this.app.vault.trash(file, false); // false = vault's .trash folder

// Permanent delete
await this.app.vault.delete(file);
```

## Type Checking

Operations often return `TAbstractFile` (could be file or folder). Always check:

```typescript
import { TFile, TFolder, TAbstractFile } from 'obsidian';

const item = this.app.vault.getAbstractFileByPath('some/path');
if (item instanceof TFile) {
  // It's a file — has .extension, .stat, .basename
} else if (item instanceof TFolder) {
  // It's a folder — has .children
}
```

## File Events

Always register via `registerEvent()` — auto-detaches on plugin unload:

```typescript
this.registerEvent(
  this.app.vault.on('create', (file: TAbstractFile) => {
    if (file instanceof TFile) console.log('New file:', file.path);
  })
);

this.registerEvent(
  this.app.vault.on('modify', (file: TAbstractFile) => { /* ... */ })
);

this.registerEvent(
  this.app.vault.on('delete', (file: TAbstractFile) => { /* ... */ })
);

this.registerEvent(
  this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => { /* ... */ })
);
```

## Frontmatter & Metadata

```typescript
// Get cached metadata for a file (frontmatter, links, tags)
const cache = this.app.metadataCache.getFileCache(file);

// Frontmatter values
const frontmatter = cache?.frontmatter;
const title = frontmatter?.title;
const tags = frontmatter?.tags;

// Internal links from this file
const links = cache?.links ?? [];

// Backlinks to this file
const backlinks = this.app.metadataCache.getBacklinksForFile(file);

// React to frontmatter changes
this.registerEvent(
  this.app.metadataCache.on('changed', (file) => {
    // file's cache was updated
  })
);
```

## Common Pattern: Process All Notes

```typescript
async processAllNotes() {
  const files = this.app.vault.getMarkdownFiles();
  for (const file of files) {
    const content = await this.app.vault.read(file);
    const updatedContent = this.transform(content);
    if (updatedContent !== content) {
      await this.app.vault.modify(file, updatedContent);
    }
  }
}
```

## Full API Reference

`${CLAUDE_PLUGIN_ROOT}/skills/obsidian-dev/references/api-reference.md` → Vault API section
