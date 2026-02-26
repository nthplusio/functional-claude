# Task 02: Evaluation Framework and Gap Analysis Matrix

**Owner:** Analyst
**Date:** 2026-02-22

---

## Summary

The 5-phase operational loop has well-defined entry and exit conditions within each phase, but the connective tissue between phases — particularly Phase 5 back to Phase 1 — is almost entirely manual and human-mediated. This creates a **feedback loop that exists on paper but not in execution**.

---

## Evaluation Criteria

For each phase, I evaluated five dimensions:

| Dimension | Question |
|-----------|----------|
| **Completeness** | Does the phase cover all necessary activities? |
| **Connectivity** | Does output from this phase flow into the next phase? |
| **Feedback integration** | Does this phase consume learnings from Phase 5? |
| **Failure recovery** | What happens when this phase produces low-quality output? |
| **Measurement** | Is there a way to assess whether this phase succeeded? |

---

## Phase-by-Phase Evaluation

### Phase 1: Gather Requirements
*Files: `shared/discovery-interview.md`, `shared/spec-refinement.md`, `shared/spec-quality-scoring.md`*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Completeness | **Good** | Discovery interview, refinement, quality scoring, scenario collection — covers the full pre-spawn pipeline. Adaptive skip logic prevents over-questioning when context is already provided. |
| Connectivity | **Good** | Compiled context block is structured for direct inclusion in spawn prompt. Score is passed forward. Token budget is embedded. |
| Feedback integration | **Missing** | Interview questions are static. Nothing reads `docs/retrospectives/` to adapt which questions to ask, which dimensions to probe harder, or what threshold to use. The spec-quality-scoring.md acknowledges a "Calibration Mode" for first 10 sessions but it's not wired to actual retrospective data. |
| Failure recovery | **Partial** | Gate logic exists (score < threshold prompts user). User can override with "proceed." No path to automatically re-run only the failed dimensions or start a targeted refinement loop. Re-run means full restart. |
| Measurement | **Good** | 6-dimension binary scoring with visible output. Threshold configurable. Score persisted in spawn prompt. |

**Phase 1 rating: Medium gap** — the phase mechanics are sound but operate in isolation from all prior session data.

---

### Phase 2: Set Expected Outcomes
*Files: `shared/spec-quality-scoring.md` (acceptance scenarios), `shared/scenario-collection.md`, `shared/spawn-core.md` (adaptive sizing)*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Completeness | **Partial** | Acceptance scenarios for feature mode; adaptive team sizing based on subtask count. But no equivalent outcome-setting for think/create modes — no equivalent to "what does a successful research output look like?" before spawning. |
| Connectivity | **Good** | Scenarios written to `docs/scenarios/[feature-slug].md` and embedded in spawn prompt. Team sizing recommendation is user-gated. |
| Feedback integration | **Missing** | Team sizing is purely heuristic (1-2 = solo, 3-4 = pair, etc.) — not calibrated against historical accuracy. No retrospective data shapes what "acceptable coverage" means for this domain. |
| Failure recovery | **Missing** | If scenario collection is skipped, the quality scoring dimension fails, but there is no recovery path — only a penalty. No mechanism to say "this category of work historically needs more scenarios." |
| Measurement | **Partial** | Scenario coverage is auto-derived by evaluate-spawn for build profiles. For think/create profiles, there is no equivalent outcome measurement at all. |

**Phase 2 rating: High gap** — thin for think/create modes, and zero feedback calibration for sizing or coverage thresholds.

---

### Phase 3: Conduct Operations
*Files: `shared/spawn-core.md`, `shared/planning-blueprints.md`, `shared/task-blocking-protocol.md`, persona files*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Completeness | **Good** | Blueprints cover 7 planning modes, all build/create types. Model selection by phase, verbosity control, task blocking protocol, user feedback gate mid-execution. |
| Connectivity | **Good** | Output standard defines artifact locations (`docs/teams/[TEAM-NAME]/`). Downstream commands referenced in normal/verbose mode output. |
| Feedback integration | **Missing** | Team composition, task structure, and persona instructions are static. No mechanism to load retrospective insights ("last time this team ran, the Architect missed refinement folding dependency — add a dependency-grep step"). |
| Failure recovery | **Partial** | USER FEEDBACK GATE mid-execution allows course correction. However, the gate only works if the user is present and monitors the team. Post-gate corrections require full re-execution of downstream tasks — no incremental patch path. |
| Measurement | **Partial** | Task completion tracked via TaskList/TaskUpdate. No automated quality check on task outputs before proceeding. |

**Phase 3 rating: Medium gap** — execution is solid, but the team instructions don't evolve and there's no path to targeted rework.

---

### Phase 4: Review Output Quality
*Files: `shared/aar-protocol.md`, `shared/shutdown-protocol.md`, feedback gate patterns in blueprints*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Completeness | **Good** | AAR covers 4 structured questions, participant voices, usage summary. USER FEEDBACK GATE mid-execution. Shutdown protocol ensures retrospective questions are asked before teardown. |
| Connectivity | **Partial** | AAR is written to `docs/retrospectives/`. But it is a document — it is not parsed, indexed, or summarized for use by the next session. The connection to Phase 5 is write-only. |
| Feedback integration | **Good** | The AAR itself synthesizes session learnings. Participant input is collected. Issue scope (plugin vs project) is classified. |
| Failure recovery | **Missing** | If output quality is low but the team has shut down, there is no rework path. The user must re-spawn a new full team. No "targeted fix" spawn pattern exists (e.g., spawn a single specialist to address a specific identified gap). |
| Measurement | **Partial** | AAR documents quality observations. evaluate-spawn scores scenario coverage and setup alignment. But neither produces a structured signal that can gate or adjust Phase 1 of the next session. |

**Phase 4 rating: High gap** — review is well-structured but terminates at the document. No bridge from the review findings to the next spawn's behavior.

---

### Phase 5: Capture and Feed Back Learnings
*Files: `skills/evaluate-spawn/SKILL.md`, `shared/aar-protocol.md` (Rubric Update Process)*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Completeness | **Partial** | evaluate-spawn captures structured data (scenario coverage, setup alignment, gap identification). AAR captures process observations. Deferred checkboxes exist for score accuracy and first-fix. But deferred items require future human action with no reminder mechanism. |
| Connectivity | **Critical gap** | Retrospective files at `docs/retrospectives/` are never read by any spawn command. No hook reads these files. No Phase 1 step queries them. The feedback loop ends at writing the file. |
| Feedback integration | **N/A** | This IS the feedback phase. But it is entirely passive — data is written, not acted upon. |
| Failure recovery | **Missing** | No mechanism to detect when evaluate-spawn or AAR was skipped. No prompt on next session open: "Your last spawn has no retrospective — would you like to run one?" |
| Measurement | **Missing** | No aggregate view of retrospective health. No way to know whether the plugin is improving, stagnating, or degrading over time across sessions. |

**Phase 5 rating: Critical gap** — the phase writes data correctly but has no consumption path. Every subsequent spawn starts cold.

---

## Gap Analysis Matrix

| Gap | Phase(s) | Severity | Description |
|-----|----------|----------|-------------|
| **Retrieval gap** | 1, 3, 5 | **Critical** | AARs and evaluate-spawn files are written to `docs/retrospectives/` but never read by subsequent spawns. Phase 1 operates with zero knowledge of prior sessions. |
| **No rework path** | 3, 4 | **Critical** | Low-quality output requires full re-spawn. No targeted fix pattern (single-specialist patch spawn). Rework cost is 10x the incremental cost. |
| **Think/create outcome gap** | 2 | **High** | Scenario collection and outcome-setting exists for feature/build mode only. Research, planning, design, brainstorm, productivity modes have no equivalent pre-spawn outcome definition. |
| **Static scoring thresholds** | 1, 5 | **High** | Spec quality threshold (default: 4/6) is not calibrated by historical data. "Calibration Mode" in spec-quality-scoring.md is mentioned but not wired to retrospectives. |
| **Static team composition** | 3, 5 | **High** | Blueprint personas and task structures do not change based on AAR findings. Issues identified in retrospective ("add dependency-grep step") require manual human edits to plugin files. |
| **Missing retrospective prompt** | 4, 5 | **Medium** | No SessionStart hook reminds the user that a prior spawn has no retrospective. Evaluations are entirely voluntary with no nudge. |
| **Deferred-item orphaning** | 5 | **Medium** | Deferred checkboxes in build-profile retrospectives (score accuracy, first-fix) have no review trigger. They are created and never revisited. |
| **No aggregate signal** | 5 | **Medium** | No summary view across all `docs/retrospectives/` files. Cannot tell whether score accuracy is improving or what the most common failure mode is across spawns. |
| **Mid-gate recovery only** | 3 | **Medium** | USER FEEDBACK GATE allows mid-execution course correction, but only while the team is live. No post-hoc course-correction mechanism. |
| **AAR fidelity degradation** | 4 | **Low** | If teammates shut down before AAR questions are sent, the result is a reduced-fidelity AAR. The correct shutdown sequence is documented but not enforced. |

---

## Ratings by Phase

| Phase | Completeness | Connectivity | Feedback Integration | Failure Recovery | Measurement | Overall |
|-------|-------------|-------------|---------------------|-----------------|-------------|---------|
| 1. Gather requirements | Good | Good | **Missing** | Partial | Good | **Medium** |
| 2. Set expected outcomes | Partial | Good | **Missing** | **Missing** | Partial | **High** |
| 3. Conduct operations | Good | Good | **Missing** | Partial | Partial | **Medium** |
| 4. Review output quality | Good | Partial | Good | **Missing** | Partial | **High** |
| 5. Capture and feed back | Partial | **Critical** | N/A | **Missing** | **Missing** | **Critical** |

---

## Ranked Recommendations

| Rank | Recommendation | Impact | Effort | Severity | Key Files |
|------|---------------|--------|--------|----------|-----------|
| 1 | **Add retrospective retrieval to discovery interview** — Before compilation, query `docs/retrospectives/` for same-team-type sessions. Surface relevant "what missed" patterns to inform question emphasis. Even a summary (top 3 recurring gaps) would break the cold-start problem. | High | Medium | Critical | `shared/discovery-interview.md`, `skills/evaluate-spawn/SKILL.md` |
| 2 | **Add targeted rework spawn pattern** — Define a "patch spawn" command or template: spawn a single specialist role to address a specific identified gap, given the original spec + the reviewer's findings. Eliminates full re-run requirement for incremental corrections. | High | High | Critical | `shared/planning-blueprints.md`, new `commands/spawn-patch.md` |
| 3 | **Add outcome-setting for think/create modes** — Mirror the scenario-collection pattern for research/planning/design: before spawning, ask "what does a good output look like? what would make you re-run this?" Creates testable targets that evaluate-spawn can verify. | High | Medium | High | `shared/discovery-interview.md`, `skills/evaluate-spawn/SKILL.md` |
| 4 | **Wire calibration mode to actual retrospective data** — Replace the session-count placeholder in spec-quality-scoring.md with a real read of `docs/retrospectives/` to count evaluations and surface score-accuracy deferred items. Gives the threshold adjustment claim actual teeth. | Medium | Low | High | `shared/spec-quality-scoring.md` |
| 5 | **Add retrospective-missing nudge via SessionStart or spawn completion** — At spawn completion, if `docs/retrospectives/[team-name].md` does not exist, include a visible prompt: "No retrospective found for this team — run `/evaluate-spawn` to capture learnings." Low friction, high recapture rate. | Medium | Low | Medium | `skills/evaluate-spawn/SKILL.md`, spawn completion templates in `shared/spawn-core.md` |

---

## Framework Notes

These criteria and the resulting matrix are designed to feed directly into `/spawn-think --mode planning`. The gap analysis rows map directly to task candidates for a planning team. The ranked recommendations include file-level specificity sufficient for a technical spec team to scope implementation work.

The most structurally important gap is the **retrieval gap** (rank 1): every other feedback mechanism (AAR, evaluate-spawn, deferred checkboxes) is writing to a buffer that nothing reads. Fixing retrieval makes all existing capture mechanisms valuable retroactively.
