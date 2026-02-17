#!/usr/bin/env node
// session-insights-session-start.js
// SessionStart hook: quick data availability check (~2s).
// Counts lines in history.jsonl, counts project dirs and session files.
// Output: JSON with systemMessage containing data summary.

const fs = require('fs');
const path = require('path');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const claudeDir = path.join(home, '.claude');
    const historyPath = path.join(claudeDir, 'history.jsonl');
    const projectsDir = path.join(claudeDir, 'projects');

    // Check if Claude data exists
    if (!fs.existsSync(claudeDir)) {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[session-insights] No session data found. This plugin requires Claude Code conversation history.'
      }));
      return;
    }

    // Count messages in history.jsonl (fast line count)
    let messageCount = 0;
    if (fs.existsSync(historyPath)) {
      try {
        const content = fs.readFileSync(historyPath, 'utf8');
        // Count non-empty lines
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.trim()) messageCount++;
        }
      } catch (e) {
        // Fall back to 0
      }
    }

    // Count projects and sessions
    let projectCount = 0;
    let sessionCount = 0;
    if (fs.existsSync(projectsDir)) {
      try {
        const dirs = fs.readdirSync(projectsDir);
        for (const dir of dirs) {
          const dirPath = path.join(projectsDir, dir);
          try {
            if (fs.statSync(dirPath).isDirectory()) {
              projectCount++;
              const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jsonl'));
              sessionCount += files.length;
            }
          } catch (e) {
            // Skip unreadable dirs
          }
        }
      } catch (e) {
        // Fall back to 0
      }
    }

    if (messageCount === 0 && sessionCount === 0) {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[session-insights] No session data found. This plugin requires Claude Code conversation history.'
      }));
      return;
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[session-insights] ${messageCount} messages across ${sessionCount} sessions in ${projectCount} projects. Use /session-review to analyze.`
    }));

  } catch (err) {
    // Fail open — don't block session start
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});
