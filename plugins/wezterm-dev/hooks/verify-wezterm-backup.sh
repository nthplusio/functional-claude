#!/usr/bin/env bash
# verify-wezterm-backup.sh
# PreToolUse hook that blocks Edit/Write on .wezterm.lua files unless a dated backup exists
#
# Input: JSON with tool parameters on stdin (file_path for Edit/Write)
# Output: Exit 0 to allow, exit 1 to block (with message on stdout)

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from the JSON
# Handle both Edit (file_path) and Write (file_path) tools
FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

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
    # No backup found, block and provide instructions
    echo "BLOCKED: No backup found for today ($TODAY)."
    echo ""
    echo "Before editing WezTerm config, create a backup:"
    echo ""
    echo "  cp \"$WEZTERM_CONFIG\" \"${WEZTERM_CONFIG}.bak.${TODAY}\""
    echo ""
    echo "Then retry your edit."
    exit 1
fi
