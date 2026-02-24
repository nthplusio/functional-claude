---
task: 13
title: "Inline verbosity templates + naming rules from spawn-core into each command"
owner: command-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 13: Inline Verbosity + Naming Rules

## Result

All 3 spawn commands are now self-contained: verbosity templates and team name slug rules are inlined directly.

## Changes Applied

### 1. Team Name Slug Rules — Added to Spawn Step

Added after each `### Step 9/10: Spawn the Team` heading:
- slug format: `[command-prefix]-[mode-slug]-[topic-slug]`
- slug rules: lowercase, hyphen-separated, max 30 chars, strip "the/a/an/for/with/and", first 3-4 meaningful words
- mode-to-prefix table specific to each command

### 2. Verbosity Templates — Inlined into Output Step

Replaced `Follow the verbosity templates from ${CLAUDE_PLUGIN_ROOT}/shared/spawn-shared.md` with full inline content in each command's Step 10/11 Output section. Templates include:
- quiet mode: 1-line output
- normal mode (default): team summary, phases, shortcuts, pipeline, artifacts
- verbose mode: everything in normal + tasks, dependencies, models, token budget

### 3. spawn-core.md References

No `spawn-core.md` references remain in command files (structural-editor already updated to `spawn-shared.md` in task 12). No further changes needed.

## Files Modified

- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-build.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-think.md`
- `/home/scoussens/Source/functional-claude/plugins/agent-teams/commands/spawn-create.md`
