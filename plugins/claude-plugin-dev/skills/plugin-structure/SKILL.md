---
name: plugin-structure
description: This skill should be used when the user asks to "create plugin structure",
  "set up plugin directories", "plugin layout", "plugin manifest", "plugin.json",
  or needs guidance on organizing plugin files and folders.
version: 0.3.2
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

## Guided Creation

Use `/create-plugin` for an interactive 8-phase workflow that guides you through:
1. Discovery - Understanding purpose
2. Component planning - What you need
3. Detailed design - Component specifics
4. Structure creation - Files and directories
5. Implementation - Building components
6. Validation - Checking correctness
7. Testing - Verifying functionality
8. Documentation - Finalizing README

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
  "description": "Brief description",
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

## Component Patterns

### Single Skill (Simple)

```
code-reviewer/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

### Multi-Skill (Full)

```
api-dev/
├── .claude-plugin/plugin.json
├── skills/
│   ├── api-dev/           # Main overview
│   │   ├── SKILL.md
│   │   └── references/
│   ├── api-testing/       # Focused skill
│   └── api-docs/          # Focused skill
├── agents/
│   └── api-reviewer.md
├── commands/
│   └── api-check.md
├── hooks/hooks.json
├── .cache/.gitignore
└── README.md
```

### Cache Directory Pattern

Always include for runtime data:

```
.cache/
└── .gitignore          # Contains: *
```

## Testing

```bash
claude --plugin-dir ./my-plugin
```

## Validation

Use the plugin-validator agent to check structure:

```
Validate my plugin at ./my-plugin
```

## Checklist

- [ ] `.claude-plugin/plugin.json` exists
- [ ] Has name, version, description
- [ ] Version follows semver
- [ ] Skills in `skills/name/SKILL.md`
- [ ] Agents in `agents/name.md`
- [ ] Hooks in `hooks/hooks.json`
- [ ] Components NOT in `.claude-plugin/`
- [ ] .cache/ directory with .gitignore
