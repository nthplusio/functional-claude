# Command Development Reference

Last updated: 2026-01-30
Source: Claude Code plugin documentation

## Complete Frontmatter Reference

```yaml
---
name: command-name              # Optional: override filename
description: Brief description  # Required: shown in /help
version: 1.0.0                  # Optional: semantic version

# Execution options
allowed-tools: Read, Bash       # Tools approved without asking
model: sonnet                   # Model override: sonnet, opus, haiku
context: fork                   # Run in isolated subagent

# Visibility
user-invocable: true            # Default true, set false for internal use
disable-model-invocation: true  # Prevent Claude from auto-invoking
---
```

## Argument Substitution Details

### $ARGUMENTS
Full argument string passed to command.

```yaml
# Command: /search foo bar baz
# $ARGUMENTS = "foo bar baz"

Search for: $ARGUMENTS
```

### $N (Positional)
Individual arguments by position (1-indexed).

```yaml
# Command: /copy src.txt dest.txt
# $1 = "src.txt"
# $2 = "dest.txt"

Copy $1 to $2
```

### $ARGUMENTS[N]
Alternative syntax for positional arguments.

```yaml
# Equivalent to $1
First argument: $ARGUMENTS[1]
```

### Edge Cases
- Missing arguments: `$1` becomes empty string if not provided
- Quoted arguments: `/cmd "hello world"` → `$1` = "hello world"
- Extra arguments: Ignored unless using `$ARGUMENTS`

## File Reference Patterns

### Basic Reference
```yaml
Follow steps in @setup-checklist.md
```

### Subdirectory Reference
```yaml
Use the template from @templates/component.tsx
```

### Multiple References
```yaml
Read @intro.md for context, then follow @steps.md
```

### Reference Resolution
1. `@file.md` resolves relative to command file location
2. Files are loaded into context when command invoked
3. Missing files cause warning but don't block execution

## Environment Variables

### ${CLAUDE_PLUGIN_ROOT}
Absolute path to plugin directory. Use for:
- Script execution
- Reading plugin config files
- Referencing bundled resources

```yaml
Run validation:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/validate.js"
```
```

### ${CLAUDE_PROJECT_DIR}
Project root where Claude Code was started. Use for:
- Project-specific operations
- Finding project config files

```yaml
Check project config:
```bash
cat "${CLAUDE_PROJECT_DIR}/package.json"
```
```

### ${CLAUDE_SESSION_ID}
Current session identifier. Use for:
- Logging
- Temporary file naming

## Command Examples from Official Plugins

### commit-commands Plugin

```yaml
# commands/commit.md
---
name: commit
description: Create a git commit with AI-generated message
allowed-tools: Bash
---

Analyze staged changes and create a commit:

1. Run `git diff --cached` to see changes
2. Generate concise commit message
3. Run `git commit -m "message"`
```

### pr-review-toolkit Plugin

```yaml
# commands/review-pr.md
---
name: review-pr
description: Review a pull request
allowed-tools: Bash, Read
---

Review PR $1:

1. Fetch PR details: `gh pr view $1`
2. Get diff: `gh pr diff $1`
3. Analyze changes for:
   - Code quality issues
   - Security concerns
   - Performance implications
4. Provide structured feedback
```

### plugin-dev Plugin

```yaml
# commands/create-skill.md
---
name: create-skill
description: Create a new skill with proper structure
---

Create a new skill named $1:

## Steps
1. Create directory: skills/$1/
2. Create SKILL.md with frontmatter
3. Add references/ directory if needed
4. Validate with plugin-validator

## Frontmatter Template
```yaml
---
name: $1
description: This skill should be used when...
version: 1.0.0
---
```
```

## Advanced Patterns

### Conditional Execution

```yaml
---
name: deploy
description: Deploy with environment selection
---

Deploy to $1 environment.

If $1 is "production":
- Require explicit confirmation
- Run full test suite first
- Create backup before deploy

If $1 is "staging":
- Run smoke tests only
- Deploy immediately
```

### Error Handling

```yaml
---
name: migrate
description: Run database migrations
allowed-tools: Bash
---

Run migrations with error handling:

```bash
npm run migrate 2>&1
```

If migration fails:
1. Show the error message
2. Suggest rollback command
3. Check migration file for issues
```

### Progress Tracking

```yaml
---
name: setup-project
description: Complete project setup
---

Track setup progress using TodoWrite:

## Tasks
1. [ ] Initialize package.json
2. [ ] Install dependencies
3. [ ] Create config files
4. [ ] Set up testing
5. [ ] Create initial structure

Mark each task complete as you go.
```

### With AskUserQuestion

```yaml
---
name: new-feature
description: Create a new feature
---

Create a new feature. Use AskUserQuestion to clarify:

1. Feature name and location
2. Whether to include tests
3. Component style (class vs functional)
4. State management approach

Then generate the appropriate files.
```

## Best Practices

### Keep Commands Focused
Each command should do one thing well. For complex workflows, use multiple commands or a skill.

### Provide Good Defaults
When arguments are optional, use sensible defaults:

```yaml
Deploy to $1 environment (defaults to staging if not specified).

Environment: ${1:-staging}
```

### Include Error Recovery
Guide users when things go wrong:

```yaml
If the build fails:
1. Check the error message above
2. Common fixes:
   - Missing dependency: `npm install`
   - Type error: Check the file mentioned
3. Run `/build` again after fixing
```

### Document Requirements
State what the command needs to work:

```yaml
---
name: deploy
description: Deploy to cloud provider
---

**Requirements:**
- AWS CLI configured
- Valid credentials in ~/.aws
- Project has deploy script

...
```
