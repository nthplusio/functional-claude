#!/usr/bin/env node
// check-version-bump.js
// PreToolUse hook that validates version synchronization before git commits
//
// Checks that when plugin files are modified, versions are bumped consistently across:
// - plugins/<name>/.claude-plugin/plugin.json
// - .claude-plugin/marketplace.json
// - plugins/<name>/skills/*/SKILL.md (frontmatter version)
//
// Input: JSON with tool_input on stdin (command for Bash tool)
// Output: JSON response - {"permissionDecision": "allow"} or {"permissionDecision": "deny", "reason": "..."}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const command = data.tool_input?.command || '';

    // Only check git commit commands
    if (!command.match(/git\s+commit/)) {
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Get staged files
    let stagedFiles;
    try {
      stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f);
    } catch (e) {
      // Not in a git repo or no staged files
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
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
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
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
      console.log(JSON.stringify({ permissionDecision: "allow" }));
      process.exit(0);
    }

    // Check version consistency for each modified plugin
    const issues = [];

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

      // Check marketplace.json
      const marketplacePath = '.claude-plugin/marketplace.json';
      if (fs.existsSync(marketplacePath)) {
        try {
          const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
          const marketplacePlugin = marketplace.plugins?.find(p => p.name === pluginName);
          if (marketplacePlugin && marketplacePlugin.version !== pluginVersion) {
            issues.push(`${pluginName}: marketplace.json version (${marketplacePlugin.version}) != plugin.json version (${pluginVersion})`);
          }
        } catch (e) {
          // Ignore marketplace parse errors
        }
      }

      // Check SKILL.md files
      const skillsDir = path.join(pluginDir, 'skills');
      if (fs.existsSync(skillsDir)) {
        const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const skillDir of skillDirs) {
          const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
          if (!fs.existsSync(skillPath)) continue;

          try {
            const skillContent = fs.readFileSync(skillPath, 'utf8');
            const versionMatch = skillContent.match(/^version:\s*(.+)$/m);
            if (versionMatch) {
              const skillVersion = versionMatch[1].trim();
              if (skillVersion !== pluginVersion) {
                issues.push(`${pluginName}: ${skillDir}/SKILL.md version (${skillVersion}) != plugin.json version (${pluginVersion})`);
              }
            }
          } catch (e) {
            // Ignore skill read errors
          }
        }
      }

      // Check if version was actually bumped (compare with last commit)
      try {
        const lastVersion = execSync(
          `git show HEAD:${pluginJsonPath} 2>/dev/null | grep -o '"version":\\s*"[^"]*"' | grep -o '[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+'`,
          { encoding: 'utf8' }
        ).trim();

        if (lastVersion === pluginVersion) {
          // Check if any non-trivial files were changed
          const pluginStagedFiles = stagedFiles.filter(f => f.startsWith(`plugins/${pluginName}/`));
          const trivialPatterns = [/\.md$/i, /\.gitignore$/i, /\.cache\//];
          const nonTrivialChanges = pluginStagedFiles.some(f =>
            !trivialPatterns.some(p => p.test(f))
          );

          if (nonTrivialChanges) {
            issues.push(`${pluginName}: Code changes detected but version not bumped (still ${pluginVersion})`);
          }
        }
      } catch (e) {
        // New plugin or can't get last version, skip this check
      }
    }

    if (issues.length > 0) {
      const reason = `Version synchronization issues detected:

${issues.map(i => `  - ${i}`).join('\n')}

Please ensure:
1. plugin.json version is bumped (PATCH for fixes, MINOR for features)
2. marketplace.json has matching version
3. All SKILL.md files have matching version in frontmatter
4. docs/memory.md is updated with new version`;

      console.log(JSON.stringify({ permissionDecision: "deny", reason }));
      process.exit(0);
    }

    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);

  } catch (err) {
    // On any error, allow to avoid blocking
    console.log(JSON.stringify({ permissionDecision: "allow" }));
    process.exit(0);
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
});
