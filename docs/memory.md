# Repository Memory

This document contains accumulated knowledge about the functional-claude plugin marketplace repository. Reference this when working with plugins, marketplace structure, or repository conventions.

## Repository Identity

- **Repository:** `nthplusio/functional-claude`
- **Type:** Claude Code Plugin Marketplace
- **Purpose:** Terminal and development workflow plugins
- **Visibility:** Public (security hooks enforce no sensitive data commits)

## Current Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| wezterm-dev | 0.7.5 | WezTerm terminal configuration and customization |
| hyper-dev | 0.2.5 | Hyper terminal configuration and plugin development |
| prisma-dev | 0.1.0 | Prisma ORM development with schema analysis and migration safety |

## Architecture Overview

The plugins use a **multi-skill architecture** with focused, composable skills:

### Component Types

| Component | Purpose | Auto-Invocation |
|-----------|---------|-----------------|
| **Skills** | Conceptual guidance, multi-step workflows | Yes (model can invoke) |
| **Agents** | Complex autonomous tasks (debugging, setup) | Yes (model can delegate) |
| **Hooks** | Event-driven automation (backup, learnings) | Automatic on events |

### Plugin Structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (name, version, description)
├── hooks/
│   └── hooks.json            # PreToolUse/Stop hooks
├── skills/
│   ├── <main-skill>/         # Overview skill (links to focused skills)
│   │   ├── SKILL.md
│   │   ├── examples/
│   │   └── references/
│   ├── <focused-skill-1>/    # Focused skill (specific topic)
│   │   └── SKILL.md
│   └── <focused-skill-2>/
│       ├── SKILL.md
│       └── references/
├── agents/
│   └── <agent-name>/         # Autonomous agent
│       └── AGENT.md
└── .cache/                   # Gitignored - runtime cache
```

## WezTerm Plugin (v0.7.5)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| wezterm-dev | Overview, base config | "configure wezterm", "wezterm config" |
| wezterm-keybindings | Tmux-style keybindings | "leader key", "tmux-style", "pane splitting" |
| wezterm-visual | Opacity, blur, cursor, colors | "opacity", "blur", "cursor", "theme" |
| wezterm-tabs | Tab bar with Nerd Font icons | "tab bar", "nerd font icons", "process icons" |
| wezterm-agent-deck | Agent Deck integration | "agent deck", "claude monitoring" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| wezterm-troubleshoot | Autonomous debugging | "wezterm not working", "fix wezterm", "debug wezterm" |

## Hyper Plugin (v0.2.5)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-dev | Overview, base config | "configure hyper", "hyper config" |
| hyper-keybindings | Keymap customization | "hyper keys", "shortcuts" |
| hyper-visual | Opacity, colors, cursor | "opacity", "colors", "cursor" |
| hyper-plugins | Plugin development | "create plugin", "decorateConfig", "redux" |
| hyper-themes | Theme creation | "create theme", "color scheme" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-troubleshoot | Autonomous debugging | "hyper not working", "fix hyper", "debug hyper" |

## Prisma Plugin (v0.1.0)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| prisma-dev | Overview, general guidance | "configure prisma", "prisma orm" |
| prisma-schema | Schema design and syntax | "prisma model", "schema.prisma", "relations" |
| prisma-migrations | Migration workflows | "prisma migrate", "migration" |
| prisma-queries | Query patterns and CRUD | "prisma client", "findMany", "create" |
| prisma-recon | Repository analysis | "analyze prisma", "schema recon" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| prisma-troubleshoot | Autonomous debugging | "prisma not working", "prisma error", "P2002" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| block-manual-migration | PreToolUse | Blocks manual .sql creation in migrations/ |
| prisma-recon | SessionStart | Analyzes schema and caches findings |

## Root-Level Skills

| Skill | Purpose |
|-------|---------|
| terminal-cache | Shared cache management for terminal plugins |

## Directory Structure

```
functional-claude/
├── .claude-plugin/
│   ├── plugin.json           # Root manifest (for marketplace itself)
│   └── marketplace.json      # Lists all plugins with versions
├── hooks/
│   └── hooks.json            # Security hook (blocks sensitive data commits)
├── docs/
│   └── memory.md             # This file - repository knowledge
├── skills/
│   └── terminal-cache/       # Shared terminal cache skill
│       └── SKILL.md
└── plugins/
    ├── wezterm-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── wezterm-dev/         # Main skill (overview)
    │   │   ├── wezterm-keybindings/
    │   │   ├── wezterm-visual/
    │   │   ├── wezterm-tabs/
    │   │   └── wezterm-agent-deck/
    │   ├── agents/
    │   │   └── wezterm-troubleshoot/
    │   └── .cache/
    ├── hyper-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── hyper-dev/           # Main skill (overview)
    │   │   ├── hyper-keybindings/
    │   │   ├── hyper-visual/
    │   │   ├── hyper-plugins/
    │   │   └── hyper-themes/
    │   ├── agents/
    │   │   └── hyper-troubleshoot/
    │   └── .cache/
    └── prisma-dev/
        ├── .claude-plugin/plugin.json
        ├── hooks/hooks.json
        ├── skills/
        │   ├── prisma-dev/          # Main skill (overview)
        │   ├── prisma-schema/
        │   ├── prisma-migrations/
        │   ├── prisma-queries/
        │   └── prisma-recon/
        ├── agents/
        │   └── prisma-troubleshoot/
        └── .cache/
```

## Version Synchronization

**Critical:** Plugin versions must be synchronized across three locations:

1. `plugins/<name>/.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
2. `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"` in plugins array
3. `plugins/<name>/skills/<skill>/SKILL.md` - frontmatter `version:` (all skills in plugin)

When bumping versions:
- Update all locations simultaneously
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Commit version changes together

## Marketplace Configuration

### marketplace.json Schema

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "functional-claude",
  "owner": { "name": "nthplusio" },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "Brief description",
      "version": "X.Y.Z"
    }
  ]
}
```

### plugin.json Schema

```json
{
  "name": "plugin-name",
  "version": "X.Y.Z",
  "description": "Brief description"
}
```

## Hook Patterns

### Security Hook (Root Level)

Located at `hooks/hooks.json` - validates all Write/Edit operations for sensitive data:
- API keys, tokens, secrets
- .env files with real values
- Private URLs, credentials
- Personal information

### Plugin Hooks

Each plugin can define hooks in `plugins/<name>/hooks/hooks.json`:

**PreToolUse hooks** - Run before tool execution:
- Backup verification before config edits
- Exit code 0 = allow, exit code 2 = block

**Stop hooks** - Run when Claude finishes:
- Check transcript for plugin-related work
- Prompt for learnings capture if relevant
- Response format: `{"ok": true}` or `{"ok": false, "reason": "..."}`

### Hook Types

**Command hooks** (`"type": "command"`):
```json
{
  "type": "command",
  "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/script.sh\"",
  "timeout": 10
}
```

Note: Use command-based hooks (bash scripts that output JSON) instead of prompt-based hooks for reliable JSON output.

### Environment Variables in Hooks

- `${CLAUDE_PLUGIN_ROOT}` - Absolute path to plugin directory
- `${CLAUDE_PROJECT_DIR}` - Project root where Claude Code was started

## Skill Structure

### SKILL.md Frontmatter

```yaml
---
name: Skill Display Name
description: Trigger phrases and when-to-use guidance
version: X.Y.Z
---
```

### Agent AGENT.md Frontmatter

```yaml
---
name: Agent Display Name
description: Trigger phrases and when-to-use guidance
tools:
  - Read
  - Bash
  - Grep
  - Glob
  - WebFetch
---
```

## Development Workflow

### Testing Plugins Locally

```bash
claude --plugin-dir ./plugins/wezterm-dev
```

### Installing from Marketplace

```
/plugin marketplace add nthplusio/functional-claude
/plugin install wezterm-dev@functional-claude
```

### Creating a New Skill

1. Create directory: `plugins/<name>/skills/<skill-name>/`
2. Create SKILL.md with YAML frontmatter
3. Add references/ directory if needed
4. Update version across all locations

### Creating a New Agent

1. Create directory: `plugins/<name>/agents/<agent-name>/`
2. Create AGENT.md with YAML frontmatter
3. Define tools list and system prompt
4. Test with troubleshooting scenarios

## Conventions

### Naming

- Plugin names: lowercase with hyphens (`wezterm-dev`, `hyper-dev`)
- Skill names: `<plugin>-<topic>` (e.g., `wezterm-keybindings`)
- Agent names: `<plugin>-<action>` (e.g., `wezterm-troubleshoot`)
- Hook scripts: descriptive (`verify-wezterm-backup.sh`)

### Versions

- Start at `0.1.0` for new plugins
- Increment PATCH for fixes
- Increment MINOR for new features (new skills, agents)
- Increment MAJOR for breaking changes

### Cache Files

- Store in `plugins/<name>/.cache/`
- Always gitignore cache directories
- Use `learnings.md` for accumulated knowledge with `last_refresh` date

### Security

- Never commit API keys, tokens, or credentials
- Never commit .env files with real values
- Root security hook blocks sensitive data automatically

## Official Documentation

- **Claude Code Plugins Reference**: https://code.claude.com/docs/en/plugins-reference
  - Complete technical reference for plugin manifest schema, CLI commands, and component specifications
  - Plugin components: skills, agents, hooks, MCP servers, LSP servers
  - Hook events: PreToolUse, PostToolUse, Stop, SubagentStop, SessionStart, SessionEnd, UserPromptSubmit, PreCompact, Notification
  - Hook types: command, prompt, agent
  - Environment variables: `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PROJECT_DIR}`

- **Status Line Configuration**: https://code.claude.com/docs/en/statusline
  - Custom status line displayed at bottom of Claude Code interface

---

*Last updated: See git history for this file*
