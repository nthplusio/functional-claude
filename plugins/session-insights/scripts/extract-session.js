#!/usr/bin/env node
// extract-session.js
// Structured summary from a single session JSONL file.
// Args: --file <path> --detail <low|medium|high>
// Stream-reads full session, builds turn-by-turn structured summary.
// - low: User messages + assistant text summaries only (~2-5KB)
// - medium: + tool usage summary + errors + files modified (~5-30KB)
// - high: Full conversation flow with truncated tool inputs/outputs (~30-100KB)
// Output: JSON to stdout, errors to stderr.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { file: null, detail: 'medium' };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) result.file = args[++i];
    else if (args[i] === '--detail' && args[i + 1]) result.detail = args[++i];
  }

  return result;
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (typeof str !== 'string') str = JSON.stringify(str);
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

async function main() {
  const args = parseArgs();

  if (!args.file) {
    process.stderr.write('Error: --file is required\n');
    process.stderr.write('Usage: extract-session.js --file <path> [--detail <low|medium|high>]\n');
    process.exit(1);
  }

  if (!fs.existsSync(args.file)) {
    process.stderr.write(`Error: file not found: ${args.file}\n`);
    process.exit(1);
  }

  const detail = args.detail;
  const MSG_TRUNCATE = detail === 'high' ? 500 : 200;
  const TOOL_INPUT_TRUNCATE = detail === 'high' ? 500 : 100;
  const TOOL_OUTPUT_TRUNCATE = detail === 'high' ? 500 : 100;

  const result = {
    sessionId: path.basename(args.file, '.jsonl'),
    project: null,
    startTime: null,
    endTime: null,
    durationMinutes: null,
    model: null,
    version: null,
    gitBranch: null,
    tokenUsage: { input: 0, output: 0, cacheRead: 0 },
    turns: [],
    toolUsageSummary: {},
    filesCreated: [],
    filesModified: [],
    errors: [],
    keyTopics: []
  };

  const toolUsageCounts = {};
  const filesCreatedSet = new Set();
  const filesModifiedSet = new Set();
  const topicWords = {};

  let currentTurn = null;
  let turnIndex = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(args.file, { encoding: 'utf8' }),
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

    // Track timestamps
    if (entry.timestamp) {
      const ts = new Date(entry.timestamp);
      if (!result.startTime || ts < new Date(result.startTime)) {
        result.startTime = ts.toISOString();
      }
      if (!result.endTime || ts > new Date(result.endTime)) {
        result.endTime = ts.toISOString();
      }
    }

    // Extract project from session context
    if (entry.project && !result.project) {
      result.project = entry.project;
    }

    if (entry.type === 'user') {
      // Start a new turn
      turnIndex++;
      const text = typeof entry.message === 'string'
        ? entry.message
        : (entry.message?.content || '');
      const display = typeof text === 'string' ? text : JSON.stringify(text);

      currentTurn = {
        turn: turnIndex,
        timestamp: entry.timestamp || null,
        userMessage: truncate(display, MSG_TRUNCATE),
        assistantSummary: null,
        toolCalls: [],
        errors: []
      };
      result.turns.push(currentTurn);

      // Track topic words from user messages
      const words = display.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      for (const w of words) {
        topicWords[w] = (topicWords[w] || 0) + 1;
      }

    } else if (entry.type === 'assistant') {
      // Extract model
      if (entry.message?.model && !result.model) {
        result.model = entry.message.model;
      }

      // Extract token usage
      if (entry.message?.usage) {
        const u = entry.message.usage;
        if (u.input_tokens) result.tokenUsage.input += u.input_tokens;
        if (u.output_tokens) result.tokenUsage.output += u.output_tokens;
        if (u.cache_read_input_tokens) result.tokenUsage.cacheRead += u.cache_read_input_tokens;
      }

      // Process content blocks
      if (entry.message?.content && Array.isArray(entry.message.content)) {
        let textParts = [];
        let toolCalls = [];

        for (const block of entry.message.content) {
          if (block.type === 'text' && block.text) {
            textParts.push(block.text);
          } else if (block.type === 'tool_use') {
            const toolName = block.name || 'unknown';

            // Count tool usage
            toolUsageCounts[toolName] = (toolUsageCounts[toolName] || 0) + 1;

            // Track file operations
            if (block.input) {
              const filePath = block.input.file_path || block.input.path || block.input.command;
              if (toolName === 'Write' && block.input.file_path) {
                filesCreatedSet.add(block.input.file_path);
              } else if (toolName === 'Edit' && block.input.file_path) {
                filesModifiedSet.add(block.input.file_path);
              }
            }

            if (detail !== 'low') {
              const toolCall = { tool: toolName };
              if (detail === 'high' && block.input) {
                toolCall.input = truncate(JSON.stringify(block.input), TOOL_INPUT_TRUNCATE);
              }
              toolCalls.push(toolCall);
            }
          }
        }

        if (currentTurn) {
          const assistantText = textParts.join('\n');
          currentTurn.assistantSummary = truncate(assistantText, MSG_TRUNCATE);
          if (detail !== 'low') {
            currentTurn.toolCalls = toolCalls;
          }
        }
      }
    } else if (entry.type === 'tool_result' || entry.type === 'tool_output') {
      // Track tool results for errors
      if (entry.is_error && currentTurn) {
        const errorMsg = typeof entry.content === 'string'
          ? entry.content
          : JSON.stringify(entry.content);
        currentTurn.errors.push(truncate(errorMsg, MSG_TRUNCATE));
        result.errors.push({
          turn: turnIndex,
          error: truncate(errorMsg, MSG_TRUNCATE)
        });
      }

      // Track tool output in high detail mode
      if (detail === 'high' && currentTurn && currentTurn.toolCalls.length > 0) {
        const lastTool = currentTurn.toolCalls[currentTurn.toolCalls.length - 1];
        if (!lastTool.output) {
          const content = typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content);
          lastTool.output = truncate(content, TOOL_OUTPUT_TRUNCATE);
        }
      }
    } else if (entry.type === 'file-history-snapshot') {
      // Track git branch if available
      if (entry.gitBranch && !result.gitBranch) {
        result.gitBranch = entry.gitBranch;
      }
    }
  }

  // Calculate duration
  if (result.startTime && result.endTime) {
    const durationMs = new Date(result.endTime) - new Date(result.startTime);
    result.durationMinutes = Math.round(durationMs / 60000);
  }

  // Build tool usage summary
  result.toolUsageSummary = toolUsageCounts;

  // Build file lists
  result.filesCreated = Array.from(filesCreatedSet);
  result.filesModified = Array.from(filesModifiedSet);

  // Extract key topics (top 10 most frequent meaningful words)
  result.keyTopics = Object.entries(topicWords)
    .filter(([word]) => !['about', 'would', 'should', 'could', 'these', 'those', 'their',
      'there', 'where', 'which', 'while', 'after', 'before', 'between', 'through',
      'under', 'other', 'every', 'still', 'might', 'being', 'using', 'please'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Clean up turns: remove empty error arrays in low detail
  if (detail === 'low') {
    for (const turn of result.turns) {
      delete turn.toolCalls;
      delete turn.errors;
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
