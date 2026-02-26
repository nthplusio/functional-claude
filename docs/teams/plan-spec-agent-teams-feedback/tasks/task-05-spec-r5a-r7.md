---
task: 5
title: "Spec R5a + R7 — Lessons Applied Section and Expected Outcomes (Research+Planning)"
owner: protocol-designer
team: plan-spec-agent-teams-feedback
date: 2026-02-22
recommendations: [R5a, R7]
phase: B
gaps: [G5, G3]
effort: Medium (R5a), High (R7)
confidence: Medium (R5a), Medium (R7)
files-modified:
  R5a: [shared/planning-blueprints.md, commands/spawn-build.md]
  R7: [shared/discovery-interview.md, commands/spawn-think.md, skills/evaluate-spawn/SKILL.md]
dependencies:
  R5a: R5 (retrospective scan — provides data source)
  R7: none
---

# Spec R5a — Lessons Applied Section in Spawn Prompt Templates

## Summary

Adds a `### Lessons Applied` subsection to Planning Context templates in `shared/planning-blueprints.md` and the Feature Context in `commands/spawn-build.md`. The Lead populates this from the R5 retrospective scan before dispatching the team. Gives G5 (static team composition — AAR improvements never reach blueprints) a human-in-the-loop path without requiring blueprint automation.

**Important:** R5a depends on R5 (retrospective scan) for its data source. If R5 is not implemented, the `### Lessons Applied` section will have no data to populate and should be omitted. Spec the section now so the template slot is ready when R5 ships.

**Gap addressed:** G5 partially — provides a concrete action path for the Lead to apply prior AAR plugin-scope improvements as explicit context to the new team.

---

## Files Modified (R5a)

| File | Change Type |
|------|-------------|
| `shared/planning-blueprints.md` | Add `### Lessons Applied` to Planning Context Template |
| `commands/spawn-build.md` | Add `### Lessons Applied` to Feature Context block |

---

### File 1: `shared/planning-blueprints.md`

#### Current Planning Context Template (lines 5–33)

```
## Planning Context Template

All modes use this structure (replace bracketed placeholders with actual interview content):

```
## Planning Context

### Objective
[What we're planning, desired end state]

### Current State
[What exists today]

### Constraints
[Non-negotiables]

### Stakeholders
[Decision makers, affected parties]

### Success Definition
[How success is measured]

### Additional Context
[Mode-specific extended question answers]

### Project Analysis
[Findings from codebase/document analysis]
```
```

#### Insertion point

Add `### Lessons Applied` after `### Project Analysis` in the Planning Context Template.

**Exact text to insert AFTER:**
```
### Project Analysis
[Findings from codebase/document analysis]
```

**Content to insert:**
```
### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]
```

---

### File 2: `commands/spawn-build.md`

#### Current Feature Context block (lines 160–182 in the feature mode spawn prompt)

```
## Feature Context

### Goal
[What the feature does, user-facing behaviors]

### Tech Constraints
[Libraries, patterns, architectural constraints to follow]

### Product Constraints
[Non-negotiables — budget, timeline, scope boundaries]

### Acceptance Criteria
[Must-have behaviors, definition of done]

### Existing Context
[Related code, prior work, specs, design docs, project analysis findings]

### Quality Priority
[Correctness vs performance vs UX polish vs shipping speed]

### Acceptance Scenarios
[Behavioral scenarios from `docs/scenarios/[feature-slug].md` — user's pre-spawn definition of correct behavior. If scenarios were skipped, note "Scenarios not collected".]
```

#### Insertion point

Add `### Lessons Applied` after `### Acceptance Scenarios` in the Feature Context.

**Exact text to insert AFTER:**
```
### Acceptance Scenarios
[Behavioral scenarios from `docs/scenarios/[feature-slug].md` — user's pre-spawn definition of correct behavior. If scenarios were skipped, note "Scenarios not collected".]
```

**Content to insert:**
```
### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this feature spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]
```

---

## Acceptance Criteria (R5a)

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | `### Lessons Applied` subsection exists in Planning Context Template | Read `shared/planning-blueprints.md` |
| 2 | `### Lessons Applied` subsection exists in Feature Context in spawn-build | Read `commands/spawn-build.md` |
| 3 | Both sections include "omit if no data" instruction | Instruction present in placeholder text |
| 4 | Format guidance (1–3 bullets, "Prior run found:") is specified | Placeholder text contains format |
| 5 | Section is correctly positioned (after Project Analysis / after Acceptance Scenarios) | Confirm heading order in each file |

## Edge Cases (R5a)

| Scenario | Handling |
|----------|----------|
| R5 not yet implemented | Section placeholder is present in template but Lead omits it (as instructed in placeholder text) |
| R5 returns data but none is relevant to this spawn type | Lead omits section — relevance is Lead's judgment call |
| R5 returns more than 3 bullets | Lead selects most relevant 3. Hard limit prevents context bloat |
| Lessons Applied contradicts current spec direction | Lead resolves conflict before spawning — this is the human-in-the-loop moment the section is designed for |

## Dependencies (R5a)

- **R5 (retrospective scan):** Prerequisite for populating the section. R5a template slot can ship before R5.
- **No other dependencies.**

---
---

# Spec R7 — Expected Outcomes for Research and Planning Spawns

## Summary

Adds an `### Expected Outcomes` compilation step to the discovery interview for Research and Planning spawn modes only (Design/Brainstorm/Productivity deferred per Critic scope reduction). The Lead compiles Expected Outcomes from the discovery interview and writes them to the Context block before spawning. The evaluate-spawn Think profile adds one validation question checking whether the output addressed the pre-defined Expected Outcomes.

**Scope constraint (Critic correction):** Research and Planning modes only. Six-mode coverage was rated over-engineered. Design/Brainstorm/Productivity deferred — add them in a follow-on if the two-mode pattern proves valuable.

**Gap addressed:** G3 — Think/create spawns have no pre-spawn definition of done.

---

## Files Modified (R7)

| File | Change Type | Role |
|------|-------------|------|
| `shared/discovery-interview.md` | Add Expected Outcomes compilation step | Primary — defines when/how to compile |
| `commands/spawn-think.md` | Add `### Expected Outcomes` to Research and Planning Context blocks | Two locations within the file |
| `skills/evaluate-spawn/SKILL.md` | Add validation question to Think profile | Checks output against pre-spawn outcomes |

---

### File 1: `shared/discovery-interview.md`

#### Insertion point: After Scenario Collection section, before "When to Include"

**Exact text to insert AFTER:**
```
**Skip:** User can type "skip". Skipping means no scenario file is created and quality scoring penalizes the acceptance criteria dimension.
```

**Content to insert:**

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

---

### File 2: `commands/spawn-think.md`

Two insertions required: one in the Research Context block, one in the Planning Context.

#### Insertion 1: Research Context (Technology Evaluation team)

**Current Research Context block (lines 189–191):**
```
## Research Context
[Compiled interview results]
```

**Replace with:**
```
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

**Note:** The Research Context block in spawn-think.md is currently a bare placeholder (`[Compiled interview results]`). The expansion above aligns it with the structured format used in Planning Context in `shared/planning-blueprints.md`. This is a necessary side-effect of adding Expected Outcomes — the section needs a home in an explicit structure.

#### Insertion 2: Planning Context

Planning Context is sourced from `shared/planning-blueprints.md` via the R5a change above (which adds `### Lessons Applied` after `### Project Analysis`). Add `### Expected Outcomes` after `### Lessons Applied` in the Planning Context Template.

**In `shared/planning-blueprints.md`, after the R5a insertion:**

**Exact text to insert AFTER:**
```
### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]
```

**Content to insert:**
```
### Expected Outcomes
[From Expected Outcomes compilation step — Phase count, feasibility constraint, stakeholder success definition, out of scope. Omit section if user skipped or mode is not Research/Planning.]
```

---

### File 3: `skills/evaluate-spawn/SKILL.md`

#### Current Think Profile (lines 93–120)

The Think Profile has:
- Question 1: Coverage ("Did the team investigate the right questions and areas?")
- Question 2: Blind Spots (conditional on Q1 not "Yes")

#### Change: Add Expected Outcomes validation as Question 1a (conditional)

Insert after the existing Question 1 option table, before Question 2:

**Exact text to insert AFTER:**
```
| No — wrong focus | The team spent effort on the wrong areas |
```

**Content to insert:**

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

#### Also update the Think Profile Template

**Current template (lines 189–210):**
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: think
type: [research|planning|review]
spec-score: "not scored"
scenario-coverage: "N/A"
---

# Retrospective: [team-name]

## Coverage
[User's answer to Question 1]

## Blind Spots
[User's answer to Question 2, or "No blind spots identified" if Q1 was "Yes"]

## Actionable Insights
[1-3 bullet points...]
```

**Replace frontmatter only (add `outcomes-addressed` field):**

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: think
type: [research|planning|review]
spec-score: "not scored"
scenario-coverage: "N/A"
outcomes-addressed: [all|partial|none|"N/A — no Expected Outcomes defined"]
---
```

**Add `## Expected Outcomes` section after `## Coverage`:**

```markdown
## Expected Outcomes Validation
[User's answer to Question 1a, or "N/A — no Expected Outcomes section in team context" if Q1a was skipped]
```

---

## Acceptance Criteria (R7)

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | `discovery-interview.md` has Expected Outcomes compilation step | Section exists for Research and Planning modes, not for others |
| 2 | Research mode format (decision question, options, confidence, OOS) is present | Check `discovery-interview.md` Research Mode Format block |
| 3 | Planning mode format (phase count, constraint, stakeholder, OOS) is present | Check `discovery-interview.md` Planning Mode Format block |
| 4 | Research Context in `spawn-think.md` has `### Expected Outcomes` subsection | Check file |
| 5 | Planning Context Template in `planning-blueprints.md` has `### Expected Outcomes` subsection | Check file |
| 6 | Think profile evaluate-spawn has Question 1a (conditional, only when section present) | Check `SKILL.md` |
| 7 | `outcomes-addressed` frontmatter field added to Think profile template | Check template in `SKILL.md` |
| 8 | `## Expected Outcomes Validation` section added to Think profile retrospective template | Check template in `SKILL.md` |
| 9 | Design/Brainstorm/Productivity modes are explicitly skipped | "Skip for" instruction present in `discovery-interview.md` |
| 10 | User skip path is defined (no silent omission) | Skip instruction present in `discovery-interview.md` |

---

## Edge Cases (R7)

| Scenario | Handling |
|----------|----------|
| Research spawn with no candidate options provided | Use "options: TBD — determine from research" as placeholder. Prevents blocking spawn on incomplete Expected Outcomes. |
| Planning spawn with no stakeholder defined | Use "stakeholder: [user]" as default. Never leave field empty. |
| User skips Expected Outcomes compilation | Omit `### Expected Outcomes` section. evaluate-spawn Question 1a is also skipped (no section = no check). |
| Team's output partially addresses decision question | Option (Partially) is available in Q1a. `outcomes-addressed: partial` written to frontmatter. |
| Expected Outcomes written for Review mode by mistake | `discovery-interview.md` explicitly lists Review in "Skip for" — Lead should not have compiled it. If present anyway, evaluate-spawn still checks it (no harm done). |
| Expected Outcomes section is in context but all outcomes were addressed | Q1a: "Yes — all outcomes addressed." No additional questions. Positive signal captured. |
| R7 ships before R5a | R7 adds `### Expected Outcomes` after `### Project Analysis` in Planning Context. R5a later adds `### Lessons Applied` between them. The final sequence: Project Analysis → Lessons Applied → Expected Outcomes. Spec each insertion point relative to the section before it (not an absolute line number) to avoid conflicts. |

---

## Dependencies (R7)

- **R5 (retrospective scan):** Not required. R7 is independent. R5a's template slot can co-exist with R7's slot without conflict.
- **R5a:** Must coordinate `### Expected Outcomes` placement with R5a's `### Lessons Applied` insertion. If implementing both in the same PR, correct final order is: `### Project Analysis` → `### Lessons Applied` → `### Expected Outcomes`.
- **Deferred modes:** Design/Brainstorm/Productivity Expected Outcomes formats can be added in a follow-on after the two-mode pattern is validated. No changes to Create profile evaluate-spawn needed until those modes are added.
