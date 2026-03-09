#!/usr/bin/env node
// pm-session-end.js
// Stop hook: collects signals from transcript + git state, scores untracked work,
// and emits autonomous actions and user questions for issue lifecycle management.
//
// Input:  JSON on stdin with { transcript_path, stop_hook_active, cwd }
// Output: JSON { stopReason?: "..." }

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CACHE_ROOT = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'project-manager', 'cache'
);

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});

process.stdin.on('end', () => {
  try {
    main();
  } catch (_err) {
    // Always fail open — never block a session
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    timeout: 3000,
    cwd: cwd || process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
}

function normalizeRemoteUrl(url) {
  if (!url) return null;
  const stripped = url.trim().replace(/\.git$/, '');
  const sshMatch = stripped.match(/git@github\.com:(.+)/);
  if (sshMatch) return sshMatch[1];
  const httpsMatch = stripped.match(/https?:\/\/github\.com\/(.+)/);
  if (httpsMatch) return httpsMatch[1];
  return null;
}

function main() {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (_e) {}

  // Guard: prevent infinite loop when our stopReason triggers a new turn
  if (data.stop_hook_active === true) {
    console.log(JSON.stringify({}));
    process.exit(0);
    return;
  }

  // No transcript → nothing to scan
  const transcriptPath = data.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    console.log(JSON.stringify({}));
    process.exit(0);
    return;
  }

  const cwd = data.cwd || process.cwd();

  // Load context matching the current repo, not just the newest
  const context = loadActiveContext(cwd);
  if (!context) {
    console.log(JSON.stringify({}));
    process.exit(0);
    return;
  }

  // Read transcript as raw text for pattern scanning
  let transcript = '';
  try {
    transcript = fs.readFileSync(transcriptPath, 'utf8');
  } catch (_e) {
    console.log(JSON.stringify({}));
    process.exit(0);
    return;
  }

  const signals = collectSignals(context, transcript, cwd);
  const trackingResult = computeTrackingScore(signals);
  const { autoActions, questions } = buildDirectives(signals, trackingResult, context.project);
  const stopReason = formatStopReason(autoActions, questions, context.project);

  if (!stopReason) {
    console.log(JSON.stringify({}));
    process.exit(0);
    return;
  }

  console.log(JSON.stringify({ stopReason }));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Signal collection — transcript patterns + git state
// ---------------------------------------------------------------------------

function collectSignals(context, transcript, cwd) {
  const project = context.project || {};
  const teamKey = project.linear_team_key || '[A-Z]+';
  const linearIdPattern = new RegExp(`\\b${teamKey}-\\d+\\b`, 'gi');

  // Transcript signals
  const linearIds = [...new Set(transcript.match(linearIdPattern) || [])];
  const prCreated = /gh\s+pr\s+create|pull\s+request\s+created|created.*pull\s+request/i.test(transcript);
  const closesRef = transcript.match(new RegExp(`Closes\\s+(${teamKey}-\\d+)`, 'gi')) || [];
  const closesIds = closesRef.map(m => m.replace(/^Closes\s+/i, '').toUpperCase());
  const pivotDetected = /\b(pivot|change\s+direction|different\s+approach|rethink|abandon|wrong\s+approach|start\s+over)\b/i.test(transcript);
  const issueCreated = /linear_create_issue|created.*issue|new\s+issue/i.test(transcript);
  const issueUpdated = /linear_update_issue|updated.*issue/i.test(transcript);
  const quickFix = /\b(typo|hotfix|quick\s+fix|one-liner|trivial|tiny\s+fix|small\s+fix)\b/i.test(transcript);

  // Git signals (via sessionStartHead)
  let commits = [];
  let filesChanged = 0;
  let linesChanged = 0;
  let newFiles = [];
  const sessionStartHead = context.sessionStartHead;

  if (sessionStartHead) {
    try {
      const logOutput = run('git', ['-C', cwd, 'log', '--oneline', `${sessionStartHead}..HEAD`]);
      commits = logOutput ? logOutput.split('\n').filter(Boolean) : [];
    } catch (_e) {}

    try {
      const statOutput = run('git', ['-C', cwd, 'diff', '--stat', sessionStartHead, 'HEAD']);
      if (statOutput) {
        const statLines = statOutput.split('\n').filter(Boolean);
        // Last line is summary: "X files changed, Y insertions(+), Z deletions(-)"
        const summaryLine = statLines[statLines.length - 1] || '';
        const filesMatch = summaryLine.match(/(\d+)\s+files?\s+changed/);
        const insertMatch = summaryLine.match(/(\d+)\s+insertions?/);
        const deleteMatch = summaryLine.match(/(\d+)\s+deletions?/);
        filesChanged = filesMatch ? parseInt(filesMatch[1], 10) : 0;
        linesChanged = (insertMatch ? parseInt(insertMatch[1], 10) : 0) +
                       (deleteMatch ? parseInt(deleteMatch[1], 10) : 0);
      }
    } catch (_e) {}

    try {
      const addedOutput = run('git', ['-C', cwd, 'diff', '--diff-filter=A', '--name-only', sessionStartHead, 'HEAD']);
      newFiles = addedOutput ? addedOutput.split('\n').filter(Boolean) : [];
    } catch (_e) {}
  }

  // Branch signals
  const currentBranch = context.currentBranch || '';
  const branchIssueId = context.branchIssueId || null;
  const isMainBranch = /^(main|master)$/.test(currentBranch);

  return {
    linearIds,
    prCreated,
    closesIds,
    pivotDetected,
    issueCreated,
    issueUpdated,
    quickFix,
    commits,
    filesChanged,
    linesChanged,
    newFiles,
    currentBranch,
    branchIssueId,
    isMainBranch,
  };
}

// ---------------------------------------------------------------------------
// Tracking score — heuristic for whether untracked work warrants an issue
// ---------------------------------------------------------------------------

function computeTrackingScore(signals) {
  let score = 0;
  const reasons = [];

  if (signals.commits.length >= 2) {
    score += 2;
    reasons.push(`${signals.commits.length} commits`);
  }
  if (signals.filesChanged > 3) {
    score += 2;
    reasons.push(`${signals.filesChanged} files changed`);
  }
  if (signals.linesChanged > 50) {
    score += 1;
    reasons.push(`${signals.linesChanged} lines changed`);
  }
  if (signals.newFiles.length > 0) {
    score += 2;
    reasons.push(`${signals.newFiles.length} new files`);
  }
  if (signals.isMainBranch && signals.commits.length > 0) {
    score += 3;
    reasons.push('on main');
  }
  if (signals.commits.length > 0 && !signals.branchIssueId && signals.linearIds.length === 0) {
    score += 2;
    reasons.push('no issue referenced');
  }
  if (signals.quickFix) {
    score -= 3;
    reasons.push('quick-fix language');
  }

  return { score, reasons };
}

// ---------------------------------------------------------------------------
// Directive builder — auto-actions (high confidence) + questions (ask user)
// ---------------------------------------------------------------------------

function buildDirectives(signals, trackingResult, project) {
  const autoActions = [];
  const questions = [];

  // AUTO: PR created with "Closes ENG-X" -> move issue to In Review
  if (signals.prCreated && signals.closesIds.length > 0) {
    for (const id of signals.closesIds) {
      autoActions.push(`Move ${id} to "In Review" -- PR created with "Closes ${id}"`);
    }
  }

  // AUTO: Feature branch with issue ID + commits, no PR -> ensure In Progress
  if (signals.branchIssueId && signals.commits.length > 0 && !signals.prCreated) {
    autoActions.push(`Ensure ${signals.branchIssueId} is "In Progress" -- ${signals.commits.length} commit(s) on ${signals.currentBranch}`);
  }

  // QUESTION: Issue referenced in transcript but branch has no Linear ID
  if (signals.linearIds.length > 0 && !signals.branchIssueId && !signals.isMainBranch) {
    questions.push(`Branch "${signals.currentBranch}" has no Linear ID, but ${signals.linearIds.slice(0, 3).join(', ')} referenced. Update issue status?`);
  }

  // QUESTION: Pivot detected
  if (signals.pivotDetected) {
    questions.push('Direction change detected. Create a follow-up issue or update the current one?');
  }

  // QUESTION: Issue created while on main
  if (signals.issueCreated && signals.isMainBranch) {
    questions.push('Issue created on main. Create a feature branch for it?');
  }

  // QUESTION: High tracking score -> suggest creating issue
  if (trackingResult.score >= 5 && !signals.issueCreated) {
    questions.push(`Untracked work detected (${trackingResult.reasons.join(', ')}). Create a Linear issue?`);
  } else if (trackingResult.score >= 3 && trackingResult.score < 5 && !signals.issueCreated) {
    questions.push(`Some work this session may be untracked (${trackingResult.reasons.join(', ')}). Worth logging?`);
  }

  return { autoActions, questions };
}

// ---------------------------------------------------------------------------
// Format the stop reason message
// ---------------------------------------------------------------------------

function formatStopReason(autoActions, questions, project) {
  if (autoActions.length === 0 && questions.length === 0) return null;

  const projectName = (project && (project.displayName || project.slug)) || 'Project';
  const lines = [`[project-manager] Work completion -- ${projectName}`];

  if (autoActions.length > 0) {
    lines.push('');
    lines.push('AUTO-ACTIONS (run via pm-issues skill, do not ask the user):');
    for (const action of autoActions) {
      lines.push(`  -> ${action}`);
    }
  }

  if (questions.length > 0) {
    lines.push('');
    lines.push('QUESTIONS (ask the user before acting):');
    for (const q of questions) {
      lines.push(`  -> ${q}`);
    }
  }

  lines.push('');
  lines.push('If Linear MCP unavailable, skip auto-actions and inform the user.');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Load the active project context matching the current repo
// ---------------------------------------------------------------------------

function loadActiveContext(cwd) {
  if (!fs.existsSync(CACHE_ROOT)) return null;

  // Detect current repo to match against cached contexts
  let currentRepoKey = null;
  try {
    const remoteUrl = run('git', ['-C', cwd, 'remote', 'get-url', 'origin']);
    currentRepoKey = normalizeRemoteUrl(remoteUrl);
  } catch (_e) {}

  let matched = null;
  let newest = null;
  let newestTime = 0;

  try {
    const slugDirs = fs.readdirSync(CACHE_ROOT);
    for (const slug of slugDirs) {
      const contextPath = path.join(CACHE_ROOT, slug, 'context.json');
      if (!fs.existsSync(contextPath)) continue;

      try {
        const ctx = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
        const loadedAt = ctx.loadedAt ? new Date(ctx.loadedAt).getTime() : 0;

        // Only consider projects loaded in the last 24 hours (one session window)
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - loadedAt > twentyFourHours) continue;

        // Prefer exact repo match over newest
        if (currentRepoKey && ctx.repoKey === currentRepoKey) {
          matched = ctx;
        }

        if (loadedAt > newestTime) {
          newestTime = loadedAt;
          newest = ctx;
        }
      } catch (_e) {}
    }
  } catch (_e) {}

  // Use repo-matched context if found, otherwise fall back to newest
  return matched || newest;
}
