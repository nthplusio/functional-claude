#!/usr/bin/env node
// list-projects.js
// Enumerate Claude Code projects with session counts and sizes.
// No args — reads ~/.claude/projects/ directory.
// Cross-references history.jsonl project paths to resolve dash-separated dir names → real paths.
// Output: JSON array to stdout, errors to stderr.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const home = process.env.HOME || process.env.USERPROFILE || '';
const claudeDir = path.join(home, '.claude');
const projectsDir = path.join(claudeDir, 'projects');
const historyPath = path.join(claudeDir, 'history.jsonl');

async function main() {
  if (!fs.existsSync(projectsDir)) {
    console.log(JSON.stringify([]));
    return;
  }

  // Build a map of project paths from history.jsonl for resolving dash-separated dirs
  const projectPathMap = new Map(); // dashPath -> realPath
  if (fs.existsSync(historyPath)) {
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(historyPath, { encoding: 'utf8' }),
        crlfDelay: Infinity
      });
      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line);
          if (entry.project) {
            // Convert real path to dash format for matching
            const dashPath = entry.project.replace(/\//g, '-');
            projectPathMap.set(dashPath, entry.project);
          }
        } catch (e) {
          // Skip malformed lines
        }
      }
    } catch (e) {
      process.stderr.write(`Warning: could not read history.jsonl: ${e.message}\n`);
    }
  }

  const dirs = fs.readdirSync(projectsDir).filter(d => {
    const full = path.join(projectsDir, d);
    return fs.statSync(full).isDirectory();
  });

  const results = [];

  for (const dir of dirs) {
    const dirPath = path.join(projectsDir, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jsonl'));

    let totalSize = 0;
    let oldestTime = Infinity;
    let newestTime = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(filePath);
        totalSize += stat.size;
        if (stat.mtimeMs < oldestTime) oldestTime = stat.mtimeMs;
        if (stat.mtimeMs > newestTime) newestTime = stat.mtimeMs;
      } catch (e) {
        // Skip unreadable files
      }
    }

    // Resolve real path from history map
    let realPath = projectPathMap.get(dir) || null;
    if (!realPath) {
      // Best-effort: convert dash path back to forward slashes
      // The first dash maps to / (root), so "-home-user-project" -> "/home/user/project"
      realPath = dir.replace(/^-/, '/').replace(/-/g, '/');
    }

    results.push({
      projectDir: dir,
      realPath,
      sessionCount: files.length,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      oldestSession: files.length > 0 ? new Date(oldestTime).toISOString() : null,
      newestSession: files.length > 0 ? new Date(newestTime).toISOString() : null
    });
  }

  // Sort by newest session descending
  results.sort((a, b) => {
    if (!a.newestSession) return 1;
    if (!b.newestSession) return -1;
    return new Date(b.newestSession) - new Date(a.newestSession);
  });

  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
