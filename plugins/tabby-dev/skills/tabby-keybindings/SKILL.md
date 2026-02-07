---
name: tabby-keybindings
description: This skill should be used when the user asks about "tabby keybindings", "tabby hotkeys", "tabby shortcuts", "customize tabby keys", "tabby keymap", "multi-chord tabby", or mentions keyboard shortcuts and key customization in Tabby terminal.
version: 0.1.1
---

# Tabby Keybindings

Configure keyboard shortcuts and multi-chord keybindings in Tabby terminal.

## Hotkey Configuration

Define custom keybindings in config.yaml under the `hotkeys` section:

```yaml
hotkeys:
  new-tab:
    - "Ctrl+Shift+T"
  close-tab:
    - "Ctrl+Shift+W"
  toggle-fullscreen:
    - "F11"
  split-right:
    - "Ctrl+Shift+D"
  split-bottom:
    - "Ctrl+Shift+E"
  focus-next-pane:
    - "Ctrl+Shift+ArrowRight"
  focus-previous-pane:
    - "Ctrl+Shift+ArrowLeft"
```

## Multi-Chord Shortcuts

Tabby supports multi-chord key combinations (pressing sequences):

```yaml
hotkeys:
  # Press Ctrl+K then Ctrl+C
  custom-action:
    - "Ctrl+K Ctrl+C"
```

## Available Actions

### Tab Management

| Action | Default | Description |
|--------|---------|-------------|
| `new-tab` | Ctrl+Shift+T | Open new tab |
| `close-tab` | Ctrl+Shift+W | Close current tab |
| `next-tab` | Ctrl+Tab | Switch to next tab |
| `previous-tab` | Ctrl+Shift+Tab | Switch to previous tab |
| `tab-1` through `tab-9` | Ctrl+1-9 | Jump to specific tab |
| `duplicate-tab` | - | Duplicate current tab |

### Pane Management

| Action | Default | Description |
|--------|---------|-------------|
| `split-right` | Ctrl+Shift+D | Split pane right |
| `split-bottom` | Ctrl+Shift+E | Split pane bottom |
| `focus-next-pane` | - | Focus next split pane |
| `focus-previous-pane` | - | Focus previous split pane |
| `close-pane` | - | Close current pane |
| `maximize-pane` | - | Maximize/restore pane |

### Window Management

| Action | Default | Description |
|--------|---------|-------------|
| `toggle-fullscreen` | F11 | Toggle fullscreen |
| `toggle-window` | - | Toggle window visibility (global hotkey) |
| `zoom-in` | Ctrl+= | Increase font size |
| `zoom-out` | Ctrl+- | Decrease font size |
| `reset-zoom` | Ctrl+0 | Reset font size |

### Terminal Operations

| Action | Default | Description |
|--------|---------|-------------|
| `copy` | Ctrl+Shift+C | Copy selection |
| `paste` | Ctrl+Shift+V | Paste clipboard |
| `select-all` | - | Select all terminal content |
| `clear` | - | Clear terminal |
| `search` | Ctrl+Shift+F | Open search |
| `settings` | Ctrl+, | Open settings |

### SSH/Connection Actions

| Action | Default | Description |
|--------|---------|-------------|
| `reconnect-tab` | - | Reconnect current SSH/serial session |
| `disconnect-tab` | - | Disconnect current session |
| `launch-winscp` | - | Open session in WinSCP (Windows) |

## Key Syntax

Tabby uses a readable key format:

- Modifiers: `Ctrl`, `Shift`, `Alt`, `Meta` (Cmd on macOS)
- Special keys: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`, `Backspace`, `Delete`, `Escape`, `Tab`, `Space`, `F1`-`F12`
- Regular keys: `A`-`Z`, `0`-`9`
- Combine with `+`: `Ctrl+Shift+T`
- Multi-chord with space: `Ctrl+K Ctrl+C`

## Platform Differences

| Platform | Primary Modifier |
|----------|-----------------|
| Windows | `Ctrl` |
| macOS | `Meta` (Cmd) |
| Linux | `Ctrl` |

Example platform-aware config:

```yaml
hotkeys:
  copy:
    - "Ctrl+Shift+C"
    - "Meta+C"          # macOS alternative
  paste:
    - "Ctrl+Shift+V"
    - "Meta+V"          # macOS alternative
```

Multiple keybindings can be assigned to the same action as a list.

## Global Hotkey

Configure a system-wide hotkey to toggle Tabby visibility:

```yaml
hotkeys:
  toggle-window:
    - "Ctrl+Space"      # Global hotkey to show/hide Tabby
```

This works even when Tabby is not focused (Quake console mode).

## Settings UI

Keybindings can also be configured through Settings > Hotkeys in the Tabby UI, which provides a visual editor for all available actions.

## Reload After Changes

After modifying keybindings in config.yaml, restart Tabby or reload with `Ctrl+Shift+R`.
