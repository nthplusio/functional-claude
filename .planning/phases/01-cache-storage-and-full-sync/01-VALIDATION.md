---
phase: 1
slug: cache-storage-and-full-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node --test` runner + `node:assert` |
| **Config file** | None — zero-config; tests run via CLI |
| **Quick run command** | `node --test plugins/project-manager/hooks/lib/*.test.js` |
| **Full suite command** | `node --test plugins/project-manager/hooks/lib/*.test.js` |
| **Estimated runtime** | ~2 seconds |

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
| 1-01-01 | 01 | 1 | CACHE-01 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | No — W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | CACHE-02 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | No — W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | CACHE-03 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | No — W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | CACHE-04 | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | No — W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | SYNC-01 | unit + integration | `node --test plugins/project-manager/hooks/lib/github-adapter.test.js` | No — W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | SYNC-01 | manual | N/A (Linear MCP) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `plugins/project-manager/hooks/lib/` directory — does not exist yet, must be created
- [ ] `plugins/project-manager/hooks/lib/cache-store.test.js` — stubs for CACHE-01, CACHE-02, CACHE-03, CACHE-04
- [ ] `plugins/project-manager/hooks/lib/github-adapter.test.js` — stubs for SYNC-01 (GitHub path)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Linear full sync fetches and normalizes issues | SYNC-01 | Requires MCP tool access (model-driven, not available in test runner) | 1. Register a Linear project via /pm-setup. 2. Run full sync from pm-sync skill. 3. Verify `issues.json` contains normalized Linear issues. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
