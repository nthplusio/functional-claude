#!/usr/bin/env node
// check-version-bump.js
// PreToolUse hook that validates version synchronization before git commits
//
// When plugin.json version is bumped, auto-syncs the other 3 locations
// (marketplace.json, SKILL.md frontmatter, docs/memory.md) and stages them.
// Only denies when code changes are detected but plugin.json version was NOT bumped.
//
// Input: JSON with tool_input on stdin (command for Bash tool)
// Output: JSON response with hookSpecificOutput wrapper for PreToolUse hooks

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Convert Windows paths to git-compatible forward slashes
const toGitPath = (p) => p.replace(/\\/g, '/');

// Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to output proper hook response format
function respond(decision, reason = null) {
  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: decision
    }
  };
  if (reason) {
    response.hookSpecificOutput.permissionDecisionReason = reason;
  }
  console.log(JSON.stringify(response));
  process.exit(0);
}

/**
 * Auto-sync a plugin's version from plugin.json to marketplace.json, SKILL.md files, and memory.md.
 * Returns an array of file paths that were modified.
 */
function autoSyncVersion(pluginName, pluginVersion) {
  const synced = [];

  // 1. Sync marketplace.json
  const marketplacePath = '.claude-plugin/marketplace.json';
  if (fs.existsSync(marketplacePath)) {
    try {
      const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
      const plugin = marketplace.plugins?.find(p => p.name === pluginName);
      if (plugin && plugin.version !== pluginVersion) {
        plugin.version = pluginVersion;
        fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
        synced.push(marketplacePath);
      }
    } catch (e) {
      // Ignore marketplace errors
    }
  }

  // 2. Sync SKILL.md frontmatter versions
  const skillsDir = path.join('plugins', pluginName, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      try {
        let content = fs.readFileSync(skillPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const updatedFrontmatter = frontmatter.replace(
            /^version:\s*.+$/m,
            `version: ${pluginVersion}`
          );
          if (updatedFrontmatter !== frontmatter) {
            content = content.replace(frontmatterMatch[1], updatedFrontmatter);
            fs.writeFileSync(skillPath, content);
            synced.push(skillPath);
          }
        }
      } catch (e) {
        // Ignore skill errors
      }
    }
  }

  // 3. Sync docs/memory.md plugin table
  const memoryPath = 'docs/memory.md';
  if (fs.existsSync(memoryPath)) {
    try {
      let content = fs.readFileSync(memoryPath, 'utf8');
      const tableRowRegex = new RegExp(
        `(\\| ${escapeRegex(pluginName)} \\| )\\d+\\.\\d+\\.\\d+( \\|)`,
        'g'
      );
      const newContent = content.replace(tableRowRegex, `$1${pluginVersion}$2`);
      if (newContent !== content) {
        fs.writeFileSync(memoryPath, newContent);
        synced.push(memoryPath);
      }
    } catch (e) {
      // Ignore memory.md errors
    }
  }

  return synced;
}

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  // Debug: write to file since stderr may not be visible
  const debugLog = path.join(__dirname, 'debug.log');
  const log = (msg) => fs.appendFileSync(debugLog, `${new Date().toISOString()} ${msg}\n`);

  log(`CWD: ${process.cwd()}`);
  log(`Input: ${input.substring(0, 300)}`);

  try {
    const data = JSON.parse(input || '{}');
    const command = data.tool_input?.command || '';

    log(`Command: ${command.substring(0, 100)}`);

    // Only check git commit commands
    if (!command.match(/git\s+commit/)) {
      respond("allow", "Not a git commit command");
    }

    // Get staged files
    let stagedFiles;
    try {
      stagedFiles = execSync('git diff --cached --name-only', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      })
        .trim()
        .split('\n')
        .filter(f => f);
    } catch (e) {
      // Not in a git repo or no staged files
      respond("allow", "Not in a git repo or no staged files");
    }

    // Also check for files being added in the same command (git add X && git commit)
    // PreToolUse runs BEFORE the command, so git add hasn't happened yet
    const addMatch = command.match(/git\s+add\s+([^&|;]+)/);
    if (addMatch) {
      const addArgs = addMatch[1].trim();
      // Handle specific file paths (not -A or .)
      if (!addArgs.startsWith('-') && addArgs !== '.') {
        const filesToAdd = addArgs.split(/\s+/).filter(f => f && !f.startsWith('-'));
        for (const file of filesToAdd) {
          if (!stagedFiles.includes(file)) {
            stagedFiles.push(file);
          }
        }
      }
    }

    if (stagedFiles.length === 0) {
      respond("allow", "No staged files");
    }

    // Find which plugins have modified files
    const modifiedPlugins = new Set();
    for (const file of stagedFiles) {
      const match = file.match(/^plugins\/([^/]+)\//);
      if (match) {
        modifiedPlugins.add(match[1]);
      }
    }

    if (modifiedPlugins.size === 0) {
      // No plugin files modified
      respond("allow", "No plugin files modified");
    }

    // Check version consistency for each modified plugin
    const issues = [];
    const allSynced = [];

    for (const pluginName of modifiedPlugins) {
      const pluginDir = path.join('plugins', pluginName);

      // Skip if plugin directory doesn't exist (being deleted)
      if (!fs.existsSync(pluginDir)) continue;

      // Get version from plugin.json
      const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
      if (!fs.existsSync(pluginJsonPath)) continue;

      let pluginVersion;
      try {
        const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
        pluginVersion = pluginJson.version;
      } catch (e) {
        issues.push(`${pluginName}: Cannot read plugin.json`);
        continue;
      }

      // Check if version was actually bumped (compare with last commit)
      let versionWasBumped = false;
      try {
        const gitPluginJsonPath = toGitPath(pluginJsonPath);
        const prevContent = execSync(`git show HEAD:${gitPluginJsonPath}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        const versionMatch = prevContent.match(/"version":\s*"([0-9]+\.[0-9]+\.[0-9]+)"/);
        const lastVersion = versionMatch ? versionMatch[1] : null;
        if (!lastVersion) throw new Error('No version found');

        versionWasBumped = lastVersion !== pluginVersion;

        if (!versionWasBumped) {
          // Check if any non-trivial files were changed
          const pluginStagedFiles = stagedFiles.filter(f => f.startsWith(`plugins/${pluginName}/`));

          const significantPatterns = [
            /SKILL\.md$/i,
            /agents\/.*\.md$/i,
            /hooks\.json$/i,
            /hooks\/.*\.js$/i,
            /plugin\.json$/i,
            /\.mcp\.json$/i,
            /commands\/.*\.md$/i
          ];

          const trivialPatterns = [
            /README\.md$/i,
            /\.gitignore$/i,
            /\.cache\//,
            /references\/.*\.md$/i,
            /examples\//
          ];

          const nonTrivialChanges = pluginStagedFiles.some(f => {
            if (significantPatterns.some(p => p.test(f))) return true;
            if (trivialPatterns.some(p => p.test(f))) return false;
            if (!f.endsWith('.md')) return true;
            return !f.includes('/references/');
          });

          if (nonTrivialChanges) {
            issues.push(`${pluginName}: Code changes detected but version not bumped (still ${pluginVersion}). Bump the version in plugin.json and the hook will auto-sync the rest.`);
          }
        }
      } catch (e) {
        // New plugin or can't get last version — treat as bumped
        versionWasBumped = true;
      }

      // If version was bumped, auto-sync other locations instead of blocking
      if (versionWasBumped) {
        const synced = autoSyncVersion(pluginName, pluginVersion);
        if (synced.length > 0) {
          // Stage the synced files so they're included in the commit
          try {
            execSync(`git add ${synced.map(f => '"' + f + '"').join(' ')}`, {
              encoding: 'utf8',
              stdio: ['pipe', 'pipe', 'pipe']
            });
            allSynced.push(...synced.map(f => `${pluginName}: ${f}`));
          } catch (e) {
            // If staging fails, report as issue
            issues.push(`${pluginName}: Auto-sync wrote files but failed to stage them: ${e.message}`);
          }
        }
      }
    }

    if (issues.length > 0) {
      const reason = `Version synchronization issues detected:

${issues.map(i => `  - ${i}`).join('\n')}

Please ensure:
1. plugin.json version is bumped (PATCH for fixes, MINOR for features)
2. The hook will auto-sync marketplace.json, SKILL.md files, and docs/memory.md`;

      respond("deny", reason);
    }

    if (allSynced.length > 0) {
      log(`Auto-synced: ${allSynced.join(', ')}`);
      respond("allow", `Version check passed (auto-synced: ${allSynced.join(', ')})`);
    }

    respond("allow", "Version check passed");

  } catch (err) {
    // On any error, allow to avoid blocking
    respond("allow", "Error during check, allowing to avoid blocking");
  }
});

process.stdin.on('error', () => {
  respond("allow", "Stdin error, allowing to avoid blocking");
});
