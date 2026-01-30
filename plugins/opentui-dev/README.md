# opentui-dev

OpenTUI terminal interface development plugin for Claude Code. Build modern TUIs with TypeScript and Bun.

## Installation

```bash
# Test locally
claude --plugin-dir ./plugins/opentui-dev

# Install from marketplace
/plugin marketplace add nthplusio/functional-claude
/plugin install opentui-dev@functional-claude
```

## Components

### Skills

| Skill | Description | Trigger Phrases |
|-------|-------------|-----------------|
| opentui-dev | Overview, framework selection, quick start | "build TUI", "OpenTUI", "terminal interface" |
| opentui-components | Components reference (text, box, input, select, etc.) | "text component", "input field", "select options" |
| opentui-layout | Flexbox layout system | "layout", "flexbox", "positioning" |
| opentui-keyboard | Keyboard input handling | "keyboard shortcuts", "key events", "focus" |
| opentui-animation | Timeline-based animations | "animation", "timeline", "easing" |

### Agents

| Agent | Description | Trigger Phrases |
|-------|-------------|-----------------|
| opentui-troubleshoot | Autonomous debugging for OpenTUI issues | "opentui not working", "TUI crash", "layout broken" |

### Commands

| Command | Description |
|---------|-------------|
| /opentui-scaffold | Create a new OpenTUI project with framework selection |

## Features

- **Framework Guidance**: Core (imperative), React, or Solid reconcilers
- **Component Reference**: All OpenTUI components with examples
- **Layout System**: Yoga/Flexbox layout patterns
- **Keyboard Handling**: Input events, shortcuts, focus management
- **Animation Support**: Timeline-based animations with easing
- **Testing Guidance**: Snapshot and interaction testing
- **Troubleshooting**: Autonomous debugging agent

## Quick Start

```bash
# Create a new React-based TUI
bunx create-tui@latest -t react my-app
cd my-app
bun run src/index.tsx
```

## Framework Comparison

| Feature | Core | React | Solid |
|---------|------|-------|-------|
| API Style | Imperative | Declarative | Declarative |
| Bundle Size | Smallest | Larger | Medium |
| Best For | Libraries | Apps | Performance |

## Resources

- [OpenTUI Repository](https://github.com/anomalyco/opentui)
- [Examples](https://github.com/anomalyco/opentui/tree/main/packages/core/src/examples)
- [Awesome OpenTUI](https://github.com/msmps/awesome-opentui)
