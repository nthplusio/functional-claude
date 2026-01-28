# Right Status Bar

Implementation of custom right status bar with agent counts, git branch, and time.

## Format

```
󰚩 N working │ 󰚩 N waiting │ 󰘬 branch │ 󰥔 HH:MM
```

Components shown conditionally:
- Agent counts only when agents are active
- Git branch only when in a git repository
- Time always shown

## Git Branch Caching

Avoid spawning git process on every status update by caching results:

```lua
local git_branch_cache = {}
local git_cache_ttl = 5  -- seconds

local function get_git_branch(pane)
    local cwd = pane:get_current_working_dir()
    if not cwd then return nil end

    local path = cwd.file_path
    if not path then return nil end

    -- Normalize path for Windows (remove leading /)
    path = path:gsub('^/', '')

    -- Check cache
    local now = os.time()
    local cached = git_branch_cache[path]
    if cached and (now - cached.time) < git_cache_ttl then
        return cached.branch
    end

    -- Run git rev-parse
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
```

## Complete Status Bar Implementation

```lua
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
        table.insert(elements, { Text = '󰚩 ' .. working .. ' working' })
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
        table.insert(elements, { Text = '󰘬 ' .. branch })
    end

    -- Separator before time
    if #elements > 0 then
        table.insert(elements, { Foreground = { Color = colors.overlay0 } })
        table.insert(elements, { Text = ' │ ' })
    end

    -- Time with icon
    table.insert(elements, { Foreground = { Color = colors.subtext0 } })
    table.insert(elements, { Text = '󰥔 ' .. time .. ' ' })

    window:set_right_status(wezterm.format(elements))
end)
```

## Important: Disable Agent Deck's Status Bar

When using a custom status bar, disable Agent Deck's built-in status:

```lua
agent_deck.apply_to_config(config, {
    -- ... other options ...
    right_status = {
        enabled = false,  -- Use custom status bar instead
    },
})
```

## Customization Options

### Different Time Format

```lua
local time = wezterm.strftime('%H:%M:%S')  -- with seconds
local time = wezterm.strftime('%I:%M %p')  -- 12-hour format
```

### Add More Information

```lua
-- Add hostname
local hostname = wezterm.hostname()
table.insert(elements, { Text = hostname .. ' │ ' })

-- Add battery (if available)
local battery = wezterm.battery_info()
if battery and #battery > 0 then
    local charge = math.floor(battery[1].state_of_charge * 100)
    table.insert(elements, { Text = '󰁹 ' .. charge .. '% │ ' })
end
```

### Different Separator Style

```lua
local sep = ' │ '   -- box drawing
local sep = ' | '   -- pipe
local sep = ' ⋮ '   -- dots
local sep = '  '    -- spaces only
```
