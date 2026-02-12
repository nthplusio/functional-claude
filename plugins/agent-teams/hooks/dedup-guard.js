#!/usr/bin/env node
// dedup-guard.js
// PreToolUse hook that prevents duplicate team creation and teammate spawning
//
// Detects tool type from tool_input shape:
// - team_name present + NO prompt → TeamCreate (check for existing team)
// - team_name + name + prompt → Task teammate spawn (check for existing member)
// - Anything else → allow immediately
//
// Input: JSON with tool_input on stdin
// Output: JSON response with hookSpecificOutput wrapper for PreToolUse hooks

const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to output proper hook response format
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
    const toolInput = data.tool_input || {};

    const teamName = toolInput.team_name;
    const name = toolInput.name;
    const prompt = toolInput.prompt;

    // Detect tool type from input shape
    if (!teamName) {
      // No team_name — not a team operation, allow
      respond("allow");
    }

    const isTeamCreate = teamName && !prompt;
    const isTeammateSpawn = teamName && name && prompt;

    if (!isTeamCreate && !isTeammateSpawn) {
      // Unrecognized shape, allow
      respond("allow");
    }

    const configPath = path.join(os.homedir(), '.claude', 'teams', teamName, 'config.json');

    if (isTeamCreate) {
      // TeamCreate guard: check if team already exists
      if (!fs.existsSync(configPath)) {
        respond("allow");
      }

      // Team exists — read config for details
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const memberCount = Array.isArray(config.members) ? config.members.length : 0;
        const memberNames = Array.isArray(config.members)
          ? config.members.map(m => m.name).join(', ')
          : 'unknown';

        respond("deny",
          `Team "${teamName}" already exists with ${memberCount} member(s): ${memberNames}\n\n` +
          `To resolve:\n` +
          `  1. Use the existing team — send messages to teammates with SendMessage\n` +
          `  2. Delete first — use TeamDelete to remove the team, then recreate\n` +
          `  3. Rename — use a different team_name for the new team`
        );
      } catch (e) {
        // Config exists but can't read — still deny with basic message
        respond("deny",
          `Team "${teamName}" already exists (config found at ${configPath}).\n\n` +
          `To resolve:\n` +
          `  1. Use the existing team\n` +
          `  2. Delete first with TeamDelete, then recreate\n` +
          `  3. Use a different team_name`
        );
      }
    }

    if (isTeammateSpawn) {
      // Task teammate guard: check if member name already registered
      if (!fs.existsSync(configPath)) {
        // Team doesn't exist yet — allow (TeamCreate will happen first)
        respond("allow");
      }

      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const members = Array.isArray(config.members) ? config.members : [];

        // Case-insensitive name match
        const duplicate = members.find(
          m => m.name && m.name.toLowerCase() === name.toLowerCase()
        );

        if (!duplicate) {
          respond("allow");
        }

        respond("deny",
          `Teammate "${name}" already exists in team "${teamName}"\n\n` +
          `Existing member: ${duplicate.name} (type: ${duplicate.agentType || 'unknown'})\n\n` +
          `To resolve:\n` +
          `  1. Message them — use SendMessage to assign new work to the existing teammate\n` +
          `  2. Replace — send a shutdown_request to "${duplicate.name}", wait for shutdown, then spawn again\n` +
          `  3. Rename — spawn with a different name (e.g., "${name}-2")`
        );
      } catch (e) {
        // Can't read config, allow to avoid blocking
        respond("allow");
      }
    }

    // Fallthrough — should not reach here, but allow just in case
    respond("allow");

  } catch (err) {
    // On any error, allow to avoid blocking legitimate operations
    respond("allow");
  }
});

process.stdin.on('error', () => {
  respond("allow");
});
