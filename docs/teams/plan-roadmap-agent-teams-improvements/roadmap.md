---
type: roadmap
team: plan-roadmap-agent-teams-improvements
topic: agent-teams plugin improvements (v0.16.0 – v0.18.0)
date: 2026-02-21
status: approved
versions: v0.16.0, v0.17.0, v0.18.0
---

# Agent-Teams Plugin Improvements Roadmap

## Strategic Context

The bottleneck in v0.15.0 is not team coordination — it's specification fidelity. These improvements close the full loop: sharpen spec inputs (Phase 1), enforce output quality and capture learnings (Phase 2), and accumulate durable knowledge assets (Phase 3).

Cross-cutting frame: every improvement operationalizes Seth's **architect role** — articulating what to build, validating behavior against external reality, not describing how to implement.

---

## Phase 1: Spec-to-Spawn Quality Loop (v0.16.0)

### Goal
Eliminate wasted spawns by closing the pre-spawn quality loop: surface edge cases → score spec completeness → gate on that score → validate output against behavioral scenarios written before spawning.

### Improvements (in delivery order)

#### 1a. Specification Refinement Phase
**What:** Structured edge-case prompting between discovery interview compilation and spawning.

**Files to modify:**
- `shared/discovery-interview.md` — Add `## Refinement Phase` section after `## Output Compilation`

**New files:**
- `shared/spec-refinement.md` — Refinement protocol: prompt engineering for targeted questions, spec output format, integration with scoring

**Mechanism:** After discovery answers are compiled, Claude generates 2–4 follow-up questions derived from the compiled spec content (not a fixed list). Questions probe error states, permission boundaries, empty states, and failure modes. User can skip (typed "skip"); skipping reduces edge-case score.

**Output:** `### Edge Cases` subsection added to Feature Context block.

**Acceptance criteria:**
- Refinement questions are derived from spec content (not boilerplate)
- Output contains `### Edge Cases` subsection in Feature Context
- Skippable without blocking spawn
- Skip penalizes edge-case dimension in quality score

**Success indicator:** `### Edge Cases` section visible in Feature Context summary before spawning.

---

#### 1b. Specification Quality Scoring
**What:** 0–100 score with dimension breakdown, computed after refinement, gates spawning.

**Files to modify:**
- `shared/discovery-interview.md` — Add `## Quality Scoring` section
- `commands/spawn-build.md` — Insert scoring gate between discovery and spawn steps
- `commands/spawn-think.md` — Same insertion for planning/spec modes

**New files:**
- `shared/spec-quality-scoring.md` — Rubric with binary-checkable questions per dimension (static definitions, not runtime-generated)

**Mechanism:**
- Dimensions: Goal clarity, Constraints specificity, Success criteria measurability, Edge case coverage, Acceptance criteria presence
- Each dimension = one binary yes/no question (prevents fluency trap — Claude scoring fluent prose as high quality)
- Default gate threshold: 50 (conservative; calibration mode for first 10 sessions)
- Gate fires below threshold → shows missing dimensions → user can refine or type "proceed"
- Score included in spawn prompt Context so teammates know spec quality at spawn time

**Acceptance criteria:**
- Each dimension evaluated with binary question defined in `shared/spec-quality-scoring.md`
- Default threshold is 50 (configurable via `--min-score N`)
- First 10 sessions show calibration notice
- Gate surfaced missing dimensions specifically
- Score included in spawn prompt Context

**Success indicator:** `Spec Quality Score: 72/100 [Goal: ✓] [Constraints: ✓] [Edge Cases: ✓] [Acceptance Criteria: ✗]` printed before spawn.

---

#### 1c. External Scenario Validation
**What:** Behavioral acceptance scenarios stored outside implementation codebase, validated by Tester against Seth's pre-spawn intent.

**Files to modify:**
- `shared/discovery-interview.md` — Add scenario collection step with concrete Given/When/Then example
- `commands/spawn-build.md` — Add `### Acceptance Scenarios` to Feature Context; add Tester task

**New files:**
- `shared/scenario-collection.md` — Protocol for collecting and storing scenarios
- Convention: `docs/scenarios/[feature-slug].md`

**Mechanism:**
- Discovery interview includes 1 concrete example scenario before prompting Seth to write his own
- Minimum: 2 scenarios (format compliance secondary to coverage)
- Tester receives separate task: "Validate against `docs/scenarios/[feature-slug].md`" distinct from writing unit tests
- Tester produces `### Scenario Notes` flagging invalidated scenarios (scope drift)
- Quality score penalizes missing `### Acceptance Scenarios`

**Acceptance criteria:**
- Discovery interview contains concrete example before prompting
- `docs/scenarios/[feature-slug].md` created for every feature team spawn
- Tester task list shows scenario validation as distinct item
- Tester output includes `### Scenario Notes` section
- Quality score penalizes missing scenarios

**Success indicator:** `docs/scenarios/[slug].md` exists after discovery; Tester task list contains distinct scenario validation task.

### Phase 1 KPIs

| KPI | Target |
|---|---|
| Pre/post refinement score delta | Average ≥ 10 points |
| Gate fire rate | Decreasing trend over time |
| Scenario coverage | 100% of feature team spawns |

### Phase 1 Dependencies
- None (foundational — no prior phase required)
- Internal: 1a must ship before 1b; 1b must ship before 1c (soft dep; 1c independently releasable)

### Phase Independence
Phase 1 alone eliminates wasted spawns and provides verifiable outputs. Full value without Phase 2 or 3.

---

## Phase 2: Output Quality + Feedback Loop (v0.17.0)

### Goal
Enforce quality in what teams produce (review checklist) and close the self-improvement loop (evaluation skill feeds learnings back into Phase 1 rubric and refinement questions).

### Improvements (in delivery order)

#### 2a. AI-Code-Specific Review Checklist
**What:** Structured checklist injected into Quality Reviewer for AI-specific failure modes.

**Files to modify:**
- `commands/spawn-think.md` — Review mode spawn prompt: Quality Reviewer gets checklist

**New files:**
- `shared/ai-code-review-checklist.md` — Checklist with actionable search patterns per failure mode

**Failure modes covered:**
1. Over-abstraction (wrapper classes with no logic)
2. Phantom error handling (catch blocks that only log and rethrow)
3. Hallucinated dependencies (imports of packages not in package.json)
4. Test theater (tests that verify mocks, not real behavior)
5. Redundant validation (identical logic in multiple layers)
6. Missing idiomatic patterns (ignoring codebase conventions)

Each checklist item includes a search pattern ("Check for: catch blocks that do not re-raise or transform the error").

**Acceptance criteria:**
- Checklist injected into Quality Reviewer task in review spawns
- Checklist also available in standalone `spawn-think --mode review`
- Review output contains `### AI Pattern Findings` section (present even with zero findings)
- Each finding identifies: checklist item, file/line, specific issue

**Success indicator:** Review report contains `### AI Pattern Findings` section with specific, located findings.

---

#### 2b. Post-Spawn Workflow Evaluation
**What:** Voluntary `/evaluate-spawn` skill that captures session learnings and feeds them back into Phase 1 rubric and refinement question bank.

**New files:**
- `skills/evaluate-spawn/SKILL.md` — Skill definition
- Convention: `docs/retrospectives/[team-name].md`

**Files to modify:**
- `commands/spawn-build.md` — Add soft prompt in completion message: "Run `/evaluate-spawn` to capture session learnings? (optional)"
- `commands/spawn-think.md` — Same soft prompt

**Mechanism:**
- Voluntary skill; soft prompt at team completion does not block session end
- Exactly 3 questions (hard cap):
  1. Did spec score predict actual output quality?
  2. What was the first thing you had to fix or change? + structured follow-up: "(a) spec didn't mention it, (b) refinement didn't surface it, (c) team ignored it"
  3. What fraction of pre-spawn scenarios did the Tester validate?
- Output appended to `docs/retrospectives/[team-name].md`
- **Note: Rubric updates are manual.** Seth reads `docs/retrospectives/` periodically and updates `shared/spec-quality-scoring.md` and `shared/spec-refinement.md`. The skill produces input; the rubric update is a human step.

**Acceptance criteria:**
- `/evaluate-spawn` skill exists and can be invoked
- Exactly 3 questions with structured follow-up on question 2
- Soft prompt in spawn completion message (does not block session)
- Output written to `docs/retrospectives/[team-name].md` with timestamp
- After 3+ evaluations, rubric shows at least one manually applied update

**Success indicator:** `docs/retrospectives/[team-name].md` grows per evaluation; rubric change traceable to a specific retrospective entry.

---

#### 2c. Centralized Mock Repository Pattern
**What:** Directory convention and Tester prompt change for shared mock fixtures across sessions.

**Files to modify:**
- `commands/spawn-build.md` — Tester instructions: check `docs/mocks/[domain]/` first; contribute new mocks back
- `shared/spawn-core.md` — Project analysis step: scan `docs/mocks/` and report found mocks

**New files:**
- `docs/mocks/README.md` — Convention documentation and contribution instructions

**Convention:** `docs/mocks/[domain]/[entity].mock.ts` or `.json`

**Acceptance criteria:**
- Tester task list includes "check docs/mocks/ for existing mocks" as first mock-related step
- New mocks stored in `docs/mocks/`, not only in `src/`
- Project analysis reports found mocks in team context

**Success indicator:** Tester task list shows "Using N existing mocks from docs/mocks/[domain]/" when relevant mocks exist.

### Phase 2 KPIs

| KPI | Target |
|---|---|
| AI pattern findings per review | Trending toward 0 (or stable if issues are genuine) |
| Evaluation completion rate | ≥ 60% of sessions (voluntary; skips acceptable) |
| Rubric calibration | Score/quality correlation improving over 5+ evaluations |
| Mock reuse rate | ≥ 50% of Tester sessions after 5+ sessions |

### Phase 2 Dependencies
- Phase 1 recommended (Evaluation uses scoring data; Checklist references scenario acceptance baseline)
- No hard dependencies — all three improvements independently releasable

### Phase Independence
Phase 2 without Phase 1: Checklist catches AI failure modes independently. Evaluation still works as a retrospective tool (rubric calibration value lower without Phase 1 scoring data). Mock Repository fully independent.

---

## Phase 3: Long-Term Asset Accumulation (v0.18.0)

### Goal
Convert team run outputs into a compounding knowledge base: durable ADRs per feature, insight-embedded prompts that reinforce architect role across all interactions.

### Improvements (in delivery order)

#### 3a. System-Level Documentation Output (ADRs)
**What:** Documentation teammate produces Architecture Decision Records by default for every feature spawn.

**Files to modify:**
- `commands/spawn-build.md` — Documentation teammate task updated; `--skip-adr` flag suppresses ADR

**New files:**
- `shared/system-doc-protocol.md` — ADR template and Documentation teammate instructions
- Convention: `docs/decisions/[feature-slug]-adr.md`

**Mechanism:**
- ADR is **on by default** (`--skip-adr` to suppress)
- Documentation teammate receives refinement phase output (edge cases, constraints, ambiguity log) as ADR context — enables writing decision rationale, not just implementation observations
- ADR covers: decision made, alternatives considered, constraints that drove the choice, known limitations
- Planning teams scan `docs/decisions/` in project analysis step

**Acceptance criteria:**
- `spawn-build` (no flags) produces `docs/decisions/[feature-slug]-adr.md`
- `--skip-adr` suppresses ADR
- ADR contains "alternatives considered" section with ≥ 1 rejected approach
- Documentation teammate receives refinement output as context
- Planning teams surface existing ADRs in project analysis

**Implementation note:** 3a brief requires reading current `commands/spawn-build.md` before editing — cannot specify exact line numbers from roadmap.

**Success indicator:** ADR present after every feature spawn without explicit flag.

---

#### 3b. Recording Insight Embedding
**What:** Language changes to discovery interview prompts and spawn preambles reinforcing architect role, J-curve awareness, documentation-as-asset framing.

**Files to modify:**
- `shared/discovery-interview.md` — Questions reworded to behavior-first ("What behavior must the system exhibit?")
- `commands/spawn-build.md` — Spawn prompt preamble: architect/implementer role framing
- `shared/spec-quality-scoring.md` — Gate message includes J-curve framing
- `shared/system-doc-protocol.md` (from 3a) — Documentation-as-asset framing

**Mechanism:** Language changes only. No behavioral changes. Apply one file at a time and test.

**Acceptance criteria:**
- No discovery questions ask "how should this be implemented"
- Spawn prompt preamble includes: "Seth is the architect. You are the implementer. Resolve ambiguity by asking, not by deciding."
- Gate failure message includes J-curve framing
- All language changes verified against prior prompt behavior (no unintended behavioral drift)

**Implementation note:** Requires reading each file immediately before editing. Apply sequentially, not all at once.

**Success indicator:** Gate message reads "Spec score: 45/100. Explicit quality gates prevent the J-curve dip. Refine before spawning?"

### Phase 3 KPIs

| KPI | Target |
|---|---|
| ADR adoption rate | ≥ 90% of feature runs (opt-out model) |
| ADR usefulness | ≥ 50% of planning sessions reference ≥ 1 ADR after 5+ ADRs exist |
| Language compliance | 100% of discovery questions behavior-first |
| Planning context richness | ADR count in planning context increases monotonically |

### Phase 3 Dependencies
- Phase 1 recommended (ADR content is richer with refinement phase output as context)
- No hard dependencies — ADRs and insight embedding are independently releasable

---

## Full Roadmap Summary

| Order | Improvement | Phase | Version | Hard Deps | Effort |
|---|---|---|---|---|---|
| 1 | Specification Refinement Phase | 1 | v0.16.0 | None | Low-Medium |
| 2 | Specification Quality Scoring | 1 | v0.16.0 | 1 (Refinement) | Medium |
| 3 | External Scenario Validation | 1 | v0.16.0 | None (soft dep on 2) | Medium |
| 4 | AI-Code Review Checklist | 2 | v0.17.0 | None | Low |
| 5 | Post-Spawn Workflow Evaluation | 2 | v0.17.0 | Phase 1 data (soft) | Medium-High* |
| 6 | Centralized Mock Repository | 2 | v0.17.0 | None | Low |
| 7 | System-Level Documentation (ADRs) | 3 | v0.18.0 | Phase 1 output (soft) | Low-Medium |
| 8 | Recording Insight Embedding | 3 | v0.18.0 | All prior (soft) | Low |

*Adoption risk is the constraint on #5, not implementation complexity.

## New Files Created Across All Phases

| File | Phase | Purpose |
|---|---|---|
| `shared/spec-refinement.md` | 1 | Refinement protocol and prompt engineering |
| `shared/spec-quality-scoring.md` | 1 | Scoring rubric with binary-checkable questions |
| `shared/scenario-collection.md` | 1 | Scenario collection and storage protocol |
| `shared/ai-code-review-checklist.md` | 2 | AI failure mode checklist with search patterns |
| `skills/evaluate-spawn/SKILL.md` | 2 | Post-spawn evaluation skill |
| `docs/mocks/README.md` | 2 | Mock repository convention documentation |
| `shared/system-doc-protocol.md` | 3 | ADR template and Documentation teammate instructions |

## Existing Files Modified

| File | Phases | Changes |
|---|---|---|
| `shared/discovery-interview.md` | 1a, 1c, 3b | Refinement section, scenario collection step, behavior-first language |
| `commands/spawn-build.md` | 1b, 1c, 2b, 2c, 3a | Scoring gate, scenario section, soft eval prompt, Tester mock instructions, ADR task |
| `commands/spawn-think.md` | 1b, 2a, 2b | Scoring gate, review checklist, soft eval prompt |
| `shared/spawn-core.md` | 2c | Project analysis: scan `docs/mocks/` |
