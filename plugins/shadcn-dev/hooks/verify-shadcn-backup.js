#!/usr/bin/env node
// verify-shadcn-backup.js
// PreToolUse hook that blocks Edit/Write on shadcn config files unless a dated backup exists
//
// Protected files:
// - components.json (shadcn configuration)
// - tailwind.config.* (Tailwind configuration)
//
// Input: JSON with tool parameters on stdin (file_path in tool_input)
// Output: JSON response - {"permissionDecision": "allow"} or {"permissionDecision": "deny", "reason": "..."}

const fs = require('fs');
const path = require('path');

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
    const fileName = path.basename(normalizedPath);

    // Check if this is a protected config file
    const isComponentsJson = fileName === 'components.json';
    const isTailwindConfig = /^tailwind\.config\.(js|ts|mjs|cjs)$/.test(fileName);

    if (!isComponentsJson && !isTailwindConfig) {
      // Not a protected file, allow
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get the directory and actual file name (preserving case)
    const actualPath = filePath;
    const backupDir = path.dirname(actualPath);
    const backupBase = path.basename(actualPath);

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
      const fileType = isComponentsJson ? 'shadcn configuration' : 'Tailwind configuration';
      const reason = `BLOCKED: No backup found for today (${today}).

Before editing ${fileType}, create a backup:

  cp "${actualPath}" "${actualPath}.bak.${today}"

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
