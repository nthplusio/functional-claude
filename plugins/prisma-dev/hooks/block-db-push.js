#!/bin/sh
":" //; export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
":" //; command -v node >/dev/null 2>&1 || { [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" 2>/dev/null; }
":" //; exec node "$0" "$@"
// block-db-push.js
// PreToolUse hook that intercepts `prisma db push` Bash commands on projects with
// existing migration history and blocks them to prevent schema drift.
//
// Allows db push only when no prisma/migrations/ directory exists (initial prototyping).
//
// Input: JSON with tool_input on stdin (command from Bash tool)
// Output: JSON with permissionDecision for PreToolUse hooks

const fs = require('fs');
const path = require('path');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // Only handle Bash tool
    const command = data.tool_input?.command || '';

    // Check if this command includes prisma db push
    const isDbPush = /prisma\s+db\s+push/i.test(command);

    if (!isDbPush) {
      console.log(JSON.stringify({ permissionDecision: 'allow' }));
      process.exit(0);
    }

    // Check if the project has existing migrations
    const cwd = data.cwd || process.cwd();

    // Check standard migration locations
    const migrationDirs = [
      path.join(cwd, 'prisma', 'migrations'),
      path.join(cwd, 'src', 'prisma', 'migrations'),
      path.join(cwd, 'db', 'migrations')
    ];

    let hasMigrations = false;
    for (const dir of migrationDirs) {
      if (fs.existsSync(dir)) {
        const entries = fs.readdirSync(dir).filter(f => /^\d+/.test(f));
        if (entries.length > 0) {
          hasMigrations = true;
          break;
        }
      }
    }

    if (!hasMigrations) {
      // No migration history yet — allow db push (initial prototyping is fine)
      console.log(JSON.stringify({ permissionDecision: 'allow' }));
      process.exit(0);
    }

    // Project has migration history — block db push
    const reason = `BLOCKED: \`prisma db push\` is not allowed on projects with existing migration history.

db push bypasses the migration system. Any changes it applies will NOT be seen by
\`prisma migrate deploy\` — the command used in Docker, CI/CD, and staging environments.
This causes schema drift across environments.

Use instead:
  npx prisma migrate dev --name <description>

This creates a versioned migration file that:
- Can be committed to version control alongside schema.prisma
- Runs automatically in all environments via \`prisma migrate deploy\`
- Keeps the database schema synchronized across dev, staging, and production

If you need to explore schema changes before committing:
  npx prisma migrate dev --create-only --name <description>
  # Review and edit the generated SQL, then apply with:
  npx prisma migrate dev`;

    console.log(JSON.stringify({ permissionDecision: 'deny', reason }));
    process.exit(0);

  } catch (err) {
    // On any error, allow to avoid unexpectedly blocking
    console.log(JSON.stringify({ permissionDecision: 'allow' }));
    process.exit(0);
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ permissionDecision: 'allow' }));
  process.exit(0);
});
