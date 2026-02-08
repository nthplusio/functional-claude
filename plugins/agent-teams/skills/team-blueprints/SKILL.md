---
name: team-blueprints
description: |
  This skill should be used when the user wants pre-designed agent team configurations for common application development phases. Use this skill when the user asks for a "research team", "feature development team", "code review team", "debug team", "design team", "planning team", "roadmap team", "team blueprint", "team template", or says "spawn a team for [development phase]".

  Provides 6 ready-to-use team blueprints: Research & Discovery, Feature Development, Code Review & QA, Debugging & Investigation, Frontend Design, and Planning & Roadmapping.
version: 0.3.0
---

# Agent Team Blueprints

Pre-designed team configurations for six application development phases. Each blueprint defines the team composition, teammate roles, task structure, and the prompt to use.

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

---

## Blueprint 6: Planning & Roadmapping Team

**When to use:** Working through a business plan, product vision, or feature set to determine the correct order of implementation. Best when you need to define WHAT to build and WHY before handing off to implementation teams.

**Why teams work here:** A single session conflates strategic thinking with tactical details. Four distinct perspectives — business strategy, dependency analysis, measurable outcomes, and stakeholder advocacy — create a structured funnel from broad vision to actionable phase briefs that implementation teams can directly consume.

### Team Composition

| Teammate | Role | Focus | Model |
|----------|------|-------|-------|
| **Strategist** | Business alignment & vision | Business objectives, value propositions, strategic sequencing | Sonnet |
| **Prioritizer** | Dependency analysis & sequencing | Implementation order, dependency graphs, risk-ordered scheduling | Sonnet |
| **Outcomes Analyst** | Success criteria & acceptance | Measurable outcomes, acceptance criteria, KPIs, definition of done | Sonnet |
| **Stakeholder Advocate** | User & business perspective | User impact, business constraints, feasibility checks | Sonnet |

### Spawn Prompt

```
Create an agent team to plan and sequence the implementation of [BUSINESS PLAN / FEATURE SET].
Spawn 4 teammates:

1. **Strategist** — Analyze the business plan and define strategic objectives. Identify core
   value propositions, business differentiators, and strategic goals. Determine which
   capabilities are foundational vs incremental. Frame each implementation phase in terms
   of business value delivered, not just features shipped.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build a dependency
   graph showing which features require others to exist first. Identify technical foundations
   that must be laid early (auth, data models, core APIs). Sequence phases by dependency
   order, risk level, and value delivery. Flag circular dependencies and propose how to
   break them.

3. **Outcomes Analyst** — Define measurable success criteria and acceptance conditions for
   each phase. Write specific, testable definitions of done. Identify KPIs that prove each
   phase delivered its intended value. Create acceptance criteria that implementation teams
   can directly verify. Ensure outcomes are measurable, not aspirational.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   user segments benefit from each phase. Flag business constraints (budget, timeline,
   regulatory, team capacity) that affect sequencing. Challenge assumptions about user
   value — push back when phases don't clearly serve users.

Each phase brief in the final roadmap should be directly usable as input to
/spawn-feature-team or /spawn-design-team. Include: phase goal, features included,
dependencies on prior phases, success criteria, and business rationale.
```

### Task Structure

```
Tasks:
1. [Strategist] Analyze business plan and define strategic objectives
2. [Stakeholder Advocate] Identify user needs, business constraints, and external dependencies
3. [Prioritizer] Map feature dependencies and technical prerequisites (after task 1)
4. [Strategist] Define implementation phases with business rationale (after tasks 1, 2)
5. [Prioritizer] Sequence phases by dependency order and risk (after tasks 3, 4)
6. [Outcomes Analyst] Define success criteria and acceptance conditions per phase (after task 4)
7. [Stakeholder Advocate] Feasibility review — challenge assumptions and flag risks (after tasks 5, 6)
8. [Outcomes Analyst] Refine outcomes based on feasibility feedback (after task 7)
9. [All] Cross-review: validate plan coherence across all perspectives
10. [Lead] Compile roadmap document with phase briefs for implementation teams
```

### Configuration Tips

- Use `--model sonnet` for all teammates — planning is analysis and writing, not code generation
- Enable delegate mode for the lead — the final roadmap is a synthesis of all perspectives
- The funnel-shaped task structure (broad → narrow) is the key mechanism — early tasks explore, later tasks refine
- Phase briefs should be specific enough to hand off directly to `/spawn-feature-team` or `/spawn-design-team`

---

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
Is it a mix?                                   → Use team-architect agent for custom design
```
