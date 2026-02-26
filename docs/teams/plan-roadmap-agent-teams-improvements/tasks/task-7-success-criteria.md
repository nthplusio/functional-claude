# Task 7: Success Criteria and Acceptance Conditions Per Phase

## How to Use This Document

Each phase's criteria are written to serve as direct acceptance criteria for `/spawn-build --mode feature`. Each item answers: "How do we know this improvement is done and working?"

## Phase Independence Guarantee

Each phase delivers standalone value even if later phases never ship:
- **Phase 1 alone:** Eliminates wasted spawns; provides verifiable outputs. Value: high, immediate.
- **Phase 2 alone (without Phase 1):** Checklist still catches AI code failure modes; evaluation still captures session learnings. Value: medium (lower without Phase 1 scoring data).
- **Phase 3 alone (without Phase 1+2):** ADRs accumulate decision history; insight embedding improves prompting language. Value: low-medium (ADR content is richer when refinement output is available as context).

## Feasibility Refinements Applied (from Task 8)

Changes made to initial criteria based on feasibility review:
1. **Scoring threshold:** Lowered to 50 (conservative) with calibration notice for first 10 sessions
2. **Scoring dimensions:** Must be binary-checkable questions, not impressionistic ratings (fluency trap)
3. **Scenario format:** Added example requirement; minimum bar is 2 scenarios (not strict format)
4. **Tester scenario handling:** Added `### Scenario Notes` for invalidated scenarios (scope drift)
5. **Evaluation questions:** Hard-capped at 3; added structured follow-ups that map answers to fixes
6. **Evaluation adoption:** Added soft prompt in spawn completion message (not a hook)
7. **ADR model:** Changed from opt-in (`--include-adr`) to opt-out (`--skip-adr`) — all feature runs produce ADRs by default
8. **ADR content:** Refinement phase output passed to Documentation teammate as ADR context

---

## Post-Spawn Workflow Evaluation — Placement Decision

**Verdict: Phase 2 (v0.17.0), implemented as a new `/evaluate-spawn` skill.**

**Rationale:**
- Requires Phase 1 data to be meaningful — no scenario pass rate or score correlation data exists until Phase 1 sessions accumulate.
- A Stop hook fires after every agent stop — wrong granularity (too noisy). A skill is voluntary and runs once after Seth reviews deliverables.
- The AI Review Checklist (2a) defines structural quality dimensions that the evaluation can assess, giving it a richer signal.
- Evaluation output feeds back into Phase 1 shared files (`shared/spec-quality-scoring.md`, `shared/spec-refinement.md`) as content updates without requiring a re-release.

**Mechanism:**
- Voluntary skill invoked after Seth reviews team deliverables
- Captures 3–4 questions (< 2 min total):
  1. Did spec score predict actual output quality? (calibration)
  2. What was the first thing you had to fix or change? (scope gaps)
  3. What fraction of pre-spawn scenarios did the Tester validate? (scenario pass rate)
  4. Optional: what refinement question would have prevented the gap?
- Output appended to `docs/retrospectives/[team-name].md`
- Rubric and question bank updated in `shared/` files based on retrospective patterns

**Data captured:**
- Spec quality score vs. actual output quality (correlation tracking)
- Scenario pass rate per team run
- Mid-flight pivots (scope gaps spec missed)
- Retrospective-sourced refinement questions (new edge-case prompts)

---

## Phase 1: Spec-to-Spawn Quality Loop (v0.16.0)

**Improvements:** Specification Refinement Phase → Specification Quality Scoring → External Scenario Validation

### 1a. Specification Refinement Phase

**Acceptance conditions (all must be true):**
- [ ] After discovery interview compilation, Claude presents 2–4 targeted follow-up questions derived from the compiled spec (not a fixed question list)
- [ ] Questions probe at least two of: error states, permission boundaries, empty states, failure modes
- [ ] Output includes a `### Edge Cases` subsection in the Feature Context block
- [ ] Refinement step is skippable (user can type "skip" to proceed without it)
- [ ] If user skips, the quality score reflects missing edge case coverage

**Testable behaviors:**
- Spawn a feature with a vague spec (e.g., "add user settings"). Verify refinement asks about: what happens if settings are invalid, who can edit settings, what the default state is.
- Spawn a feature with a detailed spec. Verify refinement generates different follow-up questions (not boilerplate), or offers a shorter refinement pass.

**Before/After:**
- Before: Discovery interview ends → spawn begins with whatever context was provided
- After: Discovery ends → refinement questions surface 2–4 gaps → enriched spec with explicit edge cases before spawn

**Success indicator visible to user:** `### Edge Cases` section appears in the Feature Context summary printed before spawning.

---

### 1b. Specification Quality Scoring

**Acceptance conditions (all must be true):**
- [ ] Score is computed after refinement phase completes, before spawn executes
- [ ] Score is 0–100 with a dimension breakdown (Goal clarity, Constraints, Success criteria, Edge cases, Acceptance criteria)
- [ ] Each scoring dimension is evaluated via a binary-checkable question, not an impressionistic rating (e.g., "Does the goal include a measurable outcome?" not "Is the goal clear?")
- [ ] Default gate threshold is 50 (conservative for initial calibration); user can override with `--min-score N` or by typing "proceed" at the gate
- [ ] First 10 sessions display calibration notice: "Session #[N] of 10. Threshold calibration in progress — threshold will adjust based on /evaluate-spawn data."
- [ ] Scores below threshold surface which dimensions failed and what's missing
- [ ] Score is included in the spawn prompt's Context section (so teammates know spec quality at spawn time)

**Testable behaviors:**
- Spec with only a goal and no constraints → score should be < 50; gate fires; missing dimensions identified.
- Spec with goal + constraints + edge cases + acceptance criteria → score should be ≥ 75; spawn proceeds without gate.
- User types "proceed" at a failing gate → spawn executes; score still included in spawn prompt.
- Run same spec before and after refinement → post-refinement score is higher (delta is measurable).
- Check scoring prompt implementation → each dimension evaluated with a yes/no question, not a 1-5 rating.

**Before/After:**
- Before: No visibility into spec completeness; spawning on vague specs is silent
- After: Score printed before every spawn; gate fires on low scores; user sees exactly what's missing

**Success indicator visible to user:** `Spec Quality Score: 72/100 [Goal: ✓] [Constraints: ✓] [Edge Cases: ✓] [Acceptance Criteria: ✗]` printed before spawn.

---

### 1c. External Scenario Validation

**Acceptance conditions (all must be true):**
- [ ] Discovery interview includes a scenario collection step with 1 concrete example in Given/When/Then format before prompting Seth to write his own
- [ ] Minimum bar is 2 scenarios (not perfect format required; coverage matters more than syntax)
- [ ] Scenarios are saved to `docs/scenarios/[feature-slug].md` (outside `src/`)
- [ ] Spawn prompt includes `### Acceptance Scenarios` section referencing the scenario file path
- [ ] Tester teammate receives explicit task: "Validate implementation against scenarios in `docs/scenarios/[feature-slug].md` — separate from writing unit tests"
- [ ] Tester output includes `### Scenario Notes` section flagging any scenarios that became invalid due to scope change
- [ ] Quality score penalizes missing `### Acceptance Scenarios` section

**Testable behaviors:**
- Discovery interview prompt → verify it contains an example scenario before asking Seth to write his own
- Spawn a feature → verify `docs/scenarios/[feature-slug].md` exists after discovery with ≥ 2 entries
- Review Tester teammate task list → verify scenario validation task is present and distinct from unit test task
- Write a scenario that the implementation will fail → verify Tester reports the failure (not just passes all unit tests)
- Scope-change a feature mid-session → verify Tester's `### Scenario Notes` section mentions the invalidated scenario

**Before/After:**
- Before: Tester writes tests based on its own interpretation of prose acceptance criteria in the Feature Context
- After: Tester validates against Seth-authored scenarios stored outside the implementation codebase; functional failures are independently detectable

**Success indicator visible to user:** `docs/scenarios/[feature-slug].md` created during discovery; Tester task list shows "Validate against docs/scenarios/..." as a distinct item.

---

### Phase 1 KPIs

| KPI | How to Measure | Target |
|---|---|---|
| Pre-refinement vs. post-refinement score delta | Compare scores before/after refinement step | Average delta ≥ 10 points |
| Gate fire rate | % of spawns where score < 60 before refinement | Decreasing trend over time |
| Scenario coverage | % of features with `docs/scenarios/[slug].md` present | 100% for feature teams |

---

## Phase 2: Output Quality + Feedback Loop (v0.17.0)

**Improvements:** AI-Code-Specific Review Checklist + Post-Spawn Workflow Evaluation + Centralized Mock Repository Pattern

### 2a. AI-Code-Specific Review Checklist

**Acceptance conditions (all must be true):**
- [ ] Quality Reviewer in `spawn-think --mode review` receives a structured checklist in its task instructions
- [ ] Checklist covers all 6 target failure modes: over-abstraction, phantom error handling, hallucinated dependencies, test theater, redundant validation, missing idiomatic patterns
- [ ] Review output includes a `### AI Pattern Findings` section alongside existing review findings
- [ ] Each finding in the section identifies: which checklist item was triggered, file/line location, specific issue
- [ ] Checklist is also injected into standalone `/spawn-think --mode review` invocations

**Testable behaviors:**
- Submit AI-generated code with a catch block that only logs and rethrows → verify checklist flags "phantom error handling" with file reference
- Submit AI-generated code with identical validation logic in 3 layers → verify checklist flags "redundant validation"
- Submit clean, idiomatic code → verify `### AI Pattern Findings` section exists but contains zero findings (not absent)

**Before/After:**
- Before: Review team uses generic code review framing; AI-specific failure modes go unchecked unless Seth spots them manually
- After: Review team systematically checks 6 AI-specific patterns; findings are categorized and actionable

**Success indicator visible to user:** Review report contains `### AI Pattern Findings` section with zero or more specific, located findings.

---

### 2b. Post-Spawn Workflow Evaluation

**Acceptance conditions (all must be true):**
- [ ] `/evaluate-spawn` skill exists and can be invoked after any spawn-build or spawn-think session
- [ ] Skill prompts exactly 3 questions (hard cap); total interaction is < 2 minutes
- [ ] spawn-build and spawn-think completion messages include a soft prompt: "Run `/evaluate-spawn` to capture session learnings? (optional)"
- [ ] Each question includes a structured follow-up that maps the answer to a specific fix (e.g., "Was this because: (a) spec didn't mention it, (b) refinement didn't surface it, or (c) team ignored it?")
- [ ] Evaluation is appended to `docs/retrospectives/[team-name].md` with timestamp and feature slug
- [ ] After 3+ evaluations, scoring rubric and/or refinement question bank reflects at least one change sourced from evaluation answers
- [ ] Skill is voluntary — the soft prompt can be ignored; no gate, no forced interaction

**Testable behaviors:**
- Run `/evaluate-spawn` after a session → verify exactly 3 questions are asked, each with a structured follow-up option
- Verify spawn-build completion message includes soft prompt for `/evaluate-spawn` without blocking the session end
- Answer "The team didn't handle the empty state edge case" to question 2 + select option (b) → verify refinement question bank gains an empty-state question
- Run 5 evaluations → verify `shared/spec-quality-scoring.md` or `shared/spec-refinement.md` has been updated with at least one retrospective-sourced change

**Before/After:**
- Before: Each team run is isolated; lessons from failures don't improve future spawns; J-curve dip repeats
- After: Each evaluation deposits a retrospective; scoring rubric and refinement questions self-improve over time; spec quality score becomes a better predictor of actual output quality

**Success indicator visible to user:** `docs/retrospectives/[team-name].md` grows with each evaluation; rubric change is traceable to a specific evaluation entry.

---

### 2c. Centralized Mock Repository Pattern

**Acceptance conditions (all must be true):**
- [ ] `commands/spawn-build.md` Tester instructions include: "Check `docs/mocks/[domain]/` for existing mocks before creating new ones"
- [ ] Tester instructions include: "Contribute new mocks to `docs/mocks/[domain]/` after creating them"
- [ ] `shared/spawn-core.md` project analysis step scans `docs/mocks/` and reports found mocks in team context
- [ ] Convention is documented: `docs/mocks/[domain]/[entity].mock.ts` or `.json`
- [ ] A `docs/mocks/README.md` exists with the convention and contribution instructions

**Testable behaviors:**
- Spawn a feature team → verify Tester's task list includes "check docs/mocks/ for existing mocks" as first step
- After team completes → verify new mocks created are stored in `docs/mocks/`, not only in `src/`
- Spawn a second feature in the same domain → verify Tester's context includes mocks from previous session

**Before/After:**
- Before: Tester creates mocks ad hoc per session; same external services get mocked differently across runs
- After: Tester checks shared registry first; new mocks are contributed back; consistency improves across sessions

**Success indicator visible to user:** Tester task list shows "Using 3 existing mocks from docs/mocks/auth/" when relevant mocks exist.

---

### Phase 2 KPIs

| KPI | How to Measure | Target |
|---|---|---|
| AI pattern findings per review | Count of `### AI Pattern Findings` items across reviews | Trending toward 0 as teams improve (or stable if issues are real) |
| Evaluation completion rate | % of sessions with an `/evaluate-spawn` run | ≥ 60% (voluntary; skips acceptable) |
| Rubric calibration improvement | Correlation between spec score and actual output quality | Improving trend over 5+ evaluations |
| Mock reuse rate | % of Tester sessions that find and use existing mocks | ≥ 50% after 5+ sessions |
| Review finding actionability | % of findings with file/line reference | 100% |
| Mock contribution rate | % of sessions that contribute new mocks to `docs/mocks/` | ≥ 70% |

---

## Phase 3: Long-Term Asset Accumulation (v0.18.0)

**Improvements:** System-Level Documentation Output + Insight Embedding

### 3a. System-Level Documentation Output

**Acceptance conditions (all must be true):**
- [ ] ADR output is **on by default** for feature team spawns; `--skip-adr` flag suppresses it
- [ ] Documentation teammate receives task: "Write ADR to `docs/decisions/[feature-slug]-adr.md`" by default
- [ ] ADR template covers: decision made, alternatives considered, constraints that drove the choice, known limitations
- [ ] ADR prompt includes the refinement phase output (edge cases, constraints, ambiguity log) as context so the Documentation teammate can write rationale, not just observations
- [ ] ADR is produced alongside (not replacing) existing feature docs
- [ ] Planning teams (`spawn-think --mode plan`) can reference `docs/decisions/` in project analysis step

**Testable behaviors:**
- Run `spawn-build` (no flags) → verify `docs/decisions/[feature-slug]-adr.md` is created
- Run `spawn-build --skip-adr` → verify no ADR is created
- Read ADR content → verify it includes "alternatives considered" section with at least one rejected approach
- Run a planning team after 3+ ADRs exist → verify project analysis step surfaces ADRs and includes them in planning context

**Before/After:**
- Before: Documentation teammate produces user-facing and API docs only; no record of why decisions were made
- After: Every feature run produces a durable decision record by default; planning teams can read past ADRs to avoid re-litigating decisions

**Success indicator visible to user:** `docs/decisions/[feature-slug]-adr.md` present after every feature spawn. Planning team context includes "Found 4 ADRs in docs/decisions/."

---

### 3b. Insight Embedding

**Acceptance conditions (all must be true):**
- [ ] Discovery interview questions use behavior-first language ("What behavior must the system exhibit?" not "What should it do?")
- [ ] Spawn prompt preamble includes architect role framing: "Seth is the architect. You are the implementer. Resolve ambiguity by asking, not by deciding."
- [ ] Spec quality scoring gate message includes J-curve framing: "Explicit spec gates prevent the productivity dip that comes from underspecified AI work."
- [ ] System doc protocol (3a) includes "documentation as strategic asset" framing in its instructions

**Testable behaviors:**
- Read discovery-interview.md → verify no questions ask "how should this be implemented"
- Read spawn-build.md spawn prompt → verify architect/implementer framing is present in teammate context
- Trigger a quality gate failure → verify J-curve framing appears in the gate message

**Before/After:**
- Before: Prompts use implementation-centric language; no explicit architect/implementer role separation; no J-curve messaging
- After: Every interaction reinforces Seth's role as decision-maker; language prevents teams from making architectural choices autonomously

**Success indicator visible to user:** Gate message reads "Spec score: 45/100. Explicit quality gates like this prevent the J-curve dip. Refine before spawning?"

---

### Phase 3 KPIs

| KPI | How to Measure | Target |
|---|---|---|
| ADR adoption rate | % of feature runs producing an ADR (opt-out model) | ≥ 90% (only --skip-adr suppresses) |
| ADR usefulness | % of planning sessions that reference at least one ADR | ≥ 50% after 5+ ADRs exist |
| Language compliance | % of discovery questions with behavior-first framing | 100% |
| Planning context richness | # of docs/decisions/ ADRs surfaced in planning context | Increases monotonically |

---

## Cross-Phase Acceptance: Spec Directly Passable to /spawn-build

Each phase improvement is "done" when its output can serve as the spec for `/spawn-build --mode feature` without additional clarification. Specific tests:

| Phase | Test | Pass Condition |
|---|---|---|
| 1a (Refinement) | Read the enriched Feature Context after refinement | Contains explicit edge cases; no vague statements like "handle errors appropriately" |
| 1b (Scoring) | Read the spawn prompt's Context section | Contains score and dimension breakdown; dimensions map to acceptance criteria |
| 1c (Scenarios) | Read `docs/scenarios/[slug].md` | Each scenario is Given/When/Then; independently verifiable without reading implementation |
| 2a (Review Checklist) | Read a review report | `### AI Pattern Findings` section present; each finding has file + line + checklist item |
| 2b (Evaluation) | Read `docs/retrospectives/[team-name].md` | Each entry contains a timestamped feature slug + answers; rubric change is traceable to evaluation |
| 2c (Mock Registry) | Run two features in same domain | Second feature's Tester reuses mocks from first; no duplicate mock creation |
| 3a (System Docs) | Run `--include-adr` then a planning team | Planning team context mentions ADR; no re-litigating the decision in the planning output |
| 3b (Insight Embedding) | Trigger a gate failure | Gate message is actionable and includes J-curve framing without being verbose |
