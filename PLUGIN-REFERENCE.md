# Claude Code Plugin Reference Documentation

**Source:** Extracted from functional-claude repository (nthplusio/functional-claude)
**Last Updated:** 2026-02-04

---

## Table of Contents

1. [Plugin Overview](#plugin-overview)
2. [Plugin Structure](#plugin-structure)
3. [Skills](#skills)
4. [Agents](#agents)
5. [Hooks](#hooks)
6. [Commands](#commands)
7. [MCP Integration](#mcp-integration)
8. [Marketplace Setup](#marketplace-setup)
9. [Version Management](#version-management)
10. [Development Workflow](#development-workflow)
11. [Functional Claude Plugins](#functional-claude-plugins)

---

## Plugin Overview

### When to Use Plugins vs Standalone Skills

| Approach | Invocation | Best For |
|----------|-----------|----------|
| **Standalone** (`.claude/`) | `/skill-name` | Personal workflows, project-specific tasks, experiments |
| **Plugins** (`.claude-plugin/`) | `/plugin-name:skill-name` | Sharing, versioned releases, reusable across projects, marketplace distribution |

### Testing Plugins Locally

```bash
claude --plugin-dir ./plugins/my-plugin
```

---

## Plugin Structure

### Minimal Plugin (LSP-only)

```
plugin-name/
└── .claude-plugin/
    └── plugin.json
```

### Standard Plugin

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json                # Plugin manifest (required)
├── skills/
│   └── skill-name/
│       ├── SKILL.md               # Skill definition with frontmatter
│       ├── references/            # Detailed documentation
│       ├── examples/              # Code examples
│       └── scripts/               # Utility scripts
├── README.md
└── .gitignore
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
│   │   └── examples/
│   └── focused-skill/
│       └── SKILL.md
├── agents/
│   └── agent-name.md              # Autonomous agent definition
├── commands/
│   └── command-name.md            # User-invocable slash commands
├── hooks/
│   └── hooks.json                 # Event-driven automation
├── .mcp.json                      # MCP server configuration
├── .lsp.json                      # LSP server configuration
└── README.md
```

### Plugin Manifest (plugin.json)

```json
{
  "name": "plugin-name",                    // Required: kebab-case identifier
  "description": "Brief description",       // Required
  "version": "1.0.0",                       // Semantic versioning (MAJOR.MINOR.PATCH)
  "author": {
    "name": "Author Name",
    "email": "email@example.com"
  },
  "homepage": "https://github.com/org/repo",
  "repository": "https://github.com/org/repo",
  "license": "MIT"
}
```

---

## Skills

### Skill Directory Structure

```
skill-name/
├── SKILL.md                    # Core skill (required)
├── references/                 # Detailed documentation (auto-loaded when needed)
│   ├── patterns.md
│   ├── advanced.md
│   └── api-reference.md
├── examples/                   # Code samples
└── scripts/                    # Utility scripts
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name                      # Display name
description: Trigger phrases and      # When Claude should use this skill (third person)
  usage guidance...
version: 1.0.0                        # Semantic versioning
disable-model-invocation: false       # Allow Claude to auto-invoke
allowed-tools: Read, Grep, Glob       # Tools Claude can use without asking
model: sonnet                         # Model: sonnet, opus, haiku, inherit
---
```

### Key Frontmatter Fields

| Field | Purpose | Values |
|-------|---------|--------|
| `name` | Display name | String (auto-defaults to directory name) |
| `description` | Trigger phrases (CRITICAL) | Third person with specific triggers |
| `version` | Version number | MAJOR.MINOR.PATCH |
| `disable-model-invocation` | Prevent auto-invocation | boolean |
| `allowed-tools` | Tools without permission prompts | Comma-separated tool names |
| `model` | LLM override | sonnet, opus, haiku, inherit |

### Description Best Practices

**Good (specific trigger phrases, third person):**
```yaml
description: This skill should be used when the user asks to "create a hook",
  "add a PreToolUse hook", "validate tool use", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
```

**Bad (vague, first person):**
```yaml
description: Use this skill for hooks.
description: Helps with hook development.
```

### Progressive Disclosure Pattern

| Location | Content | Size | Loaded |
|----------|---------|------|--------|
| **SKILL.md frontmatter** | Metadata, description | ~100 words | Always |
| **SKILL.md body** | Core concepts, workflows | <2000 words | When skill triggers |
| **references/** | Detailed patterns, APIs, advanced | 2000-5000+ words | As needed by Claude |
| **examples/** | Complete working code | As needed | On demand |

**Rule:** Keep SKILL.md under 2000 words. Move details to references/.

### String Substitutions in Skills

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed to skill |
| `$ARGUMENTS[N]` or `$N` | Specific argument by index (0-based) |
| `${CLAUDE_SESSION_ID}` | Current session ID |

---

## Agents

### Agent (AGENT.md) Structure

```
plugin-name/agents/
└── agent-name.md
```

### AGENT.md Frontmatter

```yaml
---
name: agent-name                      # Unique kebab-case identifier
description: When Claude should       # When to delegate to this agent
  delegate to this agent...
tools: Read, Grep, Glob, Bash         # Tools agent can use (omit to inherit)
disallowedTools: Write, Edit          # Tools to deny
model: sonnet                         # Model: sonnet, opus, haiku, inherit
permissionMode: default               # default, plan, dontAsk, bypassPermissions
skills:                               # Skills to preload
  - skill-to-preload
hooks:                                # Agent-specific hooks
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
---

Agent system prompt and instructions go here in markdown.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Kebab-case identifier |
| `description` | Yes | When Claude should delegate (include examples) |
| `tools` | No | Tools agent can use (inherits if omitted) |
| `disallowedTools` | No | Tools to explicitly deny |
| `model` | No | Model override: sonnet, opus, haiku, inherit |
| `permissionMode` | No | How permissions work (default, plan, dontAsk, bypassPermissions) |
| `skills` | No | Skills to preload into agent context |

### Built-in Agents

| Agent | Model | Purpose | Read-Only |
|-------|-------|---------|-----------|
| **Explore** | Haiku | Fast codebase exploration | Yes |
| **Plan** | Inherit | Research and planning | Yes |
| **general-purpose** | Inherit | Complex multi-step tasks | No |

### Agent Patterns

**Read-Only Agent (exploration, analysis):**
```yaml
---
name: code-explorer
description: Explore codebases, analyze patterns. Use when researching architecture.
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit, NotebookEdit
model: haiku
---
```

**Full-Access Agent (coding, fixes):**
```yaml
---
name: code-fixer
description: Review code and fix issues. Use proactively after code changes.
tools: Read, Grep, Glob, Bash, Edit, Write
model: sonnet
---
```

### Proactive Triggering

Include "use proactively" in description for automatic delegation:
```yaml
description: Code reviewer. Use proactively after code changes to identify issues.
```

---

## Hooks

### Hook Events

| Event | When It Fires | Use Case |
|-------|---------------|----------|
| **SessionStart** | Session begins or resumes | Initialize, cache refresh, status detection |
| **SessionEnd** | Session terminates | Cleanup, final logging |
| **UserPromptSubmit** | User submits a prompt | Pre-process input, context setup |
| **PreToolUse** | Before tool execution | Validate, backup, permission checks |
| **PostToolUse** | After tool succeeds | Cleanup, side effects |
| **Stop** | Claude finishes responding | Learnings capture, final messages |
| **SubagentStart** | Subagent spawned | Setup agent context |
| **SubagentStop** | Subagent finishes | Process results |
| **PreCompact** | Before context compaction | Archive important info |
| **Notification** | Claude sends notifications | Custom notification handling |
| **Setup** | With --init or --maintenance | One-time setup |

### hooks.json Structure

```json
{
  "description": "What these hooks do",
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
            "timeout": 30
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.js",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/check-learnings.js",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Hook Matchers (PreToolUse)

```
Write|Edit              # File modifications
Bash                    # Shell commands
Read                    # File reads
Glob                    # File pattern search
Grep                    # Content search
*                       # All tools
""                      # All tools (alternative)
mcp__.*                 # All MCP tools
mcp__server__tool       # Specific MCP tool
```

### Environment Variables in Hooks

| Variable | Scope | Description |
|----------|-------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Absolute path to plugin directory |
| `${CLAUDE_PROJECT_DIR}` | Project hooks | Project root directory |

### Hook Exit Codes

| Code | Meaning |
|------|---------|
| **0** | Success - allow action |
| **2** | Block - deny action, show stderr to Claude |
| **Other** | Non-blocking error |

### Hook Output Formats (Critical)

Different hook events require different JSON output formats.

**PreToolUse Allow:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
```

**PreToolUse Deny:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Explanation of why denied"
  }
}
```

**Stop Hook Allow (continue):**
```json
{}
```

**Stop Hook Block:**
```json
{
  "decision": "block",
  "reason": "Explanation"
}
```

**Stop Hook Info Message (without blocking):**
```json
{
  "stopReason": "[plugin-name] Message here"
}
```

**SessionStart Continue:**
```json
{
  "continue": true,
  "systemMessage": "Optional context message"
}
```

### Common Hook Patterns

**PreToolUse Helper (JavaScript):**
```javascript
function respond(decision, reason = null) {
  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: decision
    }
  };
  if (reason) {
    response.hookSpecificOutput.permissionDecisionReason = reason;
  }
  console.log(JSON.stringify(response));
  process.exit(0);
}

// Usage
if (shouldBlock) {
  respond("deny", "Sensitive file detected");
} else {
  respond("allow");
}
```

**Stop Hook Pattern (JavaScript):**
```javascript
if (shouldBlock) {
  console.log(JSON.stringify({ decision: "block", reason: "..." }));
} else {
  console.log(JSON.stringify({}));  // Allow
}
```

---

## Commands

### Command File Structure

```
plugin-name/commands/
└── command-name.md
```

### Command Frontmatter

```yaml
---
name: command-name              # Display name
description: What this command does
---
```

### User-Invocable vs Auto-Invoke

**User-Invocable Command (manual slash command):**
```bash
/plugin-name:command-name
/plugin-name:command-name arg1 arg2
```

**Auto-Invoke via Skill Trigger:**
Invoke automatically when a skill matches and calls the command.

---

## MCP Integration

### .mcp.json Configuration

```json
{
  "server-name": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
    "env": {
      "API_KEY": "${API_KEY}",
      "DEBUG": "true"
    }
  }
}
```

### Inline in plugin.json (Marketplace)

```json
{
  "name": "my-plugin",
  "description": "Description",
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

- **stdio**: Local process (command + args)
- **http**: Remote HTTP server (url)
- **sse**: Server-sent events (url)

---

## Marketplace Setup

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

### Plugin Sources in Marketplace

**Relative path (same repo):**
```json
{
  "source": "./plugins/my-plugin"
}
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

### Plugin Categories

- `development` - Dev tools, LSP, SDKs
- `productivity` - Workflow automation, reviews
- `security` - Security scanning, guidance
- `testing` - Test frameworks, Playwright
- `database` - Supabase, Firebase, Pinecone
- `monitoring` - Sentry, PostHog
- `deployment` - Vercel, AWS
- `design` - Figma, design tools
- `learning` - Educational resources

---

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH
```

- **PATCH**: Bug fixes, small improvements
- **MINOR**: New features (skills, agents, hooks)
- **MAJOR**: Breaking changes

### Version Synchronization

**Critical:** Plugin versions must match across three locations:

1. `plugins/<name>/.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
2. `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"` in plugins array
3. `plugins/<name>/skills/<skill>/SKILL.md` - frontmatter `version:` (all skills in plugin)

**When Bumping Versions:**
- Update all locations simultaneously
- Use semantic versioning
- Commit version changes together

---

## Development Workflow

### Creating a New Plugin

1. Create directory: `plugins/my-plugin/`
2. Create manifest: `plugins/my-plugin/.claude-plugin/plugin.json`
3. Create first skill: `plugins/my-plugin/skills/main-skill/SKILL.md`
4. Add hook: `plugins/my-plugin/hooks/hooks.json` (if needed)
5. Test locally: `claude --plugin-dir ./plugins/my-plugin`

### Creating a New Skill

1. Create directory: `plugins/<name>/skills/<skill-name>/`
2. Create `SKILL.md` with YAML frontmatter
3. Add `references/` directory if documentation is needed
4. Update version in all locations
5. Commit and test

### Creating a New Agent

1. Create file: `plugins/<name>/agents/<agent-name>.md`
2. Add YAML frontmatter (name, description, tools)
3. Define system prompt in markdown body
4. Include example triggering scenarios in description
5. Test with trigger phrases

### Creating Hooks

1. Create hook script: `plugins/<name>/hooks/hook-name.js`
2. Add entry to `plugins/<name>/hooks/hooks.json`
3. Use `${CLAUDE_PLUGIN_ROOT}` for paths
4. Set appropriate timeout values
5. Test exit codes and output format

---

## Functional Claude Plugins

### Available Plugins (v0.3.x)

| Plugin | Version | Description |
|--------|---------|-------------|
| **wezterm-dev** | 0.7.10 | WezTerm terminal configuration |
| **hyper-dev** | 0.3.5 | Hyper terminal configuration and plugins |
| **prisma-dev** | 0.1.5 | Prisma ORM with schema analysis |
| **shadcn-dev** | 0.1.6 | shadcn/ui and Tailwind CSS v4 |
| **pre-commit** | 0.3.0 | Pre-push checks (typecheck/lint/build/test) |
| **claude-plugin-dev** | 0.3.1 | Plugin development guidance |
| **opentui-dev** | 0.1.3 | OpenTUI terminal interface development |

### Installation from Marketplace

```bash
/plugin marketplace add nthplusio/functional-claude
/plugin install wezterm-dev@functional-claude
```

### Plugin Details

#### wezterm-dev
Configuration for WezTerm terminal with tmux-style keybindings, custom tab bars, and Agent Deck integration.

**Skills:** wezterm-dev, wezterm-keybindings, wezterm-visual, wezterm-tabs, wezterm-agent-deck
**Agent:** wezterm-troubleshoot

#### hyper-dev
Hyper terminal configuration with plugin development patterns and ecosystem discovery.

**Skills:** hyper-dev, hyper-keybindings, hyper-visual, hyper-plugins, hyper-themes, hyper-ecosystem
**Agent:** hyper-troubleshoot

#### prisma-dev
Prisma ORM workflows with schema analysis and migration safety.

**Skills:** prisma-dev, prisma-schema, prisma-migrations, prisma-queries, prisma-recon
**Agent:** prisma-troubleshoot

#### shadcn-dev
shadcn/ui and Tailwind CSS v4 component development.

**Skills:** shadcn-dev, shadcn-components, shadcn-forms, shadcn-theming, shadcn-data-tables, tailwindv4
**Agent:** shadcn-troubleshoot
**Command:** /shadcn-recon

#### pre-commit
Pre-push checks with auto-detection for JavaScript, Python, Rust, and Go projects.

**Skills:** pre-commit-setup
**Config File:** `${CLAUDE_PROJECT_DIR}/.claude/pre-commit.json`

Supported checks: typecheck, lint, build, test (in execution order)

#### claude-plugin-dev
Plugin development guidance with AI-assisted workflows.

**Skills:**
- claude-plugin-dev (overview)
- plugin-structure
- skill-development
- agent-development
- hook-development
- mcp-integration
- command-development
- plugin-settings

**Agents:**
- plugin-validator
- agent-creator
- skill-reviewer

**Command:** /create-plugin

#### opentui-dev
OpenTUI terminal interface development with component design and layout.

**Skills:** opentui-dev, opentui-components, opentui-layout, opentui-keyboard, opentui-animation
**Agent:** opentui-troubleshoot
**Command:** /opentui-scaffold

---

## Naming Conventions

### Plugin Names
- Use kebab-case: `plugin-dev`, `code-review`, `commit-commands`
- Descriptive but concise: `pr-review-toolkit`, `frontend-design`
- Suffix with `-lsp` for language servers: `typescript-lsp`, `rust-analyzer-lsp`

### Skill Names
- Match directory name: `hook-development/SKILL.md` → name: `hook-development`
- Use kebab-case: `skill-development`, `agent-development`
- Prefix with plugin name for clarity: `wezterm-keybindings`, `prisma-schema`

### Agent Names
- Describe the role: `plugin-validator`, `code-reviewer`, `agent-creator`
- Suffix with `-troubleshoot` for debugging agents: `wezterm-troubleshoot`
- Use kebab-case

### Hook Scripts
- Descriptive names: `verify-wezterm-backup.js`, `check-learnings.js`
- Use kebab-case for filenames

---

## Quality Checklist

### Plugin Structure
- [ ] `.claude-plugin/plugin.json` exists with name, description
- [ ] Version follows semantic versioning
- [ ] Skills in `skills/skill-name/SKILL.md` format
- [ ] Agents in `agents/agent-name.md` format
- [ ] Hooks in `hooks/hooks.json` (if applicable)
- [ ] README.md with usage instructions
- [ ] All referenced files exist

### Skills
- [ ] Description is third-person with specific trigger phrases
- [ ] SKILL.md body < 2000 words
- [ ] Details in references/ not SKILL.md
- [ ] Uses imperative writing style
- [ ] All referenced files exist
- [ ] Examples included for complex topics

### Agents
- [ ] Description explains when to use
- [ ] Tools list is appropriate for task
- [ ] Model choice makes sense (haiku for fast, sonnet for complex)
- [ ] Example triggering scenarios in description
- [ ] System prompt is clear and actionable

### Hooks
- [ ] Uses `${CLAUDE_PLUGIN_ROOT}` for paths
- [ ] Appropriate timeout values (10-30 seconds typical)
- [ ] Exit codes documented in scripts
- [ ] JSON output format matches hook event type
- [ ] Handles errors gracefully (fail-open principle)

### Marketplace
- [ ] marketplace.json has valid schema
- [ ] All plugins listed with versions
- [ ] Plugin sources are correct (relative paths for repo)
- [ ] Categories are valid
- [ ] Owner information is complete

---

## Advanced Patterns

### Cache Management Pattern

For plugins that fetch documentation:

```
.cache/
├── sources.json           # What to fetch and when
├── docs-index.json        # Fetch timestamps
└── learnings.md           # Docs + user learnings
```

**sources.json Schema:**
```json
{
  "refresh_interval_days": 7,
  "sources": [
    {
      "name": "Source Name",
      "url": "https://example.com/docs",
      "prompt": "Instructions for extracting content",
      "section": "Section header in learnings.md"
    }
  ],
  "preserve_sections": ["Learnings", "Successful Patterns", "Mistakes to Avoid"]
}
```

### SessionStart Hook with Background Process

For slow cache refresh operations:

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Fast synchronous work...

if (docsNeedRefresh) {
  // Spawn detached background process for slow work
  const backgroundScript = path.join(__dirname, 'cache-refresh.js');
  const child = spawn(process.execPath, [backgroundScript, cacheDir], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref(); // Allow parent to exit independently
}

// Output immediately and exit
console.log(JSON.stringify({ continue: true }));
```

### Learnings Capture Pattern (Stop Hook)

```javascript
const patterns = {
  config: /config file patterns/i,
  migrations: /migration patterns/i,
  schema: /schema design patterns/i
};

const matchedCategories = [];
for (const [category, pattern] of Object.entries(patterns)) {
  if (pattern.test(transcript)) {
    matchedCategories.push(category);
  }
}

if (matchedCategories.length > 0) {
  const message = `This session involved plugin work (${matchedCategories.join(', ')}). Consider capturing learnings...`;
  console.log(JSON.stringify({ stopReason: `[plugin-name] ${message}` }));
} else {
  console.log(JSON.stringify({}));
}
```

---

## Resources

- **Official Documentation:** https://code.claude.com/docs/en/plugins-reference
- **Status Line Configuration:** https://code.claude.com/docs/en/statusline
- **Claude Code GitHub:** https://github.com/anthropics/claude-code
- **Official Plugins Repository:** https://github.com/anthropics/claude-plugins-official

---

## Notes

- **Always gitignore:** `.cache/` directories and `.local.md` files
- **Plugin isolation:** Plugins are installed independently; don't assume other plugins are available
- **Fail-open principle:** Hooks should allow actions on error rather than blocking
- **Progressive disclosure:** Keep main skill content concise; use references for details
- **Version sync:** Automate version checking in pre-commit hooks if managing multiple locations

