---
name: hyper-dev
description: This skill should be used when the user asks to "configure Hyper", "hyper config", "hyper.js", "customize Hyper terminal", "set up hyper", or mentions general Hyper configuration questions. For specific topics, focused skills may be more appropriate.
version: 0.3.3
---

# Hyper Development

Configure and customize Hyper terminal and develop plugins using JavaScript, React, and Redux.

## First Action: Check Cache Files

The SessionStart hook automatically detects Hyper version and refreshes caches. Check these files:

1. **Version info:** `${CLAUDE_PLUGIN_ROOT}/.cache/hyper-config.json`
   - Detected Hyper version, config path, installed plugins

2. **Learnings:** `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`
   - Accumulated patterns and documentation

3. **Plugin ecosystem:** `${CLAUDE_PLUGIN_ROOT}/.cache/plugin-ecosystem.json`
   - Top 25 popular plugins (weekly refresh)

## Before Starting: Backup Configuration

**Always create a dated backup before modifying the Hyper config.**

Linux/macOS:
```bash
cp ~/.hyper.js ~/.hyper.js.bak.$(date +%Y-%m-%d)
```

Windows PowerShell:
```powershell
Copy-Item "$env:APPDATA\Hyper\.hyper.js" "$env:APPDATA\Hyper\.hyper.js.bak.$(Get-Date -Format 'yyyy-MM-dd')"
```

## Configuration File Location

| OS | Location |
|----|----------|
| macOS | `~/Library/Application Support/Hyper/.hyper.js` |
| Windows | `%APPDATA%\Hyper\.hyper.js` |
| Linux | `~/.config/Hyper/.hyper.js` |

## Base Configuration

```javascript
module.exports = {
  config: {
    fontSize: 12,
    fontFamily: '"Fira Code", Menlo, monospace',
    cursorColor: 'rgba(248,28,229,0.8)',
    cursorShape: 'BLOCK',
    cursorBlink: true,
    foregroundColor: '#fff',
    backgroundColor: '#000',
    padding: '12px 14px',
    shell: '',
    shellArgs: ['--login'],
  },

  plugins: [],
  localPlugins: [],
  keymaps: {},
};
```

## Focused Skills

For specific configuration topics, use these focused skills:

| Topic | Skill | Trigger Phrases |
|-------|-------|-----------------|
| Keybindings | hyper-keybindings | "hyper keys", "keymap", "shortcuts" |
| Visual Customization | hyper-visual | "opacity", "colors", "cursor", "theme" |
| Plugin Development | hyper-plugins | "create plugin", "decorateConfig", "redux" |
| Theme Creation | hyper-themes | "create theme", "color scheme" |
| Plugin Discovery | hyper-ecosystem | "popular plugins", "find plugin", "recommendations" |

## Troubleshooting

For debugging issues, the hyper-troubleshoot agent can autonomously diagnose and fix common problems.

## Testing and Debugging

1. **Reload config**: `Cmd+Shift+R` (macOS) / `Ctrl+Shift+R` (Windows/Linux)
2. **Open DevTools**: `Cmd+Alt+I` (macOS) / `Ctrl+Shift+I` (Windows/Linux)
3. **Console logging**: Use `console.log()` in plugins

## Popular Plugins

| Plugin | Purpose |
|--------|---------|
| `hypercwd` | Open new tabs in current directory |
| `hyper-search` | Search terminal content |
| `hyper-pane` | Enhanced pane navigation |
| `hyper-opacity` | Window opacity control |

Install by adding to `plugins` array:
```javascript
plugins: ['hypercwd', 'hyper-search'],
```

## Semantic Documentation Retrieval

For deep technical questions, use Context7 to access up-to-date documentation:

### xterm.js (Terminal Rendering)

Hyper uses xterm.js for terminal rendering. Query for buffer API, addons, escape sequences:

```
Tool: mcp__plugin_context7_context7__query-docs
  libraryId: /xtermjs/xterm.js
  query: [your terminal question]
```

### Electron (Window/IPC)

Hyper is built on Electron. Query for window management, IPC, native features:

```
Tool: mcp__plugin_context7_context7__query-docs
  libraryId: /websites/electronjs
  query: [your electron question]
```

See `references/semantic-retrieval.md` for detailed source selection guide.

## Reference Files

- **`references/plugin-development.md`** - Complete plugin API reference
- **`references/cache-management.md`** - Cache system documentation
- **`references/semantic-retrieval.md`** - When to use Context7 vs local cache vs WebFetch

## Example Files

- **`examples/hyper-config.js`** - Full working configuration

## Resources

- Official site: https://hyper.is/
- GitHub: https://github.com/vercel/hyper
- Plugin store: https://hyper.is/plugins
