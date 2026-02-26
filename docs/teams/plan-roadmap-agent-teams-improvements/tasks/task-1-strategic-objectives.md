# Task 1: Strategic Objectives for Agent-Teams Improvements

## Strategic Framing

The 7 improvements address a single root problem: **the bottleneck has shifted from spawning teams to specifying what they should build**. v0.15.0 solved team coordination; these improvements solve specification fidelity and output correctness.

The cross-cutting insight from the recording: these improvements operationalize the **architect role**. Seth is not a coder using AI — he is a system architect who articulates requirements, validates behavior, and ensures continuity. Every improvement either sharpens the specification input or validates the output against external reality.

---

## Strategic Objectives by Improvement

### 1. Specification Quality Scoring (HIGHEST)
**Strategic Objective:** Make spec completeness visible before spawning, eliminating "garbage in, garbage out" cycles.

**Business Value:** A team spawned on an incomplete spec produces output that requires costly rework or re-spawning. Scoring converts an implicit problem into an explicit gate — Seth sees the quality score before committing team resources.

**Classification: Foundational.** This is the entry point to the entire pipeline. Every other improvement's value depends on teams receiving high-quality specifications. Low scoring specs produce shallow team outputs regardless of how good the review checklist or scenario validation is.

**Key metric:** Reduction in post-spawn "this missed the point" iterations.

---

### 2. Specification Refinement Phase (HIGH)
**Strategic Objective:** Add a structured gap-closing step between discovery and spawning that surfaces edge cases and generates a structured spec artifact.

**Business Value:** The discovery interview collects intent. The refinement phase converts intent into an unambiguous specification — asking about edge cases, failure modes, and unstated assumptions. This is the skill the recording identifies as scarce: articulating requirements with zero ambiguity.

**Classification: Foundational.** Works directly with Specification Quality Scoring — refinement is the mechanism that raises a low score to a passing score. The scored output of refinement becomes the spec passed to `/spawn-build`.

**Key metric:** Structured spec artifact produced before every team spawn; score improvement delta between pre- and post-refinement.

---

### 3. External Scenario Validation (HIGH)
**Strategic Objective:** Keep behavioral acceptance scenarios separate from test code so AI-generated tests cannot be gamed.

**Business Value:** AI optimizes for what it can see. When tests and acceptance criteria live in the same codebase the AI writes, it can produce tests that pass without functional correctness. Scenarios stored outside the implementation codebase create an independent validation signal — the ML holdout set analogy.

**Classification: Foundational** (for output correctness). Independently releasable, but its value compounds with every feature team spawned. Without this, the Tester teammate's output is unverifiable.

**Key metric:** Features that pass internal tests but fail external scenarios (catching regressions the Tester missed).

---

### 4. Centralized Mock Repository Pattern (MEDIUM)
**Strategic Objective:** Standardize how feature teams create and consume test fixtures so mocks are reusable, not recreated per team.

**Business Value:** Each feature team currently creates ad-hoc mocks. Over time this produces drift, duplication, and inconsistency. A centralized mock registry reduces Tester teammate setup time and improves test reliability across teams.

**Classification: Incremental.** Valuable independently, but does not unlock other improvements. Highest value once External Scenario Validation is in place — scenarios and mocks share the same "external to implementation" principle.

**Key metric:** Reduction in Tester teammate context used on mock creation; cross-team mock reuse rate.

---

### 5. AI-Code-Specific Review Checklist (MEDIUM)
**Strategic Objective:** Give the review team a checklist tuned to patterns AI-generated code uniquely produces (over-abstraction, security theater, duplicated logic, phantom error handling).

**Business Value:** A generic code review misses AI-specific failure modes. This checklist makes the `/spawn-think --mode review` team more effective at catching the patterns that matter most in an AI-first workflow.

**Classification: Incremental.** Independently valuable; highest value when paired with External Scenario Validation (scenarios catch functional failures, the checklist catches structural ones).

**Key metric:** Review findings categorized as AI-specific patterns vs general issues.

---

### 6. System-Level Documentation Output (LOW)
**Strategic Objective:** Upgrade the Documentation teammate to produce system-level docs (architecture, decision rationale, cross-team context) alongside feature-level docs.

**Business Value:** As Seth manages larger scopes through agent teams, documentation becomes business continuity — the record of what was built, why, and how components relate. Feature-level docs exist already; system-level docs are the gap. This operationalizes documentation as a strategic asset, not an afterthought.

**Classification: Incremental.** Independently deliverable. Value grows over time as the corpus of team outputs accumulates — each system-level doc makes the next planning session richer.

**Key metric:** Time to onboard (self) back into a module after a gap; richness of context available to planning teams.

---

### 7. Additional Recording Insights (LOW)
**Strategic Objective:** Bake J-curve awareness, architect role framing, and documentation-as-asset framing into spawn prompts and discovery interviews as durable cross-cutting themes.

**Business Value:** These are mindset patterns, not features. Embedding them in the plugin's prompting ensures every team spawn reflects the right mental model — that Seth is the architect, agents handle implementation, and the goal is redesigned workflow (not AI bolted onto human workflow).

**Classification: Incremental (cross-cutting).** No standalone feature; should be woven into improvements 1–6 as they ship.

---

## Foundational vs Incremental

| Improvement | Classification | Rationale |
|---|---|---|
| Specification Quality Scoring | **Foundational** | Entry gate — everything starts with spec quality |
| Specification Refinement Phase | **Foundational** | Mechanism to improve the spec before it gates spawning |
| External Scenario Validation | **Foundational** | Output correctness — without this, team outputs are unverifiable |
| Centralized Mock Repository | Incremental | Efficiency gain; does not gate other improvements |
| AI-Code Review Checklist | Incremental | Output quality improvement; runs after teams complete |
| System-Level Documentation | Incremental | Accumulates value over time; not a prerequisite |
| Recording Insights (themes) | Cross-cutting | Embedded in all others; not a standalone deliverable |

---

## Compounding Effects

**Chain 1 — Spec pipeline (highest leverage):**
Scoring → Refinement → Higher-quality specs → Better team outputs → Less rework

**Chain 2 — Output verification:**
External Scenarios + AI Review Checklist → Catches functional failures (scenarios) + structural failures (checklist) → Together they validate the full output space

**Chain 3 — Long-term asset accumulation:**
System Documentation + Centralized Mocks → Each team run enriches the corpus available to future teams → Compounding return on each spawn

**Key insight:** Improvements 1–3 (the three foundational ones) form a complete spec-to-validation loop. Shipping them together delivers the largest leverage before moving to incremental improvements.

---

## Cross-Cutting Themes (from recording insights)

These are not separate improvements — they are lenses applied across all 7:

**Architect role:** Discovery interviews and refinement phases should reinforce Seth's role as decision-maker on *what* to build, not *how*. Prompts should ask "what behavior matters" not "how should it be implemented."

**J-curve awareness:** The spec quality scoring and refinement phase address the J-curve directly. The productivity dip comes from bolting AI onto human workflows. Explicit spec gates and refinement steps are the redesigned workflow that skips the dip.

**Documentation as asset:** System-level docs and centralized mocks are the insurance policy. They ensure the value produced by agent teams accumulates into a durable knowledge base, not ephemeral outputs.

---

## Strategic Sequencing Recommendation

**Phase 1 (Foundational loop):** Scoring + Refinement + External Scenarios
**Phase 2 (Output quality):** AI Review Checklist + Centralized Mocks
**Phase 3 (Long-term assets):** System Documentation + Recording Insight themes embedded throughout

Each phase is independently shippable as minor version bumps. Phase 1 produces the largest step-change in workflow quality.
