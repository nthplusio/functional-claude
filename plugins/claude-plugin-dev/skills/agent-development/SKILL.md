---
name: agent-development
description: Guide for creating specialized subagents with AGENT.md files. Use when
  the user asks to "create an agent", "write AGENT.md", "subagent", "specialized
  agent", "agent tools", or needs guidance on agent design.
version: 0.5.0
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

`<example>` blocks in descriptions are essential for reliable triggering:

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

## AI-Assisted Creation

Use the `agent-creator` agent for interactive design:

```
Help me create an agent for [purpose]
```

## Quality Review

After creating an agent, use the `skill-reviewer` agent to check description quality, tool appropriateness, and system prompt clarity.
