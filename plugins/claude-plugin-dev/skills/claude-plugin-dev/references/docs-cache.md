# Claude Code Plugin Documentation Cache

Last updated: 2026-01-29
Sources: code.claude.com/docs/en/{plugins,hooks,skills,sub-agents,mcp,plugin-marketplaces}

## Plugins Overview

### When to Use Plugins vs Standalone

| Approach | Skill Names | Best For |
|----------|-------------|----------|
| Standalone (`.claude/`) | `/hello` | Personal workflows, project-specific, experiments |
| Plugins (`.claude-plugin/`) | `/plugin-name:hello` | Sharing, versioned releases, reusable across projects |

### Plugin Directory Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Manifest (required)
├── skills/                # SKILL.md in subdirectories
├── commands/              # Markdown command files
├── agents/                # AGENT.md files
├── hooks/
│   └── hooks.json         # Event handlers
├── .mcp.json              # MCP server configs
└── .lsp.json              # LSP server configs
```

**Important:** Don't put skills/, agents/, hooks/ inside .claude-plugin/. Only plugin.json goes there.

### Plugin Manifest Schema (plugin.json)

```json
{
  "name": "my-plugin",           // Required: kebab-case identifier
  "description": "Brief desc",   // Required
  "version": "1.0.0",            // Semantic versioning
  "author": {
    "name": "Your Name",
    "email": "email@example.com"
  },
  "homepage": "https://...",
  "repository": "https://...",
  "license": "MIT"
}
```

### Testing Plugins Locally

```bash
claude --plugin-dir ./my-plugin
```

---

## Skills

### Skill Structure

```
skill-name/
├── SKILL.md           # Required: main instructions
├── references/        # Detailed docs (loaded as needed)
├── examples/          # Working code samples
└── scripts/           # Utility scripts
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name                    # Display name
description: Trigger phrases...     # When to use (third person)
disable-model-invocation: true      # Only manual invocation
user-invocable: false               # Only Claude can invoke
allowed-tools: Read, Grep, Glob     # Restricted tool access
context: fork                       # Run in subagent
agent: Explore                      # Which subagent type
model: sonnet                       # Model override
---
```

### Key Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `name` | Display name (defaults to directory name) |
| `description` | Trigger phrases - Claude uses this to decide when to load |
| `disable-model-invocation` | Prevents Claude from auto-loading (manual only) |
| `allowed-tools` | Tools Claude can use without permission when skill active |
| `context: fork` | Run in isolated subagent context |

### String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed to skill |
| `$ARGUMENTS[N]` or `$N` | Specific argument by index |
| `${CLAUDE_SESSION_ID}` | Current session ID |

### Progressive Disclosure

1. **Metadata** (~100 words) - Always in context
2. **SKILL.md body** (<5k words) - When skill triggers
3. **references/** - As needed by Claude

**Best practice:** Keep SKILL.md under 2000 words. Move details to references/.

---

## Hooks

### Hook Events

| Event | When It Fires |
|-------|---------------|
| `SessionStart` | Session begins or resumes |
| `UserPromptSubmit` | User submits a prompt |
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool succeeds |
| `Stop` | Claude finishes responding |
| `SubagentStart` | When spawning a subagent |
| `SubagentStop` | When subagent finishes |
| `PreCompact` | Before context compaction |
| `SessionEnd` | Session terminates |
| `Notification` | Claude sends notifications |
| `Setup` | With --init or --maintenance flags |

### Plugin hooks.json Format

```json
{
  "description": "What these hooks do",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/script.js",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Absolute path to plugin directory |
| `$CLAUDE_PROJECT_DIR` | Project hooks | Project root (use quoted) |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - allow action |
| 2 | Block - deny action, show stderr to Claude |
| Other | Non-blocking error |

### JSON Output (PreToolUse)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Explanation"
  }
}
```

---

## Agents (Subagents)

### AGENT.md Structure

```yaml
---
name: my-agent
description: When Claude should delegate to this agent
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: sonnet|opus|haiku|inherit
permissionMode: default|plan|dontAsk|bypassPermissions
skills:
  - skill-to-preload
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
---

System prompt for the agent goes here in markdown.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (kebab-case) |
| `description` | Yes | When Claude should delegate |
| `tools` | No | Tools agent can use (inherits if omitted) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | Model: sonnet, opus, haiku, inherit |
| `permissionMode` | No | Permission handling |
| `skills` | No | Skills to preload into context |

### Built-in Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| Explore | Haiku | Fast, read-only codebase exploration |
| Plan | Inherit | Research for planning mode |
| general-purpose | Inherit | Complex multi-step tasks |

---

## MCP Servers

### .mcp.json Format

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

### Or Inline in plugin.json (marketplace)

```json
{
  "name": "my-plugin",
  "strict": false,
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@some/mcp-server"]
    }
  }
}
```

### Server Types

- **stdio**: Local process (`command` + `args`)
- **http**: Remote HTTP server (`url`)
- **sse**: Server-sent events (`url`)

---

## Plugin Marketplaces

### marketplace.json Schema

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "my-marketplace",
  "owner": {
    "name": "Your Name",
    "email": "email@example.com"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "Brief description",
      "version": "1.0.0",
      "category": "development"
    }
  ]
}
```

### Plugin Sources

**Relative path (same repo):**
```json
{"source": "./plugins/my-plugin"}
```

**GitHub:**
```json
{
  "source": {
    "source": "github",
    "repo": "owner/repo",
    "ref": "v1.0.0"
  }
}
```

**Git URL:**
```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/org/repo.git"
  }
}
```

### Categories

development, productivity, security, testing, database, monitoring, deployment, design, learning
