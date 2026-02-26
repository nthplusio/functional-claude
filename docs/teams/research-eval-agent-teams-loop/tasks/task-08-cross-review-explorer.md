---
task: 8
role: explorer
title: "Cross-review: Explorer perspective"
team: research-eval-agent-teams-loop
date: 2026-02-22
inputs: [task-01-plugin-survey.md, task-02-evaluation-framework.md, task-03-risks.md, task-05-deep-dive.md, task-06-gap-matrix.md, task-07-challenge.md, task-08-cross-review-critic.md]
---

# Cross-Review: Explorer Perspective

## Alignment Check

Strong agreement on diagnosis. The Critic (task-07, task-08) and Analyst (task-02, task-06) independently arrive at the same structural conclusion as task-01: Phase 5 is write-only. No conflicts on core gap identification or severity ratings.

The Critic's challenge output is high quality — R9 removal and R7 scope reduction are correct calls. The three unresolved items the Critic flags are real gaps in the final output.

---

## Additions to the Cross-Review

**1. The ADR scan precedent is stronger than stated.**

task-08 notes: "No recommendation strengthens ADR creation compliance." But there is a more fundamental observation: the ADR scan works *because* ADRs have a stable format and predictable path (`docs/decisions/[slug]-adr.md`). The retrospective scan (R5) is more brittle because it must handle two file formats with different frontmatter schemas (`-aar.md` files vs `.md` evaluate-spawn files). The Critic identifies the type-filtering problem (profile vs type field names). This deserves explicit treatment in R5's implementation spec — not just a "handle two formats" note, but a specific field-priority rule:

```
For evaluate-spawn files: filter by `profile:` field (build/think/create)
For AAR files: filter by `type:` field (feature/debug/research/planning/etc.)
Map spawn command to profile: spawn-build → build, spawn-think → think, spawn-create → create
```

This is a two-line specification that prevents the ambiguity the Critic correctly flagged.

**2. R2/R8 consolidation: the correct home is scenario-collection.md.**

The Critic and Analyst leave R2/R8 merge as an open decision. I have a position: the correction protocol belongs in `shared/scenario-collection.md`, not `shared/shutdown-protocol.md`.

Reasoning: `shutdown-protocol.md` defines session lifecycle sequence. `scenario-collection.md` owns the Tester validation protocol and the `### Scenario Notes` format. The correction task logic flows naturally from the validation result — it is an extension of what happens when validation finds Invalidated rows, not a shutdown concern. Adding scenario-specific logic to `shutdown-protocol.md` creates a content mismatch.

Proposed consolidation: Add a "Scenario Failure Response" section to `shared/scenario-collection.md`. Reference it from `shared/shutdown-protocol.md` with a single line: "If Tester produced Invalidated scenarios, follow the Scenario Failure Response protocol in `shared/scenario-collection.md` before proceeding to shutdown."

**3. R4 nudge: the Critic's placement correction is right, but the trigger needs precision.**

task-07 says the nudge should fire in `shutdown-protocol.md` not `spawn-core.md`. Correct. But the exact trigger matters: the nudge should fire *after* AAR file verification (step 4 of shutdown sequence) — specifically when the AAR file IS confirmed but `docs/retrospectives/[team-name].md` (evaluate-spawn file, not AAR) does NOT exist. This distinguishes "team completed + AAR done but no evaluate-spawn" from "AAR missing" which is already handled.

The shutdown protocol's Phase 4 ("Before calling TeamDelete: verify AAR file exists") can be extended:
```
4. Verify AAR file exists at docs/retrospectives/[team-name]-aar.md
   - If missing: prompt user
5. Check for evaluate-spawn file at docs/retrospectives/[team-name].md
   - If missing: "No evaluate-spawn retrospective found. Run /evaluate-spawn before deleting the team? (optional)"
```

**4. One consistency gap between task-01 and task-06.**

task-01 (my survey) identified 10 risks. task-06's gap matrix has 10 gaps (G1-G10). Mapping is close but not identical:

- task-03 Risk #7 ("Token overhead of context-free spawning") does not appear explicitly in task-06's gap matrix — it is embedded in the consequences of G1. This is fine for the final report but should be noted: the token overhead argument strengthens the ROI case for R5/R6 and belongs in the final recommendation's impact section.

- task-03 Risk #10 ("Reduced-fidelity AAR") maps to task-06 G10 ("AAR fidelity degradation") rated Low. The Critic (task-08) argues this is understated for feature spawns specifically. I agree — for feature spawns where Backend and Tester voices are the highest-signal inputs for correction protocols (R2/R8), losing those voices to reduced-fidelity degrades the exact data the correction protocols need. Recommend upgrading G10 to Medium for feature spawn type.

**5. Confirm: R9 should be removed, not deferred.**

The Critic recommends removal. The Analyst's R9 spec has three unsolved problems (context reconstruction, downstream stale dependency, minimal team assumption). I concur with removal. The strengthened R2 within active team + future consideration covers the use case adequately. Adding R9 to the "future" list is appropriate but it should not appear in the v0.18.0 roadmap.

---

## Summary Positions

| Item | Position |
|------|----------|
| Core diagnosis | Confirmed — consistent across all outputs |
| R9 (--patch flag) | Remove. Strengthen R2 instead. |
| R7 scope | Restrict to Research + Planning modes only. |
| R2/R8 merge | Consolidate into scenario-collection.md. Reference from shutdown-protocol.md. |
| R4 placement | Move to shutdown-protocol.md Phase 4 extension, not spawn-core.md. |
| R5 field-name spec | Add explicit field-priority rule for two-format scan. |
| G10 severity | Upgrade to Medium for feature spawns specifically. |
| Token overhead (Risk #7) | Include in R5/R6 ROI justification in final report. |
