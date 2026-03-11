# Feature Research

**Domain:** Incremental sync and caching for issue tracker data in a Claude Code plugin
**Researched:** 2026-03-11
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these means the caching layer feels broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cache-first session startup | The whole point of caching is instant load. If the plugin still blocks on API calls at startup, the feature is invisible. | MEDIUM | Load cached issue data from `cache/<slug>/issues.json` synchronously in the session-start hook. Display cached state immediately. |
| Timestamp-based delta sync | Standard incremental sync pattern. Both Linear GraphQL (`updatedAt: { gt: "..." }`) and GitHub REST API (`since` ISO 8601 param) support it natively. Users expect "fetch only what changed." | MEDIUM | Store `lastSyncedAt` ISO 8601 timestamp. On next sync, query API with `updatedAt > lastSyncedAt`. Linear MCP `list_issues` supports `sortBy: "updatedAt"` but lacks a direct date filter -- may need to sort by updatedAt DESC and stop when reaching already-cached timestamps. GitHub `gh issue list --search "updated:>TIMESTAMP"` provides native filtering. |
| TTL-based safety net | Caches that silently serve stale data without any expiry are a foot-gun. Users expect a hard boundary: "if cache is older than X, force refresh." | LOW | Store `lastSyncedAt` timestamp in cache file. On load, compare against TTL (default 24 hours, matching existing context.json TTL). If expired, treat as cold start and do full sync. |
| Force refresh command | Users must be able to bypass the cache when they know it is stale. "I just updated issues in Linear, refresh." | LOW | Add `--refresh` flag to `/pm` command. Deletes cached issue data and forces full sync. Simple and essential escape hatch. |
| Unified cache format | Both Linear and GitHub Issues data must be stored in the same normalized structure. Users should not encounter different behavior depending on which tracker is configured. | MEDIUM | Normalize to a common schema: `{ id, title, status, priority, assignee, description, updatedAt, tracker: "linear"|"github" }`. Tracker-specific fields (e.g., Linear's `teamKey`, GitHub's `number`) stored in a `raw` or `meta` sub-object. |
| Fail-open on sync errors | The existing plugin philosophy is "never block a session." If the API is down or MCP is unavailable, the cache must still load and the session must proceed with a warning. | LOW | Already established pattern in the codebase. On sync failure: serve cached data, emit warning in system message, set a flag so user knows data may be stale. |
| Cache scoped per project | Each project's cache is isolated. Changing projects must not show another project's issues. | LOW | Already established: `cache/<slug>/` directory structure. Issue cache lives alongside `context.json` in the same slug directory. |

### Differentiators (Competitive Advantage)

Features that make the caching layer feel polished rather than bare-minimum.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Delta reporting on startup | "3 issues changed since last session" with a compact summary of what moved. Turns a passive cache into an active briefing. Demonstrates the cache is working and keeps the user informed. | MEDIUM | Compare cached state with delta results. For each changed issue, compute what changed (status transition, priority change, new assignee). Format as a compact diff in the session-start system message: `"ENG-42: In Progress -> In Review, ENG-45: priority P3 -> P1"`. |
| Stale-while-revalidate pattern | Serve cached data instantly, then asynchronously fetch deltas and update cache for the next read. Eliminates all perceived latency. | HIGH | Requires background execution capability. In Claude Code hooks, the session-start hook runs synchronously and blocks -- true async revalidation is not possible in hooks. **Practical alternative:** serve cache immediately in session-start hook, defer delta fetch to first `/pm` command invocation (lazy revalidation). Cache is updated after the delta fetch so subsequent reads in the same session use fresh data. |
| Selective field caching | Cache only decision-making fields (status, title, priority, assignee, description) and skip verbose fields (comments, activity history, attachments). Keeps cache small and fast. | LOW | Already scoped in PROJECT.md. The normalized schema omits comments/activity. Keeps JSON files to a few KB even with 50+ issues. |
| Cache metadata in system message | Inject cache freshness into the session-start system message: "Issue data from 2h ago (23 issues cached)." Builds user trust in the cache without requiring them to ask. | LOW | Append one line to the existing system message built by `pm-session-start.js`. Read cache file stat for age, count entries for issue count. |
| Branch-issue cache enrichment | When on a feature branch with a Linear ID (e.g., `feat/ENG-42-...`), the session-start hook can pull that specific issue's cached data into the system message. Provides immediate context without an API call. | LOW | Already extracting `branchIssueId` in session-start. Look it up in the issue cache and include title + status in the system message. Zero API calls needed. |
| Configurable TTL per project | Different projects have different cadences. A solo project might want 48h TTL; a busy team project might want 4h. | LOW | Add optional `cache_ttl_hours` field to project config in `projects.json`. Default to 24. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in this context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Webhook-driven real-time sync | "Why poll when you can push?" Webhooks eliminate polling delay entirely. | Requires a running server to receive webhook payloads. This is a Claude Code plugin that runs only during sessions -- there is no persistent process to receive webhooks. Infrastructure cost and complexity far exceed the benefit for a session-based tool. | Timestamp-based delta sync on session start. Staleness between sessions is acceptable because no one is reading the cache while Claude is not running. |
| Full offline mode with conflict resolution | "Cache should be the source of truth when offline, and merge when back online." | The plugin is read-heavy, not write-heavy. Issue state changes happen through Linear MCP tools (which require API connectivity). There is no scenario where the cache diverges from the source and needs merging. Conflict resolution adds complexity for a problem that does not exist here. | Cache is read-only local mirror. Writes always go through the API (Linear MCP or `gh` CLI). Cache is updated after successful writes. |
| Cache comments and activity logs | "I want to see the full conversation on an issue without an API call." | Comments are high-volume, change frequently, and are rarely needed for the routing decisions the plugin makes (pick up issue, check status, suggest next work). Caching them bloats the cache file and increases sync time for minimal value. | Cache issue metadata only. When the user needs comments, fetch them on demand via `get_issue`. |
| Automatic cache warming on system boot | "Pre-fetch all project caches periodically so they are always fresh." | No persistent daemon exists. The plugin runs only inside Claude Code sessions. A background cron job would need separate installation, maintenance, and introduces a dependency outside the plugin framework. | Lazy sync on session start is sufficient. First session of the day pays the cold-start cost (one API round-trip); subsequent sessions use the warm cache. |
| Cross-project issue aggregation | "Show me all issues across all my projects in one view." | Each project has its own tracker configuration (some Linear, some GitHub). Aggregating across trackers requires normalizing priorities, statuses, and workflows that may not map cleanly. It also breaks the per-project cache isolation that keeps the design simple. | Keep caches per-project. Users who want cross-project views should use Linear or GitHub's native dashboards. |
| Granular per-field change tracking | "Track exactly which fields changed on every issue with full history." | This is building a local audit log. The issue tracker already has this. Duplicating it locally means maintaining a changelog data structure, handling field-level diffs, and storing an ever-growing history. | Track only the previous snapshot for delta comparison (current vs. last-known). Show "what changed" at the field level for the most recent sync, not full history. |
| ETag-based caching | "Use HTTP ETags for cache validation." | Linear uses GraphQL (no ETags). GitHub REST supports ETags, but `gh` CLI does not expose ETag headers. Both APIs support timestamp-based filtering which is simpler and works uniformly. | Timestamp-based delta sync works for both trackers without special HTTP header handling. |

## Feature Dependencies

```
[Unified cache format]
    |
    +--requires--> [Cache-first session startup]
    |                  |
    |                  +--enhances--> [Cache metadata in system message]
    |                  |
    |                  +--enhances--> [Branch-issue cache enrichment]
    |
    +--requires--> [Timestamp-based delta sync]
    |                  |
    |                  +--enhances--> [Delta reporting on startup]
    |                  |
    |                  +--requires--> [TTL-based safety net]
    |
    +--requires--> [Force refresh command]

[Configurable TTL per project] --enhances--> [TTL-based safety net]

[Stale-while-revalidate] --enhances--> [Cache-first session startup]
    (deferred to v1.x -- requires lazy revalidation pattern)
```

### Dependency Notes

- **Unified cache format is foundational:** Every other feature reads from or writes to the cache file. The schema must be defined first.
- **Cache-first startup requires the cache to exist:** Which means the unified cache format and at least one successful sync must have occurred (cold start path must also be handled).
- **Delta sync requires TTL safety net:** Without TTL, a corrupted or very old timestamp could cause the delta query to return enormous result sets or miss data that was changed and changed back. TTL forces periodic full refreshes.
- **Delta reporting requires delta sync:** You cannot report "what changed" without fetching the deltas and comparing against cached state.
- **Force refresh is independent but essential:** It is the manual escape hatch and must work regardless of whether delta sync is functioning. It simply clears cache and triggers full sync.
- **Stale-while-revalidate is an enhancement, not a dependency:** The system works fine with synchronous delta fetch on `/pm`. Lazy revalidation is a DX improvement to defer to v1.x.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate that caching meaningfully improves the `/pm` experience.

- [ ] **Unified cache format** -- Define the normalized issue schema and the cache file structure (`cache/<slug>/issues.json` with `lastSyncedAt` metadata)
- [ ] **Full sync path** -- Fetch all relevant issues from Linear MCP or `gh` CLI, normalize to cache format, write to disk. This is the cold-start and TTL-expiry path.
- [ ] **Cache-first session startup** -- Session-start hook reads cached issues and injects summary into system message (count, freshness, branch-linked issue details)
- [ ] **Timestamp-based delta sync** -- On `/pm` invocation, fetch only issues updated since `lastSyncedAt`, merge into cache, update timestamp
- [ ] **TTL-based safety net** -- If cache age exceeds TTL (default 24h), trigger full sync instead of delta
- [ ] **Force refresh** -- `/pm --refresh` flag to clear cache and force full sync
- [ ] **Fail-open error handling** -- All cache operations wrapped in try/catch, session never blocked by cache failures

### Add After Validation (v1.x)

Features to add once the core caching loop is proven.

- [ ] **Delta reporting** -- "3 issues changed since last session" with field-level change summaries in the system message or `/pm` output. Trigger: users want to know what changed without reading the full briefing.
- [ ] **Stale-while-revalidate** -- Lazy revalidation pattern: serve cache immediately, fetch deltas on first `/pm` call, update cache for subsequent reads. Trigger: users report startup latency is still noticeable.
- [ ] **Cache metadata in system message** -- Show cache freshness ("Issue data from 2h ago, 23 issues cached") in session-start injection. Trigger: users express uncertainty about whether cache is stale.
- [ ] **Branch-issue cache enrichment** -- When on a Linear-linked branch, include the cached issue title and status in the session-start system message. Trigger: natural extension once cache is reliable.
- [ ] **Configurable TTL per project** -- `cache_ttl_hours` in `projects.json`. Trigger: users with different project cadences request customization.

### Future Consideration (v2+)

Features to defer until the caching layer is mature.

- [ ] **Cache write-through on issue mutations** -- When `pm-issues` creates or updates an issue via MCP, immediately update the local cache rather than waiting for next sync. Reduces cache staleness after user actions.
- [ ] **Cache versioning and migration** -- Version stamp on the cache schema so that plugin updates can migrate old cache formats without forcing a full re-sync.
- [ ] **Session-end cache update** -- The stop hook could update cached issue statuses based on auto-actions it performs (e.g., moving issue to "In Review" after PR creation). Keeps cache fresh across session boundaries.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Unified cache format | HIGH | MEDIUM | P1 |
| Full sync path | HIGH | MEDIUM | P1 |
| Cache-first session startup | HIGH | LOW | P1 |
| Timestamp-based delta sync | HIGH | MEDIUM | P1 |
| TTL-based safety net | HIGH | LOW | P1 |
| Force refresh command | MEDIUM | LOW | P1 |
| Fail-open error handling | HIGH | LOW | P1 |
| Delta reporting | MEDIUM | MEDIUM | P2 |
| Cache metadata in system message | MEDIUM | LOW | P2 |
| Branch-issue cache enrichment | MEDIUM | LOW | P2 |
| Stale-while-revalidate | MEDIUM | HIGH | P2 |
| Configurable TTL per project | LOW | LOW | P2 |
| Cache write-through on mutations | MEDIUM | MEDIUM | P3 |
| Cache versioning/migration | LOW | MEDIUM | P3 |
| Session-end cache update | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch -- caching is not useful without these
- P2: Should have, add when core is validated
- P3: Nice to have, future consideration

## Competitor Feature Analysis

This is a Claude Code plugin, not a standalone product. "Competitors" are alternative approaches to the same problem.

| Feature | Linear App (native) | GitHub CLI (`gh`) | Jira CLI tools | Our Approach |
|---------|---------------------|-------------------|----------------|--------------|
| Issue listing | Full UI, instant (client-side cache with IndexedDB) | `gh issue list` -- always fetches from API, no local cache | Various CLI wrappers, all hit API per call | Cache locally, serve instantly, delta sync in background |
| Incremental sync | Client uses proprietary sync protocol (offline-capable) | No incremental sync -- full fetch every time | Jira REST API supports `updatedDate` JQL filter | Timestamp-based delta sync using each tracker's native filtering |
| Offline access | Full offline support via local-first architecture | None -- requires network | None typically | Read-only cache serves stale data when API unavailable |
| Change notifications | Real-time via WebSocket in app | None in CLI | Jira has email/webhook notifications | Delta reporting: "X issues changed since last session" |
| Cache invalidation | Automatic via sync protocol | N/A (no cache) | N/A (no cache) | TTL safety net + manual `/pm --refresh` + force on sync errors |

## API Capability Summary

Understanding what each API actually supports is critical for implementation.

### Linear (via MCP)

| Capability | Available | Mechanism | Notes |
|------------|-----------|-----------|-------|
| List issues with filters | Yes | `list_issues` tool with `status`, `assignee`, `project` params | HIGH confidence -- verified via MCP tool documentation |
| Sort by updatedAt | Yes | `sortBy: "updatedAt"` parameter | HIGH confidence -- documented in MCP tool schema |
| Filter by updatedAt > timestamp | Uncertain | Not directly exposed in MCP `list_issues`. Linear GraphQL API supports `updatedAt: { gt: "..." }` filter, but MCP tool may not expose it. | MEDIUM confidence -- GraphQL supports it, MCP tool may need workaround: sort by updatedAt DESC, fetch until reaching cached timestamp |
| Pagination | Yes | `limit` param (max 100) | May need multiple calls for large issue sets |
| Get single issue | Yes | `get_issue` tool | For targeted refresh of specific issues |

### GitHub (via `gh` CLI)

| Capability | Available | Mechanism | Notes |
|------------|-----------|-----------|-------|
| List issues with filters | Yes | `gh issue list` with `--state`, `--assignee`, `--label` flags | HIGH confidence -- verified from official CLI docs |
| Filter by updated timestamp | Yes | `--search "updated:>2024-01-01"` using GitHub search syntax | HIGH confidence -- GitHub search qualifiers support date ranges |
| JSON output | Yes | `--json` flag with field selection | HIGH confidence -- fields include `updatedAt`, `title`, `state`, etc. |
| JQ filtering | Yes | `--jq` flag for post-processing JSON | Useful for extracting specific fields |
| Pagination | Yes | `--limit` flag (default 30) | Straightforward |

## Sources

- [Linear API Filtering Documentation](https://linear.app/developers/filtering) -- date field filtering with `gt`, `gte`, `lt`, `lte` comparators
- [Linear API Pagination](https://linear.app/developers/pagination) -- cursor-based pagination, 50 items default
- [Linear MCP list_issues Tool](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) -- parameter schema including `sortBy: "updatedAt"`
- [GitHub CLI gh issue list](https://cli.github.com/manual/gh_issue_list) -- flags, JSON fields, search syntax
- [GitHub REST API Issues](https://docs.github.com/en/rest/issues/issues) -- `since` parameter, ISO 8601 timestamps
- [Google Calendar API Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync) -- reference implementation of incremental sync pattern (sync tokens, full vs incremental, 410 expiry)
- [Stale-While-Revalidate Pattern](https://web.dev/articles/stale-while-revalidate) -- cache pattern for serving stale data while refreshing
- [Cache Invalidation Strategies](https://www.systemoverflow.com/learn/caching/cache-invalidation/time-based-invalidation-ttl-stale-while-revalidate-and-expiry-strategies) -- TTL, stale-while-revalidate, expiry strategies
- [Microsoft Graph Delta Query](https://learn.microsoft.com/en-us/graph/delta-query-overview) -- delta query pattern for incremental sync
- [Airbyte Incremental Sync Docs](https://docs.airbyte.com/platform/connector-development/connector-builder-ui/incremental-sync) -- cursor-based incremental sync patterns
- [Linear MCP Server Official Docs](https://linear.app/docs/mcp) -- available tools and capabilities

---
*Feature research for: Incremental sync and caching for issue tracker data*
*Researched: 2026-03-11*
