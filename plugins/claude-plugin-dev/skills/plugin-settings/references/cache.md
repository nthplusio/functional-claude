# Plugin Settings Reference

Last updated: 2026-01-30
Source: Claude Code plugin patterns

## Complete YAML Frontmatter Examples

### Full Configuration Schema

```yaml
---
# Core Settings
name: my-project-config
version: 1.0.0

# Authentication (use env vars)
credentials:
  api_key: ${API_KEY}
  secret: ${API_SECRET}
  token: ${AUTH_TOKEN}

# Feature Toggles
features:
  auto_format: true
  auto_commit: false
  lint_on_save: true
  type_check: true
  verbose_logging: false

# Paths
paths:
  source: ./src
  output: ./dist
  templates: ./templates
  cache: ./.cache

# Exclusions
excluded:
  - node_modules
  - dist
  - "*.log"
  - ".git"

# Hook Configuration
hooks:
  pre_commit:
    enabled: true
    timeout: 30
  post_save:
    enabled: false

# Environment-specific
environments:
  development:
    debug: true
    mock_api: true
  production:
    debug: false
    mock_api: false

# Custom plugin options
custom:
  max_file_size: 1048576
  allowed_extensions:
    - .js
    - .ts
    - .tsx
---

# Project Configuration

Notes about this configuration go here.
```

## Parsing Utilities

### Full YAML Parser (Node.js)

```javascript
#!/usr/bin/env node
// parse-local-md.js - Reusable config parser

const fs = require('fs');
const path = require('path');

/**
 * Parse .local.md configuration file
 * @param {string} pluginRoot - Plugin root directory
 * @returns {object} Parsed configuration
 */
function parseLocalMd(pluginRoot) {
  const configPath = path.join(pluginRoot, '.local.md');

  if (!fs.existsSync(configPath)) {
    return { _exists: false };
  }

  const content = fs.readFileSync(configPath, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    return { _exists: true, _valid: false };
  }

  try {
    const config = parseYaml(frontmatterMatch[1]);
    config._exists = true;
    config._valid = true;
    return substituteEnvVars(config);
  } catch (err) {
    return { _exists: true, _valid: false, _error: err.message };
  }
}

/**
 * Simple YAML parser for common structures
 */
function parseYaml(yaml) {
  const result = {};
  const lines = yaml.split('\n');
  const stack = [{ obj: result, indent: -1 }];

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    // Handle list items
    if (content.startsWith('- ')) {
      const value = content.slice(2).trim();
      const parent = findParent(stack, indent);
      const lastKey = Object.keys(parent.obj).pop();
      if (!Array.isArray(parent.obj[lastKey])) {
        parent.obj[lastKey] = [];
      }
      parent.obj[lastKey].push(parseValue(value));
      continue;
    }

    // Handle key: value pairs
    const colonIndex = content.indexOf(':');
    if (colonIndex === -1) continue;

    const key = content.slice(0, colonIndex).trim();
    const rawValue = content.slice(colonIndex + 1).trim();

    // Find parent object based on indentation
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];

    if (rawValue === '' || rawValue === '|' || rawValue === '>') {
      // Nested object or multiline
      parent.obj[key] = {};
      stack.push({ obj: parent.obj[key], indent });
    } else {
      parent.obj[key] = parseValue(rawValue);
    }
  }

  return result;
}

function findParent(stack, indent) {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].indent < indent) return stack[i];
  }
  return stack[0];
}

function parseValue(value) {
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  // Booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  // Null
  if (value === 'null' || value === '~') return null;
  // Numbers
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

/**
 * Recursively substitute environment variables
 */
function substituteEnvVars(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/\${(\w+)}/g, (_, name) => process.env[name] || '');
  }
  if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteEnvVars(value);
    }
    return result;
  }
  return obj;
}

module.exports = { parseLocalMd, parseYaml, parseValue };
```

### Using in Hooks

```javascript
#!/usr/bin/env node
const { parseLocalMd } = require('./parse-local-md');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace('/hooks', '');
const config = parseLocalMd(pluginRoot);

// Check if config exists and is valid
if (!config._exists) {
  console.error('No .local.md found. Copy .local.example.md to get started.');
  process.exit(0);
}

if (!config._valid) {
  console.error('Invalid .local.md: ' + config._error);
  process.exit(0);
}

// Use configuration
if (config.features?.verbose_logging) {
  console.error('Debug: Config loaded successfully');
}
```

## Real-World Patterns

### multi-agent-swarm Pattern

```yaml
---
# Agent configuration
agents:
  max_concurrent: 5
  default_model: sonnet
  timeout: 300

# Task distribution
tasks:
  retry_count: 3
  batch_size: 10
---
```

### ralph-loop Pattern

```yaml
---
# Loop configuration
max_iterations: 100
break_on_error: false
checkpoint_interval: 10

# Output
output_format: json
verbose: true
---
```

### frontend-design Pattern

```yaml
---
# Design system
colors:
  primary: "#3B82F6"
  secondary: "#10B981"

# Component defaults
components:
  border_radius: 8
  spacing_unit: 4
---
```

## Hook Integration Patterns

### Conditional Hook Execution

```javascript
#!/usr/bin/env node
// Hook that only runs if enabled in config

const config = parseLocalMd(pluginRoot);

// Early exit if hook is disabled
if (config.hooks?.pre_commit?.enabled === false) {
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
}

// Proceed with hook logic...
```

### Config-Driven Validation

```javascript
#!/usr/bin/env node
// Validation hook using config settings

const config = parseLocalMd(pluginRoot);
const data = JSON.parse(input);

// Use configured exclusions
const excludedPaths = config.excluded || ['node_modules'];
const filePath = data.tool_input?.file_path || '';

for (const pattern of excludedPaths) {
  if (filePath.includes(pattern)) {
    console.log(JSON.stringify({ ok: true })); // Skip excluded paths
    process.exit(0);
  }
}

// Continue with validation...
```

### Environment-Aware Settings

```javascript
#!/usr/bin/env node
const config = parseLocalMd(pluginRoot);

// Determine environment
const env = process.env.NODE_ENV || 'development';
const envConfig = config.environments?.[env] || {};

// Merge with defaults
const settings = {
  ...config,
  ...envConfig
};

// Use merged settings
if (settings.debug) {
  console.error('Debug mode enabled');
}
```

## Validation Schema

### Required Fields Check

```javascript
function validateConfig(config, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = getNestedValue(config, field);

    if (rules.required && value === undefined) {
      errors.push(`Missing required field: ${field}`);
    }

    if (rules.type && value !== undefined && typeof value !== rules.type) {
      errors.push(`Invalid type for ${field}: expected ${rules.type}`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`Invalid format for ${field}`);
    }
  }

  return errors;
}

// Usage
const schema = {
  'api_key': { required: true, type: 'string' },
  'features.auto_format': { type: 'boolean' },
  'paths.output': { type: 'string' }
};

const errors = validateConfig(config, schema);
if (errors.length) {
  console.error('Config validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
}
```

## Migration Pattern

When config schema changes, help users migrate:

```javascript
function migrateConfig(config) {
  // v1 -> v2: renamed 'autoFormat' to 'auto_format'
  if (config.autoFormat !== undefined && config.auto_format === undefined) {
    config.auto_format = config.autoFormat;
    delete config.autoFormat;
    console.error('Migrated: autoFormat -> auto_format');
  }

  // v2 -> v3: moved paths to nested object
  if (config.outputDir && !config.paths) {
    config.paths = { output: config.outputDir };
    delete config.outputDir;
    console.error('Migrated: outputDir -> paths.output');
  }

  return config;
}
```

## Security Best Practices

1. **Never log secrets**: Filter out sensitive keys before logging
2. **Environment variables for secrets**: Use `${VAR}` syntax
3. **Gitignore .local.md**: Always exclude from version control
4. **Validate before use**: Check types and required fields
5. **Sanitize paths**: Prevent directory traversal attacks

```javascript
// Filter secrets from logs
function safeLog(config) {
  const sanitized = { ...config };
  const secretKeys = ['api_key', 'secret', 'token', 'password'];

  for (const key of secretKeys) {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}
```
