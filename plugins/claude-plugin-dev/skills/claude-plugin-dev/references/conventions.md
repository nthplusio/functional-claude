# Claude Plugin Conventions

Patterns extracted from anthropics/claude-plugins-official repository (2026-01-29).

## Naming Conventions

### Plugin Names
- Use kebab-case: `plugin-dev`, `code-review`, `commit-commands`
- Descriptive but concise: `pr-review-toolkit`, `frontend-design`
- Suffix with `-lsp` for language servers: `typescript-lsp`, `rust-analyzer-lsp`

### Skill Names
- Match directory name: `hook-development/SKILL.md` → name: `hook-development`
- Use kebab-case: `skill-development`, `agent-development`

### Agent Names
- Describe the role: `plugin-validator`, `code-reviewer`, `agent-creator`

## Directory Structure Patterns

### Minimal Plugin (LSP only)
```
plugin-name/
└── .claude-plugin/
    └── plugin.json    # Can define lspServers inline
```

### Standard Plugin
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── skill-name/
│       └── SKILL.md
└── README.md
```

### Full Plugin
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── main-skill/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── examples/
│   │   └── scripts/
│   └── focused-skill/
│       └── SKILL.md
├── agents/
│   └── agent-name/
│       └── AGENT.md
├── commands/
│   └── command-name.md
├── hooks/
│   └── hooks.json
├── .mcp.json
└── README.md
```

## Manifest Patterns

### Minimal (LSP plugins)
```json
{
  "name": "typescript-lsp",
  "version": "1.0.0",
  "description": "TypeScript language server for code intelligence"
}
```

### Standard
```json
{
  "name": "plugin-name",
  "description": "Brief description of what it does",
  "author": {
    "name": "Author Name",
    "email": "email@example.com"
  },
  "homepage": "https://github.com/org/repo"
}
```

### Marketplace Entry (strict: false)
When defining plugin entirely in marketplace.json:
```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin",
  "description": "...",
  "version": "1.0.0",
  "strict": false,
  "lspServers": { ... }
}
```

## Skill Patterns

### Description Format (Critical)
Always use third-person with specific trigger phrases:

**Good:**
```yaml
description: This skill should be used when the user asks to "create a hook",
  "add a PreToolUse hook", "validate tool use", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
```

**Bad:**
```yaml
description: Use this skill for hooks.  # Not third person, vague
description: Helps with hook development.  # No trigger phrases
```

### Progressive Disclosure
From official plugin-dev skills:

| Location | Content | Size |
|----------|---------|------|
| SKILL.md | Core concepts, workflow | 1,500-2,000 words |
| references/ | Detailed patterns, API docs | 2,000-5,000+ words each |
| examples/ | Complete working code | As needed |
| scripts/ | Validation utilities | As needed |

### Reference File Patterns
```
skill-name/
├── SKILL.md
└── references/
    ├── patterns.md           # Common patterns
    ├── advanced.md           # Advanced techniques
    ├── api-reference.md      # API documentation
    └── migration.md          # Migration guides
```

### Writing Style
- Use imperative form: "Create the hook" not "You should create"
- Third-person in description: "This skill should be used when..."
- Be specific about triggers
- Include concrete examples

## Agent Patterns

### Read-Only Agent
```yaml
---
name: code-explorer
description: Explore codebase without modifications
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit, NotebookEdit
model: haiku
---
```

### Full-Access Agent
```yaml
---
name: code-reviewer
description: Review and fix code issues. Use proactively after code changes.
tools: Read, Grep, Glob, Bash, Edit, Write
model: inherit
---
```

### Proactive Triggering
Include "use proactively" in description for automatic delegation:
```yaml
description: Expert code reviewer. Use proactively after code changes.
```

## Hook Patterns

### Validation Hook (PreToolUse)
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.js",
        "timeout": 30
      }]
    }]
  }
}
```

### Session Start Hook
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
        "timeout": 30
      }]
    }]
  }
}
```

### Stop Hook (Learnings Capture)
```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/check-learnings.js",
        "timeout": 10
      }]
    }]
  }
}
```

### Common Matchers
- `Write|Edit` - File modifications
- `Bash` - Shell commands
- `*` or `""` - All tools
- `mcp__.*` - All MCP tools
- `mcp__server__.*` - Specific MCP server

## MCP Patterns

### Simple MCP (in marketplace.json)
```json
{
  "name": "github",
  "source": "./external_plugins/github",
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/github-mcp"]
    }
  }
}
```

### Complex MCP (separate .mcp.json)
```json
{
  "database": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": {
      "DB_URL": "${DB_URL}"
    }
  }
}
```

## Marketplace Patterns

### Plugin Categories (from official)
- `development` - Dev tools, LSP, SDKs
- `productivity` - Workflow automation, reviews
- `security` - Security scanning, guidance
- `testing` - Test frameworks, Playwright
- `database` - Supabase, Firebase, Pinecone
- `monitoring` - Sentry, PostHog
- `deployment` - Vercel
- `design` - Figma
- `learning` - Educational tools

### External Plugin Pattern
For wrapping third-party MCP servers:
```json
{
  "name": "service-name",
  "description": "Integration description",
  "category": "productivity",
  "source": "./external_plugins/service-name",
  "homepage": "https://github.com/..."
}
```

## Quality Checklist

### Plugin Structure
- [ ] `.claude-plugin/plugin.json` exists with name, description
- [ ] Version follows semver (MAJOR.MINOR.PATCH)
- [ ] Skills in `skills/skill-name/SKILL.md` format
- [ ] Agents in `agents/agent-name/AGENT.md` format
- [ ] Hooks in `hooks/hooks.json`
- [ ] README.md with usage instructions

### Skills
- [ ] Description is third-person with trigger phrases
- [ ] SKILL.md body < 2000 words
- [ ] Details in references/ not SKILL.md
- [ ] Uses imperative writing style
- [ ] All referenced files exist

### Agents
- [ ] Description explains when to use
- [ ] Tools list is appropriate for task
- [ ] Model choice makes sense (haiku for fast, sonnet for complex)

### Hooks
- [ ] Uses `${CLAUDE_PLUGIN_ROOT}` for paths
- [ ] Appropriate timeout values
- [ ] Exit codes documented in scripts
