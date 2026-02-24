---
task: 9
title: "Deep-dive on structural improvements with file reorganization proposals"
owner: architecture-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Structural Improvement Deep-Dive

Three concrete proposals with exact file changes. Breaking changes are acceptable.

---

## Proposal 1: Split planning-blueprints.md into 7 mode files

### Problem

`shared/planning-blueprints.md` (519 lines) is read in full on every `/spawn-think --mode planning` invocation. Only 1 of 7 modes is used. ~440 lines are wasted per spawn (85%).

### New directory structure

```
shared/
  planning-blueprints/
    _context-template.md     (~38 lines) — shared Planning Context Template
    roadmap.md               (~62 lines) — Mode 1: Product Roadmap spawn prompt
    spec.md                  (~66 lines) — Mode 2: Technical Spec spawn prompt
    adr.md                   (~58 lines) — Mode 3: Architecture Decision spawn prompt
    migration.md             (~63 lines) — Mode 4: Migration Strategy spawn prompt
    bizcase.md               (~63 lines) — Mode 5: Business Case spawn prompt
    gtm.md                   (~61 lines) — Mode 6: Go-to-Market spawn prompt
    okr.md                   (~62 lines) — Mode 7: OKR/Goals spawn prompt
```

**What goes in `_context-template.md`:**

The Planning Context Template block (lines 1–38 of current planning-blueprints.md) — the shared `## Planning Context` section structure used by all 7 modes. Each mode file includes a `[Include Planning Context Template from shared/planning-blueprints/_context-template.md]` directive at the top of its spawn prompt, so the lead reads it once when constructing the specific mode's prompt.

**What goes in each mode file:**

Each file contains only:
1. A one-line header: `# Planning Blueprint: [Mode Name]`
2. Team and team name line
3. The spawn prompt code block (team composition + tasks)
4. The artifact/pipeline line

Example `shared/planning-blueprints/spec.md`:

```markdown
# Planning Blueprint: Technical Spec

**Team:** Architect, API Designer, Risk Analyst
**Team name:** `plan-spec-[project-slug]`

[The existing Mode 2 spawn prompt code block verbatim]

**Artifact:** `spec.md` → feeds into `/spawn-build --mode feature`
```

### Required change to spawn-think.md

**Current** (line 247):
```
For the full team composition, Planning Context template, task lists, and spawn prompts for each of the 7 planning submodes, read the planning blueprints at `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints.md`.
```

**Replace with:**
```
For the selected planning submode, read the mode-specific blueprint:

| Submode | Blueprint file |
|---------|---------------|
| roadmap | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/roadmap.md` |
| spec | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/spec.md` |
| adr | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/adr.md` |
| migration | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/migration.md` |
| bizcase | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/bizcase.md` |
| gtm | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/gtm.md` |
| okr | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/okr.md` |

The Planning Context Template is in `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md` — embed it in the Planning Context section of the spawn prompt.
```

### Token savings

| Scenario | Before | After | Saved |
|----------|--------|-------|-------|
| `/spawn-think --mode planning --mode spec` | 519 lines read | ~104 lines read (_context-template + spec.md) | ~415 lines (~80%) |
| Any single planning submode | 519 lines | ~104 lines | ~415 lines |

No changes needed to `planning-blueprints/` content — this is a pure structural split with a one-line reference change in spawn-think.md.

---

## Proposal 2: CLAUDE.md auto-loading for universal teammate rules

### Problem

Every spawn prompt embeds ~420 tokens of protocol blocks (Task Blocking + Output Standards + Shutdown) that are **identical across all team types**. These are currently included via `[Include X from shared/Y.md]` embed directives — the lead reads and copies them into every spawn prompt.

Claude Code automatically loads `CLAUDE.md` files into every agent's context at startup. A `CLAUDE.md` placed at the plugin level would be loaded by all teammates without requiring explicit inclusion in spawn prompts.

### What qualifies as "truly universal"

A rule is universal if it applies regardless of team type (feature, debug, research, review, design, brainstorm, productivity) and regardless of teammate role. Rules that have **per-mode variants** (e.g., the "Never restate [CONTEXT-TYPE] Context" line in output-standard.md) are NOT universal.

**Universal rules (safe to move to CLAUDE.md):**

From `task-blocking-protocol.md` Protocol Block — ALL 11 bullets are universal:
- TaskList check before starting
- Never start blocked tasks
- Go idle silently
- Check TaskList after completing
- Parallelize unblocked tasks
- Read upstream outputs first
- Treat USER FEEDBACK GATE decisions as binding
- Approve shutdown_request immediately (unless mid-write)
- TaskUpdate with approach before starting
- TaskUpdate with structured status on long tasks
- Post-compaction recovery: TaskList → TaskGet → resume

From `task-blocking-protocol.md` Escalation Protocol Block — all 4 bullets are universal.

From `output-standard.md` Protocol Block — 4 of 5 lines are universal:
- Be concise: bullet points, tables, short paragraphs
- Lead with conclusions
- Every sentence adds new information
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` (≤500 lines)

NOT universal (excluded from CLAUDE.md):
- "Never restate the [CONTEXT-TYPE] Context" — has per-mode and debug-mode variants
- "Schemas appear ONCE" — only for Spec and Research modes

From `shutdown-protocol.md` Protocol Block — the LEAD-specific rules (not teammates). The shutdown block targets the lead, not all teammates. However, the one universal rule for all teammates is already in task-blocking-protocol.md ("approve shutdown_request immediately"). So the full Shutdown Protocol block stays in spawn prompts for the lead only.

### Proposed CLAUDE.md content

Create `plugins/agent-teams/CLAUDE.md`:

```markdown
# Agent Teams Plugin — Universal Teammate Behaviors

These rules apply to ALL teammates in ALL agent teams. They are loaded automatically
at startup and do not need to be embedded in spawn prompts.

## Task Blocking Protocol

**ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- If you have multiple unblocked tasks assigned to you, work them in parallel rather than sequentially — launch concurrent work streams where the tasks don't share output files
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) — task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes

## Escalation Protocol

**ALL teammates MUST follow:**
- If you encounter an infrastructure or tooling blocker (migration failures, build failures,
  environment issues, dependency conflicts, CI/CD errors), DO NOT silently work around it
- Instead, message the lead with: (1) what failed, (2) the error message, (3) your proposed
  workaround and its trade-offs
- The lead will either approve the workaround or escalate to the user
- Code-level problems (logic bugs, test failures, API design questions) are yours to solve —
  only escalate infrastructure issues where workarounds create hidden technical debt

## Output Standards

**ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` — keep each under 500 lines. Filename is specified in your task description.
```

### What gets REMOVED from spawn prompts after adding CLAUDE.md

Every spawn prompt currently ends with:
```
[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

After adding CLAUDE.md, this line reduces to:
```
[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

Specifically:
- **Remove** from embed: Task Blocking Protocol block (11 bullets + ~420 chars)
- **Remove** from embed: Escalation Protocol block (4 bullets + ~310 chars)
- **Remove** from embed: 4 universal Output Standards lines
- **Keep** in embed: "Never restate [CONTEXT-TYPE] Context" line (mode-specific)
- **Keep** in embed: Full Shutdown Protocol block (lead-specific, not covered by CLAUDE.md)
- **Keep** in embed: Debug team Output Standards variant (where the "never restate" line is omitted)
- **Keep** in embed: Single-source-of-truth variation for Planning/Research modes

### Token savings per spawn

The Task Blocking + Escalation Protocol blocks together are ~750 characters / ~190 tokens. The 4 universal Output Standards lines are ~300 characters / ~75 tokens.

**Per spawn prompt:** ~265 tokens removed from every team spawn.

**Across all 3 commands × ~2 modes average each:** ~265 tokens × N spawns = compounding savings.

**Critical caveat:** This only works if the plugin's CLAUDE.md is actually loaded by teammates. The mechanism requires:
1. Claude Code's plugin CLAUDE.md auto-loading must apply to spawned teammates (not just the lead session). This needs verification against the platform spec.
2. If teammates do NOT load plugin CLAUDE.md, this proposal has zero benefit and reverts to the current pattern.

**Fallback if CLAUDE.md loading is unverified:** Keep the embed approach but consolidate the 3 shared protocol files into a single `shared/teammate-protocols.md` with a single embed directive: `[Include Teammate Protocols from shared/teammate-protocols.md]`. This doesn't save tokens but reduces embed directives from 3 to 1 and eliminates the risk of one protocol being forgotten.

---

## Proposal 3: Decompose spawn-core.md

### Problem

`shared/spawn-core.md` (214 lines) contains 6 concerns. Three of them (verbosity control + output templates, team name conventions, dispatch pattern) are only used by the 3 spawn commands — no skill or agent reads them. They inflate shared/ without being genuinely shared.

### Content audit

| Section | Lines | Used by | Move to |
|---------|-------|---------|---------|
| Adaptive Sizing (rules table + user approval gate + subtask counting) | ~45 | All 3 commands | **Keep in shared/** |
| Model Selection (table + per-blueprint overrides) | ~20 | All 3 commands | **Keep in shared/** |
| Verbosity Control (3-level description + detection + output templates) | ~55 | All 3 commands (but each has identical behavior) | **Move to each command** |
| Team Name Conventions (pattern + table + slug rules) | ~25 | All 3 commands | **Move to each command** |
| Dispatch Pattern (5-step flow + auto-inference) | ~20 | Descriptive only, never referenced at runtime | **Delete** (already obvious from reading commands) |
| Project Analysis Additions (mock scan + retrospective scan + lead task assignment) | ~49 | All 3 commands | **Keep in shared/** |

### Proposed spawn-core.md after decomposition (~114 lines)

Remove:
- §"Verbosity Control" (55 lines) — move inline to each command's Step 10/11: Output section
- §"Team Name Conventions" (25 lines) — move inline to each command's Step 9: Spawn the Team header
- §"Dispatch Pattern" (20 lines) — delete entirely (documenting what's obvious from reading the command)

**Rename** to `shared/spawn-shared.md` to clarify the file only contains content that is actually shared (not core dispatch logic).

### What moves to each command

Each command currently has a Step 10/11 Output section that says:
```
Follow the verbosity templates from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.
```

**Replace with** the verbosity templates inlined directly in each command. The templates are identical across all 3 commands, so inlining adds ~55 lines to each command file but removes the cross-file dependency and makes each command self-contained.

Similarly, team name conventions move to the command's Step 9 header:

**Current spawn-build.md Step 9:**
```
Team name: `feature-[feature-slug]`
```

**After (add slug rules inline):**
```
Team name: `feature-[feature-slug]`
Slug rules: lowercase, hyphen-separated, max 30 chars, strip "the/a/an/for/with/and", first 3-4 meaningful words.
```

### Net result

| File | Before | After |
|------|--------|-------|
| `shared/spawn-core.md` → `shared/spawn-shared.md` | 214 lines | ~114 lines |
| `commands/spawn-build.md` | 297 lines | ~332 lines (+35 inlined) |
| `commands/spawn-think.md` | 322 lines | ~357 lines (+35 inlined) |
| `commands/spawn-create.md` | 344 lines | ~379 lines (+35 inlined) |
| **Total** | **1,177 lines** | **~1,182 lines** |

Net line count is roughly neutral (the dispatch description deletion mostly offsets the inlined content). The benefit is structural: each command becomes self-contained and spawn-shared.md contains only genuinely shared content with no deadweight.

---

## Implementation Priority

| Proposal | Token savings | Effort | Risk | Recommended order |
|----------|--------------|--------|------|-------------------|
| P1: Split planning-blueprints.md | ~415 lines per planning spawn (highest impact) | Low — pure file split + 1 reference change | Low | **Do first** |
| P3: Decompose spawn-core.md | Structural only (~neutral line count) | Low — move content | Low | **Do second** |
| P2: CLAUDE.md auto-loading | ~265 tokens per spawn (if loading works) | Medium — requires platform verification | Medium — depends on CLAUDE.md teammate loading behavior | **Verify first, then do** |

P1 is the unambiguous win. P3 is low-risk housekeeping. P2 needs one empirical check before committing.
