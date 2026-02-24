---
task: 4
title: "Analyze information architecture and file cross-reference structure"
owner: architecture-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Information Architecture Analysis

## Executive Summary

The plugin has a **3-layer information architecture** that creates significant layering violations. The same conceptual information lives at all 3 layers simultaneously: `shared/` (canonical definitions), `skills/` (duplicated tutorials), and `commands/` (duplicated operational instructions). The spawn prompt construction path — the hottest token path — crosses 5-7 files per invocation. The largest structural problem is that `team-blueprints` SKILL.md (807 lines) re-documents blueprints that already exist in `planning-blueprints.md` and the 3 spawn command files, creating a 3-way synchronization burden with no single source of truth.

---

## Dependency Graph

### File Load Paths (what gets read to spawn a team)

```
User calls /spawn-build
  └─ commands/spawn-build.md (297 lines)
       ├─ shared/prerequisites-check.md (45 lines)
       ├─ shared/discovery-interview.md (245 lines)
       │    └─ shared/spec-quality-scoring.md (77 lines) [referenced inline]
       │    └─ shared/scenario-collection.md (116 lines) [referenced inline]
       ├─ shared/spec-quality-scoring.md (77 lines) [also explicitly referenced]
       ├─ shared/spawn-core.md (214 lines)
       │    └─ shared/mock-repository.md (83 lines) [referenced inline]
       ├─ shared/task-blocking-protocol.md (76 lines) [embed directive]
       ├─ shared/output-standard.md (82 lines) [embed directive]
       └─ shared/shutdown-protocol.md (147 lines) [embed directive]

User calls /spawn-think --mode planning
  └─ commands/spawn-think.md (322 lines)
       ├─ [same shared/ chain as above]
       └─ shared/planning-blueprints.md (519 lines) [delegated for all 7 planning modes]

User calls /spawn-create --mode brainstorm
  └─ commands/spawn-create.md (344 lines)
       ├─ [same shared/ chain as above]
       └─ skills/team-personas/references/[facilitator|visionary|realist].md [runtime load by teammates]
```

### Skill Load Paths (what gets read when user asks about teams)

```
User asks "how do agent teams work"
  └─ skills/agent-teams/SKILL.md (126 lines)
       └─ skills/agent-teams/references/agent-teams-reference.md [pointer only]

User asks "research team"
  └─ skills/team-blueprints/SKILL.md (807 lines)
       ← duplicates spawn-build.md + spawn-think.md + spawn-create.md + planning-blueprints.md content

User asks about team management
  └─ skills/team-coordination/SKILL.md (604 lines)
       ← duplicates task-blocking-protocol.md, output-standard.md, shutdown-protocol.md, discovery-interview.md content
```

---

## Information Layering Violations

### Violation 1: Blueprint definitions exist at 3 layers simultaneously

The same blueprint (e.g., Research Team) is documented in:
1. `skills/team-blueprints/SKILL.md` — Tutorial layer, full re-documentation with "Configuration Tips"
2. `commands/spawn-think.md` — Operational layer, authoritative spawn prompt templates
3. `shared/planning-blueprints.md` — Shared layer, canonical spawn prompts for planning submodes

**Problem:** Any change to a blueprint requires 2-3 file updates. SKILL.md representative spawn prompts are already diverged from command files (team-blueprints SKILL.md shows simplified task lists vs the current full task lists in commands/).

**Specific divergence found:**
- `team-blueprints` SKILL.md Blueprint 2 (Feature Dev) task list has 10 tasks
- `spawn-build.md` Feature Mode has 12 tasks (added TDD contract testing in v0.19.0)
- `team-blueprints` SKILL.md Blueprint 3 (Code Review) has 8 tasks, no USER FEEDBACK GATE
- `spawn-think.md` Review Mode has 13 tasks with USER FEEDBACK GATE + deep-dives

### Violation 2: Protocol text duplicated across layers

Protocol content (Task Blocking, Output Standards, Shutdown) is defined canonically in `shared/` but also re-explained in `skills/team-coordination/SKILL.md` and `skills/team-blueprints/SKILL.md`:

| Content | Canonical Location | Also In |
|---------|-------------------|---------|
| Task blocking rules (7 bullets) | `shared/task-blocking-protocol.md` | `skills/team-coordination/SKILL.md` §"Blocked Task Behavior" (7 near-identical bullets) |
| Discovery interview structure | `shared/discovery-interview.md` | `skills/team-coordination/SKILL.md` §"Discovery Interview Pattern" (~60 lines) |
| User feedback gate pattern | Implicit in `shared/task-blocking-protocol.md` | `skills/team-coordination/SKILL.md` §"User Feedback Gate" (~60 lines) |
| Artifact output protocol | `shared/output-standard.md` + `shared/base-agent.md` | `skills/team-coordination/SKILL.md` §"Artifact Output Protocol" (~80 lines) |
| Pipeline map | Implied in each command file | `skills/team-blueprints/SKILL.md` §"Cross-Team Pipeline Pattern" (~80 lines with diagram) |
| Team sizing rules | `shared/spawn-core.md` | `skills/team-blueprints/SKILL.md` §"Efficiency Guidelines" + `skills/agent-teams/SKILL.md` §"Team Sizing Guidelines" |

**Rough duplication estimate:** ~400 lines in skills/ that re-express content already in shared/ (66% of `team-coordination` SKILL.md, ~30% of `team-blueprints` SKILL.md).

### Violation 3: spawn-core.md contains mixed concerns

`shared/spawn-core.md` (214 lines) bundles 6 independent concerns:
1. Adaptive sizing rules
2. Model selection table
3. Verbosity control + output templates
4. Team name conventions + slug generation
5. Dispatch pattern description
6. Project analysis additions (mock scan, retrospective scan, lead task assignment behavior)

Items 3, 4, and 5 are command-level operational logic that has no reason to be in a shared file (no skill reads them). Items 1 and 6 are genuinely shared. Item 2 is referenced in blueprints but rarely changes.

---

## Token Cost Analysis

### Spawn path token cost (estimated context loaded by lead)

| Command | Files Read | Estimated Lines | Problem |
|---------|-----------|-----------------|---------|
| `/spawn-build --mode feature` | 7 files | ~990 lines | spawn-core.md verbosity templates never used by teammates |
| `/spawn-think --mode planning` | 8 files | ~1,509 lines | planning-blueprints.md (519 lines) is monolithic |
| `/spawn-create --mode brainstorm` | 7 files | ~1,073 lines | team-personas refs loaded at runtime by teammates (extra reads) |

### Spawn prompt token cost (what teammates receive)

The 3 protocol blocks embedded in every spawn prompt (Task Blocking + Output Standards + Shutdown) total approximately **420 tokens** per spawn prompt. These are non-negotiable — teammates can't read shared/ files — but they represent the embed cost of the architecture choice to use "include directives."

The discovery-interview.md `## Token Budget Block` YAML (16 lines) is also embedded in every spawn prompt's Context section via `shared/discovery-interview.md`. This adds ~60 tokens to every spawn prompt output.

### Hottest structural waste

`shared/planning-blueprints.md` at 519 lines is read in full for every `/spawn-think --mode planning` invocation, even if the user selects only one of the 7 submodes. The file contains 6 complete team compositions and task lists that are irrelevant to the current invocation. Estimated waste: ~440 lines (85%) per planning spawn.

---

## Cross-Reference Structure

### Reference types found

| Type | Count | Example |
|------|-------|---------|
| `${CLAUDE_PLUGIN_ROOT}/shared/X.md` — runtime read at lead spawn time | 18 | `spawn-core.md`, `prerequisites-check.md` |
| `[Include X from shared/Y.md]` — embed directive, lead reads + copies into prompt | 12 | task-blocking-protocol, output-standard, shutdown-protocol |
| `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/X.md` — runtime read by teammate | 5 | facilitator, visionary, realist, auditor, architect |
| Prose references ("see shared/X.md") in skills/ — informational only | 8 | team-coordination §"Including in Spawn Prompts" |
| Implicit pointer (skill routes to command) | 3 | team-blueprints §"Task Blocking Protocol" |

### Problematic reference patterns

**Circular documentation:** `skills/team-blueprints/SKILL.md` documents blueprints that tell the user to run commands (`/spawn-think --mode planning`). Running those commands reads `shared/planning-blueprints.md` which contains the actual blueprints. The skill is a third copy that adds maintenance burden with no runtime value.

**Dead references in team-coordination SKILL.md:** The `## Discovery Interview Pattern` section references "5 core questions" (an older schema) while `shared/discovery-interview.md` now defines 3 core + up to 7 dynamic follow-ups (a different count). The skill's §"Standard Structure" shows the old 5-question format.

**Teammate runtime reads:** Brainstorm and productivity spawn prompts direct teammates to `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/X.md` at runtime. This means persona files must be loaded by each teammate — 5 separate file reads for a productivity team. These persona files (facilitator, visionary, realist, architect, auditor, refiner, compounder) exist outside the main spawn path but contribute to teammate context load.

---

## Structural Improvement Proposals

### P1 (High Impact): Split planning-blueprints.md into 7 mode files

**Current:** 519-line monolith read entirely for every planning spawn
**Proposed:** `shared/planning-blueprints/roadmap.md`, `spec.md`, `adr.md`, etc.
**Token savings:** ~440 lines (85%) per planning invocation
**Effort:** Medium — requires updating spawn-think.md reference path

### P2 (High Impact): Make team-blueprints SKILL.md a thin router

**Current:** 807-line re-documentation with representative spawn prompts
**Proposed:** ~100-line overview that routes to commands for actual use; remove all spawn prompt duplication
**Token savings:** 700 lines removed from skill context
**Effort:** Medium — content removal, no protocol changes
**Risk:** If users read the skill for reference, they lose the examples (acceptable — the commands are the authoritative source)

### P3 (Medium Impact): Strip team-coordination SKILL.md to non-shared content only

**Current:** 604 lines, ~400 duplicating shared/ content
**Proposed:** Remove §"Task Blocking Protocol" (covered by task-blocking-protocol.md), §"Discovery Interview Pattern" (covered by discovery-interview.md), §"User Feedback Gate" (thin, already in blueprints), §"Artifact Output Protocol" (covered by output-standard.md + base-agent.md)
**Remaining value:** §"Task Management", §"Communication Patterns", §"Plan Approval Workflow", §"Delegate Mode", §"Display Modes", §"Team Lifecycle", §"Shutdown" (coordination-specific guidance not in shared/)
**Estimated remaining size:** ~200 lines
**Effort:** Low — content deletion

### P4 (Medium Impact): Decompose spawn-core.md by concern

**Current:** 214 lines, 6 mixed concerns
**Proposed:** Extract verbosity templates and team name conventions to commands/ (they're per-command concerns). Keep only: adaptive sizing, model selection, project analysis additions (mock scan + retrospective scan).
**Estimated remaining size:** ~120 lines
**Effort:** Low — move content to spawn commands where it's used

### P5 (Low Impact): Fix team-coordination §"Discovery Interview Pattern" stale schema

**Current:** Documents "5 core questions" — diverged from actual 3-core + dynamic follow-ups
**Proposed:** Either remove the section (it duplicates shared/discovery-interview.md) or update to current schema
**Effort:** Minimal

---

## Information Architecture Map (Current State)

```
LAYER 1: shared/ — Canonical protocol definitions + spawn prompt content
  spawn-core.md ─────────────── [mixed: sizing + verbosity + naming + dispatch]
  discovery-interview.md ────── [canonical: interview protocol]
  spec-quality-scoring.md ───── [canonical: scoring]
  task-blocking-protocol.md ─── [canonical: embed content for spawn prompts]
  output-standard.md ─────────── [canonical: embed content for spawn prompts]
  shutdown-protocol.md ────────── [canonical: embed content for spawn prompts]
  planning-blueprints.md ──────── [canonical: 7 planning spawn prompts, monolith]
  base-agent.md ───────────────── [canonical: teammate universal behaviors]
  prerequisites-check.md ──────── [canonical: env check block]
  aar-protocol.md ──────────────── [canonical: AAR process]
  [others: scenario, mock, system-doc, ai-checklist]

LAYER 2: commands/ — Operational spawn orchestration
  spawn-build.md ───── [reads 7 shared/ files + embeds 3 protocol blocks]
  spawn-think.md ───── [reads 7 shared/ files + delegates to planning-blueprints.md]
  spawn-create.md ──── [reads 7 shared/ files + points teammates to persona refs]
  agent-teams.md ───── [overview/router only]

LAYER 3: skills/ — User-facing documentation (SHOULD reference, not duplicate)
  team-blueprints/SKILL.md ─── [PROBLEM: re-documents all blueprints from layers 1+2]
  team-coordination/SKILL.md ── [PROBLEM: re-documents protocols from layer 1]
  evaluate-spawn/SKILL.md ───── [OK: independent logic, no duplication]
  after-action-review/SKILL.md ─ [OK: thin wrapper, delegates to shared/aar-protocol.md]
  agent-teams/SKILL.md ──────── [OK: thin overview, routes to commands]
  team-personas/SKILL.md ─────── [OK: persona registry + ref files]
```

### Target Architecture (Post-Refactor)

```
shared/ — Protocol definitions + spawn content (no change except split planning-blueprints)
  planning-blueprints/ — Split into 7 mode files
  [all other files: unchanged]

commands/ — Operational orchestration (absorb verbosity/naming from spawn-core)
  [unchanged structure, slightly larger]

skills/ — Thin documentation layer (no duplication of shared/ content)
  team-blueprints/SKILL.md ─── ~100 lines: overview + mode table + route to commands
  team-coordination/SKILL.md ── ~200 lines: coordination-specific content only
  [others: unchanged]
```

---

## Appendix: Line Count by Category

| Category | Total Lines | % of Plugin |
|----------|-------------|-------------|
| Canonical shared protocols | 803 | 14.5% |
| Spawn command orchestration | 1,031 | 18.6% |
| Planning blueprints (shared) | 519 | 9.4% |
| Duplicated content in skills | ~400 | 7.2% |
| Independent skill logic | ~1,100 | 19.9% |
| Persona reference files | ~490 | 8.9% |
| Other (base-agent, system-doc, etc.) | ~700 | 12.6% |
| Agents | 195 | 3.5% |

Estimated removable duplication: **~400 lines (7.2%)** through P2+P3.
Estimated load-time waste on planning spawns: **~440 lines/invocation** through P1.
