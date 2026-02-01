#!/usr/bin/env node
// hyper-session-start.js
// SessionStart hook that detects Hyper version and refreshes cache
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

    // Update docs index and fetch documentation content
    const pendingPromises = [];
    if (docsNeedRefresh) {
      fs.writeFileSync(docsIndexPath, JSON.stringify({
        last_refresh: today,
        sources: [
          { name: 'hyper-website', url: 'https://hyper.is/', type: 'webfetch' },
          { name: 'github-releases', url: 'https://github.com/vercel/hyper/releases', type: 'webfetch' },
          { name: 'hyper-plugins', url: 'https://hyper.is/plugins', type: 'webfetch' },
          { name: 'xterm-js', library_id: '/xtermjs/xterm.js', type: 'context7' },
          { name: 'electron', library_id: '/websites/electronjs', type: 'context7' },
          { name: 'react', library_id: '/facebook/react', type: 'context7' }
        ]
      }, null, 2));

      // Fetch and cache documentation (runs in background, we wait before exit)
      pendingPromises.push(refreshLearningsCache(cacheDir, today).catch(() => {}));
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

    // Trigger plugin indexer if needed (runs in background, we wait before exit)
    if (ecosystemNeedsRefresh) {
      const indexerPath = path.join(pluginRoot, 'hooks', 'lib', 'plugin-indexer.js');
      if (fs.existsSync(indexerPath)) {
        try {
          // Run indexer asynchronously
          pendingPromises.push(require(indexerPath).refreshIndex(cacheDir).catch(() => {}));
        } catch (e) {
          // Indexer not available yet, skip
        }
      }
    }

    // Build summary message - positive framing, minimal noise
    const parts = [];

    if (hyperInfo.version) {
      parts.push(`Hyper ${hyperInfo.version}`);
    } else if (hyperInfo.config_path) {
      parts.push('Hyper ready');
    } else {
      // No config found at all
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[hyper-dev] No Hyper config found'
      }));
      process.exit(0);
    }

    // Only mention plugins if there are any
    if (installedPlugins.length > 0) {
      const pluginWord = installedPlugins.length === 1 ? 'plugin' : 'plugins';
      parts.push(`${installedPlugins.length} ${pluginWord}`);
    }

    // Output response immediately (doesn't block Claude)
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[hyper-dev] ${parts.join(', ')}`
    }));

    // Wait for all cache refreshes to complete before exiting
    if (pendingPromises.length > 0) {
      await Promise.all(pendingPromises);
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
 * Fetch and cache Hyper documentation
 */
async function refreshLearningsCache(cacheDir, today) {
  const learningsPath = path.join(cacheDir, 'learnings.md');

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

  // Fetch from GitHub releases (latest release info)
  try {
    const releasesHtml = await fetchUrl('https://github.com/vercel/hyper/releases');
    const text = extractTextFromHtml(releasesHtml);

    // Extract latest release info
    const releaseMatch = text.match(/v?(\d+\.\d+\.\d+).*?(?:Released|released|ago)/i);
    if (releaseMatch) {
      docSections.push(`### Latest Release\n\nVersion ${releaseMatch[0].slice(0, 100)}`);
    }
  } catch (e) {
    // Skip on error
  }

  // Fetch plugin API info from Hyper website
  try {
    const websiteHtml = await fetchUrl('https://hyper.is/');
    const text = extractTextFromHtml(websiteHtml);

    // Extract key info
    if (text.length > 100) {
      const snippet = text.slice(0, 500).replace(/\s+/g, ' ');
      docSections.push(`### Hyper Overview\n\n${snippet}...`);
    }
  } catch (e) {
    // Skip on error
  }

  // Add static plugin API reference (always available)
  docSections.push(`### Plugin API Quick Reference

**Configuration:**
- \`decorateConfig(config)\` - Modify user config, add CSS
- \`config.css\` - App-wide CSS styles
- \`config.termCSS\` - Terminal-specific CSS

**Lifecycle Hooks:**
- \`onApp(app)\` - Electron app ready
- \`onWindow(window)\` - BrowserWindow created
- \`onUnload(window)\` - Plugin being unloaded

**Component Decorators:**
- \`decorateTerm(Term, { React, notify })\` - Wrap terminal
- \`decorateHyper(Hyper, { React })\` - Wrap main component
- \`decorateHeader(Header, { React })\` - Customize header
- \`decorateTabs(Tabs, { React })\` - Customize tab bar
- \`decorateTab(Tab, { React })\` - Customize individual tabs

**Redux Integration:**
- \`middleware(store)(next)(action)\` - Action interceptor
- \`reduceUI(state, action)\` - UI state reducer
- \`reduceSessions(state, action)\` - Sessions reducer

**Common Actions:**
- \`SESSION_ADD\`, \`SESSION_PTY_DATA\`, \`SESSION_PTY_EXIT\`
- \`UI_FONT_SIZE_SET\`, \`UI_WINDOW_MAXIMIZE\`
- \`TERM_GROUP_REQUEST\`, \`TAB_SET_ACTIVE\`

**Context7 Sources for Deep Docs:**
- xterm.js: \`/xtermjs/xterm.js\` - Terminal rendering, buffer API
- Electron: \`/websites/electronjs\` - Window, IPC, native features
- React: \`/facebook/react\` - Component patterns (Hyper uses React)`);

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

### Ecosystem Discoveries`}
`;

  fs.writeFileSync(learningsPath, learningsContent);
}
