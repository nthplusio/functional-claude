#!/usr/bin/env node
// sync-version.js
// Updates a plugin's version across all 4 synchronized locations:
// 1. plugins/<name>/.claude-plugin/plugin.json
// 2. .claude-plugin/marketplace.json
// 3. plugins/<name>/skills/*/SKILL.md (frontmatter version)
// 4. docs/memory.md (plugin table)
//
// Usage: node scripts/sync-version.js <plugin-name> <new-version>
// Example: node scripts/sync-version.js wezterm-dev 0.8.0

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

function main() {
  const [pluginName, newVersion] = process.argv.slice(2);

  if (!pluginName || !newVersion) {
    console.error('Usage: node scripts/sync-version.js <plugin-name> <new-version>');
    console.error('Example: node scripts/sync-version.js wezterm-dev 0.8.0');
    process.exit(1);
  }

  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error(`Error: Invalid version "${newVersion}". Must be semver (e.g., 1.2.3)`);
    process.exit(1);
  }

  const pluginDir = path.join(REPO_ROOT, 'plugins', pluginName);
  if (!fs.existsSync(pluginDir)) {
    console.error(`Error: Plugin directory not found: plugins/${pluginName}/`);
    console.error(`Available plugins: ${listPlugins().join(', ')}`);
    process.exit(1);
  }

  const results = [];
  let errors = 0;

  // 1. Update plugin.json
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  try {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    const oldVersion = pluginJson.version;
    pluginJson.version = newVersion;
    fs.writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2) + '\n');
    results.push(`  plugin.json: ${oldVersion} -> ${newVersion}`);
  } catch (e) {
    console.error(`Error updating plugin.json: ${e.message}`);
    errors++;
  }

  // 2. Update marketplace.json
  const marketplacePath = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
  try {
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
    const plugin = marketplace.plugins.find(p => p.name === pluginName);
    if (plugin) {
      const oldVersion = plugin.version;
      plugin.version = newVersion;
      fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
      results.push(`  marketplace.json: ${oldVersion} -> ${newVersion}`);
    } else {
      console.error(`Warning: Plugin "${pluginName}" not found in marketplace.json`);
      errors++;
    }
  } catch (e) {
    console.error(`Error updating marketplace.json: ${e.message}`);
    errors++;
  }

  // 3. Update all SKILL.md frontmatter versions
  const skillsDir = path.join(pluginDir, 'skills');
  let skillCount = 0;
  if (fs.existsSync(skillsDir)) {
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      try {
        let content = fs.readFileSync(skillPath, 'utf8');
        // Match version in YAML frontmatter (between --- markers)
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const updatedFrontmatter = frontmatter.replace(
            /^version:\s*.+$/m,
            `version: ${newVersion}`
          );
          if (updatedFrontmatter !== frontmatter) {
            content = content.replace(frontmatterMatch[1], updatedFrontmatter);
            fs.writeFileSync(skillPath, content);
            skillCount++;
          }
        }
      } catch (e) {
        console.error(`Error updating ${skillDir}/SKILL.md: ${e.message}`);
        errors++;
      }
    }
    results.push(`  SKILL.md files: ${skillCount} updated`);
  }

  // 4. Update docs/memory.md plugin table
  const memoryPath = path.join(REPO_ROOT, 'docs', 'memory.md');
  try {
    let content = fs.readFileSync(memoryPath, 'utf8');
    // Match the plugin row in the version table: | plugin-name | X.Y.Z | ...
    const findRowRegex = new RegExp(
      `\\| ${escapeRegex(pluginName)} \\| \\d+\\.\\d+\\.\\d+ \\|`
    );
    const rowExists = findRowRegex.test(content);
    const tableRowRegex = new RegExp(
      `(\\| ${escapeRegex(pluginName)} \\| )\\d+\\.\\d+\\.\\d+( \\|)`,
      'g'
    );
    const newContent = content.replace(tableRowRegex, `$1${newVersion}$2`);
    if (newContent !== content) {
      fs.writeFileSync(memoryPath, newContent);
      results.push(`  memory.md: updated`);
    } else if (rowExists) {
      results.push(`  memory.md: already at ${newVersion}`);
    } else {
      results.push(`  memory.md: no matching row found (update manually)`);
    }
  } catch (e) {
    console.error(`Error updating memory.md: ${e.message}`);
    errors++;
  }

  // Summary
  console.log(`\nSynced ${pluginName} to v${newVersion}:\n`);
  results.forEach(r => console.log(r));

  if (errors > 0) {
    console.log(`\n${errors} error(s) encountered. Check output above.`);
    process.exit(1);
  } else {
    console.log(`\nAll 4 locations updated successfully.`);
  }
}

function listPlugins() {
  const pluginsDir = path.join(REPO_ROOT, 'plugins');
  return fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();
