#!/usr/bin/env node
// wezterm-session-start.js
// SessionStart hook that detects WezTerm version and refreshes cache
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
    const projectDir = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const configCachePath = path.join(cacheDir, 'wezterm-config.json');
    const docsIndexPath = path.join(cacheDir, 'docs-index.json');
    const learningsPath = path.join(cacheDir, 'learnings.md');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect WezTerm version and installation
    const weztermInfo = detectWeztermVersion();

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
      cachedConfig.detected_version !== weztermInfo.version ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Update config cache
    const newConfig = {
      detected_version: weztermInfo.version,
      detection_method: weztermInfo.method,
      detection_timestamp: now.toISOString(),
      config_path: weztermInfo.config_path
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

    // Update docs index and fetch documentation content
    let refreshPromise = null;
    if (docsNeedRefresh) {
      fs.writeFileSync(docsIndexPath, JSON.stringify({
        last_refresh: today,
        sources: [
          { name: 'wezterm-docs', url: 'https://wezfurlong.org/wezterm/', type: 'webfetch' },
          { name: 'wezterm-config', url: 'https://wezfurlong.org/wezterm/config/files.html', type: 'webfetch' },
          { name: 'wezterm-lua', url: 'https://wezfurlong.org/wezterm/config/lua/wezterm/', type: 'webfetch' }
        ]
      }, null, 2));

      // Fetch and cache documentation (runs in background, we wait before exit)
      refreshPromise = refreshLearningsCache(cacheDir, today, learningsPath).catch(() => {});
    }

    // Build summary message - positive framing, minimal noise
    const parts = [];

    if (weztermInfo.version) {
      parts.push(`WezTerm ${weztermInfo.version}`);
    } else if (weztermInfo.config_path) {
      parts.push('WezTerm ready');
    } else {
      // No config found at all
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[wezterm-dev] No WezTerm config found'
      }));
      process.exit(0);
    }

    // Output response immediately (doesn't block Claude)
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[wezterm-dev] ${parts.join(', ')}`
    }));

    // Wait for cache refresh to complete before exiting
    if (refreshPromise) {
      await refreshPromise;
    }

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
    const output = execSync('wezterm --version', {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    // Parse version from output like "wezterm 20230712-072601-f4abf8fd"
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
    // macOS: Check app bundle
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
  } else if (platform === 'win32') {
    // Windows: Check common installation paths
    const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';

    // Try to find wezterm installation
    const appPaths = [
      path.join(programFiles, 'WezTerm', 'wezterm.exe'),
      path.join(programFiles, 'WezTerm', 'wezterm-gui.exe')
    ];

    for (const appPath of appPaths) {
      if (fs.existsSync(appPath)) {
        result.method = 'app_found';
        // Can't easily get version from exe, but we know it's installed
        break;
      }
    }
  } else if (platform === 'linux') {
    // Linux: Check common paths
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
    // macOS and Linux
    const configHome = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    return [
      path.join(home, '.wezterm.lua'),
      path.join(configHome, 'wezterm', 'wezterm.lua')
    ];
  }
}

/**
 * Fetch URL content with timeout
 */
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract text content from HTML (basic extraction)
 */
function extractTextFromHtml(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove HTML tags but keep content
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Fetch and cache WezTerm documentation
 */
async function refreshLearningsCache(cacheDir, today, learningsPath) {
  // Read existing learnings to preserve them
  let existingLearnings = '';
  let existingSettings = {
    auto_refresh: true,
    capture_learnings: true
  };
  let learningsCount = 0;

  if (fs.existsSync(learningsPath)) {
    try {
      const content = fs.readFileSync(learningsPath, 'utf8');

      // Extract settings from frontmatter
      const settingsMatch = content.match(/settings:\s*\n([\s\S]*?)(?=---|\n\n)/);
      if (settingsMatch) {
        const autoRefreshMatch = settingsMatch[1].match(/auto_refresh:\s*(true|false)/);
        const captureLearningsMatch = settingsMatch[1].match(/capture_learnings:\s*(true|false)/);
        if (autoRefreshMatch) existingSettings.auto_refresh = autoRefreshMatch[1] === 'true';
        if (captureLearningsMatch) existingSettings.capture_learnings = captureLearningsMatch[1] === 'true';
      }

      // Check if auto_refresh is disabled
      if (!existingSettings.auto_refresh) {
        return; // Don't refresh if disabled
      }

      // Extract existing learnings section
      const learningsMatch = content.match(/## Learnings\s*([\s\S]*?)$/);
      if (learningsMatch) {
        existingLearnings = learningsMatch[1].trim();
        // Count learnings entries
        const entryMatches = existingLearnings.match(/- \[\d{4}-\d{2}-\d{2}\]/g);
        learningsCount = entryMatches ? entryMatches.length : 0;
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  // Fetch documentation from sources
  const docSections = [];

  // Fetch main docs page
  try {
    const docsHtml = await fetchUrl('https://wezfurlong.org/wezterm/');
    const text = extractTextFromHtml(docsHtml);

    if (text.length > 100) {
      const snippet = text.slice(0, 600).replace(/\s+/g, ' ');
      docSections.push(`### Overview (fetched)\n\n${snippet}...`);
    }
  } catch (e) {
    // Skip on error
  }

  // Add static reference (always available)
  docSections.push(`### Quick Reference

**Config File Locations:**
- Windows: \`~/.wezterm.lua\`
- macOS/Linux: \`~/.wezterm.lua\` or \`~/.config/wezterm/wezterm.lua\`

**Basic Config Structure:**
\`\`\`lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- Your config here
config.font = wezterm.font('JetBrains Mono')
config.color_scheme = 'Catppuccin Mocha'

return config
\`\`\`

**Keybinding Format:**
\`\`\`lua
config.leader = { key = 'a', mods = 'CTRL', timeout_milliseconds = 1000 }
config.keys = {
  { key = '|', mods = 'LEADER', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },
  { key = '-', mods = 'LEADER', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
}
\`\`\`

**Common Actions:**
- \`SplitHorizontal\`, \`SplitVertical\` - Split panes
- \`ActivatePaneDirection\` - Move between panes
- \`AdjustPaneSize\` - Resize panes
- \`SpawnTab\` - New tab
- \`CloseCurrentPane\` - Close current pane

**Event Handlers:**
\`\`\`lua
wezterm.on('format-tab-title', function(tab, tabs, panes, config, hover, max_width)
  return { { Text = tab.active_pane.title } }
end)
\`\`\`

**Nerd Fonts:**
\`\`\`lua
wezterm.nerdfonts.fa_folder  --
wezterm.nerdfonts.dev_git    --
\`\`\``);

  // Build the learnings.md content
  const learningsContent = `---
last_refresh: ${today}
cache_version: 1
learnings_count: ${learningsCount}
settings:
  auto_refresh: ${existingSettings.auto_refresh}
  capture_learnings: ${existingSettings.capture_learnings}
---

## Reference Cache

${docSections.join('\n\n')}

## Learnings

${existingLearnings || `### Successful Patterns

### Mistakes to Avoid

### Plugin Patterns

### Configuration Discoveries`}
`;

  fs.writeFileSync(learningsPath, learningsContent);
}
