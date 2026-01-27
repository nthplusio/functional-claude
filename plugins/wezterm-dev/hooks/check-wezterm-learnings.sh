#!/bin/bash
# Check if session involved WezTerm config work and prompt for learnings capture
# Ensure we always exit 0 - any error should just return ok:true
set +e

# Trap any unexpected exit to ensure we return valid JSON
trap 'echo "{\"ok\":true}"; exit 0' ERR EXIT

# Read JSON input from stdin (with fallback)
INPUT=$(cat 2>/dev/null || echo '{}')

# Check if stop_hook_active is true (already continuing from a stop hook)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | grep -o '"stop_hook_active":[^,}]*' 2>/dev/null | grep -o 'true\|false' 2>/dev/null || echo "")
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  trap - ERR EXIT
  echo '{"ok":true}'
  exit 0
fi

# Get transcript path from input (with fallback)
TRANSCRIPT_PATH=$(echo "$INPUT" | grep -o '"transcript_path":"[^"]*"' 2>/dev/null | cut -d'"' -f4 2>/dev/null || echo "")

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  trap - ERR EXIT
  echo '{"ok":true}'
  exit 0
fi

# Check if transcript contains WezTerm-related work
if grep -qi -E '(wezterm\.lua|\.wezterm|wezterm-dev|wezterm config|wezterm-keybindings|wezterm-visual|wezterm-tabs)' "$TRANSCRIPT_PATH" 2>/dev/null; then
  trap - ERR EXIT
  echo '{"ok":false,"reason":"This session involved WezTerm configuration. Consider capturing any learnings to the plugin cache."}'
  exit 0
fi

trap - ERR EXIT
echo '{"ok":true}'
exit 0
