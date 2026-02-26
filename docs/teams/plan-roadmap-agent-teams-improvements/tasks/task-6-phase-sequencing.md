# Task 6: Phase Sequencing by Dependency Order and Risk

## User-Confirmed Decisions (binding constraints from Task #5 gate)
- Phase 1: Refinement → Scoring → Scenario Validation (v0.16.0)
- Phase 2: AI Review Checklist + Mock Repository (v0.17.0)
- Phase 3: System Docs + Insight Embedding (v0.18.0)
- Refinement ships before Scoring (confirmed)
- Mock Repository scoped to convention + prompt change only
- Breaking changes OK
- **New addition: Post-Spawn Workflow Evaluation** — placement analysis below

---

## Post-Spawn Workflow Evaluation: Placement Decision

**Question:** Phase 1 (close the loop immediately), Phase 2, Phase 3, or its own phase?

**Analysis:**

| Option | For | Against |
|---|---|---|
| Phase 1 (as 1d) | Closes feedback loop earliest; J-curve value is highest at Phase 1 adoption | No scenario pass rate data yet (1c just shipped); rubric is brand new with no baseline |
| Phase 2 (confirmed placement) | Phase 1 data gives meaningful signal; checklist defines quality dimensions the evaluation can assess | Delays self-improvement by one release cycle |
| Phase 3 | Most data accumulated | Too late — misses highest-learning period |
| New phase | Clean separation | Unnecessary fragmentation |

**Decision: Phase 2 (confirmed) — between AI Review Checklist and Mock Repository.**

By Phase 2, Seth has run multiple Phase 1 sessions. The checklist (2a) gives the evaluation structured output quality dimensions. Evaluation data then flows back into Phase 1 shared files (scoring rubric, refinement question bank) without a re-release — just content updates.

**Implementation form: new `/evaluate-spawn` skill (not a Stop hook, not a teammate)**

- Stop hook: fires after every agent stop — too noisy, wrong granularity
- Post-shutdown step: fragile, no structured output
- New skill: voluntary, low-friction, runs once after Seth reviews deliverables

**Data the skill captures:**
1. Spec score vs actual output quality (did the score predict quality correctly?)
2. Scenario pass rate (what fraction of pre-spawn scenarios did the Tester validate?)
3. Mid-flight pivots (scope gaps the team hit that the spec missed)
4. Rework count (tasks corrected after initial completion)

**Output:** `docs/retrospectives/[team-name].md` — cumulative retrospective corpus

**Feeds back into:** `shared/spec-quality-scoring.md` (rubric calibration) and `shared/spec-refinement.md` (question bank additions) as Seth runs more sessions

---

## Full Sequenced Roadmap

### Phase 1 — Spec-to-Spawn Quality Loop (v0.16.0)

**Internal sequence (hard dependency order):**

```
1a. Specification Refinement Phase
    ↓ produces edge case data
1b. Specification Quality Scoring
    ↓ ensures spec passes bar before spawning
1c. External Scenario Validation
    ↓ behavioral acceptance criteria stored before spawn
```

**Why Refinement before Scoring:** Scoring's "edge case coverage" dimension has no data source without Refinement. Scoring first would require a manual edge-case prompt that Refinement formalizes anyway — duplicated effort.

**Why Scenario Validation last in Phase 1:** Depends on having a quality spec (from 1a+1b) to write meaningful scenarios against. Could ship independently, but value is lower with under-specified specs.

**Risk:** Phase 1 is the largest bundle (3 improvements, 4 new shared files, modifications to 3 existing command files). If sequencing within Phase 1 slips, all three ship together or not at all. Mitigation: treat 1a as the anchor — it's the simplest change (a new section in discovery-interview.md) and unblocks 1b and 1c.

---

### Phase 2 — Output Quality + Feedback Loop (v0.17.0)

**Internal sequence:**

```
2a. AI-Code Review Checklist
    ↓ defines what "quality" means structurally
2b. Post-Spawn Workflow Evaluation
    ↓ captures quality signal per session; feeds back to Phase 1 artifacts
2c. Centralized Mock Repository
    (independent — can ship concurrently with 2b)
```

**Why Evaluation before Mock Repository:** Evaluation captures mock-related friction data — whether mock creation is actually a pain point at Seth's session volume. If evaluation data shows mocks aren't a bottleneck, Mock Repository scope can be further reduced. Low risk to sequence it last either way since 2b and 2c don't block each other.

**Risk:** Evaluation requires Seth to actually respond to post-session prompts. If the prompt is too long or interrupts flow, it'll be skipped. Mitigation: cap at 3 questions, make it opt-in with a Stop hook that asks once, and default to "skip" if no response within 30 seconds.

---

### Phase 3 — Long-Term Asset Accumulation (v0.18.0)

**Internal sequence:**

```
3a. System-Level Documentation (ADR output)
    ↓ evaluation corpus informs what decisions deserve ADR documentation
3b. Recording Insight Embedding
    (polish pass — applied across all prior improvements as language updates)
```

**Why Insight Embedding last:** It's framing, not mechanics. Applying it before the workflow changes are stable risks re-framing prompts that are still changing. Better to finalize behavior in Phases 1-2, then harmonize the language in Phase 3.

**Risk:** Lowest. Both are additive changes with no breaking effects on prior improvements.

---

## Cross-Phase Dependency Map

```
Phase 1: Refinement → Scoring → Scenarios
              ↓ (data flows into)
Phase 2: AI Review Checklist → Evaluation → Mock Repository
              ↓ (evaluation feeds back to Phase 1 artifacts)
Phase 1: [Scoring rubric updated] [Refinement questions updated]
              ↓ (evaluation corpus informs)
Phase 3: System Docs (ADRs) → Insight Embedding
```

**Key feedback loop:** Phase 2's Evaluation is the only cross-phase data dependency. It writes to `docs/evaluations/` and feeds improvements back into `shared/spec-quality-scoring.md` and `shared/spec-refinement.md` — not a new release, just updated content in existing files.

---

## Risk Register

| Risk | Phase | Likelihood | Mitigation |
|---|---|---|---|
| Phase 1 bundle too large to ship atomically | 1 | Medium | Treat 1a (Refinement) as the releasable anchor; 1b and 1c can be point releases |
| Evaluation prompts skipped | 2 | Medium-High | 3-question max; Stop hook with 30s timeout; opt-in |
| Mock Repository over-engineered | 2 | Low | Scoped to directory convention + prompt change per user decision |
| Insight Embedding creates prompt drift | 3 | Low | Applied as final polish pass with review against prior behavior |
| Scoring threshold wrong for Seth's actual patterns | 1 | Medium | Make threshold user-configurable; default Medium; Evaluation data calibrates it over time |

---

## Sequencing Summary Table

| Order | Improvement | Phase | Version | Hard Deps | Risk |
|---|---|---|---|---|---|
| 1 | Specification Refinement Phase | 1 | v0.16.0 | None | Low |
| 2 | Specification Quality Scoring | 1 | v0.16.0 | Refinement | Low |
| 3 | External Scenario Validation | 1 | v0.16.0 | Scoring (soft) | Low |
| 4 | AI-Code Review Checklist | 2 | v0.17.0 | None | Low |
| 5 | Post-Spawn Workflow Evaluation | 2 | v0.17.0 | Phase 1 data | Medium |
| 6 | Centralized Mock Repository | 2 | v0.17.0 | None | Low |
| 7 | System-Level Documentation | 3 | v0.18.0 | Evaluation corpus (soft) | Low |
| 8 | Recording Insight Embedding | 3 | v0.18.0 | All prior | Low |

---

## Dependency Analysis Note (Prioritizer perspective)

**Contested decision: Post-Spawn Evaluation placement (Phase 1 vs Phase 2)**

The Phase 2 placement above is defensible. However, from a pure dependency standpoint, the evaluation's *primary purpose* is to calibrate the Spec Quality Scoring rubric — a Phase 1 artifact. Placing it in Phase 2 means the scoring rubric runs for an entire release cycle without feedback. The J-curve value (self-improving process) is highest during Phase 1 when patterns are still forming.

**Counter-argument for Phase 1 placement:**
- Evaluation needs scenario pass rate data (1c) — this is available at Phase 1 end
- Rubric calibration is most valuable early, not after Phase 2 when patterns are set
- Stop hook is simpler than a new skill — no user invocation burden

**Why Phase 2 placement wins on pragmatic grounds:**
- A new skill is more robust than a Stop hook (Stop hooks have reliability concerns across different team-lead implementations)
- Seth needs to review deliverables before evaluating — voluntary skill invocation matches the actual workflow better
- Adding a 4th improvement to Phase 1 increases scope risk for the highest-priority release

**Resolution for feasibility review (Task #8):** Evaluate whether Phase 1 evaluation data would materially change the scoring rubric's effectiveness, or whether one release cycle of uncalibrated scoring is an acceptable tradeoff for Phase 1 scope discipline.
