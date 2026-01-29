#!/usr/bin/env node
// hyper-session-start.js
// SessionStart hook that detects Hyper version and refreshes cache
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing version and cache status

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input || '{}');
    const projectDir = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const configCachePath = path.join(cacheDir, 'hyper-config.json');
    const docsIndexPath = path.join(cacheDir, 'docs-index.json');
    const ecosystemPath = path.join(cacheDir, 'plugin-ecosystem.json');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect Hyper version and installation
    const hyperInfo = detectHyperVersion();

    // Check if we have a cached config
    let cachedConfig = null;
    if (fs.existsSync(configCachePath)) {
      try {
        cachedConfig = JSON.parse(fs.readFileSync(configCachePath, 'utf8'));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Check if version changed or cache is stale (>24h)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const needsRefresh = !cachedConfig ||
      cachedConfig.detected_version !== hyperInfo.version ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Find installed plugins from config
    const installedPlugins = findInstalledPlugins(hyperInfo.config_path);

    // Update config cache
    const newConfig = {
      detected_version: hyperInfo.version,
      detection_method: hyperInfo.method,
      detection_timestamp: now.toISOString(),
      config_path: hyperInfo.config_path,
      installed_plugins: installedPlugins
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

    // Update docs index timestamp
    if (docsNeedRefresh) {
      fs.writeFileSync(docsIndexPath, JSON.stringify({
        last_refresh: today,
        sources: [
          { name: 'hyper-website', url: 'https://hyper.is/', type: 'webfetch' },
          { name: 'github-releases', url: 'https://github.com/vercel/hyper/releases', type: 'webfetch' },
          { name: 'xterm-js', library_id: '/xtermjs/xterm.js', type: 'context7' },
          { name: 'electron', library_id: '/websites/electronjs', type: 'context7' }
        ]
      }, null, 2));
    }

    // Check if plugin ecosystem needs refresh (weekly)
    let ecosystemNeedsRefresh = true;
    if (fs.existsSync(ecosystemPath)) {
      try {
        const ecosystem = JSON.parse(fs.readFileSync(ecosystemPath, 'utf8'));
        const lastRefresh = new Date(ecosystem.last_refresh);
        const daysSinceRefresh = (now - lastRefresh) / (24 * 60 * 60 * 1000);
        if (daysSinceRefresh < 7) {
          ecosystemNeedsRefresh = false;
        }
      } catch (e) {
        // Needs refresh
      }
    }

    // Trigger plugin indexer if needed (async, don't block)
    if (ecosystemNeedsRefresh) {
      const indexerPath = path.join(pluginRoot, 'hooks', 'lib', 'plugin-indexer.js');
      if (fs.existsSync(indexerPath)) {
        try {
          // Run indexer asynchronously
          require(indexerPath).refreshIndex(cacheDir).catch(() => {});
        } catch (e) {
          // Indexer not available yet, skip
        }
      }
    }

    // Build summary message
    const parts = [];

    if (hyperInfo.version) {
      parts.push(`Hyper ${hyperInfo.version} detected`);
    } else {
      parts.push('Hyper version not detected');
    }

    if (installedPlugins.length > 0) {
      parts.push(`${installedPlugins.length} plugins installed`);
    }

    if (docsNeedRefresh) {
      parts.push('docs cache refreshed');
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[hyper-dev] ${parts.join(', ')}`
    }));
    process.exit(0);

  } catch (err) {
    // On any error, continue without blocking
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
});

/**
 * Detect Hyper version using multiple methods
 */
function detectHyperVersion() {
  const result = {
    version: null,
    method: 'none',
    config_path: null
  };

  // Find config file
  const configPaths = getHyperConfigPaths();
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      result.config_path = configPath;
      break;
    }
  }

  // Method 1: Try CLI command
  try {
    const output = execSync('hyper --version', {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      result.version = versionMatch[1];
      result.method = 'cli';
      return result;
    }
  } catch (e) {
    // CLI not available
  }

  // Method 2: Check app installation path (platform-specific)
  const platform = process.platform;

  if (platform === 'darwin') {
    // macOS: Check app bundle
    const appPaths = [
      '/Applications/Hyper.app/Contents/Info.plist',
      `${process.env.HOME}/Applications/Hyper.app/Contents/Info.plist`
    ];

    for (const appPath of appPaths) {
      if (fs.existsSync(appPath)) {
        try {
          const plist = fs.readFileSync(appPath, 'utf8');
          const versionMatch = plist.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
          if (versionMatch) {
            result.version = versionMatch[1];
            result.method = 'app_bundle';
            return result;
          }
        } catch (e) {
          // Can't read plist
        }
      }
    }
  } else if (platform === 'win32') {
    // Windows: Check common installation paths
    const appDataLocal = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';

    const appPaths = [
      path.join(appDataLocal, 'hyper', 'app-*', 'Hyper.exe'),
      path.join(programFiles, 'Hyper', 'Hyper.exe')
    ];

    // For Windows, try to find version from app directory name
    const hyperAppDir = path.join(appDataLocal, 'hyper');
    if (fs.existsSync(hyperAppDir)) {
      try {
        const dirs = fs.readdirSync(hyperAppDir);
        const appDir = dirs.find(d => d.startsWith('app-'));
        if (appDir) {
          const versionMatch = appDir.match(/app-(\d+\.\d+\.\d+)/);
          if (versionMatch) {
            result.version = versionMatch[1];
            result.method = 'app_directory';
            return result;
          }
        }
      } catch (e) {
        // Can't read directory
      }
    }
  } else if (platform === 'linux') {
    // Linux: Check common paths and package managers
    const appPaths = [
      '/usr/share/hyper/resources/app/package.json',
      '/opt/Hyper/resources/app/package.json',
      `${process.env.HOME}/.local/share/hyper/resources/app/package.json`
    ];

    for (const appPath of appPaths) {
      if (fs.existsSync(appPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(appPath, 'utf8'));
          if (pkg.version) {
            result.version = pkg.version;
            result.method = 'package_json';
            return result;
          }
        } catch (e) {
          // Can't read package.json
        }
      }
    }
  }

  return result;
}

/**
 * Get platform-specific Hyper config paths
 */
function getHyperConfigPaths() {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return [
      path.join(home, '.hyper.js'),
      path.join(home, 'Library', 'Application Support', 'Hyper', '.hyper.js')
    ];
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    return [
      path.join(appData, 'Hyper', '.hyper.js'),
      path.join(home, '.hyper.js')
    ];
  } else {
    // Linux
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return [
      path.join(home, '.hyper.js'),
      path.join(configHome, 'Hyper', '.hyper.js')
    ];
  }
}

/**
 * Find installed plugins from config file
 */
function findInstalledPlugins(configPath) {
  if (!configPath || !fs.existsSync(configPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');

    // Extract plugins array
    const pluginsMatch = content.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
    if (pluginsMatch) {
      const pluginsContent = pluginsMatch[1];
      const plugins = [];

      // Match quoted strings
      const stringMatches = pluginsContent.matchAll(/['"]([^'"]+)['"]/g);
      for (const match of stringMatches) {
        plugins.push(match[1]);
      }

      return plugins;
    }

    // Also check localPlugins
    const localMatch = content.match(/localPlugins\s*:\s*\[([\s\S]*?)\]/);
    if (localMatch) {
      const localContent = localMatch[1];
      const stringMatches = localContent.matchAll(/['"]([^'"]+)['"]/g);
      for (const match of stringMatches) {
        // Add with prefix to distinguish
        // Not adding these to main list for now
      }
    }

    return [];
  } catch (e) {
    return [];
  }
}
