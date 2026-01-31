#!/usr/bin/env node
// check-pre-push.js
// PreToolUse hook that runs typecheck, lint, and test checks before git push
//
// Reads configuration from ${CLAUDE_PROJECT_DIR}/.claude/pre-commit.json
// Runs enabled checks and blocks push if any "block" mode checks fail
//
// Input: JSON with tool_input on stdin (command for Bash tool)
// Output: JSON response - {"permissionDecision": "allow"} or {"permissionDecision": "deny", "reason": "..."}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const projectDir = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const command = data.tool_input?.command || '';

    // Only check git push commands
    if (!command.match(/git\s+push/)) {
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Check for config file
    const configPath = path.join(projectDir, '.claude', 'pre-commit.json');
    if (!fs.existsSync(configPath)) {
      // No config, allow push (not configured)
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Read config
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      // Invalid config, allow but warn
      console.log(JSON.stringify({
        permissionDecision: "allow",
        reason: "Warning: Could not parse .claude/pre-commit.json"
      }));
      process.exit(0);
    }

    const checks = config.checks || {};
    const checkOrder = ['typecheck', 'lint', 'build', 'test'];
    const failures = [];
    const warnings = [];

    for (const checkName of checkOrder) {
      const check = checks[checkName];
      if (!check || !check.enabled || !check.command) {
        continue;
      }

      try {
        // Run the check command
        execSync(check.command, {
          cwd: projectDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 300000 // 5 minute timeout per check
        });
        // Check passed
      } catch (err) {
        // Check failed
        const output = (err.stdout || '') + (err.stderr || '');
        const truncatedOutput = output.length > 1000
          ? output.substring(0, 1000) + '\n... (truncated)'
          : output;

        if (check.mode === 'block') {
          failures.push({
            name: checkName,
            command: check.command,
            output: truncatedOutput
          });
        } else {
          // warn mode
          warnings.push({
            name: checkName,
            command: check.command,
            output: truncatedOutput
          });
        }
      }
    }

    // If there are blocking failures, deny the push
    if (failures.length > 0) {
      const failureMessages = failures.map(f => {
        return `## ${f.name} failed

Command: ${f.command}

\`\`\`
${f.output}
\`\`\``;
      }).join('\n\n');

      const warningMessages = warnings.length > 0
        ? '\n\n## Warnings (non-blocking)\n\n' + warnings.map(w => `- ${w.name}: ${w.command}`).join('\n')
        : '';

      const reason = `Pre-push checks failed. Fix the following issues before pushing:

${failureMessages}${warningMessages}

Run the failing commands locally to see full output and fix the issues.`;

      console.log(JSON.stringify({ permissionDecision: "deny", reason }));
      process.exit(0);
    }

    // If there are only warnings, allow but include them
    if (warnings.length > 0) {
      const warningMessages = warnings.map(w => `- ${w.name}: ${w.command} (failed)`).join('\n');
      console.log(JSON.stringify({
        permissionDecision: "allow",
        reason: `Pre-push warnings (non-blocking):\n${warningMessages}`
      }));
      process.exit(0);
    }

    // All checks passed
    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);

  } catch (err) {
    // On any error, allow to avoid blocking
    console.log(JSON.stringify({
      permissionDecision: "allow",
      reason: `Pre-commit hook error: ${err.message}`
    }));
    process.exit(0);
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
});
