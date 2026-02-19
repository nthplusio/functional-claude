# Semantic Documentation Retrieval

This guide explains when and how to use different documentation sources for Hyper development questions.

## Source Selection Guide

| Question Type | Source | Method |
|---------------|--------|--------|
| Terminal rendering, buffer API | Context7 (xterm.js) | `mcp__plugin_context7_context7__query-docs` |
| Electron window, IPC, native features | Context7 (Electron) | `mcp__plugin_context7_context7__query-docs` |
| React components, hooks, patterns | Context7 (React) | `mcp__plugin_context7_context7__query-docs` |
| Hyper config, .hyper.js syntax | Static references | Read `references/plugin-development.md` |
| Hyper plugin API quick reference | Static references | Read `references/plugin-development.md` |
| Release notes, breaking changes | WebFetch | Fetch from GitHub |
| Plugin store, latest plugins | WebFetch | Fetch from hyper.is |

## Context7 Integration

### xterm.js Documentation

Hyper uses xterm.js for terminal rendering. Query for:
- Terminal buffer manipulation
- Addons and extensions
- Escape sequences
- Performance optimization

```
Tool: mcp__plugin_context7_context7__query-docs
Parameters:
  libraryId: /xtermjs/xterm.js
  query: [your terminal rendering question]
```

**Example queries:**
- "How to access terminal buffer contents"
- "xterm.js addon for search functionality"
- "Terminal resize handling"
- "Custom escape sequence processing"

### Electron Documentation

Hyper is built on Electron. Query for:
- Window management (BrowserWindow)
- IPC communication (main/renderer)
- Native menus and shortcuts
- App lifecycle events

```
Tool: mcp__plugin_context7_context7__query-docs
Parameters:
  libraryId: /websites/electronjs
  query: [your electron question]
```

**Example queries:**
- "BrowserWindow transparent background"
- "IPC communication between main and renderer"
- "Registering global shortcuts"
- "App ready event handling"

### React Documentation

Hyper plugins use React for component decoration. Query for:
- Component lifecycle and hooks
- Higher-order components (HOCs)
- Props and state management
- React.createElement patterns

```
Tool: mcp__plugin_context7_context7__query-docs
Parameters:
  libraryId: /facebook/react
  query: [your react question]
```

**Example queries:**
- "Higher-order component patterns"
- "React.createElement with props spreading"
- "Component lifecycle methods class components"
- "useEffect cleanup patterns"

## WebFetch Sources

### GitHub Releases

For version-specific information and changelogs:

```
URL: https://github.com/vercel/hyper/releases
Prompt: Extract changelog for version X.Y.Z
```

### Hyper Website

For official documentation and guides:

```
URL: https://hyper.is/
Prompt: Find documentation about [topic]
```

### Plugin Store

For discovering new plugins:

```
URL: https://hyper.is/plugins
Prompt: List plugins related to [category]
```

## Decision Flowchart

```
Question about Hyper?
│
├─ Terminal rendering/buffer?
│  └─ Use Context7: /xtermjs/xterm.js
│
├─ Electron/window/native?
│  └─ Use Context7: /websites/electronjs
│
├─ React components/decorators?
│  └─ Use Context7: /facebook/react
│
├─ Plugin API/exports?
│  └─ Read references/plugin-development.md
│
├─ Config syntax/patterns?
│  └─ Read references/plugin-development.md
│
├─ Plugin recommendations?
│  └─ Use hyper-ecosystem skill + npm/WebFetch
│
├─ Release notes/changelog?
│  └─ WebFetch: GitHub releases
│
└─ Latest plugins/store?
   └─ WebFetch: hyper.is/plugins
```
