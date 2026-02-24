---
task: 4
title: "Move [Include ...] before task list + add behavioral summary in all 3 spawn commands"
owner: command-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 4: Protocol Placement + Behavioral Summary — All 3 Spawn Commands

## Result

Both changes applied to all 3 command files across all spawn templates.

## Change 1: Behavioral Summary Added (top of each spawn template)

Added `## Behavioral Rules (read first)` section immediately after the team intro line, before role descriptions. Applied to all 7 full spawn templates:

| File | Templates |
|------|-----------|
| spawn-build.md | feature mode, debug mode |
| spawn-think.md | research-eval, review |
| spawn-create.md | design, brainstorm, productivity |

Note: landscape/risk/planning in spawn-think.md are abbreviated stubs referencing same protocol — no full template to modify.

## Change 2: [Include ...] Moved Before Task List

Moved `[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol ...]` from after task list to before `Create these tasks:`. Applied to all 7 full templates.

Pattern applied: Context section → [Include ...] → Create these tasks:

## Files Modified

- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-build.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-think.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-create.md`
