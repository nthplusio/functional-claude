---
name: WezTerm Development
description: This skill should be used when the user asks to "configure WezTerm", "wezterm config", "customize terminal", "add WezTerm keybindings", "wezterm keybindings", "wezterm keys", "set up Agent Deck", "create tab bar", "add status bar", "wezterm lua", "terminal theme", "pane splitting", "tmux-style keys", "terminal opacity", "terminal blur", "debug wezterm", "troubleshoot wezterm", "wezterm not working", "wezterm issue", "look at wezterm", "review wezterm config", "analyze wezterm", "fix wezterm", "wezterm problem", or mentions WezTerm configuration, Nerd Font icons in terminal, terminal visual customization, or asks "why does wezterm" questions about WezTerm behavior.
version: 0.2.0
---

# WezTerm Development

Configure and customize WezTerm terminal emulator with Lua, focusing on Claude Code workflows with Agent Deck integration.

## Before Starting: Backup Configuration

**Always create a dated backup before modifying the WezTerm config.**

```bash
cp ~/.wezterm.lua ~/.wezterm.lua.bak.$(date +%Y-%m-%d)
```

Windows PowerShell:
```powershell
Copy-Item "$env:USERPROFILE\.wezterm.lua" "$env:USERPROFILE\.wezterm.lua.bak.$(Get-Date -Format 'yyyy-MM-dd')"
```

This preserves working configurations and allows easy rollback if changes cause issues.

## Overview

WezTerm is a GPU-accelerated terminal emulator configured entirely in Lua. This skill covers:
- Base configuration (fonts, colors, themes)
- Visual enhancements (opacity, blur, cursor styles)
- Keybindings (tmux-style with leader key)
- Tab bar customization with Nerd Font icons
- Right status bar (git branch, time, agent counts)
- Agent Deck plugin for Claude Code monitoring

## Configuration File Location

WezTerm config file: `~/.wezterm.lua` (Windows: `C:\Users\<username>\.wezterm.lua`)

## Base Configuration Pattern

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- Font and appearance
config.font = wezterm.font('FiraCode Nerd Font')
config.font_size = 10
config.color_scheme = 'Catppuccin Mocha'

-- Window settings
config.initial_cols = 120
config.initial_rows = 28
config.window_padding = { left = 4, right = 4, top = 4, bottom = 4 }

return config
```

## Visual Enhancements

### Background Opacity and Blur (Windows 11)

```lua
config.window_background_opacity = 0.92
config.win32_system_backdrop = 'Acrylic'  -- Windows 11 acrylic blur
```

### Inactive Pane Dimming

```lua
config.inactive_pane_hsb = {
    saturation = 0.8,
    brightness = 0.7,
}
```

### Cursor Styling

```lua
config.default_cursor_style = 'BlinkingBar'
config.cursor_blink_rate = 500
config.cursor_blink_ease_in = 'Constant'
config.cursor_blink_ease_out = 'Constant'
config.force_reverse_video_cursor = true
```

## Tmux-Style Keybindings

### Leader Key Setup

```lua
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }
```

### Essential Keybindings

| Keys | Action |
|------|--------|
| `Ctrl+A, -` | Split horizontal (pane below) |
| `Ctrl+A, \` | Split vertical (pane right) |
| `Ctrl+A, h/j/k/l` | Navigate panes (vim-style) |
| `Ctrl+A, x` | Close current pane |
| `Ctrl+A, z` | Toggle pane zoom |
| `Ctrl+A, [` | Enter copy mode |
| `Ctrl+A, c` | Launch Claude Code |

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

## Tab Bar Customization

### Retro Tab Bar at Bottom

```lua
config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = false
config.tab_max_width = 32
```

### Custom Tab Title with Nerd Font Icons

Use `format-tab-title` event to customize tab appearance with process icons and status indicators.

Key elements:
- Process icon based on foreground process name
- Agent status dot (working/waiting/idle)
- Current directory leaf name

See `references/tab-formatting.md` for complete implementation.

## Right Status Bar

Use `update-status` event to display:
- Agent counts (working/waiting) from Agent Deck
- Git branch name (with caching to avoid frequent spawns)
- Current time

```lua
wezterm.on('update-status', function(window, pane)
    local elements = {}
    -- Build status elements...
    window:set_right_status(wezterm.format(elements))
end)
```

See `references/status-bar.md` for complete implementation with git branch caching.

## Agent Deck Integration

Use Agent Deck to monitor Claude Code agents across terminal panes.

### Installation

```lua
local agent_deck = wezterm.plugin.require('https://github.com/Eric162/wezterm-agent-deck')
```

### Configuration

```lua
agent_deck.apply_to_config(config, {
    update_interval = 500,
    cooldown_ms = 2000,
    max_lines = 100,

    colors = {
        working = '#a6e3a1',  -- green
        waiting = '#f9e2af',  -- yellow
        idle = '#89b4fa',     -- blue
        inactive = '#6c7086', -- gray
    },

    icons = { style = 'nerd' },

    notifications = {
        enabled = true,
        on_waiting = true,
        timeout_ms = 4000,
        sound = true,
    },

    tab_title = { enabled = true },
    right_status = { enabled = false },  -- Use custom status bar
})
```

### Agent Deck API

```lua
-- Get agent state for a pane
local agent_state = agent_deck.get_agent_state(pane.pane_id)
local status = agent_state and agent_state.status or 'inactive'

-- Count agents by status (for status bar)
local counts = agent_deck.count_agents_by_status()
local working = counts and counts.working or 0
local waiting = counts and counts.waiting or 0
```

## Nerd Font Icons

Use Material Design Icons (extended Unicode range) for reliable rendering. Icons in the U+F0000+ range work well in WezTerm.

Common icons:
| Icon | Codepoint | Use |
|------|-----------|-----|
| 󰨊 | U+F0A0A | PowerShell |
| 󰆍 | U+F018D | Console/Terminal |
| 󰌠 | U+F0320 | Python |
| 󰎙 | U+F0399 | Node.js |
| 󰚩 | U+F06A9 | Robot (Claude/AI) |
| 󰊢 | U+F02A2 | Git |
| 󰘬 | U+F062C | Git Branch |
| 󰥔 | U+F0954 | Clock |

See `references/nerd-font-icons.md` for complete icon reference.

## Color Palettes

### Catppuccin Mocha (Recommended)

```lua
local colors = {
    base = '#1e1e2e',
    surface0 = '#313244',
    surface1 = '#45475a',
    overlay0 = '#6c7086',
    text = '#cdd6f4',
    subtext0 = '#a6adc8',
    green = '#a6e3a1',
    yellow = '#f9e2af',
    blue = '#89b4fa',
    mauve = '#cba6f7',
    peach = '#fab387',
    red = '#f38ba8',
    teal = '#94e2d5',
}
```

## Common Patterns

### Git Branch with Caching

Cache git branch to avoid frequent process spawns:

```lua
local git_branch_cache = {}
local git_cache_ttl = 5  -- seconds

local function get_git_branch(pane)
    local cwd = pane:get_current_working_dir()
    if not cwd then return nil end

    local path = cwd.file_path:gsub('^/', '')  -- Windows path fix
    local now = os.time()
    local cached = git_branch_cache[path]

    if cached and (now - cached.time) < git_cache_ttl then
        return cached.branch
    end

    local success, stdout = wezterm.run_child_process({
        'git', '-C', path, 'rev-parse', '--abbrev-ref', 'HEAD'
    })

    local branch = success and stdout:gsub('%s+$', '') or nil
    git_branch_cache[path] = { branch = branch, time = now }
    return branch
end
```

### Process Name Extraction

```lua
local process = pane.foreground_process_name or ''
process = process:gsub('.*[/\\]', ''):gsub('%.exe$', ''):lower()
if process == '' then process = 'shell' end
```

## Testing and Debugging

1. **Reload config**: `Ctrl+Shift+R`
2. **Debug log**: `wezterm.log_info('message')` - view in debug overlay (`Ctrl+Shift+L`)
3. **Test Nerd Font glyphs**: Create test script with icon characters

## Additional Resources

### Reference Files

- **`references/tab-formatting.md`** - Complete tab title implementation
- **`references/status-bar.md`** - Right status bar with git branch
- **`references/nerd-font-icons.md`** - Comprehensive icon reference
- **`references/agent-deck.md`** - Agent Deck configuration details

### Example Files

- **`examples/wezterm-complete.lua`** - Full working configuration
