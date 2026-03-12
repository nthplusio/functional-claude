'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeGitHubIssues, extractPriorityFromLabels } = require('./github-adapter');

describe('github-adapter', () => {
  describe('normalizeGitHubIssues', () => {
    it('normalizes OPEN state (uppercase) to started', () => {
      const result = normalizeGitHubIssues([
        { number: 1, title: 'Bug', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#1'].status, 'started');
    });

    it('normalizes CLOSED state (uppercase) to completed', () => {
      const result = normalizeGitHubIssues([
        { number: 2, title: 'Done', state: 'CLOSED', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#2'].status, 'completed');
    });

    it('handles lowercase state open (gh api compatibility)', () => {
      const result = normalizeGitHubIssues([
        { number: 3, title: 'Open', state: 'open', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#3'].status, 'started');
    });

    it('handles lowercase state closed (gh api compatibility)', () => {
      const result = normalizeGitHubIssues([
        { number: 4, title: 'Closed', state: 'closed', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#4'].status, 'completed');
    });

    it('extracts first assignee login', () => {
      const result = normalizeGitHubIssues([
        { number: 5, title: 'Assigned', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [{ login: 'scott' }, { login: 'other' }], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#5'].assignee, 'scott');
    });

    it('returns null assignee when assignees array is empty', () => {
      const result = normalizeGitHubIssues([
        { number: 6, title: 'Unassigned', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#6'].assignee, null);
    });

    it('truncates body to 500 characters', () => {
      const longBody = 'A'.repeat(600);
      const result = normalizeGitHubIssues([
        { number: 7, title: 'Long', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: longBody }
      ]);
      assert.equal(result.issues['#7'].description.length, 500);
    });

    it('handles null body gracefully', () => {
      const result = normalizeGitHubIssues([
        { number: 8, title: 'No body', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: null }
      ]);
      assert.equal(result.issues['#8'].description, '');
    });

    it('extracts priority from labels (priority:urgent -> 1)', () => {
      const result = normalizeGitHubIssues([
        { number: 9, title: 'Urgent', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [{ name: 'priority:urgent' }], body: '' }
      ]);
      assert.equal(result.issues['#9'].priority, 1);
    });

    it('extracts priority from labels (priority:high -> 2)', () => {
      const result = normalizeGitHubIssues([
        { number: 10, title: 'High', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [{ name: 'priority:high' }], body: '' }
      ]);
      assert.equal(result.issues['#10'].priority, 2);
    });

    it('extracts priority from labels (priority:medium -> 3)', () => {
      const result = normalizeGitHubIssues([
        { number: 11, title: 'Medium', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [{ name: 'priority:medium' }], body: '' }
      ]);
      assert.equal(result.issues['#11'].priority, 3);
    });

    it('extracts priority from labels (priority:low -> 4)', () => {
      const result = normalizeGitHubIssues([
        { number: 12, title: 'Low', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [{ name: 'priority:low' }], body: '' }
      ]);
      assert.equal(result.issues['#12'].priority, 4);
    });

    it('defaults priority to 0 when no priority label', () => {
      const result = normalizeGitHubIssues([
        { number: 13, title: 'No priority', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [{ name: 'bug' }], body: '' }
      ]);
      assert.equal(result.issues['#13'].priority, 0);
    });

    it('sets tracker to github on every issue', () => {
      const result = normalizeGitHubIssues([
        { number: 14, title: 'Tracked', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.equal(result.issues['#14'].tracker, 'github');
    });

    it('handles empty array input', () => {
      const result = normalizeGitHubIssues([]);
      assert.deepEqual(result.issues, {});
      assert.ok(typeof result.syncedAt === 'string');
    });

    it('keys issues by #number format', () => {
      const result = normalizeGitHubIssues([
        { number: 42, title: 'Keyed', state: 'OPEN', updatedAt: '2026-03-10T00:00:00Z', assignees: [], labels: [], body: '' }
      ]);
      assert.ok('#42' in result.issues);
      assert.equal(result.issues['#42'].id, '#42');
    });

    it('syncedAt is a valid ISO 8601 string', () => {
      const result = normalizeGitHubIssues([]);
      const parsed = new Date(result.syncedAt);
      assert.ok(!isNaN(parsed.getTime()), 'syncedAt should be parseable as a date');
      assert.ok(result.syncedAt.includes('T'), 'syncedAt should contain T separator');
    });

    it('normalizes a full issue with all fields', () => {
      const result = normalizeGitHubIssues([{
        number: 1,
        title: 'Bug report',
        state: 'OPEN',
        updatedAt: '2026-03-10T00:00:00Z',
        assignees: [{ login: 'scott' }],
        labels: [{ name: 'priority:high' }, { name: 'bug' }],
        body: 'Description of the bug'
      }]);

      const issue = result.issues['#1'];
      assert.equal(issue.id, '#1');
      assert.equal(issue.title, 'Bug report');
      assert.equal(issue.status, 'started');
      assert.equal(issue.priority, 2);
      assert.equal(issue.assignee, 'scott');
      assert.equal(issue.description, 'Description of the bug');
      assert.equal(issue.updatedAt, '2026-03-10T00:00:00Z');
      assert.equal(issue.tracker, 'github');
    });
  });

  describe('extractPriorityFromLabels', () => {
    it('returns 1 for priority:urgent', () => {
      assert.equal(extractPriorityFromLabels([{ name: 'priority:urgent' }]), 1);
    });

    it('returns 2 for priority:high', () => {
      assert.equal(extractPriorityFromLabels([{ name: 'priority:high' }]), 2);
    });

    it('returns 3 for priority:medium', () => {
      assert.equal(extractPriorityFromLabels([{ name: 'priority:medium' }]), 3);
    });

    it('returns 4 for priority:low', () => {
      assert.equal(extractPriorityFromLabels([{ name: 'priority:low' }]), 4);
    });

    it('returns 0 when no priority label exists', () => {
      assert.equal(extractPriorityFromLabels([{ name: 'bug' }, { name: 'enhancement' }]), 0);
    });

    it('returns 0 for empty labels array', () => {
      assert.equal(extractPriorityFromLabels([]), 0);
    });
  });
});
