# Risk Analyst Assessment: Dynamic Discovery & Scoring Enforcement

*References: task-01-dynamic-discovery-design.md, task-02-scoring-enforcement-design.md*

---

## Executive Summary

**5 risks identified. 3 are HIGH severity and need mitigation before implementation.**

The architect's designs (tasks 1 and 2) are well-structured but introduce new risks at the integration seams. The most critical: the multi-batch re-evaluation loop in task 1 can produce 3 AskUserQuestion calls in a single pre-spawn flow, and the dynamic question algorithm has no explicit deduplication contract with mode-specific elective questions.

---

## Risk 1: Over-Questioning / User Fatigue (HIGH)

### Failure Mode

The architect's algorithm (task 1, §Adaptive Logic Flowchart) specifies up to 3 batches:
- Batch 1: up to 4 required questions
- Batch 2: remaining required + conditional (up to 4)
- Batch 3: elective only (up to 2)

A vague input like "build me a dashboard" missing all 6 dimensions triggers all 3 batches. Combined with mode confirmation and sizing approval, pre-spawn interaction rounds reach 5+. Each round has latency and context-switching cost.

### Evidence from Architect's Design

Task 1 flowchart states "Batch 3 (up to 2): elective only, if still below 10 and dimensions still missing." This means elective questions fire even after two rounds of required/conditional. For a user who gave a vague description and answered everything in batches 1 and 2, batch 3 is pure overhead.

### Interaction with "Skip Individual"

- Leaving an answer blank = proceed without (task 1 §Skip Semantics). Good.
- But blank answers in batch 1 don't suppress related electives in batch 3. A user who skipped Q-edge in batch 1 may see an elective edge-case question in batch 3.
- No suppression logic is defined for topic-level deduplication across batches.

### Mitigation

- **Hard cap: 2 batches max** (8 questions). Remove batch 3 electives from the algorithm. Elective questions only fire if required+conditional total < 4 (i.e., they fill space in batches 1-2, not add a 3rd round).
- **Suppress electives on skipped topics:** if Q-edge was blank in batch 1, no elective edge-case question in batch 2.
- Amend task 1 flowchart to remove the "Batch 3" branch.

---

## Risk 2: Mode-Specific Elective Question Duplication (HIGH)

### Current Extended Question Inventory

| Command | Mode | Extended Topics |
|---------|------|----------------|
| spawn-build | feature | existing context, quality bar |
| spawn-build | debug | reproduction |
| spawn-think | research | candidate options, depth vs breadth |
| spawn-think | planning | current state, stakeholders |
| spawn-think | review | change context, known risk areas |
| spawn-create | design | users, design system + submode (2-4 questions) |
| spawn-create | brainstorm | prior attempts, scope bounds |
| spawn-create | productivity | pain points, current tools |

### Failure Mode

Task 1 says: "Command-specific elective questions — maintain existing extended question tables in spawn commands, just reclassify them as elective." This creates a layered pool: universal questions (Q-goal through Q-api) + command electives.

But the universal pool already covers "existing context" (maps to APIAccuracy) and "quality bar" (maps to Constraints). The command-specific electives for spawn-build feature mode ask about the same topics. With no deduplication, both fire.

Example for spawn-build feature mode + vague input:
1. Batch 1 fires Q-constraints (universal required) — "What are the non-negotiables?"
2. After re-scoring, Q-api fires (conditional) — "Which libraries/APIs are in scope?"
3. Batch 2 includes elective "Existing context" — "What related code already exists?"
4. Batch 2 also includes elective "Quality bar" — "What matters most: correctness, performance, UX?"

Questions 1 and 3 overlap (constraints + existing context both probe the same space). Questions 2 and 4 overlap similarly. User answers four questions covering two distinct topics.

### Mitigation

- Dynamic question generation must receive the mode's elective list before selecting universal questions — treat elective topics as pre-reserved dimensions.
- Alternatively (cleaner): **merge** the mode-specific extended questions into the universal question pool as electives. Don't maintain two parallel lists.
- Task 1 §Spawn Command Changes should specify: "If elective Q covers the same dimension as a universal Q, suppress the universal Q and use the mode-specific phrasing instead."

---

## Risk 3: Scoring False Confidence (MEDIUM)

### The 6/6 Trap

Task 2's enforcement design is correct — it ensures the score is computed dimension-by-dimension with binary questions, not impressionistically. But passing all 6 dimensions still doesn't mean the spec is semantically correct:

- **Goal (✓):** "Users can export reports as PDF." Specific and observable — passes. But user meant Excel.
- **Constraints (✓):** "React 18, PostgreSQL, REST — 3 constraints named." Passes. But the latency SLA isn't captured.
- **API Accuracy (✓):** Snippets match library signatures. Passes. But library version in project differs from spec's version.

### Dimension Criticality Is Unequal

The gate logic (default threshold: 4) treats all dimensions as equivalent. A spec that fails Goal Clarity but passes 5 others (score: 5/6) clears the gate. A spec that fails API Accuracy and passes 5 others also clears the gate. But failing Goal Clarity is categorically worse — the team will build the wrong thing. Failing API Accuracy leads to post-build type errors, which are recoverable.

### Task 2 Doesn't Address This

The enforcement design (task 2) mandates correct format and binary answers but doesn't weight dimensions. The gate is count-only.

### Mitigation

- **Flag Goal Clarity as mandatory:** If Goal dimension fails, surface it distinctly regardless of total score. Suggested language: "Warning: Goal dimension failed — team may build the wrong thing. Strongly recommended to refine before spawning."
- **Add a documentation note** to spec-quality-scoring.md: "6/6 confirms structural completeness, not semantic correctness. The rubric tests whether a spec gives the build team what they need — not whether the spec accurately reflects the user's intent."
- Do NOT change the gate threshold — that would require recalibration. The warning approach is targeted.

---

## Risk 4: Regression Blast Radius (HIGH)

### Files That Change and Their Dependents

| File Modified | Dependents | Regression Risk |
|--------------|-----------|----------------|
| `shared/discovery-interview.md` | spawn-build, spawn-think, spawn-create, spec-refinement.md (called from it), scenario-collection.md (called from it) | HIGH — all spawn commands reference it by name |
| `shared/spec-quality-scoring.md` | spawn-build §Step 5, spawn-think §Step 6, spawn-create §Step 6, discovery-interview.md §Quality Scoring | MEDIUM — format change is additive |
| `commands/spawn-build.md` | spawn-core dispatch description | LOW |
| `commands/spawn-think.md` | spawn-core dispatch description | LOW |
| `commands/spawn-create.md` | spawn-core dispatch description | LOW |
| `shared/spawn-core.md` | All 3 spawn commands, doc references | LOW (additive only per task 2) |

### Pre-Existing Discrepancy (Found in Both Tasks 1 and 2)

`discovery-interview.md` line 97 says **"5 dimensions"** — `spec-quality-scoring.md` defines **6 dimensions**. Both architect tasks noted this. It must be fixed in the same PR. Risk: if left unfixed, the new enforcement in task 2 would be contradicted by the shared file that calls it.

### spec-refinement.md Integration Risk

`discovery-interview.md` §Refinement Phase currently calls `shared/spec-refinement.md`. Task 1 proposes to **fold refinement into the adaptive batching** and remove the refinement call. This is a breaking change to spec-refinement.md's invocation contract. If spec-refinement.md is referenced anywhere else (other commands, agents), those references break silently.

**Action needed before implementation:** grep for all references to `spec-refinement.md` across the plugin.

### Scenario Collection Risk

`discovery-interview.md` §Scenario Collection calls `shared/scenario-collection.md`. Task 1 says "Preserve: Scenario collection (unchanged)." This is safe if the call site in discovery-interview.md remains at the same position in the flow. But if the section numbering or flow ordering changes (e.g., refinement phase removed), the scenario collection trigger may reference outdated context.

### Mitigation

- Grep for `spec-refinement.md` before removing its call — confirm no other references.
- Integration test plan: for each of 8 modes across 3 commands, verify end-to-end flow produces correct question set and score format.
- Fix the 5→6 dimension count in the same commit as other changes.

---

## Risk 5: AskUserQuestion Batch Overflow and Skip Ordering (MEDIUM)

### The 7-Question Problem

Architect's algorithm (task 1) handles overflow by truncating to 10 total questions across up to 3 batches. With the recommended hard cap of 2 batches (see Risk 1 mitigation), max = 8 questions. But the algorithm doesn't specify what to do if 9 questions are generated after filtering:

- Required: 6 (all dimensions missing) = two full batches of 4 and 2 — barely fits in 2 batches if split right
- But adding any electives pushes over 8

The algorithm says "add elective questions up to max 10" but the 2-batch cap limits to 8. These two constraints are in tension.

### Adaptive Skip Ordering Gap

Current discovery-interview.md §Adaptive Skip Logic says: parse `$ARGUMENTS` for explicit answers, skip already-answered questions. Task 1's algorithm starts with "Parse `$ARGUMENTS` → Score 6 dimensions" — this is the same step. Good.

But the scoring rubric uses binary yes/no (answered/missing). `$ARGUMENTS` may contain partial answers. Task 1 adds a "partial" state, but the original skip logic has no partial concept — it only skips questions if answered. Partial answers will be re-asked even if the user already gestured at the topic.

Example: user writes "build an export feature, should be fast" — this partially addresses the Constraints dimension (performance mentioned, but no specifics). Old skip logic: ask Constraints. New algorithm with partial state: ask Constraints with a follow-up scope. This is correct behavior, but the follow-up needs to reference the partial answer or it reads as ignoring what the user said.

### Mitigation

- **Resolve batch cap vs question count tension:** With 2-batch hard cap, max questions = 8. Set elective pool to max 2 (fill remaining batch-2 slots after required+conditional). This collapses "max 10 questions" to "max 8 questions with prioritized selection."
- **Partial answer acknowledgment:** When asking about a dimension with a partial answer, prefix the question with "You mentioned [X] — to refine: [question]." This prevents the question from feeling like the user's answer was ignored.

---

## Validation of Architect's Design Choices

| Design Choice | Risk Assessment |
|--------------|----------------|
| Ambiguity scoring reusing 6 spec dimensions | SOUND — tight coupling between discovery and scoring is a feature |
| Re-scoring after each batch | SOUND — prevents unnecessary follow-up questions |
| Folding spec-refinement.md into batching | RISK — breaks existing call contract; needs grep check |
| Reclassifying extended questions as electives | RISK — duplication with universal questions without dedup contract |
| Scoring enforcement in each spawn command | SOUND — correct fix for issue #16 |
| Adding Scoring Invariant to spawn-core.md | SOUND — good place for cross-command contract |
| Keeping 6 dimensions unchanged | SOUND — enforcement, not revision |

---

## Binding Constraints for Implementation

1. **Max 2 AskUserQuestion batches** (8 questions max). No batch 3 for electives.
2. **Elective questions must be deduplicated against universal questions** before selection — treat elective topics as pre-reserved.
3. **Partial answers must be acknowledged** in follow-up question phrasing.
4. **Grep for `spec-refinement.md` references** before removing the call from discovery-interview.md.
5. **Fix 5→6 dimension count** in discovery-interview.md line 97 in the same commit.
6. **Goal Clarity dimension failure** must produce a distinct warning even when total score >= threshold.
7. **Batch cap and question count max must be reconciled** — recommend: max 8 questions (not 10), elective pool max 2.
