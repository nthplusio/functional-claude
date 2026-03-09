# Hook Development Patterns

Last updated: 2026-03-09
Source: Bash hook examples from FlorianBruniaux/claude-code-ultimate-guide + cross-platform learnings

## Cross-Platform Shebang (Critical)

`#!/usr/bin/env node` fails on macOS when Node is installed via version managers (nvm, fnm, volta) because hooks run in a non-interactive shell without the user's profile. Use a shell/JS polyglot preamble:

```javascript
#!/bin/sh
":" //; export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
":" //; command -v node >/dev/null 2>&1 || { [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" 2>/dev/null; }
":" //; exec node "$0" "$@"
// ... rest of JS code
'use strict';
```

**How it works:**
- Shell sees `":"` as the `:` no-op builtin, `//;` as an ignored argument, then executes the real command
- Node sees `":"` as a string expression, `//;...` as a line comment
- Shell augments PATH with common Node locations, falls back to sourcing nvm, then `exec node` replaces the shell with Node running the same file
- stdin is preserved through `exec` (shell doesn't consume it)

**When to use:** Always use this for plugin hooks (`.js` files in `hooks/`). Never use `#!/usr/bin/env node` alone.

## Bash Hook Patterns

For hooks that don't need Node.js, pure bash with `jq` is simpler and avoids the shebang issue entirely.

### Basic Structure

```bash
#!/bin/bash
# Hook: <EventType> - <Description>
# Exit 0 = allow, Exit 2 = block (stderr shown to Claude)

set -e

# Read JSON from stdin
INPUT=$(cat)

# Extract fields
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}')

# ... logic ...

# Allow by default
exit 0
```

### Input Fields by Event

| Event | Key Fields |
|-------|-----------|
| PreToolUse | `tool_name`, `tool_input` |
| PostToolUse | `tool_name`, `tool_input`, `tool_output` |
| SessionStart | `cwd` |
| Stop | `transcript_path`, `stop_hook_active`, `cwd` |
| UserPromptSubmit | `prompt` |

### Output Formats

**PreToolUse — block with reason:**
```bash
echo "BLOCKED: Reason here" >&2
exit 2
```

**PreToolUse — allow with decision:**
```bash
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
exit 0
```

**Stop — inject follow-up turn:**
```bash
echo '{"stopReason":"Message that triggers a new Claude turn"}'
exit 0
```

**SessionStart — inject context:**
```bash
echo '{"continue":true,"systemMessage":"Context injected into session"}'
exit 0
```

**PostToolUse — system message:**
```bash
echo '{"systemMessage":"Warning: something happened"}'
exit 0
```

## Common Patterns

### Pattern Array Matching (PreToolUse)

```bash
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "DROP DATABASE"
    "git push.*--force.*main"
)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if [[ "$COMMAND" == *"$pattern"* ]]; then
        echo "BLOCKED: Dangerous command: '$pattern'" >&2
        exit 2
    fi
done
```

### Tool-Specific Routing

```bash
case "$TOOL_NAME" in
    Read|Write|Edit)
        FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // .path // ""')
        # file-specific logic
        ;;
    Bash)
        COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')
        # command-specific logic
        ;;
    Grep|Glob)
        PATTERN=$(echo "$TOOL_INPUT" | jq -r '.pattern // ""')
        ;;
esac
```

### Protected File Lists

```bash
PROTECTED_FILES=(".env" ".env.local" "credentials.json" "id_rsa" "id_ed25519")

FILENAME=$(basename "$FILE_PATH")
for protected in "${PROTECTED_FILES[@]}"; do
    if [[ "$FILENAME" == "$protected" ]]; then
        echo "BLOCKED: Editing sensitive file '$FILENAME'" >&2
        exit 2
    fi
done
```

### Configurable via Environment Variables

```bash
LOG_DIR="${CLAUDE_LOG_DIR:-$HOME/.claude/logs}"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)-$$}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
```

### JSONL Logging (PostToolUse)

```bash
LOG_FILE="$LOG_DIR/activity-$(date +%Y-%m-%d).jsonl"
mkdir -p "$LOG_DIR"

LOG_ENTRY=$(jq -n \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg tool "$TOOL_NAME" \
    --arg file "$FILE_PATH" \
    '{timestamp: $timestamp, tool: $tool, file: $file}')

echo "$LOG_ENTRY" >> "$LOG_FILE"
```

### Regex-Based Secret Detection

```bash
declare -A PATTERNS=(
    ["OpenAI Key"]="sk-[A-Za-z0-9]{48}"
    ["GitHub Token"]="gh[ps]_[A-Za-z0-9]{36}"
    ["AWS Access Key"]="AKIA[A-Z0-9]{16}"
    ["Anthropic Key"]="sk-ant-[A-Za-z0-9-]{95,}"
    ["Private Key"]="-----BEGIN (RSA |EC )?PRIVATE KEY-----"
)

for name in "${!PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -qE "${PATTERNS[$name]}"; then
        echo "BLOCKED: $name detected" >&2
        exit 2
    fi
done
```

### Path Boundary Enforcement

```bash
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CLAUDE_HOME="$HOME/.claude"

is_allowed=false
[[ "$FILE_PATH" == "$PROJECT_DIR"* ]] && is_allowed=true
[[ "$FILE_PATH" == "$CLAUDE_HOME"* ]] && is_allowed=true
[[ "$FILE_PATH" == "/tmp"* ]] && is_allowed=true

if [[ "$is_allowed" == "false" ]]; then
    echo "BLOCKED: Editing outside project: $FILE_PATH" >&2
    exit 2
fi
```

### Conditional Formatting (PostToolUse)

```bash
if [[ "$TOOL_NAME" == "Write" || "$TOOL_NAME" == "Edit" ]]; then
    FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    EXT="${FILE##*.}"

    case "$EXT" in
        js|jsx|ts|tsx|json|css)
            command -v npx &>/dev/null && npx prettier --write "$FILE" 2>/dev/null
            ;;
        py)
            command -v black &>/dev/null && black "$FILE" 2>/dev/null
            ;;
    esac
fi
exit 0
```

## Best Practices

1. **Always fail open** — Exit 0 on unexpected errors so hooks never block sessions
2. **Use `set -e`** — Catch errors early, but ensure a final `exit 0` fallback
3. **Stderr for block reasons** — `echo "message" >&2` then `exit 2`
4. **Stdout for JSON** — Hook output (systemMessage, stopReason, permissionDecision)
5. **Timeout awareness** — Keep hooks fast; use short timeouts (10-30s)
6. **`jq` for JSON** — Prefer `jq` over manual parsing; use `// empty` for missing fields
7. **`command -v` for tool checks** — Test if commands exist before calling them
8. **No interactive commands** — Hooks run non-interactively; never use `read` for user input
9. **Idempotent operations** — Hooks may run multiple times; design accordingly

## Bash vs Node.js Decision Guide

| Factor | Bash | Node.js |
|--------|------|---------|
| JSON parsing | `jq` (external dep) | Native |
| File I/O | Simple reads/writes | Complex file operations |
| Pattern matching | Regex, globs | Full regex, complex logic |
| Cross-platform | Always works | Needs polyglot shebang |
| Startup time | ~5ms | ~50ms |
| Best for | Validation, logging, blocking | Stateful logic, API calls, complex transforms |
