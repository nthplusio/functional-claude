#!/usr/bin/env node
// session-insights-session-start.js
// SessionStart hook: silent — stats are available on-demand via /session-review.

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  console.log(JSON.stringify({ continue: true }));
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});
