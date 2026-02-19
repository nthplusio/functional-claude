---
name: claude-plugin-dev
description: This skill should be used when the user asks to "create a plugin",
  "build a plugin", "plugin structure", "how do plugins work", "plugin documentation",
  or needs general guidance on Claude Code plugin development.
version: 0.3.5
---

# Claude Code Plugin Development

Guide for building Claude Code plugins with proper structure, conventions, and best practices.

## Quick Start

Use the `/create-plugin` command for a guided 8-phase workflow:

```
/create-plugin my-plugin
```

This interactive workflow guides you through discovery, planning, implementation, validation, and documentation.

## Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Required: name, version, description
├── skills/                # SKILL.md in subdirectories
├── agents/                # AGENT.md files
├── commands/              # Slash command files
├── hooks/hooks.json       # Event handlers
├── .mcp.json              # MCP server configs
├── .local.example.md      # Configuration template
└── README.md
```

### Manifest (plugin.json)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does"
}
```

### Testing

```bash
claude --plugin-dir ./my-plugin
```

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Skills | `skills/name/SKILL.md` | Extend Claude's knowledge |
| Agents | `agents/name/AGENT.md` | Specialized subagents |
| Commands | `commands/name.md` | User-triggered actions |
| Hooks | `hooks/hooks.json` | Event automation |
| MCP | `.mcp.json` | External tool integration |
| Settings | `.local.md` | User configuration |

## Focused Skills

| Topic | Skill | Purpose |
|-------|-------|---------|
| Directory layout | `/claude-plugin-dev:plugin-structure` | Plugin directories |
| Creating skills | `/claude-plugin-dev:skill-development` | SKILL.md files |
| Creating agents | `/claude-plugin-dev:agent-development` | AGENT.md files |
| Creating commands | `/claude-plugin-dev:command-development` | Slash commands |
| Event hooks | `/claude-plugin-dev:hook-development` | Automation |
| MCP servers | `/claude-plugin-dev:mcp-integration` | External tools |
| User config | `/claude-plugin-dev:plugin-settings` | .local.md patterns |

## Agents

| Agent | Purpose |
|-------|---------|
| `plugin-validator` | Validate plugin structure and conventions |
| `agent-creator` | Interactive agent generation |
| `skill-reviewer` | Skill quality review |

## Key Conventions

### Naming
- Plugin names: kebab-case (`my-plugin`)
- Skill names: match directory name
- Use descriptive names

### Skill Descriptions (Critical)

Always use third-person with trigger phrases:

```yaml
description: This skill should be used when the user asks to "create X",
  "configure Y", "add Z", or needs guidance on [topic].
```

### Progressive Disclosure
- SKILL.md: Core concepts (~1,000-1,500 words)
- references/: Detailed documentation
- examples/: Working code samples

## Development Workflow

1. **Plan**: Use `/create-plugin` for guided setup
2. **Implement**: Use focused skills for each component
3. **Validate**: Run `plugin-validator` agent
4. **Test**: Use `claude --plugin-dir ./my-plugin`
5. **Review**: Use `skill-reviewer` for quality check

## Reference Files

- **`references/docs-cache.md`** - Official documentation
- **`references/conventions.md`** - Patterns from official plugins
- **`references/examples.md`** - Complete plugin examples

## Common Mistakes

1. **Components in .claude-plugin/**: Only plugin.json goes there
2. **Vague descriptions**: Include specific trigger phrases
3. **Too much in SKILL.md**: Move details to references/
4. **Missing example blocks**: Agents need `<example>` for triggers
5. **Wrong hook paths**: Use `${CLAUDE_PLUGIN_ROOT}`
