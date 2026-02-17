#!/usr/bin/env node
// extract-history.js
// Parse history.jsonl for high-level index of Claude Code usage.
// Args: --project <real-path> --after <ISO-date> --before <ISO-date> --limit <N>
// Output: JSON to stdout, errors to stderr.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const home = process.env.HOME || process.env.USERPROFILE || '';
const historyPath = path.join(home, '.claude', 'history.jsonl');

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

async function main() {
  const args = parseArgs();

  if (!fs.existsSync(historyPath)) {
    console.log(JSON.stringify({
      totalMessages: 0,
      uniqueSessions: 0,
      uniqueProjects: 0,
      dateRange: { earliest: null, latest: null },
      projectSummary: [],
      recentMessages: [],
      activityByDay: {}
    }));
    return;
  }

  const sessions = new Set();
  const projects = new Map(); // project -> { count, sessions }
  const activityByDay = {};
  const messages = [];
  let earliest = null;
  let latest = null;
  let totalMessages = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(historyPath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      continue;
    }

    // Apply project filter
    if (args.project && entry.project !== args.project) continue;

    // Apply date filters
    if (entry.timestamp) {
      const ts = new Date(entry.timestamp);
      if (args.after && ts < args.after) continue;
      if (args.before && ts > args.before) continue;

      if (!earliest || ts < new Date(earliest)) earliest = ts.toISOString();
      if (!latest || ts > new Date(latest)) latest = ts.toISOString();

      // Track activity by day
      const day = ts.toISOString().slice(0, 10);
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    }

    totalMessages++;

    if (entry.sessionId) {
      sessions.add(entry.sessionId);
    }

    if (entry.project) {
      if (!projects.has(entry.project)) {
        projects.set(entry.project, { count: 0, sessions: new Set() });
      }
      const proj = projects.get(entry.project);
      proj.count++;
      if (entry.sessionId) proj.sessions.add(entry.sessionId);
    }

    // Collect messages for recent list
    messages.push({
      display: entry.display ? entry.display.slice(0, 200) : null,
      sessionId: entry.sessionId || null,
      project: entry.project || null,
      timestamp: entry.timestamp || null
    });
  }

  // Build project summary
  const projectSummary = Array.from(projects.entries())
    .map(([project, data]) => ({
      project,
      messageCount: data.count,
      sessionCount: data.sessions.size
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  // Get recent messages (last N or limited)
  const limit = args.limit || 20;
  const recentMessages = messages.slice(-limit).reverse();

  console.log(JSON.stringify({
    totalMessages,
    uniqueSessions: sessions.size,
    uniqueProjects: projects.size,
    dateRange: { earliest, latest },
    projectSummary,
    recentMessages,
    activityByDay
  }, null, 2));
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
