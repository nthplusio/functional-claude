#!/usr/bin/env node
// list-sessions.js
// List sessions for a project with metadata.
// Args: --project <dir-name> --after <ISO-date> --before <ISO-date> --limit <N>
// Stream-reads first/last lines of each .jsonl for timestamps, model, session metadata.
// Output: JSON array to stdout, errors to stderr.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const home = process.env.HOME || process.env.USERPROFILE || '';
const projectsDir = path.join(home, '.claude', 'projects');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { project: null, after: null, before: null, limit: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) result.project = args[++i];
    else if (args[i] === '--after' && args[i + 1]) result.after = new Date(args[++i]);
    else if (args[i] === '--before' && args[i + 1]) result.before = new Date(args[++i]);
    else if (args[i] === '--limit' && args[i + 1]) result.limit = parseInt(args[++i], 10);
  }

  return result;
}

async function extractSessionMetadata(filePath) {
  const sessionId = path.basename(filePath, '.jsonl');
  const meta = {
    sessionId,
    slug: sessionId.slice(0, 8),
    startTime: null,
    endTime: null,
    durationMinutes: null,
    messageCount: { user: 0, assistant: 0, progress: 0 },
    firstUserMessage: null,
    model: null,
    toolsUsed: new Set(),
    totalTokens: { input: 0, output: 0, cacheRead: 0 }
  };

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  let lineCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineCount++;

    try {
      const entry = JSON.parse(line);

      // Track timestamps
      if (entry.timestamp) {
        const ts = new Date(entry.timestamp);
        if (!meta.startTime || ts < new Date(meta.startTime)) {
          meta.startTime = ts.toISOString();
        }
        if (!meta.endTime || ts > new Date(meta.endTime)) {
          meta.endTime = ts.toISOString();
        }
      }

      // Count message types
      if (entry.type === 'user') {
        meta.messageCount.user++;
        if (!meta.firstUserMessage && entry.message) {
          const text = typeof entry.message === 'string'
            ? entry.message
            : (entry.message.content || '');
          const display = typeof text === 'string' ? text : JSON.stringify(text);
          meta.firstUserMessage = display.slice(0, 200);
        }
      } else if (entry.type === 'assistant') {
        meta.messageCount.assistant++;

        // Extract model
        if (entry.message && entry.message.model && !meta.model) {
          meta.model = entry.message.model;
        }

        // Extract token usage
        if (entry.message && entry.message.usage) {
          const u = entry.message.usage;
          if (u.input_tokens) meta.totalTokens.input += u.input_tokens;
          if (u.output_tokens) meta.totalTokens.output += u.output_tokens;
          if (u.cache_read_input_tokens) meta.totalTokens.cacheRead += u.cache_read_input_tokens;
        }

        // Extract tool usage
        if (entry.message && entry.message.content && Array.isArray(entry.message.content)) {
          for (const block of entry.message.content) {
            if (block.type === 'tool_use' && block.name) {
              meta.toolsUsed.add(block.name);
            }
          }
        }
      } else if (entry.type === 'progress') {
        meta.messageCount.progress++;
      }
    } catch (e) {
      // Skip malformed lines
    }
  }

  // Calculate duration
  if (meta.startTime && meta.endTime) {
    const durationMs = new Date(meta.endTime) - new Date(meta.startTime);
    meta.durationMinutes = Math.round(durationMs / 60000);
  }

  // Convert Set to Array
  meta.toolsUsed = Array.from(meta.toolsUsed);

  return meta;
}

async function main() {
  const args = parseArgs();

  if (!args.project) {
    process.stderr.write('Error: --project is required\n');
    process.stderr.write('Usage: list-sessions.js --project <dir-name> [--after <ISO-date>] [--before <ISO-date>] [--limit <N>]\n');
    process.exit(1);
  }

  const projectDir = path.join(projectsDir, args.project);

  if (!fs.existsSync(projectDir)) {
    process.stderr.write(`Error: project directory not found: ${projectDir}\n`);
    process.exit(1);
  }

  const files = fs.readdirSync(projectDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(projectDir, f));

  const results = [];

  for (const filePath of files) {
    try {
      const meta = await extractSessionMetadata(filePath);

      // Apply date filters
      if (args.after && meta.startTime && new Date(meta.startTime) < args.after) continue;
      if (args.before && meta.startTime && new Date(meta.startTime) > args.before) continue;

      results.push(meta);
    } catch (e) {
      process.stderr.write(`Warning: could not read ${filePath}: ${e.message}\n`);
    }
  }

  // Sort by start time descending (newest first)
  results.sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return new Date(b.startTime) - new Date(a.startTime);
  });

  // Apply limit
  const limited = args.limit ? results.slice(0, args.limit) : results;

  console.log(JSON.stringify(limited, null, 2));
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
