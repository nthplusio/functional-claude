#!/usr/bin/env node
// plugin-dev-cache-refresh.js
// Background script for cache refresh - runs detached from main SessionStart hook
//
// Usage: node plugin-dev-cache-refresh.js <cacheDir> <today> <learningsPath>
//
// This script runs completely independently and handles all slow operations:
// - Claude CLI with WebFetch (10-45 seconds)
// - HTTP fetch fallback
// - File writes to cache

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Parse CLI arguments
const [,, cacheDir, today, learningsPath] = process.argv;

if (!cacheDir || !today || !learningsPath) {
  process.exit(1);
}

// Main execution
refreshLearningsCache(cacheDir, today, learningsPath)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

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
 * Use Claude CLI to fetch and summarize documentation
 * Returns the summarized content or null if it fails
 */
function fetchWithClaudeCli(url, prompt, timeout = 60000) {
  try {
    const fullPrompt = `${prompt}

URL: ${url}

IMPORTANT: Use WebFetch to fetch the URL, then extract and format the key information as clean markdown. Focus on:
- Plugin structure and manifest schema
- Hook events and output formats
- Skill and agent frontmatter
- Environment variables
- Code examples

Output ONLY the extracted documentation in markdown format, no commentary.`;

    const result = execSync(
      `claude --print --model haiku --allowed-tools WebFetch --dangerously-skip-permissions "${fullPrompt.replace(/"/g, '\\"')}"`,
      {
        encoding: 'utf8',
        timeout: timeout,
        maxBuffer: 1024 * 1024, // 1MB
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );

    return result.trim();
  } catch (e) {
    // Claude CLI failed - return null to fall back to HTTP fetch
    return null;
  }
}

/**
 * Extract structured content from HTML documentation pages
 * Focuses on main content area and converts to readable markdown-like format
 */
function extractDocContent(html) {
  // Remove script, style, nav, header, footer elements
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

  // Try to extract main content area
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                    content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    content.match(/class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  if (mainMatch) {
    content = mainMatch[1];
  }

  // Convert headings to markdown-style
  content = content
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n## $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n### $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n#### $1\n')
    .replace(/<h[456][^>]*>([\s\S]*?)<\/h[456]>/gi, '\n**$1**\n');

  // Convert code blocks
  content = content
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Convert lists
  content = content
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<[uo]l[^>]*>/gi, '\n')
    .replace(/<\/[uo]l>/gi, '\n');

  // Convert paragraphs and line breaks
  content = content
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));

  // Clean up whitespace while preserving structure
  content = content
    .replace(/[ \t]+/g, ' ')           // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')        // Max 2 newlines
    .replace(/^\s+|\s+$/gm, '')        // Trim lines
    .trim();

  return content;
}

/**
 * Fetch and cache plugin development documentation
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
        return;
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
  let fetchedContent = '';
  let fetchMethod = 'none';

  const docsUrl = 'https://code.claude.com/docs/en/plugins-reference';

  // Strategy 1: Try Claude CLI with WebFetch (best quality)
  fetchedContent = fetchWithClaudeCli(
    docsUrl,
    'Extract the Claude Code plugin reference documentation.',
    45000 // 45 second timeout
  );

  if (fetchedContent && fetchedContent.length > 500) {
    fetchMethod = 'claude-cli';
    // Limit size while preserving structure
    const maxLength = 6000;
    if (fetchedContent.length > maxLength) {
      const cutPoint = fetchedContent.lastIndexOf('\n##', maxLength);
      if (cutPoint > maxLength / 2) {
        fetchedContent = fetchedContent.slice(0, cutPoint) + '\n\n[truncated]';
      } else {
        fetchedContent = fetchedContent.slice(0, maxLength) + '...\n\n[truncated]';
      }
    }
    docSections.push(`### Plugin Reference (claude-cli ${today})\n\n${fetchedContent}`);
  } else {
    // Strategy 2: Fall back to HTTP + HTML extraction
    try {
      const docsHtml = await fetchUrl(docsUrl);
      fetchedContent = extractDocContent(docsHtml);

      if (fetchedContent.length > 500 && fetchedContent.includes('##')) {
        fetchMethod = 'http-extract';
        const maxLength = 4000;
        if (fetchedContent.length > maxLength) {
          const cutPoint = fetchedContent.lastIndexOf('\n##', maxLength);
          if (cutPoint > maxLength / 2) {
            fetchedContent = fetchedContent.slice(0, cutPoint) + '\n\n[truncated]';
          } else {
            fetchedContent = fetchedContent.slice(0, maxLength) + '...\n\n[truncated]';
          }
        }
        docSections.push(`### Plugin Reference (http-extract ${today})\n\n${fetchedContent}`);
      } else {
        docSections.push(`### Plugin Reference\n\n*Cache refresh incomplete - use WebFetch for better content*`);
      }
    } catch (e) {
      docSections.push(`### Plugin Reference\n\n*Fetch failed: ${e.message}*`);
    }
  }

  // Add static quick reference (always available as fallback)
  docSections.push(`### Quick Reference

**Plugin Structure:**
\`\`\`
plugin-name/
├── .claude-plugin/
│   └── plugin.json       # Required manifest
├── hooks/
│   └── hooks.json        # Hook definitions
├── skills/
│   └── skill-name/
│       └── SKILL.md      # Skill definition
├── agents/
│   └── agent-name.md     # Agent definition
└── commands/
    └── command-name.md   # Slash command
\`\`\`

**plugin.json:**
\`\`\`json
{
  "name": "plugin-name",
  "version": "0.1.0",
  "description": "Brief description"
}
\`\`\`

**SKILL.md Frontmatter:**
\`\`\`yaml
---
name: Skill Display Name
description: When to use this skill and trigger phrases
version: 0.1.0
---
\`\`\`

**AGENT.md Frontmatter:**
\`\`\`yaml
---
name: agent-name
description: When to use this agent with example blocks
tools:
  - Read
  - Bash
  - Grep
model: sonnet
---
\`\`\`

**Hook Events:**
- \`PreToolUse\` - Before tool execution (can block)
- \`PostToolUse\` - After tool execution
- \`Stop\` - Session ending (learnings capture)
- \`SessionStart\` - Session beginning (cache refresh)

**Hook Output Formats:**
- PreToolUse: \`{ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow|deny" } }\`
- Stop: \`{}\` (allow) or \`{ decision: "block", reason: "..." }\`
- SessionStart: \`{ continue: true, systemMessage: "..." }\`

**Environment Variables:**
- \`\${CLAUDE_PLUGIN_ROOT}\` - Plugin directory
- \`\${CLAUDE_PROJECT_DIR}\` - User's project directory`);

  // Build the learnings.md content
  const learningsContent = `---
last_refresh: ${today}
cache_version: 3
fetch_method: ${fetchMethod}
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

### Hook Patterns

### Skill Design Tips`}
`;

  fs.writeFileSync(learningsPath, learningsContent);
}
// debug test
