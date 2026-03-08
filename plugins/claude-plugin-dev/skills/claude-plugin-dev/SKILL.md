---
name: claude-plugin-dev
description: Overview of Claude Code plugin development with component routing.
  Use when the user asks to "create a plugin", "build a plugin", "plugin structure",
  "how do plugins work", or needs general plugin guidance.
version: 0.5.1
---

# Claude Code Plugin Development

Guide for building Claude Code plugins. Use `/create-plugin` for guided setup.

## Quick Start

```bash
# Guided creation
/create-plugin my-plugin

# Test locally
claude --plugin-dir ./my-plugin
```

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Skills | `skills/name/SKILL.md` | Extend Claude's knowledge |
| Agents | `agents/name.md` | Specialized subagents |
| Commands | `commands/name.md` | User-triggered actions |
| Hooks | `hooks/hooks.json` | Event automation |
| MCP | `.mcp.json` | External tool integration |
| Settings | `.local.md` | User configuration |

## Focused Skills

| Topic | Skill |
|-------|-------|
| Directory layout | `/claude-plugin-dev:plugin-structure` |
| Creating skills | `/claude-plugin-dev:skill-development` |
| Creating agents | `/claude-plugin-dev:agent-development` |
| Creating commands | `/claude-plugin-dev:command-development` |
| Event hooks | `/claude-plugin-dev:hook-development` |
| MCP servers | `/claude-plugin-dev:mcp-integration` |
| User config | `/claude-plugin-dev:plugin-settings` |

## Agents

| Agent | Purpose |
|-------|---------|
| `plugin-validator` | Validate plugin structure and conventions |
| `agent-creator` | Interactive agent generation |
| `skill-reviewer` | Skill quality review |

## Key Conventions

- Plugin names: kebab-case (`my-plugin`)
- Skill names: match directory name
- Only `plugin.json` goes inside `.claude-plugin/`
- Use `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths in hooks
- Skill descriptions: capability-first with trigger phrases

## Development Workflow

1. **Plan**: Use `/create-plugin` for guided setup
2. **Implement**: Use focused skills for each component
3. **Validate**: Run `plugin-validator` agent
4. **Test**: `claude --plugin-dir ./my-plugin`
5. **Review**: Use `skill-reviewer` for quality check

## Reference Files

- **`references/docs-cache.md`** - Official documentation
- **`references/conventions.md`** - Patterns from official plugins
- **`references/examples.md`** - Complete plugin examples
