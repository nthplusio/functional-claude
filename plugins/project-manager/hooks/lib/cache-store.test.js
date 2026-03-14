'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  getCacheDir,
  readIssues,
  writeIssues,
  readSyncMeta,
  writeSyncMeta,
  mergeIssues,
  diffIssues,
  formatChangeSummary,
  classifyFreshness,
  formatAge,
  CACHE_VERSION,
  CACHE_ROOT,
} = require('./cache-store.js');

// Helper: create isolated temp directory for each test suite
function makeTmpRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cache-store-test-'));
}

// Helper: recursively remove temp directory
function cleanTmpRoot(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_e) { /* best effort */ }
}

// Sample issue data matching the cache schema
function sampleData(tracker = 'linear') {
  return {
    version: CACHE_VERSION,
    tracker,
    syncedAt: '2026-03-12T10:30:00.000Z',
    issues: {
      'NTH-42': {
        id: 'NTH-42',
        title: 'Auth middleware refactor',
        status: 'started',
        priority: 2,
        assignee: 'Scott',
        description: 'Refactor the auth middleware to support...',
        updatedAt: '2026-03-10T14:30:00.000Z',
        tracker: 'linear',
      },
    },
  };
}

describe('cache-store', () => {
  let tmpRoot;

  beforeEach(() => {
    tmpRoot = makeTmpRoot();
  });

  afterEach(() => {
    cleanTmpRoot(tmpRoot);
  });

  describe('writeIssues', () => {
    it('writes valid JSON to cache/<slug>/issues.json', () => {
      const data = sampleData();
      const result = writeIssues('test-slug', data, tmpRoot);
      assert.equal(result, true);

      const filePath = path.join(tmpRoot, 'test-slug', 'issues.json');
      assert.ok(fs.existsSync(filePath), 'issues.json should exist');

      const written = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert.equal(written.version, CACHE_VERSION);
      assert.equal(written.tracker, 'linear');
      assert.equal(written.syncedAt, '2026-03-12T10:30:00.000Z');
      assert.deepEqual(written.issues['NTH-42'].id, 'NTH-42');
    });

    it('creates directory if it does not exist', () => {
      const slugDir = path.join(tmpRoot, 'new-slug');
      assert.ok(!fs.existsSync(slugDir), 'directory should not exist yet');

      writeIssues('new-slug', sampleData(), tmpRoot);
      assert.ok(fs.existsSync(slugDir), 'directory should be created');
    });

    it('atomic: no .tmp file remains after write', () => {
      writeIssues('test-slug', sampleData(), tmpRoot);

      const slugDir = path.join(tmpRoot, 'test-slug');
      const files = fs.readdirSync(slugDir);
      const tmpFiles = files.filter(f => f.includes('.tmp.'));
      assert.equal(tmpFiles.length, 0, 'no .tmp files should remain');
    });

    it('creates .bak of previous file before overwriting', () => {
      const data1 = sampleData();
      data1.syncedAt = '2026-03-11T00:00:00.000Z';
      writeIssues('test-slug', data1, tmpRoot);

      const data2 = sampleData();
      data2.syncedAt = '2026-03-12T00:00:00.000Z';
      writeIssues('test-slug', data2, tmpRoot);

      const bakPath = path.join(tmpRoot, 'test-slug', 'issues.json.bak');
      assert.ok(fs.existsSync(bakPath), '.bak file should exist');

      const bakData = JSON.parse(fs.readFileSync(bakPath, 'utf8'));
      assert.equal(bakData.syncedAt, '2026-03-11T00:00:00.000Z',
        '.bak should contain previous data');
    });

    it('returns false (not throws) on permission error', () => {
      // Create a read-only directory to force permission failure
      const readOnlyDir = path.join(tmpRoot, 'readonly');
      fs.mkdirSync(readOnlyDir, { recursive: true });
      fs.chmodSync(readOnlyDir, 0o444);

      // writeIssues should fail gracefully when it cannot create sub-directory
      const result = writeIssues('sub-slug', sampleData(), readOnlyDir);
      assert.equal(result, false, 'should return false on permission error');

      // Restore permissions for cleanup
      fs.chmodSync(readOnlyDir, 0o755);
    });
  });

  describe('readIssues', () => {
    it('reads and parses valid issues.json', () => {
      const data = sampleData('github');
      writeIssues('read-slug', data, tmpRoot);

      const result = readIssues('read-slug', tmpRoot);
      assert.ok(result !== null, 'should return data');
      assert.equal(result.version, CACHE_VERSION);
      assert.equal(result.tracker, 'github');
      assert.equal(result.issues['NTH-42'].title, 'Auth middleware refactor');
    });

    it('returns null when file does not exist', () => {
      const result = readIssues('nonexistent-slug', tmpRoot);
      assert.equal(result, null);
    });

    it('returns null when file is corrupt and no .bak', () => {
      const slugDir = path.join(tmpRoot, 'corrupt-slug');
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'issues.json'), '{broken json!!!', 'utf8');

      const result = readIssues('corrupt-slug', tmpRoot);
      assert.equal(result, null);
    });

    it('falls back to .bak when primary is corrupt', () => {
      const data = sampleData();
      const slugDir = path.join(tmpRoot, 'fallback-slug');
      fs.mkdirSync(slugDir, { recursive: true });

      // Write valid .bak
      fs.writeFileSync(
        path.join(slugDir, 'issues.json.bak'),
        JSON.stringify(data, null, 2),
        'utf8'
      );
      // Write corrupt primary
      fs.writeFileSync(
        path.join(slugDir, 'issues.json'),
        'not valid json {{{',
        'utf8'
      );

      const result = readIssues('fallback-slug', tmpRoot);
      assert.ok(result !== null, 'should fall back to .bak');
      assert.equal(result.version, CACHE_VERSION);
      assert.equal(result.issues['NTH-42'].id, 'NTH-42');
    });

    it('returns null when both primary and .bak are corrupt', () => {
      const slugDir = path.join(tmpRoot, 'both-corrupt');
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'issues.json'), 'bad', 'utf8');
      fs.writeFileSync(path.join(slugDir, 'issues.json.bak'), 'also bad', 'utf8');

      const result = readIssues('both-corrupt', tmpRoot);
      assert.equal(result, null);
    });
  });

  describe('isolation', () => {
    it('different slugs write to different directories', () => {
      const dataA = sampleData();
      dataA.tracker = 'github';
      const dataB = sampleData();
      dataB.tracker = 'linear';

      writeIssues('slug-a', dataA, tmpRoot);
      writeIssues('slug-b', dataB, tmpRoot);

      const fileA = path.join(tmpRoot, 'slug-a', 'issues.json');
      const fileB = path.join(tmpRoot, 'slug-b', 'issues.json');
      assert.ok(fs.existsSync(fileA), 'slug-a file should exist');
      assert.ok(fs.existsSync(fileB), 'slug-b file should exist');
      assert.notEqual(fileA, fileB, 'paths should differ');
    });

    it('reading slug-a does not return slug-b data', () => {
      const dataA = sampleData();
      dataA.tracker = 'github';
      const dataB = sampleData();
      dataB.tracker = 'linear';

      writeIssues('slug-a', dataA, tmpRoot);
      writeIssues('slug-b', dataB, tmpRoot);

      const resultA = readIssues('slug-a', tmpRoot);
      const resultB = readIssues('slug-b', tmpRoot);
      assert.equal(resultA.tracker, 'github');
      assert.equal(resultB.tracker, 'linear');
    });
  });

  describe('getCacheDir', () => {
    it('returns path under cache root with slug', () => {
      const dir = getCacheDir('my-slug', tmpRoot);
      assert.equal(dir, path.join(tmpRoot, 'my-slug'));
    });

    it('creates directory if missing', () => {
      const dir = getCacheDir('auto-create', tmpRoot);
      assert.ok(fs.existsSync(dir), 'directory should be created');
    });
  });

  describe('readSyncMeta', () => {
    it('returns parsed sync-meta.json when file exists and has version field', () => {
      const meta = {
        version: 1,
        lastSyncedAt: '2026-03-13T10:30:00.000Z',
        lastFullSyncAt: '2026-03-12T08:00:00.000Z',
        ttlHours: 24,
        issueCount: 12,
        syncType: 'delta',
        provider: 'linear',
      };
      const slugDir = path.join(tmpRoot, 'sync-slug');
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'sync-meta.json'), JSON.stringify(meta), 'utf8');

      const result = readSyncMeta('sync-slug', tmpRoot);
      assert.ok(result !== null, 'should return parsed data');
      assert.equal(result.version, 1);
      assert.equal(result.lastSyncedAt, '2026-03-13T10:30:00.000Z');
      assert.equal(result.provider, 'linear');
    });

    it('returns null when file does not exist', () => {
      const result = readSyncMeta('no-such-slug', tmpRoot);
      assert.equal(result, null);
    });

    it('returns null when file contains invalid JSON', () => {
      const slugDir = path.join(tmpRoot, 'bad-json-slug');
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'sync-meta.json'), '{broken!!!', 'utf8');

      const result = readSyncMeta('bad-json-slug', tmpRoot);
      assert.equal(result, null);
    });

    it('returns null when parsed data has no version field', () => {
      const slugDir = path.join(tmpRoot, 'no-version-slug');
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(
        path.join(slugDir, 'sync-meta.json'),
        JSON.stringify({ lastSyncedAt: '2026-03-13T10:30:00.000Z' }),
        'utf8'
      );

      const result = readSyncMeta('no-version-slug', tmpRoot);
      assert.equal(result, null);
    });
  });

  describe('writeSyncMeta', () => {
    it('writes sync-meta.json atomically and returns true', () => {
      const meta = {
        version: 1,
        lastSyncedAt: '2026-03-13T10:30:00.000Z',
        lastFullSyncAt: '2026-03-12T08:00:00.000Z',
        ttlHours: 24,
        issueCount: 12,
        syncType: 'delta',
        provider: 'linear',
      };
      const result = writeSyncMeta('write-sync-slug', meta, tmpRoot);
      assert.equal(result, true);

      const filePath = path.join(tmpRoot, 'write-sync-slug', 'sync-meta.json');
      assert.ok(fs.existsSync(filePath), 'sync-meta.json should exist');

      const written = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert.deepEqual(written, meta);
    });

    it('returns false (not throws) on permission error', () => {
      const readOnlyDir = path.join(tmpRoot, 'readonly-sync');
      fs.mkdirSync(readOnlyDir, { recursive: true });
      fs.chmodSync(readOnlyDir, 0o444);

      const result = writeSyncMeta('sub-slug', { version: 1 }, readOnlyDir);
      assert.equal(result, false, 'should return false on permission error');

      fs.chmodSync(readOnlyDir, 0o755);
    });

    it('no .tmp file remains after successful write', () => {
      writeSyncMeta('clean-slug', { version: 1, lastSyncedAt: '2026-03-13T00:00:00.000Z' }, tmpRoot);

      const slugDir = path.join(tmpRoot, 'clean-slug');
      const files = fs.readdirSync(slugDir);
      const tmpFiles = files.filter(f => f.includes('.tmp.'));
      assert.equal(tmpFiles.length, 0, 'no .tmp files should remain');
    });
  });

  describe('mergeIssues', () => {
    it('overlays delta issues onto existing, preserving untouched entries', () => {
      const existing = sampleData();
      existing.issues['NTH-99'] = {
        id: 'NTH-99', title: 'Untouched issue', status: 'todo',
        priority: 3, assignee: 'Jane', description: 'Stays the same',
        updatedAt: '2026-03-10T00:00:00.000Z', tracker: 'linear',
      };

      const delta = {
        syncedAt: '2026-03-13T12:00:00.000Z',
        issues: {
          'NTH-42': {
            id: 'NTH-42', title: 'Auth middleware refactor', status: 'done',
            priority: 2, assignee: 'Scott', description: 'Refactored',
            updatedAt: '2026-03-13T11:00:00.000Z', tracker: 'linear',
          },
        },
      };

      const result = mergeIssues(existing, delta);

      // NTH-42 updated to delta version
      assert.equal(result.issues['NTH-42'].status, 'done');
      // NTH-99 preserved unchanged
      assert.equal(result.issues['NTH-99'].title, 'Untouched issue');
    });

    it('updates existing issues with delta version', () => {
      const existing = sampleData();
      const delta = {
        syncedAt: '2026-03-13T12:00:00.000Z',
        issues: {
          'NTH-42': {
            id: 'NTH-42', title: 'Updated title', status: 'done',
            priority: 1, assignee: 'Scott', description: 'Updated',
            updatedAt: '2026-03-13T11:00:00.000Z', tracker: 'linear',
          },
        },
      };

      const result = mergeIssues(existing, delta);
      assert.equal(result.issues['NTH-42'].title, 'Updated title');
      assert.equal(result.issues['NTH-42'].priority, 1);
    });

    it('adds new issues from delta', () => {
      const existing = sampleData();
      const delta = {
        syncedAt: '2026-03-13T12:00:00.000Z',
        issues: {
          'NTH-100': {
            id: 'NTH-100', title: 'Brand new issue', status: 'todo',
            priority: 4, assignee: 'Bob', description: 'New',
            updatedAt: '2026-03-13T11:00:00.000Z', tracker: 'linear',
          },
        },
      };

      const result = mergeIssues(existing, delta);
      assert.ok(result.issues['NTH-100'], 'new issue should be added');
      assert.equal(result.issues['NTH-100'].title, 'Brand new issue');
      // Original still there
      assert.ok(result.issues['NTH-42'], 'existing issue should remain');
    });

    it('result has version and tracker from existingData, syncedAt from deltaResult', () => {
      const existing = sampleData();
      existing.version = 1;
      existing.tracker = 'linear';
      const delta = {
        syncedAt: '2026-03-13T15:00:00.000Z',
        issues: {},
      };

      const result = mergeIssues(existing, delta);
      assert.equal(result.version, 1);
      assert.equal(result.tracker, 'linear');
      assert.equal(result.syncedAt, '2026-03-13T15:00:00.000Z');
    });

    it('does not mutate the original existingData object', () => {
      const existing = sampleData();
      const originalSyncedAt = existing.syncedAt;
      const originalIssueStatus = existing.issues['NTH-42'].status;

      const delta = {
        syncedAt: '2026-03-13T12:00:00.000Z',
        issues: {
          'NTH-42': {
            id: 'NTH-42', title: 'Changed', status: 'done',
            priority: 2, assignee: 'Scott', description: 'Changed',
            updatedAt: '2026-03-13T11:00:00.000Z', tracker: 'linear',
          },
        },
      };

      mergeIssues(existing, delta);

      // Original should be unchanged
      assert.equal(existing.syncedAt, originalSyncedAt);
      assert.equal(existing.issues['NTH-42'].status, originalIssueStatus);
    });
  });

  describe('classifyFreshness', () => {
    it('returns FRESH when lastSyncedAt < 1 hour ago', () => {
      const now = new Date();
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

      const result = classifyFreshness({
        lastSyncedAt: thirtyMinAgo,
        lastFullSyncAt: twoHoursAgo,
        ttlHours: 24,
      });
      assert.equal(result.tier, 'FRESH');
      assert.ok(typeof result.age === 'number');
      assert.ok(typeof result.message === 'string');
    });

    it('returns STALE when lastSyncedAt > 1 hour but lastFullSyncAt within TTL', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();

      const result = classifyFreshness({
        lastSyncedAt: twoHoursAgo,
        lastFullSyncAt: twelveHoursAgo,
        ttlHours: 24,
      });
      assert.equal(result.tier, 'STALE');
    });

    it('returns EXPIRED when lastFullSyncAt > TTL', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

      const result = classifyFreshness({
        lastSyncedAt: twoHoursAgo,
        lastFullSyncAt: threeDaysAgo,
        ttlHours: 24,
      });
      assert.equal(result.tier, 'EXPIRED');
    });

    it('uses default ttlHours of 24 when missing from syncMeta', () => {
      const now = new Date();
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();

      // No ttlHours provided -- should default to 24
      const result = classifyFreshness({
        lastSyncedAt: thirtyMinAgo,
        lastFullSyncAt: twelveHoursAgo,
      });
      // lastSyncedAt < 1h => FRESH, lastFullSyncAt 12h < 24h default TTL
      assert.equal(result.tier, 'FRESH');
    });
  });

  describe('formatAge', () => {
    it('returns "Xm" for durations under 1 hour', () => {
      assert.equal(formatAge(30 * 60 * 1000), '30m');
      assert.equal(formatAge(59 * 60 * 1000), '59m');
    });

    it('returns "Xh" for durations under 24 hours', () => {
      assert.equal(formatAge(60 * 60 * 1000), '1h');
      assert.equal(formatAge(23 * 60 * 60 * 1000), '23h');
    });

    it('returns "Xd" for durations 24+ hours', () => {
      assert.equal(formatAge(24 * 60 * 60 * 1000), '1d');
      assert.equal(formatAge(72 * 60 * 60 * 1000), '3d');
    });

    it('edge case: 0ms returns "0m"', () => {
      assert.equal(formatAge(0), '0m');
    });
  });

  describe('diffIssues', () => {
    it('returns empty array when deltaIssues is empty', () => {
      const existing = {
        'NTH-1': {
          id: 'NTH-1', title: 'Existing issue', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, {});
      assert.deepEqual(result, []);
    });

    it('marks new issues not in existing cache', () => {
      const delta = {
        'NTH-1': {
          id: 'NTH-1', title: 'Brand new issue', status: 'unstarted',
          priority: 3, assignee: 'Jane', description: 'New desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues({}, delta);
      assert.equal(result.length, 1);
      assert.equal(result[0].id, 'NTH-1');
      assert.equal(result[0].type, 'new');
      assert.equal(result[0].title, 'Brand new issue');
      assert.deepEqual(result[0].fields, []);
    });

    it('detects status field change', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'completed',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 1);
      assert.equal(result[0].type, 'updated');
      assert.equal(result[0].fields.length, 1);
      assert.deepEqual(result[0].fields[0], { field: 'status', from: 'started', to: 'completed' });
    });

    it('detects priority field change', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 1, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 1);
      assert.deepEqual(result[0].fields[0], { field: 'priority', from: 2, to: 1 });
    });

    it('detects assignee field change', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Jane', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 1);
      assert.deepEqual(result[0].fields[0], { field: 'assignee', from: 'Scott', to: 'Jane' });
    });

    it('detects title field change', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Old title', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'New title', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 1);
      assert.deepEqual(result[0].fields[0], { field: 'title', from: 'Old title', to: 'New title' });
    });

    it('detects multiple field changes on same issue', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'completed',
          priority: 1, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 1);
      assert.equal(result[0].fields.length, 2);
    });

    it('omits issues where only updatedAt changed', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Desc',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 0);
    });

    it('does not diff description field', () => {
      const existing = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'Old description',
          updatedAt: '2026-03-10T14:30:00.000Z', tracker: 'linear',
        },
      };
      const delta = {
        'NTH-42': {
          id: 'NTH-42', title: 'Auth refactor', status: 'started',
          priority: 2, assignee: 'Scott', description: 'New description',
          updatedAt: '2026-03-13T10:00:00.000Z', tracker: 'linear',
        },
      };
      const result = diffIssues(existing, delta);
      assert.equal(result.length, 0);
    });
  });

  describe('formatChangeSummary', () => {
    it('returns no-changes message for empty array', () => {
      const result = formatChangeSummary([]);
      assert.equal(result, 'No changes since last sync');
    });

    it('formats status change with field values', () => {
      const changes = [{
        id: 'NTH-42', type: 'updated', title: 'Auth refactor',
        fields: [{ field: 'status', from: 'started', to: 'completed' }],
      }];
      const result = formatChangeSummary(changes);
      assert.ok(result.includes('started -> completed'), 'should include status transition');
      assert.ok(result.includes('NTH-42'), 'should include issue ID');
    });

    it('formats new issue', () => {
      const changes = [{
        id: 'NTH-105', type: 'new', title: 'New dashboard layout', fields: [],
      }];
      const result = formatChangeSummary(changes);
      assert.ok(result.includes('(new)'), 'should include (new) marker');
      assert.ok(result.includes('NTH-105'), 'should include issue ID');
      assert.ok(result.includes('New dashboard layout'), 'should include title');
    });

    it('formats priority with labels not numbers', () => {
      const changes = [{
        id: 'NTH-42', type: 'updated', title: 'Auth refactor',
        fields: [{ field: 'priority', from: 2, to: 1 }],
      }];
      const result = formatChangeSummary(changes);
      assert.ok(result.includes('High -> Urgent'), 'should use priority labels not numbers');
    });

    it('formats assignee null as unassigned', () => {
      const changes = [{
        id: 'NTH-42', type: 'updated', title: 'Auth refactor',
        fields: [{ field: 'assignee', from: null, to: 'Scott' }],
      }];
      const result = formatChangeSummary(changes);
      assert.ok(result.includes('(unassigned) -> Scott'), 'should format null as (unassigned)');
    });

    it('includes issue count line', () => {
      const changes = [
        { id: 'NTH-42', type: 'updated', title: 'Auth refactor', fields: [{ field: 'status', from: 'started', to: 'completed' }] },
        { id: 'NTH-105', type: 'new', title: 'New layout', fields: [] },
      ];
      const result = formatChangeSummary(changes);
      assert.ok(result.includes('2 issue(s) changed'), 'should include count line');
    });
  });

  describe('exports', () => {
    it('CACHE_VERSION is 1', () => {
      assert.equal(CACHE_VERSION, 1);
    });

    it('CACHE_ROOT is a string under .claude/project-manager/cache', () => {
      assert.ok(typeof CACHE_ROOT === 'string');
      assert.ok(CACHE_ROOT.includes(path.join('.claude', 'project-manager', 'cache')));
    });

    it('exports all expected functions', () => {
      assert.equal(typeof readSyncMeta, 'function');
      assert.equal(typeof writeSyncMeta, 'function');
      assert.equal(typeof mergeIssues, 'function');
      assert.equal(typeof diffIssues, 'function');
      assert.equal(typeof formatChangeSummary, 'function');
      assert.equal(typeof classifyFreshness, 'function');
      assert.equal(typeof formatAge, 'function');
    });
  });
});
