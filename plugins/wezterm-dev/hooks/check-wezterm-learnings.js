#!/usr/bin/env node
// Check if session involved WezTerm config work and prompt for learnings capture
// JavaScript version of check-wezterm-learnings.sh

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
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Read transcript and check for WezTerm-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');
    const weztermPattern = /wezterm\.lua|\.wezterm|wezterm-dev|wezterm config|wezterm-keybindings|wezterm-visual|wezterm-tabs/i;

    if (weztermPattern.test(transcript)) {
      console.log(JSON.stringify({
        ok: false,
        reason: "This session involved WezTerm configuration. Consider capturing any learnings to the plugin cache."
      }));
      process.exit(0);
    }

    console.log(JSON.stringify({ ok: true }));
    process.exit(0);

  } catch (err) {
    // On any error, return ok to avoid blocking
    console.log(JSON.stringify({ ok: true }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
});
