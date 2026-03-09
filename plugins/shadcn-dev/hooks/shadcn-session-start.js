#!/usr/bin/env node
// shadcn-session-start.js
// SessionStart hook that detects shadcn/ui setup in the project
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

    // Detect shadcn/ui setup in project
    const shadcnInfo = detectShadcnSetup(projectDir);

    if (!shadcnInfo.detected) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // Build status message
    const parts = [];

    if (shadcnInfo.style) {
      parts.push(`shadcn/ui (${shadcnInfo.style})`);
    } else {
      parts.push('shadcn/ui ready');
    }

    if (shadcnInfo.installedComponents.length > 0) {
      const compWord = shadcnInfo.installedComponents.length === 1 ? 'component' : 'components';
      parts.push(`${shadcnInfo.installedComponents.length} ${compWord}`);
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[shadcn-dev] ${parts.join(', ')}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect shadcn/ui setup in project
 */
function detectShadcnSetup(projectDir) {
  const result = {
    detected: false,
    style: null,
    baseColor: null,
    componentsPath: null,
    configPath: null,
    installedComponents: []
  };

  const configPaths = [
    path.join(projectDir, 'components.json'),
    path.join(projectDir, 'src', 'components.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      result.configPath = configPath;
      result.detected = true;

      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        result.style = config.style || null;
        result.baseColor = config.tailwind?.baseColor || null;

        if (config.aliases?.components) {
          const alias = config.aliases.components;
          if (alias.startsWith('@/')) {
            result.componentsPath = path.join(projectDir, alias.slice(2));
          } else {
            result.componentsPath = path.join(projectDir, alias);
          }
        }
      } catch (e) {
        // Config exists but can't be parsed
      }
      break;
    }
  }

  if (result.componentsPath) {
    const uiPath = path.join(result.componentsPath, 'ui');
    if (fs.existsSync(uiPath)) {
      try {
        const files = fs.readdirSync(uiPath);
        result.installedComponents = files
          .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'))
          .map(f => f.replace(/\.(tsx|jsx)$/, ''));
      } catch (e) {
        // Can't read directory
      }
    }
  }

  return result;
}
