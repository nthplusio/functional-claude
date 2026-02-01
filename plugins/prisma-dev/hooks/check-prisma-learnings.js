#!/usr/bin/env node
// Check if session involved Prisma work and prompt for learnings capture
// Enhanced pattern matching for:
// - Successful Patterns
// - Mistakes to Avoid
// - Schema Patterns
// - Query Optimizations

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
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Read transcript and check for Prisma-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Schema file and models
      schema: /schema\.prisma|prisma\/schema|model\s+\w+\s*\{|@id|@unique|@default|@@index|@@unique|@@map/i,

      // Skill names
      skills: /prisma-dev|prisma-schema|prisma-queries|prisma-migrations|prisma-recon|prisma-troubleshoot/i,

      // Client and queries
      queries: /PrismaClient|@prisma\/client|findMany|findUnique|findFirst|findFirstOrThrow|findUniqueOrThrow|createMany|updateMany|deleteMany|upsert|aggregate|groupBy|count/i,

      // Relations and joins
      relations: /@relation|include\s*:|select\s*:|_count|connect|disconnect|set|connectOrCreate/i,

      // Migrations
      migrations: /prisma\s+migrate|migration\s+\w+|prisma\s+db\s+push|prisma\s+db\s+pull|migrate\s+dev|migrate\s+deploy|migrate\s+reset|migrate\s+status/i,

      // Raw queries and transactions
      rawQueries: /\$queryRaw|\$executeRaw|\$transaction|interactive\s+transaction/i,

      // Error codes
      errors: /P1\d{3}|P2\d{3}|P3\d{3}|prisma.*error|PrismaClientKnownRequestError|PrismaClientValidationError/i,

      // Generation and introspection
      generation: /prisma\s+generate|prisma\s+studio|prisma\s+format|prisma\s+validate|prisma\s+init/i,

      // Connection and configuration
      connection: /DATABASE_URL|datasource\s+db|provider\s*=|prisma.*connection|connection\s+pool/i,

      // General mentions
      general: /\bprisma\s*(orm|client|schema|model|query)\b/i
    };

    // Check if any pattern matches
    let matched = false;
    const matchedCategories = [];

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(transcript)) {
        matched = true;
        matchedCategories.push(category);
      }
    }

    if (matched) {
      // Build contextual message based on what was detected
      let reason = "This session involved Prisma work";

      if (matchedCategories.includes('migrations')) {
        reason += " (migrations)";
      } else if (matchedCategories.includes('schema') || matchedCategories.includes('relations')) {
        reason += " (schema design)";
      } else if (matchedCategories.includes('queries') || matchedCategories.includes('rawQueries')) {
        reason += " (queries and data access)";
      } else if (matchedCategories.includes('errors')) {
        reason += " (error handling)";
      } else if (matchedCategories.includes('connection')) {
        reason += " (connection configuration)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Working schema designs or queries\n";
      reason += "- Mistakes to Avoid: Errors encountered and solutions\n";
      reason += "- Schema Patterns: Reusable model/relation patterns\n";
      reason += "- Query Optimizations: Performance improvements";

      console.log(JSON.stringify({
        decision: "block",
        reason: reason
      }));
      process.exit(0);
    }

    console.log(JSON.stringify({}));
    process.exit(0);

  } catch (err) {
    // On any error, return ok to avoid blocking
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});
