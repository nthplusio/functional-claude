#!/usr/bin/env node
// plugin-dev-session-start.js
// SessionStart hook: silent — marketplace context is in CLAUDE.md,
// plugin status available via /plugin-status.

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
