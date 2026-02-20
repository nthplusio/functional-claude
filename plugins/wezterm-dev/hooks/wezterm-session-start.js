#!/usr/bin/env node
// wezterm-session-start.js
// SessionStart hook that detects WezTerm version and config
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
    // Detect WezTerm version and installation
    const weztermInfo = detectWeztermVersion();

    // Build summary message
    const parts = [];

    if (weztermInfo.version) {
      parts.push(`WezTerm ${weztermInfo.version}`);
    } else if (weztermInfo.config_path) {
      parts.push('WezTerm ready');
    } else {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[wezterm-dev] ${parts.join(', ')}`
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect WezTerm version using multiple methods
 */
function detectWeztermVersion() {
  const result = {
    version: null,
    method: 'none',
    config_path: null
  };

  // Find config file
  const configPaths = getWeztermConfigPaths();
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      result.config_path = configPath;
      break;
    }
  }

  // Method 1: Try CLI command
  try {
    const output = execFileSync('wezterm', ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    const versionMatch = output.match(/wezterm\s+(\d{8}-\d{6}-[a-f0-9]+|\d+\.\d+\.\d+)/i);
    if (versionMatch) {
      result.version = versionMatch[1];
      result.method = 'cli';
      return result;
    }
  } catch (e) {
    // CLI not available
  }

  // Method 2: Check common installation paths
  const platform = process.platform;

  if (platform === 'darwin') {
    const appPaths = [
      '/Applications/WezTerm.app/Contents/Info.plist',
      `${process.env.HOME}/Applications/WezTerm.app/Contents/Info.plist`
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
  } else if (platform === 'linux') {
    const appPaths = [
      '/usr/bin/wezterm',
      '/usr/local/bin/wezterm',
      `${process.env.HOME}/.local/bin/wezterm`
    ];

    for (const appPath of appPaths) {
      if (fs.existsSync(appPath)) {
        result.method = 'app_found';
        break;
      }
    }
  }

  return result;
}

/**
 * Get platform-specific WezTerm config paths
 */
function getWeztermConfigPaths() {
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'win32') {
    return [
      path.join(home, '.wezterm.lua'),
      path.join(home, '.config', 'wezterm', 'wezterm.lua')
    ];
  } else {
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return [
      path.join(home, '.wezterm.lua'),
      path.join(configHome, 'wezterm', 'wezterm.lua')
    ];
  }
}
