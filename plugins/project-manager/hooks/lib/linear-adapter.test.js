'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLinearIssues, normalizeLinearState, normalizeLinearDelta } = require('./linear-adapter');

describe('linear-adapter', () => {
  describe('normalizeLinearState', () => {
    it('maps Backlog to backlog', () => {
      assert.equal(normalizeLinearState('Backlog'), 'backlog');
    });

    it('maps Todo to unstarted', () => {
      assert.equal(normalizeLinearState('Todo'), 'unstarted');
    });

    it('maps Unstarted to unstarted', () => {
      assert.equal(normalizeLinearState('Unstarted'), 'unstarted');
    });

    it('maps In Progress to started', () => {
      assert.equal(normalizeLinearState('In Progress'), 'started');
    });

    it('maps Started to started', () => {
      assert.equal(normalizeLinearState('Started'), 'started');
    });

    it('maps In Review to started', () => {
      assert.equal(normalizeLinearState('In Review'), 'started');
    });

    it('maps Done to completed', () => {
      assert.equal(normalizeLinearState('Done'), 'completed');
    });

    it('maps Complete to completed', () => {
      assert.equal(normalizeLinearState('Complete'), 'completed');
    });

    it('maps Cancelled to cancelled', () => {
      assert.equal(normalizeLinearState('Cancelled'), 'cancelled');
    });

    it('defaults unknown states to unstarted', () => {
      assert.equal(normalizeLinearState('SomeCustomState'), 'unstarted');
    });

    it('handles null gracefully', () => {
      assert.equal(normalizeLinearState(null), 'unstarted');
    });

    it('handles undefined gracefully', () => {
      assert.equal(normalizeLinearState(undefined), 'unstarted');
    });
  });

  describe('normalizeLinearIssues', () => {
    it('normalizes a full issue object correctly', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-42',
        title: 'Auth refactor',
        state: { name: 'In Progress' },
        priority: 2,
        assignee: { name: 'Scott' },
        description: 'Refactor the auth module',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      const issue = result.issues['NTH-42'];
      assert.equal(issue.id, 'NTH-42');
      assert.equal(issue.title, 'Auth refactor');
      assert.equal(issue.status, 'started');
      assert.equal(issue.priority, 2);
      assert.equal(issue.assignee, 'Scott');
      assert.equal(issue.description, 'Refactor the auth module');
      assert.equal(issue.updatedAt, '2026-03-10T00:00:00Z');
      assert.equal(issue.tracker, 'linear');
    });

    it('uses identifier as id', () => {
      const result = normalizeLinearIssues([{
        identifier: 'ENG-10',
        title: 'Test',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'ENG');

      assert.ok('ENG-10' in result.issues);
      assert.equal(result.issues['ENG-10'].id, 'ENG-10');
    });

    it('falls back to teamKey-number when no identifier', () => {
      const result = normalizeLinearIssues([{
        number: 7,
        title: 'Fallback',
        state: { name: 'Todo' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.ok('NTH-7' in result.issues);
      assert.equal(result.issues['NTH-7'].id, 'NTH-7');
    });

    it('handles assignee as object with name', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-1',
        title: 'Test',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: { name: 'Scott' },
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-1'].assignee, 'Scott');
    });

    it('handles assignee as object with displayName (no name)', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-2',
        title: 'Test',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: { displayName: 'Scott C' },
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-2'].assignee, 'Scott C');
    });

    it('handles null assignee', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-3',
        title: 'Test',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-3'].assignee, null);
    });

    it('handles state as object {name: "..."}', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-4',
        title: 'Test',
        state: { name: 'Done' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-4'].status, 'completed');
    });

    it('handles state as string', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-5',
        title: 'Test',
        state: 'In Progress',
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-5'].status, 'started');
    });

    it('truncates description to 500 chars', () => {
      const longDesc = 'B'.repeat(600);
      const result = normalizeLinearIssues([{
        identifier: 'NTH-6',
        title: 'Long',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: longDesc,
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-6'].description.length, 500);
    });

    it('handles null description', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-7',
        title: 'No desc',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: null,
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-7'].description, '');
    });

    it('sets tracker to linear', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-8',
        title: 'Tracked',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-8'].tracker, 'linear');
    });

    it('returns {issues, syncedAt} with correct shape', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-9',
        title: 'Shape',
        state: { name: 'Backlog' },
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.ok(typeof result.issues === 'object');
      assert.ok(typeof result.syncedAt === 'string');
      const parsed = new Date(result.syncedAt);
      assert.ok(!isNaN(parsed.getTime()), 'syncedAt should be parseable as a date');
    });

    it('handles empty array', () => {
      const result = normalizeLinearIssues([], 'NTH');
      assert.deepEqual(result.issues, {});
      assert.ok(typeof result.syncedAt === 'string');
    });

    it('defaults priority to 0 when missing', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-10',
        title: 'No priority',
        state: { name: 'Backlog' },
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-10'].priority, 0);
    });

    it('reads status from raw.status when raw.state is missing', () => {
      const result = normalizeLinearIssues([{
        identifier: 'NTH-11',
        title: 'Alt status',
        status: 'Done',
        priority: 0,
        assignee: null,
        description: '',
        updatedAt: '2026-03-10T00:00:00Z',
      }], 'NTH');

      assert.equal(result.issues['NTH-11'].status, 'completed');
    });
  });

  describe('normalizeLinearDelta', () => {
    const lastSyncedAt = '2026-03-10T00:00:00Z';

    it('includes issues updated after lastSyncedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-1', title: 'Recent', state: { name: 'In Progress' }, priority: 2, assignee: null, description: '', updatedAt: '2026-03-11T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      assert.ok('NTH-1' in result.issues);
    });

    it('excludes issues updated before lastSyncedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-2', title: 'Old', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '', updatedAt: '2026-03-09T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      assert.ok(!('NTH-2' in result.issues));
    });

    it('excludes issues updated exactly at lastSyncedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-3', title: 'Exact', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '', updatedAt: '2026-03-10T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      assert.ok(!('NTH-3' in result.issues));
    });

    it('excludes issues with null updatedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-4', title: 'Null date', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '', updatedAt: null }
      ], 'NTH', lastSyncedAt);

      assert.ok(!('NTH-4' in result.issues));
    });

    it('excludes issues with missing updatedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-5', title: 'Missing date', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '' }
      ], 'NTH', lastSyncedAt);

      assert.ok(!('NTH-5' in result.issues));
    });

    it('returns empty issues when all are older than lastSyncedAt', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-6', title: 'Old1', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '', updatedAt: '2026-03-09T00:00:00Z' },
        { identifier: 'NTH-7', title: 'Old2', state: { name: 'Backlog' }, priority: 0, assignee: null, description: '', updatedAt: '2026-03-08T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      assert.deepEqual(result.issues, {});
    });

    it('returns {issues, syncedAt} shape', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-8', title: 'Recent', state: { name: 'In Progress' }, priority: 1, assignee: null, description: '', updatedAt: '2026-03-11T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      assert.ok(typeof result.issues === 'object');
      assert.ok(typeof result.syncedAt === 'string');
    });

    it('delegates normalization to normalizeLinearIssues', () => {
      const result = normalizeLinearDelta([
        { identifier: 'NTH-9', title: 'Delegated', state: { name: 'Done' }, priority: 3, assignee: { name: 'Scott' }, description: 'desc', updatedAt: '2026-03-11T00:00:00Z' }
      ], 'NTH', lastSyncedAt);

      const issue = result.issues['NTH-9'];
      assert.equal(issue.status, 'completed');
      assert.equal(issue.tracker, 'linear');
      assert.equal(issue.assignee, 'Scott');
    });
  });
});
