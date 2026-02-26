---
team: plan-spec-agent-teams-feedback
date: 2026-02-22
type: planning
mode: spec
topic: Agent-teams feedback loop — implementation specs for evaluation report recommendations
status: complete
source: docs/teams/research-eval-agent-teams-loop/evaluation-report.md
---

# Agent-Teams Feedback Loop — Implementation Spec

## Overview

This spec covers implementation of recommendations R1–R11 from `docs/teams/research-eval-agent-teams-loop/evaluation-report.md`. The evaluation identified 10 gaps in the agent-teams plugin's feedback loop — learnings from prior runs are not captured, not surfaced, and not used to improve future spawns.

**What this spec covers:**
- 10 implementation-ready recommendations (R1–R7, R10–R11; R8 merged into R2, R9 dropped)
- 3 implementation phases (A/B/C) sequenced by dependency and data requirements
- 6 files modified across the agent-teams plugin
- Cross-cutting concerns: question cap analysis, cold-start behavior, format migration

**What this spec does NOT cover:**
- R8: Merged into R2 (see R2 spec)
- R9: Dropped — state reconstruction post-shutdown is unsolvable in the markdown+hooks architecture

**Plugin root:** `plugins/agent-teams/`

**For implementers:** Each recommendation section is self-contained for `/spawn-build`. Read the Per-Recommendation Specs section for the recommendation you are implementing.

---

## Implementation Roadmap

### Phase A — Foundation (implement first, no data dependencies)

| Rec | Title | Effort | Files Modified |
|-----|-------|--------|----------------|
| R1 | Fix calibration session counter | Low | `shared/spec-quality-scoring.md` |
| R2 | Unified inline correction protocol | Medium | `shared/shutdown-protocol.md`, `shared/scenario-collection.md` |
| R3 | Move score accuracy to immediate question | Medium | `skills/evaluate-spawn/SKILL.md` |
| R4 | Retrospective nudge at session end | Low | `shared/shutdown-protocol.md` |
| R11 | Gate bypass tracking | Medium | `skills/evaluate-spawn/SKILL.md` |

**Why Phase A first:** R1, R2, R4 fix existing broken or missing behaviors. R3 and R11 start building the data corpus that Phase B (R5/R6) and Phase C (R10) depend on.

**Phase A implementation order:**
1. R1 (independent)
2. R2 (independent)
3. R4 (independent)
4. R3 (independent — but implement before R11 for Build profile)
5. R11 (depends on R3 for Build profile insertion point — see BLOCKING-2 fix below)

### Phase B — Retrospective Surfacing (implement after Phase A has data)

| Rec | Title | Effort | Files Modified |
|-----|-------|--------|----------------|
| R5 | Retrospective scan with cold-start guard | Medium | `shared/spawn-core.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md` |
| R5a | Lessons Applied section in spawn templates | Low | `shared/planning-blueprints.md`, `commands/spawn-build.md` |
| R6 | Inject Prior Run Insights into Context block | Low | `shared/discovery-interview.md` |
| R7 | Expected Outcomes for Research+Planning | High | `shared/discovery-interview.md`, `commands/spawn-think.md`, `skills/evaluate-spawn/SKILL.md` |

**Phase B prerequisite:** R4 (R4 increases retrospective data volume). Phase B functions without R4 but has less data.

**Phase B implementation order:**
1. R5 first (R6 and R5a both depend on R5)
2. R5a and R6 can be done in parallel after R5
3. R7 is independent of R5/R5a/R6 — can be done in parallel with all

**Note on R5a + R7 ordering on `planning-blueprints.md`:** Final section order must be `### Project Analysis` → `### Lessons Applied` → `### Expected Outcomes`. If implementing both in the same PR, apply R5a's insertion first, then R7's.

### Phase C — Calibration Analytics (implement after Phase A+B have 10+ retrospectives)

| Rec | Title | Effort | Files Modified |
|-----|-------|--------|----------------|
| R10 | `/calibrate-scoring` command | High | `commands/calibrate-scoring.md` (new), `shared/spec-quality-scoring.md` |

**Phase C prerequisite:** R3 and R11 implemented AND at least 10 Build profile retrospectives exist with `score-accuracy` data. Do not implement R10 before this threshold is reachable.

**R10 implementation note:** Apply R1 to `spec-quality-scoring.md` before R10. See BLOCKING-1 sequencing note in R10 spec.

---

## Per-Recommendation Specs

---

### R1 — Fix Calibration Session Counter

**Gap:** G4 (broken calibration promise — static placeholder never reads actual data)
**Phase:** A | **Effort:** Low | **Confidence:** High

**File:** `plugins/agent-teams/shared/spec-quality-scoring.md`

**Change:** Replace entire `## Calibration Mode` section.

**Before (lines 52–55):**
```markdown
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

**After:**
```markdown
## Calibration Mode

For the first 10 sessions using scoring:
- Before displaying the spec quality score, count calibration sessions:
  1. Glob `docs/retrospectives/*.md`
  2. For each file, read the frontmatter `spec-score:` field
  3. Count files where `spec-score:` is present and is NOT the string "not scored"
  4. That count is N
- Append to the score display: `(Calibration session N/10 — threshold will adjust based on /evaluate-spawn data)`
- If N >= 10: omit the calibration suffix — display score without calibration note
- If `docs/retrospectives/` does not exist or contains no files: display N=0
```

**Acceptance criteria:**
1. 2 scored files + 1 "not scored" → "Calibration session 2/10"
2. 0 files → "Calibration session 0/10"
3. 10+ scored files → calibration suffix omitted
4. `spec-score: "not scored"` does NOT increment counter

**Dependencies:** None. R1 is independent.

---

### R2 — Unified Inline Correction Protocol

**Gap:** G2 (no rework path for partial scenario failures)
**Phase:** A | **Effort:** Medium | **Confidence:** High
**Merges:** R2 + R8

**Files:**
- `plugins/agent-teams/shared/shutdown-protocol.md` (primary)
- `plugins/agent-teams/shared/scenario-collection.md` (reference only)

#### File 1: shutdown-protocol.md

**Change 1:** Insert new Phase 0 section immediately before `### Phase 1: Participant Retrospective`.

**Content to insert:**
```markdown
### Phase 0: Scenario Invalidation Check

**Trigger:** Only runs for feature spawns where a Tester has produced `### Scenario Notes` output.

Before initiating Phase 1, the Lead reads the Tester's task output and checks `### Scenario Notes` for any rows with status `Invalidated` or `Partial`.

**If no Invalidated/Partial rows exist:** Skip Phase 0, proceed to Phase 1.

**If Invalidated or Partial rows exist:**

1. **Tester produces a `### Correction Opportunities` table** in their task output (added after `### Scenario Notes`):

   ```markdown
   ### Correction Opportunities

   | Scenario | Root Cause | Affected Task | Suggested Fix |
   |----------|------------|---------------|---------------|
   | [scenario name] | [brief root cause] | [task # and owner] | [specific fix description] |
   ```

2. **Lead reads the table and presents the user with three options:**

   ```
   Tester found [N] invalidated scenario(s). How do you want to proceed?

   (a) Accept — proceed to AAR and address failures in next spawn
   (b) Fix now — I'll create targeted correction tasks for the original implementers
       (blocks AAR until resolved or you accept)
   (c) Proceed — skip correction, note in AAR for future reference
   ```

3. **Option (a) — Accept:** Log accepted failures in AAR improvement table. Proceed to Phase 1.

4. **Option (b) — Fix now:**
   - Lead creates one task per Invalidated scenario, assigned to the original implementer
   - Task title format: `[Owner] Fix scenario: [scenario-name] — [one-line root cause]`
   - Task description includes: full `### Correction Opportunities` row, original scenario file path, instruction to re-run Tester validation after fix
   - AAR and shutdown are **blocked** until all correction tasks complete or user explicitly accepts remaining failures
   - After correction tasks complete, Tester re-validates the affected scenarios
   - If re-validation passes: proceed to Phase 1
   - If re-validation fails again: present options (a)/(c) only (no second correction loop)

5. **Option (c) — Proceed:** Skip correction. Lead records invalidated scenario names in AAR `### What Could Be Improved?` section. Proceed to Phase 1.

**Inter-teammate communication flow:**
- Tester → Lead: sends `### Correction Opportunities` table via SendMessage
- Lead → user: presents three options
- Lead → original implementer: sends correction task context via SendMessage (option b only)
- Original implementer → Lead: confirms fix complete
- Lead → Tester: requests re-validation of affected scenarios
- Tester → Lead: sends updated `### Scenario Notes`

**What "fix complete" means:** Correction task status set to `completed` AND Tester has re-validated the scenario as `Validated` or `Partial` (with user acceptance of remaining partial coverage).
```

**Change 2:** Update Protocol Block section.

**SEQUENCING NOTE (ADVISORY):** R2 and R4 both modify the Protocol Block. Apply R2's Protocol Block change first, then apply R4's change to R2's output.

**Exact Protocol Block before-text to replace:**
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

**Replace with (R2 version — R4 adds one more bullet after this):**
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows — if found, run Scenario Invalidation Check (see `shared/shutdown-protocol.md` Phase 0) and present user with accept/fix/proceed options before continuing
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

#### File 2: scenario-collection.md

Insert after `- **Partial**: Some aspects match, others diverge — details in Notes column`:

```markdown

**If any rows are Invalidated or Partial:** The Tester adds a `### Correction Opportunities` table immediately after `### Scenario Notes`. See `shared/shutdown-protocol.md` Phase 0 for the correction loop protocol the Lead runs on this output.

```markdown
### Correction Opportunities

| Scenario | Root Cause | Affected Task | Suggested Fix |
|----------|------------|---------------|---------------|
| [scenario name] | [brief root cause] | [task # and owner] | [specific fix description] |
```
```

Also append to Integration Points section:
```markdown
- **Shutdown Phase 0**: Tester's `### Correction Opportunities` table triggers the Scenario Invalidation Check in `shared/shutdown-protocol.md` — the Lead reads it and presents user with accept/fix/proceed options before AAR begins
```

**Dependencies:** None. R2 is independent.

---

### R3 — Move Score Accuracy to Immediate Question

**Gap:** G7 (score accuracy deferred question is never revisited)
**Phase:** A | **Effort:** Medium | **Confidence:** High

**File:** `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

**Change 1:** Remove score accuracy from Deferred Section.

**Before (Deferred section):**
```markdown
### Deferred Section

These items cannot be evaluated at spawn completion. They are included as checkboxes in the retrospective file for the user to fill in during periodic rubric reviews:

- [ ] **Score accuracy** — Did the spec quality score predict actual output quality? (matched / too optimistic / too pessimistic)
- [ ] **First fix** — What was the first thing you had to fix after using the output?
```

**After:**
```markdown
### Deferred Section

These items cannot be evaluated at spawn completion. They are included as checkboxes in the retrospective file for the user to fill in during periodic rubric reviews:

- [ ] **First fix** — What was the first thing you had to fix after using the output?
```

**Change 2:** Add Question 3 to Build Profile. Insert before `### Deferred Section` (after `### Question 2: Gap Identification (conditional)` block):

```markdown
### Question 3: Score Accuracy

**"Did the spec quality score reflect actual implementation difficulty? (A higher score should predict an easier build.)"**

| Option | Value written to frontmatter |
|---|---|
| Matched — score reflected actual difficulty | `score-accuracy: matched` |
| Score too optimistic — build was harder than the score suggested | `score-accuracy: too-optimistic` |
| Score too pessimistic — build was easier than the score suggested | `score-accuracy: too-pessimistic` |
| No spec score was used | `score-accuracy: not-scored` |

```

**Change 3:** Update Build Profile Template frontmatter — add `score-accuracy` field:
```markdown
score-accuracy: [matched|too-optimistic|too-pessimistic|not-scored]
```

**Change 4:** Update Build Profile Template body — replace deferred score accuracy checkbox with immediate section:
- Remove: `- [ ] **Score accuracy**: matched / too optimistic / too pessimistic`
- Add: `## Score Accuracy\n[User's answer to Question 3]`

**Change 5:** Update Rubric Update Process reference:

Before: `After 3+ evaluations, review the deferred sections across retrospective files to identify score accuracy trends and common first-fix categories.`

After: `After 3+ evaluations, review the deferred sections across retrospective files to identify common first-fix categories. Score accuracy is now captured immediately (Question 3) — aggregate via \`/calibrate-scoring\` after 10+ Build profile retrospectives exist.`

**Dependencies:** None. R3 is independent. Implement R3 before R11 for Build profile.

---

### R4 — Retrospective Nudge at Session End

**Gap:** G6, G9, G10 (evaluate-spawn completion rate unknown and likely low)
**Phase:** A | **Effort:** Low | **Confidence:** High

**File:** `plugins/agent-teams/shared/shutdown-protocol.md`

**Change 1:** Replace Phase 4 section content.

**Before:**
```markdown
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first

Then call `TeamDelete` to clean up team config and task directories.
```

**After:**
```markdown
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first
5. Check for evaluate-spawn retrospective at `docs/retrospectives/[team-name].md`
6. If that file is absent: display — "No evaluate-spawn retrospective found for this team. Run `/evaluate-spawn` to capture learnings before session ends? (optional — press Enter to skip)"
7. If user runs `/evaluate-spawn`: wait for completion, then proceed to TeamDelete
8. If user skips: proceed to TeamDelete

Then call `TeamDelete` to clean up team config and task directories.
```

**Change 2:** Update Protocol Block — append one bullet to the R2 output (apply R2 first, then add this bullet at the end):

```
- After AAR is verified, check for `docs/retrospectives/[team-name].md` — if absent, display: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)"
```

**Final Protocol Block after both R2 and R4:**
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows — if found, run Scenario Invalidation Check (see `shared/shutdown-protocol.md` Phase 0) and present user with accept/fix/proceed options before continuing
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md` — if absent, display: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)"
```

**Dependencies:** None. R4 is independent.

---

### R5 — Retrospective Scan with Cold-Start Guard

**Gap:** G1 (every spawn starts cold — prior learnings never surfaced)
**Phase:** B | **Effort:** Medium | **Confidence:** High

**Files:**
- `plugins/agent-teams/shared/spawn-core.md` (primary)
- `plugins/agent-teams/commands/spawn-build.md`
- `plugins/agent-teams/commands/spawn-think.md`
- `plugins/agent-teams/commands/spawn-create.md`

**Spawn-to-filter mapping:**

| Spawn Command | Evaluate-Spawn filter | AAR filter |
|---|---|---|
| spawn-build | `profile: build` | `type: feature` or `type: debug` |
| spawn-think | `profile: think` | `type: research` or `type: planning` or `type: review` |
| spawn-create | `profile: create` | `type: design` or `type: brainstorm` or `type: productivity` |

#### File 1: spawn-core.md

Append after the Mock Repository Scan block (at end of file, after a blank line):

```markdown
### Retrospective Scan

During project analysis, scan for prior run learnings from `docs/retrospectives/`:

**Step 1: Identify target files**
- Glob `docs/retrospectives/*.md` (excludes `-aar.md` files)
- Glob `docs/retrospectives/*-aar.md`
- Filter evaluate-spawn files by matching `profile:` frontmatter to the current spawn command
- Filter AAR files by matching `type:` frontmatter to the current spawn command
- Use the mapping defined in the spawn command

**Step 2: Cold-start guard**
- Count matched files across both file types
- If total matched count < 3: skip scan. Display: `Prior run scan: insufficient data (N/3 sessions)`
- If total matched count >= 3: proceed to Step 3

**Step 3: Extract insights from matched files (most recent 3 only)**
- Sort matched files by `date:` frontmatter descending. Take the 3 most recent.
- From each evaluate-spawn file: extract `## Actionable Insights` section content
- From each AAR file: extract improvement table rows where `Scope` column = `plugin`
- Discard rows where improvement has already been applied

**Step 4: Report**
- If insights found: surface as `Prior runs (N found): [extracted content]` in the team context
- If step 3 yields no actionable content: display `Prior run scan: N files found, no actionable insights`
- This output is consumed by R6 (Prior Run Insights injection) when building the Context block
```

#### Files 2–4: spawn-build.md, spawn-think.md, spawn-create.md

In each file, locate the Project Analysis step and add to the analysis list:

**spawn-build.md:**
```markdown
Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan
- **Retrospective Scan** — use `profile: build` for evaluate-spawn files, `type: feature|debug` for AAR files
```

**spawn-think.md:**
```markdown
Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan (if applicable)
- **Retrospective Scan** — use `profile: think` for evaluate-spawn files, `type: research|planning|review` for AAR files
```

**spawn-create.md:**
```markdown
Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan (if applicable)
- **Retrospective Scan** — use `profile: create` for evaluate-spawn files, `type: design|brainstorm|productivity` for AAR files
```

> Note: Read spawn-think.md and spawn-create.md immediately before editing to locate exact insertion points.

**Dependencies:** R4 (increases data volume, not required). R6 depends on R5.

---

### R5a — Lessons Applied Section in Spawn Templates

**Gap:** G5 (AAR improvements never reach blueprints)
**Phase:** B | **Effort:** Low | **Confidence:** Medium

**Files:**
- `plugins/agent-teams/shared/planning-blueprints.md`
- `plugins/agent-teams/commands/spawn-build.md`

#### File 1: planning-blueprints.md

Add `### Lessons Applied` after `### Project Analysis` in the Planning Context Template:

**After:**
```
### Project Analysis
[Findings from codebase/document analysis]
```

**Insert:**
```
### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]
```

#### File 2: spawn-build.md

Add `### Lessons Applied` after `### Acceptance Scenarios` in the Feature Context:

**After:**
```
### Acceptance Scenarios
[Behavioral scenarios from `docs/scenarios/[feature-slug].md` — user's pre-spawn definition of correct behavior. If scenarios were skipped, note "Scenarios not collected".]
```

**Insert:**
```
### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this feature spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]
```

**Dependencies:** R5 (data source). Template slot can ship before R5.

---

### R6 — Inject Prior Run Insights into Context Block

**Gap:** G1, G5 (scan output has no home in the spawn prompt)
**Phase:** B | **Effort:** Low | **Confidence:** High

**File:** `plugins/agent-teams/shared/discovery-interview.md`

**Change:** In the Output Compilation template, add `### Prior Run Insights` after `### Project Analysis`.

**Before (closing lines of the fenced template):**
```markdown
### Project Analysis
[Findings from codebase/document analysis, if applicable]
```

**After:**
```markdown
### Project Analysis
[Findings from codebase/document analysis, if applicable]

### Prior Run Insights
[Populated from Retrospective Scan (see spawn-core.md). Include only if scan returned actionable content. Hard limit: max 3 bullets, max 100 words total. If cold-start guard fired (fewer than 3 matching retrospectives), omit this subsection entirely — do not add an empty placeholder.]
```

**Content format:**
```markdown
### Prior Run Insights
- [Insight 1 — one sentence, active voice, ≤35 words]
- [Insight 2 — one sentence, active voice, ≤35 words]
- [Insight 3 — one sentence, active voice, ≤35 words]
```

**Synthesis rules:**
1. Prefer insights from evaluate-spawn files over AAR files
2. Include AAR improvements only if not already captured by an evaluate-spawn insight
3. Same theme across multiple files → one synthesized bullet
4. No meta-commentary — state the insight directly

**Dependencies:** R5 (required prerequisite). R5a is complementary (lead-facing), R6 is team-facing — not duplicates.

---

### R7 — Expected Outcomes for Research and Planning Spawns

**Gap:** G3 (think/create spawns have no pre-spawn definition of done)
**Phase:** B | **Effort:** High | **Confidence:** Medium
**Scope:** Research and Planning modes only. Design/Brainstorm/Productivity deferred.

**Files:**
- `plugins/agent-teams/shared/discovery-interview.md`
- `plugins/agent-teams/commands/spawn-think.md`
- `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

#### File 1: discovery-interview.md

Insert new section after Scenario Collection section, before "When to Include". Insert after `**Skip:** User can type "skip". Skipping means no scenario file is created and quality scoring penalizes the acceptance criteria dimension.`:

```markdown
## Expected Outcomes Compilation (Research and Planning Modes Only)

After quality scoring, for Research and Planning spawns, compile a `### Expected Outcomes` subsection in the Context block. This freezes the pre-spawn definition of done before the team begins work — the evaluate-spawn Think profile checks against it at completion.

**Skip for:** Debug, Feature, Design, Brainstorm, Productivity, Review modes.

### Research Mode Format

```markdown
### Expected Outcomes

**Decision question:** [The specific question this research must answer]
**Options under consideration:** [List the options being evaluated]
**Minimum confidence threshold:** [High confidence required / Medium confidence acceptable / Directional signal sufficient]
**Out of scope:** [What this research should NOT try to answer]
```

Derive from the discovery interview:
- Decision question: from the Goal answer ("What are you trying to decide?")
- Options: from Candidate Options extended question if asked, otherwise derive from Goal
- Confidence threshold: from Success Criteria answer
- Out of scope: from Constraints answer

### Planning Mode Format

```markdown
### Expected Outcomes

**Phase count:** [Expected number of phases/milestones in the plan]
**Feasibility constraint:** [Key constraint the plan must respect — budget, timeline, team capacity]
**Stakeholder success definition:** [What the key stakeholder considers success — from discovery interview]
**Out of scope:** [What this plan should NOT address]
```

Derive from the discovery interview:
- Phase count: from the Goal or Constraints answer (approximate is fine — "3-4 phases")
- Feasibility constraint: from the Constraints answer
- Stakeholder success definition: from Success Criteria answer
- Out of scope: from Constraints answer

**If the user didn't provide enough data:** Ask one follow-up question specific to the missing field. Do not skip Expected Outcomes silently — an incomplete expected outcomes block is better than none.

**User skip:** User can type "skip". Skipping means no `### Expected Outcomes` subsection. The evaluate-spawn Think profile's outcomes validation question will be skipped if no section is present.
```

#### File 2: spawn-think.md

**Insertion 1 — Research Context block:**

Expand the bare `[Compiled interview results]` placeholder into a structured block with `### Expected Outcomes` as the last subsection:

```markdown
## Research Context

### Goal
[What we're researching and why]

### Constraints
[Non-negotiables that affect the research direction]

### Success Criteria
[How the research output will be evaluated]

### Additional Context
[Extended question answers, project analysis]

### Expected Outcomes
[From Expected Outcomes compilation step — Decision question, options, confidence threshold, out of scope. Omit section if user skipped.]
```

**Insertion 2 — Planning Context (in planning-blueprints.md):**

After R5a's `### Lessons Applied` insertion, add `### Expected Outcomes`. Final order:
```
### Project Analysis → ### Lessons Applied → ### Expected Outcomes
```

Insert after `### Lessons Applied` block:
```
### Expected Outcomes
[From Expected Outcomes compilation step — Phase count, feasibility constraint, stakeholder success definition, out of scope. Omit section if user skipped or mode is not Research/Planning.]
```

#### File 3: evaluate-spawn SKILL.md

**Change 1:** Add Question 1a to Think Profile. Insert after `| No — wrong focus | The team spent effort on the wrong areas |`:

```markdown

### Question 1a: Expected Outcomes Validation (conditional)

Only ask if `### Expected Outcomes` section is present in the team's Context block (check `docs/teams/[team-name]/` artifacts):

**"Did the output address the Expected Outcomes defined before spawning?"**

| Option | Description |
|---|---|
| Yes — all outcomes addressed | The output answered the decision question / met the plan criteria at the specified confidence level |
| Partially — some outcomes addressed | Some outcomes were met but others were not addressed |
| No — outcomes not addressed | The output did not address the pre-spawn definition of done |

Write outcome verdict to retrospective as: `outcomes-addressed: all|partial|none`

If `### Expected Outcomes` section is NOT present: skip Question 1a entirely.
```

**Change 2:** Update Think Profile Template frontmatter — add field:
```
outcomes-addressed: [all|partial|none|"N/A — no Expected Outcomes defined"]
```

**Change 3:** Add `## Expected Outcomes Validation` section to Think Profile Template body, after `## Coverage`:
```markdown
## Expected Outcomes Validation
[User's answer to Question 1a, or "N/A — no Expected Outcomes section in team context" if Q1a was skipped]
```

**Dependencies:** R5a must coordinate `### Expected Outcomes` placement with `### Lessons Applied`. If implementing both in the same PR: apply R5a first, then R7.

---

### R10 — `/calibrate-scoring` Command

**Gap:** G4, G8, G9 (no aggregate calibration signal — do not implement until data threshold reached)
**Phase:** C | **Effort:** High | **Confidence:** Medium
**Blocked by data:** Do not implement until R3 and R11 are in place AND ≥10 Build retrospectives with `score-accuracy` data exist.

**Files:**
- `commands/calibrate-scoring.md` (new)
- `shared/spec-quality-scoring.md` (append reference)

#### BLOCKING-1 sequencing note

Apply R1 to `spec-quality-scoring.md` FIRST. R1 replaces the entire `## Calibration Mode` section. R10's append target becomes R1's last bullet:
```
- If `docs/retrospectives/` does not exist or contains no files: display N=0
```
Applying R10 before R1 produces duplicate/conflicting Calibration Mode content.

#### File 1: commands/calibrate-scoring.md (new file)

Full file content: see `docs/teams/plan-spec-agent-teams-feedback/tasks/task-06-spec-r10.md`, "File 1" section.

Summary of command behavior:
- Reads all `docs/retrospectives/*.md` with `profile: build` frontmatter
- Enforces minimum sample threshold (default 10, override with `--min-samples N`)
- Aggregates `score-accuracy` (matched/too-optimistic/too-pessimistic) from R3 data
- Aggregates `gate-bypassed`/`bypass-verdict` from R11 data (skips gracefully if R11 absent)
- Decision tree produces: raise threshold / lower threshold / no change / insufficient data
- Read-only — no writes unless user asks
- `--verbose` flag shows per-file detail

#### File 2: spec-quality-scoring.md

After R1 is applied, append after the last bullet of R1's new Calibration Mode section:

```markdown

After 10+ Build profile retrospectives accumulate with score accuracy data (from R3), run `/calibrate-scoring` to aggregate patterns and receive a threshold adjustment recommendation.
```

**Dependencies:** R1 (for correct append target), R3 (score-accuracy data), R11 (bypass data). Data volume: 10+ Build retrospectives.

---

### R11 — Gate Bypass Tracking

**Gap:** G9 (gate bypass leaves no record — erodes quality system silently)
**Phase:** A | **Effort:** Medium | **Confidence:** High

**File:** `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

#### BLOCKING-2 sequencing note

**Build profile Change 1 requires R3 to be applied first.** R11's Build insertion point is after `### Question 3: Score Accuracy` — which only exists after R3. If R3 is not yet applied, skip Change 1 (Build profile) and implement Changes 2 and 3 (Think and Create profiles) only. Return to Change 1 after R3 is applied.

#### Change 1: Build Profile — Add Question 4 (conditional)

Insert after `### Question 3: Score Accuracy` (added by R3), before `### Deferred Section`:

```markdown
### Question 4: Gate Bypass (conditional)

Only ask if `spec-score:` frontmatter value is present AND the score was below the gate threshold (default: 4/6):

**"The spec quality gate showed a score below threshold. Did you proceed anyway, and if so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| Did not bypass — I refined the spec first | `gate-bypassed: false` |
| Bypassed — override was correct (spec was sufficient despite score) | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

If score met or exceeded threshold (no bypass scenario): write `gate-bypassed: false` to frontmatter without asking.
```

#### Change 2: Think Profile — Add Question 3

Insert after `### Question 2: Blind Spots (conditional)` block:

```markdown
### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |
```

#### Change 3: Create Profile — Add Question 3

Insert after `### Question 2: Constraint Adherence (conditional)` block:

```markdown
### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |
```

#### Change 4: Update All Three Profile Templates (Frontmatter)

Add to each profile's template frontmatter:
```
gate-bypassed: [true|false]
bypass-verdict: [correct|should-have-refined|n/a]
```

Add `## Gate Bypass` section to each profile template body:
- Build: after `## Score Accuracy`
- Think: after `## Blind Spots`
- Create: after `## Constraint Adherence`

Content: `[User's answer to Question 4 (Build) or Question 3 (Think/Create), or "Gate not triggered" if score met threshold]`

**Dependencies:** R3 for Build profile Change 1. Think and Create changes are independent.

---

## Cross-Cutting Concerns

### Question Cap Analysis

The evaluate-spawn SKILL.md states a hard cap of 3 questions per profile (including auto-derived scenario coverage). After Phase A+B implementation:

| Profile | Q1 (auto) | Q1 | Q2 | Q3 | Q4 |
|---------|-----------|----|----|----|----|
| Build | Scenario Coverage | Setup Alignment | Gap ID (conditional) | Score Accuracy (R3) | Gate Bypass (R11, conditional) |
| Think | — | Coverage | Blind Spots (conditional) | Gate Bypass (R11) | — |
| Create | — | Constraint Coverage | Constraint Adherence (conditional) | Gate Bypass (R11) | — |

**Build profile cap judgment call:** R11's Q4 is technically a 4th question but fires only when score was below threshold AND a gate bypass occurred. Implementer must decide whether to count conditional questions toward the cap. The spec's stated cap is "at most 2 explicit questions per profile (hard cap: 3 including auto-derived)" — R11's Q4 makes this Q4 conditional to minimize cap conflict. R3 takes explicit priority per spec.

**Recommendation:** Implementer should update the SKILL.md description block to reflect the actual question count (currently says "at most 2 explicit questions" — now 3 explicit for Build). No spec covers this metadata update; add it to the same PR as R3+R11.

### Cold-Start Behavior

R5 retrospective scan uses a cold-start guard (< 3 matching retrospectives → skip). This means:
- Phase B recommendations (R5/R6) produce no output until R4 has increased completion rates enough to accumulate ≥3 retrospectives
- R10 (Phase C) has a higher threshold (10+ retrospectives with score-accuracy data)
- Cold-start guard fires silently — users see `Prior run scan: insufficient data (N/3 sessions)` not an error

### Format Migration (Retrospective Files)

Phase A adds new frontmatter fields to retrospective templates:
- R3 adds `score-accuracy:` to Build profile
- R11 adds `gate-bypassed:` and `bypass-verdict:` to all three profiles
- R7 adds `outcomes-addressed:` to Think profile

**Backward compatibility:** Existing retrospective files without these fields remain valid — the new fields are only written by the updated evaluate-spawn skill, old files are not retroactively modified. R5's scan handles missing fields gracefully (skips non-matching files).

### Protocol Block Sequencing (R2 + R4)

R2 and R4 both modify the Protocol Block in `shutdown-protocol.md`. Applying both independently against the original before-text produces two conflicting replacements. **Apply R2 first, then R4 adds one bullet to R2's output.** The final Protocol Block is shown in the R4 spec above.

### docs/memory.md Update Note

R10 creates a new file (`commands/calibrate-scoring.md`). Per CLAUDE.md, versions must sync across 4 points including `docs/memory.md`. The `/spawn-build` team implementing R10 must also update `docs/memory.md` to add the new command to the plugin's component table.

---

## Validation Checklist

From Risk Analyst cross-validation (task-08):

| Item | Status |
|------|--------|
| BLOCKING-1: R10 sequencing note added (apply R1 before R10 on spec-quality-scoring.md) | RESOLVED in task-09 |
| BLOCKING-2: R11 Build profile fallback added (skip Change 1 if R3 not yet applied) | RESOLVED in task-09 |
| R1 insertion point verified correct (lines 52–55 match spec) | VERIFIED |
| R2 insertion point verified correct (Phase 1 heading at line 15) | VERIFIED |
| R3 Deferred section text matches exactly | VERIFIED |
| R4 Phase 4 text verified correct (lines 48–54) | VERIFIED |
| R5 cold-start guard < 3 threshold matches Critic correction | VERIFIED |
| R7 scope limited to Research+Planning only | VERIFIED |
| R2 effort re-rated Medium | VERIFIED |
| R4 placement in shutdown-protocol.md (not spawn-core.md) | VERIFIED |
| All 5 dependency chains intact | VERIFIED |
| R2 + R4 Protocol Block sequencing noted | NOTED (advisory) |
| R5a + R7 planning-blueprints.md insertion order noted | NOTED (advisory) |
| Question cap: implementer decision required for R11 Q4 | NOTED (advisory) |
| SKILL.md description update for question count | NOTED — add to R3+R11 PR |
| docs/memory.md update for R10 new command | NOTED — add to R10 PR |
