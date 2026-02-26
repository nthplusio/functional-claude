---
team: research-eval-agent-teams-loop
date: 2026-02-22
type: research
mode: eval
topic: Agent-teams plugin feedback loops — 5-phase operational loop evaluation
team-size: 3 teammates (Explorer, Analyst, Critic)
tasks-completed: 10/10
spec-score: 5/6 dimensions
status: completed
primary-artifact: evaluation-report.md
---

# Evaluation Report: Agent-Teams Feedback Loop

**Research question:** Do learnings from completed spawns measurably improve subsequent spawns?

**Answer:** No. The plugin's feedback infrastructure is write-only. Every session starts cold regardless of prior run quality.

---

## Executive Summary

The agent-teams plugin at v0.17.1 has well-designed capture mechanisms (AAR, evaluate-spawn, scenario notes, spec quality scoring) but a critical structural break: none of these mechanisms are read by subsequent spawns. Phase 5 writes to `docs/retrospectives/`; Phases 1–3 never read it.

The consequence is compounding: each spawn re-discovers the same patterns, re-makes the same mistakes, and re-incurs the same token costs. The calibration system promised in `spec-quality-scoring.md` has no implementation. The feedback loop exists architecturally but not operationally.

**10 recommendations** are produced, organized into three implementation phases. All recommendations are grounded in specific plugin files. The matrix is structured to feed directly into `/spawn-think --mode planning`.

---

## Gap Analysis Matrix (Final)

| # | Gap | Phase(s) | Severity | Root Cause | Key Files |
|---|-----|----------|----------|------------|-----------|
| G1 | Retrieval gap — retrospectives never consumed by subsequent spawns | 1, 3, 5 | **Critical** | No scan step in `spawn-core.md` reads `docs/retrospectives/`. ADR scan pattern exists but not replicated for retrospectives. | `shared/spawn-core.md`, `shared/discovery-interview.md` |
| G2 | No rework path — full re-spawn required for partial failures | 3, 4 | **Critical** | No inline correction protocol when Tester finds Invalidated scenarios. Binary choice: accept or full re-spawn. | `shared/shutdown-protocol.md`, `shared/scenario-collection.md` |
| G3 | Think/create outcome gap — no pre-spawn definition of done for 6 of 8 spawn types | 2, 4 | **High** | Scenario collection exists for feature/build only. Think/create discovery compiles context but never asks "what does done look like?" | `shared/discovery-interview.md`, `commands/spawn-think.md` |
| G4 | Broken calibration promise — static thresholds despite stated mechanism | 1, 5 | **High** | `spec-quality-scoring.md` references calibration session counter but reads no retrospective data. Deferred score-accuracy items never revisited. | `shared/spec-quality-scoring.md`, `skills/evaluate-spawn/SKILL.md` |
| G5 | Static team composition — AAR improvements never reach blueprints | 3, 5 | **High** | AAR improvement table identifies plugin-scope changes; applying them requires manual human edits with no prescribed path. | `shared/planning-blueprints.md`, `shared/aar-protocol.md` |
| G6 | Missing retrospective nudge — evaluate-spawn completion rate unknown | 4, 5 | **Medium** | evaluate-spawn is voluntary; no prompt at session end when no retrospective exists for the team. | `shared/shutdown-protocol.md` |
| G7 | Deferred-item orphaning — score accuracy checkboxes never revisited | 5 | **Medium** | Build profile evaluate-spawn places key calibration data in Deferred section with no review trigger. | `skills/evaluate-spawn/SKILL.md` |
| G8 | No aggregate signal — cannot identify patterns across retrospectives | 5 | **Medium** | No command aggregates `docs/retrospectives/*.md`. Patterns visible only to a human reading every file. | — |
| G9 | Gate bypass untracked — users learn to bypass quality gate habitually | 1 | **Medium** | `spec-quality-scoring.md` gate: "proceed" bypasses with no tracking, no escalating friction, no retrospective diagnosis. | `shared/spec-quality-scoring.md`, `skills/evaluate-spawn/SKILL.md` |
| G10 | AAR fidelity degradation — reduced-fidelity AARs are common | 4 | **Medium** | Correct shutdown sequence documented but not enforced. Teammates often shut down before retrospective questions sent. Especially costly for feature spawns where Backend/Tester voices are highest-signal. | `shared/aar-protocol.md`, `shared/shutdown-protocol.md` |

### Phase Ratings

| Phase | Completeness | Connectivity | Feedback Integration | Failure Recovery | Measurement | Overall |
|-------|-------------|-------------|---------------------|-----------------|-------------|---------|
| 1. Gather requirements | Good | Good | **Missing** | Partial | Good | **Medium** |
| 2. Set expected outcomes | Partial | Good | **Missing** | **Missing** | Partial | **High** |
| 3. Conduct operations | Good | Good | **Missing** | Partial | Partial | **Medium** |
| 4. Review output quality | Good | Partial | Good | **Missing** | Partial | **High** |
| 5. Capture and feed back | Partial | **Critical** | N/A | **Missing** | **Missing** | **Critical** |

---

## Final Ranked Recommendations

### Phase A: Quick Wins
*Protocol additions only. No new files. All independent — ship in any order.*

**R1 — Fix calibration session counter**
- Add retrospective count read to `shared/spec-quality-scoring.md`. Glob `docs/retrospectives/*.md`, count files with `spec-score:` frontmatter not equal to "not scored". Display accurate "Calibration session N/10."
- **Gaps:** G4, G7 | **Effort:** Low | **Confidence: High**
- **File:** `shared/spec-quality-scoring.md`

**R2 — Unified inline correction protocol** *(merged R2+R8; replaces dropped R9)*
- Add "Scenario Invalidation → Correction Loop" to `shared/scenario-collection.md` as primary owner. Reference from `shared/shutdown-protocol.md` with one line. Protocol: Tester adds `### Correction Opportunities` table (Scenario | Root Cause | Affected Task | Suggested Fix). Lead presents three options: (a) accept, (b) create targeted correction tasks blocking AAR until resolved, (c) proceed to AAR and address in next spawn.
- **Note on file ownership:** Explorer recommends `scenario-collection.md` as primary (correction flows from validation result). Analyst had `shutdown-protocol.md`. Resolution: `scenario-collection.md` owns the protocol; `shutdown-protocol.md` references it. This keeps lifecycle sequencing clean.
- **Gaps:** G2, G5 (partial) | **Effort:** Medium | **Confidence: High**
- **Files:** `shared/scenario-collection.md` (primary), `shared/shutdown-protocol.md` (reference)

**R3 — Move score accuracy from deferred to immediate**
- In `skills/evaluate-spawn/SKILL.md` Build profile, move "Score accuracy" from Deferred to an immediate question: "Did the spec quality score reflect actual implementation difficulty?" Three options: matched / score too optimistic / score too pessimistic. Write to retrospective frontmatter.
- **Gaps:** G4, G7 | **Effort:** Low | **Confidence: High**
- **File:** `skills/evaluate-spawn/SKILL.md`

**R4 — Retrospective nudge at session end** *(placement corrected from spawn-core to shutdown)*
- Add to `shared/shutdown-protocol.md` Phase 4 extension. After verifying AAR file exists, check for evaluate-spawn file at `docs/retrospectives/[team-name].md`. If missing: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)." Trigger is post-AAR, pre-TeamDelete — not at spawn creation.
- **Gaps:** G6, G10 | **Effort:** Low | **Confidence: High**
- **File:** `shared/shutdown-protocol.md`

**R11 — Gate bypass tracking**
- Add one question to all evaluate-spawn profiles: "Did you override the spec quality gate? If so, was that the right call?" Write `gate-bypassed: true/false` and `bypass-verdict: correct|should-have-refined` to retrospective frontmatter.
- **Note:** Build profile hard cap is 3 questions (including auto-derived scenario coverage). R3 + R11 both add questions. Priority order: R3 > R11. If cap is binding, defer R11 to Think/Create profiles only.
- **Gaps:** G9 | **Effort:** Low | **Confidence: Medium**
- **File:** `skills/evaluate-spawn/SKILL.md`

---

### Phase B: Medium Effort
*New subsections in existing files. Some internal dependencies.*

**R5 — Retrospective scan with cold-start guard**
- Add "Retrospective Scan" to `shared/spawn-core.md` Project Analysis Additions (mirrors ADR scan and Mock scan). Read up to 3 most recent matching retrospective files.
- **Field-priority rule (Explorer spec):** For evaluate-spawn files filter by `profile:` (build/think/create). For AAR files filter by `type:` (feature/debug/research/planning/etc.). Map spawn command → profile: `spawn-build→build`, `spawn-think→think`, `spawn-create→create`.
- **Cold-start guard:** If fewer than 3 matching retrospectives exist, skip scan entirely. Display: "Prior run scan: insufficient data (N/3 sessions)."
- **Gaps:** G1, G5 (partial) | **Effort:** Medium | **Confidence: High**
- **Files:** `shared/spawn-core.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`

**R6 — Inject `### Prior Run Insights` into Context block**
- In `shared/discovery-interview.md` Output Compilation, add `### Prior Run Insights` after `### Project Analysis`. Populate from R5 scan. Hard limit: max 3 bullets, max 100 words (prevents context bloat). If cold-start guard fires, omit subsection entirely — no empty placeholder.
- **Gaps:** G1 | **Effort:** Medium | **Confidence: High**
- **File:** `shared/discovery-interview.md`
- **Dependency:** R5 (prerequisite)

**R5a — Add `### Lessons Applied` to spawn prompt templates**
- Add `### Lessons Applied` subsection to Planning Context Template in `shared/planning-blueprints.md` and build mode in `commands/spawn-build.md`. Lead populates from R5 scan before dispatching. Content: 1–3 bullets from prior AAR plugin-scope improvements relevant to this spawn. Omit if R5 returns no data. Gives G5 (static team composition) a human-in-the-loop path without requiring blueprint automation.
- **Gaps:** G5 | **Effort:** Medium | **Confidence: Medium**
- **Files:** `shared/planning-blueprints.md`, `commands/spawn-build.md`
- **Dependency:** R5

**R7 — Expected Outcomes for Research + Planning modes only** *(scoped from 6 modes)*
- Add Expected Outcomes compilation step to `shared/discovery-interview.md` for Research and Planning only (Design/Brainstorm/Productivity deferred). Per-mode format:
  - Research: Decision question + options + minimum confidence level for recommendation
  - Planning: Phase count + feasibility constraint + stakeholder success definition
- Write to `### Expected Outcomes` in Context block. Update evaluate-spawn Think profile to check against it: "Did the output address the Expected Outcomes defined before spawning?"
- **Gaps:** G3 | **Effort:** High | **Confidence: Medium**
- **Files:** `shared/discovery-interview.md`, `commands/spawn-think.md`, `skills/evaluate-spawn/SKILL.md`
- **Dependency:** None (independent; deferred modes can be added later)

---

### Phase C: Structural (future, data-dependent)

**R10 — `/calibrate-scoring` command**
- New command that aggregates Build profile retrospectives: score accuracy (R3) + gate bypass data (R11). Surfaces trend: "N/M sessions: score too optimistic. Recommend raising threshold to 5/6." User makes rubric change manually (plugin cannot self-modify — this is by design, not a gap).
- **Blocked by data volume:** Implement after 10+ Build profile retrospectives exist with R3 score-accuracy question answered.
- **Gaps:** G4, G8, G9 | **Effort:** High | **Confidence: Medium**
- **Files:** `(new) commands/calibrate-scoring.md`, `shared/spec-quality-scoring.md`
- **Dependencies:** R3, R11; minimum 10 Build retrospectives

---

## Recommendation Summary Table

| Rank | Rec | Phase | Gaps | Effort | Confidence | Owner File(s) |
|------|-----|-------|------|--------|------------|---------------|
| 1 | R1 — Calibration counter | A | G4, G7 | Low | High | `shared/spec-quality-scoring.md` |
| 2 | R3 — Score accuracy immediate | A | G4, G7 | Low | High | `skills/evaluate-spawn/SKILL.md` |
| 3 | R4 — Retrospective nudge (shutdown) | A | G6, G10 | Low | High | `shared/shutdown-protocol.md` |
| 4 | R2 — Unified correction protocol | A | G2, G5 | Medium | High | `shared/scenario-collection.md` |
| 5 | R11 — Gate bypass tracking | A | G9 | Low | Medium | `skills/evaluate-spawn/SKILL.md` |
| 6 | R5 — Retrospective scan | B | G1, G5 | Medium | High | `shared/spawn-core.md` + 3 cmds |
| 7 | R6 — Prior Run Insights injection | B | G1 | Medium | High | `shared/discovery-interview.md` |
| 8 | R5a — Lessons Applied section | B | G5 | Medium | Medium | `shared/planning-blueprints.md` |
| 9 | R7 — Expected Outcomes (R+P only) | B | G3 | High | Medium | `shared/discovery-interview.md` |
| 10 | R10 — /calibrate-scoring command | C | G4, G8, G9 | High | Medium | `(new) commands/calibrate-scoring.md` |

**Dropped:** R9 (`--patch` flag) — state reconstruction post-shutdown is unsolvable in the markdown+hooks architecture. R2 (strengthened) covers the majority use case within active session where context is preserved.

---

## Implementation Sequencing

```
Week 1  R1, R3, R4, R11   Quick wins — independent, low effort, populate retrospective data
Week 2  R2                 Correction protocol — medium effort, needs careful sequence spec
Week 3  R5                 Retrospective scan — enables R6 and R5a
Week 4  R6, R5a            Injection and Lessons Applied — depend on R5
Week 5+ R7                 Expected Outcomes — high effort, independent
Future  R10                Calibrate-scoring — blocked by data volume (10+ Build retrospectives)
```

---

## Key Risk Interactions

The 10 gaps compound through a central chain:

```
G1 (no retrieval) → G4 (static thresholds) → G9 (gate bypass) → low-spec spawns → G2 (no rework)
       ↓                      ↓                                                         ↓
G10 (deferred items)    G6 (no nudge)                                       G7 (orphaned data)
       ↓
G8 (no aggregate view) → G5 (blueprints never updated)
```

Fixing G1 (retrieval — R5/R6) makes every other capture mechanism valuable retroactively. It is the highest-leverage structural fix. The quick wins (R1–R4) should ship first to populate the data that retrieval depends on.

---

## What Was Not Addressed

**G5 (static team composition) remains partially open.** R2 (correction loop within active team) and R5a (Lessons Applied section) partially address it, but neither automatically propagates recurring AAR improvements to blueprint files. A future `/update-blueprint` command (reads AAR improvement tables, proposes diff to blueprint) would fully close this gap. Not recommended now — requires sufficient retrospective data volume.

**Design/Brainstorm/Productivity outcome-setting deferred.** R7 is scoped to Research + Planning only. These three modes can be added in a follow-on once the two-mode pattern is validated.

**Calibration loop does not self-close.** By design: the plugin cannot self-modify. R10 surfaces calibration recommendations; the user makes rubric changes manually. This is the correct architecture — frame as human-assisted loop, not self-learning system.

---

## Open Questions for Implementation Spec

1. **evaluate-spawn question cap:** R3 + R11 both add questions to Build profile. Hard cap is 3 (including auto-derived scenario coverage). If cap is binding, R3 takes priority.
2. **Cold-start threshold:** R5 uses "fewer than 3 matching retrospectives" as guard. This threshold should be configurable or reconsidered after initial rollout.
3. **R7 boilerplate risk:** Per-mode Expected Outcomes formats must be specific enough to be useful but not so prescriptive that they generate boilerplate. Spec work needed before implementation.
