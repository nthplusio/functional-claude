#!/usr/bin/env node
// repo-sme-session-start.js
// SessionStart hook: reads registry, runs git pull on each clone, injects context.
//
// Input:  JSON on stdin (session info — not used)
// Output: JSON { continue: true, systemMessage?: "..." }

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REGISTRY_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'repo-sme', 'registry.json'
);

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });

process.stdin.on('end', () => {
  try {
    main();
  } catch (_err) {
    // Always fail open — never block a session
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

function main() {
  // Registry missing → nothing to do
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (_e) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const repos = Array.isArray(registry.repos) ? registry.repos : [];

  if (repos.length === 0) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  // Attempt git pull on each clone (best-effort, 30s per repo)
  for (const repo of repos) {
    if (!repo.localPath || !fs.existsSync(repo.localPath)) continue;
    try {
      const out = execFileSync('git', ['-C', repo.localPath, 'pull', '--ff-only'], {
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      // Update lastPulledAt timestamp
      repo.lastPulledAt = new Date().toISOString();
      if (out.trim() !== 'Already up to date.') {
        // Repo was updated — note it for later (optional)
      }
    } catch (_e) {
      // Ignore pull failures (offline, no remote, etc.)
    }
  }

  // Persist updated timestamps
  try {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
  } catch (_e) {
    // Ignore write failures
  }

  const names = repos.map(r => r.name).join(', ');
  const count = repos.length;
  const word = count === 1 ? 'repo' : 'repos';

  console.log(JSON.stringify({
    continue: true,
    systemMessage: `[repo-sme] ${count} ${word} registered as SME sources: ${names}. Use /repo-sme ask <name> <question> to query, or I will auto-spawn the repo-sme-expert agent when you ask about these libraries.`
  }));
}
