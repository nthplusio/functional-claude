---
name: claude-plugin-dev
description: This skill should be used when the user asks to "create a plugin", "build a plugin", "plugin structure", "how do plugins work", "plugin documentation", or needs general guidance on Claude Code plugin development.
version: 0.1.0
---

# Claude Code Plugin Development

Guide for building Claude Code plugins with proper structure, conventions, and best practices.

## Quick Reference

### Plugin Structure
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Required: name, version, description
├── skills/                # SKILL.md in subdirectories
├── agents/                # AGENT.md files
├── hooks/hooks.json       # Event handlers
├── .mcp.json              # MCP server configs
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

## Component Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| Skills | `skills/name/SKILL.md` | Extend Claude's knowledge |
| Agents | `agents/name/AGENT.md` | Specialized subagents |
| Hooks | `hooks/hooks.json` | Event automation |
| MCP | `.mcp.json` | External tool integration |
| Commands | `commands/name.md` | Slash commands |

## Focused Skills

For detailed guidance on specific components:

| Topic | Skill | When to Use |
|-------|-------|-------------|
| Directory layout | `/claude-plugin-dev:plugin-structure` | Setting up plugin directories |
| Creating skills | `/claude-plugin-dev:skill-development` | Writing SKILL.md files |
| Creating agents | `/claude-plugin-dev:agent-development` | Writing AGENT.md files |
| Event hooks | `/claude-plugin-dev:hook-development` | Automation with hooks |
| MCP servers | `/claude-plugin-dev:mcp-integration` | External tool integration |

## Key Conventions

### Naming
- Plugin names: kebab-case (`my-plugin`)
- Skill names: kebab-case matching directory
- Use descriptive names

### Skill Descriptions (Critical)
Always use third-person with specific trigger phrases:

```yaml
description: This skill should be used when the user asks to "create X",
  "configure Y", "add Z", or needs guidance on [topic].
```

### Progressive Disclosure
- SKILL.md: Core concepts only (~1500-2000 words)
- references/: Detailed documentation
- examples/: Working code samples
- scripts/: Utility scripts

### Hook Environment Variables
```
${CLAUDE_PLUGIN_ROOT}  # Plugin directory (for plugin hooks)
$CLAUDE_PROJECT_DIR    # Project root (for project hooks, use quoted)
```

## Development Workflow

1. **Plan**: Identify what components you need
2. **Structure**: Create directories following conventions
3. **Implement**: Write skills, agents, hooks as needed
4. **Test**: Use `claude --plugin-dir ./my-plugin`
5. **Validate**: Use plugin-validator agent to check structure
6. **Iterate**: Refine based on usage

## Validation

Use the plugin-validator agent to check your plugin:
```
Review my plugin at ./my-plugin for structure and convention issues
```

## Additional Resources

### Reference Files
- **`references/docs-cache.md`** - Compressed official documentation
- **`references/conventions.md`** - Patterns from official repository
- **`references/examples.md`** - Complete plugin examples

### External Resources
- Official docs: https://code.claude.com/docs/en/plugins
- Official plugins: https://github.com/anthropics/claude-plugins-official

## Common Mistakes

1. **Putting components in .claude-plugin/**: Only plugin.json goes there
2. **Vague skill descriptions**: Include specific trigger phrases
3. **Too much in SKILL.md**: Move details to references/
4. **Wrong hook paths**: Use `${CLAUDE_PLUGIN_ROOT}` for plugins
5. **Missing version**: Always include version in plugin.json
