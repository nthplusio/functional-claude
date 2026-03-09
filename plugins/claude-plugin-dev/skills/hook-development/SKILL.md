---
name: hook-development
description: Guide for creating event-driven hooks that validate, log, or modify
  Claude's behavior. Use when the user asks to "create a hook", "add PreToolUse hook",
  "validate tool use", "hook events", "hooks.json", or mentions hook events
  (PreToolUse, PostToolUse, Stop).
version: 0.6.0
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

## Hook Script Templates

### Bash Hook (Preferred for validation/logging)

```bash
#!/bin/bash
# Hook: PreToolUse - Description
# Exit 0 = allow, Exit 2 = block (stderr shown to Claude)
set -e

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}')

# ... validation logic ...

exit 0
```

### Node.js Hook (Cross-Platform Shebang Required)

**Never use `#!/usr/bin/env node`** — it fails on macOS when Node is installed via version managers (nvm, fnm, volta). Use this polyglot preamble instead:

```javascript
#!/bin/sh
":" //; export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
":" //; command -v node >/dev/null 2>&1 || { [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" 2>/dev/null; }
":" //; exec node "$0" "$@"
'use strict';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    // ... logic ...
    console.log(JSON.stringify({ continue: true }));
  } catch (err) {
    process.exit(0); // Always fail open
  }
});
```

For detailed patterns, bash examples, and best practices: read `references/patterns.md`.
