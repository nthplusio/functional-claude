---
task: 10
title: "Add effort budget hints to all spawn prompt task descriptions"
owner: command-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 10: Effort Budget Hints — All Spawn Commands + Planning Blueprints

## Result

Effort budget hints added to all 10 files: 3 spawn commands + 7 planning blueprints.

## Changes Applied

### Format

Added `(~N-M tool calls)` after owner tag in each task line:
```
3. [Backend] (~20-40 tool calls) Implement API endpoints and services (blocked by task 2)
```

Added team-level budget note before `Create these tasks:`:
```
Effort budgets: implementation tasks ~20-40 tool calls, testing tasks ~15-25 tool calls, coordination tasks ~5-10 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.
```

### Budget Ranges Applied

| File / Template | Budget Applied |
|---|---|
| spawn-build: feature mode | Backend/Frontend ~20-40, Tester unit ~15-25, Tester integration/reconcile ~10-20, Lead ~5-10 |
| spawn-build: debug mode | Investigators ~10-20, Lead/coordination ~3-10 |
| spawn-think: research-eval | Explorer ~15-25, Analyst ~10-20, Critic ~10-20, coordination ~3-5 |
| spawn-think: review | Security/Performance ~15-25, Quality ~10-20, deep-dives ~15-25, coordination ~3-10 |
| spawn-create: design | Frontend Dev impl ~20-35, Designer/User Advocate ~10-20, Product Owner ~5-10 |
| spawn-create: brainstorm | Ideation ~5-10, analysis/convergence ~10-15, coordination ~3-5 |
| spawn-create: productivity | Auditor/Architect/Analyst ~10-20, Refiner ~15-25, Compounder ~5-10 |
| planning-blueprints/roadmap.md | All tasks ~5-10 |
| planning-blueprints/spec.md | Analysis tasks ~8-15, writing ~5-10 |
| planning-blueprints/adr.md | Research/analysis ~8-12 |
| planning-blueprints/migration.md | System analysis ~10-20, planning/risk ~10-15 |
| planning-blueprints/bizcase.md | Research/analysis/writing ~5-10 |
| planning-blueprints/gtm.md | All tasks ~5-10 |
| planning-blueprints/okr.md | All tasks ~5-10 |

## Files Modified

- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-build.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-think.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-create.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/roadmap.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/spec.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/adr.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/migration.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/bizcase.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/gtm.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/shared/planning-blueprints/okr.md`
