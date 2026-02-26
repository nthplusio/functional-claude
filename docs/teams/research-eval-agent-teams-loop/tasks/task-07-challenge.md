---
task: 7
title: "Challenge the leading recommendations"
owner: critic
team: research-eval-agent-teams-loop
date: 2026-02-22
inputs: [task-06-gap-matrix.md, task-05-deep-dive.md, task-03-risks.md]
---

# Challenge: Leading Recommendations

**Verdict summary:** R1, R3, R4 survive scrutiny. R2 and R8 survive with scope reduction. R5/R6 survive architecturally but have a cold-start problem. R7 is over-engineered. R9 (--patch flag) does not survive — the complexity cost exceeds the value delivered within this architecture. R10 is premature but valid as a future goal.

---

## Challenge 1: Is the Retrieval Gap (R5, R6) Actually Solvable?

### The Claim
Add a "Retrospective Scan" block to `shared/spawn-core.md` and inject `### Prior Run Insights` into the discovery interview context block. Pattern already exists for ADR scanning — just replicate it.

### The Challenge

**Architecturally: Yes, it is solvable.** The ADR scan in `system-doc-protocol.md` proves the pattern. There is no technical barrier — the plugin is markdown instructions, and "read docs/retrospectives/ and extract sections" is a valid LLM instruction.

**But three real problems remain unaddressed:**

**Problem 1: Cold-start data vacuum.** The current corpus has one evaluate-spawn retrospective (`plan-spec-discovery-scoring.md`, Think profile) and zero Build profile retrospectives. The scan for feature spawns returns nothing. R5 delivers zero value until Build profile retrospectives accumulate. The matrix doesn't acknowledge this timeline gap.

**Problem 2: Type-filtering brittleness.** The proposal filters by `type:` frontmatter matching the current spawn type. But team names are the primary identifier (`feature-*`, `research-*`), not explicit type fields. Evaluate-spawn files have `profile: build/think/create` not `type: feature`. AAR files have `type: feature|debug|research|...`. The scan needs to handle two different field names across two file formats — this is not mentioned anywhere. A lead following ambiguous instructions will either read everything (noise) or filter incorrectly (missed signal).

**Problem 3: Deduplication is unsolvable in markdown.** The proposal says "deduplicate insights across files (same theme appearing in 3 retrospectives = higher signal)." This requires semantic similarity — not string matching. An LLM reading 3 files can attempt this, but the instruction gives no guidance on what counts as "same theme." In practice, the lead will produce inconsistent summaries. Structured deduplication requires a command, not a protocol addition.

**Verdict:** R5 (scan) survives with corrections. R6 (injection) survives but should depend explicitly on R5 having meaningful data. Add: "If fewer than 3 matching retrospectives exist, skip the scan — insufficient data for reliable signal." This prevents noise injection into early spawns.

---

## Challenge 2: Does --patch Introduce More Complexity Than It Saves? (R9)

### The Claim
Add `--patch [team-name]` flag to `spawn-build`. Reads prior team artifacts, asks which tasks to redo, spawns a minimal 1-2 agent team, overwrites output files.

### The Challenge

**This recommendation does not survive scrutiny in the markdown+hooks architecture.**

**Problem 1: State reconstruction is the hardest part, not mentioned.** To meaningfully patch a team, the lead needs to understand the original team's context — the full discovery interview output, the API contract from task 1, the dependencies between tasks. This context lives in the session that has already ended. The only persistent data is in `docs/teams/[team-name]/tasks/`. Reading those files and reconstructing enough context for a coherent patch team is equivalent to re-running the discovery interview against a prior team's artifacts. The proposal assumes this is straightforward — it is not.

**Problem 2: Task overwriting creates inconsistency.** If task 3 (Backend) is patched and overwrites its output, but task 9 (Integration tests) was already written against the original task 3 output, the integration tests are now stale without any protocol forcing their update. The --patch flag has no awareness of downstream task dependencies. This is a data integrity problem the proposal does not address.

**Problem 3: The minimal 1-2 agent team assumption is wrong for feature spawns.** Feature teams have frontend/backend/tester separation because cross-team contracts matter. If only the backend is wrong, the tester's integration tests probably also need updating. A "minimal" patch team becomes a full team in the cases where it's most needed.

**Problem 4: This solves a problem that R2 already partially solves.** R2 (inline correction task protocol) handles the high-frequency case: scenario invalidation detected before the team shuts down. This is the majority of partial-failure cases. --patch addresses post-shutdown correction, which is lower frequency and higher complexity.

**Alternative that achieves 80% of the value:** Strengthen R2. Add a protocol that, when the team lead reviews `### Scenario Notes` and finds Invalidated rows, the protocol explicitly instructs: create a new targeted task assigned to the original implementer, provide the scenario as context, re-run Tester validation. This stays within active session, preserves context, and needs no new infrastructure. The correction cost drops from "full re-spawn" to "2-3 targeted tasks within existing team."

**Verdict:** R9 should be removed or deferred to a future major version. Replace with a strengthened R2 that explicitly handles the post-validation correction loop within the active team.

---

## Challenge 3: Are the Effort Estimates Realistic?

### The Claim
R1, R2, R4 are "Low" effort — "protocol additions only, no new files." R5 is "Medium." R10 is "High."

### The Challenge

**R1 (calibration counter): Correctly rated Low.** Adding a file count instruction to `spec-quality-scoring.md` is genuinely low effort. The LLM can glob `docs/retrospectives/*.md` and filter frontmatter. No objection.

**R2 (inline correction protocol): Low is too optimistic.** The current shutdown-protocol.md is already complex — it defines AAR sequencing, participant questions, and TeamDelete ordering. Adding a conditional branch ("if Tester produces Invalidated scenarios...") requires specifying: where in the sequence this happens, who reads the Scenario Notes table, who creates the correction tasks, how the lead decides between accept/fix/re-spawn, and what "fix complete" looks like before AAR begins. This is Low effort to write badly and Medium effort to write correctly.

**R5 (retrospective scan): Medium is correct.** But the estimate should account for the field-name mismatch problem identified above. The implementation needs to handle two formats. Arguably should be Medium-High.

**R7 (Expected Outcomes for think/create): Medium is too low.** Six distinct outcome formats across 6 spawn modes (research, planning, review, design, brainstorm, productivity), plus evaluate-spawn validation updates for each mode. This touches `discovery-interview.md`, two command files, and `evaluate-spawn/SKILL.md`. It's closer to High effort.

**R10 (calibrate-scoring command): High is correct.** But the dependency note is understated. R10 requires not just R3 (score accuracy immediate) but also a meaningful corpus of Build profile retrospectives with score accuracy filled in. At current usage rates, this command has no useful data to aggregate for months. The effort rating should include a "blocked by data volume" note.

**Overall:** The roadmap underestimates R2 and R7 by one level each. This affects sequencing — "Week 1 quick wins" may slip if R2 is harder than expected.

---

## Challenge 4: Does R7 Add Complexity Without Clear Payoff?

### The Claim
Add `### Expected Outcomes` to think/create discovery interview compilation. Define per-mode formats for 6 spawn types. Update evaluate-spawn Think/Create profiles to validate against these outcomes.

### The Challenge

**The value proposition is real but the scope is wrong.**

The genuine problem (G3): Think/create spawns have no pre-spawn definition of done, so evaluate-spawn has nothing to validate against. The question "did the team investigate the right things?" is unanswerable without a prior definition.

**But the six-format solution over-engineers the fix:**

- Brainstorm outcome-setting is inherently fuzzy (the Explorer noted this). Adding a mandatory `### Expected Outcomes` block for brainstorm either captures meaningless boilerplate or creates friction that discourages the spawn.
- Productivity spawns already have Compounder's "progress check" and "friction log" — closest existing equivalent. Adding a separate pre-spawn outcome artifact duplicates this.
- For Research spawns specifically (the highest-value case), the decision question and confidence level ARE already compiled in the discovery interview Context block. The gap is not that the data is missing — it's that it's embedded in the spawn prompt rather than a separate file.

**Minimal version with equal payoff:** Add `### Expected Outcomes` to Research and Planning discovery compilation only (2 modes, not 6). These are the modes where "did we answer the right question?" is most evaluable. Skip Design, Brainstorm, Productivity — the evaluation is too subjective to be worth the overhead. This reduces the implementation scope by ~60% while capturing 80% of the value.

**Verdict:** R7 survives but should be scoped to Research and Planning modes only in Phase B. Design/Brainstorm/Productivity can be added later if the pattern proves valuable.

---

## Challenge 5: Unintended Consequences

### R4 (retrospective nudge at spawn completion)

**Consequence:** The nudge appears at spawn completion (Step 10 of spawn-build). This is the moment the team is starting work, not ending it. The retrospective is for a *completed* team, not the team being spawned. The implementation description ("No retrospective found for this team") will always be true at spawn time because the team was just created. The check should be "no retrospective found for the *previous* spawn of this type" — a different query.

Correction: The nudge should appear in the spawn completion output for the *previous* team, not the new team. Or more precisely, it should be part of the post-shutdown sequence in `shutdown-protocol.md`, not `spawn-core.md`.

### R5 (retrospective scan) and Context Block Size

**Consequence:** The `### Prior Run Insights` subsection injects 1-3 bullets into the compiled Context block. The Context block is already part of a large spawn prompt (feature mode spawns are 300+ lines). Adding retrospective data increases context length. For compaction-prone spawns with many teammates, this marginal increase can push the prompt over effective attention boundaries. Not a dealbreaker, but the implementation should enforce a hard limit: max 3 bullets, max 100 words total for the Prior Run Insights block.

### R2 + R8 (correction protocols in two files)

**Consequence:** R2 adds a correction protocol to `shutdown-protocol.md` and R8 adds a "Scenario Failure → Correction Task" protocol to `scenario-collection.md`. These overlap. The Tester writes `### Scenario Notes` (scenario-collection.md), and the lead uses those notes to create correction tasks (shutdown-protocol.md). Without explicit coordination between the two protocols, the lead sees two different instructions for what to do when scenarios are invalidated. Merge these into a single protocol block in one location, referenced from the other.

---

## Revised Recommendation Ranking

| Rank | Rec | Original Rating | Challenge Verdict | Action |
|------|-----|----------------|-------------------|--------|
| 1 | R1 | Low/High | Survives | Ship as-is |
| 2 | R3 | Low/High | Survives | Ship as-is |
| 3 | R4 | Low/Medium | Survives with correction | Fix placement: nudge belongs in shutdown-protocol, not spawn-core |
| 4 | R2 | Low/Critical | Survives, effort re-rated | Medium effort; merge with R8 into single protocol |
| 5 | R5 | Medium/Critical | Survives with guard | Add cold-start guard: skip if <3 matching retrospectives |
| 6 | R6 | Medium/Critical | Survives, depends on R5 data | Explicitly block on R5 corpus threshold |
| 7 | R7 | Medium/High | Scope reduced | Research + Planning only (not 6 modes) |
| 8 | R8 | Medium/Critical | Merge into R2 | Do not implement separately; consolidate |
| 9 | R10 | High/High | Survives as future goal | Mark as "blocked by data volume" |
| — | R9 | High/Critical | Does not survive | Remove; replace with strengthened R2 |

---

## Critical Questions Left Unanswered

**1. Who enforces the correction loop?** R2 creates a protocol for the lead to create correction tasks. But the lead is an LLM following instructions in a spawn prompt. If the Tester's Scenario Notes are in one teammate's context and the lead needs to read them to create correction tasks, this requires explicit inter-teammate communication — which is currently not guaranteed.

**2. What is "sufficient" retrospective data?** The calibration system promises threshold adjustment after 10 sessions. But 10 sessions of what quality? If 8 of 10 are "score not matched" with no trend, calibration produces noise. No recommendation addresses minimum data quality requirements for calibration decisions.

**3. What happens when the plugin updates and retrospective format changes?** If `evaluate-spawn/SKILL.md` changes the output format (e.g., new frontmatter fields), older retrospective files become partially unreadable by R5's scan. No migration strategy is mentioned.
