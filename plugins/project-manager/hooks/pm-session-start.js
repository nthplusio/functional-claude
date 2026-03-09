#!/bin/sh
":" //; export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
":" //; command -v node >/dev/null 2>&1 || { [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" 2>/dev/null; }
":" //; exec node "$0" "$@"
// pm-session-start.js
// SessionStart hook: detects current git repo, matches project profile,
// switches GitHub credentials, and injects project context into the session.
//
// Input:  JSON on stdin with { cwd, ... }
// Output: JSON { continue: true, systemMessage?: "..." }

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PROJECTS_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'project-manager', 'projects.json'
);

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
});

process.stdin.on('end', () => {
  try {
    main();
  } catch (_err) {
    // Always fail open — never block a session
    console.log(JSON.stringify({ continue: true }));
  }
  process.exit(0);
});

function normalizeRemoteUrl(url) {
  // Handles:
  //   git@github.com:org/repo.git   → org/repo
  //   https://github.com/org/repo   → org/repo
  //   https://github.com/org/repo.git → org/repo
  if (!url) return null;
  const stripped = url.trim().replace(/\.git$/, '');
  const sshMatch = stripped.match(/git@github\.com:(.+)/);
  if (sshMatch) return sshMatch[1];
  const httpsMatch = stripped.match(/https?:\/\/github\.com\/(.+)/);
  if (httpsMatch) return httpsMatch[1];
  return null;
}

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    timeout: 10000,
    cwd: cwd || process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
}

function main() {
  // No projects file → not configured, skip silently
  if (!fs.existsSync(PROJECTS_PATH)) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
  } catch (_e) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const projects = config.projects || {};
  if (Object.keys(projects).length === 0) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  // Detect current repo from session cwd
  let sessionData = {};
  try { sessionData = JSON.parse(input || '{}'); } catch (_e) {}
  const cwd = sessionData.cwd || process.cwd();

  let remoteUrl = null;
  try {
    remoteUrl = run('git', ['-C', cwd, 'remote', 'get-url', 'origin']);
  } catch (_e) {
    // Not a git repo or no remote
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const repoKey = normalizeRemoteUrl(remoteUrl);
  if (!repoKey) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const project = projects[repoKey];
  if (!project) {
    // Not a managed project — skip silently
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  // Switch GitHub credentials
  let ghSwitchWarning = null;
  if (project.gh_user) {
    try {
      run('gh', ['auth', 'switch', '--user', project.gh_user]);
    } catch (_e) {
      ghSwitchWarning = `⚠ Could not switch GitHub user to '${project.gh_user}'. Run: gh auth switch --user ${project.gh_user}`;
    }
  }

  // Get current git branch for context
  let currentBranch = null;
  try {
    currentBranch = run('git', ['-C', cwd, 'branch', '--show-current']);
  } catch (_e) {}

  // Capture HEAD so the stop hook can diff commits made this session
  let sessionStartHead = null;
  try {
    sessionStartHead = run('git', ['-C', cwd, 'rev-parse', 'HEAD']);
  } catch (_e) {}

  // Extract Linear issue ID from branch name (e.g. feat/ENG-42-auth -> ENG-42)
  let branchIssueId = null;
  if (currentBranch && project.linear_team_key) {
    const branchIdMatch = currentBranch.match(
      new RegExp(`(${project.linear_team_key}-\\d+)`, 'i')
    );
    if (branchIdMatch) branchIssueId = branchIdMatch[1].toUpperCase();
  }

  // Build context cache path
  const cacheDir = path.join(
    process.env.HOME || '',
    '.claude', 'project-manager', 'cache', project.slug || repoKey.replace('/', '-')
  );
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(
      path.join(cacheDir, 'context.json'),
      JSON.stringify({ repoKey, project, currentBranch, sessionStartHead, branchIssueId, loadedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (_e) {}

  // Build system message injected into Claude context
  const lines = [
    `## Active Project: ${project.displayName || project.slug || repoKey}`,
    ``,
    `- **Repo:** ${repoKey}`,
    `- **GitHub user:** ${project.gh_user || '(not configured)'}`,
    `- **Issue tracker:** ${project.issue_tracker || 'linear'}`,
  ];

  if (project.linear_team_key) {
    lines.push(`- **Linear team:** ${project.linear_team_key}`);
  }
  if (project.linear_project_name) {
    lines.push(`- **Linear project:** ${project.linear_project_name}`);
  }
  if (currentBranch) {
    lines.push(`- **Current branch:** ${currentBranch}`);
  }
  if (ghSwitchWarning) {
    lines.push(``, ghSwitchWarning);
  }

  lines.push(``, `**Note:** Linear MCP should be available as \`linear\`. If Linear tools are unavailable, warn the user and fall back to cached issue state.`);
  lines.push(``, `Use the \`project-manager\` skill to handle project status, issue management, PR linking, and direction changes. Proactively suggest creating Linear issues when the user describes untracked work.`);

  const systemMessage = lines.join('\n');

  console.log(JSON.stringify({ continue: true, systemMessage }));
}
