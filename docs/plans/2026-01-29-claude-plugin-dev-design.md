# Claude Plugin Dev Plugin Design

**Date:** 2026-01-29
**Status:** Approved

## Overview

A Claude Code plugin focused on documentation and conventions for building proper plugins. Caches compressed versions of official docs and extracts patterns from anthropics/claude-plugins-official.

## Plugin Structure

```
plugins/claude-plugin-dev/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── claude-plugin-dev/        # Main overview skill
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── docs-cache.md     # Compressed official docs
│   │       ├── conventions.md    # Patterns from official repo
│   │       └── examples.md       # Common patterns
│   ├── plugin-structure/         # Directory layout skill
│   │   └── SKILL.md
│   ├── skill-development/        # Creating skills
│   │   └── SKILL.md
│   ├── agent-development/        # Creating agents
│   │   └── SKILL.md
│   ├── hook-development/         # Creating hooks
│   │   └── SKILL.md
│   └── mcp-integration/          # MCP server setup
│       └── SKILL.md
├── agents/
│   └── plugin-validator/         # Validates plugin structure
│       └── AGENT.md
├── hooks/
│   └── hooks.json                # SessionStart for cache check
└── .cache/                       # Gitignored runtime cache
```

## Documentation Sources

- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/plugin-marketplaces

## Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| claude-plugin-dev | Overview, quick reference | "create a plugin", "plugin structure" |
| plugin-structure | Directory layout, manifest | "plugin directory", "plugin.json" |
| skill-development | SKILL.md, frontmatter | "create a skill", "SKILL.md" |
| agent-development | AGENT.md, tools | "create an agent", "subagent" |
| hook-development | Hook events, scripts | "create a hook", "PreToolUse" |
| mcp-integration | .mcp.json config | "add MCP server", "mcp.json" |

## Agents

| Agent | Purpose | Tools |
|-------|---------|-------|
| plugin-validator | Validate structure and conventions | Read, Glob, Grep, Bash |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| cache-refresh | SessionStart | Check if docs cache needs refresh |

## Cache Refresh Workflow

1. SessionStart hook checks `.cache/docs-cache.md` freshness
2. If missing or > 30 days old, prompt user to refresh
3. On refresh: fetch docs via WebFetch, compress, update cache
4. Manual refresh available via description in main skill

## Key Conventions (from official repo)

- Plugin names: kebab-case
- Manifest in `.claude-plugin/plugin.json`
- Skills use third-person descriptions with trigger phrases
- Progressive disclosure: SKILL.md < 2000 words, details in references/
- Hook env vars: `${CLAUDE_PLUGIN_ROOT}` for plugins
- Categories: development, productivity, security, testing, etc.
