# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository (`nthplusio/functional-claude`) containing plugins for enhanced terminal and development workflows.

**Security:** This is a public repository. Hooks validate that no sensitive information (API keys, tokens, credentials, .env files) is committed.

## Repository Memory

**When working with marketplace structure, plugins, hooks, skills, or version management, always read `docs/memory.md` first.** This file contains:
- Current plugin versions and synchronization requirements
- Hook patterns and output formats
- Cache architecture standards
- Complete plugin component tables

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

Plugins use a multi-skill architecture with focused, composable components:

```
plugins/<plugin-name>/
├── .claude-plugin/plugin.json    # Plugin manifest (name, version)
├── hooks/hooks.json              # PreToolUse/Stop/SessionStart hooks
├── skills/<skill-name>/SKILL.md  # Topic-specific skills
├── agents/<agent-name>.md        # Autonomous agents
├── commands/<cmd-name>.md        # User-invocable slash commands
└── .cache/                       # Gitignored runtime cache
```

### Key Files

- **`.claude-plugin/marketplace.json`**: Root manifest listing all plugins with versions
- **`plugins/<name>/.claude-plugin/plugin.json`**: Per-plugin manifest
- **`SKILL.md`**: Skill definition with YAML frontmatter (name, description, version)
- **`AGENT.md`**: Agent definition with tools list

### Version Management

A PreToolUse hook (`.claude/hooks/check-version-bump.js`) validates version synchronization on git commits. Versions must match across:
1. `plugins/<name>/.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`
3. All `SKILL.md` frontmatter within the plugin
4. `docs/memory.md` plugin table

## Current Plugins

See `docs/memory.md` for current versions and component details. Plugins include:
- **wezterm-dev**: WezTerm terminal configuration
- **hyper-dev**: Hyper terminal configuration and plugin development
- **prisma-dev**: Prisma ORM with schema analysis and migration safety
- **shadcn-dev**: shadcn/ui and Tailwind CSS v4 workflows
- **pre-commit**: Pre-push checks for typecheck/lint/build/test
- **claude-plugin-dev**: Plugin development with guided workflows
- **opentui-dev**: OpenTUI terminal interface development
