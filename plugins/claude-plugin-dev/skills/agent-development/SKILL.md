---
name: agent-development
description: This skill should be used when the user asks to "create an agent",
  "write AGENT.md", "subagent", "specialized agent", "autonomous agent",
  "agent tools", or needs guidance on building agents with specific tool access.
version: 0.4.0
---

# Agent Development

Guide for creating specialized subagents with AGENT.md files.

## Agent Structure

```
agents/
└── agent-name.md       # Flat file (not subdirectory)
```

## AGENT.md Format

```yaml
---
name: my-agent
description: |
  When Claude should delegate to this agent. Include trigger phrases
  and example blocks for reliable invocation.

  <example>
  Context: Describe the situation
  user: "Example request"
  assistant: "I'll use the my-agent agent to handle this."
  <commentary>
  Why this triggers the agent.
  </commentary>
  </example>
tools:
  - Read
  - Grep
  - Glob
model: sonnet
color: cyan
---

System prompt for the agent goes here in markdown.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (kebab-case) |
| `description` | Yes | When to delegate + trigger phrases |
| `tools` | No | Tools agent can use (inherits if omitted) |
| `disallowedTools` | No | Tools to explicitly deny |
| `model` | No | sonnet, opus, haiku, or inherit |
| `color` | No | Visual identifier (cyan, magenta, green, etc.) |
| `permissionMode` | No | default, plan, dontAsk, bypassPermissions |
| `skills` | No | Skills to preload into context |
| `hooks` | No | Agent-specific hooks |

## Example Blocks (Critical)

Use `<example>` blocks in descriptions for reliable triggering:

```yaml
description: |
  Database migration reviewer. Use when checking migration safety.

  <example>
  Context: User about to run a migration
  user: "Can you check this migration?"
  assistant: "I'll use the migration-reviewer agent."
  <commentary>
  Migration safety check requested.
  </commentary>
  </example>
```

## AI-Assisted Creation

Use the `agent-creator` agent for interactive agent design:

```
Help me create an agent for [purpose]
```

The agent-creator guides you through:
1. Understanding core purpose
2. Selecting appropriate tools
3. Designing the persona
4. Generating complete AGENT.md

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
```

### Full-Access Specialist

```yaml
---
name: code-reviewer
description: Review and fix code issues. Use proactively after code changes.
tools: Read, Grep, Glob, Bash, Edit, Write
model: inherit
---
```

### Validation Agent

```yaml
---
name: config-validator
description: Validate configuration files for correctness
tools: Read, Grep, Glob
model: haiku
color: green
---
```

## Proactive Triggering

Include "use proactively" for automatic delegation:

```yaml
description: Expert test runner. Use proactively after code changes.
```

## Model Selection

| Model | Use Case |
|-------|----------|
| `haiku` | Fast tasks (exploration, validation) |
| `sonnet` | Balanced (most tasks) |
| `opus` | Complex reasoning |
| `inherit` | Use parent's model |

## Quality Review

After creating an agent, use the `skill-reviewer` agent to check:
- Description quality and triggers
- Tool appropriateness
- System prompt clarity

## Checklist

- [ ] Description has trigger phrases
- [ ] Description has `<example>` block(s)
- [ ] Tools list matches needs
- [ ] Model choice is appropriate
- [ ] Name is kebab-case
- [ ] System prompt is focused
