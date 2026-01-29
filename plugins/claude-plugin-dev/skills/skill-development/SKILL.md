---
name: skill-development
description: This skill should be used when the user asks to "create a skill",
  "write SKILL.md", "skill frontmatter", "skill description", or needs guidance
  on writing effective skills with proper triggers and progressive disclosure.
version: 0.1.1
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
| `name` | Display name (defaults to directory name) |
| `description` | Trigger phrases - Claude uses this to decide when to load |
| `version` | Skill version |
| `disable-model-invocation` | Prevents Claude from auto-loading (manual only) |
| `user-invocable` | Set `false` for Claude-only skills |
| `allowed-tools` | Tools Claude can use without permission |
| `context: fork` | Run in isolated subagent context |
| `agent` | Which subagent type to use |
| `model` | Model override (sonnet, opus, haiku) |

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
description: Use this skill for hooks.  # Not third person, vague
description: Helps with hook development.  # No trigger phrases
```

## Progressive Disclosure

| Location | Content | Target Size |
|----------|---------|-------------|
| Metadata | Description only | ~100 words |
| SKILL.md body | Core concepts, workflow | 1,500-2,000 words |
| references/ | Detailed patterns, API docs | 2,000-5,000+ words each |
| examples/ | Complete working code | As needed |

**Best practice:** Keep SKILL.md under 2000 words. Move details to references/.

## String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed to skill |
| `$ARGUMENTS[N]` or `$N` | Specific argument by index |
| `${CLAUDE_SESSION_ID}` | Current session ID |

## Writing Style

- Use imperative form: "Create the hook" not "You should create"
- Third-person in description: "This skill should be used when..."
- Be specific about triggers
- Include concrete examples

## Linking Related Skills

```markdown
For related skills:
- **/plugin-name:other-skill** - Brief description
- **/plugin-name:another-skill** - Brief description
```

## Checklist

- [ ] Description is third-person with trigger phrases
- [ ] SKILL.md body < 2000 words
- [ ] Details in references/ not SKILL.md
- [ ] Uses imperative writing style
- [ ] All referenced files exist
- [ ] Name matches directory name
