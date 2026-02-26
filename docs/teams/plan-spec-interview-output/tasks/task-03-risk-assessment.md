---
task: 3
title: "Risk Assessment — Issues #8, #18, #19"
owner: risk-analyst
date: 2026-02-22
---

# Risk Assessment

## Dependency Grep Results

### Issue #8 — Fold `spec-refinement.md` into `discovery-interview.md`

**All references to `spec-refinement.md`:**

| File | Line | Reference Type |
|---|---|---|
| `plugin-manifest.json` | 30 | Manifest file entry — file tracked for distribution |
| `shared/discovery-interview.md` | 88 | Runtime call: `run the refinement protocol from .../spec-refinement.md` |
| `shared/spec-refinement.md` | 64 | Self-reference in integration instructions |
| `skills/evaluate-spawn/SKILL.md` | 326 | Improvement suggestion target: "Add question categories" |

**All references to `discovery-interview.md`:**

| File | Line | Reference Type |
|---|---|---|
| `plugin-manifest.json` | 21 | Manifest file entry — file tracked for distribution |
| `shared/spawn-core.md` | 139 | Protocol step: "Run discovery interview (from `shared/discovery-interview.md`)" |
| `shared/spec-refinement.md` | 64 | Back-reference: "commands that reference `discovery-interview.md`" |
| `commands/spawn-create.md` | 71 | Runtime call: "Follow the discovery interview from ..." |
| `commands/spawn-build.md` | 55 | Runtime call: "Follow the discovery interview from ..." |
| `commands/spawn-think.md` | 78, 258 | Runtime call + docs reference ("Streamlined 3+2 discovery interview") |
| `skills/evaluate-spawn/SKILL.md` | 327, 330, 334 | Three improvement suggestion targets |

### Issue #18 — Add dependency grep step to Risk Analyst role in `planning-blueprints.md`

**Risk Analyst text blocks in `planning-blueprints.md`:**

| Location | Mode | Lines (approx) |
|---|---|---|
| Mode 2 (Technical Spec) | Teammate description | 130–134 |
| Mode 2 (Technical Spec) | Task list entries | 158, 162 |
| Mode 5 (Business Case) | Teammate description | 330–332 |
| Mode 5 (Business Case) | Task list entries | 357, 361 |

**No other files reference the Risk Analyst role description text.** Changes are isolated to `planning-blueprints.md`.

### Issue #19 — Filename convention in `output-standard.md` + task description convention

**All references to `output-standard.md`:**

| File | Count | Reference Type |
|---|---|---|
| `agents/team-architect.md` | 1 | Include directive |
| `plugin-manifest.json` | 1 | Manifest entry |
| `commands/spawn-build.md` | 2 | Include directives (2 sections) |
| `commands/spawn-create.md` | 3 | Include directives (3 sections) |
| `commands/spawn-think.md` | 2 | Include directives (2 sections) |
| `shared/base-agent.md` | 1 | Back-reference: "See `shared/output-standard.md`" |
| `shared/planning-blueprints.md` | 7 | Include directives (all 7 modes) |
| `shared/output-standard.md` | 1 | Self-description |

**Existing filename convention (already documented):**

`base-agent.md:52` already defines `01-[task-slug].md` pattern. The `team-coordination/SKILL.md:449` also documents it with the same format. `output-standard.md` currently says only `docs/teams/[TEAM-NAME]/tasks/` with no filename convention.

**Task description convention — existing patterns:**

All task list entries in `planning-blueprints.md` follow this format:
```
N. [Role] Action verb — deliverable description (blocked by X)
```
No formal convention is currently documented in `output-standard.md`. `base-agent.md` documents the directory structure but not the task description format.

---

## Conflict Analysis — Multiple Specs Targeting Same Text Block

### R1: `discovery-interview.md` — Refinement Phase section (lines 86–118)

**#8 targets this block for replacement/integration.**

- Issue #8 removes the `## Refinement Phase` section at lines 86–94 (the call-out to `spec-refinement.md`) and folds that content into the dynamic protocol.
- No other spec (#18 or #19) targets this section.
- **Status: No cross-spec conflict.** Single owner.

### R2: `planning-blueprints.md` — Risk Analyst role blocks

**#18 targets the Risk Analyst teammate descriptions and task list entries.**

- Issue #18 adds a dependency grep step to the Risk Analyst role — modifying lines 130–134 (Mode 2 description) and task entry line 158/162, and their Mode 5 equivalents.
- Issue #8 does NOT modify `planning-blueprints.md`.
- Issue #19 does NOT modify `planning-blueprints.md`.
- **Status: No cross-spec conflict.** Single owner.

### R3: `output-standard.md` — Protocol Block

**#19 targets `output-standard.md` to add filename convention.**

- The "Task outputs go to `docs/teams/[TEAM-NAME]/tasks/`" line at line 23 is the target for #19's filename addition.
- Neither #8 nor #18 touches `output-standard.md`.
- **Status: No cross-spec conflict.** Single owner.

### R4: `spawn-think.md` line 258 — "Streamlined 3+2 discovery interview" string

**#8 changes the interview from a fixed 3+2 to a dynamic protocol (up to 10 questions).** The string "Streamlined 3+2 discovery interview from `shared/discovery-interview.md`" at `spawn-think.md:258` becomes stale documentation after #8 ships.

- This is a **documentation decay risk**, not a code conflict between specs.
- No other spec targets this line.
- **Status: Single file, single spec. ADVISORY** — requires coordinated update to `spawn-think.md:258` as part of #8's delivery scope.

---

## Risk Matrix

| ID | Risk | Spec | Likelihood | Impact | Rating | Mitigation |
|---|---|---|---|---|---|---|
| **R1** | `spec-refinement.md` removal breaks `plugin-manifest.json` — file removed but manifest not updated | #8 | HIGH | HIGH | **BLOCKING** | Must remove `shared/spec-refinement.md` entry from `plugin-manifest.json` (line 30) as part of #8 |
| **R2** | `spec-refinement.md` removal breaks `evaluate-spawn/SKILL.md` improvement target reference (line 326) | #8 | MEDIUM | LOW | **ADVISORY** | Update `SKILL.md:326` to reference `discovery-interview.md` instead — improvement target moves with the content |
| **R3** | Dynamic protocol (up to 10 questions) trains users to expect unlimited questions, causing interview fatigue and skip behavior | #8 | MEDIUM | MEDIUM | **ADVISORY** | Spec must include hard stop conditions and progressive disclosure — first 3 questions always core, extras only if triggered |
| **R4** | `spawn-think.md:258` documents "Streamlined 3+2 discovery interview" — stale after #8 | #8 | HIGH | LOW | **ADVISORY** | Update `spawn-think.md:258` as part of #8 delivery — change to reflect dynamic protocol |
| **R5** | Dependency grep step in Risk Analyst role (#18) creates ambiguity: which Risk Analyst tasks require grep (all or only risk tasks)? | #18 | MEDIUM | MEDIUM | **ADVISORY** | Spec must specify exact task list entries that get the grep requirement — teammate description vs. specific task line |
| **R6** | Filename convention in `output-standard.md` (#19) conflicts with existing pattern documented separately in `base-agent.md:52` | #19 | LOW | MEDIUM | **ADVISORY** | Verify #19's convention matches `01-[task-slug].md` pattern in `base-agent.md` — if so, `output-standard.md` change is additive only |
| **R7** | `output-standard.md` is included in 7 planning-blueprints modes + 3 spawn commands — any breaking change to the protocol block cascades to all | #19 | LOW | HIGH | **ADVISORY** | #19 should ADD a line, not replace or restructure existing lines. Adding is safe; restructuring is not. |
| **R8** | Version bump required: all 3 specs ship as v0.18.0 — missing any sync point fails the pre-commit hook | All | HIGH | HIGH | **BLOCKING** | Run `/bump-version agent-teams 0.18.0` after all edits; run `/pre-release agent-teams` before commit |

---

## BLOCKING Issues Summary

Two blocking risks require resolution before shipping:

1. **R1 (BLOCKING)**: `plugin-manifest.json` must remove `shared/spec-refinement.md` entry (line 30) when #8 removes the file. If omitted, stale-cleanup hook will error on install.

2. **R8 (BLOCKING)**: Version must be bumped to v0.18.0 across all 4 sync points (plugin.json, marketplace.json, SKILL.md frontmatter, docs/memory.md). The pre-commit hook rejects mismatches.

---

## Scope Clarification Needed

**Issue #8 scope boundary:** The spec says "spec-refinement.md will be folded INTO discovery-interview.md." This implies:
- Refinement content (edge case questioning) moves into `discovery-interview.md` as part of the dynamic protocol
- `spec-refinement.md` is **deleted** (not just emptied)
- All 4 references above must be updated

**Confirm:** Is `spec-refinement.md` being deleted entirely, or kept as a stub/redirect? Deletion requires `plugin-manifest.json` update (R1 is BLOCKING). A stub avoids R1 but adds maintenance debt.
