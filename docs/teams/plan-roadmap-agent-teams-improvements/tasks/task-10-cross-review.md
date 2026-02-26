# Task 10: Cross-Review — Roadmap Coherence Validation

## Overall Verdict

**The roadmap is coherent and ready for compilation.** No strategic misalignments, ordering errors, or unachievable criteria were found. Three minor clarifications noted below — none block Task 11.

---

## Strategic Objectives ↔ Phase Structure

**Alignment check: Pass**

| Strategic Objective (Task 1) | Phase That Addresses It | Coverage |
|---|---|---|
| Eliminate "garbage in, garbage out" spawn cycles | Phase 1: Scoring + Refinement | Complete |
| Surface edge cases before spawning | Phase 1: Refinement Phase | Complete |
| Create independent behavioral validation signal | Phase 1: Scenario Validation | Complete |
| Catch AI-specific code failure modes | Phase 2: Review Checklist | Complete |
| Build compounding cross-session asset base | Phase 2: Evaluation + Mock Repo + Phase 3: ADRs | Complete |
| Self-improve spec quality over time | Phase 2: Post-Spawn Evaluation | Complete |
| Reinforce architect role framing | Phase 3: Insight Embedding | Complete |

No strategic objective is unaddressed. The compounding chain from Task 1 (Scoring → Refinement → Higher specs → Better outputs → Less rework) maps directly to Phase 1's internal sequence.

---

## Dependency Ordering ↔ Phase Sequencing

**Alignment check: Pass with one clarification**

Task 3's dependency matrix is consistent with the final phase sequencing in Task 6:
- Refinement before Scoring: correctly maintained (scoring's edge-case dimension needs refinement data)
- Scoring before Scenarios: correctly maintained (scenarios are more meaningful with a quality-gated spec)
- AI Review Checklist before Evaluation: correctly maintained (checklist defines quality dimensions the evaluation uses)
- Mock Repository as Phase 2 parallel: correctly maintained (no hard deps on other Phase 2 improvements)

**Clarification needed:** Task 3 lists Specification Quality Scoring as having no dependencies ("bootstrappable immediately") and Refinement Phase as depending on Scoring. Task 4 and the user-confirmed gate reversed this order (Refinement ships first). This inversion is correct — the Task 3 dependency analysis was superseded by the stakeholder decision that refinement provides the data that makes scoring meaningful. Task 11 should reflect the user-confirmed order (Refinement → Scoring), not Task 3's original ordering.

---

## Success Criteria ↔ Stakeholder Needs

**Alignment check: Pass**

Task 2 identified these as the highest-friction points:
1. No signal on spec completeness before spawning → addressed by 1b (scoring gate)
2. Tester interprets prose acceptance criteria → addressed by 1c (external scenarios)
3. Edge cases surface mid-implementation → addressed by 1a (refinement questions)
4. AI-specific code failure modes go unchecked → addressed by 2a (review checklist)
5. Each session isolated; no learning accumulation → addressed by 2b (evaluation skill)

Task 2 also flagged that System-Level Documentation and J-curve insights are lower value for solo developer. Phase 3 correctly treats these as opt-out (ADRs via `--skip-adr`) and language changes (not behavior changes). Alignment is good.

---

## Phase Independence Validation

**Check: Pass**

Each phase survives independently:
- **Phase 1 alone:** Complete pre-spawn quality loop. All three improvements (1a, 1b, 1c) are tightly coupled but all ship together as v0.16.0. Value is high even if Phase 2 never ships.
- **Phase 2 alone:** AI Review Checklist is independently valuable. Evaluation has lower value without Phase 1 scoring data but is still a functional retrospective tool. Mock Repository is fully independent.
- **Phase 3 alone:** ADRs accumulate decision history without Phase 1 refinement output (content will be thinner but not absent). Insight Embedding is language changes with no Phase 1/2 dependency.

---

## Success Criteria Achievability

**Check: Pass with two clarifications**

**1. Scoring binary-checkability requirement (1b):**
The refined criteria require each scoring dimension to use a binary-checkable question. Implementation must define these questions explicitly in `shared/spec-quality-scoring.md` — not leave them to be generated at runtime. Task 11's Phase 1b brief should specify that the rubric file contains the exact binary questions, not a description of scoring philosophy.

**2. Evaluation rubric update trigger (2b):**
Criteria state "after 3+ evaluations, rubric reflects at least one change." This is not automatically enforced — it requires Seth to read evaluation data and make the update. Task 11 should note that rubric updates are manual (Seth reviews `docs/retrospectives/` periodically) not automated. The skill produces input; the rubric update is a human step.

---

## /spawn-build Passability Check

**Check: Pass for Phase 1 and 2; Conditional Pass for Phase 3**

Each improvement has specific enough acceptance conditions to serve as a `/spawn-build --mode feature` spec:
- File paths named explicitly (`shared/spec-quality-scoring.md`, `docs/scenarios/[slug].md`, etc.)
- Implementation mechanism described (binary-checkable questions, Given/When/Then format, 3-question hard cap)
- Testable behaviors specified per improvement
- Before/after contrast clearly defined

**Phase 3 condition:** 3b (Insight Embedding) acceptance conditions reference specific language changes but don't specify which exact questions in `discovery-interview.md` to modify. Task 11's Phase 3 brief should note that implementation requires reading the current discovery interview questions before editing — the brief can't specify the exact lines without reading the current file. This is standard for language refinements and doesn't block passability.

---

## Final Checklist

- [x] Strategic objectives map to phases — all covered
- [x] Phase sequence matches confirmed dependency order (Refinement → Scoring → Scenarios)
- [x] Each phase delivers value independently
- [x] Success criteria are binary-verifiable (after Task 8/9 refinements)
- [x] Post-Spawn Evaluation correctly placed in Phase 2, implemented as skill
- [x] ADR model changed to opt-out — confirmed coherent with "documentation as asset" objective
- [x] No stakeholder friction points are unaddressed
- [x] Breaking changes OK — no backward-compatibility constraints found

## Clarifications for Task 11 (Compilation)

1. Phase ordering in briefs: use user-confirmed order (Refinement → Scoring), not Task 3's original ordering
2. Phase 1b brief: specify that binary-checkable questions must be defined statically in `shared/spec-quality-scoring.md`
3. Phase 2b brief: note that rubric updates from retrospective data are manual, not automated
4. Phase 3b brief: note that implementation requires reading current discovery-interview.md before editing
