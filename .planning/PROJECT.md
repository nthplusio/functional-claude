# Project Manager Incremental Sync

## What This Is

An enhancement to the project-manager plugin that adds incremental sync and caching for issue tracker data (Linear and GitHub Issues). Instead of doing a full API pull every session, the plugin caches issue status, metadata, and descriptions locally, then queries only for changes since the last check using timestamp-based filtering.

## Core Value

Session startup is fast and token-efficient — the plugin loads cached state instantly and only fetches what changed since the last check.

## Requirements

### Validated

- ✓ Session context caching — session-start hook writes branch/HEAD/issue context to `~/.claude/project-manager/cache/<slug>/context.json`
- ✓ Project registry — `projects.json` stores repo-to-tracker mappings (Linear workspace, team key, GitHub user)
- ✓ Linear MCP integration — pm-status fetches in-progress and suggested issues via Linear MCP tools
- ✓ GitHub CLI integration — branch creation and PR workflows via `gh` CLI
- ✓ Branch-issue linkage — Linear issue ID extracted from branch naming convention
- ✓ Session-end tracking — stop hook analyzes transcript for issue signals and git activity
- ✓ Fail-open design — hooks silently skip on errors, never block sessions
- ✓ 24-hour TTL — session context expires after 24 hours in stop hook
- ✓ Normalized JSON issue cache with atomic writes and fail-open error handling — v1.0
- ✓ GitHub full sync via `gh` CLI with NormalizedIssue schema — v1.0
- ✓ Linear full sync via MCP with identical normalization — v1.0
- ✓ Timestamp-based delta sync (GitHub: `gh api` `since`, Linear: client-side comparison) — v1.0
- ✓ Sync-meta persistence with FRESH/STALE/EXPIRED freshness tiers — v1.0
- ✓ Cache-first session startup with zero API calls in session-start hook — v1.0
- ✓ `/pm --refresh` force full re-pull — v1.0
- ✓ Delta reporting with field-level change diffs and "no changes" handling — v1.0
- ✓ Unified cache format for both Linear and GitHub Issues — v1.0

### Active

(No active requirements — v1.0 complete. See v2 deferred items in Out of Scope.)

### Out of Scope

- Webhook-driven updates — adds infrastructure complexity (requires server), polling with timestamps is sufficient
- Real-time sync — the plugin runs on session start, not continuously
- Caching comments or activity logs — only cache decision-making data (status, metadata, descriptions)
- Cross-project cache sharing — each project has its own cache in `cache/<slug>/`
- Cache metadata display in system message (UX-01) — deferred to v2
- Branch-issue cache enrichment (UX-02) — deferred to v2
- Configurable per-project TTL (UX-03) — deferred to v2
- Stale-while-revalidate pattern (UX-04) — deferred to v2
- Cache write-through on mutations (LIFE-01) — deferred to v2
- Cache versioning and migration (LIFE-02) — deferred to v2
- Session-end cache update (LIFE-03) — deferred to v2

## Context

**v1.0 shipped 2026-03-14.** The project-manager plugin now caches issue data locally and uses timestamp-based delta sync for both Linear and GitHub.

**Current data flow (v1.0):**
1. Session starts → hook loads cached issues from `cache/<slug>/issues.json`, injects summary with FRESH/STALE/EXPIRED indicator into system message (zero API calls)
2. User runs `/pm` → reads cache first, runs delta sync if STALE, full sync if EXPIRED; displays change summary with field-level diffs
3. User runs `/pm --refresh` → forces complete re-pull regardless of cache freshness

**Implementation:** 699 LOC across 3 modules (`cache-store.js`, `github-adapter.js`, `linear-adapter.js`) with 125 passing tests (1,384 LOC tests). All modules use CommonJS, zero npm dependencies, atomic writes, fail-open error handling.

## Constraints

- **Platform**: Must work within Claude Code plugin framework (hooks, skills, commands)
- **Storage**: Cache in plugin `.cache/` directory (gitignored, per-project) at `~/.claude/project-manager/cache/<slug>/`
- **APIs**: Linear via MCP tools, GitHub via `gh` CLI — no direct HTTP calls
- **Compatibility**: Both Linear and GitHub Issues must be first-class; tracker type configured per-project in `projects.json`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Timestamp-based delta over ETags/webhooks | Simpler, both APIs support it natively, no infrastructure needed | ✓ Good — GitHub `since` param works server-side, Linear sort-and-compare works client-side |
| Cache in plugin .cache/ not .planning/ | Issue data is runtime state, not planning artifact; should be gitignored | ✓ Good — `~/.claude/project-manager/cache/<slug>/` keeps cache isolated and gitignored |
| TTL safety net with configurable expiry | Prevents stale cache from silently serving outdated data | ✓ Good — 24h TTL with FRESH/STALE/EXPIRED tiers gives clear user feedback |
| Cache status + metadata + descriptions only | These are the decision-making fields; comments/activity are too verbose | ✓ Good — NormalizedIssue schema covers routing decisions without bloat |
| CommonJS modules, zero npm deps | Match existing hook file conventions; keep plugin lightweight | ✓ Good — 699 LOC with atomic writes, no install step |
| Separate normalizers for `gh api` vs `gh issue list` | Different response schemas (snake_case vs camelCase) | ✓ Good — prevents silent field-mapping bugs |
| Diff-before-merge pattern | `diffIssues` must run before `mergeIssues` since merge destroys before-state | ✓ Good — clean separation of concerns |

---
*Last updated: 2026-03-14 after v1.0 milestone*
