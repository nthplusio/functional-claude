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

  describe('exports', () => {
    it('CACHE_VERSION is 1', () => {
      assert.equal(CACHE_VERSION, 1);
    });

    it('CACHE_ROOT is a string under .claude/project-manager/cache', () => {
      assert.ok(typeof CACHE_ROOT === 'string');
      assert.ok(CACHE_ROOT.includes(path.join('.claude', 'project-manager', 'cache')));
    });
  });
});
