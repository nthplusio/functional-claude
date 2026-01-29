#!/usr/bin/env node
// Check if session involved Prisma work and prompt for learnings capture

const fs = require('fs');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // Check if stop_hook_active is true (already continuing from a stop hook)
    if (data.stop_hook_active === true) {
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Read transcript and check for Prisma-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');
    // Match: config files, skill names, client API, migrations, schema terms
    const prismaPattern = /schema\.prisma|prisma-dev|prisma-schema|prisma-queries|prisma-migrations|prisma-recon|PrismaClient|@prisma\/client|prisma\s+migrate|prisma\s+db\s+push|prisma\s+generate|findMany|findUnique|findFirst|createMany|updateMany|deleteMany|upsert|\$transaction|\$queryRaw|\$executeRaw|@@index|@@unique|@@id|@relation|prisma\s+studio/i;

    if (prismaPattern.test(transcript)) {
      console.log(JSON.stringify({
        ok: false,
        reason: "This session involved Prisma development. Consider capturing any learnings to the plugin cache."
      }));
      process.exit(0);
    }

    console.log(JSON.stringify({ ok: true }));
    process.exit(0);

  } catch (err) {
    // On any error, return ok to avoid blocking
    console.log(JSON.stringify({ ok: true }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
});
