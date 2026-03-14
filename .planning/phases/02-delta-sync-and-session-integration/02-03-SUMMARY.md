---
phase: 02-delta-sync-and-session-integration
plan: 03
subsystem: integration
tags: [session-hook, cache-first, freshness, delta-sync, refresh, systemMessage]

# Dependency graph
requires:
  - phase: 02-delta-sync-and-session-integration
    provides: cache-store readSyncMeta/writeSyncMeta/mergeIssues/classifyFreshness/formatAge, github-adapter fetchDelta/normalizeGitHubApiIssues, linear-adapter normalizeLinearDelta
provides:
  - Cache-first issue injection in session-start hook with freshness indicators
  - pm-status skill with cache-first flow, delta-on-demand, and full sync paths
  - /pm --refresh flag for force full re-pull
affects: [03-delta-reporting, user-experience]

# Tech tracking
tech-stack:
  added: []
  patterns: [cache-first-session-startup, freshness-display-in-systemMessage, delta-on-demand]

key-files:
  created: []
  modified:
    - plugins/project-manager/hooks/pm-session-start.js
    - plugins/project-manager/skills/pm-status/SKILL.md
    - plugins/project-manager/commands/pm.md

key-decisions:
  - "Session-start hook reads cache-store directly via require — no API calls, no MCP, read-only"
  - "Issue display capped at 5 in-progress + 3 up-next to keep systemMessage concise"
  - "pm-status skill uses 7-step flow: refresh check → cache read → freshness classify → delta sync → full sync → format → offer action"
  - "EXPIRED cache triggers full sync (not delta) to catch deletions beyond limit:50 window"

patterns-established:
  - "Hook cache injection: require cache-store, read sync-meta + issues, classify freshness, append to lines array"
  - "Skill cache-first flow: node one-liners via Bash to read/write cache, Linear MCP for Linear delta, gh api for GitHub delta"
  - "Freshness display: tier name + age in systemMessage header (e.g., 'synced 5m ago', '3h ago', 'expired')"

requirements-completed: [SESS-01, SYNC-04]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 2 Plan 3: Session Hook Cache Injection, Cache-First pm-status, and /pm --refresh Summary

**Session-start hook injects cached issues with FRESH/STALE/EXPIRED indicators; pm-status skill reads cache first with delta-on-demand sync; /pm --refresh forces full re-pull**

## Performance

- **Duration:** 5 min (excluding checkpoint wait)
- **Started:** 2026-03-13T21:31:43Z
- **Completed:** 2026-03-14T05:03:47Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 3

## Accomplishments
- Session-start hook now injects cached issue summary (up to 5 in-progress, 3 up-next) into systemMessage with freshness tier — zero API calls
- pm-status skill replaced with 7-step cache-first flow supporting delta sync, full sync, and --refresh bypass
- /pm command updated with --refresh flag documentation for force full re-pull

## Task Commits

Each task was committed atomically:

1. **Task 1: Cache-first issue injection in session-start hook** - `e7ffc37` (feat) — version 0.10.4
2. **Task 2: pm-status skill cache-first flow + /pm --refresh** - `ac039d0` (feat) — version 0.10.5
3. **Task 3: Human verification of end-to-end flow** - approved by user

## Files Created/Modified
- `plugins/project-manager/hooks/pm-session-start.js` - Added cache-store require and cache-first issue injection block (lines 190-226) with readSyncMeta, readIssues, classifyFreshness
- `plugins/project-manager/skills/pm-status/SKILL.md` - Replaced 4-step Linear-only flow with 7-step cache-first flow (refresh check, cache read, freshness classify, delta sync, full sync, format, offer action)
- `plugins/project-manager/commands/pm.md` - Added --refresh flag documentation and cache-first description

## Decisions Made
- Session-start hook uses `require('./lib/cache-store')` directly — same pattern as existing requires in the file
- Issue display capped at 5 in-progress + 3 up-next to keep systemMessage under reasonable size
- pm-status skill embeds sync logic as node one-liners via Bash (matching existing skill patterns) rather than creating a separate pm-sync skill
- EXPIRED cache triggers full sync instead of delta to catch deletions beyond the limit:50 window

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Version bump hook required version increments for each task commit (0.10.3 -> 0.10.4 -> 0.10.5). Expected behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 2 is now complete — all 3 plans executed, all requirements satisfied
- Cache-first session startup, delta sync, and --refresh are wired into user-facing surfaces
- Ready for Phase 3 (delta reporting — SYNC-05) which builds on the delta sync infrastructure from Plans 01-03

## Self-Check: PASSED

- Files: pm-session-start.js MODIFIED, pm-status/SKILL.md MODIFIED, pm.md MODIFIED
- Commits: e7ffc37 (Task 1), ac039d0 (Task 2)
- Hook: readSyncMeta + classifyFreshness + "Cached Issues" confirmed in pm-session-start.js
- Skill: 18 matches for cache-first/delta/refresh/freshness keywords
- Command: 5 matches for --refresh
- Tests: 110 pass, 0 fail (zero regressions)

---
*Phase: 02-delta-sync-and-session-integration*
*Completed: 2026-03-14*
