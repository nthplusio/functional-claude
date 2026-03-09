---
name: plugin-structure
description: Guide for organizing Claude Code plugin directories and creating manifests.
  Use when the user asks to "create plugin structure", "set up plugin directories",
  "plugin layout", "plugin manifest", or "plugin.json".
version: 0.5.2
---

# Plugin Structure

Guide for organizing Claude Code plugin directories and manifests.

## Directory Layout

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Required: manifest file
├── skills/                # SKILL.md in subdirectories
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── agents/                # Agent definition files
│   └── agent-name.md
├── commands/              # Slash command definitions
│   └── command-name.md
├── hooks/
│   └── hooks.json         # Event handlers
├── .mcp.json              # MCP server configs
├── .lsp.json              # LSP server configs
├── .local.example.md      # Configuration template
├── .cache/                # Runtime cache (gitignored)
└── README.md
```

**Critical:** Only `plugin.json` goes inside `.claude-plugin/`. All other components go in the plugin root.

## Plugin Manifest (plugin.json)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does"
}
```

Optional fields: `author` (object with name/email), `homepage`, `repository`, `license`.

## Naming Conventions

| Component | Convention | Example |
|-----------|------------|---------|
| Plugin name | kebab-case | `code-reviewer` |
| Skill name | Match directory | `skill-name/SKILL.md` |
| Agent name | Describe role | `plugin-validator` |
| Version | Semver | `1.0.0` |

## Cache Directory Pattern

Always include for runtime data:

```
.cache/
└── .gitignore          # Contains: *
```

## Guided Creation

Use `/create-plugin` for an interactive workflow that guides through discovery, planning, implementation, validation, and documentation.

## Testing

```bash
claude --plugin-dir ./my-plugin
```

## Validation

Use the `plugin-validator` agent to check structure:

```
Validate my plugin at ./my-plugin
```
