#!/usr/bin/env node
// generate-plugin-manifest.js
// Generates plugin-manifest.json for a plugin directory.
// Lists all files (excluding .cache/ contents) so the stale-cleanup hook
// can detect and remove orphaned files after plugin updates.
//
// Usage: node scripts/generate-plugin-manifest.js plugins/<plugin-name>

const fs = require('fs');
const path = require('path');

const pluginDir = process.argv[2];
if (!pluginDir) {
  console.error('Usage: node scripts/generate-plugin-manifest.js plugins/<plugin-name>');
  process.exit(1);
}

const resolvedDir = path.resolve(pluginDir);
if (!fs.existsSync(resolvedDir)) {
  console.error(`Directory not found: ${resolvedDir}`);
  process.exit(1);
}

const pluginJsonPath = path.join(resolvedDir, '.claude-plugin', 'plugin.json');
if (!fs.existsSync(pluginJsonPath)) {
  console.error(`No .claude-plugin/plugin.json found in ${resolvedDir}`);
  process.exit(1);
}

const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
const version = pluginJson.version;
if (!version) {
  console.error('No version field in plugin.json');
  process.exit(1);
}

// Directories whose contents are never listed (but the dirs themselves are preserved)
const PRESERVE = ['.cache/', '.claude-plugin/'];

function walkDir(dir, baseDir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    // Skip preserved directory contents
    if (PRESERVE.some(p => relativePath.startsWith(p))) continue;

    if (entry.isDirectory()) {
      walkDir(fullPath, baseDir, files);
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

const files = walkDir(resolvedDir, resolvedDir, []);

// Add plugin-manifest.json itself (it lists itself)
if (!files.includes('plugin-manifest.json')) {
  files.push('plugin-manifest.json');
}

files.sort();

const manifest = {
  version,
  preserve: PRESERVE,
  files
};

const outputPath = path.join(resolvedDir, 'plugin-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
console.log(`  version: ${version}`);
console.log(`  files: ${files.length}`);
console.log(`  preserve: ${PRESERVE.join(', ')}`);
