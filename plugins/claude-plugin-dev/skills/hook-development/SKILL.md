---
name: hook-development
description: This skill should be used when the user asks to "create a hook",
  "add PreToolUse hook", "validate tool use", "hook events", "hooks.json",
  "prompt-based hook", or mentions hook events (PreToolUse, PostToolUse, Stop).
version: 0.3.0
---

# Hook Development

Guide for creating event-driven hooks that validate, log, or modify Claude's behavior.

## Hook Location

```
hooks/
└── hooks.json
```

## hooks.json Format

```json
{
  "description": "What these hooks do",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.js",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## Hook Types

### Command Hooks

Execute a script and use exit codes:

```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.js",
  "timeout": 30
}
```

### Prompt-Based Hooks

Let Claude evaluate conditions:

```json
{
  "type": "prompt",
  "prompt": "Check if this file modification follows coding standards. If it violates any standards, explain why and set permissionDecision to 'deny'."
}
```

Prompt hooks are useful for semantic checks that are hard to script.

## Hook Events

| Event | When It Fires |
|-------|---------------|
| `SessionStart` | Session begins or resumes |
| `UserPromptSubmit` | User submits a prompt |
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool succeeds |
| `Stop` | Claude finishes responding |
| `SubagentStart` | When spawning a subagent |
| `SubagentStop` | When subagent finishes |
| `PreCompact` | Before context compaction |
| `SessionEnd` | Session terminates |
| `Notification` | Claude sends notifications |
| `Setup` | With --init or --maintenance flags |

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Absolute path to plugin |
| `"$CLAUDE_PROJECT_DIR"` | Project hooks | Project root (quoted) |

**Critical:** Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` with braces. Project hooks use `"$CLAUDE_PROJECT_DIR"` with quotes.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - allow action |
| 2 | Block - deny action, show stderr |
| Other | Non-blocking error |

## Common Matchers

- `Write|Edit` - File modifications
- `Bash` - Shell commands
- `*` or `""` - All tools
- `mcp__.*` - All MCP tools

## Temporarily Active Hooks

Hooks can be enabled/disabled via `.local.md` config:

```javascript
// In hook script
const config = parseLocalMd(pluginRoot);
if (!config.hooks?.validation_enabled) {
  process.exit(0); // Skip hook
}
```

See `/claude-plugin-dev:plugin-settings` for configuration patterns.

## Common Patterns

### Validation (PreToolUse)

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate.js",
        "timeout": 30
      }]
    }]
  }
}
```

### Cache Refresh (SessionStart)

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/refresh-cache.js",
        "timeout": 30
      }]
    }]
  }
}
```

### Learnings Capture (Stop)

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/check-learnings.js",
        "timeout": 10
      }]
    }]
  }
}
```

## JSON Output (PreToolUse)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Explanation"
  }
}
```

Permission values: `allow`, `deny`, `ask`

## Hook Script Template

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

    if (shouldBlock(content)) {
      console.error('Reason for blocking');
      process.exit(2);
    }

    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);
  } catch (err) {
    process.exit(0);
  }
});
```

## Checklist

- [ ] Uses `${CLAUDE_PLUGIN_ROOT}` for plugin paths
- [ ] Appropriate timeout values
- [ ] Exit codes documented
- [ ] Matcher patterns correct
- [ ] Error handling present
