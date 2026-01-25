local wezterm = require 'wezterm'
local agent_deck = wezterm.plugin.require('https://github.com/Eric162/wezterm-agent-deck')

local config = wezterm.config_builder()

-- Leader key (Ctrl+A prefix, tmux-style)
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }

-- Base configuration
config.initial_cols = 120
config.initial_rows = 28
config.font = wezterm.font('FiraCode Nerd Font')
config.font_size = 10
config.color_scheme = 'Catppuccin Mocha'
config.default_prog = { 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', '-NoLogo' }
config.warn_about_missing_glyphs = false

-- Visual: Background opacity and blur
config.window_background_opacity = 0.92
config.win32_system_backdrop = 'Acrylic'  -- Windows 11 acrylic blur

-- Visual: Inactive pane dimming
config.inactive_pane_hsb = {
    saturation = 0.8,
    brightness = 0.7,
}

-- Visual: Cursor styling
config.default_cursor_style = 'BlinkingBar'
config.cursor_blink_rate = 500
config.cursor_blink_ease_in = 'Constant'
config.cursor_blink_ease_out = 'Constant'
config.force_reverse_video_cursor = true

-- Retro tab bar at bottom (Mission Control style)
config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = false
config.tab_max_width = 32

-- Tab bar colors (retro style)
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

-- Terminal padding
config.window_padding = {
    left = 4,
    right = 4,
    top = 4,
    bottom = 4,
}

-- Launch menu for new tab button (right-click + or Alt+L)
config.launch_menu = {
    {
        label = 'PowerShell',
        args = { 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', '-NoLogo' },
    },
    {
        label = 'CMD',
        args = { 'cmd.exe' },
    },
    {
        label = 'Git Bash',
        args = { 'C:\\Users\\scoussens\\AppData\\Local\\Programs\\Git\\bin\\bash.exe', '-i', '-l' },
    },
}

-- Keybindings
config.keys = {
    { key = 'l', mods = 'ALT', action = wezterm.action.ShowLauncher },
    -- Alt+1-9 to switch tabs
    { key = '1', mods = 'ALT', action = wezterm.action.ActivateTab(0) },
    { key = '2', mods = 'ALT', action = wezterm.action.ActivateTab(1) },
    { key = '3', mods = 'ALT', action = wezterm.action.ActivateTab(2) },
    { key = '4', mods = 'ALT', action = wezterm.action.ActivateTab(3) },
    { key = '5', mods = 'ALT', action = wezterm.action.ActivateTab(4) },
    { key = '6', mods = 'ALT', action = wezterm.action.ActivateTab(5) },
    { key = '7', mods = 'ALT', action = wezterm.action.ActivateTab(6) },
    { key = '8', mods = 'ALT', action = wezterm.action.ActivateTab(7) },
    { key = '9', mods = 'ALT', action = wezterm.action.ActivateTab(8) },
    -- Ctrl+Tab / Ctrl+Shift+Tab to cycle tabs
    { key = 'Tab', mods = 'CTRL', action = wezterm.action.ActivateTabRelative(1) },
    { key = 'Tab', mods = 'CTRL|SHIFT', action = wezterm.action.ActivateTabRelative(-1) },

    -- Quick Launcher: Ctrl+A, c to launch Claude Code
    { key = 'c', mods = 'LEADER', action = wezterm.action.SpawnCommandInNewTab {
        args = { 'claude' },
    }},

    -- Pane Splits (tmux-style)
    { key = '-', mods = 'LEADER', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
    { key = '\\', mods = 'LEADER', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },
    { key = '|', mods = 'LEADER|SHIFT', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },

    -- Pane navigation (vim-style)
    { key = 'h', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Left' },
    { key = 'j', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Down' },
    { key = 'k', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Up' },
    { key = 'l', mods = 'LEADER', action = wezterm.action.ActivatePaneDirection 'Right' },

    -- Pane management
    { key = 'x', mods = 'LEADER', action = wezterm.action.CloseCurrentPane { confirm = true } },
    { key = 'z', mods = 'LEADER', action = wezterm.action.TogglePaneZoomState },
    { key = '[', mods = 'LEADER', action = wezterm.action.ActivateCopyMode },
}

-- Catppuccin colors
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
    sky = '#89dceb',
    lavender = '#b4befe',
}

-- Nerd Font icons for processes (Material Design Icons)
local process_icons = {
    -- Shells
    ['powershell'] = '󰨊',   -- nf-md-powershell
    ['pwsh'] = '󰨊',
    ['cmd'] = '󰆍',          -- nf-md-console
    ['bash'] = '',
    ['zsh'] = '',
    ['fish'] = '',
    ['sh'] = '',
    ['nu'] = '',
    ['elvish'] = '',
    ['xonsh'] = '',

    -- Node.js ecosystem
    ['node'] = '󰎙',         -- nf-md-nodejs
    ['npm'] = '󰎙',
    ['npx'] = '󰎙',
    ['yarn'] = '󰎙',
    ['pnpm'] = '󰎙',
    ['bun'] = '󰎙',
    ['deno'] = '󰎙',
    ['ts-node'] = '󰎙',
    ['tsx'] = '󰎙',

    -- Python ecosystem
    ['python'] = '󰌠',       -- nf-md-language_python
    ['python3'] = '󰌠',
    ['pip'] = '󰌠',
    ['pip3'] = '󰌠',
    ['conda'] = '󰌠',
    ['poetry'] = '󰌠',
    ['uv'] = '󰌠',
    ['uvicorn'] = '󰌠',
    ['gunicorn'] = '󰌠',
    ['flask'] = '󰌠',
    ['django'] = '󰌠',
    ['pytest'] = '󰌠',
    ['ipython'] = '󰌠',
    ['jupyter'] = '󰠮',      -- nf-md-notebook

    -- Ruby ecosystem
    ['ruby'] = '󰴭',         -- nf-md-language_ruby
    ['irb'] = '󰴭',
    ['gem'] = '󰴭',
    ['bundle'] = '󰴭',
    ['bundler'] = '󰴭',
    ['rails'] = '󰴭',
    ['rake'] = '󰴭',

    -- Go
    ['go'] = '󰟓',           -- nf-md-language_go

    -- Rust ecosystem
    ['cargo'] = '󱘗',        -- nf-md-language_rust
    ['rustc'] = '󱘗',
    ['rustup'] = '󱘗',

    -- Java/JVM
    ['java'] = '󰬷',         -- nf-md-language_java
    ['javac'] = '󰬷',
    ['gradle'] = '󰬷',
    ['mvn'] = '󰬷',
    ['maven'] = '󰬷',
    ['kotlin'] = '󰬷',
    ['scala'] = '󰬷',
    ['sbt'] = '󰬷',
    ['clojure'] = '󰬷',
    ['lein'] = '󰬷',

    -- .NET
    ['dotnet'] = '󰪮',       -- nf-md-dot_net
    ['csc'] = '󰪮',
    ['fsc'] = '󰪮',

    -- C/C++
    ['gcc'] = '󰙱',          -- nf-md-language_c
    ['g++'] = '󰙲',          -- nf-md-language_cpp
    ['clang'] = '󰙱',
    ['clang++'] = '󰙲',
    ['cmake'] = '󰙲',
    ['make'] = '󰙲',
    ['ninja'] = '󰙲',

    -- Editors
    ['nvim'] = '',         -- nf-custom-vim
    ['vim'] = '',
    ['vi'] = '',
    ['code'] = '󰨞',         -- nf-md-microsoft_visual_studio_code
    ['code-insiders'] = '󰨞',
    ['nano'] = '󰷈',         -- nf-md-file_edit
    ['emacs'] = '',
    ['micro'] = '󰷈',
    ['helix'] = '󰷈',
    ['hx'] = '󰷈',
    ['sublime_text'] = '󰷈',
    ['subl'] = '󰷈',

    -- Git & version control
    ['git'] = '󰊢',          -- nf-md-git
    ['lazygit'] = '󰊢',
    ['tig'] = '󰊢',
    ['gh'] = '󰊤',           -- nf-md-github
    ['glab'] = '󰮠',         -- nf-md-gitlab
    ['gitui'] = '󰊢',

    -- AI / Claude
    ['claude'] = '󰚩',       -- nf-md-robot
    ['aider'] = '󰚩',
    ['copilot'] = '󰚩',

    -- Containers & orchestration
    ['docker'] = '󰡨',       -- nf-md-docker
    ['docker-compose'] = '󰡨',
    ['podman'] = '󰡨',
    ['kubectl'] = '󱃾',      -- nf-md-kubernetes
    ['k9s'] = '󱃾',
    ['helm'] = '󱃾',
    ['minikube'] = '󱃾',
    ['kind'] = '󱃾',
    ['containerd'] = '󰡨',
    ['nerdctl'] = '󰡨',

    -- Cloud CLIs
    ['aws'] = '󰸏',          -- nf-md-aws
    ['az'] = '󰠅',           -- nf-md-microsoft_azure
    ['gcloud'] = '󱇶',       -- nf-md-google_cloud
    ['terraform'] = '󱁢',    -- nf-md-terraform
    ['pulumi'] = '󰜫',       -- nf-md-cloud
    ['cdk'] = '󰸏',

    -- Network & SSH
    ['ssh'] = '󰣀',          -- nf-md-ssh
    ['scp'] = '󰣀',
    ['sftp'] = '󰣀',
    ['curl'] = '󰖟',         -- nf-md-web
    ['wget'] = '󰖟',
    ['httpie'] = '󰖟',
    ['http'] = '󰖟',
    ['telnet'] = '󰖟',
    ['netcat'] = '󰖟',
    ['nc'] = '󰖟',
    ['nmap'] = '󰖟',

    -- System monitoring
    ['htop'] = '󰄪',         -- nf-md-chart_line
    ['top'] = '󰄪',
    ['btop'] = '󰄪',
    ['gtop'] = '󰄪',
    ['glances'] = '󰄪',
    ['ps'] = '󰄪',
    ['procs'] = '󰄪',

    -- Text search & processing
    ['grep'] = '󰍉',         -- nf-md-magnify
    ['rg'] = '󰍉',
    ['ag'] = '󰍉',
    ['ack'] = '󰍉',
    ['fd'] = '󰍉',
    ['fzf'] = '󰍉',
    ['sk'] = '󰍉',
    ['jq'] = '󰘦',           -- nf-md-code_json
    ['yq'] = '󰘦',
    ['sed'] = '󰷈',
    ['awk'] = '󰷈',
    ['gawk'] = '󰷈',
    ['perl'] = '󰷈',
    ['xargs'] = '󰷈',

    -- File managers
    ['mc'] = '󰉋',           -- nf-md-folder
    ['ranger'] = '󰉋',
    ['lf'] = '󰉋',
    ['nnn'] = '󰉋',
    ['vifm'] = '󰉋',
    ['yazi'] = '󰉋',
    ['broot'] = '󰉋',

    -- Databases
    ['mysql'] = '󰆼',        -- nf-md-database
    ['psql'] = '󰆼',
    ['postgres'] = '󰆼',
    ['mongo'] = '󰆼',
    ['mongosh'] = '󰆼',
    ['redis-cli'] = '󰆼',
    ['sqlite3'] = '󰆼',
    ['sqlcmd'] = '󰆼',
    ['pgcli'] = '󰆼',
    ['mycli'] = '󰆼',
    ['litecli'] = '󰆼',
    ['usql'] = '󰆼',

    -- Multiplexers
    ['tmux'] = '󰆍',
    ['screen'] = '󰆍',
    ['zellij'] = '󰆍',

    -- Compression
    ['tar'] = '󰗄',          -- nf-md-zip_box
    ['zip'] = '󰗄',
    ['unzip'] = '󰗄',
    ['7z'] = '󰗄',
    ['gzip'] = '󰗄',
    ['gunzip'] = '󰗄',
    ['bzip2'] = '󰗄',
    ['xz'] = '󰗄',
    ['zstd'] = '󰗄',

    -- Package managers
    ['apt'] = '󰏖',          -- nf-md-package
    ['apt-get'] = '󰏖',
    ['yum'] = '󰏖',
    ['dnf'] = '󰏖',
    ['pacman'] = '󰏖',
    ['brew'] = '󰏖',
    ['choco'] = '󰏖',
    ['scoop'] = '󰏖',
    ['winget'] = '󰏖',
    ['snap'] = '󰏖',
    ['flatpak'] = '󰏖',
    ['nix'] = '󱄅',          -- nf-md-nix

    -- Web servers & proxies
    ['nginx'] = '󰒍',        -- nf-md-server
    ['apache2'] = '󰒍',
    ['httpd'] = '󰒍',
    ['caddy'] = '󰒍',

    -- Misc tools
    ['man'] = '󰮥',          -- nf-md-book_open
    ['tldr'] = '󰮥',
    ['less'] = '󰈙',         -- nf-md-file_document
    ['more'] = '󰈙',
    ['cat'] = '󰈙',
    ['bat'] = '󰈙',
    ['head'] = '󰈙',
    ['tail'] = '󰈙',
    ['watch'] = '󰥔',        -- nf-md-clock
    ['time'] = '󰥔',
    ['hyperfine'] = '󰥔',
    ['tokei'] = '󰥔',
    ['cloc'] = '󰥔',
    ['dust'] = '󰋊',         -- nf-md-harddisk
    ['duf'] = '󰋊',
    ['ncdu'] = '󰋊',
    ['exa'] = '󰙅',          -- nf-md-file_tree
    ['eza'] = '󰙅',
    ['lsd'] = '󰙅',
    ['tree'] = '󰙅',
    ['neofetch'] = '󰌽',     -- nf-md-linux
    ['fastfetch'] = '󰌽',
    ['onefetch'] = '󰊢',
    ['figlet'] = '󰊄',       -- nf-md-format_text
    ['cmatrix'] = '󰆍',
    ['asciinema'] = '󰕧',    -- nf-md-video
    ['delta'] = '󰊢',
    ['diff'] = '󰊢',

    -- Default fallback
    ['default'] = '󰆍',      -- nf-md-console
}

-- Custom tab title formatting
-- Format: icon status_dot process directory │
wezterm.on('format-tab-title', function(tab, tabs, panes, cfg, hover, max_width)
    local pane = tab.active_pane

    -- Get Agent Deck status via its public API
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
        status_dot = ''  -- No dot for inactive
        status_color = colors.overlay0
    end

    -- Get process name (without .exe)
    local process = pane.foreground_process_name or ''
    process = process:gsub('.*[/\\]', ''):gsub('%.exe$', ''):lower()
    if process == '' then process = 'shell' end

    -- Get Nerd Font icon for process
    local icon = process_icons[process] or process_icons['default']

    -- Get directory leaf
    local cwd = pane.current_working_dir
    local dir_leaf = '~'
    if cwd then
        local path = cwd.file_path
        if path then
            path = path:gsub('[/\\]+$', '')
            path = path:gsub('^/', '')
            local leaf = path:match('[^/\\]+$')
            if leaf and leaf ~= '' then
                dir_leaf = leaf
            end
        end
    end

    -- Colors based on active state
    local bg = tab.is_active and colors.surface0 or colors.base
    local icon_color = tab.is_active and colors.blue or colors.overlay0
    local sep_color = colors.surface1
    local dir_color = tab.is_active and colors.peach or colors.overlay0

    -- Separator (box drawing vertical)
    local sep = '│'

    local elements = {
        { Background = { Color = bg } },
    }

    -- Status dot first (only if active agent)
    if status_dot ~= '' then
        table.insert(elements, { Foreground = { Color = status_color } })
        table.insert(elements, { Text = ' ' .. status_dot })
    end

    -- Process icon (between status and directory)
    table.insert(elements, { Foreground = { Color = icon_color } })
    table.insert(elements, { Text = ' ' .. icon .. '  ' })

    -- Directory
    table.insert(elements, { Foreground = { Color = dir_color } })
    table.insert(elements, { Text = dir_leaf .. ' ' })

    -- End separator
    table.insert(elements, { Foreground = { Color = sep_color } })
    table.insert(elements, { Text = sep })

    return elements
end)

-- Git branch cache to avoid frequent spawns
local git_branch_cache = {}
local git_cache_ttl = 5 -- 5 seconds

local function get_git_branch(pane)
    local cwd = pane:get_current_working_dir()
    if not cwd then return nil end

    local path = cwd.file_path
    if not path then return nil end

    -- Normalize path for Windows
    path = path:gsub('^/', '')

    -- Check cache
    local now = os.time()
    local cached = git_branch_cache[path]
    if cached and (now - cached.time) < git_cache_ttl then
        return cached.branch
    end

    -- Run git rev-parse to get branch name
    local success, stdout, stderr = wezterm.run_child_process({
        'git', '-C', path, 'rev-parse', '--abbrev-ref', 'HEAD'
    })

    local branch = nil
    if success and stdout then
        branch = stdout:gsub('%s+$', '')
        if branch == '' then branch = nil end
    end

    -- Update cache
    git_branch_cache[path] = { branch = branch, time = now }
    return branch
end

-- Right status bar: agent summary, git branch, time
wezterm.on('update-status', function(window, pane)
    -- Get agent counts from Agent Deck (with error handling)
    local working = 0
    local waiting = 0
    if agent_deck.count_agents_by_status then
        local ok, counts = pcall(agent_deck.count_agents_by_status)
        if ok and counts then
            working = counts.working or 0
            waiting = counts.waiting or 0
        end
    end

    -- Get git branch
    local branch = get_git_branch(pane)

    -- Get current time
    local time = wezterm.strftime('%H:%M')

    -- Build status elements
    local elements = {}

    -- Agent summary (only show if there are agents)
    if working > 0 then
        table.insert(elements, { Foreground = { Color = colors.green } })
        table.insert(elements, { Text = '󰚩 ' .. working .. ' working' })  -- nf-md-robot
    end
    if waiting > 0 then
        if working > 0 then
            table.insert(elements, { Foreground = { Color = colors.overlay0 } })
            table.insert(elements, { Text = ' │ ' })
        end
        table.insert(elements, { Foreground = { Color = colors.yellow } })
        table.insert(elements, { Text = '󰚩 ' .. waiting .. ' waiting' })
    end

    -- Git branch with icon
    if branch then
        if working > 0 or waiting > 0 then
            table.insert(elements, { Foreground = { Color = colors.overlay0 } })
            table.insert(elements, { Text = ' │ ' })
        end
        table.insert(elements, { Foreground = { Color = colors.mauve } })
        table.insert(elements, { Text = '󰘬 ' .. branch })  -- nf-md-source_branch
    end

    -- Separator before time
    if #elements > 0 then
        table.insert(elements, { Foreground = { Color = colors.overlay0 } })
        table.insert(elements, { Text = ' │ ' })
    end

    -- Time with icon
    table.insert(elements, { Foreground = { Color = colors.subtext0 } })
    table.insert(elements, { Text = '󰥔 ' .. time .. ' ' })  -- nf-md-clock

    window:set_right_status(wezterm.format(elements))
end)

-- Agent Deck configuration
agent_deck.apply_to_config(config, {
    update_interval = 500,
    cooldown_ms = 2000,
    max_lines = 100,

    -- Catppuccin-aligned colors
    colors = {
        working = colors.green,
        waiting = colors.yellow,
        idle = colors.blue,
        inactive = colors.overlay0,
    },

    -- Nerd font icons
    icons = {
        style = 'nerd',
    },

    notifications = {
        enabled = true,
        on_waiting = true,
        timeout_ms = 4000,
        sound = true,  -- Enable notification sound for waiting state
    },

    tab_title = {
        enabled = true,  -- Let Agent Deck set user_vars for status
    },

    right_status = {
        enabled = false,  -- Disabled: using custom right status bar
    },
})

return config
