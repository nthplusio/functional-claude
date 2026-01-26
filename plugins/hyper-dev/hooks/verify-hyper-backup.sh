#!/usr/bin/env bash
# verify-hyper-backup.sh
# PreToolUse hook that blocks Edit/Write on .hyper.js files unless a dated backup exists
#
# Input: JSON with tool parameters on stdin (file_path for Edit/Write)
# Output: Exit 0 to allow, exit 1 to block (with message on stdout)

set -euo pipefail

# Read JSON input from stdin
INPUT=$(cat)

# Extract file_path from the JSON
FILE_PATH=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

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
    # No backup found, block and provide instructions
    echo "BLOCKED: No backup found for today ($TODAY)."
    echo ""
    echo "Before editing Hyper config, create a backup:"
    echo ""
    echo "  cp \"$HYPER_CONFIG\" \"${HYPER_CONFIG}.bak.${TODAY}\""
    echo ""
    echo "Then retry your edit."
    exit 1
fi
