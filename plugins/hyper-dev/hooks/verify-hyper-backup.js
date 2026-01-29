#!/usr/bin/env node
// verify-hyper-backup.js
// PreToolUse hook that blocks Edit/Write on .hyper.js files unless a dated backup exists
//
// Input: JSON with tool parameters on stdin (file_path in tool_input)
// Output: JSON response - {"permissionDecision": "allow"} or {"permissionDecision": "deny", "reason": "..."}

const fs = require('fs');
const path = require('path');
const os = require('os');

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
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Normalize path for comparison (handle Windows paths)
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    // Check if this is a Hyper config file
    if (!normalizedPath.endsWith('.hyper.js')) {
      // Not a Hyper config file, allow
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Determine the actual config file location
    let hyperConfig = filePath;

    // Expand ~ to home directory
    if (hyperConfig.startsWith('~')) {
      hyperConfig = hyperConfig.replace(/^~/, os.homedir());
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check for backup with today's date
    const backupDir = path.dirname(hyperConfig);
    const backupBase = path.basename(hyperConfig);

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
      // Backup exists, allow the edit
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    } else {
      // No backup found, block and provide instructions
      const reason = `BLOCKED: No backup found for today (${today}).

Before editing Hyper config, create a backup:

  cp "${hyperConfig}" "${hyperConfig}.bak.${today}"

Then retry your edit.`;

      console.log(JSON.stringify({ permissionDecision: "deny", reason: reason }));
      process.exit(0);
    }

  } catch (err) {
    // On any error, allow to avoid blocking unexpectedly
    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
});
