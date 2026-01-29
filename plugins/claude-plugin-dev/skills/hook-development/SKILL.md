---
name: hook-development
description: This skill should be used when the user asks to "create a hook",
  "add PreToolUse hook", "validate tool use", "hook events", "hooks.json",
  or mentions hook events (PreToolUse, PostToolUse, Stop, SessionStart).
version: 0.1.1
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
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Absolute path to plugin directory |
| `"$CLAUDE_PROJECT_DIR"` | Project hooks | Project root (quoted) |

**Critical:** Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` with braces. Project hooks use `"$CLAUDE_PROJECT_DIR"` with quotes.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - allow action |
| 2 | Block - deny action, show stderr to Claude |
| Other | Non-blocking error |

## Common Matchers

- `Write|Edit` - File modifications
- `Bash` - Shell commands
- `*` or `""` - All tools
- `mcp__.*` - All MCP tools
- `mcp__server__.*` - Specific MCP server

## Hook Patterns

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

### Session Start

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
        "timeout": 30
      }]
    }]
  }
}
```

### Stop (Learnings Capture)

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

Return JSON to stdout for permission decisions:

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

    // Validation logic here
    if (shouldBlock(content)) {
      console.error('Reason for blocking');
      process.exit(2); // Block
    }

    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);
  } catch (err) {
    process.exit(0); // Allow on error
  }
});
```

## Checklist

- [ ] Uses `${CLAUDE_PLUGIN_ROOT}` for plugin paths
- [ ] Uses `"$CLAUDE_PROJECT_DIR"` for project paths
- [ ] Appropriate timeout values
- [ ] Exit codes documented in scripts
- [ ] Matcher patterns are correct
