# Task 4: Implementation Phases with Business Rationale

## Phase Structure (3 Phases)

Both strategic objectives (Task #1) and stakeholder analysis (Task #2) converge on the same grouping. The phase boundaries follow the compounding chain: spec quality feeds output correctness, which feeds long-term asset accumulation.

---

## Phase 1: Spec-to-Spawn Quality Loop

**Improvements:** Specification Refinement Phase + Specification Quality Scoring + External Scenario Validation

**Business rationale:** These three address the same root problem: teams receive under-specified inputs and produce unverifiable outputs. Shipping them together closes the full loop — refinement raises spec quality, scoring gates spawning on that quality, and scenario validation verifies the resulting output against independent behavioral criteria. Any one alone leaves a gap in the chain.

**Solo developer impact:** Directly reduces wasted team runs and mid-flight pivots — the two highest-cost failure modes for a solo developer managing API budget and time.

**Suggested version:** v0.16.0

### Phase 1 Improvements (ordered by internal dependency)

#### 1a. Specification Refinement Phase (first)
- **What it adds:** A structured edge-case prompting step inserted between discovery interview compilation and team spawning
- **Where it lives:** `shared/discovery-interview.md` — new `## Refinement Phase` section added after `## Output Compilation`
- **Trigger:** After interview answers are compiled, before the spawn prompt is finalized
- **Mechanism:** 2-4 targeted follow-up questions derived from the compiled spec — probing for error states, permission boundaries, empty states, and failure modes. Questions should be generated dynamically from the spec content, not a fixed list.
- **Output:** Enriched `## Feature Context` block with an `### Edge Cases` subsection
- **Rationale for ordering:** Refinement is the cheapest improvement and produces the richer specs that make Scoring and Scenario Validation more meaningful. No blocking dependencies.

#### 1b. Specification Quality Scoring (second)
- **What it adds:** A score (e.g., 0-100 or Low/Medium/High) assessing spec completeness before spawning
- **Where it lives:** `shared/discovery-interview.md` — new `## Quality Scoring` section; `commands/spawn-build.md` — new Step between Refinement and Spawn
- **Trigger:** After refinement phase completes
- **Mechanism:** Score across dimensions: Goal clarity, Constraints specificity, Success criteria measurability, Edge case coverage (from refinement), Acceptance criteria (present or absent). Gate: scores below threshold prompt "Your spec scored [X] — missing: [dimensions]. Refine before spawning?"
- **Threshold:** User-configurable, default Medium/60
- **Rationale for ordering:** Depends on refinement having run — scoring edge case coverage requires the refinement phase to have surfaced them first.

#### 1c. External Scenario Validation (third)
- **What it adds:** Behavioral acceptance scenarios stored outside the implementation codebase, referenced by the Tester teammate
- **Where it lives:** New convention: `docs/scenarios/[feature-slug].md` — scenario files; `commands/spawn-build.md` — Tester teammate instructions updated to reference scenario file
- **Trigger:** During discovery interview / refinement — a `### Acceptance Scenarios` subsection is added to the Feature Context
- **Mechanism:** Scenarios written in Given/When/Then format during the pre-spawn phase. Tester is instructed to validate implementation against `docs/scenarios/[feature-slug].md`, not self-generate acceptance criteria.
- **Rationale for ordering:** Richer specs from Refinement produce better scenarios. Scoring validates scenarios are present before spawning.

---

## Phase 2: Output Quality Enforcement

**Improvements:** AI-Code-Specific Review Checklist + Centralized Mock Repository Pattern

**Business rationale:** Phase 1 improves inputs. Phase 2 improves the quality of what teams produce. The review checklist gives Seth a structured lens for catching AI-specific code quality issues. The mock repository reduces test drift across sessions.

**Dependency on Phase 1:** Review checklist benefits from External Scenario Validation being in place — scenarios define what "correct" means, and the checklist identifies structural issues that might cause scenarios to fail. Not a hard dependency, but the combination is more powerful.

**Suggested version:** v0.17.0

### Phase 2 Improvements

#### 2a. AI-Code-Specific Review Checklist
- **What it adds:** A structured checklist added to `spawn-think --mode review` targeting AI-generated code failure modes
- **Where it lives:** `commands/spawn-think.md` (review mode) — new checklist section in the reviewer teammate's instructions
- **Failure modes to target:**
  - Over-abstraction (unnecessary interfaces, over-engineered factories)
  - Phantom error handling (catch blocks that swallow errors silently)
  - Hallucinated dependencies (imports of non-existent packages)
  - Test theater (tests that verify mocks, not real behavior)
  - Redundant validation (validating at every layer with identical logic)
  - Missing idiomatic patterns (not following the codebase's existing conventions)
- **Output:** Review report section `### AI Pattern Findings` alongside existing review findings
- **Rationale for ordering:** Can ship without 2b; simpler to implement.

#### 2b. Centralized Mock Repository Pattern
- **What it adds:** A shared mock baseline convention; Tester is prompted to check `docs/mocks/` before creating new mocks
- **Where it lives:** New convention: `docs/mocks/[domain]/` — shared mock files; `commands/spawn-build.md` — Tester teammate instructions updated
- **Mechanism:** Lead teammate adds a task to check for existing mocks before Tester begins. Tester writes new mocks to `docs/mocks/` for reuse. Optional: a `mock-registry.md` index.
- **Scope constraint for solo:** Keep this lightweight — a directory convention and a Tester prompt change, not a full registry system. Value at low volume doesn't justify heavy infrastructure.
- **Rationale for ordering:** Depends on 2a being stable (review checklist confirms what kinds of mock patterns are good vs. bad before cementing them in a shared repo).

---

## Phase 3: Long-Term Asset Accumulation

**Improvements:** System-Level Documentation Output + J-curve / Architect Role Insights (embedded)

**Business rationale:** As Seth's session count grows, the corpus of team outputs becomes a compounding asset — if it's structured for reuse. Phase 3 upgrades the Documentation teammate to produce system-level artifacts and embeds the recording's cross-cutting insights (architect framing, J-curve awareness, documentation-as-asset) across all improved commands.

**Dependency on Phase 1 + 2:** System docs reference the scenario files and implementation summaries produced in earlier phases. Embedding recording insights is cleaner once the commands are stabilized by earlier phases.

**Suggested version:** v0.18.0

### Phase 3 Improvements

#### 3a. System-Level Documentation Output
- **What it adds:** Optional `--include-adr` behavior for the Documentation teammate; produces Architecture Decision Records (ADRs) and system topology notes
- **Where it lives:** `commands/spawn-build.md` — Documentation teammate role updated; new ADR template in `shared/`
- **Mechanism:** When `--include-adr` flag passed (or Documentation teammate is selected), add a task: `[Documentation] Write ADR for this feature — record the decision made, alternatives considered, and constraints that drove the choice. Output to docs/decisions/[feature-slug]-adr.md`
- **Scope constraint:** Do not make this a full architectural documentation system. One ADR per feature, written by the existing Documentation teammate. Low effort, high long-term value.

#### 3b. Recording Insights Embedded
- **What it adds:** Framing language in discovery interviews and spawn prompts that reinforces Seth's architect role
- **Where it lives:** `shared/discovery-interview.md` — interview questions reworded to ask "what behavior matters" not "how should it work"; `shared/spawn-core.md` — model selection table comments updated
- **Mechanism:** Language change, not behavior change. E.g., "What behavior do you need the system to exhibit?" instead of "What should the feature do?"

---

## Phase Summary Table

| Phase | Improvements | Version | Primary Benefit | Dependency |
|---|---|---|---|---|
| Phase 1 | Refinement → Scoring → Scenario Validation | v0.16.0 | Eliminate wasted spawns; verifiable outputs | None (foundational) |
| Phase 2 | AI Review Checklist + Mock Repository | v0.17.0 | Catch AI code failure modes; reduce test drift | Phase 1 recommended |
| Phase 3 | System Docs + Insight Embedding | v0.18.0 | Accumulate durable knowledge assets | Phase 1+2 recommended |

---

## Business Rationale Summary

**Why this order?** The bottleneck at v0.15.0 is not team coordination — it's spec quality. Phase 1 attacks the bottleneck directly. Phase 2 enforces quality at the output stage. Phase 3 converts one-off team outputs into a compounding knowledge base.

**Why three separate releases?** Each phase is independently valuable. Seth can start seeing returns from Phase 1 without waiting for mock infrastructure (Phase 2) or ADR templates (Phase 3). Breaking changes are acceptable, so each phase can ship cleanly.

**Why is J-curve framing in Phase 3?** It's a polish pass. The workflow changes in Phases 1-2 already address the J-curve mechanically (explicit gates and refinement steps are the redesigned workflow). Framing the language to match is a Phase 3 refinement, not a Phase 1 prerequisite.
