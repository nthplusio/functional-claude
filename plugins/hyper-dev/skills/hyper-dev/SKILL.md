---
name: Hyper Development
description: This skill should be used when the user asks to "configure Hyper", "hyper config", "hyper.js", "customize Hyper terminal", "add Hyper keybindings", "hyper keybindings", "hyper keys", "create Hyper plugin", "hyper plugin", "hyper theme", "hyper opacity", "hyper blur", "debug hyper", "troubleshoot hyper", "hyper not working", "hyper issue", "look at hyper", "review hyper config", "analyze hyper", "fix hyper", "hyper problem", "update hyper", "modify hyper", "edit hyper", "change hyper", "hyper electron", "hyper react", "hyper redux", "decorateConfig", "hyper middleware", "hyper extension", or mentions Hyper terminal configuration, Hyper plugin development, or asks "why does hyper" questions about Hyper behavior.
version: 0.1.0
---

# Hyper Development

Configure and customize Hyper terminal and develop plugins using JavaScript, React, and Redux.

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

This preserves working configurations and allows easy rollback if changes cause issues.

## Overview

Hyper is a terminal built on Electron with React UI and Redux state management, using xterm.js for terminal emulation. This skill covers:
- Base configuration (fonts, colors, themes)
- Visual enhancements (opacity, cursor styles)
- Keybindings customization
- Plugin development (npm packages)
- Theme creation

## Configuration File Location

| OS | Location |
|----|----------|
| macOS | `~/Library/Application Support/Hyper/.hyper.js` |
| Windows | `%APPDATA%\Hyper\.hyper.js` |
| Linux | `~/.config/Hyper/.hyper.js` |

## Base Configuration Pattern

```javascript
module.exports = {
  config: {
    // Font settings
    fontSize: 12,
    fontFamily: '"Fira Code", Menlo, monospace',
    fontWeight: 'normal',
    fontWeightBold: 'bold',

    // Cursor
    cursorColor: 'rgba(248,28,229,0.8)',
    cursorShape: 'BLOCK', // BEAM, UNDERLINE, BLOCK
    cursorBlink: true,

    // Colors
    foregroundColor: '#fff',
    backgroundColor: '#000',
    borderColor: '#333',

    // Window
    padding: '12px 14px',

    // Shell
    shell: '', // Default shell
    shellArgs: ['--login'],
  },

  plugins: [
    // Add plugins here
  ],

  localPlugins: [
    // Local development plugins
  ],

  keymaps: {
    // Custom keybindings
  },
};
```

## Visual Enhancements

### Background Opacity

```javascript
config: {
  backgroundColor: 'rgba(0, 0, 0, 0.8)', // Use rgba for transparency
}
```

### Selection Color

```javascript
config: {
  selectionColor: 'rgba(248,28,229,0.3)',
}
```

### Color Palette

```javascript
config: {
  colors: {
    black: '#000000',
    red: '#C51E14',
    green: '#1DC121',
    yellow: '#C7C329',
    blue: '#0A2FC4',
    magenta: '#C839C5',
    cyan: '#20C5C6',
    white: '#C7C7C7',
    lightBlack: '#686868',
    lightRed: '#FD6F6B',
    lightGreen: '#67F86F',
    lightYellow: '#FFFA72',
    lightBlue: '#6A76FB',
    lightMagenta: '#FD7CFC',
    lightCyan: '#68FDFE',
    lightWhite: '#FFFFFF',
  },
}
```

## Keybindings

Define custom keybindings in the `keymaps` section:

```javascript
keymaps: {
  'window:devtools': 'cmd+alt+o',
  'window:reload': 'cmd+shift+r',
  'window:reloadFull': 'cmd+shift+f5',
  'window:preferences': 'cmd+,',
  'window:hamburgerMenu': 'alt',
  'zoom:reset': 'cmd+0',
  'zoom:in': 'cmd+plus',
  'zoom:out': 'cmd+minus',
  'window:new': 'cmd+n',
  'window:minimize': 'cmd+m',
  'window:zoom': 'cmd+alt+ctrl+m',
  'window:toggleFullScreen': 'cmd+ctrl+f',
  'window:close': 'cmd+shift+w',
  'tab:new': 'cmd+t',
  'tab:next': 'cmd+shift+]',
  'tab:prev': 'cmd+shift+[',
  'pane:splitVertical': 'cmd+d',
  'pane:splitHorizontal': 'cmd+shift+d',
  'pane:close': 'cmd+w',
  'editor:copy': 'cmd+c',
  'editor:paste': 'cmd+v',
  'editor:selectAll': 'cmd+a',
}
```

## Plugin Development

Hyper plugins are npm packages that export specific hooks and decorators.

### Plugin Structure

```
hyper-plugin-name/
├── package.json
├── index.js
└── README.md
```

### package.json

```json
{
  "name": "hyper-plugin-name",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "main": "index.js",
  "keywords": ["hyper", "hyper-plugin"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Plugin API Hooks

```javascript
// Modify configuration
exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    // Your config modifications
  });
};

// App lifecycle
exports.onApp = (app) => {
  // Called when app starts
};

exports.onWindow = (window) => {
  // Called when window is created
};

exports.onUnload = (window) => {
  // Called before plugin is unloaded
};

// Decorate UI components
exports.decorateTerm = (Term, { React }) => {
  return class extends React.Component {
    render() {
      return React.createElement(Term, this.props);
    }
  };
};

exports.decorateHeader = (Header, { React }) => {
  // Return decorated Header component
};

exports.decorateTabs = (Tabs, { React }) => {
  // Return decorated Tabs component
};

exports.decorateTab = (Tab, { React }) => {
  // Return decorated Tab component
};

// Redux middleware
exports.middleware = (store) => (next) => (action) => {
  // Intercept actions
  if (action.type === 'SESSION_ADD') {
    // Handle new session
  }
  return next(action);
};

// Custom reducers
exports.reduceUI = (state, action) => {
  // Modify UI state
  return state;
};

exports.reduceSessions = (state, action) => {
  // Modify sessions state
  return state;
};
```

### Action Types

Common Redux actions to intercept:

| Action | Description |
|--------|-------------|
| `SESSION_ADD` | New terminal session created |
| `SESSION_RESIZE` | Terminal resized |
| `SESSION_SET_ACTIVE` | Tab/pane focused |
| `SESSION_PTY_DATA` | Terminal output received |
| `SESSION_PTY_EXIT` | Session closed |
| `CONFIG_LOAD` | Configuration loaded |
| `UI_FONT_SIZE_SET` | Font size changed |

### Local Plugin Development

For development, use `localPlugins`:

```javascript
localPlugins: [
  '/absolute/path/to/your/plugin',
],
```

Reload with `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux).

## Popular Plugins

| Plugin | Purpose |
|--------|---------|
| `hypercwd` | Open new tabs in current directory |
| `hyper-search` | Search terminal content |
| `hyper-pane` | Enhanced pane navigation |
| `hyperpower` | Particle effects on typing |
| `hyper-opacity` | Window opacity control |
| `hyper-snazzy` | Snazzy color theme |

Install plugins by adding to the `plugins` array:

```javascript
plugins: ['hypercwd', 'hyper-search'],
```

## Theme Development

Themes modify the config via `decorateConfig`:

```javascript
exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    foregroundColor: '#eff0eb',
    backgroundColor: '#282a36',
    borderColor: '#222430',
    cursorColor: '#97979b',
    colors: {
      black: '#282a36',
      red: '#ff5c57',
      green: '#5af78e',
      yellow: '#f3f99d',
      blue: '#57c7ff',
      magenta: '#ff6ac1',
      cyan: '#9aedfe',
      white: '#f1f1f0',
      lightBlack: '#686868',
      lightRed: '#ff5c57',
      lightGreen: '#5af78e',
      lightYellow: '#f3f99d',
      lightBlue: '#57c7ff',
      lightMagenta: '#ff6ac1',
      lightCyan: '#9aedfe',
      lightWhite: '#eff0eb',
    },
  });
};
```

## Testing and Debugging

1. **Reload config**: `Cmd+Shift+R` (macOS) / `Ctrl+Shift+R` (Windows/Linux)
2. **Open DevTools**: `Cmd+Alt+I` (macOS) / `Ctrl+Shift+I` (Windows/Linux)
3. **Console logging**: Use `console.log()` in plugins, view in DevTools
4. **Hot reload**: Changes to local plugins reload automatically

## Common Issues

### Plugin not loading
- Check plugin is in `plugins` or `localPlugins` array
- Verify npm package name is correct
- Check DevTools console for errors

### Config syntax errors
- Hyper uses JavaScript, ensure valid syntax
- Check for missing commas, brackets
- Use DevTools console to see parsing errors

### Performance issues
- Disable heavy plugins (effects, animations)
- Reduce `scrollback` buffer size
- Check for memory leaks in custom plugins

## Additional Resources

### Reference Files

- **`references/plugin-development.md`** - Complete plugin API reference
- **`references/cache-management.md`** - Cache system documentation

### Example Files

- **`examples/hyper-config.js`** - Full working configuration

## Caching System

The plugin maintains a two-tier caching system in `.cache/learnings.md` within the plugin directory:

### Daily-Refreshed Reference Cache

On session start, the plugin automatically fetches and caches current Hyper documentation:

- Official Hyper website
- GitHub releases and changelog
- Repository README

The cache refreshes once per day, keeping you current with Hyper updates without repeated fetches.

### Learnings Cache

At session end, you'll be prompted to capture learnings from Hyper work:

- **Successful Patterns** - Configurations that worked well
- **Mistakes to Avoid** - Issues encountered and their solutions
- **Plugin Patterns** - Reusable plugin techniques

Learnings persist across sessions, building a knowledge base specific to your setup.

### Cache Location

The `.cache/` directory is gitignored and stays with the plugin. This keeps learnings relative to the plugin that uses them.

See `references/cache-management.md` for full documentation.
