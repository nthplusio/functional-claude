#!/usr/bin/env node
// plugin-dev-session-start.js
// SessionStart hook that detects plugin development context and spawns background cache refresh
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing status
//
// This script outputs JSON and exits immediately. Cache refresh runs in a detached
// background process (plugin-dev-cache-refresh.js) to avoid blocking session startup.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const projectDir = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const configCachePath = path.join(cacheDir, 'plugin-dev-config.json');
    const docsIndexPath = path.join(cacheDir, 'docs-index.json');
    const learningsPath = path.join(cacheDir, 'learnings.md');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect plugin development context
    const pluginInfo = detectPluginContext(projectDir);

    // Check if we have a cached config
    let cachedConfig = null;
    if (fs.existsSync(configCachePath)) {
      try {
        cachedConfig = JSON.parse(fs.readFileSync(configCachePath, 'utf8'));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Check if config changed or cache is stale (>24h)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const needsRefresh = !cachedConfig ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Update config cache
    const newConfig = {
      is_plugin_project: pluginInfo.isPluginProject,
      is_marketplace: pluginInfo.isMarketplace,
      plugin_count: pluginInfo.pluginCount,
      detection_timestamp: now.toISOString()
    };

    fs.writeFileSync(configCachePath, JSON.stringify(newConfig, null, 2));

    // Check docs index for staleness
    let docsNeedRefresh = true;
    if (fs.existsSync(docsIndexPath)) {
      try {
        const docsIndex = JSON.parse(fs.readFileSync(docsIndexPath, 'utf8'));
        if (docsIndex.last_refresh === today) {
          docsNeedRefresh = false;
        }
      } catch (e) {
        // Needs refresh
      }
    }

    // Spawn background cache refresh if needed (non-blocking)
    if (docsNeedRefresh) {
      // Update docs index immediately
      fs.writeFileSync(docsIndexPath, JSON.stringify({
        last_refresh: today,
        sources: [
          { name: 'claude-code-plugins', url: 'https://code.claude.com/docs/en/plugins-reference', type: 'webfetch' }
        ]
      }, null, 2));

      // Spawn detached background process for slow cache refresh
      const backgroundScript = path.join(__dirname, 'plugin-dev-cache-refresh.js');
      const child = spawn(process.execPath, [backgroundScript, cacheDir, today, learningsPath], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.unref(); // Allow parent to exit independently
    }

    // Build summary message - positive framing, minimal noise
    const parts = [];

    if (pluginInfo.isMarketplace) {
      parts.push(`Marketplace (${pluginInfo.pluginCount} plugins)`);
    } else if (pluginInfo.isPluginProject) {
      parts.push('Plugin project detected');
    } else {
      parts.push('Plugin dev ready');
    }

    // Build system message
    let systemMessage = `[claude-plugin-dev] ${parts.join(', ')}`;

    // Output response immediately and exit
    console.log(JSON.stringify({
      continue: true,
      systemMessage: systemMessage
    }));

  } catch (err) {
    // On any error, continue without blocking
    console.log(JSON.stringify({ continue: true }));
  }
});

// Handle stdin errors gracefully
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
