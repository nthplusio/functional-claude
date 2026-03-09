#!/usr/bin/env node
// verify-tabby-backup.js
// PreToolUse hook that blocks Edit/Write on Tabby config files unless a dated backup exists
//
// Input: JSON with tool parameters on stdin (file_path in tool_input)
// Output: JSON response with hookSpecificOutput for PreToolUse

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Respond with PreToolUse decision using correct hook output format
 */
function respond(decision, reason = null) {
  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: decision
    }
  };
  if (reason) {
    response.hookSpecificOutput.permissionDecisionReason = reason;
  }
  console.log(JSON.stringify(response));
  process.exit(0);
}

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // Extract file_path from tool_input
    const filePath = data.tool_input?.file_path;

    // If no file_path found, allow (not a file operation we care about)
    if (!filePath) {
      respond("allow");
      return;
    }

    // Normalize path for comparison
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    // Check if this is a Tabby config file
    const isTabbyConfig = normalizedPath.includes('/tabby/config.yaml') ||
      normalizedPath.includes('\\tabby\\config.yaml') ||
      normalizedPath.endsWith('/tabby/config.yaml');

    if (!isTabbyConfig) {
      // Not a Tabby config file, allow
      respond("allow");
      return;
    }

    // Determine the actual config file location
    let tabbyConfig = filePath;

    // Expand ~ to home directory
    if (tabbyConfig.startsWith('~')) {
      tabbyConfig = tabbyConfig.replace(/^~/, os.homedir());
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check for backup with today's date
    const backupDir = path.dirname(tabbyConfig);
    const backupBase = path.basename(tabbyConfig);

    // Search for backup files with today's date
    const backupPatterns = [
      `${backupBase}.bak.${today}`,
      `${backupBase}.${today}.bak`,
      `${backupBase}.backup.${today}`
    ];

    let backupFound = false;

    for (const pattern of backupPatterns) {
      const backupPath = path.join(backupDir, pattern);
      if (fs.existsSync(backupPath)) {
        backupFound = true;
        break;
      }
    }

    if (backupFound) {
      respond("allow");
    } else {
      const reason = `BLOCKED: No backup found for today (${today}).

Before editing Tabby config, create a backup:

  cp "${tabbyConfig}" "${tabbyConfig}.bak.${today}"

Then retry your edit.`;

      respond("deny", reason);
    }

  } catch (err) {
    // On any error, allow to avoid blocking unexpectedly
    respond("allow");
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  respond("allow");
});
