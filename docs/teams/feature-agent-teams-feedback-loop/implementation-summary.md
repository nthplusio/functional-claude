---
team: feature-agent-teams-feedback-loop
date: 2026-02-22
type: feature
topic: Agent-teams feedback loop implementation (R1–R11)
status: completed
spec: docs/teams/plan-spec-agent-teams-feedback/spec.md
source: docs/teams/research-eval-agent-teams-loop/evaluation-report.md
plugin: agent-teams
plugin-version-before: 0.17.1
---

# Implementation Summary — Agent-Teams Feedback Loop

## What Was Built

10 recommendations from the agent-teams evaluation report (R1–R7, R10–R11) implemented across 11 plugin files. The changes close the feedback loop gap: prior run learnings are now captured, surfaced, and routed into future spawns.

## Files Modified

| File | Recommendations | Change Type |
|------|-----------------|-------------|
| `shared/spec-quality-scoring.md` | R1, R10 | Replace section + append reference |
| `shared/spawn-core.md` | R5 | Append Retrospective Scan block |
| `shared/discovery-interview.md` | R6, R7 | Add Prior Run Insights + Expected Outcomes Compilation |
| `shared/planning-blueprints.md` | R5a, R7 | Add Lessons Applied + Expected Outcomes to template |
| `shared/shutdown-protocol.md` | R2, R4 | Insert Phase 0 + extend Phase 4 + update Protocol Block |
| `shared/scenario-collection.md` | R2 | Add Correction Opportunities reference |
| `skills/evaluate-spawn/SKILL.md` | R3, R7, R11 | Add Q3 Score Accuracy, Q1a Outcomes Validation, Q4 Gate Bypass |
| `commands/spawn-build.md` | R5, R5a, R2/R4 embedded | Add scans + Lessons Applied + update Protocol Block |
| `commands/spawn-think.md` | R5, R7, R2/R4 embedded | Add scan + Expected Outcomes + update Protocol Block |
| `commands/spawn-create.md` | R5, R2/R4 embedded | Add scan + update Protocol Block |
| `commands/calibrate-scoring.md` | R10 | **New file** — full calibration command |

## Changes by Recommendation

### R1 — Fix Calibration Session Counter (Phase A)
`spec-quality-scoring.md` now counts actual retrospective files with non-"not scored" `spec-score:` values instead of displaying a static placeholder. N in "Calibration session N/10" is live data.

### R2 — Unified Inline Correction Protocol (Phase A)
`shutdown-protocol.md` has a new Phase 0: Scenario Invalidation Check. When Tester reports Invalidated/Partial scenarios, the Lead presents user with accept/fix/proceed options before AAR begins. `scenario-collection.md` references the Correction Opportunities table format.

### R3 — Move Score Accuracy to Immediate Question (Phase A)
`evaluate-spawn/SKILL.md` Build profile now asks score accuracy as Question 3 (immediate, at spawn completion) rather than a deferred checkbox. Answer written to `score-accuracy:` frontmatter field for R10 aggregation.

### R4 — Retrospective Nudge at Session End (Phase A)
`shutdown-protocol.md` Phase 4 now checks for missing evaluate-spawn retrospective before TeamDelete and prompts user to run `/evaluate-spawn` (optional). Increases retrospective completion rate over time.

### R5 — Retrospective Scan with Cold-Start Guard (Phase B)
`spawn-core.md` has a new Retrospective Scan block. Each spawn command runs it during Project Analysis, filtered by profile/type. Cold-start guard: fewer than 3 matching retrospectives → skip with message. Prevents noise until data volume is sufficient.

### R5a — Lessons Applied Section in Spawn Templates (Phase B)
Planning blueprints and spawn-build Feature Context now have a `### Lessons Applied` section that the Retrospective Scan populates with plugin-scope improvements from prior AAR files.

### R6 — Inject Prior Run Insights into Context Block (Phase B)
`discovery-interview.md` Output Compilation template now includes `### Prior Run Insights` after `### Project Analysis`. Hard limit: 3 bullets, 100 words. Omitted entirely if cold-start guard fired.

### R7 — Expected Outcomes for Research and Planning Spawns (Phase B)
`discovery-interview.md` has a new Expected Outcomes Compilation section (Research and Planning modes only). `spawn-think.md` Research Context block expanded to structured format. `planning-blueprints.md` has `### Expected Outcomes` after `### Lessons Applied`. `evaluate-spawn/SKILL.md` Think profile has conditional Question 1a to validate outcomes at completion.

### R10 — `/calibrate-scoring` Command (Phase C)
New command at `commands/calibrate-scoring.md`. Reads Build profile retrospectives, aggregates `score-accuracy` and `gate-bypassed`/`bypass-verdict` data, runs 5-condition decision tree, and recommends threshold adjustment. Read-only. Blocked by data volume (10+ retrospectives with R3 data).

### R11 — Gate Bypass Tracking (Phase A)
`evaluate-spawn/SKILL.md` all three profiles now track gate bypass. Build profile: Q4 (conditional — only asks when score was below threshold). Think and Create profiles: Q3 (unconditional). Results written to `gate-bypassed:` and `bypass-verdict:` frontmatter.

## WARN Fix Applied

Validation identified stale embedded Shutdown Protocol blocks in command files (4-bullet instead of 6-bullet). Fixed in task 13:
- `spawn-build.md` (2 instances)
- `spawn-think.md` (all templates)
- `spawn-create.md` (all templates)

All embedded Protocol Blocks now match the authoritative 6-bullet version in `shared/shutdown-protocol.md`.

## docs/memory.md Updated

Added `/calibrate-scoring` command to agent-teams Commands table and directory structure listing per CLAUDE.md version sync requirements.

## Implementation Phases Completed

| Phase | Recs | Status |
|-------|------|--------|
| A — Foundation | R1, R2, R3, R4, R11 | Complete |
| B — Retrospective Surfacing | R5, R5a, R6, R7 | Complete |
| C — Calibration Analytics | R10 | Spec implemented; data threshold pending |

## What This Enables

- Every spawn now has a retrospective scan that surfaces prior learnings (once 3+ retrospectives exist)
- Score accuracy is captured immediately at spawn completion instead of being deferred indefinitely
- Gate bypasses are tracked — pattern data accumulates for R10 calibration
- Expected Outcomes for research/planning spawns freeze the definition of done before work begins
- Scenario invalidation is handled with a structured correction loop, not silently accepted
- `/calibrate-scoring` will recommend threshold adjustments once 10+ Build retrospectives accumulate
