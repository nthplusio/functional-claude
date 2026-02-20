---
name: wezterm-agent-deck
description: This skill should be used when the user asks about "agent deck", "claude monitoring", "agent status", "agent notifications", "claude code status", "agent counts", "working waiting idle", or mentions monitoring Claude Code agents in WezTerm.
version: 0.7.13
---

# WezTerm Agent Deck

Monitor Claude Code agents across terminal panes with Agent Deck plugin.

## Installation

```lua
local agent_deck = wezterm.plugin.require('https://github.com/Eric162/wezterm-agent-deck')
```

## Configuration

```lua
agent_deck.apply_to_config(config, {
    update_interval = 500,      -- ms between status checks
    cooldown_ms = 2000,         -- ms before marking agent as idle
    max_lines = 100,            -- lines to scan for status

    colors = {
        working = '#a6e3a1',    -- green
        waiting = '#f9e2af',    -- yellow
        idle = '#89b4fa',       -- blue
        inactive = '#6c7086',   -- gray
    },

    icons = { style = 'nerd' },

    notifications = {
        enabled = true,
        on_waiting = true,      -- notify when agent needs input
        timeout_ms = 4000,
        sound = true,
    },

    tab_title = { enabled = true },
    right_status = { enabled = false },  -- Use custom status bar
})
```

## Agent Status States

| Status | Color | Meaning |
|--------|-------|---------|
| working | green | Agent is actively processing |
| waiting | yellow | Agent needs user input |
| idle | blue | Agent is idle (after cooldown) |
| inactive | gray | No agent detected in pane |

## API: Get Agent State

```lua
local agent_state = agent_deck.get_agent_state(pane.pane_id)
local status = agent_state and agent_state.status or 'inactive'
```

Use in tab formatting:
```lua
wezterm.on('format-tab-title', function(tab, tabs, panes, cfg, hover, max_width)
    local pane = tab.active_pane
    local agent_state = agent_deck.get_agent_state(pane.pane_id)
    local status = agent_state and agent_state.status or 'inactive'

    local status_dot = ''
    if status == 'working' then
        status_dot = '●'  -- green
    elseif status == 'waiting' then
        status_dot = '●'  -- yellow
    elseif status == 'idle' then
        status_dot = '○'  -- blue
    end
    -- ... rest of tab formatting
end)
```

## API: Count Agents

```lua
if agent_deck.count_agents_by_status then
    local ok, counts = pcall(agent_deck.count_agents_by_status)
    if ok and counts then
        local working = counts.working or 0
        local waiting = counts.waiting or 0
        local idle = counts.idle or 0
    end
end
```

Use in status bar:
```lua
wezterm.on('update-status', function(window, pane)
    local elements = {}

    if agent_deck.count_agents_by_status then
        local ok, counts = pcall(agent_deck.count_agents_by_status)
        if ok and counts then
            if counts.working > 0 then
                table.insert(elements, { Foreground = { Color = '#a6e3a1' } })
                table.insert(elements, { Text = '󰚩 ' .. counts.working .. ' working' })
            end
            if counts.waiting > 0 then
                table.insert(elements, { Foreground = { Color = '#f9e2af' } })
                table.insert(elements, { Text = ' │ 󰚩 ' .. counts.waiting .. ' waiting' })
            end
        end
    end

    window:set_right_status(wezterm.format(elements))
end)
```

## Desktop Notifications

Agent Deck can notify when agents need attention:

```lua
notifications = {
    enabled = true,
    on_waiting = true,     -- Notify when agent is waiting
    timeout_ms = 4000,
    sound = true,
},
```

Useful for multiple Claude Code sessions.

## Integration with Custom Status Bar

Disable built-in status bar when using custom:

```lua
agent_deck.apply_to_config(config, {
    right_status = { enabled = false },
})
```

## Troubleshooting

### Agent Status Not Detected
1. Verify Claude Code is running in the pane
2. Check `max_lines` captures status output
3. Increase `update_interval` if CPU usage is high

### Notifications Not Working
1. Check system notification permissions
2. Verify `notifications.enabled = true`

### API Function Not Found
Wrap in pcall for safety:
```lua
if agent_deck.count_agents_by_status then
    local ok, counts = pcall(agent_deck.count_agents_by_status)
end
```
