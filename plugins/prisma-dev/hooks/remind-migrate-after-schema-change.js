#!/usr/bin/env node
// remind-migrate-after-schema-change.js
// PostToolUse hook that detects schema.prisma edits and reminds to run prisma migrate dev
//
// Input: JSON with tool_input on stdin (file_path from Write/Edit tool)
// Output: JSON with additionalContext for PostToolUse hooks

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    const filePath = data.tool_input?.file_path || '';
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    // Check if the edited file is a Prisma schema file
    if (!normalizedPath.endsWith('schema.prisma') && !normalizedPath.endsWith('.prisma')) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Schema was edited — remind about migration generation
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: [
          "[prisma-dev] schema.prisma was modified.",
          "NEXT STEP: Run `npx prisma migrate dev --name <description>` to create a versioned migration file.",
          "Do NOT use `prisma db push` — it bypasses the migration system and causes schema drift.",
          "Docker/CI/CD uses `prisma migrate deploy` which only runs committed migration files.",
          "The generated migration file must be committed to the repository alongside schema.prisma."
        ].join(" ")
      }
    }));
    process.exit(0);

  } catch (err) {
    // On error, silently allow
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});
