#!/usr/bin/env bash
# verify-wezterm-backup.sh
# PreToolUse hook that blocks Edit/Write on .wezterm.lua files unless a dated backup exists
#
# Input: JSON with tool parameters on stdin (file_path in tool_input)
# Output: Exit 0 to allow, exit 2 to block (with message on stderr)

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from tool_input using portable parsing
# Try jq first, fall back to grep patterns
if command -v jq &>/dev/null; then
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
else
    # Fallback: extract file_path with sed (more portable than grep -oP)
    FILE_PATH=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
fi

# If no file_path found, allow (not a file operation we care about)
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Normalize path for comparison (handle Windows paths)
NORMALIZED_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g' | tr '[:upper:]' '[:lower:]')

# Check if this is a WezTerm config file
if [[ ! "$NORMALIZED_PATH" =~ \.wezterm\.lua$ ]]; then
    # Not a WezTerm config file, allow
    exit 0
fi

# Determine the actual config file location
# Expand ~ and handle common locations
if [[ "$FILE_PATH" == ~* ]]; then
    WEZTERM_CONFIG="${FILE_PATH/#\~/$HOME}"
else
    WEZTERM_CONFIG="$FILE_PATH"
fi

# Convert Windows path to Unix path if needed (Git Bash/MSYS)
if [[ "$WEZTERM_CONFIG" =~ ^[A-Za-z]: ]]; then
    WEZTERM_CONFIG=$(cygpath -u "$WEZTERM_CONFIG" 2>/dev/null || echo "$WEZTERM_CONFIG")
fi

# Get today's date in YYYY-MM-DD format
TODAY=$(date +%Y-%m-%d)

# Check for backup with today's date
# Look for patterns like: .wezterm.lua.bak.2024-01-15 or .wezterm.lua.2024-01-15.bak
BACKUP_DIR=$(dirname "$WEZTERM_CONFIG")
BACKUP_BASE=$(basename "$WEZTERM_CONFIG")

# Search for backup files with today's date
BACKUP_FOUND=false
for pattern in "${BACKUP_BASE}.bak.${TODAY}" "${BACKUP_BASE}.${TODAY}.bak" "${BACKUP_BASE}.backup.${TODAY}"; do
    if [[ -f "${BACKUP_DIR}/${pattern}" ]]; then
        BACKUP_FOUND=true
        break
    fi
done

if [[ "$BACKUP_FOUND" == "true" ]]; then
    # Backup exists, allow the edit
    exit 0
else
    # No backup found, block and provide instructions (stderr for exit code 2)
    echo "BLOCKED: No backup found for today ($TODAY)." >&2
    echo "" >&2
    echo "Before editing WezTerm config, create a backup:" >&2
    echo "" >&2
    echo "  cp \"$WEZTERM_CONFIG\" \"${WEZTERM_CONFIG}.bak.${TODAY}\"" >&2
    echo "" >&2
    echo "Then retry your edit." >&2
    exit 2
fi
