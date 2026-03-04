#!/usr/bin/env node
// pm-session-end.js
// Stop hook: scans transcript for project-manager activity and prompts
// for a lightweight session wrap-up if Linear/PR work was detected.
//
// Input:  JSON on stdin with { transcript_path, stop_hook_active, cwd }
// Output: JSON { stopReason?: "..." }

'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_ROOT = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'project-manager', 'cache'
);

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('error', () => { console.log(JSON.stringify({})); });

process.stdin.on('end', () => {
  try {
    main();
  } catch (_err) {
    console.log(JSON.stringify({}));
  }
});

function main() {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (_e) {}

  // Guard: prevent infinite loop when our stopReason triggers a new turn
  if (data.stop_hook_active === true) {
    console.log(JSON.stringify({}));
    return;
  }

  // No transcript → nothing to scan
  const transcriptPath = data.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    console.log(JSON.stringify({}));
    return;
  }

  // Load the most recently active project context from cache
  const project = loadActiveProject();
  if (!project) {
    // No managed project was active this session
    console.log(JSON.stringify({}));
    return;
  }

  // Read transcript as raw text for pattern scanning
  let transcript = '';
  try {
    transcript = fs.readFileSync(transcriptPath, 'utf8');
  } catch (_e) {
    console.log(JSON.stringify({}));
    return;
  }

  // Build Linear ID pattern from team key (e.g. ENG-42) or fall back to generic
  const teamKey = project.linear_team_key || '[A-Z]+';
  const linearIdPattern = new RegExp(`\\b${teamKey}-\\d+\\b`, 'gi');

  // Extract all unique Linear IDs mentioned in the transcript
  const linearIds = [...new Set(transcript.match(linearIdPattern) || [])];

  // Detect categories of project activity
  const signals = {
    issues:   linearIds.length > 0,
    pr:       /gh\s+pr\s+create|pull\s+request|Closes\s+[A-Z]+-\d+/i.test(transcript),
    pivot:    /\b(pivot|change\s+direction|different\s+approach|rethink|abandon|wrong\s+approach|start\s+over)\b/i.test(transcript),
    branch:   /git\s+checkout\s+-b|feat\/|fix\/|chore\/|refactor\//i.test(transcript),
    created:  /linear_create_issue|created.*issue|new\s+issue/i.test(transcript),
    updated:  /linear_update_issue|updated.*issue/i.test(transcript),
  };

  const anyActivity = Object.values(signals).some(Boolean);
  if (!anyActivity) {
    console.log(JSON.stringify({}));
    return;
  }

  // Build a concise, contextual prompt
  const lines = [
    `[project-manager] Session wrap-up — ${project.displayName || project.slug}`,
  ];

  if (linearIds.length > 0) {
    lines.push(`Issues touched: ${linearIds.slice(0, 5).join(', ')}${linearIds.length > 5 ? ` +${linearIds.length - 5} more` : ''}`);
  }

  const prompts = [];
  if (signals.pivot)   prompts.push('Direction changed — update or cancel the old issue?');
  if (signals.pr)      prompts.push('PR opened — verify Linear issue is linked and will auto-close');
  if (signals.created) prompts.push('New issue created — are acceptance criteria clear and testable?');
  if (signals.updated) prompts.push('Issue updated — does it still reflect the actual goal?');
  if (signals.issues && !signals.created && !signals.updated && !signals.pr && !signals.pivot) {
    prompts.push('Any issue updates needed before next session?');
  }

  if (prompts.length > 0) {
    prompts.forEach(p => lines.push(`→ ${p}`));
  }

  lines.push(`Run /pm to review current state, or ignore to skip.`);

  console.log(JSON.stringify({ stopReason: lines.join('\n') }));
}

function loadActiveProject() {
  if (!fs.existsSync(CACHE_ROOT)) return null;

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

        if (loadedAt > newestTime) {
          newestTime = loadedAt;
          newest = ctx.project || null;
        }
      } catch (_e) {}
    }
  } catch (_e) {}

  return newest;
}
