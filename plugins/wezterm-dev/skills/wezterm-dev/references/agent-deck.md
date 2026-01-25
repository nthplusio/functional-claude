# Agent Deck Configuration

Agent Deck is a WezTerm plugin for monitoring Claude Code agents across terminal panes.

## Installation

```lua
local agent_deck = wezterm.plugin.require('https://github.com/Eric162/wezterm-agent-deck')
```

## Full Configuration

```lua
agent_deck.apply_to_config(config, {
    -- Update frequency
    update_interval = 500,      -- ms between status checks
    cooldown_ms = 2000,         -- ms before marking agent as idle
    max_lines = 100,            -- lines to scan for status

    -- Status colors (Catppuccin Mocha)
    colors = {
        working = '#a6e3a1',    -- green - agent is processing
        waiting = '#f9e2af',    -- yellow - waiting for user input
        idle = '#89b4fa',       -- blue - agent idle
        inactive = '#6c7086',   -- gray - no agent detected
    },

    -- Icon style
    icons = {
        style = 'nerd',         -- use Nerd Font icons
    },

    -- Desktop notifications
    notifications = {
        enabled = true,         -- enable notifications
        on_waiting = true,      -- notify when agent needs input
        timeout_ms = 4000,      -- notification display time
        sound = true,           -- play sound on notification
    },

    -- Tab title integration
    tab_title = {
        enabled = true,         -- set user_vars for tab status
    },

    -- Built-in right status bar
    right_status = {
        enabled = false,        -- disable if using custom status bar
    },
})
```

## API Reference

### get_agent_state(pane_id)

Get the current state of an agent in a specific pane.

```lua
local agent_state = agent_deck.get_agent_state(pane.pane_id)
```

Returns table with:
- `status`: 'working', 'waiting', 'idle', or nil
- Additional state information

Usage in tab formatting:
```lua
local agent_state = agent_deck.get_agent_state(pane.pane_id)
local agent_status = agent_state and agent_state.status or 'inactive'
```

### count_agents_by_status()

Count all agents across panes by their status.

```lua
local counts = agent_deck.count_agents_by_status()
```

Returns table with:
- `working`: number of working agents
- `waiting`: number of waiting agents
- `idle`: number of idle agents

Usage in status bar:
```lua
if agent_deck.count_agents_by_status then
    local ok, counts = pcall(agent_deck.count_agents_by_status)
    if ok and counts then
        local working = counts.working or 0
        local waiting = counts.waiting or 0
    end
end
```

## Status States

| Status | Color | Meaning |
|--------|-------|---------|
| working | green | Agent is actively processing |
| waiting | yellow | Agent needs user input |
| idle | blue | Agent is idle (after cooldown) |
| inactive | gray | No agent detected in pane |

## Integration with Custom Tab Titles

When using custom `format-tab-title`, disable Agent Deck's tab_title to avoid conflicts:

```lua
agent_deck.apply_to_config(config, {
    tab_title = {
        enabled = true,  -- Still set user_vars for status detection
    },
})
```

Then read status in your event handler:
```lua
wezterm.on('format-tab-title', function(tab, tabs, panes, cfg, hover, max_width)
    local pane = tab.active_pane
    local agent_state = agent_deck.get_agent_state(pane.pane_id)
    local status = agent_state and agent_state.status or 'inactive'

    -- Use status for icon/color selection
    if status == 'working' then
        -- green indicator
    elseif status == 'waiting' then
        -- yellow indicator
    end
end)
```

## Integration with Custom Status Bar

Disable Agent Deck's built-in status bar when using custom:

```lua
agent_deck.apply_to_config(config, {
    right_status = {
        enabled = false,  -- Use custom status bar
    },
})
```

Then use `count_agents_by_status()` in your `update-status` handler.

## Notifications

Agent Deck can send desktop notifications when agents need attention:

```lua
notifications = {
    enabled = true,
    on_waiting = true,     -- Notify when agent is waiting for input
    timeout_ms = 4000,     -- How long notification displays
    sound = true,          -- Play notification sound
},
```

This is useful when running multiple Claude Code sessions - you'll be notified when any agent needs your attention.

## Troubleshooting

### Agent Status Not Detected

1. Verify Claude Code is running in the pane
2. Check `max_lines` is sufficient to capture status output
3. Increase `update_interval` if CPU usage is high

### Notifications Not Working

1. Check system notification permissions
2. Verify `notifications.enabled = true`
3. Test with `sound = false` to isolate audio issues

### Status Bar Conflicts

If both Agent Deck and custom status bar show, ensure:
```lua
right_status = {
    enabled = false,
},
```

### API Function Not Found

Wrap API calls in pcall for safety:
```lua
if agent_deck.count_agents_by_status then
    local ok, counts = pcall(agent_deck.count_agents_by_status)
    if ok and counts then
        -- use counts
    end
end
```
