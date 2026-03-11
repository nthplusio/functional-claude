# Architecture Research

**Domain:** Incremental sync/caching for a Claude Code plugin that manages issue tracker data (Linear + GitHub Issues)
**Researched:** 2026-03-11
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Plugin Entry Points                          │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐                 │
│  │ SessionStart │  │ /pm cmd  │  │ SessionEnd    │                 │
│  │ Hook         │  │ (skill)  │  │ Hook          │                 │
│  └──────┬───────┘  └────┬─────┘  └──────┬────────┘                 │
│         │               │               │                           │
├─────────┴───────────────┴───────────────┴───────────────────────────┤
│                        Sync Coordinator                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Cache Reader │  │ Delta Fetch  │  │ Cache Writer │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
├─────────┴─────────────────┴──────────────────┴──────────────────────┤
│                        Provider Adapter                             │
│  ┌──────────────────┐  ┌──────────────────┐                         │
│  │ Linear Adapter   │  │ GitHub Adapter   │                         │
│  │ (MCP tools)      │  │ (gh CLI)         │                         │
│  └──────────────────┘  └──────────────────┘                         │
├─────────────────────────────────────────────────────────────────────┤
│                        Cache Store                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ context.json │  │ issues.json  │  │ sync-meta.json│             │
│  │ (existing)   │  │ (new)        │  │ (new)        │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **SessionStart Hook** | Load cached issues, trigger delta sync, inject enriched context into session | Extend existing `pm-session-start.js` |
| **Sync Coordinator** | Orchestrate cache-read -> delta-fetch -> cache-write lifecycle | New module, called by hooks and `/pm` command |
| **Cache Reader** | Read `issues.json` and `sync-meta.json`, validate TTL, return cached state or signal "stale" | Pure function, no I/O dependencies beyond `fs` |
| **Delta Fetch** | Given a `lastSyncedAt` timestamp, fetch only issues updated after that time from the provider | Calls into Provider Adapter |
| **Cache Writer** | Merge delta results into `issues.json`, update `sync-meta.json` with new sync timestamp | Atomic write (write-to-temp, rename) |
| **Provider Adapter (Linear)** | Translate sync requests into Linear MCP tool calls (`list_issues` sorted by `updatedAt`) | Adapter pattern; wraps MCP tool calls |
| **Provider Adapter (GitHub)** | Translate sync requests into `gh api` calls with `since` parameter | Adapter pattern; wraps `gh api` CLI |
| **Cache Store** | Flat JSON files in `~/.claude/project-manager/cache/<slug>/` | Three files: `context.json` (existing), `issues.json` (new), `sync-meta.json` (new) |

## Existing Architecture Constraints

The incremental sync must integrate with the existing plugin framework, not replace it. Key constraints from the current codebase:

1. **Hooks are Node.js scripts** that receive JSON on stdin and emit JSON on stdout. They must be synchronous-feeling (stdin -> process -> stdout) and complete within timeout (30s for SessionStart, 15s for Stop).

2. **Skills are Markdown** that instruct the AI model what to do. The model executes MCP calls and CLI commands based on skill instructions. Skills cannot run arbitrary code -- they guide the model.

3. **Cache location is established** at `~/.claude/project-manager/cache/<slug>/`. The existing `context.json` stores session context (branch, HEAD, issue ID). New cache files go alongside it.

4. **Two API access patterns exist**: Linear via MCP tools (model-invoked during skill execution), and GitHub via `gh` CLI (executable from hooks or model). The hooks can only call `gh` CLI; they cannot invoke MCP tools. MCP tool calls happen during skill execution (when the model is active).

5. **Fail-open is mandatory**: Every error path silently continues. A cache miss or API failure must never block a session.

## Recommended Project Structure

New and modified files within the existing plugin structure:

```
plugins/project-manager/
├── hooks/
│   ├── hooks.json               # (modify: no changes needed, same hooks)
│   ├── pm-session-start.js      # (modify: add cache loading + delta trigger)
│   ├── pm-session-end.js        # (modify: add cache update on session close)
│   └── lib/
│       ├── cache-store.js       # Cache read/write for issues.json + sync-meta.json
│       ├── sync-coordinator.js  # Orchestrates cache-read -> delta -> cache-write
│       ├── linear-adapter.js    # Linear-specific delta fetch (for hook-time: sorted list_issues)
│       └── github-adapter.js   # GitHub-specific delta fetch (gh api with since param)
├── skills/
│   ├── pm-status/SKILL.md       # (modify: read from cache first, show delta summary)
│   ├── pm-sync/SKILL.md         # (new: skill for model-driven sync with full MCP filtering)
│   └── ...                      # (existing skills unchanged)
├── commands/
│   ├── pm.md                    # (modify: add --refresh flag for forced full sync)
│   └── ...
└── .cache/                      # gitignored runtime cache (existing convention)
```

### Structure Rationale

- **`hooks/lib/`**: Shared modules for cache and sync logic, required by both session-start and session-end hooks. Node.js `require()` from the hooks directory.
- **`pm-sync` skill**: A new skill that handles the model-driven sync path -- when the model is active and can invoke MCP tools, it can do richer filtering (e.g., `search_issues` with `updatedAt` filter on community Linear MCP, or `list_issues` sorted by `updatedAt` on official Linear MCP).
- **Existing skills modified minimally**: `pm-status` reads from cache first instead of always making fresh API calls. Only the "read from cache, show what changed" behavior is new.

## Architectural Patterns

### Pattern 1: Cache-First with Background Delta

**What:** On session start, immediately load cached issue state. Then attempt a delta fetch. If the delta succeeds, merge results. If it fails, serve stale cache.

**When to use:** Every session start and every `/pm` invocation.

**Trade-offs:**
- Pro: Session starts are fast regardless of API availability
- Pro: Graceful degradation when Linear MCP or GitHub is unavailable
- Con: Cache can be stale (mitigated by TTL safety net)

**Data flow:**
```
SessionStart Hook
    ↓
Read sync-meta.json → lastSyncedAt, ttlExpiry
    ↓
TTL expired? ──YES──→ Signal "needs full refresh" in system message
    │                  (model runs pm-sync skill when active)
    NO
    ↓
Read issues.json → cached issues
    ↓
Inject into session context as system message
    ↓
(Optional: attempt quick delta via gh CLI for GitHub projects)
```

### Pattern 2: Dual-Path Delta Fetch

**What:** Two different delta fetch strategies depending on execution context.

**When to use:** Always -- the hook and the skill operate in different contexts.

**Trade-offs:**
- Pro: Uses the best available API in each context
- Con: Two code paths to maintain (but they share the same cache format)

**Hook-time path (Node.js, no MCP):**
```
For GitHub projects:
  gh api repos/{owner}/{repo}/issues -F since={lastSyncedAt} -F state=all -F per_page=100
  → Parse JSON, merge into issues.json

For Linear projects:
  Cannot call MCP from hooks. Two options:
  a) Signal "delta needed" in systemMessage, let pm-sync skill handle it
  b) Accept cached state as-is for hook-time (model fetches delta when active)
```

**Skill-time path (model active, MCP available):**
```
For Linear projects:
  list_issues { team, assignee: "me", sortBy: "updatedAt", sortDirection: "DESC", limit: 25 }
  → Compare updatedAt of returned issues against lastSyncedAt
  → Issues with updatedAt > lastSyncedAt are the delta

For GitHub projects:
  gh api repos/{owner}/{repo}/issues -F since={lastSyncedAt} ...
  (Same as hook-time, but model can do richer error handling)
```

### Pattern 3: Provider Adapter

**What:** Abstract issue tracker differences behind a common interface so the sync coordinator does not care whether it is talking to Linear or GitHub.

**When to use:** Any code that fetches or normalizes issue data.

**Trade-offs:**
- Pro: Adding a third tracker later is straightforward
- Pro: Cache format is tracker-agnostic
- Con: Slight abstraction overhead for only two providers

**Interface:**
```javascript
// Both adapters implement:
{
  fetchDelta(config, lastSyncedAt) → { issues: NormalizedIssue[], syncedAt: ISO8601 }
  fetchAll(config) → { issues: NormalizedIssue[], syncedAt: ISO8601 }
}

// NormalizedIssue (tracker-agnostic):
{
  id: string,           // Linear ID (e.g., "NTH-42") or GitHub issue number
  externalId: string,   // Linear UUID or GitHub node_id
  title: string,
  status: string,       // Normalized: "backlog" | "unstarted" | "started" | "completed" | "cancelled"
  priority: number,     // 0-4 (0 = none, 1 = urgent, 4 = low)
  assignee: string,     // Display name or username
  description: string,  // Markdown body (truncated to first ~500 chars for cache size)
  updatedAt: ISO8601,   // When the issue was last modified
  tracker: "linear" | "github"
}
```

## Data Flow

### Session Start (Cache Warm)

```
pm-session-start.js
    ↓
[1] Read projects.json → find matching project config
    ↓
[2] Read sync-meta.json → { lastSyncedAt, ttlExpiry, issueCount }
    ↓
[3] TTL check:
    ├── TTL valid → Read issues.json → inject summary into systemMessage
    └── TTL expired → inject "cache stale, run /pm to refresh" into systemMessage
    ↓
[4] For GitHub projects only (can use gh CLI from hook):
    ├── Attempt delta fetch via gh api
    ├── On success → merge into issues.json, update sync-meta.json
    └── On failure → serve stale cache silently
    ↓
[5] Write context.json (existing behavior, unchanged)
    ↓
[6] Emit systemMessage with:
    - Active project info (existing)
    - Issue summary from cache: "IN PROGRESS: 3 issues, UP NEXT: 2 issues"
    - Delta indicator: "2 issues changed since last session" (if delta fetched)
    - Stale warning: "Issue cache is X hours old" (if TTL expired)
```

### User Runs /pm (Full Briefing)

```
/pm command → pm-status skill
    ↓
[1] Read issues.json from cache
    ↓
[2] Attempt delta sync via pm-sync skill:
    ├── Linear: list_issues sorted by updatedAt, compare timestamps
    ├── GitHub: gh api with since parameter
    └── On MCP failure → warn, use cached state
    ↓
[3] Merge deltas into cache
    ↓
[4] Format briefing with delta summary:
    "2 issues updated since last check:
     NTH-42: status changed In Progress → In Review
     NTH-45: priority changed P3 → P1"
    ↓
[5] Show IN PROGRESS / UP NEXT as before
```

### Session End (Cache Update)

```
pm-session-end.js
    ↓
[1] Load context.json (existing behavior)
    ↓
[2] If issues were created/updated during session (detected via transcript signals):
    └── Update issues.json with known changes:
        - Issue created → add to cache
        - Issue status changed → update in cache
        - PR created with "Closes X" → mark issue as "in review" in cache
    ↓
[3] Update sync-meta.json → lastSyncedAt = now
    ↓
[4] Existing stop-reason behavior continues unchanged
```

### Manual Refresh (/pm --refresh)

```
/pm --refresh
    ↓
[1] Delete issues.json and sync-meta.json
    ↓
[2] Full fetch via provider adapter (fetchAll)
    ↓
[3] Write fresh issues.json and sync-meta.json
    ↓
[4] Show full briefing
```

## Cache File Schemas

### issues.json

```json
{
  "version": 1,
  "tracker": "linear",
  "issues": {
    "NTH-42": {
      "id": "NTH-42",
      "externalId": "uuid-here",
      "title": "Auth middleware refactor",
      "status": "started",
      "priority": 2,
      "assignee": "Scott",
      "description": "Refactor the auth middleware to support...",
      "updatedAt": "2026-03-10T14:30:00.000Z"
    }
  }
}
```

**Design decisions:**
- Issues keyed by ID for O(1) lookup and merge
- Object map (not array) because delta merge is the primary operation
- Description truncated at cache-write time to keep file size manageable
- Version field for future schema migrations

### sync-meta.json

```json
{
  "version": 1,
  "lastSyncedAt": "2026-03-10T14:30:00.000Z",
  "lastFullSyncAt": "2026-03-09T08:00:00.000Z",
  "ttlHours": 24,
  "issueCount": 12,
  "syncType": "delta",
  "provider": "linear"
}
```

**Design decisions:**
- Separate from `issues.json` so sync metadata can be read without parsing the full issue set
- `lastFullSyncAt` distinct from `lastSyncedAt` -- TTL expiry is based on `lastFullSyncAt` to ensure periodic complete refreshes even when deltas are working
- `ttlHours` stored in the file (not hardcoded) so it can be configured per-project later

## Critical Architecture Decision: Linear Delta Strategy

**Problem:** The official Linear MCP `list_issues` tool does NOT have a `since` or `updatedAt` filter parameter. It only supports `sortBy: "updatedAt"`. The community `cosmix/linear-mcp` server has `search_issues` with full `updatedAt` gt/gte filtering, but the plugin currently uses the official Linear MCP.

**Recommendation:** Use a "sort-and-compare" strategy with the official MCP. Fetch issues sorted by `updatedAt DESC` with a reasonable limit (25-50), then compare each issue's `updatedAt` against the cached `lastSyncedAt`. Issues with `updatedAt > lastSyncedAt` are the delta. Stop processing when you hit an issue older than `lastSyncedAt`.

**Why this works:** For a single developer's assigned issues on a team, the total count is typically under 50. Fetching 25-50 issues sorted by most-recently-updated and doing a client-side timestamp comparison is functionally equivalent to server-side `updatedAt > X` filtering. The overhead is minimal.

**Fallback:** If the user has `search_issues` available (community MCP), the pm-sync skill can detect it and use `updatedAt: { gt: lastSyncedAt }` filtering for a cleaner delta. This is an optimization, not a requirement.

**Confidence:** HIGH -- this is a well-understood pattern. The sort-and-compare approach is used by many sync clients that work with APIs lacking server-side change filtering.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Linear (official MCP) | `list_issues` sorted by `updatedAt`, client-side delta comparison | Model-invoked only; cannot call from hooks. Official MCP lacks time-range filter. |
| Linear (community MCP) | `search_issues` with `updatedAt: { gt: timestamp }` | If available, more efficient. Detect via tool availability at runtime. |
| GitHub Issues | `gh api repos/{owner}/{repo}/issues -F since={timestamp} -F state=all` | Native `since` parameter makes delta trivial. Works from both hooks and skills. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Hook -> Cache Store | Direct `require()` | Both run in Node.js; shared module |
| Hook -> Provider (GitHub) | `execFileSync('gh', ...)` | Existing pattern from pm-session-start.js |
| Hook -> Provider (Linear) | Cannot communicate directly | Hook signals "delta needed" in systemMessage; model handles it |
| Skill -> Provider (Linear) | MCP tool calls (model-invoked) | Model reads pm-sync skill instructions, executes MCP calls |
| Skill -> Cache Store | Model reads/writes files via Bash/Read/Write tools | Skill instructs model to update cache files after sync |
| Sync Coordinator -> Cache Reader/Writer | Function calls | All in same Node.js process during hook execution |

## Build Order (Dependencies)

The components have clear dependencies that dictate implementation order:

```
Phase 1: Cache Store (foundation)
    ↓ (everything depends on cache read/write)
Phase 2: Provider Adapters (data sources)
    ↓ (sync coordinator needs adapters to fetch)
Phase 3: Sync Coordinator (orchestration)
    ↓ (hooks and skills need coordinator)
Phase 4: Hook Integration (automated sync)
    ↓ (hooks trigger sync on session lifecycle)
Phase 5: Skill Integration (interactive sync)
    ↓ (skills use cache for briefings)
Phase 6: Delta Reporting (user-facing polish)
```

**Rationale:**
1. **Cache Store first** because every other component reads from or writes to it. Build the schema, read/write functions, TTL validation, and atomic writes before anything else.
2. **Provider Adapters second** because the sync coordinator needs them. The GitHub adapter is simpler (uses `gh` CLI with `since`), so build it first as a reference implementation, then the Linear adapter.
3. **Sync Coordinator third** because it ties cache and providers together. This is the "fetch delta, merge into cache" orchestration logic.
4. **Hook integration fourth** because the hooks are the primary automated trigger. Modify `pm-session-start.js` to load cache and attempt delta; modify `pm-session-end.js` to update cache with session changes.
5. **Skill integration fifth** because skills provide the interactive path. Modify `pm-status` to read from cache, add `pm-sync` for model-driven delta fetch.
6. **Delta reporting last** because it is user-facing polish on top of working sync. "2 issues changed since last check" formatting.

## Anti-Patterns

### Anti-Pattern 1: MCP Calls in Hooks

**What people do:** Try to invoke Linear MCP tools from within the SessionStart hook's Node.js process.
**Why it is wrong:** Hooks run as external commands before the model is active. MCP tools are only available when the model is processing a turn and can execute tool calls. The hook has no MCP client.
**Do this instead:** The hook reads from cache and signals the model via `systemMessage`. The model then runs MCP calls during skill execution when the user interacts.

### Anti-Pattern 2: Full Fetch on Every Session Start

**What people do:** Fetch all issues from the API in the SessionStart hook to ensure freshness.
**Why it is wrong:** API calls add latency (1-3s per call), burn tokens processing responses, and may fail (timeout, rate limit). The whole point of caching is to avoid this.
**Do this instead:** Load from cache. If cache is stale (TTL expired), include a note in the systemMessage. Let the model do a delta fetch on first `/pm` invocation.

### Anti-Pattern 3: Separate Cache Files Per Issue

**What people do:** Store each issue in its own file (e.g., `NTH-42.json`) for granular updates.
**Why it is wrong:** For a typical team's assigned issues (10-50), the overhead of many small files exceeds the benefit. Reading 30 files is slower than reading one. Atomic updates become complex (partial writes leave inconsistent state).
**Do this instead:** Single `issues.json` with an object map keyed by issue ID. Atomic write via temp-file-then-rename.

### Anti-Pattern 4: Caching Full Issue Descriptions

**What people do:** Store the complete issue description (which can be thousands of characters with embedded images, links, etc.).
**Why it is wrong:** Bloats the cache file, increases token cost when injected into context, and most description content is not needed for routing decisions.
**Do this instead:** Truncate descriptions to a useful prefix (first ~500 characters). The full description can be fetched on-demand via `get_issue` when the user picks up a specific issue.

## Sources

- [Linear MCP Official Docs](https://linear.app/docs/mcp)
- [Linear MCP Community Server (cosmix)](https://mcpservers.org/servers/cosmix/linear-mcp) -- search_issues with updatedAt filtering
- [Linear MCP list_issues Tool Schema](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) -- official MCP tool parameters
- [Linear API Filtering Docs](https://developers.linear.app/docs/graphql/working-with-the-graphql-api/filtering)
- [Linear API Pagination Docs](https://linear.app/developers/pagination)
- [GitHub REST API - Issues Endpoint](https://docs.github.com/en/rest/issues/issues) -- `since` parameter for incremental fetch
- [GitHub CLI Manual - gh api](https://cli.github.com/manual/gh_api)
- [AWS AppSync Delta Sync Pattern](https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-delta-sync.html) -- base/delta table architecture
- [Fiberplane - Linear MCP Server Analysis](https://blog.fiberplane.com/blog/mcp-server-analysis-linear/) -- tool coverage comparison

---
*Architecture research for: project-manager incremental sync*
*Researched: 2026-03-11*
