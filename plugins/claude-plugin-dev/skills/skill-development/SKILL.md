---
name: skill-development
description: This skill should be used when the user asks to "create a skill",
  "write SKILL.md", "skill frontmatter", "skill description", "trigger phrases",
  or needs guidance on writing skills with progressive disclosure.
version: 0.3.3
---

# Skill Development

Guide for writing effective SKILL.md files with proper structure and triggers.

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
description: This skill should be used when the user asks to "action X",
  "do Y", "configure Z", or needs guidance on [topic].
version: 1.0.0
---

# Skill Title

Skill body content here (markdown).
```

## Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `name` | Display name (defaults to directory) |
| `description` | Trigger phrases for auto-loading |
| `version` | Skill version |
| `disable-model-invocation` | Manual only (no auto-load) |
| `user-invocable` | Set `false` for Claude-only |
| `allowed-tools` | Auto-approved tools |
| `context: fork` | Run in subagent |
| `model` | Model override |

## Description Format (Critical)

Always use third-person with specific trigger phrases:

**Good:**
```yaml
description: This skill should be used when the user asks to "create a hook",
  "add a PreToolUse hook", "validate tool use", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
```

**Bad:**
```yaml
description: Use this skill for hooks.  # Not third person
description: Helps with hook development.  # No triggers
```

## Progressive Disclosure

| Location | Content | Target |
|----------|---------|--------|
| Description | Trigger phrases | ~100 words |
| SKILL.md body | Core concepts | 1,000-1,500 words |
| references/ | Details, API docs | 2,000-5,000+ words |
| examples/ | Working code | As needed |

**Best practice:** Keep SKILL.md concise. Move details to references/.

## Quality Review

After creating a skill, use the `skill-reviewer` agent:

```
Review my skill at ./skills/my-skill
```

It checks:
- Description quality and triggers
- Word count and progressive disclosure
- Writing style and structure
- Reference file existence

## String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments |
| `$N` | Argument by position |
| `${CLAUDE_SESSION_ID}` | Current session |

## Writing Style

- Imperative: "Create the hook" not "You should create"
- Third-person in description
- Specific trigger phrases
- Concrete examples

## Linking Skills

```markdown
For related topics:
- **/plugin-name:other-skill** - Description
```

## Checklist

- [ ] Description is third-person
- [ ] Description has trigger phrases
- [ ] SKILL.md < 1,500 words
- [ ] Details in references/
- [ ] Imperative writing style
- [ ] Name matches directory
