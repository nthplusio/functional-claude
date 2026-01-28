---
name: functional-claude
description: This skill should be used when the user asks to "add a plugin", "create a new plugin", "update marketplace", "sync versions", "add to functional-claude", "develop for functional-claude", or mentions working on the functional-claude plugin marketplace repository.
version: 0.1.0
---

# Functional Claude Development

Develop and maintain plugins for the functional-claude Claude Code plugin marketplace.

## Repository Structure

```
functional-claude/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest
├── plugins/
│   └── <plugin-name>/        # Individual plugins
│       ├── .claude-plugin/
│       │   └── plugin.json   # Plugin manifest
│       ├── hooks/
│       │   └── hooks.json    # Plugin hooks
│       └── skills/
│           └── <skill-name>/
│               ├── SKILL.md
│               ├── references/
│               └── examples/
├── skills/                   # Root-level skills (like this one)
└── hooks/
    └── hooks.json            # Root-level hooks
```

## Version Synchronization

**Critical:** Plugin versions must match across all files. When updating a plugin version:

1. `plugins/<name>/.claude-plugin/plugin.json` - Plugin manifest
2. `.claude-plugin/marketplace.json` - Marketplace listing
3. `plugins/<name>/skills/<skill>/SKILL.md` frontmatter - If skill has version

## Adding a New Plugin

1. Create plugin directory structure:
   ```bash
   mkdir -p plugins/<name>/.claude-plugin
   mkdir -p plugins/<name>/skills/<skill-name>/{references,examples}
   mkdir -p plugins/<name>/hooks
   ```

2. Create `plugins/<name>/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "<plugin-name>",
     "version": "0.1.0",
     "description": "Plugin description"
   }
   ```

3. Add to `.claude-plugin/marketplace.json` plugins array:
   ```json
   {
     "name": "<plugin-name>",
     "source": "./plugins/<plugin-name>",
     "description": "Plugin description",
     "version": "0.1.0"
   }
   ```

4. Create skill SKILL.md with frontmatter and content

5. Add hooks in `plugins/<name>/hooks/hooks.json` if needed

## Security: Public Repository

This repository is public. Never commit:
- API keys, tokens, or credentials
- `.env` files or environment configurations
- Personal information or private data
- Internal URLs or private endpoints

A PreToolUse hook validates file writes to prevent accidental commits of sensitive data.

## Testing Plugins Locally

```bash
claude --plugin-dir ./plugins/<plugin-name>
```

## Marketplace Installation (for users)

```
/plugin marketplace add nthplusio/functional-claude
/plugin install <plugin-name>@functional-claude
```

## Additional Resources

### Reference Files

- **`references/plugin-checklist.md`** - Checklist for new plugins
