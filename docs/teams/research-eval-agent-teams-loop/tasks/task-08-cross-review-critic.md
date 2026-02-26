---
task: 8
role: critic
title: "Cross-review: consistency, gaps, and conflicts across all findings"
team: research-eval-agent-teams-loop
date: 2026-02-22
inputs: [task-01-plugin-survey.md, task-02-evaluation-framework.md, task-03-risks.md, task-05-deep-dive.md, task-06-gap-matrix.md, task-07-challenge.md]
---

# Cross-Review: Critic Perspective

## Consistency Check

**Agreement across all three perspectives:** Strong. The survey (Explorer), evaluation framework (Analyst), and risk analysis (Critic/task-03) all independently identify the same structural break: Phase 5 writes to disk; Phases 1-3 never read it. No inconsistency on the core diagnosis.

**One factual discrepancy:** task-02 lists G5 (static team composition) as "High" severity. task-06 confirms this. However, task-03 does not surface static team composition as a standalone gap — it's embedded in "AAR participant input has no downstream effect." The gap exists in all three outputs but the framing differs. The Analyst's matrix is the definitive version.

**One naming inconsistency:** task-02 calls the rework recommendation "spawn-patch.md" (new command). task-06 calls it `--patch` flag on `spawn-build`. task-07 challenges both and recommends dropping R9 entirely. The team has not converged on the rework path architecture. This is the only significant open decision.

---

## Gaps None of the Three Perspectives Caught

**1. The evaluate-spawn completion rate is unknown.** All outputs assume low completion based on the voluntary nature of the skill. But no output quantifies this or recommends adding any tracking. If completion rate is already high (users do run /evaluate-spawn), the cold-start argument for R4 (retrospective nudge) is weaker. If completion rate is near zero, the priority order should shift: R4 before R5, because R5 scans data that doesn't exist yet.

**2. Spec quality bypass rate is unknown.** task-03 identifies gate bypass as a medium risk. No recommendation addresses measuring bypass frequency. A simple addition to evaluate-spawn ("Did you override the quality gate? If so, was that the right call?") would close this data gap at near-zero cost. Not in any recommendation.

**3. The AAR fidelity problem is understated.** task-03 rates reduced-fidelity AAR as "Low" risk. task-06 confirms this. But the existing retrospective evidence (one AAR from plan-spec-discovery-scoring) — the only empirical data point — was a research team with no Tester role. For feature teams, reduced-fidelity AAR means losing the Tester's and Backend's "what I'd change" inputs, which are the highest-signal items for the types of issues R2 (correction protocol) and R8 (scenario mapping) are trying to fix. The risk is understated for feature spawn types specifically.

**4. No recommendation addresses the ADR scan gap.** task-01 correctly identifies that ADR scanning (planning teams reading `docs/decisions/`) is the one working feedback loop. But ADRs are only created by Documentation teammates in feature mode (optional teammate, often skipped). If ADRs are sparse, the one working feedback loop is already fragile. No recommendation strengthens ADR creation compliance.

---

## Conflicting Recommendations

**R2 vs R8 overlap (unresolved):** task-06 lists both as independent recommendations. task-07 flags the overlap. They remain listed as separate items in task-06's implementation table (`shared/shutdown-protocol.md` for R2, `shared/scenario-collection.md` for R8). The final report needs to resolve this: either consolidate into one protocol in one file, or explicitly specify which file owns which step and how they hand off.

**R4 placement conflict (unresolved):** task-07 correctly identifies that R4's nudge ("no retrospective found for this team") fires at spawn time when it should fire at session end. task-06 does not resolve this — it still lists `shared/spawn-core.md` as the target file. The final recommendation needs to specify `shared/shutdown-protocol.md` as the correct location.

**R9 verdict is split:** task-06 ranks R9 as a structural fix with "High" effort. task-07 recommends removing it. This is the team's major open disagreement. A tiebreaker is needed for the final report — recommend the team lead make an explicit decision here rather than leaving both positions in the output.

---

## Recommendations That May Conflict With Each Other

**R5 + R7 together create compound context bloat.** R5 adds `### Prior Run Insights` to the Context block. R7 adds `### Expected Outcomes` to the Context block. For a research spawn, the compiled context block would now include: Goal, Tech Constraints, Product Constraints, Acceptance Criteria, Existing Context, Quality Priority, Spec Quality, **Prior Run Insights**, **Expected Outcomes**. The context block grows by ~20-30% for the modes where both apply. No recommendation sets a combined size budget for the Context block.

**R3 + R10 create a calibration loop nobody closes.** R3 moves score accuracy to an immediate question. R10 aggregates score accuracy into calibration recommendations. But neither recommendation specifies who acts on the calibration output. The rubric update process in evaluate-spawn explicitly says it is a "manual human step." R10 produces a recommendation ("raise threshold to 5/6") but nothing in the plugin enforces or even tracks whether the user follows it.

---

## Conclusion for Final Report

The team's diagnosis is solid and internally consistent. The recommendations are mostly well-targeted. Three things need resolution before the final report:

1. **R2/R8 merge:** Consolidate into a single correction protocol in one file.
2. **R4 placement:** Move target from `spawn-core.md` to `shutdown-protocol.md`.
3. **R9 fate:** Explicit drop or explicit deferral — do not leave it ambiguous.

The three gaps missed by all perspectives (evaluate-spawn completion rate, gate bypass rate, ADR creation compliance) are low-effort additions that strengthen the recommendation set.
