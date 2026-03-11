# Project Research Summary

**Project:** project-manager incremental sync and local caching
**Domain:** Issue tracker caching for a Claude Code plugin (Linear + GitHub Issues)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

This project adds incremental sync and local caching to the existing `project-manager` plugin, which already tracks active projects and injects issue context into Claude sessions. The core problem is that the plugin currently makes live API calls to Linear (via MCP) or GitHub (via `gh` CLI) during session startup and `/pm` invocations, which adds latency, burns API quota, and fails when connectivity is unavailable. The solution is a local JSON file cache at `~/.claude/project-manager/cache/<slug>/issues.json` that is loaded instantly on session start and refreshed incrementally — only fetching what changed since the last sync.

The recommended approach is timestamp-based delta sync with a TTL safety net. GitHub Issues support native server-side filtering via `gh api ... -f since=<ISO8601>`, making delta sync trivial. Linear's official MCP server lacks a `updatedAt` date-range filter, so the Linear path uses a "fetch sorted by updatedAt, compare client-side" pattern — fetching the 25-50 most recently updated issues and discarding unchanged ones by comparing timestamps against the cache. Both paths write through a unified normalized cache schema, enabling shared display and TTL logic. The single external dependency added is `write-file-atomic` to prevent cache corruption from mid-write process termination.

The highest-risk area is the boundary between hook execution and MCP availability: hooks run before the model is active and cannot invoke MCP tools, which means Linear delta sync cannot happen at session-start hook time. The architectural decision to split "cache-read at hook time" from "delta-fetch at skill time" is foundational — getting this wrong requires a hook-flow rewrite. The second major risk is stale data being served silently without freshness indicators, which degrades user trust over time. Both risks are well-understood and solvable, making overall confidence HIGH.

## Key Findings

### Recommended Stack

The stack is minimal by design: all storage is plain JSON files using Node.js built-in `fs`, matching the existing `context.json` pattern already used throughout the plugin. The only external dependency needed is `write-file-atomic@^7.0.1` (CommonJS-compatible, used by npm itself) to ensure cache writes are atomic. SQLite was evaluated and rejected — it has no advantage over JSON at 10-100 issues per project, and either requires native compilation (`better-sqlite3`) or emits runtime warnings (`node:sqlite` is experimental through Node 24). Pure-ESM libraries (`lowdb`, `conf`) are incompatible with the plugin's CommonJS hook architecture and must be avoided entirely.

**Core technologies:**
- `fs` (Node.js built-in): JSON cache read/write — already the project standard, zero new dependency
- `write-file-atomic@^7.0.1`: Atomic cache writes — write-to-temp then `fs.renameSync`; prevents corruption from process kill mid-write
- `gh api` (system CLI): GitHub delta sync via `since` parameter — verified working on this repository, returns only issues updated after a given timestamp
- Linear MCP `list_issues`: Linear issue fetch with `sortBy: "updatedAt"` — client-side timestamp diff required; no server-side date-range filter in official MCP tools
- `node:assert` + `node --test` (built-in): Zero-dependency unit testing for cache logic

### Expected Features

The feature dependency chain is clear: the unified cache schema is foundational and everything else builds on it. There is a seven-feature MVP (P1) that makes caching meaningfully useful, followed by five UX enhancements (P2) to add after validation, then three future capabilities (P3) that require a mature caching layer.

**Must have (table stakes) — v1:**
- Unified cache format (`issues.json` + `sync-meta.json`) — every other feature depends on this schema
- Full sync path (cold-start and TTL-expiry) — the fallback when delta sync is unavailable or expired
- Cache-first session startup — load and inject cached state instantly; never block on API calls at hook time
- Timestamp-based delta sync — fetch only changed issues on `/pm` invocation; GitHub native `since`, Linear sort-and-compare
- TTL-based safety net (default 24h) — forces periodic full refresh; backstop for missed deletions and clock skew
- Force refresh (`/pm --refresh`) — manual escape hatch; critical for user trust
- Fail-open error handling — cache failures never block a session; serve stale data with warning

**Should have (competitive) — v1.x:**
- Delta reporting ("3 issues changed since last session" with field-level diff summary)
- Cache metadata in system message ("Issue data from 2h ago, 23 issues cached")
- Branch-issue cache enrichment (pull linked issue title/status for current branch at zero API cost)
- Configurable TTL per project (`cache_ttl_hours` in `projects.json`)
- Stale-while-revalidate (lazy: serve cache, fetch delta on first `/pm` call)

**Defer (v2+):**
- Cache write-through on issue mutations (update cache immediately when MCP creates/updates an issue)
- Cache versioning and migration (schema versioning for plugin updates)
- Session-end cache update (stop hook updates cached statuses based on auto-actions taken)

### Architecture Approach

The architecture has six layers with clear dependency order: Cache Store (foundation) → Provider Adapters (data sources) → Sync Coordinator (orchestration) → Hook Integration (automated lifecycle) → Skill Integration (interactive path) → Delta Reporting (user-facing polish). The critical split is that hooks are ephemeral Node.js processes that can run `gh` CLI but cannot invoke MCP tools — so GitHub delta sync can happen in the session-start hook, but Linear delta sync must be deferred to the first `/pm` command invocation when the model is active. Both paths write to the same cache format, so all display and TTL logic is shared.

**Major components:**
1. **Cache Store** (`hooks/lib/cache-store.js`) — read/write for `issues.json` and `sync-meta.json`; TTL validation; atomic writes via temp-rename; backup/recovery on parse failure
2. **Provider Adapters** (`hooks/lib/linear-adapter.js`, `hooks/lib/github-adapter.js`) — translate sync requests to tracker-specific calls; normalize results to unified `NormalizedIssue` schema; abstract whether filtering is server-side (GitHub) or client-side (Linear)
3. **Sync Coordinator** (`hooks/lib/sync-coordinator.js`) — orchestrates cache-read → delta-fetch → cache-write lifecycle; called by hooks and by the `pm-sync` skill
4. **SessionStart Hook** (extends `pm-session-start.js`) — reads cache, checks TTL, injects issue summary into `systemMessage`; for GitHub projects, also attempts inline delta sync; for Linear, signals "delta needed"
5. **`pm-sync` Skill** (new `skills/pm-sync/SKILL.md`) — model-driven sync path; runs when model is active; handles Linear MCP delta via sort-and-compare; also handles richer error recovery
6. **`pm-status` Skill** (modified) — reads from cache first; shows delta summary with field-level change descriptions

### Critical Pitfalls

1. **Hook timeout kills sync mid-operation** — The session-start hook has a 30s timeout. A single Linear MCP call takes 1-5s; multiple calls exhaust the budget. Hooks must only *read* the cache; all API sync deferred to skill-time. Never update `lastSyncedAt` until all sync operations complete atomically.

2. **Deleted issues become ghosts in the cache** — Timestamp delta sync returns only modified-and-existing issues; deleted/trashed issues are silently absent from delta results and persist in cache indefinitely. Include `includeArchived: true` in Linear queries and prune issues where `trashed=true`; rely on TTL full refresh as the backstop.

3. **MCP tool constraints differ from underlying API** — The Linear GraphQL API supports `updatedAt: {gt: "..."}` filtering; the official MCP `list_issues` tool does not expose this parameter. Audit MCP tool parameters before writing any sync code; design the Linear path as client-side sort-and-compare from the start.

4. **Cache corruption from non-atomic writes** — `fs.writeFileSync` truncates then writes; a kill mid-write leaves an empty or partial JSON file. Claude Code itself had this exact bug with `.claude.json`. Use `write-file-atomic` (write-to-temp, then `fs.renameSync`) on every cache write; maintain `.bak` file; detect parse failure and fall back to backup before triggering full refresh.

5. **Stale data served silently without freshness indicators** — Fail-open design means sync failures are swallowed; users cannot distinguish fresh data from a 3-day-old cache. Always display cache age alongside issue data; use three staleness tiers (FRESH/STALE/EXPIRED); actively prompt on EXPIRED. This must ship with v1, not be retrofitted.

## Implications for Roadmap

Based on the dependency chain in ARCHITECTURE.md and the build-order rationale, six phases are recommended:

### Phase 1: Cache Schema and Storage Foundation
**Rationale:** Every other component reads from or writes to the cache. The schema must be locked before any sync code is written. This is also where the two highest-risk pitfalls (corruption, ghost issues) are prevented or baked in from the start.
**Delivers:** `cache-store.js` with read/write/TTL/backup; `issues.json` and `sync-meta.json` schemas; atomic write pattern via `write-file-atomic`; parse-failure recovery; per-issue `updatedAt` field for ghost detection; overlap window in `lastSyncedAt` calculation for clock skew
**Addresses:** Unified cache format, fail-open error handling, TTL safety net (data model)
**Avoids:** Cache corruption (atomic writes from day one), ghost issues (schema tracks `trashed` field), clock skew (`lastSyncedAt` uses API timestamp not local clock)
**Research flag:** Standard patterns — no additional research needed.

### Phase 2: Provider Adapters
**Rationale:** The sync coordinator needs adapters to fetch data. The GitHub adapter is simpler (server-side `since` filter) and should be built first as the reference implementation before tackling the Linear client-side-diff approach.
**Delivers:** `github-adapter.js` (gh api with `since`), `linear-adapter.js` (list_issues sort-and-compare), shared `NormalizedIssue` schema, MCP tool parameter audit documented inline
**Addresses:** Timestamp-based delta sync, full sync path
**Avoids:** MCP tool constraint assumptions (audit-first approach), Linear pagination surprises
**Research flag:** Needs MCP parameter audit at implementation time — verify exact `list_issues` parameters in the project's installed Linear MCP version before writing adapter logic. Specifically: does `list_issues` expose `includeArchived`? Does pagination use cursor tokens?

### Phase 3: Sync Coordinator and Full Sync Path
**Rationale:** With adapters in place, the coordinator ties cache and providers together. Full sync (cold-start and TTL-expiry) must work before delta sync is built on top of it.
**Delivers:** `sync-coordinator.js`; full sync path (fetch all, write cache, set timestamps); TTL check and expiry logic; `/pm --refresh` force-refresh command
**Addresses:** Full sync path, TTL safety net (logic), force refresh
**Avoids:** Hook timeout (coordinator designed for skill-time invocation, not hook-time)
**Research flag:** Standard patterns — coordinator design fully specified in ARCHITECTURE.md.

### Phase 4: Hook Integration (Session Lifecycle)
**Rationale:** Hooks are the primary automated trigger. This phase wires the cache into session startup and end. The critical constraint is that hooks only *read* cache — no sync API calls — to stay within the 30s timeout budget.
**Delivers:** Modified `pm-session-start.js` (cache-read, TTL check, systemMessage injection, GitHub-only inline delta); modified `pm-session-end.js` (cache update from session actions); staleness tiers (FRESH/STALE/EXPIRED) in all issue-displaying output
**Addresses:** Cache-first session startup, cache metadata in system message, branch-issue cache enrichment
**Avoids:** Hook timeout (read-only hook path enforced), stale data without indicators (freshness labels required, not deferred)
**Research flag:** Standard patterns — hook modification follows established patterns in this codebase.

### Phase 5: Skill Integration and Delta Sync
**Rationale:** Skills provide the interactive sync path where the model is active and MCP calls are available. This phase adds the Linear delta path and upgrades `/pm` to show cache-first results with on-demand sync.
**Delivers:** New `pm-sync` skill (Linear sort-and-compare delta, GitHub delta via gh); modified `pm-status` skill (reads from cache, triggers pm-sync); delta merge into cache; `lastSyncedAt` update
**Addresses:** Timestamp-based delta sync (Linear path), cache-first on `/pm` invocation, ghost-issue pruning on each sync
**Avoids:** MCP constraints (sort-and-compare is the designed approach), ghost accumulation (prune trashed/archived on every Linear sync)

### Phase 6: Delta Reporting and UX Polish
**Rationale:** User-facing enhancements that make the caching layer feel polished rather than invisible. These build on a working and validated sync loop.
**Delivers:** Field-level change summaries ("NTH-42: In Progress → In Review"), "X issues changed since last session" in system message, active EXPIRED-tier prompts ("Issue data is 3 days old — run /pm --refresh"), configurable TTL per project
**Addresses:** Delta reporting, configurable TTL, stale-while-revalidate (if latency feedback from v1 warrants it)
**Research flag:** Standard UX patterns — no additional research needed.

### Phase Ordering Rationale

- Schema before sync: the cache format cannot change once adapters and coordinator are written against it; locking it first prevents expensive rework
- GitHub adapter before Linear adapter: server-side filtering is simpler and produces a working reference before tackling the client-side-diff complexity of the Linear path
- Full sync before delta sync: delta sync is meaningless without a valid full-sync baseline; TTL expiry also falls back to full sync
- Hook integration before skill integration: the automated path (session lifecycle) is higher value than the interactive path; users benefit from cache-first startup immediately
- Polish last: delta reporting and staleness tiers require the sync loop to be working and validated; building them in parallel adds waste if core sync design changes

### Research Flags

Phases needing deeper research during planning:
- **Phase 2 (Provider Adapters):** Requires an MCP tool parameter audit at implementation time to confirm exact `list_issues` parameters available in the installed Linear MCP version. Key unknowns: `includeArchived` availability, pagination cursor behavior, and exact returned field set (does `list_issues` return `description`?).

Phases with standard patterns (skip additional research):
- **Phase 1:** JSON file caching with atomic writes — verified examples and established patterns
- **Phase 3:** Sync coordinator — design is fully specified in ARCHITECTURE.md
- **Phase 4:** Hook modification — follows established codebase patterns
- **Phase 5:** MCP call patterns already used in existing skills; sort-and-compare is a known workaround
- **Phase 6:** Display formatting — no external integrations

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `write-file-atomic` npm-viewed; `gh api since` tested on this repo; `node:sqlite` experimental status confirmed via direct test; Linear MCP parameter list confirmed via Glama tool schema and Fiberplane analysis |
| Features | HIGH | Feature set grounded in existing plugin behavior; dependency chain is explicit; Linear MCP constraints confirmed via MCP tool documentation; anti-features have clear rationale |
| Architecture | HIGH | Component boundaries are clear; dual-path delta (hook vs. skill context) is the only viable design given MCP constraints; build order is dependency-driven with verified rationale |
| Pitfalls | HIGH | All critical pitfalls sourced: Claude Code JSON corruption bug documented in GitHub issues, hook timeout from official hook docs, MCP tool constraints from Fiberplane analysis and Glama tool schema |

**Overall confidence:** HIGH

### Gaps to Address

- **Linear MCP `includeArchived` parameter availability:** Research confirms the Linear GraphQL API supports `includeArchived: true` on issue connections, but whether the official MCP `list_issues` tool exposes this parameter is uncertain. If unavailable, ghost-issue detection must rely solely on the TTL full-refresh backstop. Verify at implementation time during Phase 2.

- **Concurrent session cache safety:** `write-file-atomic` handles single-process atomicity (write-to-temp, rename) but does not implement cross-process file locking. Two simultaneous Claude sessions for the same project could produce a logical race (last-write-wins on `issues.json`). For v1 this is acceptable given how rare concurrent same-project sessions are, but the gap should be acknowledged in implementation notes.

- **Linear MCP `list_issues` pagination:** Whether the MCP tool exposes cursor-based pagination tokens (vs. a hard `limit` ceiling) determines whether delta sync can exhaust all changed issues or is capped. If pagination is not available, `limit: 50` is a hard ceiling. Verify during Phase 2 adapter implementation.

## Sources

### Primary (HIGH confidence)
- [GitHub REST API Issues](https://docs.github.com/en/rest/issues/issues) — `since` parameter, ISO 8601 timestamps; verified working via direct test on this repository
- [Linear MCP list_issues tool schema (Glama)](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) — confirmed parameter list; no date filtering exposed
- [Fiberplane Linear MCP Server Analysis](https://blog.fiberplane.com/blog/mcp-server-analysis-linear/) — 23 tools, task-oriented abstraction, no raw GraphQL access
- [write-file-atomic npm](https://www.npmjs.com/package/write-file-atomic) — v7.0.1, CommonJS, atomic rename; verified via `npm view`
- [Node.js `node:sqlite` API docs](https://nodejs.org/api/sqlite.html) — experimental/RC status confirmed; emits ExperimentalWarning on Node 24 (direct test)
- [GitHub CLI Manual - gh issue list](https://cli.github.com/manual/gh_issue_list) — no `--since` flag; `gh api` is the correct delta sync path
- [Linear API Filtering](https://linear.app/developers/filtering) — `updatedAt: {gt: "..."}` in GraphQL; not exposed via official MCP
- [Linear API Pagination](https://linear.app/developers/pagination) — cursor-based, 50 items default
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) — SessionStart timeout constraints
- [Claude Code .claude.json corruption issue #29036](https://github.com/anthropics/claude-code/issues/29036) — real-world JSON corruption from concurrent writes in the same ecosystem

### Secondary (MEDIUM confidence)
- [Linear MCP Community Server (cosmix)](https://mcpservers.org/servers/cosmix/linear-mcp) — `search_issues` with `updatedAt` filtering available if community MCP is used; optional optimization path
- [Google Calendar API Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync) — reference implementation for incremental sync with token expiry handling (pattern reference)
- [Stale-While-Revalidate pattern](https://web.dev/articles/stale-while-revalidate) — cache pattern for lazy revalidation; applicable to v1.x deferred sync

### Tertiary (LOW confidence)
- None — all key decisions are grounded in HIGH or MEDIUM confidence sources

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
