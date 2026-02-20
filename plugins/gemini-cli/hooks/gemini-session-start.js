#!/usr/bin/env node
// gemini-session-start.js
// SessionStart hook: silent — model policy and auth/version checks
// live in skill SKILL.md files and surface when the plugin is actually used.

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
