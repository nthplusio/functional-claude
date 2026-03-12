'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Cache store module for project-manager plugin.
 *
 * Provides reliable, corruption-safe JSON cache storage with:
 * - Per-project isolation (each slug gets its own directory)
 * - Atomic writes (temp file + rename, never partial writes)
 * - Backup recovery (.bak fallback on corrupt primary)
 * - Fail-open error handling (never throws, returns safe defaults)
 */

const CACHE_VERSION = 1;

const CACHE_ROOT = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'project-manager', 'cache'
);

/**
 * Get the cache directory path for a given project slug.
 * Creates the directory if it does not exist.
 *
 * @param {string} slug - Project slug (e.g., "org-repo")
 * @param {string} [cacheRoot] - Override cache root for testing
 * @returns {string} Absolute path to the slug's cache directory
 */
function getCacheDir(slug, cacheRoot) {
  const root = cacheRoot || CACHE_ROOT;
  const dir = path.join(root, slug);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (_e) {
    // Best effort -- caller handles missing directory
  }
  return dir;
}

/**
 * Write issue data to the cache for a given project slug.
 *
 * Uses atomic write pattern:
 * 1. Serialize data to JSON
 * 2. Write to temporary file (.tmp.<pid>)
 * 3. Backup current file to .bak (best-effort)
 * 4. Rename temp to final (atomic on same filesystem)
 *
 * @param {string} slug - Project slug
 * @param {object} data - Cache data with version, tracker, syncedAt, issues
 * @param {string} [cacheRoot] - Override cache root for testing
 * @returns {boolean} true on success, false on failure (never throws)
 */
function writeIssues(slug, data, cacheRoot) {
  try {
    const dir = getCacheDir(slug, cacheRoot);
    const filePath = path.join(dir, 'issues.json');
    const tmpPath = filePath + '.tmp.' + process.pid;
    const bakPath = filePath + '.bak';

    // Serialize
    const json = JSON.stringify(data, null, 2);

    // Write to temp file
    fs.writeFileSync(tmpPath, json, 'utf8');

    // Backup current file (best-effort)
    try {
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, bakPath);
      }
    } catch (_e) {
      // Backup failure is non-fatal
    }

    // Atomic rename
    fs.renameSync(tmpPath, filePath);

    return true;
  } catch (_e) {
    // Clean up temp file on failure (best-effort)
    try {
      const dir = path.join(cacheRoot || CACHE_ROOT, slug);
      const tmpPath = path.join(dir, 'issues.json.tmp.' + process.pid);
      fs.unlinkSync(tmpPath);
    } catch (_e2) {
      // Ignore cleanup failure
    }
    return false;
  }
}

/**
 * Read issue data from the cache for a given project slug.
 *
 * Fallback chain:
 * 1. Read and parse issues.json
 * 2. If corrupt/missing, try issues.json.bak
 * 3. If both fail, return null
 *
 * @param {string} slug - Project slug
 * @param {string} [cacheRoot] - Override cache root for testing
 * @returns {object|null} Parsed cache data, or null on failure (never throws)
 */
function readIssues(slug, cacheRoot) {
  try {
    const dir = getCacheDir(slug, cacheRoot);
    const filePath = path.join(dir, 'issues.json');
    const bakPath = filePath + '.bak';

    // Try primary file
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data.version !== 'undefined' && data.issues) {
        return data;
      }
    } catch (_e) {
      // Primary failed -- try backup
    }

    // Try backup file
    try {
      const raw = fs.readFileSync(bakPath, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data.version !== 'undefined' && data.issues) {
        return data;
      }
    } catch (_e) {
      // Backup also failed
    }

    return null;
  } catch (_e) {
    return null;
  }
}

module.exports = {
  getCacheDir,
  readIssues,
  writeIssues,
  CACHE_VERSION,
  CACHE_ROOT,
};
