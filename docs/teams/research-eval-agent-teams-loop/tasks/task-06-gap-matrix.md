---
task: 6
title: "Finalized Gap Analysis Matrix with Severity Ratings"
owner: analyst
team: research-eval-agent-teams-loop
date: 2026-02-22
inputs: [task-02-evaluation-framework.md, task-05-deep-dive.md]
---

# Finalized Gap Analysis Matrix

**User-confirmed severity ratings.** All 4 deep-dive areas selected. Roadmap is balanced: quick wins first, structural fixes following.

---

## Complete Gap Analysis Matrix

| # | Gap | Phase(s) | Severity | Root Cause | Consequence |
|---|-----|----------|----------|------------|-------------|
| G1 | **Retrieval gap** — AARs and evaluate-spawn files written but never read by subsequent spawns | 1, 3, 5 | **Critical** | No scan step in spawn-core or discovery-interview reads `docs/retrospectives/`. System-doc-protocol already implements ADR scan — pattern exists, not replicated. | Every spawn starts cold. Learnings captured correctly but siloed. All Phase 5 investment produces zero compound return. |
| G2 | **No rework path** — Low-quality output requires full team re-spawn | 3, 4 | **Critical** | No inline correction protocol in shutdown-protocol.md. No `--patch` flag pattern. Invalidated scenarios have no prescribed response beyond "accept or restart." | Rework cost is 10x incremental cost. Quality bar is not enforced because enforcement is too expensive. Users accept marginal output rather than re-run. |
| G3 | **Think/create outcome gap** — No pre-spawn outcome artifact for 6 of 8 spawn types | 2, 4 | **High** | Scenario collection exists for feature/build only. Discovery interview for think/create modes compiles context but never asks "what does done look like?" No external artifact survives session for evaluate-spawn to check against. | Think/create profile evaluate-spawn has nothing to validate against. Coverage question ("did the team investigate the right things?") is unanswerable without a pre-spawn definition. |
| G4 | **Broken calibration promise** — Scoring thresholds static despite stated calibration mechanism | 1, 5 | **High** | `spec-quality-scoring.md` references "calibration session [N]/10" but the counter is never read from `docs/retrospectives/`. Deferred "score accuracy" items in Build profile retrospectives have no review trigger. | Threshold stays at default 4/6 regardless of observed accuracy. Score accuracy data locked in deferred checkboxes nobody revisits. Calibration Mode message is misleading — it implies adaptation that doesn't occur. |
| G5 | **Static team composition** — Persona instructions and blueprint task structures never updated from AAR findings | 3, 5 | **High** | AAR improvements table (Issue/Impact/Fix/Scope) identifies plugin-scope changes, but applying them requires manual human edits to plugin files. No protocol routes AAR findings back to blueprint templates. | Recurrent failure modes (e.g., late task assignment causing reconciliation overhead) re-occur across sessions. Institutional knowledge stays in `docs/retrospectives/` rather than propagating to spawn behavior. |
| G6 | **Missing retrospective nudge** — No prompt when prior spawn has no retrospective | 4, 5 | **Medium** | evaluate-spawn is voluntary and only mentioned in spawn completion text. No hook or SessionStart check detects missing retrospectives. | Evaluate-spawn completion rate likely low. G1 retrieval fix amplifies this problem — nothing to retrieve if retrospectives aren't being written. |
| G7 | **Deferred-item orphaning** — Score accuracy and first-fix checkboxes never revisited | 5 | **Medium** | Build profile evaluate-spawn places key calibration data in a "Deferred" section with no review trigger or reminder mechanism. | G4 calibration permanently blocked — the data needed to adjust thresholds is captured but never surfaced. |
| G8 | **No aggregate signal** — No summary view across all retrospective files | 5 | **Medium** | No command or protocol aggregates across `docs/retrospectives/*.md`. Patterns visible only to someone who reads every file manually. | Cannot answer "is the plugin improving?" or "what's the most common failure mode?" Cannot prioritize which shared protocol to fix next. |
| G9 | **Mid-gate recovery only** — USER FEEDBACK GATE works during active team but not post-hoc | 3 | **Medium** | Feedback gate is an active-team-only protocol. After team shutdown, no correction mechanism exists other than full re-spawn. | Users who defer review until after session ends have no recovery option. G2 rework path is the structural fix. |
| G10 | **AAR fidelity degradation** — Reduced-fidelity AARs occur when shutdown sequence is wrong | 4 | **Low** | Correct shutdown sequence documented in aar-protocol.md but not enforced. Teammates can be shut down before retrospective questions sent. | Participant voices (the highest-signal section of the AAR) lost. Replacement: lead reconstruction from task data — lower quality. |

---

## Ratings by Phase (Finalized)

| Phase | Completeness | Connectivity | Feedback Integration | Failure Recovery | Measurement | Overall |
|-------|-------------|-------------|---------------------|-----------------|-------------|---------|
| 1. Gather requirements | Good | Good | **Missing** (G1, G4) | Partial | Good | **Medium** |
| 2. Set expected outcomes | Partial (G3) | Good | **Missing** | **Missing** (G3) | Partial | **High** |
| 3. Conduct operations | Good | Good | **Missing** (G5) | Partial (G9) | Partial | **Medium** |
| 4. Review output quality | Good | Partial (G6) | Good | **Missing** (G2) | Partial | **High** |
| 5. Capture and feed back | Partial (G7, G8) | **Critical** (G1) | N/A | **Missing** (G6) | **Missing** (G8) | **Critical** |

---

## Ranked Recommendations — Balanced Roadmap

Organized into three implementation phases: quick wins, medium effort, and structural fixes.

### Phase A: Quick Wins (no new files, protocol additions only)

| Rank | Recommendation | Gaps | Effort | Files |
|------|---------------|------|--------|-------|
| **R1** | **Fix calibration session counter** — Add retrospective count read to `shared/spec-quality-scoring.md`. Count `docs/retrospectives/*.md` files with `spec-score:` frontmatter (not "not scored"). Display accurate "Calibration session N/10" instead of placeholder. Zero behavioral change — just accurate feedback. | G4, G7 | Low | `shared/spec-quality-scoring.md` |
| **R2** | **Add inline correction task protocol** — Add a block to `shared/shutdown-protocol.md`: "If Tester produces Invalidated scenarios, lead creates targeted correction tasks before shutdown. Block AAR until correction tasks complete or user accepts failure." Converts binary accept/restart into three-option decision. | G2, G9 | Low | `shared/shutdown-protocol.md` |
| **R3** | **Move score accuracy from deferred to immediate** — In `skills/evaluate-spawn/SKILL.md` Build profile, move "Score accuracy" from Deferred checkboxes to Question 2 (conditional on Q1 answer). Rephrase to be answerable at spawn completion: "Did the score reflect actual implementation difficulty?" | G4, G7 | Low | `skills/evaluate-spawn/SKILL.md` |
| **R4** | **Add retrospective-missing nudge at spawn completion** — In `shared/spawn-core.md` normal/verbose mode output templates, add: "No retrospective found for this team — run `/evaluate-spawn` to capture learnings." Check `docs/retrospectives/[team-name].md` existence at completion time. | G6 | Low | `shared/spawn-core.md` |

### Phase B: Medium Effort (new subsections, extends existing files)

| Rank | Recommendation | Gaps | Effort | Files |
|------|---------------|------|--------|-------|
| **R5** | **Add retrospective scan to spawn-core Project Analysis** — Add "Retrospective Scan" section to `shared/spawn-core.md` Project Analysis Additions (mirrors existing ADR and Mock scan blocks). Read 3 most recent retrospective files matching current spawn type. Extract `### Actionable Insights` from evaluate-spawn files and improvement table rows with `Scope: plugin` from AAR files. Surface as 1-3 bullets in team context. | G1 | Medium | `shared/spawn-core.md`, `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md` |
| **R6** | **Add `### Prior Run Insights` injection to discovery-interview Context block** — In `shared/discovery-interview.md` Output Compilation section, add `### Prior Run Insights` subsection after `### Project Analysis`. Populated from retrospective scan (R5). Teammates receive prior learnings at spawn time. Requires R5 to be meaningful. | G1 | Medium | `shared/discovery-interview.md` |
| **R7** | **Add `### Expected Outcomes` to think/create discovery compilation** — In `shared/discovery-interview.md`, add Expected Outcomes compilation step for non-feature spawns. Per-mode format (research: decision question + confidence level; planning: phase count + feasibility constraint; review: focus areas + severity threshold; design: user story count + accessibility level; brainstorm: problem space + non-goals; productivity: bottleneck target + success metric). Write to `### Expected Outcomes` in Context block. Update evaluate-spawn Think/Create profiles to check against it. | G3 | Medium | `shared/discovery-interview.md`, `commands/spawn-think.md`, `commands/spawn-create.md`, `skills/evaluate-spawn/SKILL.md` |
| **R8** | **Add scenario invalidation → correction task mapping** — In `shared/scenario-collection.md`, add "Scenario Failure → Correction Task" protocol. When Tester's `### Scenario Notes` contains Invalidated rows, the Tester should identify which implementation task produced the failing code and include a `### Correction Opportunities` section. Lead uses this to create targeted follow-up tasks. | G2 | Medium | `shared/scenario-collection.md` |

### Phase C: Structural Fixes (new commands or significant architectural changes)

| Rank | Recommendation | Gaps | Effort | Files |
|------|---------------|------|--------|-------|
| **R9** | **Add `--patch [team-name]` flag to spawn-build** — Reads `docs/teams/[team-name]/` artifacts and `docs/retrospectives/[team-name].md` for known gaps. Asks user which tasks to redo. Spawns minimal team (1-2 agents) targeted at specific tasks. Overwrites task output files. Eliminates full re-spawn for incremental corrections. | G2, G9 | High | `commands/spawn-build.md` |
| **R10** | **Add `/calibrate-scoring` command** — Reads all Build profile retrospectives from `docs/retrospectives/`. Aggregates score accuracy ratings (from R3, now immediate). Surfaces trend: "7 of 10 sessions: score too optimistic. Recommend raising threshold to 5/6." Requires R3 to be in place first for meaningful data. | G4, G8 | High | `(new) commands/calibrate-scoring.md`, `shared/spec-quality-scoring.md` |

---

## Dependency Graph

```
R1 (calibration counter) ─────────────────────────────────────────┐
R3 (score accuracy immediate) ──────────────────────────────────┐  │
  └─ enables ──────────────────────────────────────────────────►R10 (calibrate-scoring)
                                                                    │
R5 (retrospective scan) ──────────────────────────────────────────►R6 (Prior Run Insights injection)
  └─ makes valuable ─────────────────────────────────────────────►R1 (gives scanner meaningful data to read)

R2 (inline correction protocol) ──────────────────────────────────►R9 (--patch flag, builds on same concept)
R8 (scenario invalidation mapping) ────────────────────────────────►R9

R7 (Expected Outcomes) ─────────────────────────────────────────────► strengthens R5 (outcomes become retrievable)
R4 (retrospective nudge) ───────────────────────────────────────────► increases data for R5, R10
```

**Critical path:** R3 → R10. R5 → R6. R2 → R9.

**Independent quick wins:** R1, R2, R4 can ship in any order with no dependencies.

---

## Implementation Sequencing Summary

```
Week 1: R1, R2, R4 (all quick wins — protocol additions, no new files)
Week 2: R3, R5      (score accuracy immediate + retrospective scan)
Week 3: R6, R7, R8  (inject insights, expected outcomes, correction mapping)
Week 4: R9, R10     (structural: --patch flag, calibrate-scoring command)
```

**Rationale:** Quick wins (R1-R4) deliver immediate value and populate retrospective data that structural fixes (R9, R10) depend on. R5 (retrospective scan) ships in week 2 so that R6 (injection) has meaningful data to work with in week 3.

---

## File Change Summary (Finalized)

| File | Recommendations | Phase |
|------|----------------|-------|
| `shared/spec-quality-scoring.md` | R1 (calibration counter), R10 (threshold update) | A, C |
| `shared/shutdown-protocol.md` | R2 (inline correction protocol) | A |
| `skills/evaluate-spawn/SKILL.md` | R3 (score accuracy immediate), R7 (Expected Outcomes validation) | A, B |
| `shared/spawn-core.md` | R4 (retrospective nudge), R5 (retrospective scan) | A, B |
| `shared/discovery-interview.md` | R6 (Prior Run Insights injection), R7 (Expected Outcomes compilation) | B |
| `commands/spawn-think.md` | R7 (Expected Outcomes per mode) | B |
| `commands/spawn-create.md` | R7 (Expected Outcomes per mode) | B |
| `shared/scenario-collection.md` | R8 (Scenario Failure → Correction Task) | B |
| `commands/spawn-build.md` | R5 (scan trigger), R9 (--patch flag) | B, C |
| `(new) commands/calibrate-scoring.md` | R10 | C |

**10 files total. 4 in Phase A (quick wins), 5 in Phase B (extensions), 1 new in Phase C.**
