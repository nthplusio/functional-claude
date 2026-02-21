---
name: team-blueprints
description: |
  This skill should be used when the user wants pre-designed agent team configurations for common application development phases. Use this skill when the user asks for a "research team", "feature development team", "code review team", "debug team", "design team", "planning team", "roadmap team", "team blueprint", "team template", or says "spawn a team for [development phase]".

  Provides 8 ready-to-use team blueprints: Research & Discovery, Feature Development, Code Review & QA, Debugging & Investigation, Frontend Design, Planning & Roadmapping, Productivity Systems, and Brainstorming & Ideation.
version: 0.15.3
---

# Agent Team Blueprints

Pre-designed team configurations for eight application development phases. Each blueprint defines the team composition, teammate roles, task structure, and the prompt to use.

## New in v0.15.0: Unified Commands

Three unified commands provide simplified entry points with adaptive sizing, verbosity control, and auto-mode inference. They dispatch to the same blueprints documented below.

| Unified Command | Modes |
|---|---|
| `/spawn-build` | feature, debug |
| `/spawn-think` | research (3 submodes), planning (7 submodes), review (3 submodes) |
| `/spawn-create` | design (3 submodes), brainstorm (4 categories), productivity |

**What unified commands add:**
- **Adaptive sizing** — Auto-recommends solo/pair/full team based on subtask count
- **Verbosity control** — `--quiet`, `--normal` (default), `--verbose` flags
- **Auto-mode inference** — Detects the right mode from your description keywords
- **Streamlined discovery** — 3 core questions + 0-2 optional, with adaptive skip

---

## Blueprint 1: Research & Discovery Team

**When to use:** Exploring a new technology, evaluating approaches, investigating a domain, or gathering information from multiple angles before making decisions.

**Why teams work here:** Research benefits enormously from parallel exploration. A single session gravitates toward one perspective; multiple teammates explore different facets simultaneously and share findings.

**Advanced features:** 3 adaptive modes (Technology Evaluation, Landscape Survey, Risk Assessment), discovery interview (5 core + 2 extended questions per mode), user feedback gate after initial findings, optional teammates (Domain Expert, Implementer), pipeline context for chaining with planning and feature teams.

### Research Modes

| # | Mode | Team Composition | Output |
|---|------|-----------------|--------|
| 1 | **Technology Evaluation** | Explorer, Analyst, Critic | Evaluation report + comparison matrix → `/spawn-think --mode planning`, `/spawn-build --mode feature` |
| 2 | **Landscape Survey** | Explorer, Mapper, Analyst | Landscape map + trend analysis → `/spawn-think --mode research` (Eval mode), `/spawn-think --mode planning` |
| 3 | **Risk Assessment** | Risk Analyst, System Analyst, Mitigator | Risk register + mitigation plan → `/spawn-think --mode planning`, `/spawn-build --mode feature` |

### Representative Spawn Prompt (Technology Evaluation)

```
Create an agent team called "research-eval-[topic-slug]" to evaluate [TOPIC].
Spawn [3-5] teammates:

1. **Explorer** — Investigate each candidate technology in depth: capabilities, API design,
   performance characteristics, maturity, community health, and ecosystem.

2. **Analyst** — Build a structured comparison matrix across all candidates. Evaluate each
   option against the defined criteria. Quantify where possible.

3. **Critic** — Challenge every option and every assumption. For each candidate, identify
   failure modes, scaling limits, vendor lock-in risks, and worst-case scenarios.

## Research Context
[Compiled interview results — research objective, current understanding, constraints, evaluation criteria, candidate options, project analysis]

Tasks:
1. [Explorer] Research each candidate option in depth
2. [Analyst] Define evaluation criteria and build comparison framework
3. [Critic] Identify risks and hidden costs for each option (blocked by 1)
4. [Lead] USER FEEDBACK GATE — present initial profiles, ask user to eliminate options and adjust criteria (blocked by 2, 3)
5. [Explorer] Deep-dive on remaining options (blocked by 4)
6. [Analyst] Finalize comparison matrix (blocked by 4, 5)
7. [Critic] Challenge the leading option (blocked by 6)
8. [All] Cross-review findings
9. [Analyst] Final recommendation (blocked by 8)
10. [Analyst] Compile evaluation report
```

### Configuration Tips

- The spawn command runs a **discovery interview** (5 core + 2 mode-specific questions) before spawning
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- **Optional teammates** add depth: Domain Expert for specialized domains, Implementer for feasibility checking
- The **user feedback gate** after initial findings prevents deep-diving in directions the user doesn't care about
- Use Sonnet for all teammates (research is read-heavy)
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 2: Feature Development Team

**When to use:** Building a new feature that spans multiple layers (frontend, backend, data), multiple modules, or requires parallel implementation tracks.

**Why teams work here:** Feature development benefits from teammates each owning a distinct piece. Cross-layer changes (UI + API + database) are naturally parallelizable when each teammate owns their layer.

**Advanced features:** Discovery interview (5 questions on scope, context, constraints, criteria, quality priority), user feedback gate after API contract definition, optional teammates (DevOps, Documentation), pipeline context for chaining with planning, design, research, and review teams.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Frontend** | UI/UX implementation | Components, pages, state management, styling |
| **Backend** | API & business logic | Endpoints, services, data access, validation |
| **Tester** | Test coverage & integration | Unit tests, integration tests, edge cases |
| **DevOps** (optional) | Infrastructure | Database migrations, CI/CD, environment config |
| **Documentation** (optional) | Docs | User-facing docs, API docs, changelog |

**Pipeline:** Feeds from `/spawn-think --mode planning`, `/spawn-create --mode design`, `/spawn-think --mode research` → feeds into `/spawn-think --mode review`

### Representative Spawn Prompt

```
Create an agent team called "feature-[feature-slug]" to implement [FEATURE].
Spawn [3-5] teammates:

1. **Frontend** — Implement the UI layer. Work in [FRONTEND_DIRS].
2. **Backend** — Implement the API layer. Work in [BACKEND_DIRS].
3. **Tester** — Write comprehensive tests. Work in [TEST_DIRS].

## Feature Context
[Compiled interview results — feature scope, existing context, tech constraints, acceptance criteria, quality priority, project analysis]

Tasks:
1. [Lead] Define API contracts and data flow
2. [Lead] USER FEEDBACK GATE — present API contract to user for approval (blocked by 1)
3. [Backend] Implement API endpoints and services (blocked by 2)
4. [Frontend] Implement UI components and pages (blocked by 2)
5. [Backend] Add input validation and error handling (blocked by 3)
6. [Frontend] Implement data fetching and error states (blocked by 3, 4)
7. [Tester] Write unit tests for backend (blocked by 5)
8. [Tester] Write unit tests for frontend (blocked by 6)
9. [Tester] Write integration tests (blocked by 7, 8)
10. [Backend] Compile implementation summary
```

### Configuration Tips

- The spawn command runs a **discovery interview** (5 questions) before spawning
- The **user feedback gate** after API contract is the key mechanism — changing contracts after implementation is expensive
- Use delegate mode for the lead — keep it focused on coordination
- **Optional teammates** add depth: DevOps for infrastructure-heavy features, Documentation for public-facing features
- Define clear file ownership boundaries to avoid merge conflicts
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 3: Code Review & QA Team

**When to use:** Reviewing a pull request, auditing code quality, or conducting a thorough quality assessment before release.

**Why teams work here:** A single reviewer gravitates toward one type of issue. Splitting review criteria into independent domains means security, performance, and test coverage all get thorough attention simultaneously.

**Advanced features:** 3 adaptive modes (Security-focused, Performance-focused, Balanced), brief interview (3 questions on review focus, change context, known risks), optional teammates (Accessibility Reviewer, Architecture Reviewer), pipeline context for chaining with feature, design, and debug teams.

### Review Modes

| # | Mode | When to Use | Effect |
|---|------|-------------|--------|
| 1 | **Security-focused** | Auth changes, data handling, external integrations, user input | Security Reviewer leads; gets extra tasks for threat modeling |
| 2 | **Performance-focused** | Database changes, high-traffic paths, large data processing | Performance Reviewer leads; gets extra tasks for profiling |
| 3 | **Balanced** (default) | General code changes, feature implementations, refactors | All reviewers equal; standard task distribution |

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Security Reviewer** | Security & vulnerability analysis | Auth, injection, data exposure, OWASP top 10 |
| **Performance Reviewer** | Performance & scalability | N+1 queries, memory leaks, caching, algorithmic complexity |
| **Quality Reviewer** | Code quality & maintainability | Patterns, naming, error handling, test coverage |
| **Accessibility Reviewer** (optional) | WCAG compliance | Keyboard navigation, screen readers, ARIA, color contrast |
| **Architecture Reviewer** (optional) | Structural quality | Design patterns, dependency direction, module boundaries |

**Pipeline:** Feeds from `/spawn-build --mode feature`, `/spawn-create --mode design` → feeds into `/spawn-build --mode debug` (investigate issues), `/spawn-build --mode feature` (rework)

### Representative Spawn Prompt

```
Create an agent team called "review-[target-slug]" to review [TARGET].
Spawn [3-5] reviewers:

1. **Security Reviewer** — Focus exclusively on security implications: authentication
   and authorization checks, input validation, SQL/XSS/command injection risks,
   sensitive data exposure, CSRF protection, and dependency vulnerabilities.
   Rate each finding by severity (Critical/High/Medium/Low).

2. **Performance Reviewer** — Focus on performance impact: database query patterns
   (N+1 queries, missing indexes), memory allocation, caching opportunities,
   algorithmic complexity, bundle size impact, and unnecessary re-renders.
   Estimate performance impact where possible.

3. **Quality Reviewer** — Focus on code quality and maintainability: adherence to
   project patterns, naming conventions, error handling completeness, test coverage
   gaps, documentation needs, and separation of concerns. Check that existing tests
   still pass and new code has adequate coverage.

## Review Context
[Compiled interview results — review focus, change context/intent, known risk areas]

Tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [All] Cross-reference findings across review domains
8. [Quality Reviewer] Compile unified review report with prioritized action items
```

### Configuration Tips

- The spawn command runs a **brief interview** (3 questions) before spawning — review focus, change context, known risk areas
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- **Optional teammates** add depth: Accessibility Reviewer for frontend PRs, Architecture Reviewer for large structural PRs
- No user feedback gate — reviews are single-pass; the cross-reference task serves as internal validation
- Use Sonnet for all reviewers (review is read-heavy analysis)
- The review report feeds into `/spawn-build --mode debug` for investigating issues or `/spawn-build --mode feature` for rework
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 4: Debugging & Investigation Team

**When to use:** Tracking down a hard-to-reproduce bug, investigating a production incident, or debugging an issue where the root cause is unclear.

**Why teams work here:** Sequential investigation suffers from anchoring — once one theory is explored, subsequent investigation is biased toward it. Multiple independent investigators actively trying to disprove each other's theories means the surviving theory is much more likely to be the actual root cause.

**Advanced features:** Pre-spawn hypothesis confirmation gate (validates investigator direction before spawning), root cause confirmation task (validates findings before proposing fix), pipeline context for chaining with review and feature teams.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **[Hypothesis-A-Name]** | First theory investigator | Most likely cause based on symptoms |
| **[Hypothesis-B-Name]** | Second theory investigator | Alternative cause based on recent changes |
| **[Hypothesis-C-Name]** | Contrarian investigator | Less obvious cause, challenges other theories |

**Pipeline:** Feeds from `/spawn-think --mode review` (issues found during review), `/spawn-build --mode feature` (bugs introduced during implementation) → feeds into `/spawn-build --mode feature` (implement fix), `/spawn-think --mode review` (review fix)

### Representative Spawn Prompt

```
Create an agent team called "debug-[bug-slug]" to investigate: [BUG DESCRIPTION].

Spawn 3 investigator teammates, each pursuing a different hypothesis:

1. **[Hypothesis-A-Name]** — Investigate whether [CONCRETE THEORY 1 based on symptoms].
   Look at [RELEVANT FILES/MODULES]. Try to reproduce the issue through this code path.
   If you find evidence supporting OR contradicting this theory, share it with the other
   investigators immediately.

2. **[Hypothesis-B-Name]** — Investigate whether [CONCRETE THEORY 2 based on recent changes].
   Check [RELEVANT FILES/MODULES]. Look for recent changes that could have introduced this
   behavior. Share findings with other investigators.

3. **[Hypothesis-C-Name]** — Investigate whether [CONCRETE THEORY 3 - less obvious cause].
   Look at [EDGE CASES, EXTERNAL DEPS, CONFIG]. Your job is also to challenge the other
   investigators' conclusions — if they find something, try to disprove it.

Tasks:
1. [All] Read error logs and reproduce the issue
2. [[Hypothesis-A]] Trace code path for [theory 1]
3. [[Hypothesis-B]] Check recent changes related to [theory 2]
4. [[Hypothesis-C]] Examine edge cases for [theory 3]
5. [All] Share findings and challenge each other's theories
6. [Lead] Identify root cause from surviving theory
7. [Lead] ROOT CAUSE CONFIRMATION — Present root cause and evidence to user for approval (blocked by 6)
8. [Lead] Propose fix based on confirmed root cause (blocked by 7)

Have investigators actively debate. When one finds evidence, others should try to
disprove it. The theory that survives scrutiny is most likely correct.
Require plan approval before implementing any fix.
```

### Configuration Tips

- The spawn command runs a **hypothesis confirmation gate** before spawning — the lead formulates 3 hypotheses and presents them to the user for confirmation/adjustment
- Name hypotheses concretely (e.g., "race-condition", "null-reference", "config-drift") — not abstractly
- The adversarial structure is the key mechanism — investigators actively challenge each other
- **Root cause confirmation** (task 7) prevents premature fix proposals — the user validates findings before any fix is designed
- If the bug description is vague, the command asks 1-2 clarifying questions before formulating hypotheses
- The fix proposal feeds into `/spawn-build --mode feature` for implementation or `/spawn-think --mode review` for review
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 5: Frontend Design Team

**When to use:** Designing and implementing a user interface where product requirements, visual design, technical implementation, and accessibility all need dedicated attention. Best for UI features that require more than just coding — where the *design process* matters as much as the output.

**Why teams work here:** A single session conflates design decisions with implementation details. Four distinct perspectives — product scope, visual design, code architecture, and user advocacy — create productive tension that results in a more thoughtful, accessible UI. The two-pass review (visual fidelity + accessibility) catches issues that a single reviewer would miss.

**Advanced features:** 3 adaptive modes (New Component, Page/Flow, Redesign), discovery interview (5 core + 2 extended questions per mode), user feedback gate before implementation begins, pipeline context for chaining with planning, brainstorming, review, and feature teams.

### Design Modes

| # | Mode | When to Use |
|---|------|-------------|
| 1 | **New Component** | Creating a new reusable component — design system additions, shared UI elements |
| 2 | **Page / Flow** | Designing a full page or multi-step flow — onboarding, checkout, dashboards |
| 3 | **Redesign** | Improving or reworking existing UI — modernization, UX improvements, accessibility fixes |

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Product Owner** | Requirements & priorities | User stories, acceptance criteria, scope boundaries | Sonnet |
| **Designer** | Visual & interaction design | Component specs, states, layout, design tokens, design system | Sonnet |
| **Frontend Dev** | Technical implementation | Component architecture, state management, performance, patterns | Default |
| **User Advocate** | UX & accessibility | WCAG compliance, keyboard nav, screen readers, edge cases | Sonnet |

**Pipeline:** Feeds from `/spawn-think --mode planning` (UI requirements from phase briefs), `/spawn-create --mode brainstorm` (UI concept ideas) → feeds into `/spawn-think --mode review` (design review), `/spawn-build --mode feature` (backend work)

### Representative Spawn Prompt

```
Create an agent team called "design-[feature-slug]" to design and implement [UI FEATURE].
Spawn 4 teammates:

1. **Product Owner** — Define requirements and acceptance criteria for this UI feature.
   Write user stories with clear "given/when/then" scenarios. Set scope boundaries —
   what's in v1 vs future iterations. Prioritize features by user impact.
   Use Sonnet model.

2. **Designer** — Create component specifications and interaction designs. Define visual
   hierarchy, layout structure, spacing, responsive breakpoints, and all interactive states
   (default, hover, focus, active, disabled, loading, error, empty). Specify design tokens
   and how the design maps to [STYLING_APPROACH].
   Use Sonnet model.

3. **Frontend Dev** — Implement components based on Designer specs and Product Owner
   requirements. Work in [COMPONENT_DIRS]. Follow existing patterns in the codebase.
   Focus on performance. Write unit tests alongside implementation.

4. **User Advocate** — Review all specs and implementations for accessibility and usability.
   Verify WCAG 2.1 AA compliance: keyboard navigation, screen reader support, color contrast,
   focus management, ARIA attributes. Check responsive behavior, touch targets, error recovery.
   Use Sonnet model.

## Design Context
[Compiled interview results — feature description, target users, design references, design system, quality bar, mode-specific answers, project analysis]

Tasks:
1. [Product Owner] Define user stories and acceptance criteria
2. [Product Owner] Define scope boundaries — v1 vs deferred
3. [Designer] Audit existing components and design patterns for reuse (blocked by 1)
4. [User Advocate] Define accessibility requirements and testing criteria (blocked by 1)
5. [Designer] Create component specs: layout, states, responsive breakpoints (blocked by 2, 3)
6. [User Advocate] Review design specs for accessibility compliance (blocked by 4, 5)
7. [Lead] USER FEEDBACK GATE — present design specs + accessibility review to user (blocked by 6)
8. [Frontend Dev] Implement components following design specs (blocked by 7)
9. [Frontend Dev] Implement interactive states and error handling (blocked by 8)
10. [Designer] Visual review of implementation against specs (blocked by 9)
11. [User Advocate] Accessibility review — keyboard, screen reader, contrast (blocked by 9)
12. [Frontend Dev] Address feedback from Designer and User Advocate (blocked by 10, 11)
13. [Product Owner] Final acceptance review against user stories (blocked by 12)
```

### Configuration Tips

- The spawn command runs a **discovery interview** (5 core + 2 mode-specific questions) before spawning
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- The **user feedback gate** after specs + accessibility review prevents expensive rework — implementation is the costliest phase
- 3 Sonnet teammates + 1 default-model Frontend Dev balances cost and implementation quality
- The two-pass review (Designer + User Advocate) is the key mechanism — don't skip it
- **Mode-specific outputs:** component spec + implementation (New Component), page spec + flow documentation (Page/Flow), before/after analysis + migration notes (Redesign)
- For simple UI changes, consider using the Feature Development team instead
- Include the Task Blocking Protocol in the spawn prompt — this blueprint's deep dependency chain makes it critical (see "Task Blocking Protocol" section below)

---

## Blueprint 6: Adaptive Planning Team (7 Modes)

**When to use:** Any planning task — from sequencing features to writing specs, making architecture decisions, planning migrations, building business cases, designing GTM plans, or setting OKRs. The command runs a discovery interview and spawns a mode-specific team.

**Why teams work here:** Different planning needs require fundamentally different team compositions and outputs. A roadmap needs strategists and prioritizers; a spec needs architects and API designers; a business case needs market and financial analysts. The adaptive mode system matches the team to the planning problem, while the shared interview → feedback gate → synthesis pipeline ensures consistent quality across all modes.

### Planning Modes

| # | Mode | Category | Team Composition | Output |
|---|------|----------|-----------------|--------|
| 1 | **Product Roadmap** | Technical | Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate | Phase briefs → `/spawn-build --mode feature` |
| 2 | **Technical Spec** | Technical | Architect, API Designer, Risk Analyst | Spec document → `/spawn-build --mode feature` |
| 3 | **Architecture Decision** | Technical | Solution Architect, Explorer, Trade-off Analyst, Critic | ADR → implementation teams |
| 4 | **Migration Strategy** | Technical | State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate | Migration plan |
| 5 | **Business Case** | Business | Market Analyst, Financial Analyst, Strategist, Risk Analyst | Decision document → Product Roadmap |
| 6 | **Go-to-Market** | Business | Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator | GTM plan → Product Roadmap |
| 7 | **OKR / Goals** | Business | Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate | OKR tree → Roadmap / Spec |

**Pipeline:** Business Case / GTM / OKR → Product Roadmap → Technical Spec → `/spawn-build --mode feature`

### Representative Spawn Prompt (Product Roadmap)

The command runs a 5-step process (mode selection → discovery interview → optional teammates → project analysis → spawn). Below is the Product Roadmap spawn prompt as a representative example. All 7 modes follow this same pattern with mode-specific team composition and tasks.

```
Create an agent team called "plan-roadmap-[project-slug]" to create a product roadmap for [OBJECTIVE].
Spawn [4-6] teammates:

1. **Strategist** — Analyze the product vision and define strategic objectives. Identify core
   value propositions, business differentiators, and strategic goals. Determine which capabilities
   are foundational vs incremental. Frame each implementation phase in terms of business value
   delivered, not just features shipped.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build a dependency
   graph showing which features require others to exist first. Identify technical foundations
   that must be laid early (auth, data models, core APIs). Sequence phases by dependency order,
   risk level, and value delivery. Flag circular dependencies and propose how to break them.

3. **Outcomes Analyst** — Define measurable success criteria and acceptance conditions for each
   phase. Write specific, testable definitions of done. Identify KPIs that prove each phase
   delivered its intended value. Create acceptance criteria that implementation teams can
   directly verify. Ensure outcomes are measurable, not aspirational.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   user segments benefit from each phase. Flag business constraints (budget, timeline, regulatory,
   team capacity) that affect sequencing. Challenge assumptions about user value — push back
   when phases don't clearly serve users. Conduct feasibility checks on proposed timelines.

## Planning Context
[Compiled interview results — objective, current state, constraints, stakeholders, success definition, additional context, project analysis]

Tasks:
1. [Strategist] Analyze product vision and define strategic objectives
2. [Stakeholder Advocate] Identify user needs, business constraints, and dependencies
3. [Prioritizer] Map feature dependencies and technical prerequisites (blocked by 1)
4. [Strategist] Define implementation phases with business rationale (blocked by 1, 2)
5. [Lead] USER FEEDBACK GATE — Present initial phases, ask user to confirm/adjust (blocked by 3, 4)
6. [Prioritizer] Sequence phases by dependency order and risk (blocked by 5)
7. [Outcomes Analyst] Define success criteria per phase (blocked by 5)
8. [Stakeholder Advocate] Feasibility review — challenge assumptions (blocked by 6, 7)
9. [Outcomes Analyst] Refine outcomes based on feedback (blocked by 8)
10. [All] Cross-review: validate plan coherence
11. [Strategist] Compile roadmap document with phase briefs

Each phase brief should be directly usable as input to /spawn-build --mode feature or /spawn-create --mode design.
```

### Task Structure (All Modes)

All 7 modes follow the same 5-phase task flow:

```
Phase 1 — Initial Analysis (tasks 1-3/4):  Parallel exploration from each teammate's perspective
Phase 2 — USER FEEDBACK GATE (task 4/5):   Lead presents findings, user chooses direction
Phase 3 — Detailed Planning (tasks 5/6-8): Refined work based on user's direction
Phase 4 — Cross-Review (task 9/10):        All teammates validate coherence
Phase 5 — Compilation (task 10/11/12):     Designated teammate compiles final output document
```

### Configuration Tips

- The spawn command runs a **discovery interview** before creating the team — 5 core questions + 2-5 mode-specific extended questions
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- **Optional teammates** add depth: DevOps Advisor for technical modes; Data Analyst and Customer Voice for business modes
- The **user feedback gate** is the key mechanism — it prevents the team from investing effort in directions the user doesn't want
- All teammates use Sonnet — planning is analysis and writing, not code generation
- Enable delegate mode for the lead — a designated teammate handles final document compilation
- Business mode outputs feed into technical modes: Business Case → Product Roadmap → Technical Spec → `/spawn-build --mode feature`
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 7: Productivity Systems Team

**When to use:** Optimizing workflows, processes, or systems where you need to discover bottlenecks, design solutions, review quality, iteratively refine, and track improvements over time. Best when the *process of improvement* matters as much as any single output — when you want compounding gains across cycles.

**Why teams work here:** A single session can identify problems or propose solutions, but lacks the structured methodology to systematically score, prioritize, design with tradeoffs, review through multiple lenses, iterate to convergence, and track patterns across cycles. Five distinct personas — each with deep methodology, scoring criteria, and defined input/output contracts — form a pipeline where improvements compound because each cycle builds on accumulated knowledge.

**Advanced features:** Pre-spawn interview (4 questions on target workflow, pain points, current tools, success metric), user feedback gate after Auditor's scored improvement plan, pipeline context for chaining with feature teams, per-phase output contracts.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Auditor** | Productivity Systems Analyst | Bottleneck discovery, cost scoring, prioritized planning | Sonnet |
| **Architect** | Solution Architect | Problem restatement, approach mapping, phased blueprints | Sonnet |
| **Analyst** | Senior Engineering Analyst | Multi-pass review: architecture, quality, reliability, performance | Sonnet |
| **Refiner** | Convergence Loop Specialist | Iterative improvement until quality bar met | Default |
| **Compounder** | Systems Review Partner | Progress tracking, friction logging, pattern recognition | Sonnet |

**Pipeline:** Feeds into `/spawn-build --mode feature` (implement automation solutions); Compounder output feeds the next productivity cycle

### Representative Spawn Prompt

```
Create an agent team called "productivity-[project-slug]" to optimize [WORKFLOW / PROCESS].

Spawn 5 teammates:

1. **Auditor** — Productivity Systems Analyst who discovers bottlenecks and quantifies their cost.
   Read the Auditor persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md
   Your inputs come from the Productivity Context section below — the user has already
   described their workflow, pain points, current tools, and success metrics.
   Your outputs feed into the Architect.
   Use Sonnet model.

2. **Architect** — Solution Architect who transforms prioritized problems into implementable blueprints.
   Read the Architect persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md
   Your inputs come from the Auditor's scored task inventory and 4-week plan.
   Your outputs feed into the Analyst.
   Use Sonnet model.

3. **Analyst** — Senior Engineering Analyst who evaluates solutions through multiple quality lenses.
   Read the Analyst persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md
   Your inputs come from the Architect's phased blueprint and approach decisions.
   Your outputs feed into the Refiner.
   Use Sonnet model.

4. **Refiner** — Convergence Loop Specialist who iteratively improves implementations.
   Read the Refiner persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/refiner.md
   Your inputs come from the Analyst's multi-pass review and prioritized findings.
   Your outputs feed into the Compounder.
   Use default model (iterative refinement benefits from strongest reasoning).

5. **Compounder** — Systems Review Partner who closes the loop and identifies patterns.
   Read the Compounder persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md
   Your inputs come from the Refiner's refined implementation and convergence report.
   Your outputs feed into the next cycle's Auditor.
   Use Sonnet model.

## Productivity Context
[Compiled interview results — target workflow, pain points, current tools, success metric, project analysis]

Tasks:
1. [Auditor] Discover bottlenecks — analyze the workflow described in Productivity Context
2. [Auditor] Score all identified tasks on Time Cost, Energy Drain, and Feasibility (blocked by 1)
3. [Auditor] Produce prioritized 4-week improvement plan with Automation Scores (blocked by 2)
4. [Lead] USER FEEDBACK GATE — present scored plan to user for approval (blocked by 3)
5. [Architect] Restate top problems from the approved plan (blocked by 4)
6. [Architect] Map 2-3 approaches per problem, ranked by simplicity (blocked by 5)
7. [Architect] Create phased blueprint with rollback points and dependency map (blocked by 6)
8. [Analyst] Pass 1-2: Architecture and Code Quality review (blocked by 7)
9. [Analyst] Pass 3-4: Reliability and Performance review with tradeoff matrix (blocked by 8)
10. [Refiner] Generate initial implementation addressing Critical findings (blocked by 9)
11. [Refiner] Run convergence loop until quality bar met (blocked by 10)
12. [Compounder] Review all outputs — progress check, friction log, patterns, next target (blocked by 11)
13. [Compounder] Compile final report with cumulative impact summary and next-cycle recommendations

Important: This team is intentionally sequential — each persona's output feeds the next.
The user feedback gate ensures the Architect designs solutions for the right bottlenecks.
```

### Configuration Tips

- The spawn command runs a **pre-spawn interview** (4 questions) before spawning — target workflow, pain points, current tools, success metric
- The **user feedback gate** after the Auditor's scored plan ensures the Architect designs solutions for the right bottlenecks
- The task chain is intentionally sequential — the loop is how improvements compound
- 4 Sonnet teammates + 1 default-model Refiner balances cost and quality for iterative work
- Enable delegate mode for the lead — the final report is a synthesis of the full pipeline
- **Per-phase deliverables:** scored bottleneck inventory (Auditor), phased blueprint (Architect), multi-pass review report (Analyst), refined implementation with convergence report (Refiner), cycle report with friction log and patterns (Compounder)
- When the Compounder finishes, run the team again with accumulated insights for the next improvement cycle
- Implementation outputs feed into `/spawn-build --mode feature` for development
- Include the Task Blocking Protocol in the spawn prompt — this blueprint's fully sequential chain makes it essential (see "Task Blocking Protocol" section below)

---

## Blueprint 8: Brainstorming & Ideation Team

**When to use:** Generating creative ideas for a problem, feature, strategy, or process where you need diverse perspectives and structured evaluation. Best when the problem space is open-ended and you want to explore possibilities before committing to a direction.

**Why teams work here:** A single session anchors on its first idea and iterates from there. Structured brainstorming with independent brainwriting prevents anchoring bias — each teammate generates ideas without seeing others' work, producing genuinely diverse options. The user feedback gate keeps the human as the "decider," and the building phase adds implementation substance to winning ideas.

**Advanced features:** Discovery interview (5 core + 2-5 extended questions), 4 brainstorming categories with auto-inference keywords (Tech, Product, Process, Ops), user feedback gate after idea clustering, optional teammates (User Voice, Domain Expert), pipeline context for chaining with planning, research, design, and feature teams.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Facilitator** | Session management | Phase transitions, ideation rules, clustering, convergence | Sonnet |
| **Visionary** | Divergent thinking | Ambitious ideas, cross-domain connections, quantity over quality | Sonnet |
| **Realist** | Practical thinking | Feasible ideas, implementation details, stepping stones | Sonnet |
| **User Voice** (optional) | User perspective | Ideas grounded in user needs, adoption, and experience | Sonnet |
| **Domain Expert** (optional) | Domain expertise | Specialized ideas a generalist would miss | Sonnet |

**Pipeline:** Feeds into `/spawn-think --mode planning` (turn ideas into roadmap items), `/spawn-think --mode research` (investigate feasibility), `/spawn-create --mode design` (design UI concepts), `/spawn-build --mode feature` (implement straightforward ideas)

### Representative Spawn Prompt

```
Create an agent team called "brainstorm-[topic-slug]" to brainstorm: [TOPIC].

Spawn [3-5] teammates:

1. **Facilitator** — Session Facilitator who manages the divergence/convergence cycle.
   Read the Facilitator persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md
   You manage phase transitions and enforce ideation rules. You do NOT generate ideas yourself.

2. **Visionary** — Divergent Thinker who generates ambitious, unconstrained ideas.
   Read the Visionary persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md
   Your lens for this session: [CATEGORY-SPECIFIC VISIONARY LENS].

3. **Realist** — Practical Thinker who grounds ideas in feasibility.
   Read the Realist persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md
   Your lens for this session: [CATEGORY-SPECIFIC REALIST LENS].

## Brainstorming Context
[Compiled interview results — problem definition, success criteria, constraints, prior attempts, scope boundaries, additional context]

Tasks:
1. [Facilitator] Define brainstorming parameters, communicate rules of engagement
2. [Visionary] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
3. [Realist] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
4. [Facilitator] Collect all ideas, remove duplicates, cluster by theme (blocked by 2-3)
5. [Lead] USER FEEDBACK GATE — present clusters, ask user to prioritize/decline (blocked by 4)
6. [Visionary] Build on prioritized ideas — combine, enhance, amplify (blocked by 5)
7. [Realist] Add implementation details, stepping stones, effort estimates (blocked by 5)
8. [Facilitator] Convergence — evaluate refined ideas against success criteria (blocked by 6-7)
9. [Facilitator] Compile final output with ranked recommendations and next steps (blocked by 8)
```

### Configuration Tips

- The spawn command runs a **discovery interview** (5 core + 2-5 extended questions) before creating the team
- 4 brainstorming categories (Tech / Product / Process / Ops) shape the Visionary and Realist lenses — auto-inferred from keywords when obvious
- The **user feedback gate** after idea clustering is the key mechanism — the human decides which ideas to invest in
- Independent brainwriting prevents anchoring bias — teammates don't see each other's ideas until the Facilitator collects them
- **Optional teammates** add depth: User Voice for product/process brainstorms, Domain Expert for tech/ops brainstorms
- **Output contracts:** Ranked idea list scored against success criteria, idea clusters with theme groupings, recommended next steps with downstream commands (`/spawn-think --mode planning`, `/spawn-think --mode research`, `/spawn-create --mode design`, `/spawn-build --mode feature`)
- 3 core teammates keeps cost low; add User Voice and/or Domain Expert for richer sessions
- Include the Task Blocking Protocol in the spawn prompt — brainwriting phases must complete before collection (see "Task Blocking Protocol" section below)

---

## Task Blocking Protocol

Every spawn prompt must include the Task Blocking Protocol block. The canonical version is defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — see that file for the exact text, placement guidance, and rationale.

This is especially important for blueprints with deep dependency chains (Frontend Design, Productivity Systems, Brainstorming) where later tasks depend on specific outputs from earlier ones.

## Design Patterns

These patterns are used across multiple blueprints. When customizing blueprints or designing new teams with the team-architect agent, apply these patterns where they add value.

### Adaptive Mode Pattern

One spawn command dispatches to mode-specific team compositions and task structures. This lets a single entry point serve multiple related use cases without creating separate commands.

**Structure:**
1. **Mode table** — Lists modes with "When to Use" descriptions and effects on team composition
2. **Auto-inference keywords** — Common terms that auto-select the mode from `$ARGUMENTS` (confirmed rather than asked)
3. **Mode-specific interviews** — Core questions shared across all modes + extended questions per mode
4. **Shared task skeleton** — All modes follow the same phase flow (e.g., Initial Analysis → Feedback Gate → Detailed Work → Cross-Review → Synthesis) with mode-specific task content

**Blueprints using this pattern:**
- Planning (7 modes) — most comprehensive implementation
- Research (3 modes) — Technology Evaluation, Landscape Survey, Risk Assessment
- Design (3 modes) — New Component, Page/Flow, Redesign
- Review (3 modes) — Security-focused, Performance-focused, Balanced

**When to use:** When a team concept serves multiple related use cases that need different team compositions, expertise, or deliverables — but share the same overall workflow shape.

### Cross-Team Pipeline Pattern

Teams chain together where one team's output becomes another team's input. This enables complex workflows to span multiple specialized teams rather than overloading a single team.

**Pipeline map:**

```
                        ┌─────────────────┐
                        │  Brainstorming   │
                        │  (ideation)      │
                        └────────┬────────┘
                                 │ winning ideas
                                 ▼
┌─────────────┐         ┌─────────────────┐
│ Business    │────────▶│    Planning      │
│ Case / GTM  │         │  (7 modes)      │
│ / OKR       │         └────────┬────────┘
└─────────────┘                  │ phase briefs / specs
                                 ▼
                        ┌─────────────────┐         ┌─────────────────┐
                        │   Research       │────────▶│   Design        │
                        │  (3 modes)      │         │  (3 modes)      │
                        └────────┬────────┘         └────────┬────────┘
                                 │ evaluation report          │ design specs
                                 ▼                            ▼
                        ┌─────────────────────────────────────┐
                        │          Feature Development         │
                        └────────────────┬────────────────────┘
                                         │ implementation
                                         ▼
                        ┌─────────────────────────────────────┐
                        │          Code Review & QA            │
                        └───────┬─────────────────┬───────────┘
                                │ issues found     │ rework needed
                                ▼                  ▼
                        ┌─────────────┐   ┌─────────────────┐
                        │   Debug     │   │ Feature (rework) │
                        │ (investigate)│   └─────────────────┘
                        └─────────────┘
```

**Key principle:** Each team's output section includes explicit downstream command references (e.g., "feeds into `/spawn-build --mode feature`"). This lets users chain teams without guessing which command comes next.

**Common pipelines:**
- **Full product cycle:** Business Case → Product Roadmap → Technical Spec → Feature Dev → Code Review
- **Design-to-implementation:** Brainstorming → Design → Feature Dev → Review
- **Bug lifecycle:** Review → Debug → Feature Dev (fix) → Review (verify fix)
- **Productivity loop:** Productivity Systems → Feature Dev (automation) → next Productivity cycle

### Discovery Interview Pattern

Pre-spawn structured questioning that builds rich shared context for all teammates. Moves context gathering before the team spawns so teammates can start working immediately instead of interviewing the user.

**Structure:** 5 core questions (shared across modes) + 2-5 extended questions (per mode or category). Questions are presented in batches of 3-5 using `AskUserQuestion`. Questions already answered in `$ARGUMENTS` are skipped. Results are compiled into a structured `## Context` section in the spawn prompt.

**Blueprints using this pattern:** Planning, Research, Design, Brainstorming, Feature, Productivity

**When to use:** Any team where shared context quality directly drives output quality. See the "Discovery Interview Pattern" section in the team-coordination skill for detailed implementation guidance.

### User Feedback Gate Pattern

Mid-execution checkpoint where the lead presents findings to the user for prioritization and direction before the team invests in detailed work.

**Implementation:** A dedicated `[Lead]` task with blocking dependencies on both sides — upstream work must complete before the gate, and downstream work cannot start until the user responds.

**Blueprints using this pattern:** Planning (after initial phases), Research (after initial findings), Design (after specs + accessibility review), Feature (after API contract), Productivity (after Auditor's scored plan), Brainstorming (after idea clustering), Debug (root cause confirmation)

**When to use:** Any team where significant effort could go in the wrong direction without user input. See the "User Feedback Gate" section in the team-coordination skill for detailed implementation guidance.

### Artifact Output Pattern

Team deliverables are written to disk as git-tracked markdown files in `docs/teams/{team-name}/`, ensuring outputs persist after sessions and can be consumed by downstream pipeline teams.

**Two-tier system:**
- **Primary deliverable** — One main output file per team (e.g., `roadmap.md`, `evaluation-report.md`)
- **Task outputs** — Per-task analysis files in a `tasks/` subdirectory

**Artifact mapping by team type:**

| Team Type | Dir Pattern | Primary Deliverable |
|-----------|------------|-------------------|
| Planning (Roadmap) | `plan-roadmap-{slug}` | `roadmap.md` |
| Planning (Spec) | `plan-spec-{slug}` | `spec.md` |
| Planning (ADR) | `plan-adr-{slug}` | `adr.md` |
| Planning (Migration) | `plan-migration-{slug}` | `migration-plan.md` |
| Planning (Business Case) | `plan-bizcase-{slug}` | `business-case.md` |
| Planning (GTM) | `plan-gtm-{slug}` | `gtm-plan.md` |
| Planning (OKR) | `plan-okr-{slug}` | `okr-tree.md` |
| Research (Eval) | `research-eval-{slug}` | `evaluation-report.md` |
| Research (Landscape) | `research-landscape-{slug}` | `landscape-report.md` |
| Research (Risk) | `research-risk-{slug}` | `risk-assessment.md` |
| Feature | `feature-{slug}` | `implementation-summary.md` |
| Design | `design-{slug}` | `component-spec.md` / `page-spec.md` / `redesign-spec.md` |
| Review | `review-{slug}` | `review-report.md` |
| Debug | `debug-{slug}` | `root-cause-analysis.md` |
| Productivity | `productivity-{slug}` | `productivity-report.md` |
| Brainstorming | `brainstorm-{slug}` | `brainstorm-output.md` |

A designated teammate compiles the primary deliverable with YAML frontmatter, writes task outputs, creates a team README, and updates the root index at `docs/teams/README.md`. See the "Artifact Output Protocol" section in the team-coordination skill for full frontmatter schemas and guidelines.

## Customizing Blueprints

These blueprints are starting points. Adapt them by:

1. **Adjusting team size** — Add or remove teammates based on task complexity
2. **Changing model** — Use Sonnet for cost-effective work, Opus for complex reasoning
3. **Adding plan approval** — For risky changes, require teammates to plan before implementing
4. **Enabling delegate mode** — Press Shift+Tab to keep the lead focused on coordination
5. **Defining file boundaries** — Assign specific directories to avoid merge conflicts

### Efficiency Guidelines

Session analysis shows coordination overhead scales non-linearly. Keep teams lean:

- **Cap tasks at 8 per team** — Beyond this, TaskUpdate churn dominates execution
- **Prefer 3-4 agents** — Larger teams increase SendMessage overhead without proportional output gains
- **Max 2 teams per session** — Chain sessions for complex multi-team pipelines instead
- **Batch instructions** — One detailed SendMessage per teammate beats multiple short follow-ups
- **Skip teams for small work** — If total implementation is under ~30 minutes or fewer than 3 parallel tracks, use plan-then-implement instead

## Choosing the Right Blueprint

```
Is the task about understanding something?     → Research & Discovery (3 modes)
Is the task about building something new?      → Feature Development
Is the task about reviewing existing work?     → Code Review & QA (3 modes)
Is the task about fixing something broken?     → Debugging & Investigation
Is the task about designing a user interface?  → Frontend Design (3 modes)
Is the task about sequencing what to build?    → Planning & Roadmapping (7 modes)
Is the task about optimizing workflows?        → Productivity Systems
Is the task about generating creative ideas?   → Brainstorming & Ideation
Is it a mix?                                   → Use team-architect agent for custom design
```

### Pipeline Composition

When a task spans multiple phases, chain blueprints together using their pipeline context:

```
Need to explore before building?      → Research → Feature Dev
Need to plan before building?         → Planning → Feature Dev
Need design before implementation?    → Design → Feature Dev → Review
Need ideas before planning?           → Brainstorming → Planning → Feature Dev
Found bugs during review?             → Review → Debug → Feature Dev (fix)
Need to optimize an existing flow?    → Productivity → Feature Dev (automation)
Full product cycle?                   → Business Case → Roadmap → Spec → Feature Dev → Review
```
