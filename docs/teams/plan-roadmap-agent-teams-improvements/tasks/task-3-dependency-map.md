# Task 3: Feature Dependencies and Technical Prerequisites

## Dependency Graph

```
[1] Specification Quality Scoring
        │
        ▼
[3] Specification Refinement Phase ──────────────────────────────────┐
        │                                                             │
        ▼                                                             ▼
[2] External Scenario Validation          [5] AI-Code Review Checklist
        │
        ▼
[4] Centralized Mock Repository Pattern

[6] System-Level Documentation Output (independent)
[7] Recording Insight Themes (cross-cutting — applied to all)
```

**Key constraint:** #1 must ship first. #3 depends on #1. #2 and #5 are independently releasable after #1.

---

## Per-Improvement Analysis

### 1. Specification Quality Scoring

**Depends on:** Nothing — bootstrappable immediately

**Modifies:**
- `shared/discovery-interview.md` — Add scoring logic after compilation step
- `commands/spawn-build.md` — Insert scoring gate between Step 4 (Discovery) and Step 8 (Spawn)
- `commands/spawn-think.md` — Same insertion for planning teams
- `commands/spawn-create.md` — Same insertion (not read, but implied by symmetry with unified commands)

**New artifacts needed:**
- `shared/spec-quality-scoring.md` — Scoring rubric and gate logic (new shared file)

**Technical notes:**
- Scoring runs on the compiled `## [Team-Type] Context` section produced by discovery-interview.md
- Must output a numeric score (0-100) + dimension breakdown before spawn proceeds
- Gate: score below threshold → prompt user to refine or override
- Score appears in spawn prompt's Context section so teammates know spec quality

**Enables:** #3 (refinement needs a defined scoring target), and contextually improves all subsequent spawns

---

### 2. External Scenario Validation

**Depends on:** #1 is helpful but not blocking — scenarios can be collected independently. #1 makes the spec clear enough that scenarios can be written with precision.

**Modifies:**
- `commands/spawn-build.md` — Add Step in discovery interview: collect acceptance scenarios
- `shared/discovery-interview.md` — Add optional scenario question for feature teams
- Spawn prompt template in `spawn-build.md` Feature Mode — add `### Acceptance Scenarios` section to Feature Context
- Feature team task list — add scenario validation task (Tester validates against external scenarios before closing)

**New artifacts needed:**
- `shared/scenario-collection.md` — Protocol for collecting scenarios during discovery and storing them separately from test code
- Convention for scenario storage: `docs/scenarios/[feature-slug].md` — outside `src/` or test directories

**Technical notes:**
- Scenarios are collected during discovery (before spawn), stored in `docs/scenarios/`, referenced in spawn prompt
- Tester teammate task: "Validate implementation against scenarios in `docs/scenarios/[feature-slug].md`" — separate from writing unit/integration tests
- Scenarios are behavior-based ("Given X, when Y, then Z") not implementation-based
- The holdout set property: scenarios written by Seth during discovery, not by the Tester during implementation

**Enables:** #4 (mocks can be mapped to scenarios), improves #5 (checklist can reference scenario failures)

---

### 3. Specification Refinement Phase

**Depends on:** #1 — refinement is the mechanism to raise a failing score. Without a score to target, refinement has no stopping condition.

**Modifies:**
- `commands/spawn-build.md` — Insert refinement phase between discovery interview (Step 4) and spawn (Step 8)
- `commands/spawn-think.md` — Same insertion for planning/spec modes
- `shared/discovery-interview.md` — Add output section describing the structured spec artifact produced

**New artifacts needed:**
- `shared/spec-refinement.md` — Structured refinement protocol: edge-case prompting questions, spec output format, re-scoring loop

**Technical notes:**
- Refinement flow: score low → enter refinement → ask edge-case questions → regenerate Context section → re-score → gate
- The refinement output is a `### Structured Spec` subsection added to the Feature Context in the spawn prompt
- Structured spec format: goal (unambiguous), scope boundary (what's excluded), edge cases (enumerated), ambiguity log (explicit unknowns Seth chose to accept)
- Loop exits when: score passes threshold OR Seth explicitly overrides the gate

**Enables:** Higher-quality input to all spawn commands; directly raises quality score

---

### 4. Centralized Mock Repository Pattern

**Depends on:** #2 (scenarios) is helpful for mapping mocks to scenario inputs, but not strictly required. Can ship independently.

**Modifies:**
- `commands/spawn-build.md` — Feature team spawn prompt: Tester teammate instructions reference mock registry
- `shared/spawn-core.md` — Project analysis step: scan for existing mock registry before spawning

**New artifacts needed:**
- `shared/mock-registry.md` — Convention for `docs/mocks/` registry: schema for mock entries, how to reference, how to contribute
- Convention: `docs/mocks/[domain]/[entity].mock.ts` or `.json` — a discoverable, git-tracked location

**Technical notes:**
- Mock registry lives at `docs/mocks/` (outside `src/` — shared across teams, not owned by any feature branch)
- Tester teammate gets two tasks: (a) check registry for existing mocks, (b) contribute new mocks back to registry
- Project analysis in `spawn-core.md` step gains: "Check `docs/mocks/` for existing mock fixtures"
- Registry schema: entity name, domain, file path, dependencies, last updated by (team name)

**Enables:** Faster Tester teammate startup; cross-team mock consistency

---

### 5. AI-Code-Specific Review Checklist

**Depends on:** #1 improves the spec quality so there's a ground truth to compare against during review, but #5 can ship independently as a review-only change.

**Modifies:**
- `commands/spawn-think.md` — Review mode spawn prompt: Quality Reviewer gets AI-specific checklist
- Optionally: `shared/planning-blueprints.md` if review blueprint is referenced there (it's not — review is inline in spawn-think.md)

**New artifacts needed:**
- `shared/ai-code-review-checklist.md` — The checklist itself: over-abstraction, security theater, duplicated logic, phantom error handling, test-code coupling, and other AI failure modes

**Technical notes:**
- Checklist is injected into Quality Reviewer task in review team spawn prompts
- Not a new teammate — augments existing Quality Reviewer role
- Checklist items should be actionable ("Check for: wrapper classes with no logic, error handlers that only log and rethrow, identical utility functions in multiple modules")
- Can also be used in standalone `/spawn-think --mode review` invocations as a review submode enhancement

**Enables:** More targeted review findings; complements #2 (scenarios catch functional failures, checklist catches structural ones)

---

### 6. System-Level Documentation Output

**Depends on:** Nothing — fully independent, modifies only the Documentation teammate behavior

**Modifies:**
- `commands/spawn-build.md` — Documentation teammate instructions in feature spawn prompt
- The optional Documentation teammate task list: add system-level doc tasks alongside feature-level docs

**New artifacts needed:**
- `shared/system-doc-protocol.md` — Protocol for what system-level docs contain: component relationships, decision rationale, cross-team context, known constraints

**Technical notes:**
- Documentation teammate gains two output targets: (a) existing feature docs (`docs/[feature]/`), (b) system-level docs (`docs/system/`)
- System doc format: component name, dependencies, key decisions, interface contract, known limitations, teams that touched it
- System docs are append-only and cumulative — each feature run enriches the corpus

**Enables:** Richer context for future planning teams (planning teams can read `docs/system/` during project analysis)

---

### 7. Recording Insight Themes (Cross-Cutting)

**Depends on:** Nothing — applied as each improvement ships

**Modifies:**
- Discovery interview prompts: add architect-role framing ("what behavior matters" not "how to implement")
- Spawn prompt preamble: note that Seth is the architect and agents are implementers
- Spec quality scoring (#1): J-curve framing in gate messaging ("explicit spec gates prevent the J-curve dip")
- Documentation improvements (#6): "documentation as strategic asset" framing in system doc protocol

**No new files needed** — embedded as prompt copy changes in existing files during other improvements

---

## Dependency Matrix

| Improvement | Hard Deps | Soft Deps | Blocks |
|---|---|---|---|
| 1. Spec Quality Scoring | none | none | 3 (hard) |
| 2. External Scenario Validation | none | 1 (for precision) | 4 (soft) |
| 3. Spec Refinement Phase | 1 (hard) | none | — |
| 4. Centralized Mock Repository | none | 2 (soft) | — |
| 5. AI-Code Review Checklist | none | 1 (soft) | — |
| 6. System-Level Documentation | none | none | — |
| 7. Recording Insight Themes | none | none | — |

**Hard dep:** Cannot deliver the improvement's core value without the prerequisite
**Soft dep:** Works better with the prerequisite; independently releasable but suboptimal

---

## Modified Files Summary

| File | Improvements That Touch It |
|---|---|
| `shared/discovery-interview.md` | 1, 2, 3 |
| `commands/spawn-build.md` | 1, 2, 3, 4, 6 |
| `commands/spawn-think.md` | 1, 3, 5 |
| `shared/spawn-core.md` | 4 |

**New shared files (one per improvement):**
- `shared/spec-quality-scoring.md` (#1)
- `shared/scenario-collection.md` (#2)
- `shared/spec-refinement.md` (#3)
- `shared/mock-registry.md` (#4)
- `shared/ai-code-review-checklist.md` (#5)
- `shared/system-doc-protocol.md` (#6)

---

## Sequencing Constraint Summary

**Must ship first:** #1 (Spec Quality Scoring) — it's the logical prerequisite for #3 and the soft prerequisite for #2 and #5.

**Can be parallel after #1:** #2 and #5 are independent of each other and of #3.

**#3 requires #1 before starting** — refinement has no exit condition without a scoring target.

**#4 and #6 are fully independent** — can ship in any order, even before #1 if desired.

**#7 is embedded** — applied incrementally as other improvements ship.
