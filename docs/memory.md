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
| wezterm-dev | 0.7.8 | WezTerm terminal configuration and customization |
| hyper-dev | 0.3.2 | Hyper terminal configuration and plugin development |
| prisma-dev | 0.1.3 | Prisma ORM development with schema analysis and migration safety |
| shadcn-dev | 0.1.2 | shadcn/ui and Tailwind CSS v4 development workflows |
| pre-commit | 0.2.0 | Pre-push checks for typechecking, linting, building, and testing |
| claude-plugin-dev | 0.2.0 | Plugin development with guided workflows and AI-assisted creation |
| opentui-dev | 0.1.0 | OpenTUI terminal interface development with component design and layout |

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
│   └── <agent-name>.md       # Autonomous agent (flat file)
└── .cache/                   # Gitignored - runtime cache
```

## WezTerm Plugin (v0.7.8)

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

## Hyper Plugin (v0.3.2)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-dev | Overview, base config | "configure hyper", "hyper config" |
| hyper-keybindings | Keymap customization | "hyper keys", "shortcuts" |
| hyper-visual | Opacity, colors, cursor | "opacity", "colors", "cursor" |
| hyper-plugins | Plugin development | "create plugin", "decorateConfig", "redux" |
| hyper-themes | Theme creation | "create theme", "color scheme" |
| hyper-ecosystem | Plugin discovery | "popular plugins", "find plugin", "recommendations" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-troubleshoot | Autonomous debugging | "hyper not working", "fix hyper", "debug hyper" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| hyper-session-start | SessionStart | Detects Hyper version, refreshes caches |
| verify-hyper-backup | PreToolUse | Verifies backup before config edits |
| check-hyper-learnings | Stop | Prompts for learnings capture |

### Cache Files

| File | Refresh | Purpose |
|------|---------|---------|
| hyper-config.json | Daily | Version, config path, installed plugins |
| docs-index.json | Daily | Documentation source URLs |
| plugin-ecosystem.json | Weekly | Top 25 popular plugins |
| learnings.md | Daily | Documentation and session learnings |

## Prisma Plugin (v0.1.3)

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

## shadcn-dev Plugin (v0.1.2)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| shadcn-dev | Overview, project setup | "set up shadcn", "configure shadcn", "shadcn init" |
| shadcn-components | Component usage and customization | "add button", "create dialog", "shadcn accordion" |
| shadcn-forms | Form building with react-hook-form | "form validation", "zod schema", "useForm" |
| shadcn-theming | Theme and color customization | "dark mode", "theme colors", "css variables" |
| shadcn-data-tables | TanStack Table integration | "data table", "sortable table", "column sorting" |
| tailwindv4 | Tailwind CSS v4 features | "tailwind v4", "css-first config", "oklch colors" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| shadcn-troubleshoot | Autonomous debugging | "shadcn not working", "component not rendering", "hydration error" |

### Command

| Command | Purpose |
|---------|---------|
| /shadcn-recon | Analyze project for shadcn/ui setup and recommend components |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| cache-refresh | SessionStart | Checks if documentation cache needs refreshing |
| learnings-capture | Stop | Prompts for learnings capture after shadcn work |

## Pre-Commit Plugin (v0.2.0)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| pre-commit-setup | Repository analysis and config generation | "set up pre-commit", "configure pre-push checks", "add typecheck hooks" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| check-pre-push | PreToolUse | Runs typecheck/lint/build/test before git push |

### Config File

Location: `${CLAUDE_PROJECT_DIR}/.claude/pre-commit.json`

Supported checks (in execution order):
1. **typecheck** - Type checking (tsc, mypy, cargo check, go build)
2. **lint** - Linting (eslint, biome, ruff, clippy, golangci-lint)
3. **build** - Build verification (npm run build, cargo build, python -m build, go build)
4. **test** - Testing (npm test, pytest, cargo test, go test)

Supported ecosystems:
- JavaScript/TypeScript (npm, yarn, pnpm, bun)
- Python (mypy, ruff, pytest, python -m build)
- Rust (cargo check, clippy, cargo build, cargo test)
- Go (go build, golangci-lint, go test)

Each check can be set to `"block"` (deny push) or `"warn"` (allow with message).

For monorepos, use manual override with filter commands (e.g., `pnpm --filter @scope/pkg build`).

## opentui-dev Plugin (v0.1.0)

OpenTUI terminal interface development with TypeScript/Bun.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| opentui-dev | Overview, framework selection | "build TUI", "OpenTUI", "terminal interface" |
| opentui-components | Components reference | "text component", "input field", "select options" |
| opentui-layout | Flexbox layout system | "layout", "flexbox", "positioning" |
| opentui-keyboard | Keyboard input handling | "keyboard shortcuts", "key events", "focus" |
| opentui-animation | Timeline animations | "animation", "timeline", "easing" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| opentui-troubleshoot | Autonomous debugging | "opentui not working", "TUI crash", "layout broken" |

### Command

| Command | Purpose |
|---------|---------|
| /opentui-scaffold | Create new OpenTUI project with framework selection |

### Reference Files

| File | Purpose |
|------|---------|
| references/core-reference.md | Core imperative API |
| references/react-reference.md | React reconciler patterns |
| references/solid-reference.md | Solid reconciler patterns |
| references/components-reference.md | All components by category |
| references/layout-reference.md | Yoga/Flexbox layout |
| references/keyboard-reference.md | Input handling |
| references/animation-reference.md | Timeline animations |
| references/testing-reference.md | Test renderer and snapshots |
| references/cache-management.md | Cache refresh strategy and learnings |

## claude-plugin-dev Plugin (v0.2.0)

Plugin development documentation with guided workflows and AI-assisted creation.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| claude-plugin-dev | Overview, quick reference | "create a plugin", "plugin structure", "how do plugins work" |
| plugin-structure | Directory layout and manifest | "plugin layout", "plugin.json", "plugin directories" |
| skill-development | Writing SKILL.md files | "create a skill", "skill description", "skill frontmatter" |
| agent-development | Writing AGENT.md files | "create an agent", "subagent", "agent tools" |
| hook-development | Creating hooks.json | "create a hook", "PreToolUse", "hook events" |
| mcp-integration | MCP server configuration | "add MCP server", ".mcp.json", "external tools" |
| command-development | Writing slash commands | "create a command", "slash command", "$ARGUMENTS" |
| plugin-settings | User configuration patterns | ".local.md", "plugin settings", "configuration file" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| plugin-validator | Validate plugin structure | "validate plugin", "check plugin", "review my plugin" |
| agent-creator | AI-assisted agent generation | "create an agent", "generate an agent", "design an agent" |
| skill-reviewer | Skill quality review | "review my skill", "check skill quality", "improve skill" |

### Commands

| Command | Purpose |
|---------|---------|
| /create-plugin | 8-phase guided plugin creation workflow |

### Reference Files

| File | Purpose |
|------|---------|
| references/docs-cache.md | Compressed official documentation |
| references/conventions.md | Patterns from anthropics/claude-plugins-official |
| references/examples.md | Complete plugin examples |

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
    │   │   └── wezterm-troubleshoot.md
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
    │   │   └── hyper-troubleshoot.md
    │   └── .cache/
    ├── prisma-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── prisma-dev/          # Main skill (overview)
    │   │   ├── prisma-schema/
    │   │   ├── prisma-migrations/
    │   │   ├── prisma-queries/
    │   │   └── prisma-recon/
    │   ├── agents/
    │   │   └── prisma-troubleshoot.md
    │   └── .cache/
    ├── shadcn-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── commands/
    │   │   └── shadcn-recon.md
    │   ├── skills/
    │   │   ├── shadcn-dev/          # Main skill (overview)
    │   │   ├── shadcn-components/
    │   │   ├── shadcn-forms/
    │   │   ├── shadcn-theming/
    │   │   ├── shadcn-data-tables/
    │   │   └── tailwindv4/
    │   ├── agents/
    │   │   └── shadcn-troubleshoot.md
    │   └── .cache/
    ├── pre-commit/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/
    │   │   ├── hooks.json
    │   │   └── check-pre-push.js
    │   └── skills/
    │       └── pre-commit-setup/
    ├── claude-plugin-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── claude-plugin-dev/      # Main skill (overview)
    │   │   │   └── references/
    │   │   ├── plugin-structure/
    │   │   ├── skill-development/
    │   │   ├── agent-development/
    │   │   ├── hook-development/
    │   │   └── mcp-integration/
    │   ├── agents/
    │   │   ├── agent-creator.md
    │   │   ├── plugin-validator.md
    │   │   └── skill-reviewer.md
    │   └── .cache/
    └── opentui-dev/
        ├── .claude-plugin/plugin.json
        ├── hooks/hooks.json
        ├── commands/
        │   └── opentui-scaffold.md
        ├── skills/
        │   ├── opentui-dev/           # Main skill (overview)
        │   │   └── references/
        │   ├── opentui-components/
        │   ├── opentui-layout/
        │   ├── opentui-keyboard/
        │   └── opentui-animation/
        ├── agents/
        │   └── opentui-troubleshoot.md
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

### Root-Level Hooks

Located at `hooks/hooks.json`:

**Security Hook** (PreToolUse on Write/Edit):
- Validates all Write/Edit operations for sensitive data
- API keys, tokens, secrets
- .env files with real values
- Private URLs, credentials
- Personal information

**Version Bump Hook** (PreToolUse on Bash):
- Triggers on `git commit` commands
- Validates plugin version synchronization:
  - plugin.json version is bumped for code changes
  - marketplace.json has matching version
  - All SKILL.md files have matching version in frontmatter
- Blocks commits with version mismatches

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

1. Create file: `plugins/<name>/agents/<agent-name>.md`
2. Add YAML frontmatter with name, description, tools
3. Define system prompt in markdown body
4. Test with triggering scenarios

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
