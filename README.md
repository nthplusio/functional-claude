# Functional Claude

Claude Code plugins for enhanced terminal and development workflows.

## Installation

Add this marketplace to Claude Code:

```
/plugin marketplace add nthplusio/functional-claude
```

Then install plugins:

```
/plugin install wezterm-dev@functional-claude
```

## Available Plugins

### wezterm-dev

WezTerm terminal configuration and customization for Claude Code workflows.

**Features:**
- Base configuration patterns (fonts, colors, themes)
- Visual enhancements (opacity, blur, cursor styles, inactive pane dimming)
- Tmux-style keybindings with Ctrl+A leader key
- Custom tab bar with Nerd Font process icons
- Right status bar (git branch, time, agent counts)
- Agent Deck integration for Claude Code monitoring
- 150+ process icons for common tools

**Triggers on:**
- "configure WezTerm"
- "wezterm config"
- "add WezTerm keybindings"
- "set up Agent Deck"
- "create tab bar"
- "terminal theme"
- "pane splitting"

## Development

To test plugins locally:

```bash
claude --plugin-dir ./plugins/wezterm-dev
```

## License

MIT
