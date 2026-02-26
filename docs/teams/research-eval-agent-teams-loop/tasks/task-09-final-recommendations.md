---
task: 9
title: "Final Recommendations with Confidence Levels"
owner: analyst
team: research-eval-agent-teams-loop
date: 2026-02-22
inputs: [task-02, task-03, task-05, task-06, task-07, task-08-cross-review-analyst.md, task-08-cross-review-critic.md]
corrections-applied: [R9 dropped, R2+R8 merged, R4 placement fixed, R5 cold-start guard added, R7 scoped to Research+Planning, R2 re-rated Medium]
---

# Final Recommendations with Confidence Levels

**Basis:** Gap analysis matrix (task-06), Critic corrections (task-07), both cross-reviews (task-08). All binding corrections applied. Three new gaps from cross-review added as R9-R11.

**Confidence scale:**
- **High** — All three perspectives agree, mechanically straightforward, clear file target
- **Medium** — Directionally agreed, implementation details need spec work
- **Low** — Right direction but significant open questions remain

---

## Canonical Gap List (Final)

| # | Gap | Severity | Status |
|---|-----|----------|--------|
| G1 | Retrieval gap — retrospectives never read by subsequent spawns | Critical | Confirmed by all 3 perspectives |
| G2 | No rework path — full re-spawn required for partial failures | Critical | Confirmed; R9 dropped, R2 strengthened |
| G3 | Think/create outcome gap — no pre-spawn definition of done | High | Confirmed; R7 scoped to Research+Planning |
| G4 | Broken calibration promise — static thresholds despite stated mechanism | High | Confirmed |
| G5 | Static team composition — AAR improvements never reach blueprints | High | Gap exists; no direct recommendation yet |
| G6 | Missing retrospective nudge — evaluate-spawn completion rate unknown | Medium | New placement fix from cross-review |
| G7 | Deferred-item orphaning — score accuracy checkboxes never revisited | Medium | Addressed by R3 |
| G8 | No aggregate signal across retrospectives | Medium | Addressed by R10 |
| G9 | Gate bypass untracked — users learn to bypass habitually | Medium | New gap from cross-review |
| G10 | evaluate-spawn completion rate unknown | Medium | New gap from cross-review |
| G11 | ADR creation compliance fragile — one working feedback loop is already fragile | Low | New gap from cross-review |

---

## Final Ranked Recommendations

### Phase A: Quick Wins
*Protocol additions only. No new files. Independent — can ship in any order.*

---

**R1 — Fix calibration session counter**
- **Action:** Add retrospective count read to `shared/spec-quality-scoring.md`. Glob `docs/retrospectives/*.md`, count files with `spec-score:` frontmatter not equal to "not scored". Display accurate "Calibration session N/10" instead of placeholder.
- **Gaps addressed:** G4, G7
- **Effort:** Low
- **Files:** `shared/spec-quality-scoring.md`
- **Confidence: High** — mechanically simple, clear file target, all perspectives agree. Zero behavioral change, just accurate feedback.
- **Dependencies:** None

---

**R2 — Unified inline correction protocol (merged R2 + R8)**
- **Action:** Add a single "Scenario Invalidation → Correction Loop" protocol block to `shared/shutdown-protocol.md`. Canonical location: after Tester validation, before AAR. Add reference link in `shared/scenario-collection.md`.

  Protocol content:
  > If `### Scenario Notes` contains Invalidated rows:
  > 1. Tester includes `### Correction Opportunities` table: Scenario | Root Cause | Affected Task | Suggested Fix
  > 2. Lead reads table and presents user with three options: (a) Accept failure, (b) Create targeted correction tasks for the original implementer (blocks AAR until resolved), (c) Proceed to AAR and address in next spawn
  > 3. If option (b): create tasks with invalidated scenario as context, re-assign to original owner, block AAR/shutdown until complete or user accepts

- **Gaps addressed:** G2, G5 (partially — correction stays in active session, preserving context)
- **Effort:** Medium (Critic correction — not Low; requires specifying sequence position, decision flow, and completion criteria)
- **Files:** `shared/shutdown-protocol.md` (primary), `shared/scenario-collection.md` (reference)
- **Confidence: High** — all perspectives agree on need; merge is the right consolidation; active-session correction preserves context that post-shutdown --patch cannot.
- **Dependencies:** None (R9 dropped; this replaces it)

---

**R3 — Move score accuracy from deferred to immediate**
- **Action:** In `skills/evaluate-spawn/SKILL.md` Build profile, move "Score accuracy" from Deferred checkboxes to an immediate question. Rephrase to be answerable at completion: "Did the spec quality score reflect actual implementation difficulty? (Higher score = easier build?)" Present as a three-option question: matched / score too optimistic / score too pessimistic.
- **Gaps addressed:** G4, G7
- **Effort:** Low
- **Files:** `skills/evaluate-spawn/SKILL.md`
- **Confidence: High** — single file, small change, creates the data that R10 (calibrate-scoring) needs. No downside.
- **Dependencies:** None; R10 benefits from R3 being in place first.

---

**R4 — Retrospective nudge at session end (placement corrected)**
- **Action:** Add to `shared/shutdown-protocol.md` post-AAR section (not `shared/spawn-core.md`): after AAR is written, check if `docs/retrospectives/[team-name].md` exists. If not, display: "No evaluate-spawn retrospective found for this team — run `/evaluate-spawn` to capture learnings before the session ends."
- **Gaps addressed:** G6, G10
- **Effort:** Low
- **Files:** `shared/shutdown-protocol.md` (corrected from spawn-core.md)
- **Confidence: High** — placement correction from Critic is definitively right. AAR sequence is the correct trigger point. Simple existence check on known path.
- **Dependencies:** None

---

**R11 — Add gate bypass tracking to evaluate-spawn**
- **Action:** Add one question to all evaluate-spawn profiles (Build, Think, Create): "Did you override the spec quality gate during setup? If so, was that the right call?" Three options: No override / Yes — override was correct / Yes — should have refined spec first. Write to retrospective frontmatter as `gate-bypassed: true/false` and `bypass-verdict: correct|should-have-refined`.
- **Gaps addressed:** G9
- **Effort:** Low
- **Files:** `skills/evaluate-spawn/SKILL.md`
- **Confidence: Medium** — all three perspectives agree the gap exists but none previously proposed a solution. The mechanism is clear; the question is whether adding a third question to evaluate-spawn increases friction enough to reduce completion rate. Hard cap of 3 questions per profile means this may displace another question.
- **Dependencies:** None; consider whether this displaces R3 if per-profile question caps apply.

---

### Phase B: Medium Effort
*New subsections in existing files. Some dependencies between items.*

---

**R5 — Add retrospective scan to spawn-core Project Analysis (with cold-start guard)**
- **Action:** Add "Retrospective Scan" section to `shared/spawn-core.md` Project Analysis Additions block (mirrors existing ADR scan and Mock scan). Read up to 3 most recent retrospective files matching current spawn type (filter by `profile:` field in evaluate-spawn files, `type:` field in AAR files — two separate checks). Extract `### Actionable Insights` from evaluate-spawn files; improvement table rows with `Scope: plugin` from AAR files.

  **Cold-start guard (Critic correction):** If fewer than 3 matching retrospectives exist, skip scan entirely. Display: "Prior run scan: insufficient data (N/3 sessions)." This prevents noise injection into early spawns.

  Surface findings in team context as: `Prior runs (N found): [1-3 bullets]`

- **Gaps addressed:** G1, G5 (partially — lead sees prior learnings at spawn time)
- **Effort:** Medium (two format variants, field-name mismatch requires handling both `profile:` and `type:`)
- **Files:** `shared/spawn-core.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`
- **Confidence: High** — ADR scan provides the proven pattern. Cold-start guard resolves Critic's concern. The two-format handling is real complexity but well-defined.
- **Dependencies:** R4 (increases retrospective data volume, making scan more useful)

---

**R6 — Inject `### Prior Run Insights` into discovery-interview Context block**
- **Action:** In `shared/discovery-interview.md` Output Compilation section, add `### Prior Run Insights` subsection after `### Project Analysis`. Populate from retrospective scan (R5). Hard limit: max 3 bullets, max 100 words (Critic's context-bloat constraint). Teammates receive prior learnings at spawn time.

  If cold-start guard fires (R5 returns no data): omit subsection entirely — do not add empty placeholder.

- **Gaps addressed:** G1
- **Effort:** Medium
- **Files:** `shared/discovery-interview.md`
- **Confidence: High** — direct extension of R5. The 100-word limit and omit-if-empty behavior resolve both the context-bloat concern and the cold-start noise concern. Requires R5.
- **Dependencies:** R5 (prerequisite — injection is meaningless without scan)

---

**R7 — Add `### Expected Outcomes` to Research and Planning discovery compilation (scoped)**
- **Action:** In `shared/discovery-interview.md` and the relevant command files, add Expected Outcomes compilation step for Research and Planning spawns only (not Design, Brainstorm, Productivity — deferred). Per-mode format:
  - **Research:** Decision question + options under consideration + minimum confidence level for recommendation
  - **Planning:** Phase count + feasibility constraint + stakeholder success definition

  Write to `### Expected Outcomes` in Context block. Update evaluate-spawn Think profile to validate against it when present: "Did the output address the Expected Outcomes defined before spawning?"

- **Gaps addressed:** G3
- **Effort:** High (Critic correction from Medium — two modes × two files + evaluate-spawn update)
- **Files:** `shared/discovery-interview.md`, `commands/spawn-think.md`, `skills/evaluate-spawn/SKILL.md`
- **Confidence: Medium** — direction is right, scoping is right, but per-mode format definitions need careful spec to avoid boilerplate that discourages spawning. Brainstorm/Productivity deferred deliberately.
- **Dependencies:** None (builds on existing discovery interview structure)

---

**R5a — Add `### Lessons Applied` section to spawn prompt templates (G5 lightweight fix)**
- **Action:** Add a `### Lessons Applied` subsection to the Planning Context Template in `shared/planning-blueprints.md` and equivalent templates in `commands/spawn-build.md`. The lead populates this from R5's retrospective scan before dispatching the team. Content: 1-3 bullet points from prior AAR plugin-scope improvements that are relevant to this spawn. If R5 returns no data, section is omitted.

  This gives G5 (static team composition) a concrete action path without requiring blueprint automation: the lead applies prior learnings as explicit context rather than hardcoded changes to the blueprint.

- **Gaps addressed:** G5
- **Effort:** Medium
- **Files:** `shared/planning-blueprints.md`, `commands/spawn-build.md`
- **Confidence: Medium** — addresses an unresolved gap (flagged in analyst cross-review). Lightweight mechanism; depends on R5 for data. May not fully resolve G5 but provides a human-in-the-loop path until automation is warranted.
- **Dependencies:** R5

---

### Phase C: Structural (future)
*Requires data accumulation from Phase A/B before delivering value.*

---

**R10 — Add `/calibrate-scoring` command**
- **Action:** New command that reads all Build profile retrospectives from `docs/retrospectives/`. Aggregates `gate-bypassed` and `bypass-verdict` (from R11) and score accuracy (from R3, now immediate). Surfaces trend summary: "N of M sessions: score too optimistic. N bypasses of which X% were later judged incorrect. Recommend raising threshold to 5/6." User makes the actual rubric change manually.
- **Gaps addressed:** G4, G8, G9
- **Effort:** High
- **Files:** `(new) commands/calibrate-scoring.md`, `shared/spec-quality-scoring.md`
- **Confidence: Medium** — mechanically feasible, value clear, but blocked by data volume. Needs 10+ Build profile retrospectives with R3 question answered. At current usage rates this is a future milestone, not near-term. Mark explicitly as "blocked by data volume — implement after 10 Build retrospectives."
- **Dependencies:** R3 (score accuracy immediate), R11 (gate bypass tracking). Do not implement until both are in place and 10+ Build retrospectives exist.

---

## Recommendation Summary Table

| Rank | Rec | Phase | Gaps | Effort | Confidence | Files |
|------|-----|-------|------|--------|------------|-------|
| 1 | R1 — Fix calibration counter | A | G4, G7 | Low | High | `shared/spec-quality-scoring.md` |
| 2 | R3 — Score accuracy immediate | A | G4, G7 | Low | High | `skills/evaluate-spawn/SKILL.md` |
| 3 | R4 — Retrospective nudge (shutdown) | A | G6, G10 | Low | High | `shared/shutdown-protocol.md` |
| 4 | R2 — Unified correction protocol | A | G2, G5 | Medium | High | `shared/shutdown-protocol.md`, `shared/scenario-collection.md` |
| 5 | R11 — Gate bypass tracking | A | G9 | Low | Medium | `skills/evaluate-spawn/SKILL.md` |
| 6 | R5 — Retrospective scan (w/ guard) | B | G1, G5 | Medium | High | `shared/spawn-core.md`, 3 command files |
| 7 | R6 — Prior Run Insights injection | B | G1 | Medium | High | `shared/discovery-interview.md` |
| 8 | R5a — Lessons Applied section | B | G5 | Medium | Medium | `shared/planning-blueprints.md`, `commands/spawn-build.md` |
| 9 | R7 — Expected Outcomes (Research+Planning) | B | G3 | High | Medium | `shared/discovery-interview.md`, `commands/spawn-think.md`, `skills/evaluate-spawn/SKILL.md` |
| 10 | R10 — /calibrate-scoring command | C | G4, G8, G9 | High | Medium | `(new) commands/calibrate-scoring.md` |

**Dropped:** R9 (--patch flag) — state reconstruction unsolvable in markdown architecture; R2's strengthened correction loop covers the majority use case.

---

## Implementation Sequencing

```
Week 1: R1, R3, R4, R11  (all quick wins — independent, low effort)
Week 2: R2                (correction protocol — medium effort, spec needed)
Week 3: R5                (retrospective scan — medium effort, enables R6 and R5a)
Week 4: R6, R5a           (injection and Lessons Applied — depend on R5)
Week 5+: R7               (Expected Outcomes — high effort, independent)
Future: R10               (calibrate-scoring — blocked by data volume)
```

**Rationale:** R1/R3/R4 populate retrospective data and fix trust issues before retrieval (R5/R6) has data to scan. R2 ships early because it addresses the immediate quality-recovery gap. R7 is independent and can run in parallel but is high effort so placed after quick wins are captured.

---

## Open Questions for Implementation

1. **Question cap conflict:** R3 and R11 both add questions to evaluate-spawn. Build profile currently has 2 explicit questions (hard cap: 3 including auto-derived). If scenario coverage counts as Q1, adding both R3 and R11 hits the cap. Priority: R3 > R11 for Build profile.

2. **G5 completeness:** R2 (inline correction) and R5a (Lessons Applied) together partially address static team composition, but neither automatically updates blueprints when recurring patterns emerge. A future mechanism (e.g., a `/update-blueprint` command that reads AAR improvements and proposes changes) would fully close G5. Not recommended now — data volume required.

3. **Calibration loop closure:** R10 produces a recommendation ("raise threshold") but the user makes the actual change manually. This is correct given the plugin architecture — the plugin cannot self-modify. The final report should frame calibration as a human-assisted loop, not a self-learning system.
