---
name: plugin-settings
description: This skill should be used when the user asks about ".local.md",
  "plugin settings", "configuration file", "temporarily active hooks",
  "user configuration", or needs guidance on plugin configuration patterns.
version: 0.3.3
---

# Plugin Settings

Guide for implementing user-configurable plugin settings using .local.md files.

## Overview

Plugins can be configured by users through `.local.md` files that combine YAML frontmatter with markdown documentation.

## File Location

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .local.md              # User's local config (gitignored)
├── .local.example.md      # Template for users to copy
└── skills/
```

## .local.md Format

```yaml
---
# Configuration values
api_key: ${MY_API_KEY}
theme: dark
auto_format: true
excluded_paths:
  - node_modules
  - dist
---

# My Plugin Settings

Custom notes or documentation about this configuration.
These markdown sections are for human reference only.
```

## Reading Configuration

### In Hook Scripts

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Find .local.md relative to plugin
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace('/hooks', '');
const configPath = path.join(pluginRoot, '.local.md');

function parseLocalMd(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) return {};

  // Simple YAML parsing for common cases
  const yaml = match[1];
  const config = {};

  yaml.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim();
      // Handle environment variable substitution
      value = value.replace(/\${(\w+)}/g, (_, name) => process.env[name] || '');
      // Handle booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      config[key.trim()] = value;
    }
  });

  return config;
}

const config = parseLocalMd(configPath);
```

### In Skills

Skills can reference the config file and instruct Claude to read it:

```markdown
Read the user's configuration from `.local.md` in the plugin root
to determine their preferences before proceeding.
```

## Configuration Patterns

### Environment Variables

```yaml
---
api_key: ${OPENAI_API_KEY}
database_url: ${DATABASE_URL}
---
```

### Feature Flags

```yaml
---
features:
  auto_format: true
  auto_commit: false
  verbose_logging: true
---
```

### Path Configuration

```yaml
---
paths:
  output: ./dist
  templates: ./templates
excluded:
  - node_modules
  - .git
  - "*.log"
---
```

### Per-Project Overrides

```yaml
---
defaults:
  indent: 2
  semicolons: true
overrides:
  "*.md":
    prose_wrap: always
---
```

## Temporarily Active Hooks

Configuration can enable/disable hooks dynamically:

### In .local.md

```yaml
---
hooks:
  format_on_save: true
  lint_on_commit: false
---
```

### In Hook Script

```javascript
#!/usr/bin/env node
const config = parseLocalMd(configPath);

// Check if this hook is enabled
if (!config.hooks?.format_on_save) {
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
}

// Hook is enabled, proceed with logic
// ...
```

## Template Pattern

### .local.example.md

```yaml
---
# Copy this file to .local.md and customize

# API Configuration
api_key: ${MY_API_KEY}      # Set MY_API_KEY environment variable

# Behavior Settings
auto_format: true           # Format files on save
verbose: false              # Enable debug output

# Paths
output_dir: ./dist
---

# Configuration Guide

## Setup

1. Copy this file to `.local.md`
2. Set required environment variables
3. Customize settings as needed

## Available Options

- **api_key**: Your API key (use env var for security)
- **auto_format**: Auto-format files when saving
- **verbose**: Enable detailed logging
```

### README Instructions

```markdown
## Configuration

Copy the example configuration:

```bash
cp .local.example.md .local.md
```

Edit `.local.md` with your preferences. This file is gitignored.
```

## Gitignore

Always gitignore user config files:

```gitignore
# User configuration (may contain secrets)
.local.md
```

## Validation Pattern

Validate configuration in SessionStart hook:

```javascript
#!/usr/bin/env node
const config = parseLocalMd(configPath);

// Check required fields
const required = ['api_key'];
const missing = required.filter(key => !config[key]);

if (missing.length > 0) {
  console.error(`Missing required config: ${missing.join(', ')}`);
  console.error('Copy .local.example.md to .local.md and configure.');
  process.exit(0); // Don't block, just warn
}

console.log(JSON.stringify({ ok: true }));
```

## Best Practices

1. **Provide .local.example.md** - Users need a template
2. **Use environment variables for secrets** - Never hardcode keys
3. **Document all options** - In the example file's markdown section
4. **Validate on SessionStart** - Catch config issues early
5. **Gitignore .local.md** - Protect user secrets
6. **Use sensible defaults** - Work without config when possible

## Checklist

- [ ] .local.example.md template provided
- [ ] .local.md in .gitignore
- [ ] Environment variable substitution for secrets
- [ ] Validation in SessionStart hook
- [ ] All options documented in example
- [ ] Sensible defaults for optional settings
