---
name: wezterm-tabs
description: This skill should be used when the user asks about "tab bar", "tab title", "nerd font icons", "process icons", "tab formatting", "powerline tabs", "retro tab bar", "tab colors", or mentions customizing WezTerm tabs with icons and status indicators.
version: 0.7.10
---

# WezTerm Tab Bar

Customize tab bar with Nerd Font icons, process detection, and status indicators.

## Tab Bar Position and Style

```lua
config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = false   -- Retro style for custom formatting
config.tab_max_width = 32
```

## Custom Tab Title Format

```
[status_dot] [process_icon]  [directory] |
```

- **status_dot**: Agent status (working/waiting/idle)
- **process_icon**: Nerd Font icon based on foreground process
- **directory**: Current working directory leaf name

## Process Icons Mapping

```lua
local process_icons = {
    -- Shells
    ['powershell'] = '󰨊',
    ['pwsh'] = '󰨊',
    ['cmd'] = '󰆍',
    ['bash'] = '',
    ['zsh'] = '',

    -- Node.js
    ['node'] = '󰎙',
    ['npm'] = '󰎙',
    ['bun'] = '󰎙',

    -- Python
    ['python'] = '󰌠',
    ['pip'] = '󰌠',

    -- Editors
    ['nvim'] = '',
    ['vim'] = '',
    ['code'] = '󰨞',

    -- Git
    ['git'] = '󰊢',
    ['lazygit'] = '󰊢',

    -- AI
    ['claude'] = '󰚩',

    -- Default
    ['default'] = '󰆍',
}
```

See `references/icons.md` for complete icon reference.

## Tab Title Event Handler

```lua
wezterm.on('format-tab-title', function(tab, tabs, panes, cfg, hover, max_width)
    local pane = tab.active_pane

    -- Get process name
    local process = pane.foreground_process_name or ''
    process = process:gsub('.*[/\\]', ''):gsub('%.exe$', ''):lower()
    if process == '' then process = 'shell' end

    -- Get icon
    local icon = process_icons[process] or process_icons['default']

    -- Get directory leaf
    local cwd = pane.current_working_dir
    local dir_leaf = '~'
    if cwd then
        local path = cwd.file_path
        if path then
            path = path:gsub('[/\\]+$', ''):gsub('^/', '')
            local leaf = path:match('[^/\\]+$')
            if leaf and leaf ~= '' then
                dir_leaf = leaf
            end
        end
    end

    -- Colors based on active state
    local bg = tab.is_active and '#313244' or '#1e1e2e'
    local fg = tab.is_active and '#cdd6f4' or '#6c7086'

    return {
        { Background = { Color = bg } },
        { Foreground = { Color = fg } },
        { Text = ' ' .. icon .. '  ' .. dir_leaf .. ' │' },
    }
end)
```

## Tab Bar Colors

```lua
config.colors = {
    tab_bar = {
        background = '#1e1e2e',
        active_tab = {
            bg_color = '#313244',
            fg_color = '#cdd6f4',
        },
        inactive_tab = {
            bg_color = '#1e1e2e',
            fg_color = '#6c7086',
        },
        inactive_tab_hover = {
            bg_color = '#45475a',
            fg_color = '#cdd6f4',
        },
        new_tab = {
            bg_color = '#1e1e2e',
            fg_color = '#6c7086',
        },
    },
}
```

## Adding New Process Icons

1. Find process name (lowercase, without .exe)
2. Find icon from https://www.nerdfonts.com/cheat-sheet
3. Add to `process_icons` table

Material Design Icons (U+F0000+) are recommended for consistent styling.

## Font Requirements

Install a Nerd Font with Material Design Icons:
- **FiraCode Nerd Font** (recommended)
- **JetBrainsMono Nerd Font**
- **Hack Nerd Font**

```lua
config.font = wezterm.font('FiraCode Nerd Font')
```
