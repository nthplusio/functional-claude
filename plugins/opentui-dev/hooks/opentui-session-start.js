#!/usr/bin/env node
// opentui-session-start.js
// SessionStart hook that detects OpenTUI setup and refreshes cache
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing status

const fs = require('fs');
const path = require('path');
const https = require('https');

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
    const configCachePath = path.join(cacheDir, 'opentui-config.json');
    const docsIndexPath = path.join(cacheDir, 'docs-index.json');
    const learningsPath = path.join(cacheDir, 'learnings.md');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect OpenTUI setup in project
    const opentuiInfo = detectOpentuiSetup(projectDir);

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
      cachedConfig.framework !== opentuiInfo.framework ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Update config cache
    const newConfig = {
      detected: opentuiInfo.detected,
      framework: opentuiInfo.framework,
      version: opentuiInfo.version,
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

    // Update docs index and fetch documentation content
    let refreshPromise = null;
    if (docsNeedRefresh) {
      fs.writeFileSync(docsIndexPath, JSON.stringify({
        last_refresh: today,
        sources: [
          { name: 'opentui-github', url: 'https://github.com/anomalyco/opentui', type: 'webfetch' },
          { name: 'opentui-examples', url: 'https://github.com/anomalyco/opentui/tree/main/packages/core/src/examples', type: 'webfetch' }
        ]
      }, null, 2));

      // Fetch and cache documentation (runs in background, we wait before exit)
      refreshPromise = refreshLearningsCache(cacheDir, today, learningsPath).catch(() => {});
    }

    // Build summary message - positive framing, minimal noise
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
      // No OpenTUI found
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[opentui-dev] No OpenTUI detected'
      }));
      process.exit(0);
    }

    // Output response immediately (doesn't block Claude)
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[opentui-dev] ${parts.join(', ')}`
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
 * Detect OpenTUI setup in project
 */
function detectOpentuiSetup(projectDir) {
  const result = {
    detected: false,
    framework: null,
    version: null
  };

  // Look for package.json with OpenTUI dependencies
  const packageJsonPath = path.join(projectDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Check for OpenTUI packages
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
 * Fetch and cache OpenTUI documentation
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

  // Fetch GitHub repo info
  try {
    const repoHtml = await fetchUrl('https://github.com/anomalyco/opentui');
    const text = extractTextFromHtml(repoHtml);

    if (text.length > 100) {
      const snippet = text.slice(0, 600).replace(/\s+/g, ' ');
      docSections.push(`### Repository Overview (fetched)\n\n${snippet}...`);
    }
  } catch (e) {
    // Skip on error
  }

  // Add static reference (always available)
  docSections.push(`### Quick Reference

**Installation:**
\`\`\`bash
bun add @opentui/core    # Core API
bun add @opentui/react   # React reconciler
bun add @opentui/solid   # Solid reconciler
\`\`\`

**Frameworks:**
- \`@opentui/core\` - Imperative API for direct rendering
- \`@opentui/react\` - React reconciler with JSX support
- \`@opentui/solid\` - Solid reconciler (component names use underscores)

**Core Components:**
- Layout: \`<box>\`, \`<scroll>\`
- Text: \`<text>\`, \`<ascii-font>\`, \`<figlet>\`
- Input: \`<input>\`, \`<select>\`, \`<button>\`
- Feedback: \`<progress>\`, \`<spinner>\`

**Layout Props (Yoga Flexbox):**
- \`flexDirection\`: row | column | row-reverse | column-reverse
- \`justifyContent\`: flex-start | flex-end | center | space-between | space-around
- \`alignItems\`: flex-start | flex-end | center | stretch
- \`width\`, \`height\`: number (chars) or percentage string

**Key Patterns:**
- Always use \`renderer.destroy()\` instead of \`process.exit()\`
- Set \`focused\` prop on input components
- Wrap in signal handlers: \`process.on("SIGINT", () => renderer.destroy())\`
- Use \`<strong>\`, \`<em>\` modifiers for text styling`);

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

### Component Patterns

### Layout Discoveries`}
`;

  fs.writeFileSync(learningsPath, learningsContent);
}
