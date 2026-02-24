---
task: 8
title: Create CLAUDE.md with universal rules
owner: structural-editor
status: completed
---

# Task 8: Create CLAUDE.md (R6)

## Result

CLAUDE.md created with full universal rules. All spawn command embed directives updated.

## Files Created

- `plugins/agent-teams/CLAUDE.md` — 44 lines, 3 sections

## Files Modified

Embed directive updated in 3 spawn commands (all occurrences, replace_all):
- `plugins/agent-teams/commands/spawn-build.md` — 2 occurrences
- `plugins/agent-teams/commands/spawn-think.md` — 2 occurrences
- `plugins/agent-teams/commands/spawn-create.md` — 3 occurrences

Also updated 7 planning-blueprints mode files (created in task 3 with old directive).

## CLAUDE.md Content Summary

Three sections, verbatim from task-9 §P2:
- **Task Blocking Protocol** — 11 bullets (universal idle, blocking, shutdown, compaction recovery)
- **Escalation Protocol** — 4 bullets (infrastructure blocker escalation path)
- **Output Standards** — 4 universal lines (concise, conclusions-first, no filler, artifact path)

## What Was Removed from Embeds

**Old:** `[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]`

**New:** `[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]`

Removed from embed: Task Blocking Protocol (11 bullets), Escalation Protocol (4 bullets), 4 universal Output Standards lines.

Kept in embed: "Never restate [CONTEXT-TYPE] Context" line (mode-specific), full Shutdown Protocol (lead-specific).

## Token Savings

~265 tokens removed per spawn prompt. Compounding across all spawns.

## Notes

- `team-coordination/SKILL.md` and `agents/team-architect.md` still reference old directive — not spawn prompts, out of scope for this task
- The 4 universal Output Standards lines remain in `shared/output-standard.md` as reference; the mode-specific "Never restate" line is still embedded per spawn
