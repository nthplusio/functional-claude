#!/bin/bash
# Check if session involved WezTerm config work and prompt for learnings capture

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

# Check if transcript contains WezTerm-related work
# Look for wezterm config file paths, wezterm skill usage, or wezterm keywords
if grep -qi -E '(wezterm\.lua|\.wezterm|wezterm-dev|wezterm config|wezterm-keybindings|wezterm-visual|wezterm-tabs)' "$TRANSCRIPT_PATH" 2>/dev/null; then
  echo '{"ok":false,"reason":"This session involved WezTerm configuration. Consider capturing any learnings to the plugin cache."}'
  exit 0
fi

echo '{"ok":true}'
exit 0
