# Stack Research

**Domain:** Incremental sync and local caching for issue tracker data in a Claude Code plugin
**Researched:** 2026-03-11
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js built-in `fs` | (runtime) | JSON file read/write for cache storage | Already used throughout the plugin. JSON files match the existing `context.json` pattern. No dependency needed. Synchronous operations align with hook execution model. |
| `write-file-atomic` | 7.0.1 | Atomic JSON cache writes | Prevents cache corruption from partial writes during hook timeouts or crashes. CommonJS compatible (no `"type": "module"`). Used by npm itself. Pattern: write to temp file, rename atomically. |
| `gh api` (CLI) | (system) | GitHub Issues delta sync via REST API `since` parameter | Already a project constraint. `gh issue list` lacks a `--since` flag, but `gh api /repos/{owner}/{repo}/issues -f since=<ISO8601>` works and returns only issues updated after the timestamp. Verified working. |
| Linear MCP `list_issues` | (runtime) | Linear issue fetching with client-side diff | Constraint: the Linear MCP server exposes 23 tools but none support `updatedAt` filtering. `list_issues` has `sortBy: "updatedAt"` but no date range filter. Delta sync must use client-side comparison: fetch current state, diff against cache. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `write-file-atomic` | ^7.0.1 | Safe cache file persistence | Every cache write operation. Ensures no partial JSON on disk if the process is killed mid-write. |
| `crypto` (built-in) | (runtime) | Cache integrity checksums | Optional. Use `crypto.createHash('sha256')` to hash cache contents and detect corruption. Low priority -- atomic writes handle the main corruption vector. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js `--test` runner | Unit testing cache logic | Built-in since Node 18. No test framework dependency needed for a plugin. Run with `node --test tests/cache.test.js`. |
| `node:assert` | Test assertions | Built-in. Pair with `--test` for zero-dependency testing. |

## Cache Storage Design

The cache is a JSON file per project at `~/.claude/project-manager/cache/<slug>/issues.json`. Not a database.

**Why JSON files, not SQLite:**

| Criterion | JSON files | `node:sqlite` | `better-sqlite3` |
|-----------|-----------|---------------|-------------------|
| Dependencies | Zero | Zero (built-in) | Native addon, needs compilation |
| Stability | Stable | Experimental on Node 24, RC on 25 (emits warnings) | Stable, battle-tested |
| Data model | Matches existing `context.json` pattern | Relational -- overkill for 10-50 issues | Same |
| Read speed | `JSON.parse(fs.readFileSync(...))` -- sub-millisecond for issue-sized payloads | Query overhead | Query overhead |
| Write safety | Needs `write-file-atomic` | Built-in journaling | Built-in journaling |
| Plugin portability | Works everywhere Node runs | Requires `node:sqlite` support | Requires `node-gyp` build toolchain |
| Debugging | Open file, read JSON | Need SQLite client | Same |

**Verdict:** The cache stores 10-100 issues per project. JSON files are the right tool. SQLite's advantages (queries, concurrency, journaling) don't matter at this scale. The plugin already uses JSON files for `context.json` and `projects.json` -- adding a different storage format increases cognitive overhead for zero practical benefit.

## Cache File Schema

```json
{
  "version": 1,
  "tracker": "linear",
  "lastSyncedAt": "2026-03-11T10:30:00.000Z",
  "lastFullRefreshAt": "2026-03-10T08:00:00.000Z",
  "ttlHours": 24,
  "issues": {
    "ENG-42": {
      "id": "ENG-42",
      "title": "Add auth middleware",
      "status": "In Progress",
      "priority": 2,
      "assignee": "me",
      "description": "## Goal\n...",
      "updatedAt": "2026-03-11T09:15:00.000Z",
      "cachedAt": "2026-03-11T10:30:00.000Z"
    }
  }
}
```

**Key design choices:**
- `version` field enables schema migration without cache loss
- `issues` is a flat object keyed by issue ID (fast lookup, easy merge)
- `lastSyncedAt` drives delta queries for the next sync
- `lastFullRefreshAt` + `ttlHours` drive the TTL safety net
- `cachedAt` per-issue enables targeted staleness detection

## Delta Sync Strategies by Tracker

### GitHub Issues (via `gh api`)

GitHub REST API natively supports `since` parameter:

```bash
gh api /repos/{owner}/{repo}/issues \
  -f since="2026-03-11T10:30:00Z" \
  -f state=all \
  -f per_page=100 \
  --jq '.[] | {number, title, state, updated_at, assignee: .assignee.login, labels: [.labels[].name], body}'
```

**Confidence: HIGH** -- Verified working on this repository. Returns only issues updated after the timestamp. ISO 8601 format.

### Linear (via MCP `list_issues`)

The Linear MCP `list_issues` tool does NOT support `updatedAt` filtering. Available parameters: `assignee`, `status`, `project`, `team`, `sortBy`, `sortDirection`, `limit`.

**Strategy: Fetch-and-diff.** Fetch all active issues (sorted by `updatedAt` DESC), compare against cache, emit only the delta.

```
list_issues {
  team: "<team_key>",
  project: "<project_name>",
  sortBy: "updatedAt",
  sortDirection: "DESC",
  limit: 50
}
```

Then in the plugin: compare each returned issue's `updatedAt` against the cached `updatedAt`. Issues with a newer timestamp are "changed since last sync."

**Why this works despite fetching everything:** The Linear MCP call happens from skills/commands (not from time-constrained hooks). The model processes the response, and the plugin caches the parsed result. The overhead is in MCP round-trip time and token cost, both of which are bounded by `limit: 50`. For most teams, 50 issues covers all active work.

**Confidence: HIGH** -- This is the only viable approach given MCP tool constraints. The Linear GraphQL API supports `updatedAt: {gt: "..."}` filtering, but the MCP server does not expose raw GraphQL access.

## Installation

```bash
# Single dependency
npm install write-file-atomic

# Everything else is Node.js built-in:
# - fs (file I/O)
# - path (path manipulation)
# - child_process (gh CLI calls)
# - crypto (optional checksums)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| JSON files + `write-file-atomic` | `node:sqlite` built-in | When cache grows beyond ~500 issues per project, or when you need cross-issue queries (e.g., "all P1 issues assigned to X across teams"). Currently overkill. |
| JSON files + `write-file-atomic` | `better-sqlite3` | Never for this plugin. Native addon requires `node-gyp` build toolchain, breaks portability. |
| JSON files + `write-file-atomic` | `lowdb` v7 | Never. Pure ESM -- incompatible with the plugin's CommonJS hooks. Community CJS forks exist but are unmaintained. |
| `gh api` for GitHub delta sync | `gh issue list --json` | When you don't need `since` filtering -- e.g., initial full refresh where you want all issues. `gh issue list --json number,title,state,updatedAt,assignees,labels --state all` is simpler for full pulls. |
| Client-side diff for Linear | Direct Linear GraphQL API | If the plugin ever adds direct HTTP capability (not through MCP), the Linear GraphQL API supports `issues(filter: {updatedAt: {gt: "..."}})` for true server-side delta filtering. Would eliminate fetching unchanged issues. |
| Flat `issues.json` per project | Shared cache file across projects | Never. Per-project isolation prevents cache corruption spreading. Matches existing `cache/<slug>/` directory structure. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `lowdb` | Pure ESM since v3. Plugin hooks use CommonJS `require()`. CJS forks are unmaintained. | JSON files with `write-file-atomic` |
| `conf` (sindresorhus) | Pure ESM. Same CommonJS incompatibility. Also designed for app config, not issue data caching. | JSON files with `write-file-atomic` |
| `node-cache` | In-memory only. Cache is lost when the hook process exits. Plugin hooks run as separate processes per invocation. | JSON file persistence |
| `better-sqlite3` | Native C++ addon. Requires `node-gyp`, Python, and a C compiler. Breaks on machines without build tools. Overkill for <100 records. | JSON files |
| `node:sqlite` (for now) | Experimental on Node 24 (emits runtime warnings). RC on Node 25. API may change. Plugin should not emit warnings to Claude Code users. | JSON files. Revisit when `node:sqlite` reaches Stable status. |
| ETags / conditional requests | Neither `gh api` nor Linear MCP support ETag-based caching. Would require direct HTTP with custom headers. | Timestamp-based `since` (GitHub) / fetch-and-diff (Linear) |
| Webhooks | Requires a server to receive callbacks. Plugin runs only during Claude Code sessions. No always-on infrastructure. | Polling with timestamp filtering |
| Real-time sync (WebSocket/SSE) | Same problem as webhooks -- no persistent process. Plugin hooks are ephemeral. | Session-start sync + on-demand refresh |

## Stack Patterns by Variant

**If using GitHub Issues as tracker:**
- Use `gh api` with `since` parameter for true server-side delta filtering
- Full refresh: `gh issue list --json ... --state all --limit 200`
- Delta refresh: `gh api /repos/{owner}/{repo}/issues -f since=<lastSyncedAt> -f state=all`
- Both use `execFileSync` in hooks, consistent with existing plugin patterns

**If using Linear as tracker:**
- Use `list_issues` MCP tool with `sortBy: "updatedAt"` for fetch-and-diff
- Full refresh: same call with `limit: 100`
- Delta detection: client-side comparison of `updatedAt` timestamps
- MCP calls happen in skill/command context (not hooks), so no timeout pressure

**If cache TTL expires or manual refresh requested:**
- Both trackers: perform full refresh, replace entire `issues` object in cache
- Reset `lastSyncedAt` and `lastFullRefreshAt` to current time

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `write-file-atomic@^7.0.1` | Node.js `^20.17.0 \|\| >=22.9.0` | Matches the plugin's runtime. No ESM requirement. CommonJS `require('write-file-atomic')`. |
| `node:sqlite` (future option) | Node.js `>=22.5.0` | Experimental on 22-24, RC on 25. Do not use until Stable. |
| `gh` CLI | Any recent version | `gh api` with `-f since=` works across all modern versions. |
| Linear MCP | Current official server | 23 tools. `list_issues` parameters: assignee, status, project, team, sortBy, sortDirection, limit. No date filtering. |

## Sources

- [Node.js `node:sqlite` API documentation](https://nodejs.org/api/sqlite.html) -- Confirmed experimental/RC status, synchronous-only API (HIGH confidence)
- [Linear GraphQL API filtering](https://linear.app/developers/filtering) -- `updatedAt: {gt: "..."}` supported in API but NOT in MCP tools (HIGH confidence)
- [Linear MCP tool analysis (Fiberplane)](https://blog.fiberplane.com/blog/mcp-server-analysis-linear/) -- 23 tools, no arbitrary GraphQL, task-oriented abstraction (HIGH confidence)
- [Linear MCP `list_issues` parameters (Glama)](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) -- Confirmed parameter list, no date filtering (HIGH confidence)
- [GitHub CLI `gh issue list` manual](https://cli.github.com/manual/gh_issue_list) -- No `--since` flag, but `--json updatedAt` available (HIGH confidence)
- [GitHub REST API issues endpoint](https://docs.github.com/en/rest/issues/issues) -- `since` parameter accepts ISO 8601, filters by `updated_at` (HIGH confidence)
- [write-file-atomic npm](https://www.npmjs.com/package/write-file-atomic) -- v7.0.1, CommonJS, atomic rename pattern (HIGH confidence, verified via `npm view`)
- [lowdb ESM-only issue](https://github.com/typicode/lowdb/issues/512) -- Confirmed pure ESM since v3, no official CJS support (HIGH confidence)
- Verified `gh api /repos/{owner}/{repo}/issues -f since=<ISO8601>` works on this repository (direct test, HIGH confidence)
- Verified `node:sqlite` works on Node.js v24.13.0 but emits ExperimentalWarning (direct test, HIGH confidence)

---
*Stack research for: project-manager incremental sync and local caching*
*Researched: 2026-03-11*
