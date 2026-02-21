#!/usr/bin/env node
// stale-cleanup.js
// SessionStart hook that removes stale files after plugin updates.
//
// Compares plugin-manifest.json (shipped with the plugin) against actual files
// on disk and removes anything not listed in the manifest or under preserved
// directory prefixes. Runs once per version upgrade, tracked via
// .cache/cleanup-state.json.
//
// Uses stdout (not additionalContext) due to Claude Code bug #16538.
// Fails open on any error — outputs nothing, exits cleanly.

const fs = require('fs');
const path = require('path');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
if (!pluginRoot) process.exit(0);

try {
  // 1. Read manifest
  const manifestPath = path.join(pluginRoot, 'plugin-manifest.json');
  if (!fs.existsSync(manifestPath)) process.exit(0);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const { version, preserve = [], files = [] } = manifest;
  if (!version || !files.length) process.exit(0);

  // 2. Check cleanup state — skip if already cleaned for this version
  const cacheDir = path.join(pluginRoot, '.cache');
  const statePath = path.join(cacheDir, 'cleanup-state.json');

  if (fs.existsSync(statePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      if (state.version === version) process.exit(0);
    } catch (e) {
      // Corrupted state file — proceed with cleanup
    }
  }

  // 3. Walk plugin directory and build list of actual files
  const fileSet = new Set(files);

  function walkDir(dir, baseDir, result) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return result;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      // Skip preserved directory prefixes
      if (preserve.some(p => relativePath.startsWith(p))) continue;

      if (entry.isDirectory()) {
        walkDir(fullPath, baseDir, result);
      } else {
        result.push(relativePath);
      }
    }
    return result;
  }

  const actualFiles = walkDir(pluginRoot, pluginRoot, []);

  // 4. Find stale files (on disk but not in manifest)
  const staleFiles = actualFiles.filter(f => !fileSet.has(f));

  // 5. Delete stale files
  for (const file of staleFiles) {
    try {
      fs.unlinkSync(path.join(pluginRoot, file));
    } catch (e) {
      // Skip files that can't be deleted
    }
  }

  // 6. Remove empty directories (bottom-up)
  function removeEmptyDirs(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(pluginRoot, fullPath).replace(/\\/g, '/') + '/';

        // Don't touch preserved directories
        if (preserve.some(p => relativePath.startsWith(p))) continue;

        removeEmptyDirs(fullPath);

        // Try to remove if now empty
        try {
          const remaining = fs.readdirSync(fullPath);
          if (remaining.length === 0) {
            fs.rmdirSync(fullPath);
          }
        } catch (e) {
          // Skip
        }
      }
    }
  }

  removeEmptyDirs(pluginRoot);

  // 7. Write cleanup state
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  fs.writeFileSync(statePath, JSON.stringify({
    version,
    cleanedAt: new Date().toISOString(),
    staleFiles
  }, null, 2) + '\n');

  // 8. Output summary if files were cleaned
  if (staleFiles.length > 0) {
    const pluginName = path.basename(pluginRoot);
    const fileList = staleFiles.join(', ');
    process.stdout.write(`[${pluginName}] Cleaned ${staleFiles.length} stale file(s) after update to v${version}: ${fileList}`);
  }

} catch (e) {
  // Fail open — never block session start
  process.exit(0);
}
