---
name: mcp-integration
description: This skill should be used when the user asks to "add MCP server",
  "integrate MCP", "external tools", ".mcp.json", or needs guidance on
  bundling Model Context Protocol servers with plugins.
version: 0.1.1
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

## Server Types

### stdio (Local Process)

```json
{
  "my-server": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
    "env": {
      "DEBUG": "true"
    }
  }
}
```

### http (Remote HTTP)

```json
{
  "my-server": {
    "url": "https://api.example.com/mcp"
  }
}
```

### sse (Server-Sent Events)

```json
{
  "my-server": {
    "url": "https://api.example.com/mcp/sse"
  }
}
```

## Inline in Marketplace

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

## Environment Variables

Use `${VAR_NAME}` syntax for environment variable substitution:

```json
{
  "database": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "env": {
      "DB_URL": "${DATABASE_URL}",
      "API_KEY": "${DB_API_KEY}"
    }
  }
}
```

## Common Patterns

### NPX Package

```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
    }
  }
}
```

### Bundled Server

```json
{
  "custom": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/servers/custom-server.js"],
    "env": {
      "CONFIG_PATH": "${CLAUDE_PLUGIN_ROOT}/config.json"
    }
  }
}
```

### Multiple Servers

```json
{
  "db": {
    "command": "npx",
    "args": ["-y", "@mcp/postgres"]
  },
  "search": {
    "command": "npx",
    "args": ["-y", "@mcp/elasticsearch"]
  }
}
```

## Tool Naming

MCP tools are namespaced as `mcp__<server>__<tool>`:

- `mcp__postgres__query`
- `mcp__github__create_issue`

Use in hook matchers:

```json
{
  "matcher": "mcp__postgres__.*"
}
```

## External Plugin Pattern

For wrapping third-party MCP servers:

```
external_plugins/
└── service-name/
    ├── .claude-plugin/
    │   └── plugin.json
    └── .mcp.json
```

In marketplace.json:

```json
{
  "name": "service-name",
  "description": "Integration description",
  "category": "productivity",
  "source": "./external_plugins/service-name",
  "homepage": "https://github.com/..."
}
```

## Checklist

- [ ] Server command is valid
- [ ] Environment variables use `${VAR}` syntax
- [ ] Plugin paths use `${CLAUDE_PLUGIN_ROOT}`
- [ ] Required env vars documented in README
- [ ] Server tested locally
