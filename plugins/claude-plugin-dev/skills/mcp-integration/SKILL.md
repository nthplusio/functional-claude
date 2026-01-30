---
name: mcp-integration
description: This skill should be used when the user asks to "add MCP server",
  "integrate MCP", "external tools", ".mcp.json", "Model Context Protocol",
  or needs guidance on bundling MCP servers with plugins.
version: 0.2.0
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

## Server Types Comparison

| Type | Transport | Use Case |
|------|-----------|----------|
| stdio | Local process | Bundled servers, local tools |
| http | Remote HTTP | Cloud services, APIs |
| sse | Server-sent events | Real-time updates |

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

## Authentication Patterns

### API Keys via Environment

```json
{
  "api-server": {
    "command": "npx",
    "args": ["-y", "@some/mcp-server"],
    "env": {
      "API_KEY": "${MY_API_KEY}",
      "API_SECRET": "${MY_API_SECRET}"
    }
  }
}
```

### Token-Based

```json
{
  "oauth-server": {
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer ${ACCESS_TOKEN}"
    }
  }
}
```

Document required environment variables in README.

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
    "args": ["${CLAUDE_PLUGIN_ROOT}/servers/server.js"]
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

MCP tools are namespaced: `mcp__<server>__<tool>`

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

## Checklist

- [ ] Server command is valid
- [ ] Environment variables use `${VAR}` syntax
- [ ] Plugin paths use `${CLAUDE_PLUGIN_ROOT}`
- [ ] Required env vars documented
- [ ] Server tested locally
