---
phase: 01-cache-storage-and-full-sync
plan: 01
subsystem: cache
tags: [node, fs, atomic-write, json, tdd]

# Dependency graph
requires: []
provides:
  - "cache-store.js module: getCacheDir, readIssues, writeIssues, CACHE_VERSION, CACHE_ROOT"
  - "Atomic write pattern (temp + rename) for corruption-safe cache persistence"
  - "Backup recovery (.bak fallback) for read resilience"
  - "Per-slug directory isolation for multi-project cache"
affects: [01-02, 02-delta-sync, 02-session-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [atomic-write-temp-rename, fail-open-error-handling, bak-fallback-read, per-slug-cache-isolation]

key-files:
  created:
    - plugins/project-manager/hooks/lib/cache-store.js
    - plugins/project-manager/hooks/lib/cache-store.test.js
  modified: []

key-decisions:
  - "CommonJS module (not ESM) matching existing codebase hook patterns"
  - "Optional cacheRoot parameter on all functions for test isolation instead of mock-based testing"
  - "Validation in readIssues checks for both version and issues fields before accepting parsed data"

patterns-established:
  - "Atomic write: writeFileSync to .tmp.<pid> then renameSync to final path"
  - "Backup: copyFileSync to .bak before atomic rename overwrites primary"
  - "Fail-open: all public functions wrapped in try/catch, return safe defaults (false/null)"
  - "Test isolation: fs.mkdtempSync in os.tmpdir() with cacheRoot override, never touching real cache"

requirements-completed: [CACHE-01, CACHE-02, CACHE-03, CACHE-04]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 1 Plan 1: Cache Store Module Summary

**Atomic write cache-store with temp+rename, .bak fallback recovery, and fail-open error handling for per-project issue caching**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T21:41:04Z
- **Completed:** 2026-03-12T21:44:11Z
- **Tasks:** 1 (TDD: RED + GREEN + REFACTOR review)
- **Files created:** 2

## Accomplishments
- cache-store.js: zero-dependency CommonJS module (147 lines) with getCacheDir, readIssues, writeIssues
- Atomic write pattern: writeFileSync to .tmp.<pid> then renameSync prevents corruption from process kill
- Backup recovery: .bak file created before each overwrite, readIssues falls back to .bak on corrupt primary
- Fail-open: all functions catch errors and return safe defaults (true/false for writes, data/null for reads)
- 16 passing tests covering all CACHE-01 through CACHE-04 requirements using isolated temp directories

## Task Commits

Each task was committed atomically (TDD flow):

1. **Task 1 RED: Failing tests** - `fc2c8fe` (test)
2. **Task 1 GREEN: Implementation** - `60ba4a2` (feat)
3. **Task 1 REFACTOR: Review** - No changes needed, code clean as written

## Files Created/Modified
- `plugins/project-manager/hooks/lib/cache-store.js` - Cache read/write module with atomic writes, backup recovery, fail-open
- `plugins/project-manager/hooks/lib/cache-store.test.js` - 16 unit tests covering write, read, atomic pattern, backup, fail-open, isolation

## Decisions Made
- Used CommonJS (`require`) matching existing hook file patterns (pm-session-start.js, pm-session-end.js)
- Optional `cacheRoot` parameter on all functions enables test isolation without mocking fs module
- readIssues validates both `version` and `issues` fields exist before accepting parsed JSON
- CACHE_ROOT matches the existing convention in pm-session-end.js: `~/.claude/project-manager/cache`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Version bump required by pre-commit hook**
- **Found during:** Task 1 RED (first commit attempt)
- **Issue:** Pre-commit hook `check-version-bump.js` blocks commits when plugin code changes without a version bump
- **Fix:** Bumped project-manager from 0.7.0 to 0.8.0 (RED), then 0.8.1 (GREEN). Hook auto-synced marketplace.json, SKILL.md files, and docs/memory.md
- **Files modified:** plugin.json, marketplace.json, 5x SKILL.md, docs/memory.md (all auto-synced)
- **Verification:** Commits succeeded after version bump
- **Committed in:** fc2c8fe (RED), 60ba4a2 (GREEN)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Version bump is standard project workflow, not scope creep. Required by existing pre-commit infrastructure.

## Issues Encountered
None - plan executed smoothly after handling version bump requirement.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- cache-store module is the foundation for Plan 02 (GitHub and Linear full sync adapters)
- Plan 02 adapters will call `writeIssues(slug, data)` and `readIssues(slug)` directly
- API: `writeIssues(slug, data, cacheRoot?)` returns boolean, `readIssues(slug, cacheRoot?)` returns object or null

## Self-Check: PASSED

- [x] cache-store.js exists
- [x] cache-store.test.js exists
- [x] 01-01-SUMMARY.md exists
- [x] Commit fc2c8fe (RED) exists
- [x] Commit 60ba4a2 (GREEN) exists

---
*Phase: 01-cache-storage-and-full-sync*
*Completed: 2026-03-12*
