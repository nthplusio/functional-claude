---
name: command-development
description: This skill should be used when the user asks to "create a command",
  "slash command", "write a command", "$ARGUMENTS", "dynamic arguments",
  "@ file references", or needs guidance on building user-invocable slash commands.
version: 0.3.5
---

# Command Development

Guide for creating slash commands that users invoke directly with `/command-name`.

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

### Positional Arguments

```yaml
---
name: greet
description: Greet a user by name
---

Say hello to $1.
```

Usage: `/greet Alice` → "Say hello to Alice."

### All Arguments

```yaml
---
name: search
description: Search for patterns
---

Search the codebase for: $ARGUMENTS
```

Usage: `/search error handling` → "Search the codebase for: error handling"

### Indexed Arguments

```yaml
---
name: compare
description: Compare two files
---

Compare these files:
- First: $1
- Second: $2
```

Usage: `/compare foo.js bar.js`

## File References with @

Commands can reference files in the command directory:

```yaml
---
name: setup
description: Set up a new project
---

Follow the checklist in @checklist.md to set up this project.
```

File references:
- `@filename.md` - Same directory as command
- `@subdir/file.md` - Relative path from command

## Plugin Root Variable

Use `${CLAUDE_PLUGIN_ROOT}` for absolute paths:

```yaml
---
name: validate
description: Validate project structure
---

Run validation using:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/validate.js"
```
```

## Bash Execution

Commands can include bash commands that Claude executes:

```yaml
---
name: test
description: Run project tests
allowed-tools: Bash
---

Run the test suite:

```bash
npm test
```

Report results and suggest fixes for any failures.
```

## Command Patterns

### Simple Action

```yaml
---
name: format
description: Format all code files
allowed-tools: Bash
---

Format all files in this project:

```bash
npx prettier --write "**/*.{js,ts,json,md}"
```
```

### Interactive Workflow

```yaml
---
name: init
description: Initialize a new component
---

Create a new component. Ask the user:
1. Component name
2. Whether to include tests
3. Styling approach (CSS modules, Tailwind, etc.)

Then create the appropriate files.
```

### With Skill Loading

```yaml
---
name: review
description: Review code for issues
---

Load the code-review skill for guidance, then:

1. Analyze recent changes
2. Check for common issues
3. Suggest improvements

/plugin-name:code-review
```

### Multi-Phase Workflow

```yaml
---
name: deploy
description: Deploy to production
allowed-tools: Bash
---

Follow this deployment process:

## Phase 1: Pre-checks
- Run tests
- Check for uncommitted changes
- Verify branch is main

## Phase 2: Build
- Run build command
- Verify output

## Phase 3: Deploy
- Push to production
- Verify deployment

Ask before proceeding to each phase.
```

## vs Skills

| Aspect | Commands | Skills |
|--------|----------|--------|
| Invocation | User only (`/name`) | Claude or user |
| Purpose | Specific actions | Knowledge/guidance |
| Format | Direct instructions | Conceptual guidance |
| Arguments | $ARGUMENTS, $1, $2 | Rare |
| Location | `commands/` | `skills/` |

## Checklist

- [ ] Description explains what command does
- [ ] Uses $ARGUMENTS or $N for dynamic input
- [ ] allowed-tools matches needed operations
- [ ] @ references point to existing files
- [ ] ${CLAUDE_PLUGIN_ROOT} for plugin-relative paths
