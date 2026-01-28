---
name: Hyper Keybindings
description: This skill should be used when the user asks about "hyper keybindings", "hyper keys", "hyper shortcuts", "customize hyper keys", "hyper keymap", "pane splitting hyper", or mentions keyboard shortcuts and key customization in Hyper terminal.
version: 0.2.5
---

# Hyper Keybindings

Configure keyboard shortcuts and keymaps in Hyper terminal.

## Keymap Configuration

Define custom keybindings in the `keymaps` section of `.hyper.js`:

```javascript
module.exports = {
  config: {
    // ... other config
  },

  keymaps: {
    // Window management
    'window:devtools': 'cmd+alt+o',
    'window:reload': 'cmd+shift+r',
    'window:reloadFull': 'cmd+shift+f5',
    'window:preferences': 'cmd+,',
    'window:new': 'cmd+n',
    'window:minimize': 'cmd+m',
    'window:close': 'cmd+shift+w',
    'window:toggleFullScreen': 'cmd+ctrl+f',

    // Zoom
    'zoom:reset': 'cmd+0',
    'zoom:in': 'cmd+plus',
    'zoom:out': 'cmd+minus',

    // Tabs
    'tab:new': 'cmd+t',
    'tab:next': 'cmd+shift+]',
    'tab:prev': 'cmd+shift+[',

    // Panes
    'pane:splitVertical': 'cmd+d',
    'pane:splitHorizontal': 'cmd+shift+d',
    'pane:close': 'cmd+w',

    // Editor
    'editor:copy': 'cmd+c',
    'editor:paste': 'cmd+v',
    'editor:selectAll': 'cmd+a',
  },
};
```

## Available Actions

### Window Actions
| Action | Default (macOS) | Description |
|--------|-----------------|-------------|
| `window:devtools` | `cmd+alt+i` | Open DevTools |
| `window:reload` | `cmd+shift+r` | Reload window |
| `window:preferences` | `cmd+,` | Open preferences |
| `window:new` | `cmd+n` | New window |
| `window:close` | `cmd+shift+w` | Close window |
| `window:toggleFullScreen` | `cmd+ctrl+f` | Toggle fullscreen |

### Tab Actions
| Action | Default (macOS) | Description |
|--------|-----------------|-------------|
| `tab:new` | `cmd+t` | New tab |
| `tab:next` | `cmd+shift+]` | Next tab |
| `tab:prev` | `cmd+shift+[` | Previous tab |

### Pane Actions
| Action | Default (macOS) | Description |
|--------|-----------------|-------------|
| `pane:splitVertical` | `cmd+d` | Split vertically |
| `pane:splitHorizontal` | `cmd+shift+d` | Split horizontally |
| `pane:close` | `cmd+w` | Close pane |

### Editor Actions
| Action | Default (macOS) | Description |
|--------|-----------------|-------------|
| `editor:copy` | `cmd+c` | Copy selection |
| `editor:paste` | `cmd+v` | Paste clipboard |
| `editor:selectAll` | `cmd+a` | Select all |

## Platform Differences

Use platform-appropriate modifiers:
- **macOS**: `cmd`, `alt`, `ctrl`, `shift`
- **Windows/Linux**: `ctrl`, `alt`, `shift`

```javascript
// Platform detection in config
const isMac = process.platform === 'darwin';

keymaps: {
  'tab:new': isMac ? 'cmd+t' : 'ctrl+t',
}
```

## Key Syntax

- Single keys: `'a'`, `'1'`, `'f5'`
- With modifiers: `'cmd+c'`, `'ctrl+shift+r'`
- Multiple modifiers: `'cmd+alt+i'`, `'ctrl+shift+alt+n'`

## Reload After Changes

After modifying keymaps:
- **macOS**: `Cmd+Shift+R`
- **Windows/Linux**: `Ctrl+Shift+R`
