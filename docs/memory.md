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
| wezterm-dev | 0.6.4 | WezTerm terminal configuration and customization |
| hyper-dev | 0.1.4 | Hyper terminal configuration and plugin development |

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
├── skills/                   # Root-level skills (repo development)
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json   # Plugin manifest (name, version, description)
        ├── hooks/
        │   └── hooks.json    # Plugin-specific hooks
        ├── skills/
        │   └── <skill-name>/
        │       ├── SKILL.md  # Skill definition with YAML frontmatter
        │       ├── examples/ # Example code
        │       └── references/ # Reference docs
        └── .cache/           # Gitignored - runtime cache for learnings
```

## Version Synchronization

**Critical:** Plugin versions must be synchronized across three locations:

1. `plugins/<name>/.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
2. `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"` in plugins array
3. `plugins/<name>/skills/<skill>/SKILL.md` - frontmatter `version:` (optional)

When bumping versions:
- Update all three locations simultaneously
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

### Security Hook (Root Level)

Located at `hooks/hooks.json` - validates all Write/Edit operations for sensitive data:
- API keys, tokens, secrets
- .env files with real values
- Private URLs, credentials
- Personal information

Uses prompt-based PreToolUse hook with proper JSON response format:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny",
    "permissionDecisionReason": "explanation"
  }
}
```

### Plugin Hooks

Each plugin can define hooks in `plugins/<name>/hooks/hooks.json`:

**PreToolUse hooks** - Run before tool execution:
- Backup verification before config edits
- Permission checks
- Exit code 0 = allow, exit code 2 = block (with stderr message)

**Stop hooks** - Run when Claude finishes:
- Prompt for learnings capture
- Must check `stop_hook_active` to prevent infinite loops
- Response format: `{"ok": true}` or `{"ok": false, "reason": "..."}`

### Hook Types

1. **Command hooks** (`"type": "command"`):
   ```json
   {
     "type": "command",
     "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/script.sh\"",
     "timeout": 10
   }
   ```
   - Exit code 0: Allow (stdout shown in verbose mode)
   - Exit code 2: Block (stderr shown to Claude)
   - Other codes: Non-blocking error

2. **Prompt hooks** (`"type": "prompt"`):
   ```json
   {
     "type": "prompt",
     "prompt": "Evaluate $ARGUMENTS and respond with JSON only",
     "timeout": 30
   }
   ```

   **For PreToolUse** - use `hookSpecificOutput`:
   ```json
   {
     "hookSpecificOutput": {
       "hookEventName": "PreToolUse",
       "permissionDecision": "allow|deny|ask",
       "permissionDecisionReason": "explanation"
     }
   }
   ```

   **For Stop/SubagentStop** - use `ok`/`reason`:
   ```json
   {"ok": true}
   {"ok": false, "reason": "why Claude should continue"}
   ```

### Hook Configuration Best Practices

- Always add `"description"` field at root level for documentation
- Set explicit `"timeout"` values (default is 60 seconds)
- For Stop hooks, always check `stop_hook_active` to prevent loops
- Use `$ARGUMENTS` placeholder in prompts to receive hook input
- Command hooks: use stderr (exit 2) to block, stdout for info

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

### Skill Content Patterns

1. **Cache refresh check** - Check `.cache/learnings.md` for stale data
2. **Backup requirement** - Require backups before modifying user configs
3. **Reference documentation** - Link to official docs
4. **Examples** - Provide code samples

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

### Creating a New Plugin

1. Create directory: `plugins/<name>/`
2. Create manifest: `plugins/<name>/.claude-plugin/plugin.json`
3. Add to marketplace: Update `.claude-plugin/marketplace.json`
4. Create skill: `plugins/<name>/skills/<name>/SKILL.md`
5. Add hooks (optional): `plugins/<name>/hooks/hooks.json`
6. Add `.cache/` to `.gitignore`

## Conventions

### Naming

- Plugin names: lowercase with hyphens (`wezterm-dev`, `hyper-dev`)
- Skill names: match plugin name when primary skill
- Hook scripts: descriptive (`verify-wezterm-backup.sh`)

### Versions

- Start at `0.1.0` for new plugins
- Increment PATCH for fixes
- Increment MINOR for new features
- Increment MAJOR for breaking changes

### Cache Files

- Store in `plugins/<name>/.cache/`
- Always gitignore cache directories
- Use `learnings.md` for accumulated knowledge with `last_refresh` date

### Security

- Never commit API keys, tokens, or credentials
- Never commit .env files with real values
- Root security hook blocks sensitive data automatically
- Review all commits for accidental sensitive data exposure

## Learnings

### WezTerm Plugin

- Agent Deck plugin for Claude Code monitoring
- Powerline-style tab bar with process icons
- Git branch caching to avoid frequent spawns
- Catppuccin Mocha color scheme integration

### Hyper Plugin

- Electron-based with React UI
- Plugin system via npm packages
- decorateConfig for configuration overrides
- Redux for state management

---

*Last updated: See git history for this file*
