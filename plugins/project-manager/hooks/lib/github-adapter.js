'use strict';

const { execFileSync } = require('child_process');
const { CACHE_VERSION } = require('./cache-store');

/**
 * GitHub adapter for project-manager plugin.
 *
 * Fetches all issues from a GitHub repo via `gh issue list --json`,
 * normalizes them to the shared NormalizedIssue schema, and returns
 * data shaped for cache-store.writeIssues().
 *
 * Exports:
 *   fetchAll(projectConfig) - CLI-based full sync
 *   normalizeGitHubIssues(rawIssues) - Pure normalization
 *   extractPriorityFromLabels(labels) - Priority label extraction
 */

/**
 * Priority label mapping.
 * GitHub issues use labels like "priority:high" to indicate priority.
 */
const PRIORITY_MAP = {
  'priority:urgent': 1,
  'priority:high': 2,
  'priority:medium': 3,
  'priority:low': 4,
};

/**
 * Extract numeric priority from GitHub issue labels.
 *
 * Scans labels for names matching "priority:<level>" and returns
 * the corresponding numeric value. Returns 0 if no priority label found.
 *
 * @param {Array<{name: string}>} labels - GitHub label objects
 * @returns {number} Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low
 */
function extractPriorityFromLabels(labels) {
  if (!labels || !labels.length) return 0;
  for (const label of labels) {
    const priority = PRIORITY_MAP[label.name];
    if (priority !== undefined) return priority;
  }
  return 0;
}

/**
 * Normalize raw GitHub issues to the shared NormalizedIssue schema.
 *
 * Accepts the JSON output from `gh issue list --json` and produces
 * an object keyed by "#<number>" with normalized fields.
 *
 * Handles both uppercase (OPEN/CLOSED from gh issue list) and
 * lowercase (open/closed from gh api) state values.
 *
 * @param {Array} rawIssues - Raw issues from gh CLI JSON output
 * @returns {{ issues: Object, syncedAt: string }}
 */
function normalizeGitHubIssues(rawIssues) {
  const issues = {};

  for (const raw of rawIssues) {
    const id = '#' + raw.number;
    issues[id] = {
      id,
      title: raw.title,
      status: raw.state.toLowerCase() === 'open' ? 'started' : 'completed',
      priority: extractPriorityFromLabels(raw.labels),
      assignee: raw.assignees?.[0]?.login || null,
      description: (raw.body || '').slice(0, 500),
      updatedAt: raw.updatedAt,
      tracker: 'github',
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}

/**
 * Fetch all issues from a GitHub repo and return cache-ready data.
 *
 * Uses execFileSync (no shell) with the gh CLI to fetch issues.
 * Does NOT wrap in try/catch -- let caller handle errors
 * (fail-open is the sync orchestrator's job, not the adapter's).
 *
 * @param {object} projectConfig - Project config with repoKey
 * @returns {{ version: number, tracker: string, issues: Object, syncedAt: string }}
 */
function fetchAll(projectConfig) {
  const repoKey = projectConfig.repoKey;

  const output = execFileSync('gh', [
    'issue', 'list',
    '--repo', repoKey,
    '--json', 'number,title,state,updatedAt,assignees,labels,body',
    '--state', 'all',
    '--limit', '200',
  ], {
    encoding: 'utf8',
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const rawIssues = JSON.parse(output);
  const result = normalizeGitHubIssues(rawIssues);

  return {
    version: CACHE_VERSION,
    tracker: 'github',
    ...result,
  };
}

module.exports = {
  fetchAll,
  normalizeGitHubIssues,
  extractPriorityFromLabels,
};
