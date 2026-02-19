#!/usr/bin/env node
// plugin-dev-session-start.js
// SessionStart hook that detects plugin development context
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

    // Detect plugin development context
    const pluginInfo = detectPluginContext(projectDir);

    // Build summary message
    const parts = [];

    if (pluginInfo.isMarketplace) {
      parts.push(`Marketplace (${pluginInfo.pluginCount} plugins)`);
    } else if (pluginInfo.isPluginProject) {
      parts.push('Plugin project detected');
    } else {
      parts.push('Plugin dev ready');
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[claude-plugin-dev] ${parts.join(', ')}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect plugin development context
 */
function detectPluginContext(projectDir) {
  const result = {
    isPluginProject: false,
    isMarketplace: false,
    pluginCount: 0
  };

  // Check for marketplace.json (indicates this is a marketplace repo)
  const marketplacePath = path.join(projectDir, '.claude-plugin', 'marketplace.json');
  if (fs.existsSync(marketplacePath)) {
    result.isMarketplace = true;
    try {
      const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
      if (marketplace.plugins && Array.isArray(marketplace.plugins)) {
        result.pluginCount = marketplace.plugins.length;
      }
    } catch (e) {
      // Can't parse marketplace.json
    }
  }

  // Check for plugin.json (indicates this is a plugin)
  const pluginJsonPath = path.join(projectDir, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    result.isPluginProject = true;
  }

  // Check for plugins directory (marketplace structure)
  const pluginsDir = path.join(projectDir, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    try {
      const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginJson = path.join(pluginsDir, entry.name, '.claude-plugin', 'plugin.json');
          if (fs.existsSync(pluginJson)) {
            result.isPluginProject = true;
            if (!result.isMarketplace) {
              result.pluginCount++;
            }
          }
        }
      }
    } catch (e) {
      // Can't read plugins directory
    }
  }

  return result;
}
