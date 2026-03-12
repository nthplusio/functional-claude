# Roadmap: Project Manager Incremental Sync

## Overview

This roadmap delivers incremental sync and local caching for the project-manager plugin in three phases. Phase 1 builds the cache storage layer and full sync path (the foundation everything else writes to). Phase 2 wires in timestamp-based delta sync for both Linear and GitHub, integrates with session lifecycle hooks, and adds TTL expiry with manual refresh -- delivering the core value of fast, cache-first startup. Phase 3 adds user-facing delta reporting so changes are visible, not just silent.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Cache Storage and Full Sync** - Normalized JSON cache with atomic writes, fail-open error handling, and complete issue fetch from both trackers
- [ ] **Phase 2: Delta Sync and Session Integration** - Timestamp-based incremental sync for Linear and GitHub, TTL expiry, force refresh, and cache-first session startup via hooks
- [ ] **Phase 3: Delta Reporting** - User-facing change summaries showing which issues changed and what fields moved

## Phase Details

### Phase 1: Cache Storage and Full Sync
**Goal**: Plugin can fetch all issues from a tracker, normalize them, and persist them in a corruption-safe local cache that survives process termination and never blocks on failure
**Depends on**: Nothing (first phase)
**Requirements**: CACHE-01, CACHE-02, CACHE-03, CACHE-04, SYNC-01
**Success Criteria** (what must be TRUE):
  1. Running full sync against a GitHub project writes normalized issue data (status, title, priority, assignee, description, updatedAt) to `cache/<slug>/issues.json`
  2. Running full sync against a Linear project writes the same normalized structure to the same cache path
  3. Each project's cache is isolated in its own `cache/<slug>/` directory -- syncing project A does not affect project B's cache
  4. Killing the process mid-write does not corrupt the cache file (atomic write-to-temp-then-rename pattern works)
  5. When cache read or write fails (permissions, disk full, corrupt JSON), the error is caught and the plugin continues without blocking
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Cache store module with atomic writes, backup recovery, and fail-open (TDD)
- [ ] 01-02-PLAN.md — GitHub and Linear full sync adapters with normalization (TDD)

### Phase 2: Delta Sync and Session Integration
**Goal**: Sessions start instantly from cached data, only fetch what changed since the last sync, and expired caches trigger automatic or manual full refresh
**Depends on**: Phase 1
**Requirements**: SYNC-02, SYNC-03, SYNC-04, SESS-01, SESS-02
**Success Criteria** (what must be TRUE):
  1. Running `/pm` after an initial full sync fetches only issues updated since `lastSyncedAt` -- GitHub via `gh api` `since` parameter, Linear via sort-by-updatedAt with client-side comparison
  2. Session-start hook loads cached issue data and injects it into the system message without making any API calls
  3. When cache is older than TTL (default 24h), the system message indicates staleness and a full sync is triggered on next access
  4. Running `/pm --refresh` forces a complete re-pull regardless of TTL or cache freshness
  5. When cache is stale but not expired, the system message shows freshness level so the user knows how old the data is
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Delta Reporting
**Goal**: Users see exactly what changed since their last session -- which issues moved, what fields updated -- instead of a static snapshot
**Depends on**: Phase 2
**Requirements**: SYNC-05
**Success Criteria** (what must be TRUE):
  1. After delta sync completes, the plugin displays a change summary listing each changed issue with field-level diffs (e.g., "NTH-42: In Progress -> In Review")
  2. When no issues changed since last sync, the plugin reports "no changes" rather than showing nothing
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cache Storage and Full Sync | 0/2 | Planning complete | - |
| 2. Delta Sync and Session Integration | 0/0 | Not started | - |
| 3. Delta Reporting | 0/0 | Not started | - |
