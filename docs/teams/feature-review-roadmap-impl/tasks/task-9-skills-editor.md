---
task: 9
title: "team-blueprints thin router: remove spawn prompts + Configuration Tips + artifact table"
owner: skills-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 9: team-blueprints SKILL.md Thin Router

## Result

**807 → 390 lines** (-417 lines, ~52% reduction)

## Changes Made

### Pattern applied to all 8 blueprints

For each blueprint:
- Removed "Representative Spawn Prompt" section (28–70 lines each, ~250 lines total)
- Removed "Configuration Tips" section (~6-9 bullets each, ~50 lines total)
- Removed "Advanced features" line (duplicated command capabilities)
- Added `**Command:**` line with key mechanisms inline
- Simplified team composition tables to remove redundant "Focus" columns where possible
- Added concise `**Pipeline:**` and `**Key mechanism:**` lines where unique

### Removed: "Task Blocking Protocol" section (lines 633–638, ~8 lines)

This section only pointed to the shared file. The commands already reference it via reference directives.

### Replaced: Artifact mapping table (~19 lines → 1 line)

Replaced the full 16-row table with a cross-reference to `team-coordination` skill → Artifact Output Protocol → Artifact Mapping by Team Type (which is the authoritative copy).

## Per-Blueprint Summary

| Blueprint | Before | After | Savings |
|-----------|--------|-------|---------|
| 1 Research | ~57 lines | ~18 lines | ~39 |
| 2 Feature | ~56 lines | ~15 lines | ~41 |
| 3 Review | ~72 lines | ~20 lines | ~52 |
| 4 Debug | ~62 lines | ~12 lines | ~50 |
| 5 Design | ~80 lines | ~18 lines | ~62 |
| 6 Planning | ~70 lines | ~20 lines | ~50 |
| 7 Productivity | ~80 lines | ~16 lines | ~64 |
| 8 Brainstorm | ~50 lines | ~16 lines | ~34 |

## Files Modified

- `/home/scoussens/Source/functional-claude/plugins/agent-teams/skills/team-blueprints/SKILL.md`
