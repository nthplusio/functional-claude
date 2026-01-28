#!/usr/bin/env node
// block-manual-migration.js
// PreToolUse hook that blocks manual creation of migration files in prisma/migrations/
// Forces use of 'prisma migrate dev' for proper migration management
//
// Input: JSON with tool parameters on stdin (file_path in tool_input)
// Output: JSON response - {"decision": "allow"} or {"decision": "block", "reason": "..."}

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
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    // Normalize path for comparison (handle Windows and Unix paths)
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    // Check if this is in a prisma/migrations directory
    if (!normalizedPath.includes('prisma/migrations/') && !normalizedPath.includes('prisma\\migrations\\')) {
      // Not a migrations directory, allow
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    // Get the filename
    const fileName = path.basename(filePath).toLowerCase();

    // Allow certain non-migration files
    const allowedFiles = [
      'readme.md',
      'readme',
      '.gitkeep',
      '.gitignore'
    ];

    if (allowedFiles.includes(fileName)) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }

    // Block .sql files and migration_lock.toml
    const blockedPatterns = [
      /\.sql$/i,
      /^migration_lock\.toml$/i
    ];

    const isBlocked = blockedPatterns.some(pattern => pattern.test(fileName));

    if (isBlocked) {
      const reason = `BLOCKED: Manual migration file creation detected.

Do not manually create files in prisma/migrations/. Use the Prisma CLI instead:

  npx prisma migrate dev --name descriptive_migration_name

This ensures:
- Proper migration history tracking
- Correct migration_lock.toml updates
- Database schema synchronization

After running the command, the migration will be created automatically.
The command is interactive and will prompt for a migration name if not provided.`;

      console.log(JSON.stringify({ decision: "block", reason: reason }));
      process.exit(0);
    }

    // Allow other files (like subdirectory READMEs)
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);

  } catch (err) {
    // On any error, allow to avoid blocking unexpectedly
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ decision: "allow" }));
  process.exit(0);
});
