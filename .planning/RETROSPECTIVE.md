# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Incremental Sync

**Shipped:** 2026-03-14
**Phases:** 3 | **Plans:** 6 | **Sessions:** ~4

### What Was Built
- Normalized JSON issue cache with atomic writes, fail-open error handling, per-project isolation
- Full sync adapters for GitHub (`gh` CLI) and Linear (MCP normalization) with identical NormalizedIssue schema
- Timestamp-based delta sync — GitHub via `gh api` `since` (server-side), Linear via sort-and-compare (client-side)
- Cache-first session startup with FRESH/STALE/EXPIRED freshness indicators in system message
- Delta reporting with field-level change diffs (`diffIssues` + `formatChangeSummary`)
- `/pm --refresh` for force full re-pull

### What Worked
- TDD cycle (RED/GREEN) with atomic commits kept every plan clean — zero regressions across 125 tests
- Coarse phase granularity (3 phases instead of 6) reduced planning overhead without losing clarity
- Wave-based parallel execution of independent plans (01+02 in Phase 2) cut wall-clock time
- Research phase caught the `gh api` snake_case vs `gh issue list` camelCase divergence before it could become a bug
- Fail-open pattern with `cacheRoot` parameter for test isolation eliminated fs mocking entirely

### What Was Inefficient
- Phase 2 Plan 03 (session hook + skill + command) was non-TDD because skills are markdown — harder to verify automatically
- Version bump hook required manual bumps on every commit, adding friction to TDD RED/GREEN cycles
- ROADMAP.md Phase 3 progress wasn't updated to "Complete" by the gsd-tools before milestone completion (stale data)

### Patterns Established
- `hooks/lib/` module pattern — reusable Node.js modules alongside hook scripts, testable with `node --test`
- Atomic write pattern: `writeFileSync` to `.tmp.<pid>`, then `renameSync` — no npm dependencies
- NormalizedIssue schema — unified `{id, title, status, priority, assignee, description, updatedAt, tracker}` for both trackers
- Diff-before-merge ordering — always capture field-level diffs before `mergeIssues` destroys before-state
- Hook/skill boundary — hooks read cache only (fast, no API), skills do sync when model is active

### Key Lessons
1. Research pays for itself immediately — the `gh api` snake_case discovery alone prevented a class of silent bugs
2. Zero-dependency Node.js is viable for substantial modules (700 LOC with atomic writes, caching, diffing)
3. Session-start hooks must be read-only for cache data — any API call risks the 30s timeout
4. Separate normalizer functions for different API response shapes (even from the same tool) prevent field-mapping bugs

### Cost Observations
- Model mix: ~80% opus (research, planning, execution), ~20% sonnet (verification, plan-checking)
- Sessions: ~4 sessions across 3 days
- Notable: Average plan execution was 4 minutes — the tooling overhead (research, planning, verification) was proportionally larger than execution

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~4 | 3 | First milestone — established TDD + atomic commit patterns |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 125 | ~95% (lib modules) | 3 modules (cache-store, github-adapter, linear-adapter) |

### Top Lessons (Verified Across Milestones)

1. Research before planning catches API shape mismatches that would be expensive to fix during implementation
2. TDD with atomic commits creates a clean audit trail and prevents regressions across dependent phases
