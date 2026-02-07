---
name: wezterm-keybindings
description: This skill should be used when the user asks about "leader key", "prefix key", "tmux-style", "keybindings", "wezterm keys", "ctrl+a wezterm", "pane splitting", "vim-style navigation", "remote tmux", "ssh tmux", "wezterm tmux", "modifier key", "keybinding conflict", or mentions WezTerm keyboard shortcuts and pane management.
version: 0.7.11
---

# WezTerm Keybindings

Configure tmux-style keybindings for WezTerm with leader key support.

## Leader Key Setup

The leader key acts as a prefix (like tmux's Ctrl+B or Ctrl+A):

```lua
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }
```

After pressing Ctrl+A, you have 1 second to press the next key.

## Essential Keybindings

| Keys | Action |
|------|--------|
| `Ctrl+A, -` | Split horizontal (pane below) |
| `Ctrl+A, \` | Split vertical (pane right) |
| `Ctrl+A, h/j/k/l` | Navigate panes (vim-style) |
| `Ctrl+A, x` | Close current pane |
| `Ctrl+A, z` | Toggle pane zoom |
| `Ctrl+A, [` | Enter copy mode |
| `Ctrl+A, c` | Launch Claude Code |

## Configuration

```lua
config.keys = {
    -- Pane splits
    { key = '-', mods = 'LEADER', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
    { key = '\\', mods = 'LEADER', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },

    -- Pane navigation (vim-style)
    { key = 'h', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Left' },
    { key = 'j', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Down' },
    { key = 'k', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Up' },
    { key = 'l', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Right' },

    -- Pane management
    { key = 'x', mods = 'LEADER', action = wezterm.action.CloseCurrentPane { confirm = true } },
    { key = 'z', mods = 'LEADER', action = wezterm.action.TogglePaneZoomState },
    { key = '[', mods = 'LEADER', action = wezterm.action.ActivateCopyMode },

    -- Quick launcher for Claude Code
    { key = 'c', mods = 'LEADER', action = wezterm.action.SpawnCommandInNewTab { args = { 'claude' } } },
}
```

## Pane Resize Bindings

```lua
-- Add these to config.keys
{ key = 'H', mods = 'LEADER', action = wezterm.action.AdjustPaneSize { 'Left', 5 } },
{ key = 'J', mods = 'LEADER', action = wezterm.action.AdjustPaneSize { 'Down', 5 } },
{ key = 'K', mods = 'LEADER', action = wezterm.action.AdjustPaneSize { 'Up', 5 } },
{ key = 'L', mods = 'LEADER', action = wezterm.action.AdjustPaneSize { 'Right', 5 } },
```

## Tab Navigation

```lua
-- Quick tab switching (no leader)
{ key = '1', mods = 'ALT', action = wezterm.action.ActivateTab(0) },
{ key = '2', mods = 'ALT', action = wezterm.action.ActivateTab(1) },
{ key = '3', mods = 'ALT', action = wezterm.action.ActivateTab(2) },
-- ... continue for more tabs

-- Tab navigation with leader
{ key = 'n', mods = 'LEADER', action = wezterm.action.ActivateTabRelative(1) },
{ key = 'p', mods = 'LEADER', action = wezterm.action.ActivateTabRelative(-1) },
```

## Remote Tmux Compatibility

When SSH'ing to servers running tmux, choose one of these strategies:

### Option 1: Different Leader Keys
- Local WezTerm: `Ctrl+A`
- Remote tmux: `Ctrl+B` (default)

### Option 2: Double-Tap Passthrough
Send literal Ctrl+A to remote:
```lua
{ key = 'a', mods = 'LEADER|CTRL', action = wezterm.action.SendKey { key = 'a', mods = 'CTRL' } },
```

### Option 3: Nested Prefix
Use `Ctrl+A, A` to send Ctrl+A to remote tmux:
```lua
{ key = 'a', mods = 'LEADER', action = wezterm.action.SendKey { key = 'a', mods = 'CTRL' } },
```

## Common Issues

### Leader Key Not Working
1. Check `timeout_milliseconds` is sufficient (1000ms recommended)
2. Verify key isn't captured by another application
3. Try reloading config: `Ctrl+Shift+R`

### Keybinding Conflicts
1. System shortcuts take precedence
2. Check for conflicting `LEADER` bindings
3. Use `wezterm.log_info()` to debug key events
