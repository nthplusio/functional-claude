#!/usr/bin/env node
// aggregate-stats.js
// Cross-session aggregate statistics from headers + sampling up to 20 sessions fully.
// Args: --project <dir-name> --after <ISO-date> --before <ISO-date>
// Output: JSON to stdout, errors to stderr.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const home = process.env.HOME || process.env.USERPROFILE || '';
const projectsDir = path.join(home, '.claude', 'projects');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { project: null, after: null, before: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' && args[i + 1]) result.project = args[++i];
    else if (args[i] === '--after' && args[i + 1]) result.after = new Date(args[++i]);
    else if (args[i] === '--before' && args[i + 1]) result.before = new Date(args[++i]);
  }

  return result;
}

async function analyzeSession(filePath) {
  const stats = {
    startTime: null,
    endTime: null,
    durationMinutes: 0,
    messageCount: { user: 0, assistant: 0 },
    model: null,
    toolUsage: {},
    totalTokens: { input: 0, output: 0 },
    errorCount: 0
  };

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
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

    if (entry.timestamp) {
      const ts = new Date(entry.timestamp);
      if (!stats.startTime || ts < new Date(stats.startTime)) stats.startTime = ts.toISOString();
      if (!stats.endTime || ts > new Date(stats.endTime)) stats.endTime = ts.toISOString();
    }

    if (entry.type === 'user') {
      stats.messageCount.user++;
    } else if (entry.type === 'assistant') {
      stats.messageCount.assistant++;

      if (entry.message?.model && !stats.model) {
        stats.model = entry.message.model;
      }

      if (entry.message?.usage) {
        const u = entry.message.usage;
        if (u.input_tokens) stats.totalTokens.input += u.input_tokens;
        if (u.output_tokens) stats.totalTokens.output += u.output_tokens;
      }

      if (entry.message?.content && Array.isArray(entry.message.content)) {
        for (const block of entry.message.content) {
          if (block.type === 'tool_use' && block.name) {
            stats.toolUsage[block.name] = (stats.toolUsage[block.name] || 0) + 1;
          }
        }
      }
    } else if (entry.type === 'tool_result' || entry.type === 'tool_output') {
      if (entry.is_error) stats.errorCount++;
    }
  }

  if (stats.startTime && stats.endTime) {
    stats.durationMinutes = Math.round((new Date(stats.endTime) - new Date(stats.startTime)) / 60000);
  }

  return stats;
}

async function main() {
  const args = parseArgs();

  if (!args.project) {
    process.stderr.write('Error: --project is required\n');
    process.stderr.write('Usage: aggregate-stats.js --project <dir-name> [--after <ISO-date>] [--before <ISO-date>]\n');
    process.exit(1);
  }

  const projectDir = path.join(projectsDir, args.project);

  if (!fs.existsSync(projectDir)) {
    process.stderr.write(`Error: project directory not found: ${projectDir}\n`);
    process.exit(1);
  }

  let files = fs.readdirSync(projectDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(projectDir, f));

  // Filter by date using file modification time as a rough proxy
  if (args.after || args.before) {
    files = files.filter(f => {
      const stat = fs.statSync(f);
      if (args.after && stat.mtimeMs < args.after.getTime()) return false;
      if (args.before && stat.mtimeMs > args.before.getTime()) return false;
      return true;
    });
  }

  // Sample up to 20 sessions
  const MAX_SAMPLE = 20;
  let sampledFiles = files;
  if (files.length > MAX_SAMPLE) {
    // Take evenly distributed sample
    const step = files.length / MAX_SAMPLE;
    sampledFiles = [];
    for (let i = 0; i < MAX_SAMPLE; i++) {
      sampledFiles.push(files[Math.floor(i * step)]);
    }
  }

  const aggregate = {
    sessionsTotal: files.length,
    sessionsAnalyzed: sampledFiles.length,
    totalDurationMinutes: 0,
    avgSessionDuration: 0,
    totalTokens: { input: 0, output: 0 },
    modelsUsed: {},
    toolUsage: {},
    topToolPatterns: [],
    sessionsByDayOfWeek: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    sessionsByHour: {},
    avgMessagesPerSession: 0,
    errorRate: 0
  };

  let totalUserMessages = 0;
  let totalAssistantMessages = 0;
  let totalErrors = 0;
  let totalToolCalls = 0;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize hours
  for (let h = 0; h < 24; h++) {
    aggregate.sessionsByHour[h] = 0;
  }

  for (const filePath of sampledFiles) {
    try {
      const stats = await analyzeSession(filePath);

      aggregate.totalDurationMinutes += stats.durationMinutes;
      aggregate.totalTokens.input += stats.totalTokens.input;
      aggregate.totalTokens.output += stats.totalTokens.output;
      totalUserMessages += stats.messageCount.user;
      totalAssistantMessages += stats.messageCount.assistant;
      totalErrors += stats.errorCount;

      if (stats.model) {
        aggregate.modelsUsed[stats.model] = (aggregate.modelsUsed[stats.model] || 0) + 1;
      }

      for (const [tool, count] of Object.entries(stats.toolUsage)) {
        aggregate.toolUsage[tool] = (aggregate.toolUsage[tool] || 0) + count;
        totalToolCalls += count;
      }

      // Track day of week and hour
      if (stats.startTime) {
        const dt = new Date(stats.startTime);
        const day = dayNames[dt.getDay()];
        aggregate.sessionsByDayOfWeek[day]++;
        aggregate.sessionsByHour[dt.getHours()]++;
      }
    } catch (e) {
      process.stderr.write(`Warning: could not analyze ${filePath}: ${e.message}\n`);
    }
  }

  // Calculate averages
  const n = sampledFiles.length || 1;
  aggregate.avgSessionDuration = Math.round(aggregate.totalDurationMinutes / n);
  aggregate.avgMessagesPerSession = Math.round((totalUserMessages + totalAssistantMessages) / n);
  aggregate.errorRate = totalToolCalls > 0
    ? Math.round((totalErrors / totalToolCalls) * 10000) / 100
    : 0;

  // Top tool patterns (sorted by usage)
  aggregate.topToolPatterns = Object.entries(aggregate.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tool, count]) => ({ tool, count, avgPerSession: Math.round((count / n) * 10) / 10 }));

  console.log(JSON.stringify(aggregate, null, 2));
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
