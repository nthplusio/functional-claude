# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository (`nthplusio/functional-claude`) containing plugins for enhanced terminal and development workflows. The repository follows the Claude Code plugin marketplace structure.

**Security:** This is a public repository. A PreToolUse hook validates all file writes to prevent committing sensitive information (API keys, tokens, credentials, .env files, private URLs).

## Repository Memory

**When working with marketplace structure, plugins, hooks, skills, or version management, always read `docs/memory.md` first.** This file contains accumulated knowledge about:
- Current plugin versions and synchronization requirements
- Directory structure and file schemas
- Hook patterns and environment variables
- Skill structure and conventions
- Development workflows and best practices

## Development Commands

**Test a plugin locally:**
```bash
claude --plugin-dir ./plugins/wezterm-dev
```

**Install from marketplace (for users):**
```
/plugin marketplace add nthplusio/functional-claude
/plugin install wezterm-dev@functional-claude
```

## Architecture

### Multi-Skill Architecture

Plugins use focused, composable skills and agents:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json         # Plugin manifest
├── hooks/
│   └── hooks.json          # PreToolUse/Stop hooks
├── skills/
│   ├── <main-skill>/       # Overview skill (links to focused skills)
│   ├── <focused-skill>/    # Topic-specific skill
│   └── ...
├── agents/
│   └── <agent-name>.md     # Autonomous agent (flat file)
└── .cache/                 # Gitignored runtime cache
```

### Key Files

- **`marketplace.json`**: Declares plugins with source paths and versions
- **`plugin.json`**: Per-plugin metadata
- **`SKILL.md`**: Skill definition with YAML frontmatter
- **`AGENT.md`**: Agent definition with tools list
- **`hooks.json`**: Hook definitions for events

### Version Management

Plugin versions must be kept in sync across:
1. `plugins/<name>/.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`
3. All `SKILL.md` frontmatter within the plugin

## Current Plugins

### wezterm-dev (v0.7.0)

WezTerm terminal configuration with multi-skill architecture:

| Component | Type | Purpose |
|-----------|------|---------|
| wezterm-dev | skill | Overview, base configuration |
| wezterm-keybindings | skill | Tmux-style keybindings, leader key |
| wezterm-visual | skill | Opacity, blur, cursor, colors |
| wezterm-tabs | skill | Tab bar with Nerd Font icons |
| wezterm-agent-deck | skill | Agent Deck integration |
| wezterm-troubleshoot | agent | Autonomous debugging |

### hyper-dev (v0.2.0)

Hyper terminal configuration and plugin development:

| Component | Type | Purpose |
|-----------|------|---------|
| hyper-dev | skill | Overview, base configuration |
| hyper-keybindings | skill | Keymap customization |
| hyper-visual | skill | Opacity, colors, cursor |
| hyper-plugins | skill | Plugin development |
| hyper-themes | skill | Theme creation |
| hyper-troubleshoot | agent | Autonomous debugging |

## Root-Level Components

### terminal-cache skill

Shared cache management for terminal plugins:
- Daily documentation refresh
- Learnings capture

### functional-claude skill

Development guidance for this repository.

### Security hook

PreToolUse hook on Write/Edit that validates no sensitive data is committed.
