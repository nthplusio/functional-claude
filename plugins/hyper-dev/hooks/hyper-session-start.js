#!/usr/bin/env node
// hyper-session-start.js
// SessionStart hook that detects Hyper version and installed plugins
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing version info

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    // Detect Hyper version and installation
    const hyperInfo = detectHyperVersion();

    // Find installed plugins from config
    const installedPlugins = findInstalledPlugins(hyperInfo.config_path);

    // Build summary message
    const parts = [];

    if (hyperInfo.version) {
      parts.push(`Hyper ${hyperInfo.version}`);
    } else if (hyperInfo.config_path) {
      parts.push('Hyper ready');
    } else {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    if (installedPlugins.length > 0) {
      const pluginWord = installedPlugins.length === 1 ? 'plugin' : 'plugins';
      parts.push(`${installedPlugins.length} ${pluginWord}`);
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[hyper-dev] ${parts.join(', ')}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
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
    const output = execFileSync('hyper', ['--version'], {
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
    const appDataLocal = process.env.LOCALAPPDATA || '';
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

    const pluginsMatch = content.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
    if (pluginsMatch) {
      const pluginsContent = pluginsMatch[1];
      const plugins = [];

      const stringMatches = pluginsContent.matchAll(/['"]([^'"]+)['"]/g);
      for (const match of stringMatches) {
        plugins.push(match[1]);
      }

      return plugins;
    }

    return [];
  } catch (e) {
    return [];
  }
}
