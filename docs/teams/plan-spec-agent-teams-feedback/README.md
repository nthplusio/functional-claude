# Team: plan-spec-agent-teams-feedback

| Field | Value |
|-------|-------|
| Type | Planning — spec |
| Mode | spec |
| Topic | Agent-teams feedback loop implementation specs |
| Date | 2026-02-22 |
| Status | completed |
| Primary artifact | [spec.md](spec.md) |

## What This Team Did

Translated 10 evaluation recommendations from `docs/teams/research-eval-agent-teams-loop/evaluation-report.md` into implementation-ready specs for the agent-teams plugin feedback loop.

**Source:** `docs/teams/research-eval-agent-teams-loop/evaluation-report.md`

## Deliverables

| File | Description |
|------|-------------|
| [spec.md](spec.md) | Final compiled spec — all recommendations, roadmap, cross-cutting concerns |
| [tasks/task-01-spec-r1-r3.md](tasks/task-01-spec-r1-r3.md) | R1 (calibration counter) + R3 (score accuracy immediate) |
| [tasks/task-02-spec-r4-r11.md](tasks/task-02-spec-r4-r11.md) | R4 (retrospective nudge) + R11 (gate bypass tracking) |
| [tasks/task-03-spec-r2.md](tasks/task-03-spec-r2.md) | R2 (unified inline correction protocol — merges R2+R8) |
| [tasks/task-04-spec-r5-r6.md](tasks/task-04-spec-r5-r6.md) | R5 (retrospective scan) + R6 (prior run insights injection) |
| [tasks/task-05-spec-r5a-r7.md](tasks/task-05-spec-r5a-r7.md) | R5a (lessons applied section) + R7 (expected outcomes) |
| [tasks/task-06-spec-r10.md](tasks/task-06-spec-r10.md) | R10 (calibrate-scoring command) |
| [tasks/task-08-validation.md](tasks/task-08-validation.md) | Risk Analyst cross-validation report (2 BLOCKING issues found and resolved) |

## Implementation Summary

**Phase A (implement first):** R1, R2, R3, R4, R11 — fixes existing broken behaviors and starts building the data corpus.

**Phase B (after Phase A has data):** R5, R5a, R6, R7 — surfaces prior learnings at spawn time.

**Phase C (after 10+ Build retrospectives):** R10 — aggregate calibration analytics command.

**Dropped:** R9 (--patch flag) — state reconstruction post-shutdown is unsolvable in the markdown+hooks architecture. R8 merged into R2.

## Team Composition

| Role | Tasks |
|------|-------|
| Architect | Tasks 1, 2, 4, 9, 10 |
| Protocol Designer | Tasks 3, 5, 6 |
| Risk Analyst | Task 8 |
| Team Lead | Tasks 7 (user feedback gate) |
