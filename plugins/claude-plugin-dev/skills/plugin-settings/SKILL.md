---
name: plugin-settings
description: Guide for implementing user-configurable plugin settings with .local.md
  files. Use when the user asks about ".local.md", "plugin settings", "configuration
  file", "temporarily active hooks", or "user configuration".
version: 0.5.2
---

# Plugin Settings

User-configurable plugin settings use `.local.md` files that combine YAML frontmatter with markdown documentation.

## File Location

```
my-plugin/
├── .local.md              # User's local config (gitignored)
├── .local.example.md      # Template for users to copy
└── ...
```

## .local.md Format

```yaml
---
api_key: ${MY_API_KEY}
theme: dark
auto_format: true
excluded_paths:
  - node_modules
  - dist
---

# My Plugin Settings

Custom notes or documentation (for human reference only).
```

## Reading Configuration

### In Hook Scripts

Parse the YAML frontmatter from `.local.md`. Locate the file using `CLAUDE_PLUGIN_ROOT`:

```javascript
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace('/hooks', '');
const configPath = path.join(pluginRoot, '.local.md');
```

Environment variable substitution: replace `${VAR}` patterns with `process.env[name]`.

### In Skills

```markdown
Read the user's configuration from `.local.md` in the plugin root
to determine their preferences before proceeding.
```

## Temporarily Active Hooks

Configuration can enable/disable hooks dynamically:

```yaml
---
hooks:
  format_on_save: true
  lint_on_commit: false
---
```

```javascript
// In hook script — check if enabled
const config = parseLocalMd(configPath);
if (!config.hooks?.format_on_save) {
  process.exit(0); // Skip hook
}
```

## Template Pattern (.local.example.md)

Provide a template users copy to `.local.md`:

```yaml
---
# Copy this file to .local.md and customize

# API Configuration
api_key: ${MY_API_KEY}      # Set MY_API_KEY environment variable

# Behavior Settings
auto_format: true           # Format files on save
verbose: false              # Enable debug output
---

# Configuration Guide

1. Copy this file to `.local.md`
2. Set required environment variables
3. Customize settings as needed
```

## Gitignore

Always gitignore user config files:

```gitignore
# User configuration (may contain secrets)
.local.md
```

## Validation

Validate configuration in a SessionStart hook — warn on missing required fields but don't block (`process.exit(0)`).
