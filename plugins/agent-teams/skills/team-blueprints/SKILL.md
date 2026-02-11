---
name: team-blueprints
description: |
  This skill should be used when the user wants pre-designed agent team configurations for common application development phases. Use this skill when the user asks for a "research team", "feature development team", "code review team", "debug team", "design team", "planning team", "roadmap team", "team blueprint", "team template", or says "spawn a team for [development phase]".

  Provides 8 ready-to-use team blueprints: Research & Discovery, Feature Development, Code Review & QA, Debugging & Investigation, Frontend Design, Planning & Roadmapping, Productivity Systems, and Brainstorming & Ideation.
version: 0.7.0
---

# Agent Team Blueprints

Pre-designed team configurations for eight application development phases. Each blueprint defines the team composition, teammate roles, task structure, and the prompt to use.

## Blueprint 1: Research & Discovery Team

**When to use:** Exploring a new technology, evaluating approaches, investigating a domain, or gathering information from multiple angles before making decisions.

**Why teams work here:** Research benefits enormously from parallel exploration. A single session gravitates toward one perspective; multiple teammates explore different facets simultaneously and share findings.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Explorer** | Technical research | APIs, libraries, performance characteristics, compatibility |
| **Analyst** | Requirements & trade-offs | User needs, constraints, cost-benefit analysis |
| **Critic** | Devil's advocate | Risks, limitations, hidden costs, alternative approaches |

### Spawn Prompt

```
Create an agent team to research [TOPIC/TECHNOLOGY/APPROACH]. Spawn 3 teammates:

1. **Explorer** — Investigate the technical landscape: available APIs, libraries,
   performance characteristics, and compatibility with our stack. Focus on concrete
   capabilities and limitations. Read our codebase to understand integration points.

2. **Analyst** — Evaluate from a requirements perspective: what are our actual needs,
   what constraints do we have, and how do different options compare on cost, complexity,
   and maintainability? Review existing code patterns to understand what fits.

3. **Critic** — Play devil's advocate: what could go wrong with each approach? What are
   the hidden costs, scaling concerns, and vendor lock-in risks? Challenge the other
   teammates' findings and probe for weaknesses.

Have them share findings with each other and debate trade-offs. Synthesize their
conclusions into a recommendation with clear rationale.
```

### Task Structure

```
Tasks:
1. [Explorer] Survey available options for [topic] (document at least 3 approaches)
2. [Analyst] Define evaluation criteria based on project requirements
3. [Critic] Identify risks and failure modes for each approach
4. [All] Cross-review: teammates challenge each other's findings
5. [Lead] Synthesize into recommendation document
```

### Configuration Tips

- Use `--model sonnet` for teammates to reduce cost (research is read-heavy)
- Require plan approval for the Explorer to validate research scope before deep-diving
- Tell the lead to wait for all teammates before synthesizing
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 2: Feature Development Team

**When to use:** Building a new feature that spans multiple layers (frontend, backend, data), multiple modules, or requires parallel implementation tracks.

**Why teams work here:** Feature development benefits from teammates each owning a distinct piece. Cross-layer changes (UI + API + database) are naturally parallelizable when each teammate owns their layer.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Frontend** | UI/UX implementation | Components, pages, state management, styling |
| **Backend** | API & business logic | Endpoints, services, data access, validation |
| **Tester** | Test coverage & integration | Unit tests, integration tests, edge cases |
| **Architect** (optional) | Design & coordination | Interface contracts, data flow, review |

### Spawn Prompt

```
Create an agent team to implement [FEATURE NAME]. The feature needs:
[BRIEF DESCRIPTION OF WHAT THE FEATURE DOES]

Spawn teammates:

1. **Frontend** — Implement the UI layer: components, pages, and state management.
   Work in [src/components/, src/pages/, etc.]. Follow existing component patterns.
   Coordinate with Backend on API contracts before implementing data fetching.

2. **Backend** — Implement the API layer: endpoints, services, and data access.
   Work in [src/api/, src/services/, etc.]. Define the API contract first and share
   it with Frontend before they start data fetching. Follow existing route patterns.

3. **Tester** — Write comprehensive tests for both layers. Start with unit tests
   for individual components and services, then integration tests for the full flow.
   Work in [tests/, __tests__/, etc.]. Wait for Frontend and Backend to define
   interfaces before writing integration tests.

Have Frontend and Backend agree on API contracts early. Tester should write tests
as implementations stabilize. Use require plan approval for the Architect if included.

Important: Each teammate should only modify files in their designated directories
to avoid conflicts.
```

### Task Structure

```
Tasks:
1. [Architect] Define API contracts and data flow (blocks 2, 3)
2. [Backend] Implement API endpoints and services
3. [Frontend] Implement UI components and pages
4. [Backend] Add input validation and error handling
5. [Frontend] Implement data fetching and error states
6. [Tester] Write unit tests for backend services (after task 2)
7. [Tester] Write unit tests for frontend components (after task 3)
8. [Tester] Write integration tests for full flow (after tasks 4, 5)
```

### Configuration Tips

- Use delegate mode for the lead — keep it focused on coordination
- Define clear file ownership boundaries to avoid merge conflicts
- Have the Architect (or lead) define interface contracts before parallel work begins
- 5-6 tasks per teammate keeps everyone productive
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 3: Code Review & QA Team

**When to use:** Reviewing a pull request, auditing code quality, or conducting a thorough quality assessment before release.

**Why teams work here:** A single reviewer gravitates toward one type of issue. Splitting review criteria into independent domains means security, performance, and test coverage all get thorough attention simultaneously.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Security Reviewer** | Security & vulnerability analysis | Auth, injection, data exposure, OWASP top 10 |
| **Performance Reviewer** | Performance & scalability | N+1 queries, memory leaks, caching, algorithmic complexity |
| **Quality Reviewer** | Code quality & maintainability | Patterns, naming, error handling, test coverage |
| **UX Reviewer** (optional) | User experience impact | Accessibility, responsive design, error states, loading states |

### Spawn Prompt

```
Create an agent team to review [PR #NUMBER / the changes in BRANCH / the MODULE].
Spawn reviewers with distinct focus areas:

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

Each reviewer should produce a structured report with findings categorized by
severity. Have them share reports with each other so they can cross-reference
(e.g., a performance issue might also be a security concern). Synthesize into
a unified review.
```

### Task Structure

```
Tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [All] Cross-reference findings across domains
8. [Lead] Compile unified review report with prioritized actions
```

### Configuration Tips

- Use `--model sonnet` for cost-effective review
- Each reviewer should use `git diff` to see exactly what changed
- Tell reviewers to focus only on changed code (not pre-existing issues)
- Consider adding a UX Reviewer for frontend-heavy PRs
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 4: Debugging & Investigation Team

**When to use:** Tracking down a hard-to-reproduce bug, investigating a production incident, or debugging an issue where the root cause is unclear.

**Why teams work here:** Sequential investigation suffers from anchoring — once one theory is explored, subsequent investigation is biased toward it. Multiple independent investigators actively trying to disprove each other's theories means the surviving theory is much more likely to be the actual root cause.

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Hypothesis A** | First theory investigator | Most likely cause based on symptoms |
| **Hypothesis B** | Second theory investigator | Alternative cause based on recent changes |
| **Hypothesis C** | Contrarian investigator | Unlikely but possible cause, challenges other theories |
| **Historian** (optional) | Change archaeology | Git blame, recent commits, deployment history |

### Spawn Prompt

```
Create an agent team to investigate this bug: [DESCRIBE THE BUG/SYMPTOMS].

Spawn 3-4 investigator teammates, each pursuing a different hypothesis:

1. **Hypothesis A: [THEORY 1]** — Investigate whether [most likely cause].
   Look at [relevant files/modules]. Try to reproduce the issue through this path.
   If you find evidence supporting OR contradicting this theory, share it with
   the other investigators immediately.

2. **Hypothesis B: [THEORY 2]** — Investigate whether [alternative cause].
   Check [relevant files/modules]. Look for recent changes that could have
   introduced this behavior. Share findings with other investigators.

3. **Hypothesis C: [THEORY 3]** — Investigate whether [less obvious cause].
   Look at [edge cases, external dependencies, configuration]. Your job is also
   to challenge the other investigators' conclusions — if they find something,
   try to disprove it.

Have investigators actively debate their findings. When one investigator finds
evidence, others should try to disprove it. The theory that survives scrutiny
is most likely correct. Update a shared findings document as investigation proceeds.
```

### Task Structure

```
Tasks:
1. [All] Read error logs and reproduce the issue
2. [Hypothesis A] Investigate [theory 1] — trace code path
3. [Hypothesis B] Investigate [theory 2] — check recent changes
4. [Hypothesis C] Investigate [theory 3] — examine edge cases
5. [All] Share findings and challenge each other's theories
6. [Lead] Identify root cause from surviving theory
7. [Lead/Winner] Propose and implement fix
8. [All] Verify fix resolves the issue
```

### Configuration Tips

- Name hypotheses concretely (e.g., "race-condition", "null-pointer", "config-drift") not abstractly
- Encourage cross-team debate — the adversarial structure is the key mechanism
- The Historian teammate adds value for bugs in codebases with long history
- Consider requiring plan approval before implementing the fix
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 5: Frontend Design Team

**When to use:** Designing and implementing a user interface where product requirements, visual design, technical implementation, and accessibility all need dedicated attention. Best for UI features that require more than just coding — where the *design process* matters as much as the output.

**Why teams work here:** A single session conflates design decisions with implementation details. Four distinct perspectives — product scope, visual design, code architecture, and user advocacy — create productive tension that results in a more thoughtful, accessible UI. The two-pass review (visual fidelity + accessibility) catches issues that a single reviewer would miss.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Product Owner** | Requirements & priorities | User stories, acceptance criteria, scope boundaries | Sonnet |
| **Designer** | Visual & interaction design | Component specs, states, layout, design tokens, design system | Sonnet |
| **Frontend Dev** | Technical implementation | Component architecture, state management, performance, patterns | Default |
| **User Advocate** | UX & accessibility | WCAG compliance, keyboard nav, screen readers, edge cases | Sonnet |

### Spawn Prompt

```
Create an agent team to design and implement [UI FEATURE]. Spawn 4 teammates:

1. **Product Owner** — Define requirements and acceptance criteria. Write user stories
   with clear "given/when/then" scenarios. Set scope boundaries — what's in v1 vs
   future iterations. Prioritize features by user impact. Review all deliverables
   against acceptance criteria before approving.

2. **Designer** — Create component specifications and interaction designs. Define visual
   hierarchy, layout structure, spacing, responsive breakpoints, and all interactive states
   (default, hover, focus, active, disabled, loading, error, empty). Specify design tokens
   and how the design maps to the project's styling approach. Reference existing components
   to maintain design system consistency.

3. **Frontend Dev** — Implement components based on Designer specs and Product Owner
   requirements. Choose appropriate component architecture (composition, state management,
   data flow). Follow existing codebase patterns. Focus on performance (memoization,
   lazy loading, bundle impact). Write unit tests alongside implementation.

4. **User Advocate** — Review all specs and implementations for accessibility and usability.
   Verify WCAG 2.1 AA compliance: keyboard navigation, screen reader support, color contrast,
   focus management, ARIA attributes. Check responsive behavior, touch targets, error recovery,
   and edge cases (long text, empty states, slow connections).

The Designer and User Advocate provide specifications and review but do not write
implementation code. The Frontend Dev is the sole implementer. Product Owner gates
the start (requirements) and end (acceptance) of the process.
```

### Task Structure

```
Tasks:
1. [Product Owner] Define user stories and acceptance criteria
2. [Product Owner] Define scope boundaries — v1 vs deferred
3. [Designer] Audit existing components and design patterns for reuse (after task 1)
4. [User Advocate] Define accessibility requirements and testing criteria (after task 1)
5. [Designer] Create component specs: layout, states, responsive breakpoints (after tasks 2, 3)
6. [User Advocate] Review design specs for accessibility compliance (after tasks 4, 5)
7. [Frontend Dev] Implement components following design specs (after tasks 5, 6)
8. [Frontend Dev] Implement interactive states and error handling (after task 7)
9. [Designer] Visual review of implementation against specs (after task 8)
10. [User Advocate] Accessibility review — keyboard, screen reader, contrast (after task 8)
11. [Frontend Dev] Address feedback from Designer and User Advocate (after tasks 9, 10)
12. [Product Owner] Final acceptance review against user stories (after task 11)
```

### Configuration Tips

- Use delegate mode for the lead — the sequential dependency graph requires active coordination
- 3 Sonnet teammates + 1 default-model Frontend Dev balances cost and implementation quality
- The two-pass review (Designer + User Advocate) is the key mechanism — don't skip it
- For simple UI changes, consider using the Feature Development team instead
- Include the Task Blocking Protocol in the spawn prompt — this blueprint's deep dependency chain makes it critical (see "Task Blocking Protocol" section below)

---

## Blueprint 6: Adaptive Planning Team (7 Modes)

**When to use:** Any planning task — from sequencing features to writing specs, making architecture decisions, planning migrations, building business cases, designing GTM plans, or setting OKRs. The command runs a discovery interview and spawns a mode-specific team.

**Why teams work here:** Different planning needs require fundamentally different team compositions and outputs. A roadmap needs strategists and prioritizers; a spec needs architects and API designers; a business case needs market and financial analysts. The adaptive mode system matches the team to the planning problem, while the shared interview → feedback gate → synthesis pipeline ensures consistent quality across all modes.

### Planning Modes

| # | Mode | Category | Team Composition | Output |
|---|------|----------|-----------------|--------|
| 1 | **Product Roadmap** | Technical | Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate | Phase briefs → `/spawn-feature-team` |
| 2 | **Technical Spec** | Technical | Architect, API Designer, Risk Analyst, DX Advocate | Spec document → `/spawn-feature-team` |
| 3 | **Architecture Decision** | Technical | Solution Architect, Explorer, Trade-off Analyst, Critic | ADR → implementation teams |
| 4 | **Migration Strategy** | Technical | State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate | Migration plan |
| 5 | **Business Case** | Business | Market Analyst, Financial Analyst, Strategist, Risk Analyst | Decision document → Product Roadmap |
| 6 | **Go-to-Market** | Business | Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator | GTM plan → Product Roadmap |
| 7 | **OKR / Goals** | Business | Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate | OKR tree → Roadmap / Spec |

**Pipeline:** Business Case / GTM / OKR → Product Roadmap → Technical Spec → `/spawn-feature-team`

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
11. [Lead] Compile roadmap document with phase briefs

Each phase brief should be directly usable as input to /spawn-feature-team or /spawn-design-team.
```

### Task Structure (All Modes)

All 7 modes follow the same 5-phase task flow:

```
Phase 1 — Initial Analysis (tasks 1-3/4):  Parallel exploration from each teammate's perspective
Phase 2 — USER FEEDBACK GATE (task 4/5):   Lead presents findings, user chooses direction
Phase 3 — Detailed Planning (tasks 5/6-8): Refined work based on user's direction
Phase 4 — Cross-Review (task 9/10):        All teammates validate coherence
Phase 5 — Synthesis (task 10/11/12):       Lead compiles final output document
```

### Configuration Tips

- The spawn command runs a **discovery interview** before creating the team — 5 core questions + 2-5 mode-specific extended questions
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- **Optional teammates** add depth: Security Reviewer and DevOps Advisor for technical modes; Data Analyst and Customer Voice for business modes
- The **user feedback gate** is the key mechanism — it prevents the team from investing effort in directions the user doesn't want
- All teammates use Sonnet — planning is analysis and writing, not code generation
- Enable delegate mode for the lead — the final output is a synthesis of all perspectives
- Business mode outputs feed into technical modes: Business Case → Product Roadmap → Technical Spec → `/spawn-feature-team`
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)

---

## Blueprint 7: Productivity Systems Team

**When to use:** Optimizing workflows, processes, or systems where you need to discover bottlenecks, design solutions, review quality, iteratively refine, and track improvements over time. Best when the *process of improvement* matters as much as any single output — when you want compounding gains across cycles.

**Why teams work here:** A single session can identify problems or propose solutions, but lacks the structured methodology to systematically score, prioritize, design with tradeoffs, review through multiple lenses, iterate to convergence, and track patterns across cycles. Five distinct personas — each with deep methodology, scoring criteria, and defined input/output contracts — form a pipeline where improvements compound because each cycle builds on accumulated knowledge.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Auditor** | Productivity Systems Analyst | Bottleneck discovery, cost scoring, prioritized planning | Sonnet |
| **Architect** | Solution Architect | Problem restatement, approach mapping, phased blueprints | Sonnet |
| **Analyst** | Senior Engineering Analyst | Multi-pass review: architecture, quality, reliability, performance | Sonnet |
| **Refiner** | Convergence Loop Specialist | Iterative improvement until quality bar met | Default |
| **Compounder** | Systems Review Partner | Progress tracking, friction logging, pattern recognition | Sonnet |

### Spawn Prompt

```
Create an agent team called "productivity-[project-slug]" to optimize [WORKFLOW / PROCESS].

Spawn 5 teammates:

1. **Auditor** — Productivity Systems Analyst who discovers bottlenecks and quantifies their cost.
   Read the Auditor persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md
   Follow the methodology phases (Discovery → Scoring → 4-Week Plan), scoring criteria,
   and behavioral instructions defined in the persona.
   Your inputs come from the user's description of [WORKFLOW / PROCESS].
   Your outputs feed into the Architect.
   Use Sonnet model.

2. **Architect** — Solution Architect who transforms prioritized problems into implementable blueprints.
   Read the Architect persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md
   Follow the methodology phases (Problem Definition → Approach Map → Blueprint → Dependencies),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Auditor's scored task inventory and 4-week plan.
   Your outputs feed into the Analyst.
   Use Sonnet model.

3. **Analyst** — Senior Engineering Analyst who evaluates solutions through multiple quality lenses.
   Read the Analyst persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md
   Follow the methodology phases (Architecture → Code Quality → Reliability → Performance),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Architect's phased blueprint and approach decisions.
   Your outputs feed into the Refiner.
   Use Sonnet model.

4. **Refiner** — Convergence Loop Specialist who iteratively improves implementations until quality bar is met.
   Read the Refiner persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/refiner.md
   Follow the methodology phases (Generate → Score → Diagnose → Rewrite → Re-score),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Analyst's multi-pass review and prioritized findings.
   Your outputs feed into the Compounder.
   Use default model (iterative refinement benefits from strongest reasoning).

5. **Compounder** — Systems Review Partner who closes the loop and identifies patterns for the next cycle.
   Read the Compounder persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md
   Follow the methodology phases (Progress Check → Friction Log → Next Target → Pattern Recognition),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Refiner's refined implementation and convergence report.
   Your outputs feed into the next cycle's Auditor.
   Use Sonnet model.

Enable delegate mode — focus on coordination, synthesis, and the final report.

Create these tasks:
1. [Auditor] Discover bottlenecks — ask targeted questions about the current [WORKFLOW / PROCESS]
2. [Auditor] Score all identified tasks on Time Cost, Energy Drain, and Feasibility (blocked by task 1)
3. [Auditor] Produce prioritized 4-week improvement plan with Automation Scores (blocked by task 2)
4. [Architect] Restate the top problems from the Auditor's plan and ask clarifying questions (blocked by task 3)
5. [Architect] Map 2-3 approaches per problem, ranked by simplicity with tradeoffs (blocked by task 4)
6. [Architect] Create phased blueprint with rollback points and dependency map (blocked by task 5)
7. [Analyst] Pass 1-2: Architecture and Code Quality review of the blueprint (blocked by task 6)
8. [Analyst] Pass 3-4: Reliability and Performance review with tradeoff matrix (blocked by task 7)
9. [Refiner] Generate initial implementation addressing Critical findings (blocked by task 8)
10. [Refiner] Run convergence loop — score, diagnose, rewrite until quality bar met (blocked by task 9)
11. [Compounder] Review all outputs — progress check, friction log, patterns, next target (blocked by task 10)
12. [Lead] Synthesize final report with cumulative impact summary and next-cycle recommendations

Important: This team is intentionally sequential — each persona's output feeds the next.
The loop is the mechanism: improvements compound because each cycle builds on accumulated knowledge.
```

### Task Structure

```
Tasks:
1. [Auditor] Discover bottlenecks via targeted questions
2. [Auditor] Score tasks on Time Cost, Energy Drain, Feasibility (blocked by 1)
3. [Auditor] Produce prioritized 4-week plan with Automation Scores (blocked by 2)
4. [Architect] Restate problems, ask clarifying questions (blocked by 3)
5. [Architect] Map 2-3 approaches ranked by simplicity (blocked by 4)
6. [Architect] Create phased blueprint with rollback points (blocked by 5)
7. [Analyst] Architecture + Code Quality review (blocked by 6)
8. [Analyst] Reliability + Performance review with tradeoffs (blocked by 7)
9. [Refiner] Generate initial implementation (blocked by 8)
10. [Refiner] Convergence loop until quality bar met (blocked by 9)
11. [Compounder] Review outputs, identify patterns, update inventory (blocked by 10)
12. [Lead] Synthesize final report with next-cycle recommendations
```

### Configuration Tips

- The task chain is intentionally sequential — the loop is how improvements compound
- 4 Sonnet teammates + 1 default-model Refiner balances cost and quality for iterative work
- Enable delegate mode for the lead — the final report is a synthesis of the full pipeline
- When the Compounder finishes, run the team again with accumulated insights for the next improvement cycle
- For parallelism, extract individual personas into other team configurations using the team-personas skill
- Include the Task Blocking Protocol in the spawn prompt — this blueprint's fully sequential chain makes it essential (see "Task Blocking Protocol" section below)

---

## Blueprint 8: Brainstorming & Ideation Team

**When to use:** Generating creative ideas for a problem, feature, strategy, or process where you need diverse perspectives and structured evaluation. Best when the problem space is open-ended and you want to explore possibilities before committing to a direction.

**Why teams work here:** A single session anchors on its first idea and iterates from there. Structured brainstorming with independent brainwriting prevents anchoring bias — each teammate generates ideas without seeing others' work, producing genuinely diverse options. The user feedback gate keeps the human as the "decider," and the building phase adds implementation substance to winning ideas.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Facilitator** | Session management | Phase transitions, ideation rules, clustering, convergence | Sonnet |
| **Visionary** | Divergent thinking | Ambitious ideas, cross-domain connections, quantity over quality | Sonnet |
| **Realist** | Practical thinking | Feasible ideas, implementation details, stepping stones | Sonnet |
| **User Voice** (optional) | User perspective | Ideas grounded in user needs, adoption, and experience | Sonnet |
| **Domain Expert** (optional) | Domain expertise | Specialized ideas a generalist would miss | Sonnet |

### Spawn Prompt

```
Create an agent team called "brainstorm-[topic-slug]" to brainstorm [TOPIC].

Spawn [3-5] teammates:

1. **Facilitator** — Session Facilitator who manages the divergence/convergence cycle.
   Read the Facilitator persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md
   Follow the methodology phases and behavioral instructions. You manage phase transitions
   and enforce ideation rules. You do NOT generate ideas yourself.

2. **Visionary** — Divergent Thinker who generates ambitious, unconstrained ideas.
   Read the Visionary persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md
   Follow the methodology phases and behavioral instructions.
   Your lens: [CATEGORY-SPECIFIC — e.g., emerging tech, user delight, workflow transformation].

3. **Realist** — Practical Thinker who grounds ideas in feasibility.
   Read the Realist persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md
   Follow the methodology phases and behavioral instructions.
   Your lens: [CATEGORY-SPECIFIC — e.g., implementation feasibility, scope constraints, adoption friction].

## Brainstorming Context
[Interview results compiled as shared context for all teammates]

Tasks:
1. [Facilitator] Define parameters, communicate rules of engagement
2. [Visionary] Brainwriting: 8-10 ideas independently (blocked by 1)
3. [Realist] Brainwriting: 8-10 ideas independently (blocked by 1)
4. [Facilitator] Collect, deduplicate, cluster ideas, present to lead (blocked by 2-3)
5. [Lead] USER FEEDBACK GATE — present clusters, ask user to prioritize/decline (blocked by 4)
6. [Visionary] Build on prioritized ideas — combine, enhance, amplify (blocked by 5)
7. [Realist] Add implementation details, stepping stones, effort estimates (blocked by 5)
8. [Facilitator] Convergence — evaluate refined ideas against success criteria (blocked by 6-7)
9. [Lead] Synthesize final output with ranked recommendations (blocked by 8)
```

### Task Structure

```
Tasks:
1. [Facilitator] Define brainstorming parameters and rules of engagement
2. [Visionary] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
3. [Realist] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
4. [User Voice*] Brainwriting: Generate 8-10 ideas from user perspective (blocked by 1)
5. [Domain Expert*] Brainwriting: Generate 8-10 ideas from domain expertise (blocked by 1)
6. [Facilitator] Collect and cluster all ideas, present to lead (blocked by 2-5)
7. [Lead] USER FEEDBACK GATE — present clusters, user prioritizes/declines (blocked by 6)
8. [Visionary] Build on prioritized ideas — combine, enhance, amplify (blocked by 7)
9. [Realist] Add implementation details, stepping stones, effort (blocked by 7)
10. [Facilitator] Convergence — evaluate refined ideas, rank by viability (blocked by 8-9)
11. [Lead] Synthesize final brainstorm output with ranked recommendations (blocked by 10)
```

*Tasks 4-5 only if optional teammates are included.

### Configuration Tips

- The spawn command runs a **discovery interview** before creating the team — this ensures rich shared context
- 4 brainstorming categories (Tech / Product / Process / Ops) shape the Visionary and Realist lenses
- The user feedback gate is the key mechanism — it prevents the team from converging on ideas the user doesn't care about
- Independent brainwriting prevents anchoring bias — teammates don't see each other's ideas until the Facilitator collects them
- 3 core teammates keeps cost low; add User Voice and/or Domain Expert for richer sessions
- Include the Task Blocking Protocol in the spawn prompt — brainwriting phases must complete before collection (see "Task Blocking Protocol" section below)

---

## Task Blocking Protocol

Every spawn prompt should include the standard Task Blocking Protocol block to ensure teammates respect task dependencies. Without this, teammates may start blocked tasks early, skip reading upstream deliverables, or invent unrelated work while waiting.

**Include this block in the spawn prompt for each teammate:**

```
**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

This is especially important for blueprints with deep dependency chains (Frontend Design, Productivity Systems, Brainstorming) where later tasks depend on specific outputs from earlier ones.

## Customizing Blueprints

These blueprints are starting points. Adapt them by:

1. **Adjusting team size** — Add or remove teammates based on task complexity
2. **Changing model** — Use Sonnet for cost-effective work, Opus for complex reasoning
3. **Adding plan approval** — For risky changes, require teammates to plan before implementing
4. **Enabling delegate mode** — Press Shift+Tab to keep the lead focused on coordination
5. **Defining file boundaries** — Assign specific directories to avoid merge conflicts

## Choosing the Right Blueprint

```
Is the task about understanding something?     → Research & Discovery
Is the task about building something new?      → Feature Development
Is the task about reviewing existing work?     → Code Review & QA
Is the task about fixing something broken?     → Debugging & Investigation
Is the task about designing a user interface?  → Frontend Design
Is the task about sequencing what to build?    → Planning & Roadmapping
Is the task about optimizing workflows?        → Productivity Systems
Is the task about generating creative ideas?   → Brainstorming & Ideation
Is it a mix?                                   → Use team-architect agent for custom design
```
