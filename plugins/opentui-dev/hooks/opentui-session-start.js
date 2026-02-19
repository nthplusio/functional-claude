#!/usr/bin/env node
// opentui-session-start.js
// SessionStart hook that detects OpenTUI setup in the project
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing status

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
    const projectDir = data.cwd || process.cwd();

    // Detect OpenTUI setup in project
    const opentuiInfo = detectOpentuiSetup(projectDir);

    // Build summary message
    const parts = [];

    if (opentuiInfo.detected) {
      if (opentuiInfo.framework) {
        parts.push(`OpenTUI (${opentuiInfo.framework})`);
      } else {
        parts.push('OpenTUI ready');
      }

      if (opentuiInfo.version) {
        parts.push(`v${opentuiInfo.version}`);
      }
    } else {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[opentui-dev] No OpenTUI detected'
      }));
      return;
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[opentui-dev] ${parts.join(', ')}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect OpenTUI setup in project
 */
function detectOpentuiSetup(projectDir) {
  const result = {
    detected: false,
    framework: null,
    version: null
  };

  const packageJsonPath = path.join(projectDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['@opentui/react']) {
        result.detected = true;
        result.framework = 'React';
        result.version = deps['@opentui/react'].replace(/^[\^~]/, '');
      } else if (deps['@opentui/solid']) {
        result.detected = true;
        result.framework = 'Solid';
        result.version = deps['@opentui/solid'].replace(/^[\^~]/, '');
      } else if (deps['@opentui/core']) {
        result.detected = true;
        result.framework = 'Core';
        result.version = deps['@opentui/core'].replace(/^[\^~]/, '');
      }
    } catch (e) {
      // Can't parse package.json
    }
  }

  return result;
}
