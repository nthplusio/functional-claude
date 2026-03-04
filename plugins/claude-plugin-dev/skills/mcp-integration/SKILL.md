---
name: mcp-integration
description: Guide for bundling MCP servers with plugins. Use when the user asks
  to "add MCP server", "integrate MCP", "external tools", ".mcp.json", or
  "Model Context Protocol".
version: 0.5.0
---

# MCP Integration

Guide for bundling MCP (Model Context Protocol) servers with plugins.

## MCP Location

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── .mcp.json          # MCP server configs
```

## .mcp.json Format

```json
{
  "server-name": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": {
      "API_KEY": "${API_KEY}"
    }
  }
}
```

**Key conventions:**
- Use `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths in `command` and `args`
- Use `${ENV_VAR}` syntax for secrets in `env`
- stdio servers use `command` + `args`; remote servers use `url`

## Inline Marketplace Pattern

For simple MCP servers, define directly in marketplace.json:

```json
{
  "name": "github",
  "source": "./external_plugins/github",
  "strict": false,
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/github-mcp"]
    }
  }
}
```

**Note:** `strict: false` is required when defining mcpServers inline.

## Tool Naming Convention

MCP tools are namespaced: `mcp__<server>__<tool>`

Examples:
- `mcp__postgres__query`
- `mcp__github__create_issue`

Use in hook matchers:

```json
{
  "matcher": "mcp__postgres__.*"
}
```

## External Plugin Pattern

For wrapping third-party MCP servers as standalone plugins:

```
external_plugins/
└── service-name/
    ├── .claude-plugin/
    │   └── plugin.json
    └── .mcp.json
```

Document required environment variables in README.
