---
phase: 3
slug: delta-reporting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

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
| 3-01-01 | 01 | 1 | SYNC-05 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists — needs diffIssues + formatChangeSummary tests | ⬜ pending |
| 3-01-02 | 01 | 1 | SYNC-05 | manual | Verify pm-status skill displays change summary after delta sync | N/A — skill integration | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. Tests extend `cache-store.test.js` which already exists with 37 tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| pm-status skill displays change summary after delta sync | SYNC-05 | Skill is markdown instructions executed by model — not unit-testable | 1. Run `/pm` after cache exists. 2. Verify change summary appears showing field diffs. 3. If no changes, verify "no changes" message. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
