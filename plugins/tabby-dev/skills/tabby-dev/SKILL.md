---
name: tabby-dev
description: This skill should be used when the user asks to "configure Tabby", "tabby config", "tabby terminal", "customize Tabby", "set up tabby", or mentions general Tabby terminal configuration questions. For specific topics, focused skills may be more appropriate.
version: 0.1.1
---

# Tabby Development

Configure and customize Tabby terminal emulator, manage SSH/serial connections, and develop plugins.

## First Action: Check Cache Files

The SessionStart hook automatically detects Tabby version and refreshes caches. Check these files:

1. **Version info:** `${CLAUDE_PLUGIN_ROOT}/.cache/tabby-config.json`
   - Detected Tabby version, config path, installed plugins

2. **Learnings:** `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`
   - Accumulated patterns and documentation

## Before Starting: Backup Configuration

**Always create a dated backup before modifying the Tabby config.**

Linux/macOS:
```bash
cp ~/.config/tabby/config.yaml ~/.config/tabby/config.yaml.bak.$(date +%Y-%m-%d)
```

Windows PowerShell:
```powershell
Copy-Item "$env:APPDATA\tabby\config.yaml" "$env:APPDATA\tabby\config.yaml.bak.$(Get-Date -Format 'yyyy-MM-dd')"
```

## Configuration File Location

| OS | Location |
|----|----------|
| macOS | `~/.config/tabby/config.yaml` |
| Windows | `%APPDATA%\tabby\config.yaml` |
| Linux | `~/.config/tabby/config.yaml` |
| Portable | `data/config.yaml` (next to executable) |

Tabby uses **YAML** format for all configuration.

## Base Configuration

```yaml
version: 1
terminal:
  fontSize: 14
  fontFamily: "Fira Code"
  ligatures: true
  shell: default
  cursor: block
  cursorBlink: true
  copyOnSelect: false
  rightClick: paste
  bell: visual
  bracketedPaste: true
  wordSeparator: " ()[]{}'\"\\|"

appearance:
  theme: Standard
  tabsOnTop: true
  frame: full
  dock: off
  dockScreen: current

hotkeys: {}

ssh:
  connections: []

serial:
  connections: []

profiles: []

plugins: []
```

## Focused Skills

For specific configuration topics, use these focused skills:

| Topic | Skill | Trigger Phrases |
|-------|-------|-----------------|
| Visual Customization | `/tabby-dev:tabby-visual` | "tabby theme", "colors", "fonts", "appearance" |
| Keybindings | `/tabby-dev:tabby-keybindings` | "tabby hotkeys", "shortcuts", "keybindings" |
| Connections | `/tabby-dev:tabby-connections` | "ssh profile", "serial connection", "telnet" |
| Plugins | `/tabby-dev:tabby-plugins` | "tabby plugin", "install plugin", "develop plugin" |

## Troubleshooting

For debugging issues, the tabby-troubleshoot agent can autonomously diagnose and fix common problems.

## Testing and Debugging

1. **Reload config**: Close and reopen Tabby, or use `Ctrl+Shift+R`
2. **Debug logs**: Settings > Advanced > Enable debug logging
3. **Open DevTools**: `Ctrl+Shift+D` or via Settings > Advanced

## Key Differences from Other Terminals

- **YAML config** (not JavaScript like Hyper, not Lua like WezTerm)
- **Built-in SSH/serial** client with connection manager
- **Plugin marketplace** built into Settings UI
- **Portable mode** with `data/` folder
- **Encrypted vault** for SSH credentials and keys
- **Angular-based** plugin architecture (not React)

## Semantic Documentation Retrieval

For deep technical questions, use Context7 to access up-to-date documentation:

### xterm.js (Terminal Rendering)

Tabby uses xterm.js for terminal rendering. Query for buffer API, addons, escape sequences:

```
Tool: mcp__plugin_context7_context7__query-docs
  libraryId: /xtermjs/xterm.js
  query: [your terminal question]
```

### Electron (Window/IPC)

Tabby is built on Electron. Query for window management, IPC, native features:

```
Tool: mcp__plugin_context7_context7__query-docs
  libraryId: /websites/electronjs
  query: [your electron question]
```

## Documentation Cache

The plugin automatically maintains a documentation cache at `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`. This cache is refreshed automatically via SessionStart hook when stale (>7 days) or missing.

**To use cached documentation:** Read the cache file for up-to-date component APIs and patterns.

**Cache sources are defined in:** `${CLAUDE_PLUGIN_ROOT}/.cache/sources.json`

## Resources

- Official site: https://tabby.sh/
- GitHub: https://github.com/Eugeny/tabby
- Plugin API: https://docs.tabby.sh/
- Community themes: https://github.com/Eugeny/tabby/wiki
