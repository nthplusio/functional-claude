# Tab Title Formatting

Complete implementation of custom tab titles with Nerd Font process icons and Agent Deck status integration.

## Format

```
[status_dot] [process_icon]  [directory] │
```

- **status_dot**: Green (working), yellow (waiting), blue (idle), or hidden (inactive)
- **process_icon**: Nerd Font icon based on foreground process
- **directory**: Current working directory leaf name

## Complete Implementation

```lua
-- Process icons mapping (Material Design Icons)
local process_icons = {
    -- Shells
    ['powershell'] = '󰨊',
    ['pwsh'] = '󰨊',
    ['cmd'] = '󰆍',
    ['bash'] = '',
    ['zsh'] = '',
    ['fish'] = '',
    ['sh'] = '',

    -- Node.js
    ['node'] = '󰎙',
    ['npm'] = '󰎙',
    ['npx'] = '󰎙',
    ['yarn'] = '󰎙',
    ['pnpm'] = '󰎙',
    ['bun'] = '󰎙',
    ['deno'] = '󰎙',

    -- Python
    ['python'] = '󰌠',
    ['python3'] = '󰌠',
    ['pip'] = '󰌠',
    ['conda'] = '󰌠',
    ['poetry'] = '󰌠',
    ['pytest'] = '󰌠',
    ['jupyter'] = '󰠮',

    -- Other languages
    ['ruby'] = '󰴭',
    ['go'] = '󰟓',
    ['cargo'] = '󱘗',
    ['rustc'] = '󱘗',
    ['java'] = '󰬷',
    ['dotnet'] = '󰪮',
    ['gcc'] = '󰙱',
    ['g++'] = '󰙲',

    -- Editors
    ['nvim'] = '',
    ['vim'] = '',
    ['code'] = '󰨞',
    ['nano'] = '󰷈',

    -- Git
    ['git'] = '󰊢',
    ['lazygit'] = '󰊢',
    ['gh'] = '󰊤',

    -- AI / Claude
    ['claude'] = '󰚩',
    ['aider'] = '󰚩',

    -- Containers
    ['docker'] = '󰡨',
    ['kubectl'] = '󱃾',
    ['k9s'] = '󱃾',

    -- Cloud
    ['aws'] = '󰸏',
    ['az'] = '󰠅',
    ['gcloud'] = '󱇶',
    ['terraform'] = '󱁢',

    -- Network
    ['ssh'] = '󰣀',
    ['curl'] = '󰖟',

    -- System
    ['htop'] = '󰄪',
    ['btop'] = '󰄪',

    -- Search
    ['grep'] = '󰍉',
    ['rg'] = '󰍉',
    ['fzf'] = '󰍉',
    ['jq'] = '󰘦',

    -- Files
    ['mc'] = '󰉋',
    ['ranger'] = '󰉋',

    -- Databases
    ['mysql'] = '󰆼',
    ['psql'] = '󰆼',
    ['redis-cli'] = '󰆼',

    -- Multiplexers
    ['tmux'] = '󰆍',
    ['screen'] = '󰆍',

    -- Default
    ['default'] = '󰆍',
}

-- Tab title event handler
wezterm.on('format-tab-title', function(tab, tabs, panes, cfg, hover, max_width)
    local pane = tab.active_pane

    -- Get Agent Deck status
    local agent_state = agent_deck.get_agent_state(pane.pane_id)
    local agent_status = agent_state and agent_state.status or 'inactive'

    -- Status dot and colors
    local status_dot, status_color
    if agent_status == 'working' then
        status_dot = '●'
        status_color = colors.green
    elseif agent_status == 'waiting' then
        status_dot = '●'
        status_color = colors.yellow
    elseif agent_status == 'idle' then
        status_dot = '○'
        status_color = colors.blue
    else
        status_dot = ''
        status_color = colors.overlay0
    end

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
    local bg = tab.is_active and colors.surface0 or colors.base
    local icon_color = tab.is_active and colors.blue or colors.overlay0
    local dir_color = tab.is_active and colors.peach or colors.overlay0
    local sep_color = colors.surface1

    -- Build elements
    local elements = {
        { Background = { Color = bg } },
    }

    -- Status dot (only if agent active)
    if status_dot ~= '' then
        table.insert(elements, { Foreground = { Color = status_color } })
        table.insert(elements, { Text = ' ' .. status_dot })
    end

    -- Process icon
    table.insert(elements, { Foreground = { Color = icon_color } })
    table.insert(elements, { Text = ' ' .. icon .. '  ' })

    -- Directory
    table.insert(elements, { Foreground = { Color = dir_color } })
    table.insert(elements, { Text = dir_leaf .. ' ' })

    -- End separator
    table.insert(elements, { Foreground = { Color = sep_color } })
    table.insert(elements, { Text = '│' })

    return elements
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
        new_tab_hover = {
            bg_color = '#45475a',
            fg_color = '#cdd6f4',
        },
    },
}
```

## Extending Process Icons

To add new process icons:

1. Find the process name (lowercase, without .exe)
2. Find appropriate Nerd Font icon from https://www.nerdfonts.com/cheat-sheet
3. Add to process_icons table

Material Design Icons (U+F0000+) are recommended for consistent styling.
