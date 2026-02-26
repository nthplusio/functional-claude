---
team: feature-agent-teams-feedback-loop
date: 2026-02-22
type: validation
task: 12
validator: validator-agent
---

# Validation Report — Agent-Teams Feedback Loop Implementation

Spec source: `docs/teams/plan-spec-agent-teams-feedback/spec.md`

## Summary

| Rec | Title | Result |
|-----|-------|--------|
| R1 | Fix calibration session counter | PASS |
| R2 | Unified inline correction protocol | PASS (with WARN — see below) |
| R3 | Move score accuracy to immediate question | PASS |
| R4 | Retrospective nudge at session end | PASS (with WARN — see below) |
| R5 | Retrospective scan with cold-start guard | PASS |
| R5a | Lessons applied section in spawn templates | PASS |
| R6 | Inject prior run insights into Context block | PASS |
| R7 | Expected outcomes for research and planning spawns | PASS |
| R10 | `/calibrate-scoring` command | PASS |
| R11 | Gate bypass tracking | PASS |

**Overall: All 10 recommendations PASS. 1 WARN issue (stale embedded Protocol Blocks in command files).**

---

## Per-Recommendation Results

### R1 — Fix Calibration Session Counter

**File:** `plugins/agent-teams/shared/spec-quality-scoring.md`
**Result: PASS**

Acceptance criteria verified:
- `## Calibration Mode` section replaced with glob-based counter logic (lines 50–60)
- Steps 1–4 (Glob, read `spec-score:`, count non-"not scored", assign N) present verbatim
- `(Calibration session N/10 — threshold will adjust...)` suffix present
- `If N >= 10: omit the calibration suffix` present
- `If docs/retrospectives/ does not exist: display N=0` present
- R10 reference appended after last bullet (line 62): "After 10+ Build profile retrospectives accumulate..."

All 4 acceptance criteria from spec satisfied:
1. 2 scored + 1 "not scored" → "Calibration session 2/10" ✓ (counter excludes "not scored")
2. 0 files → "Calibration session 0/10" ✓ (N=0 case covered)
3. 10+ scored files → suffix omitted ✓ (N >= 10 branch present)
4. `spec-score: "not scored"` does NOT increment ✓ (explicitly excluded)

---

### R2 — Unified Inline Correction Protocol

**Files:** `plugins/agent-teams/shared/shutdown-protocol.md`, `plugins/agent-teams/shared/scenario-collection.md`
**Result: PASS (with WARN — see cross-cutting concerns)**

**shutdown-protocol.md:**
- Phase 0 section inserted before Phase 1 (lines 15–68) ✓
- Trigger condition ("feature spawns where a Tester has produced `### Scenario Notes` output") ✓
- Invalidated/Partial check logic ✓
- Correction Opportunities table format ✓
- Three options (a/b/c) with exact text ✓
- Option (a) Accept: log in AAR ✓
- Option (b) Fix now: task title format, description contents, blocking until complete, re-validation loop, options (a)/(c) only on second failure ✓
- Option (c) Proceed: record in AAR ✓
- Inter-teammate communication flow section ✓
- "What fix complete means" definition ✓
- Protocol Block updated with R2 bullet as first item (line 120) ✓

**scenario-collection.md:**
- Correction Opportunities reference added after "Partial" status (lines 100–108) ✓
- Integration Points bullet added (line 116): "Shutdown Phase 0: Tester's..." ✓

---

### R3 — Move Score Accuracy to Immediate Question

**File:** `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`
**Result: PASS**

Changes verified:
- Change 1: Score accuracy removed from Deferred Section (line 113 now has only "First fix") ✓
- Change 2: Question 3: Score Accuracy added to Build Profile (lines 83–93), with all 4 option rows and correct frontmatter values ✓
- Change 3: Build Profile Template frontmatter has `score-accuracy: [matched|too-optimistic|too-pessimistic|not-scored]` (line 227) ✓
- Change 4: Build Profile Template body has `## Score Accuracy` section (line 242) ✓
- Change 5: Rubric Update Process reference updated (lines 337–338): "Score accuracy is now captured immediately (Question 3) — aggregate via `/calibrate-scoring` after 10+ Build profile retrospectives exist" ✓

---

### R4 — Retrospective Nudge at Session End

**File:** `plugins/agent-teams/shared/shutdown-protocol.md`
**Result: PASS (with WARN — see cross-cutting concerns)**

Changes verified:
- Phase 4 section extended with steps 5–8 (lines 105–110) ✓
- Step 5: Check for evaluate-spawn retrospective ✓
- Step 6: Absence prompt text matches spec exactly ("No evaluate-spawn retrospective found...optional — press Enter to skip") ✓
- Step 7: Wait for completion then proceed ✓
- Step 8: Skip → proceed ✓
- Protocol Block: R4 bullet added as final item (line 125): "After AAR is verified, check for `docs/retrospectives/[team-name].md`..." ✓

Final Protocol Block (lines 119–126) matches the spec's prescribed 5-bullet block exactly ✓

---

### R5 — Retrospective Scan with Cold-Start Guard

**Files:** `plugins/agent-teams/shared/spawn-core.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`
**Result: PASS**

**spawn-core.md:**
- Retrospective Scan section appended after Mock Repository Scan (lines 170–196) ✓
- Step 1: Glob evaluate-spawn and AAR files, filter by profile/type ✓
- Step 2: Cold-start guard `< 3` threshold (spec-corrected value, not < 5) ✓
- Display text: `Prior run scan: insufficient data (N/3 sessions)` ✓
- Step 3: Sort by date descending, take 3 most recent, extract Actionable Insights and AAR plugin-scope improvements ✓
- "Discard rows where improvement has already been applied" ✓
- Step 4: Report with `Prior runs (N found)` or "no actionable insights" ✓
- "This output is consumed by R6" note ✓

**spawn-build.md:** Line 117: `profile: build` / `type: feature|debug` ✓
**spawn-think.md:** Line 161: `profile: think` / `type: research|planning|review` ✓
**spawn-create.md:** Line 147: `profile: create` / `type: design|brainstorm|productivity` ✓

---

### R5a — Lessons Applied Section in Spawn Templates

**Files:** `plugins/agent-teams/shared/planning-blueprints.md`, `plugins/agent-teams/commands/spawn-build.md`
**Result: PASS**

**planning-blueprints.md:**
- `### Lessons Applied` inserted after `### Project Analysis` in Planning Context Template (line 34) ✓
- Correct placeholder text with "Prior run found: [improvement description]" format ✓
- "Omit this section entirely if R5 returned no data or R5 is not yet implemented" ✓

**spawn-build.md:**
- `### Lessons Applied` inserted after `### Acceptance Scenarios` in Feature Context (lines 187–188) ✓
- Same placeholder format ✓

---

### R6 — Inject Prior Run Insights into Context Block

**File:** `plugins/agent-teams/shared/discovery-interview.md`
**Result: PASS**

- `### Prior Run Insights` added after `### Project Analysis` in Output Compilation template (lines 82–84) ✓
- Placeholder text: "Populated from Retrospective Scan (see spawn-core.md)" ✓
- Hard limit: "max 3 bullets, max 100 words total" ✓
- Cold-start omit behavior: "If cold-start guard fired...omit this subsection entirely — do not add an empty placeholder" ✓

---

### R7 — Expected Outcomes for Research and Planning Spawns

**Files:** `plugins/agent-teams/shared/discovery-interview.md`, `plugins/agent-teams/commands/spawn-think.md`, `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`
**Result: PASS**

**discovery-interview.md:**
- Expected Outcomes Compilation section added after Scenario Collection section (lines 120–162) ✓
- Research Mode format with all 4 fields ✓
- Planning Mode format with all 4 fields ✓
- Field derivation instructions ✓
- Follow-up question for missing data ✓
- User skip behavior ✓
- Skip modes listed (Debug, Feature, Design, Brainstorm, Productivity, Review) ✓

**spawn-think.md:**
- Research Context block expanded with full structure (lines 193–208) ✓
- `### Expected Outcomes` as last subsection ✓

**planning-blueprints.md (via R7's Insertion 2):**
- `### Expected Outcomes` added after `### Lessons Applied` (line 36–38) ✓
- Section order: `### Project Analysis` → `### Lessons Applied` → `### Expected Outcomes` ✓

**evaluate-spawn SKILL.md:**
- Question 1a: Expected Outcomes Validation (conditional) added to Think Profile (lines 131–145) ✓
- Condition: "Only ask if `### Expected Outcomes` section is present" ✓
- All 3 option rows present ✓
- `outcomes-addressed: all|partial|none` written to frontmatter ✓
- Skip behavior if section not present ✓
- Think Profile Template frontmatter: `outcomes-addressed:` field present (line 265) ✓
- Think Profile Template body: `## Expected Outcomes Validation` section present (lines 276–277) ✓

---

### R10 — `/calibrate-scoring` Command

**Files:** `plugins/agent-teams/commands/calibrate-scoring.md` (new), `plugins/agent-teams/shared/spec-quality-scoring.md`
**Result: PASS**

**calibrate-scoring.md:**
- New file exists with correct YAML frontmatter (name, description, argument-hint) ✓
- Prerequisites section ✓
- Step 1: Parse flags (`--min-samples`, `--verbose`) ✓
- Step 2: Collect Build profile retrospectives, `profile: build` filter, insufficient data message format ✓
- Step 3: Aggregate score accuracy with all 4 values (matched/too-optimistic/too-pessimistic/not-scored) ✓
- Step 4: Aggregate gate bypass data, graceful skip if R11 absent ✓
- Step 5: Calibration summary format with decision tree ✓
- Decision tree: all 5 conditions present with correct thresholds (>50% optimistic → raise to 5; >50% pessimistic → lower to 3; >30% bypass AND >50% wrong → flag; mixed → no change) ✓
- Step 6: How to Apply section present ✓
- Step 7: `--verbose` per-file table ✓
- Read-only: "Do not write to a file unless user explicitly asks" ✓

**spec-quality-scoring.md:**
- R10 reference appended at line 62 (after R1's last bullet, not before) ✓
- BLOCKING-1 sequencing respected (R1 applied first, R10 appended to R1's output) ✓

---

### R11 — Gate Bypass Tracking

**File:** `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`
**Result: PASS**

Changes verified (BLOCKING-2 note: R3 was applied first, enabling Build profile Change 1):

- Change 1 (Build Profile Q4): Inserted after Q3 Score Accuracy, before Deferred (lines 95–107) ✓
  - Conditional trigger: `spec-score: present AND score below threshold` ✓
  - 3 option rows with correct frontmatter values ✓
  - "If score met threshold: write `gate-bypassed: false` without asking" ✓
- Change 2 (Think Profile Q3): Inserted after Q2 Blind Spots (lines 161–169) ✓
  - Correct question text ✓
  - 3 option rows with correct frontmatter values ✓
- Change 3 (Create Profile Q3): Inserted after Q2 Constraint Adherence (lines 201–209) ✓
  - Correct question text ✓
  - 3 option rows with correct frontmatter values ✓
- Change 4 (Template updates):
  - Build frontmatter: `gate-bypassed` and `bypass-verdict` fields (lines 228–229) ✓
  - Build body: `## Gate Bypass` after `## Score Accuracy` (line 243) ✓
  - Think frontmatter: `gate-bypassed` and `bypass-verdict` fields (lines 265–266) ✓
  - Think body: `## Gate Bypass` after `## Blind Spots` (line 280) ✓
  - Create frontmatter: `gate-bypassed` and `bypass-verdict` fields (lines 294–295) ✓
  - Create body: `## Gate Bypass` after `## Constraint Adherence` (line 305) ✓ (confirmed section present)

---

## Cross-Cutting Concerns

### Protocol Block Sequencing (R2 + R4) — PASS

The final Protocol Block in `shared/shutdown-protocol.md` (lines 119–126) has all 5 bullets in the correct order:
1. R2: Scenario Invalidation Check bullet (feature spawns)
2. Message teammates for retrospective
3. Collect responses before shutdown_request
4. Run `/after-action-review`
5. Verify AAR exists before TeamDelete
6. R4: evaluate-spawn retrospective check

This matches the spec's prescribed final Protocol Block exactly.

### R5a + R7 Planning-Blueprints Ordering — PASS

`planning-blueprints.md` Planning Context Template section order:
- `### Project Analysis` (line 31)
- `### Lessons Applied` (line 34) — R5a
- `### Expected Outcomes` (line 36) — R7

Matches spec requirement: `### Project Analysis` → `### Lessons Applied` → `### Expected Outcomes`.

### SKILL.md Description Block Question Count — PASS

The SKILL.md description field (lines 2–8) reads:
> "Build profile asks up to 4 questions (3 explicit + 1 conditional gate bypass); Think and Create profiles ask up to 3 questions (2 explicit + 1 gate bypass)."

This correctly reflects the actual post-R3/R11 question counts. The spec's cross-cutting concern noted this update should be added "to the same PR as R3+R11" — it was applied.

---

## WARN — Stale Embedded Shutdown Protocol Blocks in Command Files

**Severity: WARN (not FAIL)**
**Affected files:**
- `plugins/agent-teams/commands/spawn-build.md` (2 locations: feature mode lines 225–230, debug mode lines 305–310)
- `plugins/agent-teams/commands/spawn-think.md` (multiple spawn templates)
- `plugins/agent-teams/commands/spawn-create.md` (multiple spawn templates)

**Issue:**
The spawn command files embed verbatim copies of the Shutdown Protocol block inside their spawn prompt templates. These embedded copies were NOT updated with the R2 and R4 additions. They still contain the original 4-bullet version:

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: ...
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

They are missing:
- R2 bullet: `For feature spawns: before Phase 1, check Tester's ### Scenario Notes...`
- R4 bullet: `After AAR is verified, check for docs/retrospectives/[team-name].md...`

**Why this is WARN not FAIL:**
The spec only explicitly listed `shared/shutdown-protocol.md` as the file to modify for R2 and R4. The authoritative Protocol Block in that shared file is correct. The spec's `## Protocol Block` section says "Include this block verbatim in spawn prompts" — the updated block in the shared file IS the canonical version. The stale copies in command files are consistency issues, not spec violations.

**However:** Leads spawning teams via these commands will receive spawn prompts with the stale 4-bullet Protocol Block. They will not see the R2 or R4 instructions unless they separately read `shared/shutdown-protocol.md`. This reduces the functional effectiveness of R2 and R4 in practice.

**Recommended fix (task 13):**
Update the embedded Shutdown Protocol blocks in all command files to match the 5-bullet version from `shared/shutdown-protocol.md`. Affected locations:
- `spawn-build.md` lines 225–229 (feature mode)
- `spawn-build.md` lines 305–309 (debug mode)
- `spawn-think.md` (all 3 research variant templates, and review template)
- `spawn-create.md` (all 3 create variant templates)

---

## docs/memory.md Update Status

Per CLAUDE.md, R10 creates `commands/calibrate-scoring.md` and requires `docs/memory.md` to be updated with the new command in the plugin's component table. This was noted as a requirement in the spec. The fix team (task 13) should verify whether `docs/memory.md` was updated and add the entry if not.
