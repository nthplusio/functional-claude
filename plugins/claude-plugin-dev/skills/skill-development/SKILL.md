---
name: skill-development
description: Guide for writing effective SKILL.md files with proper triggers and
  progressive disclosure. Use when the user asks to "create a skill", "write SKILL.md",
  "skill frontmatter", "skill description", or "trigger phrases".
version: 0.6.1
---

# Skill Development

## Core Principles

### Concise is Key

Claude already knows markdown, YAML, JSON, and directory structures. Only document what's non-obvious — plugin-specific conventions, exact field names, behaviors that differ from expectations.

**The test:** Before writing a section, ask "Does Claude already know this?" If yes, cut it.

### Degrees of Freedom

Match specificity to how fragile the convention is:

| Freedom | When | Example |
|---------|------|---------|
| **Low** (exact syntax) | Breaking changes if wrong | Frontmatter fields, file paths |
| **Medium** (guidance) | Multiple valid approaches | Writing style, description format |
| **High** (principles) | Creative decisions | Skill body structure, examples |

### Progressive Disclosure

| Location | Content | Target |
|----------|---------|--------|
| Description | Trigger phrases | ~50 words |
| SKILL.md body | Core conventions | Under 500 lines |
| references/ | Details, API docs | As needed |
| examples/ | Working code | As needed |

Keep SKILL.md concise. Move detailed docs to references/.

## Skill Structure

```
skill-name/
├── SKILL.md           # Required: main instructions
├── references/        # Detailed docs (loaded as needed)
├── examples/          # Working code samples
└── scripts/           # Utility scripts
```

## SKILL.md Format

```yaml
---
name: skill-name
description: Capability summary. Use when the user asks to "action X",
  "do Y", or needs guidance on [topic].
version: 1.0.0
---

# Skill Title

Skill body content here (markdown).
```

## Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `name` | Display name (defaults to directory) |
| `description` | Capability + trigger phrases for auto-loading |
| `version` | Skill version |
| `disable-model-invocation` | Manual only (no auto-load) |
| `user-invocable` | Set `false` for Claude-only |
| `allowed-tools` | Auto-approved tools |
| `context: fork` | Run in subagent |
| `model` | Model override |

## Description Format (Critical)

Start with a capability summary, then trigger phrases. Use direct "Use when..." form:

```yaml
description: Guide for creating event-driven hooks. Use when the user asks to
  "create a hook", "add a PreToolUse hook", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
```

## String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments |
| `$N` | Argument by position |
| `${CLAUDE_SESSION_ID}` | Current session |

## Writing Style

- Imperative: "Create the hook" not "You should create"
- Specific trigger phrases in descriptions
- Concrete examples over abstract rules

## Quality Review

After creating a skill, use the `skill-reviewer` agent:

```
Review my skill at ./skills/my-skill
```

## Linking Skills

```markdown
For related topics:
- **/plugin-name:other-skill** - Description
```
