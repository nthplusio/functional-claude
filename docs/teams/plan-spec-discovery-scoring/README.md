# Team: plan-spec-discovery-scoring

| Field | Value |
|-------|-------|
| **Type** | planning / spec |
| **Topic** | Dynamic discovery interview + formal scoring enforcement |
| **Date** | 2026-02-21 |
| **Status** | completed |
| **Plugin target** | agent-teams v0.18.0 |
| **Issues** | #8 (dynamic discovery), #16 (scoring enforcement) |

## Primary Artifact

[spec.md](spec.md) — Full implementation spec for v0.18.0 changes

## Team Composition

| Role | Responsibilities |
|------|----------------|
| **team-lead** | Coordination, feedback gate, final decisions |
| **architect** | Protocol design, detailed spec, final compilation |
| **risk-analyst** | Risk identification, validation of architect's spec |

## Task Summary

| # | Task | Owner | Output |
|---|------|-------|--------|
| 1 | Analyze discovery-interview.md, design dynamic protocol | architect | [task-01-dynamic-discovery-design.md](tasks/task-01-dynamic-discovery-design.md) |
| 2 | Design formal scoring enforcement | architect | [task-02-scoring-enforcement-design.md](tasks/task-02-scoring-enforcement-design.md) |
| 3 | Identify risks and failure modes | risk-analyst | [task-03-risks.md](tasks/task-03-risks.md) |
| 4 | USER FEEDBACK GATE | team-lead | (binding decisions captured in task description) |
| 5 | Write detailed replacement spec | architect | [architect-detailed-spec.md](tasks/architect-detailed-spec.md) |
| 6 | Validate detailed spec against risks | risk-analyst | [risk-analyst-validation.md](tasks/risk-analyst-validation.md) |
| 7 | Cross-review and compile final spec | architect | [spec.md](spec.md) |

## Key Decisions

1. **3 core baseline questions preserved** — same phrasing, now always-asked with pre-answer skip
2. **Dynamic layer replaces keyword triggering** — ambiguity detection on 6 spec dimensions + feature-characteristic heuristics (7 patterns)
3. **spec-refinement.md folded** — edge-case probing moved into discovery Layer 2/3; file kept for evaluate-spawn/manifest references
4. **Batch cap** — 2 batches default; conditional 3rd if ≥3 dimensions missing after Batch 2; hard cap 12
5. **Goal warning, not block** — Goal ✗ surfaces `⚠` warning but does not require "proceed" to continue
6. **Deduplication contract** — spawn commands pass topic labels; dynamic questions suppress covered topics
7. **Scoring mandatory in dispatch** — added as step 4 in spawn-core.md; sizing blocked until score displayed
8. **Verbatim format enforced** — "78/100" explicitly prohibited; non-compliant format list in Enforcement Contract

## Files Changed by This Spec

| File | Change |
|------|--------|
| `shared/discovery-interview.md` | Major rewrite (3-layer protocol) |
| `shared/spawn-core.md` | Add scoring step 4 + Scoring Invariant section |
| `shared/spec-quality-scoring.md` | Fix 5→6; add Enforcement Contract |
| `shared/spec-refinement.md` | Add deprecation note at top |
| `commands/spawn-build.md` | Replace scoring step; add dedup topic labels |
| `commands/spawn-think.md` | Replace scoring step; add dedup topic labels |
| `commands/spawn-create.md` | Replace scoring step; add dedup topic labels |
