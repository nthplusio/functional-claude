#!/usr/bin/env node
// shadcn-session-start.js
// SessionStart hook that detects shadcn/ui setup and refreshes cache
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
    const configCachePath = path.join(cacheDir, 'shadcn-config.json');
    const docsIndexPath = path.join(cacheDir, 'docs-index.json');
    const learningsPath = path.join(cacheDir, 'learnings.md');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect shadcn/ui setup in project
    const shadcnInfo = detectShadcnSetup(projectDir);

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
      cachedConfig.style !== shadcnInfo.style ||
      !cachedConfig.detection_timestamp ||
      (now - new Date(cachedConfig.detection_timestamp)) > 24 * 60 * 60 * 1000;

    // Update config cache
    const newConfig = {
      detected: shadcnInfo.detected,
      style: shadcnInfo.style,
      base_color: shadcnInfo.baseColor,
      components_path: shadcnInfo.componentsPath,
      installed_components: shadcnInfo.installedComponents,
      detection_timestamp: now.toISOString(),
      config_path: shadcnInfo.configPath
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
          { name: 'shadcn-cli', url: 'https://ui.shadcn.com/docs/cli', type: 'webfetch' },
          { name: 'shadcn-components', url: 'https://ui.shadcn.com/docs/components', type: 'webfetch' },
          { name: 'tailwindcss', library_id: '/tailwindlabs/tailwindcss', type: 'context7' },
          { name: 'radix-ui', library_id: '/radix-ui/primitives', type: 'context7' },
          { name: 'react-hook-form', library_id: '/react-hook-form/react-hook-form', type: 'context7' }
        ]
      }, null, 2));

      // Fetch and cache documentation (runs in background, we wait before exit)
      refreshPromise = refreshLearningsCache(cacheDir, today, learningsPath).catch(() => {});
    }

    // Build summary message - positive framing, minimal noise
    const parts = [];

    if (shadcnInfo.detected) {
      if (shadcnInfo.style) {
        parts.push(`shadcn/ui (${shadcnInfo.style})`);
      } else {
        parts.push('shadcn/ui ready');
      }

      // Only mention components if there are any
      if (shadcnInfo.installedComponents.length > 0) {
        const compWord = shadcnInfo.installedComponents.length === 1 ? 'component' : 'components';
        parts.push(`${shadcnInfo.installedComponents.length} ${compWord}`);
      }
    } else {
      // No shadcn config found
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[shadcn-dev] No components.json found'
      }));
      process.exit(0);
    }

    // Output response immediately (doesn't block Claude)
    console.log(JSON.stringify({
      continue: true,
      systemMessage: `[shadcn-dev] ${parts.join(', ')}`
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

  // Look for components.json
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

        // Get components path from aliases
        if (config.aliases?.components) {
          // Convert alias like "@/components" to actual path
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

  // Find installed components
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
 * Fetch and cache shadcn documentation
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

  // Fetch CLI docs
  try {
    const cliHtml = await fetchUrl('https://ui.shadcn.com/docs/cli');
    const text = extractTextFromHtml(cliHtml);

    if (text.length > 100) {
      const snippet = text.slice(0, 800).replace(/\s+/g, ' ');
      docSections.push(`### CLI Reference (fetched)\n\n${snippet}...`);
    }
  } catch (e) {
    // Skip on error
  }

  // Fetch components overview
  try {
    const componentsHtml = await fetchUrl('https://ui.shadcn.com/docs/components');
    const text = extractTextFromHtml(componentsHtml);

    if (text.length > 100) {
      const snippet = text.slice(0, 600).replace(/\s+/g, ' ');
      docSections.push(`### Components Overview (fetched)\n\n${snippet}...`);
    }
  } catch (e) {
    // Skip on error
  }

  // Add static reference (always available)
  docSections.push(`### Quick Reference

**CLI Commands:**
\`\`\`bash
npx shadcn@latest init     # Initialize project
npx shadcn@latest add      # Add components
npx shadcn@latest diff     # Check for updates
\`\`\`

**Init Flags:** \`-y\` (yes), \`-d\` (defaults), \`-c <path>\` (cwd), \`-s\` (silent)
**Add Flags:** \`-y\` (yes), \`-o\` (overwrite), \`-a\` (all), \`-p <path>\` (path)

**Component Categories:**
- Layout: aspect-ratio, collapsible, resizable, scroll-area, separator
- Forms: button, checkbox, form, input, label, radio-group, select, slider, switch, textarea
- Data: avatar, badge, calendar, card, carousel, chart, table
- Feedback: alert, alert-dialog, dialog, drawer, popover, sheet, sonner, toast, tooltip
- Navigation: breadcrumb, command, context-menu, dropdown-menu, menubar, navigation-menu, pagination, sidebar, tabs

**Context7 Sources for Deep Docs:**
- Tailwind CSS: \`/tailwindlabs/tailwindcss\`
- Radix UI: \`/radix-ui/primitives\`
- React Hook Form: \`/react-hook-form/react-hook-form\``);

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

### Component Customizations`}
`;

  fs.writeFileSync(learningsPath, learningsContent);
}
