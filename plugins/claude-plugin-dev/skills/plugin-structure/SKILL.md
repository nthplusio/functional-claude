---
name: plugin-structure
description: This skill should be used when the user asks to "create plugin structure",
  "set up plugin directories", "plugin layout", "plugin manifest", or needs guidance
  on organizing plugin files and folders.
version: 0.1.0
---

# Plugin Structure

Guide for organizing Claude Code plugin directories and creating manifests.

## Directory Layout

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Required: manifest file
├── skills/                # SKILL.md in subdirectories
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── agents/                # AGENT.md files
│   └── agent-name/
│       └── AGENT.md
├── commands/              # Slash command definitions
│   └── command-name.md
├── hooks/
│   └── hooks.json         # Event handlers
├── .mcp.json              # MCP server configs
├── .lsp.json              # LSP server configs
└── README.md
```

**Critical:** Only `plugin.json` goes inside `.claude-plugin/`. All other components (skills, agents, hooks) go in the plugin root.

## Plugin Manifest (plugin.json)

### Minimal

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does"
}
```

### Full

```json
{
  "name": "my-plugin",
  "description": "Brief description of what it does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "email@example.com"
  },
  "homepage": "https://github.com/org/repo",
  "repository": "https://github.com/org/repo",
  "license": "MIT"
}
```

## Naming Conventions

| Component | Convention | Example |
|-----------|------------|---------|
| Plugin name | kebab-case | `code-reviewer` |
| Skill name | Match directory | `skill-name/SKILL.md` |
| Agent name | Describe role | `plugin-validator` |
| Version | Semver | `1.0.0` |

## Structure Patterns

### Minimal (LSP only)

```
typescript-lsp/
└── .claude-plugin/
    └── plugin.json    # Can define lspServers inline
```

### Single Skill

```
code-reviewer/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

### Multi-Skill

```
api-dev/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── api-dev/           # Main overview skill
│   │   ├── SKILL.md
│   │   └── references/
│   ├── api-testing/       # Focused skill
│   │   └── SKILL.md
│   └── api-docs/          # Focused skill
│       └── SKILL.md
└── agents/
    └── api-reviewer/
        └── AGENT.md
```

## Testing

```bash
claude --plugin-dir ./my-plugin
```

## Checklist

- [ ] `.claude-plugin/plugin.json` exists with name, version, description
- [ ] Version follows semver (MAJOR.MINOR.PATCH)
- [ ] Skills in `skills/skill-name/SKILL.md` format
- [ ] Agents in `agents/agent-name/AGENT.md` format
- [ ] Hooks in `hooks/hooks.json`
- [ ] Components NOT inside `.claude-plugin/`
