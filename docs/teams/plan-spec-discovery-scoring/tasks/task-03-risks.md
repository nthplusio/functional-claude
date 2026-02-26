# Task 3: Risk Analysis — Dynamic Discovery & Scoring Enforcement

## Summary

**5 risk areas identified. 3 are high severity. Key mitigations needed before implementation.**

---

## Risk 1: Over-Questioning / User Fatigue (HIGH)

### Failure Mode
Ambiguity detection fires on multiple dimensions simultaneously. With up to 10 dynamic questions and max-4-per-batch batching, this yields 3 AskUserQuestion calls before spawning — on top of mode confirmation and sizing approval. Total pre-spawn interactions could reach 5+.

### Specific Scenarios
- Vague input like "build me a dashboard" triggers max ambiguity: goal unclear, constraints unclear, tech stack not mentioned, users not defined, no existing context. All 10 questions fire.
- Each batch of 4 = 3 calls (4 + 4 + 2). User hasn't even seen a team spawned yet.
- User frustration leads to terse answers → worse spec quality than the 3+2 fixed structure.

### Interaction with "Skip Individual"
- Per-question skipping within a batch is correct UX, but the spec needs to define what "skip" means at the batch level.
- If user skips Q2 in a batch of 4, does the follow-up batch know not to re-ask related questions? No deduplication logic is specified.
- Risk: skipped questions reappear reframed in the next batch.

### Mitigation Requirements for Architect
- Hard cap: max 2 AskUserQuestion calls for dynamic questions (8 questions across 2 batches), not 3.
- Deduplication: once a question topic is skipped, mark it as "user-declined" and suppress related follow-ups.
- Specify a minimum ambiguity threshold before adding a 2nd batch (don't fire 2 batches if 4 questions would suffice).

---

## Risk 2: Mode-Specific Question Duplication / Conflict (HIGH)

### Current Extended Question Inventory

| Command | Mode | Extended Qs | Topics |
|---------|------|-------------|--------|
| spawn-build | feature | 2 | existing context, quality bar |
| spawn-build | debug | 1 | reproduction |
| spawn-think | research | 2 | candidate options, depth vs breadth |
| spawn-think | planning | 2 | current state, stakeholders |
| spawn-think | review | 2 | change context, known risk areas |
| spawn-create | design | 2 generic + 2 submode | users, design system + submode |
| spawn-create | brainstorm | 2 | prior attempts, scope boundaries |
| spawn-create | productivity | 2 | pain points, current tools |

### Failure Mode
Dynamic ambiguity detection independently generates questions on "existing context" and "quality bar" — which spawn-build:feature already asks as extended questions. Both paths fire. User is asked effectively the same question twice, from different question sets, potentially in different batches.

### No Merge Logic Defined
The current spec says discovery-interview.md asks core + optional, then commands add extended. If dynamic questions are generated from discovery-interview.md independently of what the command's extended questions will ask, there's no deduplication point.

### Mitigation Requirements for Architect
- Dynamic question generation must be given the mode's full extended question list as context — generate only questions NOT already covered by mode-specific extended questions.
- Ordering must be explicit: core → dynamic → extended, with dedup check before each group.
- Alternative: replace extended questions entirely with dynamic generation (simpler, eliminates duplication but breaks existing commands' designs).

---

## Risk 3: Scoring False Confidence (MEDIUM)

### The 6/6 Trap
A spec can pass all 6 binary dimensions and still be wrong. Examples:
- **Goal:** "Users can export reports as PDF" — specific and observable. But the spec doesn't know the user actually meant "export to Excel."
- **Constraints:** "Uses React 18, PostgreSQL, REST" — 3 constraints named. But no mention of the hard 200ms latency SLA.
- **API accuracy:** Code snippets match library signatures. But the library version in the project differs from the version the spec was written against.

### Scoring Doesn't Validate Content Quality
Binary questions test structural presence, not semantic correctness. A spec that says "Success: button turns green" passes testability check but is useless.

### False Gate Behavior
If scoring shows 5/6 but the missing dimension is Goal Clarity, the user may see "5/6 — looks good" and proceed. The gate logic (threshold=4) won't fire. But 5/6 with a failed Goal dimension is a worse spec than 4/6 with a failed API Accuracy dimension.

### Mitigation Requirements for Architect
- Gate threshold should not be dimension-count-only — consider requiring Goal Clarity as a mandatory pass (fail Goal = block regardless of total score).
- Score display must not imply "looks good" — neutral language: "Score: 5/6. Proceed or refine?"
- Document this limitation explicitly in spec-quality-scoring.md: "6/6 confirms structural completeness, not semantic correctness."

---

## Risk 4: Regression Blast Radius (HIGH)

### Files Affected by Changing discovery-interview.md

| File | Current Dependency | Regression Risk |
|------|-------------------|----------------|
| `commands/spawn-build.md` | Step 4 references discovery-interview.md; extended questions in Step 4 | Extended question ordering breaks if dynamic Qs added in shared file |
| `commands/spawn-think.md` | Step 5 references discovery-interview.md; extended questions per mode | Same |
| `commands/spawn-create.md` | Step 4 references discovery-interview.md; extended questions per mode + submode | Same; most complex — 3 modes × 2 submodes each |
| `shared/spawn-core.md` | Dispatch Step 3 ("Run discovery interview") | Ordering change breaks pipeline description |
| `shared/spec-refinement.md` | Called from discovery-interview.md §Refinement Phase | If interview structure changes, refinement prompt may not receive correct input |
| `shared/scenario-collection.md` | Called from discovery-interview.md §Scenario Collection | Same dependency |
| `shared/spec-quality-scoring.md` | Called from discovery-interview.md §Quality Scoring | Score dimensions currently say "5 dimensions" (line 97 of discovery-interview.md) but scoring file defines 6 — already a discrepancy |

### Pre-Existing Discrepancy (Found During Analysis)
`discovery-interview.md` line 97 states: "Scoring evaluates **5 dimensions** of spec completeness." `spec-quality-scoring.md` defines **6 dimensions**. This inconsistency exists today and will need to be fixed in the same release.

### Mitigation Requirements
- Update line 97 of discovery-interview.md to say "6 dimensions" in the same PR.
- Review spec-refinement.md and scenario-collection.md before implementation — they are called by discovery-interview.md and may have interface dependencies on question numbering.
- Test matrix: for each of 8 modes across 3 commands, verify question count + ordering after changes.

---

## Risk 5: AskUserQuestion Batch Overflow (MEDIUM)

### The 7-Question Problem
If ambiguity detection yields 7 follow-ups: batch 1 = 4, batch 2 = 3. That's 2 calls for dynamic questions alone, before mode-specific extended questions fire as a 3rd call.

### No Priority Ordering Defined
The spec doesn't say which dynamic questions are highest priority. If the user skips or the conversation context limits are hit, lower-priority questions drop silently. The spec doesn't define which dimensions to sacrifice first.

### Race Condition with Adaptive Skip Logic
Current `discovery-interview.md` says: "If `$ARGUMENTS` answers 2+ core questions, skip those." Dynamic question generation presumably also reads `$ARGUMENTS`. But there's no defined sequencing — does adaptive skip run before or after dynamic question generation? If after, the skip check may flag questions as already-answered that were never asked (because they were dynamically generated, not part of the fixed set).

### Mitigation Requirements for Architect
- Define question priority tiers: P1 (always ask if not answered), P2 (ask if under batch limit), P3 (skip if batches full).
- Adaptive skip logic must run BEFORE dynamic question generation — treat `$ARGUMENTS` as pre-answered context that constrains what dynamic questions to generate.
- Define explicit overflow behavior: if >8 questions remain after skip filtering, truncate to 8 (2 batches max) using priority order.

---

## Risk Matrix

| Risk | Severity | Likelihood | Blocking? |
|------|----------|------------|-----------|
| Over-questioning / fatigue | HIGH | HIGH | Yes — needs max batch cap before implementation |
| Mode-specific duplication | HIGH | HIGH | Yes — needs dedup contract before architect designs dynamic questions |
| Scoring false confidence | MEDIUM | MEDIUM | No — mitigatable via language/documentation |
| Regression blast radius | HIGH | MEDIUM | Yes — needs pre-existing 5→6 discrepancy fix |
| AskUserQuestion overflow | MEDIUM | MEDIUM | No — mitigatable via priority tiers |

---

## Constraints for Architect (Binding)

1. **Max 2 dynamic-question batches** (8 questions). Not 3.
2. **Dynamic question generation must be given the mode's extended question list** to avoid duplication.
3. **Adaptive skip (`$ARGUMENTS` parsing) runs before dynamic question generation**, not after.
4. **Fix the 5-dimension / 6-dimension discrepancy** in discovery-interview.md as part of this release.
5. **Goal Clarity dimension should be treated as mandatory** or at least surfaced distinctly when it fails, regardless of total score.
6. **Define question priority tiers** (P1/P2/P3) so overflow truncation is deterministic.
