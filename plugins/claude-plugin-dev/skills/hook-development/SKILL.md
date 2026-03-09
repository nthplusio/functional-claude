---
name: hook-development
description: Guide for creating event-driven hooks that validate, log, or modify
  Claude's behavior. Use when the user asks to "create a hook", "add PreToolUse hook",
  "validate tool use", "hook events", "hooks.json", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
version: 0.5.2
---

# Hook Development

Guide for creating event-driven hooks in `hooks/hooks.json`.

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

**Command hooks** execute a script (see format above). **Prompt-based hooks** let Claude evaluate conditions — useful for semantic checks hard to script:

```json
{
  "type": "prompt",
  "prompt": "Check if this file modification follows coding standards. If it violates any standards, explain why and set permissionDecision to 'deny'."
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
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Absolute path to plugin |
| `"$CLAUDE_PROJECT_DIR"` | Project hooks | Project root (quoted) |

**Critical:** Plugin hooks use `${CLAUDE_PLUGIN_ROOT}` with braces. Project hooks use `"$CLAUDE_PROJECT_DIR"` with quotes.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — allow action |
| 2 | Block — deny action, show stderr |
| Other | Non-blocking error |

## Common Matchers

- `Write|Edit` — File modifications
- `Bash` — Shell commands
- `*` or `""` — All tools
- `mcp__.*` — All MCP tools

## Temporarily Active Hooks

Hooks can be enabled/disabled via `.local.md` config:

```javascript
const config = parseLocalMd(pluginRoot);
if (!config.hooks?.validation_enabled) {
  process.exit(0); // Skip hook
}
```

See `/claude-plugin-dev:plugin-settings` for configuration patterns.

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
