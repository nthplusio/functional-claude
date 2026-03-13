---
phase: 2
slug: delta-sync-and-session-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node --test` runner + `node:assert` |
| **Config file** | None — zero-config; tests run via CLI |
| **Quick run command** | `node --test plugins/project-manager/hooks/lib/*.test.js` |
| **Full suite command** | `node --test plugins/project-manager/hooks/lib/*.test.js` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test plugins/project-manager/hooks/lib/*.test.js`
- **After every plan wave:** Run `node --test plugins/project-manager/hooks/lib/*.test.js`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | SYNC-03, SESS-02 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists — needs new tests | ⬜ pending |
| 2-02-01 | 02 | 1 | SYNC-02 (GitHub) | unit | `node --test plugins/project-manager/hooks/lib/github-adapter.test.js` | Exists — needs delta tests | ⬜ pending |
| 2-02-02 | 02 | 1 | SYNC-02 (Linear) | unit | `node --test plugins/project-manager/hooks/lib/linear-adapter.test.js` | Exists — needs delta tests | ⬜ pending |
| 2-03-01 | 03 | 2 | SESS-01, SESS-02 | manual | Verify session-start hook injects cache into system message | N/A — hook integration | ⬜ pending |
| 2-03-02 | 03 | 2 | SYNC-04 | manual | Verify `/pm --refresh` forces full re-pull | N/A — skill integration | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `cache-store.test.js` — needs new tests for: `readSyncMeta`, `writeSyncMeta`, `mergeIssues`, `classifyFreshness`, TTL expiry logic
- [ ] `github-adapter.test.js` — needs new tests for: `normalizeGitHubApiIssues` (snake_case handling, PR filtering), `fetchDelta` shape validation
- [ ] `linear-adapter.test.js` — needs new tests for: delta filtering logic (issues with `updatedAt > lastSyncedAt`)

*Existing test infrastructure from Phase 1 is solid. No new test files needed — extend existing ones.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session-start hook injects cached issues into system message | SESS-01 | Hook I/O requires live Claude Code session | 1. Run session in registered project. 2. Verify system message includes issue summary. 3. No API calls in hook execution. |
| Staleness tier displayed correctly | SESS-02 | System message format verification in live session | 1. Check FRESH/STALE/EXPIRED labels appear based on cache age. |
| `/pm --refresh` forces full re-pull | SYNC-04 | Requires live Linear MCP / GitHub CLI interaction | 1. Run `/pm --refresh`. 2. Verify `sync-meta.json` `lastFullSyncAt` updated. 3. All issues re-fetched. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
