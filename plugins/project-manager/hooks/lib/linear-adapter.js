'use strict';

/**
 * Linear adapter for project-manager plugin.
 *
 * Normalizes Linear MCP list_issues response data to the shared
 * NormalizedIssue schema. This module does NOT call MCP tools --
 * it only normalizes data that the model provides after calling list_issues.
 *
 * Exports:
 *   normalizeLinearIssues(linearIssues, teamKey) - Normalize MCP response
 *   normalizeLinearState(stateName) - Map Linear state to standard vocabulary
 */

/**
 * Normalize a Linear state name to standard vocabulary.
 *
 * Maps varied Linear state names to one of five standard states:
 *   backlog, unstarted, started, completed, cancelled
 *
 * Uses includes-based matching (order matters -- check specific terms first)
 * to handle variations like "In Progress", "Started", "In Review" all mapping
 * to "started".
 *
 * @param {string|null|undefined} stateName - Raw state name from Linear
 * @returns {string} Normalized state
 */
function normalizeLinearState(stateName) {
  const lower = (stateName || '').toLowerCase();

  if (lower.includes('backlog')) return 'backlog';
  if (lower.includes('todo') || lower.includes('unstarted')) return 'unstarted';
  if (lower.includes('progress') || lower.includes('started') || lower.includes('review')) return 'started';
  if (lower.includes('done') || lower.includes('complete')) return 'completed';
  if (lower.includes('cancel')) return 'cancelled';

  return 'unstarted';
}

/**
 * Normalize raw Linear issues to the shared NormalizedIssue schema.
 *
 * Accepts the response from Linear MCP list_issues and produces
 * an object keyed by identifier (e.g., "NTH-42") with normalized fields.
 *
 * Handles both string and object shapes for state and assignee fields
 * defensively, since MCP response format may vary.
 *
 * @param {Array} linearIssues - Raw issues from Linear MCP list_issues
 * @param {string} teamKey - Team key for identifier fallback (e.g., "NTH")
 * @returns {{ issues: Object, syncedAt: string }}
 */
function normalizeLinearIssues(linearIssues, teamKey) {
  const issues = {};

  for (const raw of linearIssues) {
    const id = raw.identifier || (teamKey + '-' + raw.number);

    // State can be an object {name: '...'} or a plain string
    // Also check raw.status as an alternate field name
    const rawState = raw.state?.name || raw.state || raw.status;

    issues[id] = {
      id,
      title: raw.title,
      status: normalizeLinearState(typeof rawState === 'string' ? rawState : ''),
      priority: raw.priority || 0,
      assignee: raw.assignee?.name || raw.assignee?.displayName || null,
      description: (raw.description || '').slice(0, 500),
      updatedAt: raw.updatedAt,
      tracker: 'linear',
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}

module.exports = {
  normalizeLinearIssues,
  normalizeLinearState,
};
