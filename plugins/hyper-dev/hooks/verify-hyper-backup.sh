#!/usr/bin/env bash
# verify-hyper-backup.sh
# PreToolUse hook that blocks Edit/Write on .hyper.js files unless a dated backup exists
#
# Input: JSON with tool parameters on stdin (file_path in tool_input)
# Output: Exit 0 to allow, exit 2 to block (with message on stderr)

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from tool_input using portable parsing
# Try jq first, fall back to sed (more portable than grep -oP)
if command -v jq &>/dev/null; then
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
else
    # Fallback: extract file_path with sed (works on macOS and Linux)
    FILE_PATH=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
fi

# If no file_path found, allow (not a file operation we care about)
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Normalize path for comparison (handle Windows paths)
NORMALIZED_PATH=$(echo "$FILE_PATH" | sed 's|\\|/|g' | tr '[:upper:]' '[:lower:]')

# Check if this is a Hyper config file
if [[ ! "$NORMALIZED_PATH" =~ \.hyper\.js$ ]]; then
    # Not a Hyper config file, allow
    exit 0
fi

# Determine the actual config file location
if [[ "$FILE_PATH" == ~* ]]; then
    HYPER_CONFIG="${FILE_PATH/#\~/$HOME}"
else
    HYPER_CONFIG="$FILE_PATH"
fi

# Convert Windows path to Unix path if needed (Git Bash/MSYS)
if [[ "$HYPER_CONFIG" =~ ^[A-Za-z]: ]]; then
    HYPER_CONFIG=$(cygpath -u "$HYPER_CONFIG" 2>/dev/null || echo "$HYPER_CONFIG")
fi

# Get today's date in YYYY-MM-DD format
TODAY=$(date +%Y-%m-%d)

# Check for backup with today's date
BACKUP_DIR=$(dirname "$HYPER_CONFIG")
BACKUP_BASE=$(basename "$HYPER_CONFIG")

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
    echo "Before editing Hyper config, create a backup:" >&2
    echo "" >&2
    echo "  cp \"$HYPER_CONFIG\" \"${HYPER_CONFIG}.bak.${TODAY}\"" >&2
    echo "" >&2
    echo "Then retry your edit." >&2
    exit 2
fi
