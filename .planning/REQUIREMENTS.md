# Requirements: Project Manager Incremental Sync

**Defined:** 2026-03-11
**Core Value:** Session startup is fast and token-efficient — the plugin loads cached state instantly and only fetches what changed since the last check.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Cache Foundation

- [x] **CACHE-01**: Plugin stores issue data (status, title, priority, assignee, description, updatedAt) in a normalized JSON cache at `cache/<slug>/issues.json`
- [x] **CACHE-02**: Cache writes use atomic write pattern (write-to-temp, then rename) to prevent corruption from process termination
- [x] **CACHE-03**: Cache read/write failures are caught and never block session startup or command execution
- [x] **CACHE-04**: Each project's cache is isolated in its own `cache/<slug>/` directory

### Sync Engine

- [ ] **SYNC-01**: Plugin can perform a full sync (fetch all relevant issues from tracker, normalize, write to cache) as the cold-start and TTL-expiry path
- [ ] **SYNC-02**: Plugin performs delta sync using timestamp filtering — GitHub via `gh api` `since` parameter, Linear via `list_issues` sorted by `updatedAt` with client-side comparison
- [ ] **SYNC-03**: Cache automatically expires after a configurable TTL (default 24h), triggering full sync on next access
- [ ] **SYNC-04**: User can force a full cache refresh with `/pm --refresh`
- [ ] **SYNC-05**: Delta sync produces a change summary showing which issues changed and what fields moved (e.g., "NTH-42: In Progress -> In Review")

### Session Integration

- [ ] **SESS-01**: Session-start hook loads cached issue data and injects it into the system message without making API calls
- [ ] **SESS-02**: When cache is stale or expired, the system message indicates staleness level so user knows data freshness

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### UX Enhancements

- **UX-01**: Cache metadata displayed in system message ("Issue data from 2h ago, 23 issues cached")
- **UX-02**: Branch-issue cache enrichment — pull linked issue title/status from cache for current branch at zero API cost
- **UX-03**: Configurable TTL per project via `cache_ttl_hours` in `projects.json`
- **UX-04**: Stale-while-revalidate pattern — lazy revalidation on first `/pm` invocation

### Cache Lifecycle

- **LIFE-01**: Cache write-through on issue mutations — update cache immediately when MCP creates/updates an issue
- **LIFE-02**: Cache versioning and migration — schema version stamp for plugin updates
- **LIFE-03**: Session-end cache update — stop hook updates cached statuses based on auto-actions performed

## Out of Scope

| Feature | Reason |
|---------|--------|
| Webhook-driven sync | No persistent server; plugin runs only during sessions |
| Conflict resolution | Cache is read-only mirror; writes always go through API |
| Comment caching | Too verbose; not needed for routing decisions |
| Cache warming daemon | No persistent process in plugin framework |
| Cross-project aggregation | Breaks per-project isolation |
| ETag-based caching | Linear uses GraphQL (no ETags); `gh` CLI doesn't expose headers |
| Granular change history | Duplicates tracker's audit log; track only current vs. previous |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CACHE-01 | Phase 1 | Complete |
| CACHE-02 | Phase 1 | Complete |
| CACHE-03 | Phase 1 | Complete |
| CACHE-04 | Phase 1 | Complete |
| SYNC-01 | Phase 1 | Pending |
| SYNC-02 | Phase 2 | Pending |
| SYNC-03 | Phase 2 | Pending |
| SYNC-04 | Phase 2 | Pending |
| SYNC-05 | Phase 3 | Pending |
| SESS-01 | Phase 2 | Pending |
| SESS-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation*
