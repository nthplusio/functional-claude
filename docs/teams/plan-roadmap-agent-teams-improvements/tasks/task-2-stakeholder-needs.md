# Task 2: Stakeholder Needs, Workflow Friction, and Practical Constraints

## Conclusions First

**Highest value sequence for solo developer:** Specification Quality Scoring → Specification Refinement Phase → External Scenario Validation → AI-Code Review Checklist → Mock Repository → System Documentation → J-curve insights.

The first three improvements form a tightly coupled **pre-spawn quality loop** that compounds each other's value. The last two improvements (System Docs, J-curve insights) are lowest priority and may not justify the implementation effort for a solo workflow.

---

## Friction Points Each Improvement Addresses

### 1. Specification Quality Scoring (HIGHEST)
**Friction:** No signal on whether the discovery interview produced enough context before spawning. A low-quality spec sends the team off with vague constraints, producing misaligned outputs that require expensive re-spawns or heavy correction mid-flight.

**Current gap in discovery-interview.md:** The adaptive skip logic can bypass questions if `$ARGUMENTS` looks complete — but volume of input doesn't equal quality. Three answered questions may still omit domain-critical constraints (e.g., "what framework?" for a frontend feature).

**Solo developer impact:** High. Wasted team runs burn API budget and time. A score gate before spawning short-circuits the most expensive failure mode.

---

### 2. External Scenario Validation (HIGH)
**Friction:** Acceptance criteria in the Feature Context section are free-form prose. They aren't machine-checkable and don't constrain teammate behavior during implementation. The Tester writes tests based on their interpretation of prose criteria — which may diverge from Seth's intent.

**Current gap:** spawn-build's task 2 (USER FEEDBACK GATE on API contract) asks for approval of *structure*, not *behavior*. No gate exists for validating that the team's implementation plan will actually satisfy the real-world scenarios Seth cares about.

**Solo developer impact:** High. Behavioral scenarios act as a persistent spec artifact — Seth can reference them across multiple sessions without re-explaining what "done" means. This is particularly valuable when chaining `spawn-build → spawn-think --mode review`.

---

### 3. Specification Refinement Phase (HIGH)
**Friction:** Discovery interview only asks up to 5 questions. Edge cases (error handling, empty states, permission boundaries, race conditions) aren't surfaced unless Seth already knows to mention them. Teams then encounter these gaps mid-implementation, causing unplanned mid-session pivots.

**Current gap:** No step between discovery interview compilation and spawning that prompts for edge cases. The `## Feature Context` block gets populated from interview answers only — no adversarial probing.

**Solo developer impact:** High. A brief refinement pass (even 2-3 targeted follow-up questions about edge cases) materially reduces mid-flight surprises. Compounding effect: feeds richer specs into Specification Quality Scoring.

---

### 4. Centralized Mock Repository Pattern (MEDIUM)
**Friction:** The Tester creates mocks for each spawn session independently. Across multiple feature builds, the same external services (APIs, databases, auth providers) get mocked differently each time. This creates inconsistency and cognitive load when reviewing test output.

**Current gap:** spawn-build gives Tester no shared mock baseline — each session starts from scratch.

**Solo developer impact:** Medium. Value compounds over time (more sessions = more consistency benefit), but the upfront cost of establishing the pattern is non-trivial. Lower urgency if Seth runs fewer than ~10 feature sessions/month. Not an org-wide problem — Seth is the only consumer, so standardization matters primarily for his own review sanity.

---

### 5. AI-Code-Specific Review Checklist (MEDIUM)
**Friction:** AI-generated code has predictable failure modes (over-abstraction, redundant error handling, invented APIs, hallucinated dependencies). The current review step in `spawn-think --mode review` uses a generic review framing — no checklist targeting AI-specific patterns.

**Current gap:** No downstream enforcement of AI-code quality patterns. The review team doesn't have a structured prompt for "look for these specific AI failure modes."

**Solo developer impact:** Medium-high. Seth is the reviewer — the checklist acts as an external memory prompt, catching issues Seth might normalize after seeing them repeatedly. Value scales with session volume.

---

### 6. System-Level Documentation Output (LOW)
**Friction:** Documentation teammate produces user-facing docs and API docs, but no system-level architecture documentation that explains *why* decisions were made. This creates a gap when revisiting code weeks later.

**Current gap:** spawn-build's Documentation teammate role is scoped to "user-facing docs, API docs, changelog entries" — architectural decision records (ADRs) and system topology diagrams aren't in scope.

**Solo developer impact:** Low-medium. Seth likely won't revisit architecture docs frequently enough to justify a dedicated teammate. Could be addressed more cheaply as an optional output artifact in the existing Documentation role rather than a separate improvement.

---

### 7. Additional Insights (J-curve, Architect Role, Documentation as Asset) (LOW)
**Friction:** These are mindset/framing improvements, not workflow mechanics. J-curve awareness (productivity dip during AI adoption) and architect role framing are educational — they don't change how spawn commands behave.

**Solo developer impact:** Low. Seth already uses agent teams — he's past the J-curve awareness point. These insights may be better delivered as onboarding materials or CLAUDE.md notes rather than plugin improvements.

---

## Effort-to-Value Assessment

| Improvement | Solo Value | Impl Effort | Effort-to-Value |
|---|---|---|---|
| Specification Quality Scoring | High | Medium | **Excellent** |
| Specification Refinement Phase | High | Low | **Excellent** |
| External Scenario Validation | High | Medium | **Good** |
| AI-Code Review Checklist | Medium-High | Low | **Good** |
| Centralized Mock Repository | Medium | High | Fair |
| System-Level Documentation | Low-Medium | Medium | Poor |
| J-curve / Insights | Low | Low-Medium | Poor |

---

## Compounding Effects Map

```
Specification Refinement Phase
    ↓ produces richer specs
Specification Quality Scoring
    ↓ ensures specs meet bar before spawning
External Scenario Validation
    ↓ produces behavioral acceptance criteria
AI-Code Review Checklist
    ↓ checklist references scenarios as acceptance baseline
Centralized Mock Repository
    ↓ consistent mocks make scenario-based tests more reliable
System-Level Documentation
    (standalone — limited compounding)
```

**Key insight:** Improvements 1-3 form a pre-spawn quality pipeline. Each one raises the floor for the next. Implementing them out of order (e.g., External Scenario Validation before Specification Refinement) means the scenarios get written against underspecified specs — defeating their purpose.

---

## Dependencies Affecting Sequencing

| Dependency | Constraint |
|---|---|
| Specification Quality Scoring requires defined quality dimensions | Must be informed by what Specification Refinement surfaces — implement Refinement first or concurrently |
| External Scenario Validation requires structured acceptance criteria format | Must be defined before the AI-Code Review Checklist references it |
| AI-Code Review Checklist references acceptance scenarios | Blocked on External Scenario Validation format being stable |
| Mock Repository requires identifying what gets mocked | Best implemented after a few sessions using Scenario Validation, so common mock targets are known empirically |

**Recommended sequencing:**
1. Specification Refinement Phase (cheapest, highest upstream value)
2. Specification Quality Scoring (depends on knowing what "good" looks like after refinement)
3. External Scenario Validation (now has richer specs to work from)
4. AI-Code Review Checklist (can reference stabilized scenario format)
5. Centralized Mock Repository (informed by real patterns from sessions 1-4)
6. System-Level Documentation (optional enhancement to existing Documentation role)
7. J-curve / Insights (CLAUDE.md note, not a plugin improvement)

---

## Improvements That May Not Deliver Solo Value

**Centralized Mock Repository:** The consistency benefit is real but accrues slowly. For a solo developer running <20 sessions, the investment in scaffolding a shared mock structure may not pay back. Consider scoping this as "a shared mock baseline suggestion in the Tester's role prompt" rather than a full architectural pattern.

**System-Level Documentation Output:** The value is real but the delivery mechanism (dedicated teammate) is over-engineered for solo use. A cheaper alternative: add an optional `--include-adr` flag to the Documentation teammate that writes an architecture decision record alongside user-facing docs.

**J-curve / Additional Insights:** Not a plugin improvement. Deliver as onboarding documentation or a `/spawn-build --help` tip.

---

## Practical Constraints

- **API budget:** Each spawned team costs tokens. Quality gates before spawning (Scoring, Refinement) directly reduce wasted runs — the most important cost lever.
- **Session coherence:** Seth is solo, meaning he reviews all outputs. Improvements must reduce his review load, not add to it. Checklists and scoring must be brief and actionable, not exhaustive audits.
- **Breaking changes are OK:** No backward-compatibility concern. Improvements can restructure discovery-interview.md and spawn-build.md freely.
- **Each improvement independently releasable:** Scoring, Refinement, and Scenario Validation should each be shippable without requiring the others — even if they compound when combined.
