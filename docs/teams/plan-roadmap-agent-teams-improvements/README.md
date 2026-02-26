# Team: plan-roadmap-agent-teams-improvements

## Metadata

| Field | Value |
|---|---|
| Type | planning |
| Mode | roadmap |
| Topic | agent-teams plugin improvements v0.16.0–v0.18.0 |
| Date | 2026-02-21 |
| Status | completed |
| Primary Artifact | [roadmap.md](roadmap.md) |

## Primary Deliverable

**[roadmap.md](roadmap.md)** — Complete implementation roadmap with phase briefs directly usable as `/spawn-build --mode feature` input. Three phases, 8 improvements, v0.16.0–v0.18.0.

## Team Tasks

| Task | Owner | Output |
|---|---|---|
| #1 Strategic objectives | strategist | [task-1-strategic-objectives.md](tasks/task-1-strategic-objectives.md) |
| #2 Stakeholder needs | stakeholder-advocate | [task-2-stakeholder-needs.md](tasks/task-2-stakeholder-needs.md) |
| #3 Dependency map | strategist | [task-3-dependency-map.md](tasks/task-3-dependency-map.md) |
| #4 Implementation phases | stakeholder-advocate | [task-4-implementation-phases.md](tasks/task-4-implementation-phases.md) |
| #5 User feedback gate | stakeholder-advocate | — (gate; no file output) |
| #6 Phase sequencing | strategist | [task-6-phase-sequencing.md](tasks/task-6-phase-sequencing.md) |
| #7 Success criteria | outcomes-analyst | [task-7-success-criteria.md](tasks/task-7-success-criteria.md) |
| #8 Feasibility review | outcomes-analyst | [task-8-feasibility-review.md](tasks/task-8-feasibility-review.md) |
| #9 Refined outcomes | outcomes-analyst | [task-9-refined-outcomes.md](tasks/task-9-refined-outcomes.md) |
| #10 Cross-review | outcomes-analyst | [task-10-cross-review.md](tasks/task-10-cross-review.md) |
| #11 Roadmap compilation | outcomes-analyst | [roadmap.md](roadmap.md) |

## Key Decisions

- **Phase 1 internal order:** Refinement → Scoring → Scenarios (user-confirmed at gate)
- **Post-Spawn Evaluation:** Phase 2 as `/evaluate-spawn` skill (not Stop hook; not Phase 1)
- **Scoring threshold:** 50 default (calibration mode); configurable via `--min-score N`
- **ADR output:** Opt-out (`--skip-adr`), not opt-in — on by default for all feature spawns
- **Mock Repository:** Scoped to directory convention + Tester prompt change only
- **Breaking changes:** OK across all phases
