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

### Active

- [ ] Cache issue data (status, title, priority, assignee, description) alongside session context
- [ ] Timestamp-based delta sync — store "last checked at", query API for items updated after that timestamp
- [ ] TTL safety net — auto-expire cached issue data after configurable period (force full refresh)
- [ ] Delta reporting — show "X issues changed since last check" when loading from cache
- [ ] Fast cache-first startup — load cached issue state immediately, fetch deltas in background or on-demand
- [ ] Linear incremental sync — use Linear API's `updatedAt` filter to fetch only changed issues
- [ ] GitHub Issues incremental sync — use GitHub API's `since` parameter to fetch only changed issues
- [ ] Cache invalidation on full refresh — manual `/pm --refresh` or TTL expiry triggers complete re-pull
- [ ] Unified cache format — single cache structure that works for both Linear and GitHub Issues

### Out of Scope

- Webhook-driven updates — adds infrastructure complexity (requires server), polling with timestamps is sufficient
- Real-time sync — the plugin runs on session start, not continuously
- Caching comments or activity logs — only cache decision-making data (status, metadata, descriptions)
- Cross-project cache sharing — each project has its own cache in `cache/<slug>/`

## Context

The project-manager plugin currently pulls all issue data fresh from Linear MCP (or GitHub) every time `/pm` or `/pm-status` runs. This burns tokens processing full API responses and adds latency waiting for API round-trips, even when nothing has changed since the last session.

The existing cache infrastructure at `~/.claude/project-manager/cache/<slug>/` only stores session context (branch, HEAD, issue ID) — not the actual issue data that drives routing decisions. Both Linear and GitHub APIs support filtering by update timestamp, making incremental sync straightforward.

**Current data flow:**
1. Session starts → hook writes context.json (branch/HEAD only)
2. User runs `/pm` → full API pull from Linear MCP (every time)
3. Session ends → stop hook analyzes transcript

**Target data flow:**
1. Session starts → hook loads cached issue data + fetches deltas since last check
2. User runs `/pm` → reads from cache (instant), shows what changed
3. Session ends → stop hook updates cache with any issue state changes

## Constraints

- **Platform**: Must work within Claude Code plugin framework (hooks, skills, commands)
- **Storage**: Cache in plugin `.cache/` directory (gitignored, per-project) at `~/.claude/project-manager/cache/<slug>/`
- **APIs**: Linear via MCP tools, GitHub via `gh` CLI — no direct HTTP calls
- **Compatibility**: Both Linear and GitHub Issues must be first-class; tracker type configured per-project in `projects.json`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Timestamp-based delta over ETags/webhooks | Simpler, both APIs support it natively, no infrastructure needed | — Pending |
| Cache in plugin .cache/ not .planning/ | Issue data is runtime state, not planning artifact; should be gitignored | — Pending |
| TTL safety net with configurable expiry | Prevents stale cache from silently serving outdated data | — Pending |
| Cache status + metadata + descriptions only | These are the decision-making fields; comments/activity are too verbose | — Pending |

---
*Last updated: 2026-03-11 after initialization*
