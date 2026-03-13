---
phase: 02-delta-sync-and-session-integration
plan: 02
subsystem: api
tags: [github-api, linear, delta-sync, adapter, normalization]

# Dependency graph
requires:
  - phase: 01-cache-storage-and-full-sync
    provides: github-adapter fetchAll/normalizeGitHubIssues, linear-adapter normalizeLinearIssues, extractPriorityFromLabels
provides:
  - normalizeGitHubApiIssues -- snake_case gh api response normalization with PR filtering
  - fetchDelta -- gh api repos/{repoKey}/issues with since parameter for server-side delta
  - normalizeLinearDelta -- client-side timestamp filtering delegating to normalizeLinearIssues
affects: [02-03 pm-status-skill, session-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [gh-api-snake-case-normalization, client-side-timestamp-filtering]

key-files:
  modified:
    - plugins/project-manager/hooks/lib/github-adapter.js
    - plugins/project-manager/hooks/lib/github-adapter.test.js
    - plugins/project-manager/hooks/lib/linear-adapter.js
    - plugins/project-manager/hooks/lib/linear-adapter.test.js

key-decisions:
  - "normalizeGitHubApiIssues is separate from normalizeGitHubIssues -- different input schemas (snake_case vs camelCase) warrant distinct functions"
  - "fetchDelta uses gh api (not gh issue list) for server-side since filtering and per_page=100"
  - "normalizeLinearDelta filters client-side then delegates to existing normalizeLinearIssues"

patterns-established:
  - "gh api adapter: snake_case field mapping with PR filtering via pull_request field check"
  - "Delta filtering: server-side for GitHub (since param), client-side for Linear (timestamp comparison)"

requirements-completed: [SYNC-02]

# Metrics
duration: 6min
completed: 2026-03-13
---

# Phase 02 Plan 02: Delta Adapter Methods Summary

**GitHub fetchDelta via gh api with snake_case normalization and PR filtering; Linear normalizeLinearDelta with client-side timestamp filtering**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-13T21:19:38Z
- **Completed:** 2026-03-13T21:25:54Z
- **Tasks:** 1 (TDD feature with RED/GREEN commits)
- **Files modified:** 4

## Accomplishments
- GitHub adapter extended with normalizeGitHubApiIssues handling snake_case fields (updated_at), lowercase state mapping, and pull_request filtering
- GitHub adapter extended with fetchDelta using execFileSync gh api with since parameter for server-side delta sync
- Linear adapter extended with normalizeLinearDelta for client-side timestamp filtering before delegating to existing normalizer
- All 73 tests pass (38 github + 35 linear), including 22 new tests

## Task Commits

Each task was committed atomically (TDD RED/GREEN):

1. **RED: Failing tests for delta adapter methods** - `eb60241` (test)
2. **GREEN: Implement delta adapter methods** - `a6722bb` (feat)

_TDD plan: RED wrote 22 failing tests, GREEN implemented 3 functions to pass all tests._

## Files Created/Modified
- `plugins/project-manager/hooks/lib/github-adapter.js` - Added normalizeGitHubApiIssues and fetchDelta exports
- `plugins/project-manager/hooks/lib/github-adapter.test.js` - Added 14 new tests for normalizeGitHubApiIssues + fetchDelta
- `plugins/project-manager/hooks/lib/linear-adapter.js` - Added normalizeLinearDelta export
- `plugins/project-manager/hooks/lib/linear-adapter.test.js` - Added 8 new tests for normalizeLinearDelta

## Decisions Made
- normalizeGitHubApiIssues is a separate function from normalizeGitHubIssues because gh api returns snake_case fields (updated_at) and includes PRs, while gh issue list returns camelCase and excludes PRs
- fetchDelta follows same execFileSync pattern as fetchAll (no shell, no try/catch, 15s timeout)
- normalizeLinearDelta uses strict > comparison (not >=) on timestamps -- issues at exactly lastSyncedAt are excluded to avoid re-processing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Delta adapter methods ready for consumption by pm-status skill (Plan 03)
- GitHub: fetchDelta provides server-side filtered results via gh api since parameter
- Linear: normalizeLinearDelta provides client-side filtered results for MCP responses
- Both return identical {issues, syncedAt} shape for cache-store compatibility

## Self-Check: PASSED

- All 5 files found on disk
- Both commit hashes (eb60241, a6722bb) found in git log
- GitHub exports match expected: fetchAll, fetchDelta, normalizeGitHubIssues, normalizeGitHubApiIssues, extractPriorityFromLabels
- Linear exports match expected: normalizeLinearIssues, normalizeLinearDelta, normalizeLinearState

---
*Phase: 02-delta-sync-and-session-integration*
*Completed: 2026-03-13*
