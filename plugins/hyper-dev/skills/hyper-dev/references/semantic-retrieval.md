# Semantic Documentation Retrieval

This guide explains when and how to use different documentation sources for Hyper development questions.

## Source Selection Guide

| Question Type | Source | Method |
|---------------|--------|--------|
| Terminal rendering, buffer API | Context7 (xterm.js) | `mcp__plugin_context7_context7__query-docs` |
| Electron window, IPC, native features | Context7 (Electron) | `mcp__plugin_context7_context7__query-docs` |
| Hyper config, .hyper.js syntax | Local cache | Read `.cache/learnings.md` |
| Hyper version info, installed plugins | Local cache | Read `.cache/hyper-config.json` |
| Popular plugins, ecosystem | Local cache | Read `.cache/plugin-ecosystem.json` |
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

## Local Cache Sources

### learnings.md

Contains:
- Fetched documentation summaries
- Session learnings (successful patterns, mistakes)
- Plugin development patterns

**When to use:** General Hyper configuration questions, accumulated knowledge.

### hyper-config.json

Contains:
- Detected Hyper version
- Config file location
- Installed plugins list

**When to use:** Version-specific questions, checking current setup.

### plugin-ecosystem.json

Contains:
- Top 25 popular plugins
- Download counts
- Plugin patterns and exports

**When to use:** Plugin recommendations, ecosystem exploration.

### docs-index.json

Contains:
- Documentation source URLs
- Last refresh timestamps
- Source types (webfetch vs context7)

**When to use:** Checking documentation freshness.

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
├─ Config syntax/patterns?
│  └─ Read local cache: learnings.md
│
├─ Version/installation?
│  └─ Read local cache: hyper-config.json
│
├─ Plugin recommendations?
│  └─ Read local cache: plugin-ecosystem.json
│
├─ Release notes/changelog?
│  └─ WebFetch: GitHub releases
│
└─ Latest plugins/store?
   └─ WebFetch: hyper.is/plugins
```

## Caching Strategy

| Source | Cache Duration | Refresh Trigger |
|--------|---------------|-----------------|
| Context7 | 7 days | Automatic (via Context7) |
| Local config | 24 hours | SessionStart hook |
| Plugin ecosystem | 7 days | SessionStart hook |
| WebFetch | Per-session | Manual request |

## Example: Answering a Complex Question

**Question:** "How do I add a custom search addon to Hyper?"

**Resolution:**

1. **Check local cache** for existing search patterns in `learnings.md`
2. **Query Context7** for xterm.js search addon: `/xtermjs/xterm.js` with query "search addon implementation"
3. **Check ecosystem** for existing search plugins in `plugin-ecosystem.json`
4. **Combine** knowledge into implementation guidance
