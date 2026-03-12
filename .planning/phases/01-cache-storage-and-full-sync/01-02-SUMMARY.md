---
phase: 01-cache-storage-and-full-sync
plan: 02
subsystem: sync-adapters
tags: [node, github-cli, linear, normalization, tdd]

# Dependency graph
requires:
  - "01-01: cache-store.js module (CACHE_VERSION, writeIssues data shape)"
provides:
  - "github-adapter.js: fetchAll(projectConfig) for GitHub full sync via gh CLI"
  - "github-adapter.js: normalizeGitHubIssues(rawIssues) for GitHub issue normalization"
  - "linear-adapter.js: normalizeLinearIssues(linearIssues, teamKey) for Linear issue normalization"
  - "linear-adapter.js: normalizeLinearState(stateName) for Linear state vocabulary mapping"
  - "NormalizedIssue schema: {id, title, status, priority, assignee, description, updatedAt, tracker}"
affects: [02-delta-sync, 02-session-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [normalized-issue-schema, case-insensitive-state-mapping, includes-based-state-matching, priority-label-extraction]

key-files:
  created:
    - plugins/project-manager/hooks/lib/github-adapter.js
    - plugins/project-manager/hooks/lib/github-adapter.test.js
    - plugins/project-manager/hooks/lib/linear-adapter.js
    - plugins/project-manager/hooks/lib/linear-adapter.test.js
  modified: []

key-decisions:
  - "GitHub adapter uses execFileSync (no shell) matching existing pm-session-start.js pattern"
  - "Linear adapter is pure normalization only -- no MCP calls, model drives fetch via skill"
  - "State normalization uses lowercase + includes-based matching for resilience to API variations"
  - "Both adapters return identical {issues, syncedAt} shape for cache-store compatibility"

patterns-established:
  - "NormalizedIssue schema: {id, title, status, priority, assignee, description, updatedAt, tracker}"
  - "Status vocabulary: backlog, unstarted, started, completed, cancelled"
  - "GitHub state mapping: OPEN/open -> started, CLOSED/closed -> completed"
  - "Linear state mapping: includes-based matching with ordered specificity"
  - "Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low"
  - "GitHub issues keyed by #number, Linear issues keyed by identifier"

requirements-completed: [SYNC-01]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 1 Plan 2: GitHub and Linear Full Sync Adapters Summary

**GitHub full sync via gh CLI and Linear MCP response normalization, both producing identical NormalizedIssue schema for cache-store consumption**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T21:46:59Z
- **Completed:** 2026-03-12T21:50:29Z
- **Tasks:** 2 (both TDD: RED + GREEN)
- **Files created:** 4

## Accomplishments
- github-adapter.js: fetchAll() fetches all issues via gh CLI with execFileSync (no shell injection), normalizeGitHubIssues() handles both uppercase (OPEN/CLOSED) and lowercase (open/closed) states
- linear-adapter.js: normalizeLinearIssues() defensively handles string/object shapes for state and assignee, normalizeLinearState() maps varied Linear states (Backlog, Todo, In Progress, Done, Cancelled, etc.) to standard vocabulary
- Both adapters produce identical NormalizedIssue schema with issues keyed by id, ready for cache-store.writeIssues()
- extractPriorityFromLabels() maps GitHub priority labels (priority:urgent/high/medium/low) to numeric values (1/2/3/4)
- 51 new tests (24 github-adapter + 27 linear-adapter), full suite 67/67 passing across all lib modules

## Task Commits

Each task was committed atomically (TDD flow):

1. **Task 1 RED: GitHub adapter tests** - `a214f02` (test)
2. **Task 1 GREEN: GitHub adapter implementation** - `e3ac301` (feat)
3. **Task 2 RED: Linear adapter tests** - `b357984` (test)
4. **Task 2 GREEN: Linear adapter implementation** - `ad746c7` (feat)

_Note: TDD tasks have two commits each (test then feat)_

## Files Created/Modified
- `plugins/project-manager/hooks/lib/github-adapter.js` - GitHub full sync adapter with fetchAll (gh CLI) and normalizeGitHubIssues (state/priority/assignee normalization)
- `plugins/project-manager/hooks/lib/github-adapter.test.js` - 24 unit tests covering state mapping, assignee extraction, description truncation, priority labels, edge cases
- `plugins/project-manager/hooks/lib/linear-adapter.js` - Linear normalization adapter with normalizeLinearIssues and normalizeLinearState (pure functions, no MCP calls)
- `plugins/project-manager/hooks/lib/linear-adapter.test.js` - 27 unit tests covering state vocabulary, assignee shapes, identifier fallback, description truncation, edge cases

## Decisions Made
- GitHub adapter uses execFileSync with array args (no shell) matching the established pattern in pm-session-start.js line 56-63
- Linear adapter is pure normalization only -- it does not call MCP tools; the model drives issue fetch via skill execution, then passes response data to normalizeLinearIssues()
- State normalization uses case-insensitive matching: GitHub lowercases then compares, Linear uses includes-based matching for resilience to API variations
- Both adapters return {issues, syncedAt} shape directly compatible with cache-store.writeIssues() (GitHub fetchAll adds version and tracker fields)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Version bump required by pre-commit hook (4 times)**
- **Found during:** Each commit attempt (Tasks 1-2 RED and GREEN phases)
- **Issue:** Pre-commit hook `check-version-bump.js` blocks commits when plugin code changes without a version bump
- **Fix:** Bumped project-manager from 0.8.1 to 0.9.0 (Task 1 RED), 0.9.1 (Task 1 GREEN), 0.9.2 (Task 2 RED), 0.9.3 (Task 2 GREEN). Hook auto-synced marketplace.json, SKILL.md files, and docs/memory.md
- **Files modified:** plugin.json, marketplace.json, 5x SKILL.md, docs/memory.md (all auto-synced by hook)
- **Verification:** All commits succeeded after version bump
- **Committed in:** a214f02, e3ac301, b357984, ad746c7

---

**Total deviations:** 1 auto-fixed (1 blocking, repeated per commit)
**Impact on plan:** Version bump is standard project workflow, not scope creep. Required by existing pre-commit infrastructure.

## Issues Encountered
None - plan executed smoothly after handling version bump requirement.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full sync path complete for both GitHub (fetchAll) and Linear (normalizeLinearIssues)
- Cache store (Plan 01) + adapters (Plan 02) provide the complete data pipeline: fetch -> normalize -> cache
- Phase 1 is complete -- ready for Phase 2 (delta sync and session integration)
- Phase 2 adapters will compose: fetchAll() -> writeIssues() for GitHub, model-driven list_issues -> normalizeLinearIssues() -> writeIssues() for Linear

## Self-Check: PASSED

- [x] github-adapter.js exists
- [x] github-adapter.test.js exists
- [x] linear-adapter.js exists
- [x] linear-adapter.test.js exists
- [x] 01-02-SUMMARY.md exists
- [x] Commit a214f02 (Task 1 RED) exists
- [x] Commit e3ac301 (Task 1 GREEN) exists
- [x] Commit b357984 (Task 2 RED) exists
- [x] Commit ad746c7 (Task 2 GREEN) exists

---
*Phase: 01-cache-storage-and-full-sync*
*Completed: 2026-03-12*
