# Claude Plugin Examples

Common patterns and complete examples for building plugins.

## Example 1: Simple Skill Plugin

A plugin with a single skill for code review.

### Directory Structure
```
code-reviewer/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

### plugin.json
```json
{
  "name": "code-reviewer",
  "version": "1.0.0",
  "description": "Automated code review skill"
}
```

### skills/code-review/SKILL.md
```yaml
---
name: code-review
description: This skill should be used when the user asks to "review code",
  "check my changes", "review PR", or wants feedback on code quality.
---

# Code Review

When reviewing code, analyze for:

1. **Correctness** - Logic errors, edge cases
2. **Security** - Input validation, injection risks
3. **Performance** - Inefficient operations
4. **Readability** - Naming, structure, comments

## Process

1. Read the files or diff to review
2. Identify issues by category
3. Provide specific, actionable feedback
4. Suggest concrete improvements

## Output Format

Organize findings by severity:
- **Critical**: Must fix before merge
- **Warning**: Should address
- **Suggestion**: Consider improving
```

---

## Example 2: Hook Plugin

A plugin with PreToolUse validation hooks.

### Directory Structure
```
security-check/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   ├── hooks.json
│   └── validate-write.js
└── README.md
```

### plugin.json
```json
{
  "name": "security-check",
  "version": "1.0.0",
  "description": "Security validation hooks for file operations"
}
```

### hooks/hooks.json
```json
{
  "description": "Validate file writes for security issues",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/validate-write.js",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### hooks/validate-write.js
```javascript
#!/usr/bin/env node
const fs = require('fs');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const content = data.tool_input?.content || '';

    // Check for sensitive patterns
    const patterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
      /password\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        console.error('Potential sensitive data detected');
        process.exit(2); // Block
      }
    }

    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);
  } catch (err) {
    process.exit(0); // Allow on error
  }
});
```

---

## Example 3: Agent Plugin

A plugin with a specialized subagent.

### Directory Structure
```
test-runner/
├── .claude-plugin/
│   └── plugin.json
└── agents/
    └── test-runner/
        └── AGENT.md
```

### plugin.json
```json
{
  "name": "test-runner",
  "version": "1.0.0",
  "description": "Specialized agent for running and debugging tests"
}
```

### agents/test-runner/AGENT.md
```yaml
---
name: test-runner
description: Run tests and debug failures. Use proactively after code changes
  that might affect tests.
tools: Read, Grep, Glob, Bash, Edit
model: sonnet
---

You are a test specialist focused on running tests and debugging failures.

## When Invoked

1. Identify the test framework (jest, pytest, cargo test, go test, etc.)
2. Run the relevant tests
3. Analyze any failures
4. Provide debugging guidance or fixes

## Test Framework Detection

- `package.json` with jest/vitest → npm test
- `pytest.ini` or `pyproject.toml` → pytest
- `Cargo.toml` → cargo test
- `go.mod` → go test ./...

## Debugging Failures

For each failure:
1. Read the failing test
2. Understand the expected behavior
3. Read the implementation being tested
4. Identify the root cause
5. Suggest or implement the fix

## Output

Provide clear status:
- Tests passed: ✓
- Tests failed: List failures with root cause
- Tests fixed: Describe changes made
```

---

## Example 4: MCP Integration Plugin

A plugin that bundles an MCP server.

### Directory Structure
```
db-tools/
├── .claude-plugin/
│   └── plugin.json
└── .mcp.json
```

### plugin.json
```json
{
  "name": "db-tools",
  "version": "1.0.0",
  "description": "Database query and management tools via MCP"
}
```

### .mcp.json
```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
    }
  }
}
```

---

## Example 5: Multi-Skill Plugin

A plugin with multiple focused skills and shared references.

### Directory Structure
```
api-dev/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── api-dev/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── rest-patterns.md
│   │       └── error-handling.md
│   ├── api-testing/
│   │   └── SKILL.md
│   └── api-docs/
│       └── SKILL.md
└── agents/
    └── api-reviewer/
        └── AGENT.md
```

### Main Skill Pattern
```yaml
---
name: api-dev
description: This skill should be used when the user asks to "create API",
  "add endpoint", "REST API", or needs guidance on API development.
---

# API Development

Overview of API development patterns.

## Quick Reference

| Method | Use Case |
|--------|----------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace resources |
| PATCH | Partial update |
| DELETE | Remove resources |

## Additional Resources

For detailed patterns, see:
- **`references/rest-patterns.md`** - RESTful design patterns
- **`references/error-handling.md`** - Error response standards

For related skills:
- **/api-dev:api-testing** - Testing API endpoints
- **/api-dev:api-docs** - Generating documentation
```

---

## Example 6: LSP Plugin (Marketplace Style)

Defined entirely in marketplace.json without separate files.

### marketplace.json Entry
```json
{
  "name": "ruby-lsp",
  "description": "Ruby language server for code intelligence",
  "version": "1.0.0",
  "source": "./plugins/ruby-lsp",
  "category": "development",
  "strict": false,
  "lspServers": {
    "ruby-lsp": {
      "command": "ruby-lsp",
      "extensionToLanguage": {
        ".rb": "ruby",
        ".rake": "ruby",
        ".gemspec": "ruby"
      }
    }
  }
}
```

---

## Example 7: Command Plugin

A plugin with slash commands for common workflows.

### Directory Structure
```
git-helpers/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    ├── commit.md
    └── pr.md
```

### commands/commit.md
```yaml
---
description: Create a commit with a well-formatted message
disable-model-invocation: true
---

Create a git commit for the current changes:

1. Run `git status` to see changes
2. Run `git diff --cached` to see staged changes
3. Analyze the changes and write a commit message:
   - First line: type(scope): summary (max 72 chars)
   - Blank line
   - Body: explain what and why

4. Run `git commit -m "message"`

Types: feat, fix, docs, style, refactor, test, chore
```

### commands/pr.md
```yaml
---
description: Create a pull request for current branch
disable-model-invocation: true
---

Create a pull request:

1. Check current branch and remote status
2. Push branch if needed: `git push -u origin HEAD`
3. Analyze all commits on this branch vs main
4. Create PR with `gh pr create`:
   - Title: Brief summary
   - Body: What changed and why

Include in body:
- Summary of changes
- Testing done
- Any migration notes
```
