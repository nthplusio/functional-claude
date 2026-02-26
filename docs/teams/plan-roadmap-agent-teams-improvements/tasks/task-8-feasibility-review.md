# Task 8: Feasibility Review — Assumptions Challenged, Risks Flagged

## Summary Verdict

The roadmap is implementable. No phase contains an unsolvable technical blocker. The primary risks are effort underestimation in Phase 1, user behavior dependency in Phase 2, and diminishing returns in Phase 3. Specific mitigations follow.

---

## Phase 1 Feasibility: Spec-to-Spawn Quality Loop

### 1a. Specification Refinement Phase

**Assumption being challenged:** "Claude will generate 2–4 targeted, non-boilerplate refinement questions from the compiled spec."

**Risk: Medium.** Claude's refinement questions may be generic unless the prompt is carefully engineered. A vague feature spec might produce "What error handling do you need?" rather than "What happens when the user's session expires mid-save?" Generic questions provide no more value than a fixed question list.

**Mitigation:** The refinement prompt must include the compiled spec as context AND instruct Claude to generate questions specific to the domain and constraints mentioned. Test with deliberately vague specs during implementation.

**Assumption challenged:** "Refinement is low effort (cheapest improvement)."

**Reality:** Refinement requires: (a) a new section in `discovery-interview.md`, (b) a new `shared/spec-refinement.md` with the prompt engineering for targeted questions, (c) integration with scoring so a skip penalizes the score. This is 3 file changes with non-trivial prompt engineering. Still lowest effort in Phase 1 — but not trivial.

---

### 1b. Specification Quality Scoring

**Assumption being challenged:** "Scoring can evaluate spec quality by reading the compiled Feature Context section."

**Risk: High.** Claude reading its own output and scoring it creates a feedback loop problem — Claude may score favorably what Claude generated. A spec that sounds complete but is functionally vague may score 80/100 because the language is fluent. Scoring fluency is not the same as scoring completeness.

**Mitigation:** Scoring prompt must evaluate specific, verifiable properties:
- Goal clarity → "Does the goal statement include a measurable outcome? (e.g., 'users can do X' not 'improve X')"
- Constraints → "Are at least 2 technical or behavioral constraints named explicitly?"
- Edge cases → "Are at least 2 non-happy-path scenarios enumerated?"
- Acceptance criteria → "Is there at least 1 testable acceptance criterion?"

Dimension questions must be binary-checkable, not impressionistic.

**Assumption challenged:** "Default threshold of 60 is the right gate."

**Reality:** Without retrospective data (Phase 2), the threshold is arbitrary. A threshold that's too high blocks too many valid spawns. Too low and it becomes a rubber stamp. Mitigation: make the threshold configurable from day one; default to 60; Phase 2 evaluation calibrates it empirically.

---

### 1c. External Scenario Validation

**Assumption being challenged:** "Scenarios written during discovery will still be valid at review time."

**Risk: Medium.** Feature scope shifts during implementation. A scenario written before spawn may become invalid (the feature was descoped) or incomplete (new edge cases emerged). If the Tester validates against outdated scenarios, it may pass scenarios that no longer reflect the real spec.

**Mitigation:** Tester should be instructed to flag scenarios that no longer apply, not just pass/fail them. Add a "Scenario Notes" section to the Tester output: "Scenario 3 was not validated — feature was descoped to exclude admin role."

**Assumption challenged:** "Scenarios will be written in Given/When/Then format by Seth during discovery."

**Reality:** This requires Seth to understand behavioral testing format well enough to write meaningful scenarios under time pressure during a discovery session. If scenarios are vague ("Given a user, when they log in, then it works"), they provide no holdout value.

**Mitigation:** Discovery interview prompt must provide 1 concrete example scenario and prompt Seth to write in the same format. Lower the bar to "2 scenarios minimum, not perfect format."

---

### Phase 1 Overall Risk

**Effort is larger than individual improvements suggest.** Phase 1 touches `shared/discovery-interview.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, and adds 3 new shared files. Any single file being wrong can break the full pre-spawn flow. The improvements are tightly coupled in the execution path — refinement feeds scoring feeds scenarios — so a bug in refinement breaks the scoring input.

**Mitigation:** Treat 1a (Refinement) as the only Phase 1 anchor release. 1b and 1c can be point releases after validation. This also allows the threshold (1b) to be tuned before it gates production sessions.

---

## Phase 2 Feasibility: Output Quality + Feedback Loop

### 2a. AI-Code Review Checklist

**Assumption being challenged:** "The Quality Reviewer will apply the checklist systematically across all code."

**Risk: Low-Medium.** A long checklist injected into a reviewer's task instructions may be applied selectively — reviewers may pattern-match to obvious findings and miss subtler ones (e.g., redundant validation is harder to spot than hallucinated imports).

**Mitigation:** Checklist items should each include a search pattern: "Check for: imports of packages not in package.json" rather than just "Look for hallucinated dependencies." Actionable search instructions produce consistent findings.

**Low feasibility risk overall:** This is a prompt addition to an existing role. No architectural changes.

---

### 2b. Post-Spawn Workflow Evaluation

**Assumption being challenged:** "Seth will voluntarily run `/evaluate-spawn` after sessions."

**Risk: High.** Voluntary retrospective tools have a universal adoption problem. Seth will skip it when sessions go smoothly (no learning opportunity noted) and skip it when sessions go badly (focused on fixing). The pattern: it gets used inconsistently, the retrospective corpus stays sparse, and the rubric never gets calibrated.

**Mitigation options:**
1. Add a soft prompt at team shutdown: "Run `/evaluate-spawn` to improve future specs?" (Yes/Skip) — not a hook, just a reminder in the spawn-build completion message.
2. Set explicit expectation: evaluation only needs to happen after sessions where something went unexpectedly — not every session. Reduces friction by reframing from "mandatory process" to "optional signal."
3. Keep the evaluation to 3 questions maximum. Every additional question reduces completion rate.

**Assumption challenged:** "Retrospective answers will produce actionable rubric updates."

**Risk: Medium.** Free-text answers ("the team missed the edge case") don't map cleanly to rubric dimensions without interpretation. Seth's answers may not contain enough specificity to know which scoring dimension to update.

**Mitigation:** Each evaluation question should be paired with a structured follow-up: "You said the team missed [X]. Was this because: (a) the spec didn't mention it, (b) the refinement questions didn't surface it, or (c) the team ignored it?" This maps the answer to the right fix (spec format vs refinement question vs teammate instructions).

---

### 2c. Centralized Mock Repository

**Assumption being challenged:** "Tester will discover and use existing mocks from `docs/mocks/`."

**Risk: Low.** This is a prompt change and a directory convention. The Tester will follow instructions to check the directory. The only risk is if the directory doesn't exist or mocks are in the wrong format — both preventable with a `docs/mocks/README.md`.

**Scoped correctly:** User decision to keep this as convention + prompt change, not full registry infrastructure, is correct. At solo session volume, the overhead of a structured registry exceeds the value.

---

## Phase 3 Feasibility: Long-Term Asset Accumulation

### 3a. System-Level Documentation (ADRs)

**Assumption being challenged:** "ADRs produced by the Documentation teammate will contain useful decision rationale."

**Risk: Medium.** The Documentation teammate will write ADRs from what it observes during the session — but it may not have visibility into the *reasons* for decisions if those weren't explicit in the spec or in team discussion. An ADR that says "we chose approach X" without "because Y was ruled out due to Z" is a low-value artifact.

**Mitigation:** The spawn prompt for Documentation teammate must include the decision context explicitly: the refinement phase's output (edge cases, ambiguity log, constraints) should be passed to the Documentation teammate so it can write ADRs against actual decision context, not just implementation observations.

**Assumption challenged:** "Planning teams will read and use existing ADRs."

**Risk: Low.** Planning teams already do project analysis. Adding `docs/decisions/` to the scan list is a one-line change. The risk is that ADRs don't accumulate fast enough to be useful in Phase 3 planning sessions (if Seth uses `--include-adr` infrequently). Mitigation: default `--include-adr` to on for feature teams; make opt-out rather than opt-in.

---

### 3b. Insight Embedding

**Feasibility risk: Very Low.** This is language changes to existing prompts. No behavioral risk. The only risk is prompt drift — changing language in prompts changes model behavior in unexpected ways. Mitigation: apply one prompt at a time, test, then apply the next.

---

## Cross-Phase Compounding Risks

**Risk: Later phases depend on earlier phases working well, not just shipping.**

Phase 2's Evaluation depends on Phase 1 sessions producing meaningful spec scores and scenario data. If Phase 1's scoring is uncalibrated (threshold wrong, scores consistently 75+ for all specs regardless of quality), evaluation data will be noisy and produce no useful rubric updates.

**Mitigation:** Phase 1 should ship with a conservative threshold (50) and explicit user expectation that the first 5–10 sessions are calibration sessions. Document this in the spec quality scoring output: "This is session #3. Scoring threshold calibration in progress."

**Risk: Phase 1 bundle is large for a single minor version.**

Three improvements, six file changes, new conventions for `docs/scenarios/`. If implementation surfaces unexpected prompt engineering problems in scoring or refinement, all of Phase 1 is delayed.

**Mitigation (confirmed in Task 6):** Treat 1a as the releasable anchor. 1b and 1c can be released as 0.16.1 and 0.16.2. The version number isn't the constraint — the pre-spawn flow working end-to-end is.

---

## Effort Estimates (Revised)

| Improvement | Previously Estimated | Revised Estimate | Reason for Change |
|---|---|---|---|
| 1a. Refinement | Low | Low-Medium | Prompt engineering for targeted questions is non-trivial |
| 1b. Scoring | Medium | Medium | Scoring dimensions must be binary-checkable; fluency trap is real |
| 1c. Scenario Validation | Medium | Medium | Valid; scenario format guidance needed in discovery interview |
| 2a. AI Review Checklist | Low | Low | Prompt addition to existing role; accurate |
| 2b. Evaluation | Medium | Medium-High | Adoption risk is the constraint, not implementation complexity |
| 2c. Mock Repository | High → scoped down | Low | Correct scoping decision; just a convention + prompt |
| 3a. System Docs (ADRs) | Medium | Low-Medium | Opt-out rather than opt-in simplifies implementation |
| 3b. Insight Embedding | Low-Medium | Low | Language changes only; no behavior change |

---

## Items That Should Change in the Roadmap

1. **Scoring threshold: make configurable from day one.** Do not hardcode 60. `--min-score N` flag or a user-editable value in `shared/spec-quality-scoring.md`. Phase 2 calibration requires this.

2. **ADR output: default to opt-out, not opt-in.** `--skip-adr` rather than `--include-adr`. At solo session volume, every feature deserves an ADR. Opt-in means it never gets used.

3. **Evaluation: add soft prompt at team shutdown.** Not a hook, just a completion message: "Run `/evaluate-spawn` to capture session learnings?" Reduces adoption friction without forcing it.

4. **Scenario format: provide 1 example in discovery interview.** Without an example, Seth will write vague scenarios. One concrete example ("Given a logged-out user, when they access /dashboard, then they are redirected to /login") sets the format expectation in 10 seconds.

5. **Phase 1 release strategy: anchor on 1a.** Communicate to implementation teams that 1a is releasable independently. 1b and 1c follow once 1a is stable.
