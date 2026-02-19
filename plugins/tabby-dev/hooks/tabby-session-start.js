#!/usr/bin/env node
// tabby-session-start.js
// SessionStart hook that detects Tabby version and refreshes cache
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing version and cache status

const fs = require('fs');
const path = require('path');
const https = require('https');
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
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const configCachePath = path.join(cacheDir, 'tabby-config.json');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect Tabby version and installation
    const tabbyInfo = detectTabbyVersion();

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
    const needsConfigRefresh = !cachedConfig ||
      cachedConfig.detected_version !== tabbyInfo.version ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Count SSH and serial connections from config
    const connections = countConnections(tabbyInfo.config_path);

    // Update config cache
    const newConfig = {
      detected_version: tabbyInfo.version,
      detection_method: tabbyInfo.method,
      detection_timestamp: now.toISOString(),
      config_path: tabbyInfo.config_path,
      ssh_connections: connections.ssh,
      serial_connections: connections.serial,
      installed_plugins: connections.plugins
    };

    fs.writeFileSync(configCachePath, JSON.stringify(newConfig, null, 2));

    // Build summary message
    const parts = [];

    if (tabbyInfo.version) {
      parts.push(`Tabby ${tabbyInfo.version}`);
    } else if (tabbyInfo.config_path) {
      parts.push('Tabby ready');
    } else {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[tabby-dev] No Tabby config found'
      }));
      process.exit(0);
    }

    // Only mention connections if there are any
    if (connections.ssh > 0) {
      const word = connections.ssh === 1 ? 'SSH profile' : 'SSH profiles';
      parts.push(`${connections.ssh} ${word}`);
    }
    if (connections.serial > 0) {
      const word = connections.serial === 1 ? 'serial profile' : 'serial profiles';
      parts.push(`${connections.serial} ${word}`);
    }

    let systemMessage = `[tabby-dev] ${parts.join(', ')}`;

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
 * Detect Tabby version using multiple methods
 */
function detectTabbyVersion() {
  const result = {
    version: null,
    method: 'none',
    config_path: null
  };

  // Find config file
  const configPaths = getTabbyConfigPaths();
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      result.config_path = configPath;
      break;
    }
  }

  // Method 1: Try CLI command
  try {
    const output = execSync('tabby --version', {
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
      '/Applications/Tabby.app/Contents/Info.plist',
      `${process.env.HOME}/Applications/Tabby.app/Contents/Info.plist`
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
    const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';

    // Check common Windows installation paths
    const tabbyDirs = [
      path.join(appDataLocal, 'Programs', 'Tabby'),
      path.join(programFiles, 'Tabby')
    ];

    for (const dir of tabbyDirs) {
      if (fs.existsSync(dir)) {
        try {
          // Try to find version from package.json in resources
          const pkgPath = path.join(dir, 'resources', 'app', 'package.json');
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.version) {
              result.version = pkg.version;
              result.method = 'package_json';
              return result;
            }
          }
        } catch (e) {
          // Can't read version
        }
      }
    }
  } else if (platform === 'linux') {
    const appPaths = [
      '/usr/share/tabby/resources/app/package.json',
      '/opt/Tabby/resources/app/package.json',
      `${process.env.HOME}/.local/share/tabby/resources/app/package.json`
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
 * Get platform-specific Tabby config paths
 */
function getTabbyConfigPaths() {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return [
      path.join(home, '.config', 'tabby', 'config.yaml'),
      path.join(home, 'Library', 'Application Support', 'tabby', 'config.yaml')
    ];
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    return [
      path.join(appData, 'tabby', 'config.yaml'),
      path.join(home, '.config', 'tabby', 'config.yaml')
    ];
  } else {
    // Linux
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return [
      path.join(configHome, 'tabby', 'config.yaml'),
      path.join(home, '.config', 'tabby', 'config.yaml')
    ];
  }
}

/**
 * Count SSH and serial connections from config file
 */
function countConnections(configPath) {
  const result = { ssh: 0, serial: 0, plugins: [] };

  if (!configPath || !fs.existsSync(configPath)) {
    return result;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf8');

    // Count SSH connections (look for host: entries under ssh.connections)
    const sshMatches = content.match(/^\s+-\s+name:\s+/gm);
    // More precise: count entries in ssh connections section
    const sshSection = content.match(/ssh:\s*\n\s+connections:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (sshSection) {
      const sshNames = sshSection[1].match(/^\s+-\s*name:/gm);
      result.ssh = sshNames ? sshNames.length : 0;
    }

    // Count serial connections
    const serialSection = content.match(/serial:\s*\n\s+connections:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (serialSection) {
      const serialNames = serialSection[1].match(/^\s+-\s*name:/gm);
      result.serial = serialNames ? serialNames.length : 0;
    }

    // Extract plugin names
    const pluginsSection = content.match(/plugins:\s*\n([\s\S]*?)(?=\n\w|\n$|$)/);
    if (pluginsSection) {
      const pluginNames = pluginsSection[1].matchAll(/name:\s*["']?([^"'\n]+)["']?/g);
      for (const match of pluginNames) {
        result.plugins.push(match[1].trim());
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  return result;
}
