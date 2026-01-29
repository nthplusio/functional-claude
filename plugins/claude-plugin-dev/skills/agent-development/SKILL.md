---
name: agent-development
description: This skill should be used when the user asks to "create an agent",
  "write AGENT.md", "subagent", "specialized agent", or needs guidance on
  building autonomous agents with specific tool access and behaviors.
version: 0.1.1
---

# Agent Development

Guide for creating specialized subagents with AGENT.md files.

## Agent Structure

```
agents/
└── agent-name/
    └── AGENT.md
```

## AGENT.md Format

```yaml
---
name: my-agent
description: When Claude should delegate to this agent
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: sonnet
---

System prompt for the agent goes here in markdown.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (kebab-case) |
| `description` | Yes | When Claude should delegate |
| `tools` | No | Tools agent can use (inherits if omitted) |
| `disallowedTools` | No | Tools to explicitly deny |
| `model` | No | sonnet, opus, haiku, or inherit |
| `permissionMode` | No | default, plan, dontAsk, bypassPermissions |
| `skills` | No | Skills to preload into context |
| `hooks` | No | Agent-specific hooks |

## Agent Patterns

### Read-Only Explorer

```yaml
---
name: code-explorer
description: Explore codebase without modifications
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit, NotebookEdit
model: haiku
---

You are a codebase explorer. Analyze code structure and patterns.
Never suggest modifications—only report findings.
```

### Full-Access Reviewer

```yaml
---
name: code-reviewer
description: Review and fix code issues. Use proactively after code changes.
tools: Read, Grep, Glob, Bash, Edit, Write
model: inherit
---

You are a code reviewer. Analyze code for issues and fix them.
```

### Test Specialist

```yaml
---
name: test-runner
description: Run tests and debug failures. Use proactively after code changes.
tools: Read, Grep, Glob, Bash, Edit
model: sonnet
---

You are a test specialist focused on running tests and debugging failures.

## When Invoked

1. Identify the test framework
2. Run the relevant tests
3. Analyze any failures
4. Provide debugging guidance or fixes
```

## Proactive Triggering

Include "use proactively" in description for automatic delegation:

```yaml
description: Expert code reviewer. Use proactively after code changes.
```

## Agent-Specific Hooks

```yaml
---
name: secure-agent
description: Agent with validation hooks
tools: Read, Grep, Glob, Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
---
```

## Model Selection

| Model | Use Case |
|-------|----------|
| `haiku` | Fast, simple tasks (exploration, search) |
| `sonnet` | Balanced (most tasks) |
| `opus` | Complex reasoning |
| `inherit` | Use parent's model |

## Built-in Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| Explore | Haiku | Fast, read-only codebase exploration |
| Plan | Inherit | Research for planning mode |
| general-purpose | Inherit | Complex multi-step tasks |

## Checklist

- [ ] Description explains when to use
- [ ] Tools list is appropriate for task
- [ ] Model choice makes sense
- [ ] Name is kebab-case
- [ ] System prompt is clear and focused
