# Pitfalls Research

**Domain:** Incremental sync and caching for issue tracker data (Linear, GitHub Issues) in a Claude Code plugin
**Researched:** 2026-03-11
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Deleted/Trashed Issues Become Ghosts in the Cache

**What goes wrong:**
Timestamp-based delta sync (`updatedAt > lastSyncTime`) only returns issues that *still exist and were modified*. It cannot detect issues that were deleted, trashed, or transferred out of the team/project. The cache retains these phantom issues indefinitely, showing the user issues that no longer exist in Linear or GitHub. The user sees "ENG-42 - In Progress" when ENG-42 was trashed last week.

**Why it happens:**
Both Linear and GitHub use soft-delete models. Linear marks issues with `trashed: true` and sets `archivedAt`, but these trashed issues are hidden from default paginated responses. GitHub returns `410 Gone` for individual deleted issues but does not include them in list results. A naive `updatedAt > timestamp` query silently skips them because they are filtered out of the default response set.

**How to avoid:**
1. On every delta sync, also check cached issues individually against the API. For a small working set (5-15 active issues), this is cheap -- one query per issue or a batch filter by ID.
2. Alternatively, include `includeArchived: true` in Linear queries and check for `trashed` / `archivedAt` fields on returned issues. If a cached issue comes back as trashed/archived, remove it from the active cache.
3. For GitHub, query for issues by their specific numbers using `gh issue view <number>` and detect `410 Gone` or `state: closed` transitions.
4. The TTL safety net (full refresh after N hours) is the backstop -- it purges the entire cache and rebuilds from scratch, catching anything the delta missed.

**Warning signs:**
- Users report seeing issues in `/pm-status` that they already closed or deleted
- Cache issue count grows monotonically even as the team closes issues
- A full refresh shows different results than the cached delta view

**Phase to address:**
Cache schema design phase. The cache format must include a `lastVerifiedAt` timestamp per issue, and the delta sync logic must include a "verify cached issues still exist" step.

---

### Pitfall 2: SessionStart Hook Timeout Kills Sync Before Completion

**What goes wrong:**
The SessionStart hook has a 30-second timeout. If the incremental sync involves multiple API calls (fetch delta, verify cached issues, paginate through results), it can exceed this budget. The hook is killed mid-operation, leaving the cache in a partially-updated state -- some issues updated, others not, and `lastSyncTime` potentially written before all data was processed.

**Why it happens:**
The existing hook does only local operations (read config, run `git` commands, write context.json) which complete in under 1 second. Adding API calls via Linear MCP or `gh` CLI introduces network latency that is unpredictable. A single Linear MCP call takes 1-5 seconds. Fetching user info + in-progress issues + unstarted issues + verifying cached items can easily consume 15-25 seconds, leaving no margin.

**How to avoid:**
1. Separate "load cache" from "sync cache". The SessionStart hook should only *read* the existing cache and inject it into the session. It should NOT perform API calls to sync.
2. Perform the actual delta sync lazily -- on the first `/pm` or `/pm-status` call in the session, or as a background operation triggered after session startup.
3. If sync must happen at startup, write a separate async process that runs in the background while the hook returns immediately with cached data. The hook returns the stale cache instantly, and the background sync updates it for the next command invocation.
4. Never update `lastSyncTime` until ALL sync operations complete successfully. Use a transaction-like approach: write to a temp structure, then atomically swap.

**Warning signs:**
- Hook occasionally returns empty/partial context
- Users report inconsistent session startup behavior (sometimes fast, sometimes slow)
- Fail-open behavior silently swallows timeout errors, making debugging hard

**Phase to address:**
Architecture phase. The decision of when and how sync happens is foundational. Getting this wrong means a rewrite of the hook structure.

---

### Pitfall 3: MCP Tool Calls Are Not Direct API Calls -- Different Constraints

**What goes wrong:**
The project uses Linear MCP tools (not direct GraphQL queries) for Linear access. MCP tools have their own abstraction layer: different pagination defaults (MCP tools often default to 10 results vs. Linear's native 50), no guaranteed support for advanced filter parameters like `updatedAt > timestamp`, and tool-specific rate limiting on top of Linear's own limits. The sync logic assumes Linear API capabilities but gets MCP tool constraints.

**Why it happens:**
The PROJECT.md states the constraint: "Linear via MCP tools, GitHub via `gh` CLI -- no direct HTTP calls." Developers naturally research the underlying API (Linear GraphQL, GitHub REST) and design sync logic around those capabilities, then discover the MCP wrapper does not expose all parameters. For example, `list_issues` in the MCP may not accept an `updatedAt` filter or `includeArchived` flag.

**How to avoid:**
1. Before designing the sync protocol, audit the actual MCP tools available: list every tool, its parameters, and its return schema. Do not assume API feature parity.
2. If the MCP tool does not support `updatedAt` filtering, the delta sync must happen client-side: fetch all issues (within scope) and compare against cached state locally.
3. For GitHub, `gh` CLI is more predictable -- `gh issue list --state all --json number,title,state,updatedAt --limit 100` is well-documented and reliable.
4. Design the sync layer with an adapter pattern so that the filtering strategy (server-side vs. client-side) can differ between Linear MCP and GitHub CLI.

**Warning signs:**
- Sync logic silently returns fewer results than expected because MCP pagination defaults are lower
- Filter parameters are ignored or cause errors when passed to MCP tools
- The sync works in testing with small issue counts but fails in real projects with 50+ issues

**Phase to address:**
First implementation phase. The MCP tool audit must happen before writing any sync code. This determines whether delta sync is server-side or client-side filtered.

---

### Pitfall 4: Cache Corruption from Non-Atomic JSON Writes

**What goes wrong:**
The cache is a JSON file written with `fs.writeFileSync`. If the process is killed mid-write (timeout, SIGTERM, crash), the file is left in a truncated or corrupted state. The next session reads a broken JSON file, fails to parse, and either crashes or silently serves empty/default state. This is a known pattern -- Claude Code itself had this exact bug with `.claude.json` corruption from concurrent writes.

**Why it happens:**
`fs.writeFileSync` is not atomic. It opens the file, truncates it to zero bytes, then writes the new content. If the process dies between truncation and write completion, the file contains partial data or is empty. The existing `context.json` write in `pm-session-start.js` has this vulnerability but it is low-impact because the data is regenerated every session. For cached issue data that represents accumulated sync state, corruption means data loss.

**How to avoid:**
1. Use atomic write: write to a temporary file (e.g., `issues.json.tmp`), then `fs.renameSync` over the target. Rename is atomic on POSIX systems.
2. Keep a backup: before writing new cache, rename the existing file to `issues.json.bak`. If the new write fails, the backup is available for recovery.
3. On cache load, if JSON parse fails, attempt to read the `.bak` file. If both fail, trigger a full refresh.
4. Consider using a simple append-only log format for incremental updates, with periodic compaction into the full JSON state.

**Warning signs:**
- Occasional "SyntaxError: Unexpected end of JSON input" in hook error logs
- Cache resets to empty state unpredictably
- Issue counts fluctuate between sessions without user action

**Phase to address:**
Cache storage implementation phase. The atomic write pattern must be baked into the cache read/write layer from day one, not added later.

---

### Pitfall 5: Stale Cache Silently Serves Wrong Issue Status

**What goes wrong:**
The plugin's fail-open design means that when sync fails (API down, MCP unavailable, timeout), it silently serves the cached data. If the cache is days old and the TTL check is buggy or missing, the user sees "ENG-42: In Progress" when the issue was actually marked Done yesterday. The user then makes decisions based on stale information -- starts duplicate work, skips completed tasks, or reopens closed discussions.

**Why it happens:**
Fail-open is the correct design for a plugin that should never block a session. But without explicit staleness indicators, the user cannot distinguish "fresh data" from "3-day-old cache." The existing plugin already has this pattern: "If Linear MCP fails, warn and display cached state." But the warning is easy to miss, and there is no visual indicator of cache age in the formatted output.

**How to avoid:**
1. Always display cache age in the output. Example: "IN PROGRESS (synced 2 hours ago)" vs. "IN PROGRESS (cached, last synced 3 days ago -- run /pm --refresh)".
2. Use three freshness tiers: FRESH (synced this session), STALE (synced within TTL), EXPIRED (beyond TTL). Format the output differently for each tier.
3. When serving expired cache, actively prompt the user: "Issue data is X days old. Refresh now? [/pm --refresh]"
4. The TTL should be conservative -- 4-8 hours for active projects, not 24 hours. Issue status can change multiple times per day.

**Warning signs:**
- Users never run `/pm --refresh` because they assume data is current
- No visible indication of when data was last synced
- Users report "pm showed it as in-progress but it was already done"

**Phase to address:**
UX/display phase. The staleness indicator must be part of the display format from the first implementation, not added as a polish step.

---

### Pitfall 6: lastSyncTime Drift Between Linear and GitHub Trackers

**What goes wrong:**
The unified cache format stores a single `lastSyncTime` for the project. But Linear and GitHub are different systems with different clocks, different update semantics (Linear's `updatedAt` includes metadata changes; GitHub's `updated_at` includes comment additions), and different response latencies. Using one timestamp for both creates subtle sync gaps -- issues updated between the two API calls may be missed, or the same issue may be fetched repeatedly.

**Why it happens:**
A project can only have one tracker (per `projects.json` config), so this seems like a non-issue. But the unified cache format is shared code, and if `lastSyncTime` semantics differ between trackers, a single implementation will have bugs in one or both paths. Additionally, clock skew between the local machine and the API server means `lastSyncTime = now()` at query time may not match the API's notion of "now."

**How to avoid:**
1. Use the API's own timestamp from the response, not `Date.now()`. After fetching issues, set `lastSyncTime` to the most recent `updatedAt` value from the returned data, not the local clock time.
2. Add a small overlap window (e.g., subtract 60 seconds from `lastSyncTime`) to account for clock skew and in-flight changes. Accept occasional duplicate fetches as cheaper than missed updates.
3. Store tracker-specific sync metadata even within the unified format: `{ linear: { lastSyncTime, lastSyncCursor }, github: { lastSyncTime, etag } }`.

**Warning signs:**
- Issues occasionally appear to "jump back" to a previous state after sync
- Delta sync returns zero results despite known recent changes
- Full refresh shows different data than incremental sync built up over time

**Phase to address:**
Cache schema design phase. The sync metadata structure must account for per-tracker differences from the start.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Client-side filtering (fetch all, filter locally) | Works immediately without MCP audit | Fetches 10x more data than needed on every sync; wastes API quota | MVP only -- must migrate to server-side filtering once MCP capabilities are confirmed |
| Single JSON file for all cache data | Simple read/write, easy to debug | Grows unbounded as issues accumulate; slow to parse for large projects | Acceptable for projects with < 100 tracked issues |
| 24-hour TTL with no intermediate staleness tiers | Simple expiry logic | Users serve stale data for up to 23 hours without warning | Never -- staleness indicators should ship with v1 |
| Skipping deleted-issue detection | Faster sync, fewer API calls | Ghost issues accumulate in cache over weeks | Acceptable for first milestone if TTL is short (4-8 hours) and full refresh is reliable |
| Hardcoded issue field list (title, status, priority, assignee) | Fast to implement | Adding new fields later requires cache migration or full refresh | Acceptable -- the cached fields are well-defined in PROJECT.md |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Linear MCP | Assuming `list_issues` supports all Linear GraphQL filter parameters (e.g., `updatedAt: { gt: "..." }`) | Audit available MCP tool parameters first. Fall back to client-side filtering if needed. |
| Linear MCP | Not passing `includeArchived: true` and missing trashed/archived issues in sync | Explicitly test whether the MCP tool exposes this parameter. If not, periodic full refresh is the only way to detect deletions. |
| Linear MCP | Ignoring pagination -- default returns only 10-50 results | Always paginate to completion. Check `pageInfo.hasNextPage` and follow cursors until exhausted. |
| GitHub CLI (`gh`) | Using `gh issue list` without `--state all` and missing closed issues in the delta | Always use `--state all` with the `--json` flag for structured output. Filter by state client-side. |
| GitHub CLI (`gh`) | Assuming `--limit` has no ceiling -- GitHub CLI caps at ~1000 results per invocation | For repos with > 1000 issues, implement pagination using `--page` or accept that only recent issues are cached. |
| GitHub CLI (`gh`) | Not handling `gh` auth failures in a multi-account setup | The session-start hook already switches `gh auth`, but sync code must verify the correct user is authenticated before making calls. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all issues on every session start | Session startup takes 5-15 seconds; users complain about sluggishness | Separate cache-read (instant) from cache-sync (deferred or on-demand) | Immediately -- even 20 issues with MCP overhead takes several seconds |
| Paginating through all issues for delta sync without a cursor bookmark | Re-fetches already-seen pages on timeout/restart | Store the pagination cursor alongside `lastSyncTime` so interrupted syncs can resume | At 50+ issues requiring multiple pages |
| Reading and writing the full cache file for single-field updates | I/O increases linearly with cache size | For frequent updates (session-end metadata), use a separate small file or append-log | At 200+ cached issues with frequent sessions |
| Linear API complexity budget exhaustion from over-querying | Queries start failing with rate limit errors mid-session | Cache aggressively; never re-query within the same session for data already fetched | At 50+ queries/hour across all Linear-using tools (including user-initiated `/pm` calls) |
| Synchronous `gh` CLI calls blocking the hook | Hook timeout reached before sync completes | Use `execFile` with strict per-command timeouts; abort gracefully and serve stale cache | When GitHub API is slow (> 3-5 second response times) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Caching issue descriptions containing secrets (API keys, passwords mentioned in bug reports) | Sensitive data persisted in plaintext on disk in `~/.claude/project-manager/cache/` | The cache directory is already outside the repo (gitignored), but ensure file permissions are restrictive (0600). Consider excluding description content from cache if not strictly needed for routing. |
| Storing Linear API tokens or auth state in the cache file | Token leakage if cache directory is accidentally shared or backed up | Never cache auth credentials. Auth flows through MCP (Linear) and `gh auth` (GitHub) which manage their own token storage. |
| Cache files readable by other users on shared systems | Other users on the machine can read project issue data | Set file permissions to owner-only (0600) on cache file creation. The existing code uses default umask -- tighten this. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing cached data without any freshness indicator | User trusts stale data, makes wrong decisions (duplicate work, missed completions) | Always show "synced X ago" or "(cached)" label next to issue data |
| Silent sync failures with no user notification | User thinks data is current when sync actually failed | On sync failure, show a one-line warning: "Could not sync -- showing cached data from [time]. Run /pm --refresh to retry." |
| Full refresh that takes 10+ seconds with no progress indication | User thinks the command is hung, interrupts it, gets corrupted cache | Show progress: "Refreshing... 12/34 issues synced" or at minimum "Refreshing..." before the first API call |
| `/pm --refresh` invalidates cache before new data arrives | Brief window where no data is available if refresh fails mid-way | Keep old cache until new data is fully written. Refresh means "fetch then replace", not "delete then fetch". |
| Delta sync shows "3 issues changed" without showing what changed | User knows something changed but has to mentally diff or re-read everything | Show the specific changes: "ENG-42: In Progress -> Done, ENG-45: priority changed to Urgent" |

## "Looks Done But Isn't" Checklist

- [ ] **Delta sync:** Often missing detection of *deleted* issues -- verify that trashed/archived issues are removed from cache
- [ ] **TTL expiry:** Often missing the case where TTL expires mid-session -- verify that TTL is checked on every cache read, not just on session start
- [ ] **Pagination:** Often stops after first page -- verify sync exhausts all pages (check `hasNextPage` / cursor)
- [ ] **Cache format:** Often missing migration path -- verify that a cache written by v1 can be read by v2, or that v2 detects old format and triggers full refresh
- [ ] **Error recovery:** Often handles happy path only -- verify behavior when: API returns 500, MCP tool is unavailable, JSON parse fails, disk is full
- [ ] **Multi-project:** Often tested with one project only -- verify that two projects with different trackers (one Linear, one GitHub) maintain independent caches
- [ ] **Empty state:** Often untested -- verify behavior when cache directory doesn't exist yet, when cache file is empty, when project has zero issues
- [ ] **Concurrent sessions:** Often untested -- verify that two Claude Code sessions for the same project don't corrupt each other's cache writes

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cache corruption (truncated JSON) | LOW | Detect parse failure, fall back to `.bak` file, trigger full refresh if both fail. User sees one slow startup. |
| Ghost issues from missed deletions | LOW | Full refresh (`/pm --refresh`) purges and rebuilds. TTL backstop handles it automatically within hours. |
| Stale cache served as fresh | MEDIUM | Add staleness indicators retroactively. Requires updating all display formats and adding timestamp tracking. Harder to retrofit than to build in. |
| Hook timeout from sync-at-startup | HIGH | Requires architectural change: separate cache-read from cache-sync. Involves rewriting hook flow and adding a new deferred-sync mechanism. |
| MCP tool does not support needed filter | MEDIUM | Implement client-side filtering as fallback. Works but wastes API quota. May need to contribute upstream to the MCP server. |
| lastSyncTime clock skew causing missed updates | LOW | Add overlap window (subtract 60s from stored timestamp). Accept duplicate fetches. Easy to add but must be in the initial design. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Ghost issues from deletions | Cache schema design | Run test: delete an issue in Linear, sync, verify it disappears from cache |
| Hook timeout | Architecture / hook refactoring | Measure session startup time with cache sync; must stay under 2 seconds for cache-read path |
| MCP tool constraints | Pre-implementation audit | Document every MCP tool parameter; create a compatibility matrix before writing sync code |
| Cache corruption | Cache storage implementation | Test: kill hook mid-write (`kill -9`), verify next session recovers gracefully |
| Stale data without indicators | UX / display formatting | Every output that shows issue data must include a freshness label; code review checklist item |
| Clock skew / timestamp drift | Cache schema design | Test: set local clock 5 minutes ahead, sync, verify no issues are missed |
| Multi-project isolation | Cache storage implementation | Test: two projects with different trackers; verify caches are independent and correct |
| Concurrent session corruption | Cache storage implementation | Test: start two sessions for same project simultaneously; verify no data loss |

## Sources

- [Linear API Rate Limiting](https://linear.app/developers/rate-limiting) - 5,000 requests/hour, 250,000 complexity points/hour; discourages polling in favor of webhooks
- [Linear API Pagination](https://linear.app/developers/pagination) - Relay-style cursor pagination, default 50 results, `orderBy: updatedAt` supported
- [Linear API Filtering](https://linear.app/developers/filtering) - `updatedAt: { gt: "..." }` supported with ISO 8601 dates and relative durations
- [Linear GraphQL Schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql) - Issue type includes `trashed`, `archivedAt` fields; `includeArchived` parameter on connections
- [GitHub REST API Issues](https://docs.github.com/en/rest/issues/issues) - `since` parameter filters by `updated_at`; deleted issues return `410 Gone`
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) - SessionStart hook constraints, timeout configuration
- [Claude Code .claude.json corruption issues](https://github.com/anthropics/claude-code/issues/29036) - Real-world example of JSON file corruption from concurrent writes in the same ecosystem
- [Node.js writeFile corruption](https://github.com/nodejs/help/issues/2346) - Atomic write patterns for JSON files
- [Cache Invalidation Best Practices](https://daily.dev/blog/cache-invalidation-vs-expiration-best-practices) - TTL vs. event-driven invalidation strategies
- [Google Calendar Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync) - Reference implementation for incremental sync with token expiry handling

---
*Pitfalls research for: Issue tracker incremental sync/caching in Claude Code plugin*
*Researched: 2026-03-11*
