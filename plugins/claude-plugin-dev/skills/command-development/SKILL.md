---
name: command-development
description: Guide for creating user-invocable slash commands. Use when the user
  asks to "create a command", "slash command", "write a command", "$ARGUMENTS",
  "dynamic arguments", or "@ file references".
version: 0.5.0
---

# Command Development

Guide for creating slash commands that users invoke with `/command-name`.

## Command Location

```
my-plugin/
└── commands/
    └── command-name.md
```

## Command File Format

```yaml
---
name: my-command
description: What this command does (shown in /help)
allowed-tools: Bash, Read, Write
model: sonnet
---

# Command Title

Instructions Claude follows when user runs /my-command.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Override command name (defaults to filename) |
| `description` | Yes | Shown in /help listing |
| `allowed-tools` | No | Auto-approved tools when command active |
| `model` | No | Model override (sonnet, opus, haiku) |
| `context` | No | `fork` to run in subagent |

## Dynamic Arguments

### $ARGUMENTS — All Arguments

```yaml
Search the codebase for: $ARGUMENTS
```

Usage: `/search error handling` → "Search the codebase for: error handling"

### $N — Positional Arguments

```yaml
Compare these files:
- First: $1
- Second: $2
```

Usage: `/compare foo.js bar.js`

## File References with @

Commands can reference files in the command directory:

```yaml
Follow the checklist in @checklist.md to set up this project.
```

- `@filename.md` — Same directory as command
- `@subdir/file.md` — Relative path from command

## Plugin Root Variable

Use `${CLAUDE_PLUGIN_ROOT}` for absolute paths to plugin files:

```yaml
Run validation using:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/validate.js"
```
```

## Commands vs Skills

| Aspect | Commands | Skills |
|--------|----------|--------|
| Invocation | User only (`/name`) | Claude or user |
| Purpose | Specific actions | Knowledge/guidance |
| Format | Direct instructions | Conceptual guidance |
| Arguments | $ARGUMENTS, $1, $2 | Rare |
| Location | `commands/` | `skills/` |
