#!/usr/bin/env node
// shadcn-session-start.js
// SessionStart hook that checks if documentation cache needs refreshing
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage if cache is stale

const fs = require('fs');
const path = require('path');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const learningsPath = path.join(cacheDir, 'learnings.md');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Check if learnings file exists and when it was last refreshed
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let needsRefresh = true;
    let daysSinceRefresh = null;

    if (fs.existsSync(learningsPath)) {
      try {
        const content = fs.readFileSync(learningsPath, 'utf8');

        // Parse YAML frontmatter for last_refresh
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const lastRefreshMatch = frontmatterMatch[1].match(/last_refresh:\s*(\d{4}-\d{2}-\d{2})/);
          if (lastRefreshMatch) {
            const lastRefresh = new Date(lastRefreshMatch[1]);
            daysSinceRefresh = Math.floor((now - lastRefresh) / (24 * 60 * 60 * 1000));
            needsRefresh = daysSinceRefresh > 7;
          }
        }
      } catch (e) {
        // File exists but can't be parsed, needs refresh
      }
    }

    if (needsRefresh) {
      const message = daysSinceRefresh !== null
        ? `[shadcn-dev] Cache is ${daysSinceRefresh} days old. Consider refreshing shadcn/Tailwind docs.`
        : '[shadcn-dev] No cache found. Documentation will be fetched as needed.';

      console.log(JSON.stringify({
        continue: true,
        systemMessage: message
      }));
    } else {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[shadcn-dev] Cache is current'
      }));
    }

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
