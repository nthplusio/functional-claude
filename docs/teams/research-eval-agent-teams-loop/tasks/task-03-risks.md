---
task: 3
title: "Identify risks, failure modes, and hidden costs in the operational loop"
owner: explorer
team: research-eval-agent-teams-loop
date: 2026-02-22
---

# Risks, Failure Modes, and Hidden Costs

## Primary Failure Modes

### 1. Retrieval Gap (Phase 5 → Phase 1 break)

**Mechanism:** AAR and evaluate-spawn write structured retrospective data to `docs/retrospectives/`. No Phase 1-3 operation reads these files. Each spawn begins without any signal from prior runs.

**Consequence:** Known recurring problems recur indefinitely. The AAR from `plan-spec-discovery-scoring` (2026-02-21) identified three plugin-scope issues. None are reflected in the current plugin files at v0.17.1. The "calibration mode" note in `spec-quality-scoring.md` promises threshold adjustment from evaluate-spawn data, but the connection is never implemented.

**Hidden cost:** Every 10 evaluations that produce no rubric change represents wasted evaluation effort. Users experience diminishing motivation to run evaluate-spawn if they observe no downstream effect.

**Risk level:** Critical — this is the central feedback loop failure that the research goal targets.

---

### 2. Manual Rubric Update Dependency

**Mechanism:** `evaluate-spawn/SKILL.md` explicitly states: "Rubric updates are a **manual human step**. The user reads `docs/retrospectives/` periodically and updates [shared files]."

**Consequence:** The system works only if the user periodically reviews retrospectives and edits shared files. This is an out-of-band dependency on human discipline. For occasional users (< weekly spawns), retrospective corpus never reaches the density needed for pattern recognition.

**Hidden cost:** The rubric update process is undefined in terms of frequency, trigger conditions, and what constitutes sufficient evidence to change a threshold. No KPI exists for rubric staleness.

**Risk level:** High — even a well-designed retrieval mechanism fails if the update cadence is unclear.

---

### 3. No Rework Path for Low-Quality Output

**Mechanism:** Quality review (Phase 4) can identify failures — invalidated scenarios, AI pattern findings, poor coverage. The only response path is: (a) user accepts output anyway, or (b) user runs the entire spawn again.

**Consequence:** A team that produces one invalidated scenario in an otherwise excellent run requires full re-spawn to address it. This wastes 40+ coordination tool calls and all token costs of a repeat run.

**Hidden cost:** Users rationally learn to lower their quality threshold to avoid re-spawns. Over time, the scenario validation step becomes ceremonial rather than quality-controlling. The Tester's `### Scenario Notes` section produces data but triggers no automated response.

**Risk level:** High — creates perverse incentive to lower quality bar.

---

### 4. Spec Quality Score Does Not Adapt

**Mechanism:** `spec-quality-scoring.md` defines 6 static binary dimensions with a fixed threshold of 4/6. The calibration note says threshold will adjust based on evaluate-spawn data, but no mechanism exists to do this.

**Consequence:** Early sessions may fire the gate too often (if threshold is miscalibrated high) or too rarely (if threshold is miscalibrated low). Without empirical adjustment, the gate is stuck at its initial calibration.

**Hidden cost:** The "Calibration session [N]/10" message creates user expectation that the system is learning. When the threshold doesn't change after 10 sessions, this is a broken promise that erodes trust in the scoring system.

**Risk level:** High — trust erosion is harder to recover than a technical gap.

---

### 5. Scenario Coverage Data is Orphaned

**Mechanism:** The Tester produces `### Scenario Notes` with Validated/Invalidated/Partial status per scenario. The evaluate-spawn skill auto-derives coverage from this table. The coverage data is written to `docs/retrospectives/[team-name].md` frontmatter as `scenario-coverage: N validated / M total (X%)`.

**Consequence:** Recurring scenario invalidations (e.g., "API response format always drifts from spec") signal a systematic gap in discovery interview questions. This gap is never surfaced — no aggregation, no pattern detection, no adjustment to refinement questions.

**Hidden cost:** Feature teams repeatedly produce the same category of spec drift without the plugin self-correcting.

**Risk level:** Medium — the data exists; it's the aggregation step that's missing.

---

### 6. AAR Participant Input Has No Downstream Effect

**Mechanism:** The shutdown protocol collects participant answers to 3 FM 7-0 questions. These are synthesized into the AAR "What Could Be Improved?" table with plugin/project scope tagging. Plugin-scope issues can trigger `gh issue create` — but this is an optional manual step.

**Consequence:** Teammate-reported friction (e.g., "task assignment messages arrive after tasks are already claimed" from the AAR) surfaces in documents but doesn't modify spawn prompts, protocol blocks, or task structures.

**Hidden cost:** GitHub issue creation is fragile — it requires the user to remember to look at the filtered plugin-scope table and explicitly confirm each issue. In practice, from the one observed AAR, issues were identified but not created.

**Risk level:** Medium — issue creation friction means good signal goes unused.

---

### 7. ADR Scan Is the Only Working Feedback Loop

**Mechanism:** `system-doc-protocol.md` instructs planning teams to scan `docs/decisions/` during project analysis. This is the one feedback mechanism that reads from a prior spawn's output and uses it in the next spawn.

**Consequence:** This sets a positive precedent. However, it's narrow — only planning teams benefit, and only from ADRs specifically (not from retrospectives, scenario invalidation patterns, or AAR improvement items).

**Hidden cost:** The ADR scan creates false confidence that the feedback loop works, when in reality only one of four retrospective artifact types is consumed downstream.

**Risk level:** Low (as a failure) — but important as a template for extension.

---

### 8. Token Overhead of Context-Free Spawning

**Mechanism:** Each spawn begins with the team context block from the discovery interview. Without retrospective data, teammates discover via their own investigation what prior teams have already learned.

**Consequence:** Research teams re-explore already-mapped territory. Planning teams re-litigate already-settled architectural decisions (beyond what ADRs capture). Feature teams repeat identical error patterns that prior AARs documented.

**Quantified estimate:** If 10% of each team's analysis tasks are re-discovering information from prior runs, and each team costs ~500k tokens, retrieval gap costs ~50k tokens per team run.

**Risk level:** Medium — significant aggregate cost, but hard to measure without instrumentation.

---

### 9. Quality Gate Can Be Bypassed Without Penalty

**Mechanism:** `spec-quality-scoring.md` gate behavior: "If user selects 'proceed', spawn proceeds. Score is still included in the spawn prompt." There is no tracking of bypass frequency, no escalating friction, no retrospective question about whether bypassing was the right decision.

**Consequence:** Users learn that "proceed" bypasses the gate, so they bypass it habitually. The gate becomes theater — it fires, is bypassed, and the low-quality spec spawns anyway.

**Hidden cost:** evaluate-spawn's deferred section asks "Did the spec quality score predict actual output quality?" but this is deferred (never answered in practice), so the gate bypass pattern is never diagnosed.

**Risk level:** Medium — bypassing is rational if the gate doesn't reliably improve outcomes.

---

### 10. Reduced-Fidelity AAR is the Common Case

**Mechanism:** `aar-protocol.md` distinguishes full-fidelity AAR (participant input collected before shutdown) from reduced-fidelity (teammates already shut down, lead reconstructs from task data). Full fidelity requires the lead to message all teammates with 3 questions before sending shutdown_request.

**Consequence:** In practice, leads often send shutdown_request immediately after task completion. The shutdown protocol blocks are included in spawn prompts, but the sequence (retrospective questions → shutdown_request → AAR) requires the lead to remember and execute all 4 steps correctly. A missed step degrades to reduced-fidelity, losing the most valuable AAR data (participant voices).

**Hidden cost:** Reduced-fidelity AARs produce less actionable improvement items because they lack the FM 7-0 participant-first principle. The AAR's strongest mechanism is compromised.

**Risk level:** Medium — protocol compliance is hard to enforce in LLM-driven workflows.

---

## Hidden Costs Summary

| Cost | Source | Estimated Impact |
|------|--------|-----------------|
| Repeated discovery of known patterns | No AAR/evaluation readback | ~10% redundant analysis per team |
| Failed rubric calibration expectation | Static thresholds despite calibration promise | Trust erosion in scoring system |
| Full re-spawn for partial failures | No rework path | 40+ coordination calls wasted per correction |
| Unusable evaluate-spawn data | No aggregation mechanism | All evaluation effort has zero cumulative ROI |
| Reduced-fidelity AARs | Protocol sequence compliance | Weakest data from the most valuable phase |
| Gate bypass with no tracking | No bypass consequence | Quality gate becomes theater |

---

## Risk Interaction Map

The six primary risks compound:

```
Retrieval gap (1) → No adaptive scoring (4) → Gate bypass (9) → Low-spec spawns → More invalidations (5)
        ↓                                                                                    ↓
Manual rubric (2) → No rubric change → Evaluation feels useless → Lower evaluation rate
        ↓
No rework path (3) → Accept low quality OR full re-spawn → Either choice degrades trust
```

The system optimizes for individual spawn quality (good) but does not learn across spawns (broken). The entire retrospective infrastructure (AAR, evaluate-spawn, scenario notes) is write-only.

---

## What Does NOT Require Retrospective Readback

The following risks exist independently of the retrieval gap:

- **No rework path** — Can be addressed with task-level retry mechanisms
- **Reduced-fidelity AAR** — Can be addressed with better shutdown protocol enforcement
- **Gate bypass tracking** — Can be addressed with a bypass counter in evaluate-spawn

These are lower-effort fixes that can be pursued in parallel with the harder retrieval gap work.
