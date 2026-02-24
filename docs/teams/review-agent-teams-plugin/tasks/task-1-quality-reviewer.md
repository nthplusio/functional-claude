---
task: 1
title: "Audit all shared protocol files for duplication and redundancy"
owner: quality-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 1: Shared Protocol Files Audit

## Summary

13 shared files totaling 2,118 lines. **Key finding: protocol blocks are duplicated across their source files AND embedded verbatim in spawn prompts.** The "Why This Exists" meta-commentary sections are the single largest source of redundancy — they're useful for human authors but waste tokens when files are read by the lead at spawn time.

---

## Duplication Map

### 1. Protocol Blocks Duplicated Within Their Own Files

Three files contain both the "why" rationale AND the actual protocol block. The block itself is what gets embedded in spawns — the rationale serves human editors only.

| File | Lines | Protocol Block | Rationale Section |
|---|---|---|---|
| `task-blocking-protocol.md` | 76 | 13 lines (the actual block) | 15 lines of "Why This Exists" |
| `shutdown-protocol.md` | 147 | 8 lines (the block) | 12 lines of "Why This Exists" |
| `output-standard.md` | 82 | 5 lines (the block) | 6 lines of "Why This Exists" |

**Finding:** The "Why This Exists" sections, "## Placement" sections, and "## When to Include" sections are consumed by human authors only, not by spawn-time logic. They add ~40 lines of non-spawned content per file.

### 2. Task Blocking Protocol — Full Block Duplicated in team-coordination SKILL.md

`shared/task-blocking-protocol.md` defines the canonical 13-bullet protocol block.

`skills/team-coordination/SKILL.md` lines 70–83 contains a **prose restatement** of the same rules (7 bullets, same content, different wording):
- "Check before starting" = "Before starting any task, call TaskList..."
- "Never start blocked tasks" = "NEVER begin work on a blocked task"
- "Go idle silently" = "do NOT send 'standing by' messages"
- etc.

**Wasted tokens:** ~200 tokens duplicating rules that already exist in the canonical block.

### 3. "Why This Exists" / Rationale Sections

Every shared file has a "Why This Exists" section. These sections explain the purpose to human editors but are never directly useful to the LLM reading them at spawn time.

| File | "Why This Exists" Lines |
|---|---|
| `task-blocking-protocol.md` | 9 lines |
| `shutdown-protocol.md` | 5 lines |
| `output-standard.md` | 4 lines |
| `base-agent.md` | (no Why section, but has redundant compaction section) |
| `discovery-interview.md` | 4 lines |
| `spawn-core.md` | (rationale columns in tables) |

Total: ~22 lines of "Why This Exists" content across protocol files.

### 4. Shutdown Instructions Duplicated Between base-agent.md and shutdown-protocol.md

`shared/base-agent.md` lines 99–111 contains a "Shutdown Compliance" section:
- Retrospective question instructions
- Shutdown request approval rules ("approve immediately unless mid-write")

`shared/shutdown-protocol.md` contains the canonical Protocol Block with the same rules.

`shared/task-blocking-protocol.md` also contains: "When you receive a shutdown_request, approve it immediately unless you are mid-write on a file"

**The shutdown approval rule appears in 3 different files.**

### 5. Artifact/Directory Structure Duplicated Between base-agent.md and team-coordination SKILL.md

`shared/base-agent.md` lines 42–56: Directory structure with code block showing `docs/teams/[TEAM-NAME]/` structure.

`skills/team-coordination/SKILL.md` lines 426–449: Identical directory structure with identical code block, plus frontmatter schemas.

**base-agent.md's artifact section is a subset of team-coordination's artifact section** — both exist, both are read by the lead.

### 6. Placement Guidance Sections

`task-blocking-protocol.md` has a "## Placement" section (14 lines) showing where to put protocol blocks in spawn prompts.
`shutdown-protocol.md` has an identical "## Placement" section (12 lines) showing the same structure.
Both show the same code fence template:
```
Create these tasks:
1. [Owner] Task description
...
[TASK BLOCKING PROTOCOL BLOCK HERE]
[OUTPUT STANDARDS BLOCK HERE]
[SHUTDOWN PROTOCOL BLOCK HERE]
```

**The ordering schema appears twice in separate files.**

### 7. Compaction Resilience Content

`shared/base-agent.md` lines 14–19: "Compaction Resilience" section explaining how to use task descriptions as durable state.

`shared/task-blocking-protocol.md` lines 31–33: The canonical protocol block already covers this ("Use TaskUpdate to record your approach before starting a task, then periodically update with progress notes... task descriptions survive compaction, conversation context does not").

**The compaction guidance is explained in base-agent.md AND embedded in the protocol block** — both get read by the lead, but only the block gets embedded in spawn prompts for teammates.

---

## Quantified Redundancy

| Category | Est. Duplicate Lines | Impact |
|---|---|---|
| Protocol block restatements in team-coordination | ~25 lines | Read by lead on every think spawn |
| "Why This Exists" / rationale sections | ~22 lines | Read by lead at spawn time but serve no spawn-time purpose |
| Shutdown approval rule (3 files) | ~6 lines of redundancy | Minor |
| Placement guidance (2 files with same template) | ~14 lines | Low frequency |
| base-agent artifact section (subset of team-coordination) | ~20 lines | Read by lead if base-agent referenced |
| Compaction resilience (base-agent + protocol block) | ~6 lines | Minor |

**Total estimated redundant lines in shared/: ~93 lines (~4.4% of 2,118 total)**

---

## Highest-Value Cuts

1. **Remove "## Blocked Task Behavior" from team-coordination SKILL.md** (lines 68–83): This is a prose restatement of task-blocking-protocol.md. Replace with: "See `shared/task-blocking-protocol.md` for canonical rules." Saves ~200 tokens every time the skill is read.

2. **Strip "Why This Exists" sections from protocol files** (or move to a comment/developer note): These sections serve plugin authors, not spawn-time logic. Consider moving to a separate `docs/plugin-dev-notes.md` or collapsing to a one-line comment.

3. **Remove duplicate Placement guidance from shutdown-protocol.md**: Since task-blocking-protocol.md already defines placement order, shutdown-protocol.md's ## Placement section is redundant.

4. **Collapse base-agent.md "Shutdown Compliance" section**: The rules are already in the protocol blocks. Base-agent could just say "Follow shutdown rules as defined in the protocol blocks embedded in your spawn prompt."

5. **Remove base-agent.md artifact section OR make it a cross-reference**: The team-coordination SKILL.md artifact section is more complete. base-agent.md should reference it rather than partially duplicate it.

---

## Non-Issues (Intentional Embedding)

The protocol blocks themselves are intentionally embedded verbatim in spawn prompts — this is by design, not duplication. The lead reads the source file and copies the block into the prompt text. This architecture is correct and should not be changed.
