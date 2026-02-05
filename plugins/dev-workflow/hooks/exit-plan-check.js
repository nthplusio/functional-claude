#!/usr/bin/env node
// exit-plan-check.js
// PreToolUse hook that suggests running gut-check before exiting plan mode
//
// This is a non-blocking prompt - it allows the action but adds a suggestion
// to consider running the dev-gutcheck agent for thorough validation.

const fs = require('fs');
const path = require('path');

function respond(decision, reason = null) {
  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: decision
    }
  };
  if (reason) {
    response.hookSpecificOutput.permissionDecisionReason = reason;
  }
  console.log(JSON.stringify(response));
  process.exit(0);
}

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // This hook matches ExitPlanMode - we know it's a plan approval
    // Add a helpful suggestion via stderr (shown to Claude but doesn't block)
    const suggestion = `
[dev-workflow] Plan ready for approval.

💡 Consider running the dev-gutcheck agent for thorough validation:
   - Checks problem/solution alignment
   - Validates scope appropriateness
   - Reviews technical assumptions
   - Identifies risks and gaps

To run: "gut check this plan" or continue with approval.
`.trim();

    // Output suggestion to stderr (visible to Claude as context)
    console.error(suggestion);

    // Allow the action - this is informational, not blocking
    respond("allow");

  } catch (err) {
    // On error, allow to avoid blocking
    respond("allow");
  }
});

process.stdin.on('error', () => {
  respond("allow");
});
