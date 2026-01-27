#!/bin/bash
# Check if session involved Hyper config work and prompt for learnings capture

# Read JSON input from stdin (with fallback)
INPUT=$(cat 2>/dev/null || echo '{}')

# Check if stop_hook_active is true (already continuing from a stop hook)
# Use || echo "" to prevent non-zero exit from grep when no match
STOP_HOOK_ACTIVE=$(echo "$INPUT" | grep -o '"stop_hook_active":[^,}]*' | grep -o 'true\|false' || echo "")
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  echo '{"ok":true}'
  exit 0
fi

# Get transcript path from input (with fallback)
TRANSCRIPT_PATH=$(echo "$INPUT" | grep -o '"transcript_path":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  echo '{"ok":true}'
  exit 0
fi

# Check if transcript contains Hyper-related work
# Look for hyper config file paths, hyper skill usage, or hyper keywords
if grep -qi -E '(\.hyper\.js|hyper-dev|hyper config|hyper-keybindings|hyper-visual|hyper-plugins|hyper-themes)' "$TRANSCRIPT_PATH" 2>/dev/null; then
  echo '{"ok":false,"reason":"This session involved Hyper configuration. Consider capturing any learnings to the plugin cache."}'
  exit 0
fi

echo '{"ok":true}'
exit 0
