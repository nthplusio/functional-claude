---
task: 2
title: "Audit spawn commands and skills for instruction duplication with shared files"
owner: quality-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 2: Spawn Commands & Skills Duplication Audit

## Summary

The spawn commands and skills show 3 major categories of duplication: (1) team blueprint spawns repeated across team-blueprints SKILL.md AND the spawn commands, (2) coordination patterns duplicated between team-coordination SKILL.md and shared/ files, (3) the planning blueprint spawn prompts exist in BOTH planning-blueprints.md AND are re-documented in team-blueprints SKILL.md. The biggest offender is team-blueprints SKILL.md (807 lines) — it contains extensive blueprint documentation that substantially overlaps with what lives in the spawn commands and shared/ files.

---

## Category 1: Blueprint Documentation Duplication (team-blueprints vs spawn commands)

### Spawn Prompt Bodies Appear in Both Places

The Product Roadmap spawn prompt body appears:
- `shared/planning-blueprints.md` lines 47–103: Full spawn prompt with all 12 tasks
- `skills/team-blueprints/SKILL.md` lines 396–437: Near-identical spawn prompt (abbreviated task list, same team composition)

The Feature Development spawn prompt appears:
- `commands/spawn-build.md` lines 127–209: Full spawn prompt with all 12 tasks
- `skills/team-blueprints/SKILL.md` lines 110–134: Abbreviated version with same structure

The Design team spawn prompt appears:
- `commands/spawn-create.md` lines 155–201: Full spawn prompt
- `skills/team-blueprints/SKILL.md` lines 314–357: Near-identical abbreviated version

The Review team spawn prompt appears:
- `commands/spawn-think.md` lines 269–311: Full spawn prompt
- `skills/team-blueprints/SKILL.md` lines 175–208: Abbreviated version

The Debug team spawn prompt appears:
- `commands/spawn-build.md` lines 234–267: Full spawn prompt
- `skills/team-blueprints/SKILL.md` lines 242–283: Near-identical version

The Brainstorming team spawn prompt appears:
- `commands/spawn-create.md` lines 210–260: Full spawn prompt
- `skills/team-blueprints/SKILL.md` lines 583–618: Near-identical version

The Productivity team spawn prompt appears:
- `commands/spawn-create.md` lines 268–330: Full spawn prompt
- `skills/team-blueprints/SKILL.md` lines 484–546: Near-identical version

**Finding:** team-blueprints SKILL.md contains "representative spawn prompts" for all 8 blueprints — the same spawn prompts that exist in the actual commands. This means **every blueprint exists in at least 2 places**.

### Team Composition Tables Duplicated

| Content | team-blueprints SKILL.md | spawn-think.md | spawn-build.md | spawn-create.md |
|---|---|---|---|---|
| Review team roles | Lines 163–170 | Lines 14–17 (table) | — | — |
| Feature team roles | Lines 100–106 | — | Lines 14–17 | — |
| Design team roles | Lines 305–310 | — | — | Lines 14–17 |
| Brainstorming team roles | Lines 572–579 | — | — | Lines 14–17 |
| Planning mode table (7 modes) | Lines 380–389 | Lines 59–67 | — | — |
| Research mode table | Lines 41–47 | Lines 50–55 | — | — |

### Configuration Tips Sections

Every blueprint in team-blueprints SKILL.md ends with a "Configuration Tips" section (6–8 bullets per blueprint × 8 blueprints ≈ 50 bullets). These tips overlap heavily with the spawn command instructions:

- "Include the Task Blocking Protocol" appears in all 8 Configuration Tips sections → the commands already handle this via reference directives
- "Mode is auto-inferred from keywords" appears in ~5 Configuration Tips sections → already documented in each command's "Mode Selection" step
- "Use Sonnet for all teammates" appears in ~4 sections → already in spawn prompt text

### "Choosing the Right Blueprint" / Decision Tree

`skills/team-blueprints/SKILL.md` lines 782–808: Decision tree + pipeline composition table.
This information does not appear in the commands (commands assume you've already chosen), but it's useful for users invoking the skill directly. **This section is UNIQUE to team-blueprints** — not a duplication.

### "Design Patterns" Section

`skills/team-blueprints/SKILL.md` lines 639–760: Four design patterns (Adaptive Mode, Cross-Team Pipeline, Discovery Interview, User Feedback Gate, Artifact Output).

`skills/team-coordination/SKILL.md` contains full implementation guidance for:
- Discovery Interview Pattern (lines 274–343)
- User Feedback Gate Pattern (lines 349–415)
- Artifact Output Protocol (lines 416–543)

The team-blueprints pattern section summarizes each pattern in ~5–8 lines and references team-coordination for detail. This is **appropriate cross-referencing**, not duplication.

The Cross-Team Pipeline diagram (lines 664–699) is unique to team-blueprints.

---

## Category 2: team-coordination SKILL.md vs shared/ Files

### Task Blocking Protocol — Full Restatement

`skills/team-coordination/SKILL.md` lines 66–83: "Blocked Task Behavior" section lists 7 protocol rules.

These are a prose restatement of `shared/task-blocking-protocol.md`'s canonical 13-bullet block. The coordination skill then says "include it verbatim" — but has already restated the rules above.

**Wasted tokens:** ~200 tokens of redundant instruction every time team-coordination is loaded (typically when a user asks "how do I manage my team?").

### Shutdown Rules — Prose vs Protocol Block

`skills/team-coordination/SKILL.md` lines 242–260: "Shutdown" section with teammate and lead rules.

`shared/shutdown-protocol.md` Protocol Block: Same rules in condensed form.

The coordination skill goes further with "send all shutdown_requests in one batch, not one-by-one" and "Re-request after 30s" — these details are NOT in the shared protocol block. So some content here is additive, but the overlap is substantial (~60%).

### Artifact Mapping Table Duplicated

`skills/team-coordination/SKILL.md` lines 515–535: Full artifact mapping table (15 team types).
`skills/team-blueprints/SKILL.md` lines 739–758: Identical artifact mapping table (same 15 rows, same columns).

**This is the clearest case of exact duplication** — two copies of the same 20-line table in two skills files.

### Frontmatter Schemas Duplicated

`skills/team-coordination/SKILL.md` lines 453–493: Three YAML frontmatter schemas (Team README, Primary Deliverable, Task Output).
`shared/base-agent.md` lines 59–77: Two frontmatter schemas (Primary deliverable, Task output) — a subset.

The base-agent version is a subset (no Team README schema). The coordination skill has the complete set.

### Directory Structure Code Block Duplicated

`skills/team-coordination/SKILL.md` lines 428–445: Directory tree code block for `docs/teams/`.
`shared/base-agent.md` lines 46–55: Nearly identical directory tree code block.

---

## Category 3: planning-blueprints.md vs team-blueprints SKILL.md vs spawn-think.md

The planning blueprint content has **three copies** in the file system:

1. `shared/planning-blueprints.md` (519 lines): Full spawn prompts for all 7 planning submodes
2. `skills/team-blueprints/SKILL.md` lines 372–461: Planning blueprint summary with one representative spawn prompt + task structure overview
3. `commands/spawn-think.md` lines 243–263: References planning-blueprints.md for full content, provides abbreviated task flow

The spawn-think.md correctly delegates to planning-blueprints.md for the full content. The team-blueprints SKILL.md's treatment of planning is the odd one out — it contains a representative spawn prompt (Product Roadmap, ~40 lines) that duplicates planning-blueprints.md content.

---

## Quantified Duplication by File

| File | Total Lines | Estimated Duplicate Lines | % Duplicated | Primary Source of Duplication |
|---|---|---|---|---|
| team-blueprints SKILL.md | 807 | ~280 | ~35% | Spawn prompt bodies in commands + planning-blueprints.md; team composition tables; Configuration Tips |
| team-coordination SKILL.md | 604 | ~90 | ~15% | task-blocking-protocol.md restatement; artifact mapping table duplicate; base-agent subset duplication |
| spawn-think.md | 322 | ~40 | ~12% | planning-blueprints.md reference (but has Research spawn prompts inline); review spawn inline duplicates team-blueprints |
| spawn-build.md | 297 | ~20 | ~7% | team-blueprints partially duplicates feature/debug spawns |
| spawn-create.md | 344 | ~20 | ~6% | team-blueprints partially duplicates design/brainstorm/productivity spawns |
| planning-blueprints.md | 519 | ~20 | ~4% | Representative spawn in team-blueprints SKILL.md |

---

## Highest-Value Cuts

### 1. team-blueprints SKILL.md: Remove "Representative Spawn Prompts" (~200 lines)

The representative spawn prompts in team-blueprints are redundant with the actual commands. The skill could instead reference the commands:
- "For the full spawn prompt, see `commands/spawn-build.md` Feature Mode"
- "For the full spawn prompt, see `commands/spawn-create.md` Brainstorming Mode"

This alone could trim team-blueprints from 807 → ~600 lines.

### 2. team-blueprints SKILL.md: Remove "Configuration Tips" sections (~50 lines)

Configuration Tips mostly restate content from the commands. The tips worth keeping (e.g., "the adversarial structure is the key mechanism for Debug") could be moved into the command itself.

### 3. Remove artifact mapping table from team-blueprints SKILL.md (~20 lines)

It's already in team-coordination. Cross-reference instead.

### 4. Remove "Blocked Task Behavior" prose from team-coordination SKILL.md (~18 lines)

Replace with: "See `shared/task-blocking-protocol.md` for canonical rules — include verbatim in every spawn prompt."

### 5. Remove base-agent.md directory/frontmatter sections (~30 lines)

These are subsets of team-coordination's artifact section. base-agent.md could reference team-coordination for the complete schema.

### 6. team-blueprints SKILL.md: Keep unique content only (~300 lines of unique value)

Unique content that should be preserved:
- "Choosing the Right Blueprint" decision tree
- Cross-Team Pipeline diagram
- Blueprint metadata (When to Use, Why teams work here)
- Mode tables and composition descriptions (not the spawn prompts themselves)
- Design Patterns summaries (which reference team-coordination for details)
- Efficiency Guidelines

---

## Token Impact Analysis

The spawn commands are read for every team creation. team-blueprints and team-coordination are read when users ask the skill. The duplication in skills costs tokens per invocation.

**Worst case:** A user invokes `/spawn-think --mode planning` which causes the lead to read:
- `spawn-think.md` (322 lines, references planning-blueprints.md)
- `planning-blueprints.md` (519 lines, for the full mode-specific prompt)
- `shared/task-blocking-protocol.md` (76 lines)
- `shared/output-standard.md` (82 lines)
- `shared/shutdown-protocol.md` (147 lines)

The skill files (team-blueprints, team-coordination) are NOT read during spawning — they're read when a user explicitly invokes the skill. So duplication between skills and commands primarily affects human users of the skills, not spawn-time token cost.

**Primary spawn-time savings target:** Reduce planning-blueprints.md (519 lines) by removing repeated structural patterns across the 7 modes.
