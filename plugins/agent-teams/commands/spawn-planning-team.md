---
name: spawn-planning-team
description: Spawn an adaptive planning team with 7 modes — Product Roadmap, Technical Spec, Architecture Decision, Migration Strategy, Business Case, Go-to-Market, OKR/Goals
argument-hint: <what you need to plan>
---

# Spawn Adaptive Planning Team

Create an agent team for structured planning across 7 modes covering technical and business planning needs. Each mode spawns a purpose-built team with distinct roles, a discovery interview for rich shared context, a user feedback gate after initial analysis, and mode-specific output formats that feed into downstream team commands.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a planning topic via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Mode Selection

Present the mode table and ask the user which planning mode fits their need. If the mode is obvious from `$ARGUMENTS`, confirm it rather than asking.

| # | Mode | Category | When to Use |
|---|------|----------|-------------|
| 1 | **Product Roadmap** | Technical | Sequencing features into phased delivery with business rationale |
| 2 | **Technical Spec** | Technical | Specifying a feature or system before implementation |
| 3 | **Architecture Decision** | Technical | Choosing between architectural approaches (ADR) |
| 4 | **Migration Strategy** | Technical | Planning a system, data, or technology migration |
| 5 | **Business Case** | Business | Building a case for investment or initiative |
| 6 | **Go-to-Market** | Business | Planning product launch, positioning, and channels |
| 7 | **OKR / Goals** | Business | Setting objectives, key results, and success metrics |

**Auto-inference keywords:**
- Roadmap, phases, sequencing, prioritize features → **Product Roadmap**
- Spec, specification, requirements, feature design → **Technical Spec**
- ADR, architecture, decision, approach, trade-offs → **Architecture Decision**
- Migration, migrate, upgrade, transition, move to → **Migration Strategy**
- Business case, investment, ROI, justify, budget → **Business Case**
- GTM, go-to-market, launch, positioning, channels → **Go-to-Market**
- OKR, objectives, key results, goals, metrics → **OKR / Goals**

**Pipeline context:** Business modes feed into technical modes: Business Case / GTM / OKR → Product Roadmap → Technical Spec → `/spawn-feature-team`

## Step 2: Discovery Interview

Before spawning the team, conduct a structured interview to deeply understand the planning topic. The interview results become shared context for all teammates — this ensures rich, informed planning rather than shallow analysis on a bare topic string.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Core Questions (ask up to 5, all modes)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Objective** — "What specifically are we planning? What's the desired end state?" | Anchors the session — teammates need to know the goal |
| 2 | **Current state** — "What exists today? What's the starting point?" | Context for gap analysis and feasibility |
| 3 | **Constraints** — "What are the non-negotiables? (budget, timeline, tech stack, team size, regulatory)" | Prevents plans that violate hard constraints |
| 4 | **Stakeholders** — "Who are the key stakeholders? Who decides, who's affected, who implements?" | Shapes advocacy and communication in the plan |
| 5 | **Success definition** — "How will you know this plan succeeded? What does done look like?" | Anchors outcomes and acceptance criteria |

### Extended Questions by Mode (ask 2-5 based on complexity)

#### Product Roadmap
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Feature inventory** — "What features or capabilities need to be sequenced?" | Always — this is the core input |
| 7 | **User segments** — "Who are the target users? Are there different segments with different needs?" | When user impact matters |
| 8 | **Dependencies** — "Are there known dependencies between features or on external systems?" | When sequencing is complex |
| 9 | **Existing work** — "What's already been built, designed, or spec'd?" | When there's prior work to build on |
| 10 | **Release cadence** — "How often do you ship? What are the release milestones?" | When timing matters |

#### Technical Spec
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Feature scope** — "What exactly should this feature do? What are the user-facing behaviors?" | Always — defines the spec boundary |
| 7 | **Integration points** — "What existing systems, APIs, or services does this touch?" | When the feature isn't standalone |
| 8 | **Data requirements** — "What data does this feature need? What's the data model?" | When data is central |
| 9 | **Non-functional requirements** — "What are the performance, security, scalability requirements?" | When quality attributes matter |
| 10 | **Open questions** — "What's still unclear or undecided?" | Always — surfaces ambiguity early |

#### Architecture Decision
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Decision context** — "What triggered this decision? Why now?" | Always — establishes urgency and motivation |
| 7 | **Known options** — "What approaches have you already considered?" | When the user has prior research |
| 8 | **Evaluation criteria** — "What matters most — performance, cost, simplicity, team expertise?" | Always — shapes the ADR evaluation |
| 9 | **Reversibility** — "How hard is it to change this decision later? Is this a one-way door?" | Always — determines rigor needed |
| 10 | **Team expertise** — "What does the team know well? What's unfamiliar territory?" | When skill fit matters |

#### Migration Strategy
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Current system** — "Describe the system being migrated — stack, scale, data volume" | Always — baseline for planning |
| 7 | **Target system** — "What's the target? New stack, new architecture, new provider?" | Always — defines the destination |
| 8 | **Migration drivers** — "Why migrate? End of life, cost, performance, features?" | When motivation isn't clear |
| 9 | **Downtime tolerance** — "How much downtime is acceptable? Is zero-downtime required?" | Always — shapes migration strategy |
| 10 | **Data migration** — "What data needs to move? What's the volume and transformation complexity?" | When data is involved |

#### Business Case
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Investment** — "What's the estimated cost or investment required?" | Always — central to the business case |
| 7 | **Market context** — "What's the competitive landscape? What are competitors doing?" | When market positioning matters |
| 8 | **Revenue model** — "How does this generate or protect revenue?" | When ROI is the primary argument |
| 9 | **Alternatives** — "What are the alternatives to this investment? Including 'do nothing'?" | Always — strengthens the case |
| 10 | **Decision makers** — "Who approves this? What do they care about most?" | When the audience shapes the argument |

#### Go-to-Market
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Product readiness** — "What's the product state? MVP, beta, GA?" | Always — shapes launch strategy |
| 7 | **Target audience** — "Who's the ideal first customer? What's their buying process?" | Always — defines positioning |
| 8 | **Competitive positioning** — "How is this different from alternatives?" | When differentiation matters |
| 9 | **Channels** — "What distribution channels are available or planned?" | When channel strategy is open |
| 10 | **Pricing** — "What's the pricing model? Is pricing decided?" | When pricing affects GTM |

#### OKR / Goals
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Strategic context** — "What's the higher-level strategy these OKRs support?" | Always — ensures alignment |
| 7 | **Time horizon** — "What's the OKR period? Quarter, half, year?" | Always — scopes the ambition |
| 8 | **Existing metrics** — "What metrics are you already tracking? What data is available?" | When measurement matters |
| 9 | **Prior OKRs** — "What were the previous OKRs? What was achieved vs missed?" | When there's OKR history |
| 10 | **Organizational scope** — "Is this for a team, department, or company? Who owns each OKR?" | When scope isn't clear |

Present questions in batches of 3-5 using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 3: Optional Teammates

Ask the user if they want to include optional teammates that add specialized depth:

### Technical Modes (Product Roadmap, Technical Spec, Architecture Decision, Migration Strategy)

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **Security Reviewer** | Identifies security implications, compliance requirements, threat modeling | Specs and architectures with auth, data, or compliance concerns |
| **DevOps Advisor** | Infrastructure, deployment, CI/CD, observability considerations | Migrations, architectures with ops impact |

### Business Modes (Business Case, Go-to-Market, OKR / Goals)

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **Data Analyst** | Quantitative analysis, metric definition, data-backed arguments | Business cases needing numbers, OKRs needing baselines |
| **Customer Voice** | Customer perspective, adoption friction, value perception | GTM plans, business cases focused on customer impact |

## Step 4: Project Analysis

Before spawning, quickly analyze the project to identify relevant context:

### Technical Modes
- Project structure and major modules
- Existing architecture docs, specs, or ADRs
- README, CONTRIBUTING, or design docs
- Dependency files (package.json, requirements.txt, etc.)
- Existing implementation phases or milestones

### Business Modes
- Business documents, strategy docs, prior planning artifacts
- README or project description for product context
- Any existing roadmaps, OKR documents, or business cases
- Market or competitive analysis documents

Include findings in the Planning Context section of the spawn prompt.

## Step 5: Spawn the Team

Compile the interview results into a `## Planning Context` section and spawn the mode-specific team. Replace all placeholders with actual content from the interview and project analysis.

Team name: `plan-[mode-slug]-[project-slug]` (e.g., `plan-roadmap-myapp`, `plan-spec-auth-system`, `plan-adr-database`)

All teammates use Sonnet — planning is analysis and writing, not code generation. Enable delegate mode.

---

### Mode 1: Product Roadmap

**Team:** Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate

```
Create an agent team called "plan-roadmap-[project-slug]" to create a product roadmap for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Strategist** — Analyze the product vision and define strategic objectives. Identify core
   value propositions, business differentiators, and strategic goals. Determine which capabilities
   are foundational vs incremental. Frame each implementation phase in terms of business value
   delivered, not just features shipped. Read project docs in [PROJECT_DOCS] to understand current state.
   Use Sonnet model.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build a dependency
   graph showing which features require others to exist first. Identify technical foundations
   that must be laid early (auth, data models, core APIs). Sequence phases by dependency order,
   risk level, and value delivery. Flag circular dependencies and propose how to break them.
   Review project structure in [PROJECT_DIRS] to understand technical layers.
   Use Sonnet model.

3. **Outcomes Analyst** — Define measurable success criteria and acceptance conditions for each
   phase. Write specific, testable definitions of done. Identify KPIs that prove each phase
   delivered its intended value. Create acceptance criteria that implementation teams can
   directly verify. Ensure outcomes are measurable, not aspirational.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   user segments benefit from each phase. Flag business constraints (budget, timeline, regulatory,
   team capacity) that affect sequencing. Challenge assumptions about user value — push back
   when phases don't clearly serve users. Conduct feasibility checks on proposed timelines.
   Use Sonnet model.

[IF SECURITY REVIEWER SELECTED]
5. **Security Reviewer** — Review each phase for security implications. Identify where auth,
   authorization, data protection, and compliance requirements affect sequencing. Flag phases
   that create security debt if deferred. Ensure security foundations are planned early.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
6. **DevOps Advisor** — Assess infrastructure and deployment implications per phase. Identify
   CI/CD, monitoring, scaling, and environment requirements. Flag phases that need infrastructure
   work before feature development can begin.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final roadmap synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Objective
[What we're planning, desired end state]

### Current State
[What exists today, starting point]

### Constraints
[Non-negotiables: budget, timeline, tech stack, team size, regulatory]

### Stakeholders
[Key stakeholders, decision makers, affected parties]

### Success Definition
[How success is measured, what done looks like]

### Additional Context
[Feature inventory, user segments, dependencies, existing work, release cadence — as applicable]

### Project Analysis
[Findings from codebase/document analysis]

Create these tasks:
1. [Strategist] Analyze product vision and define strategic objectives — identify core value propositions and business goals
2. [Stakeholder Advocate] Identify user needs, business constraints, and external dependencies
3. [Prioritizer] Map feature dependencies and technical prerequisites (blocked by task 1)
4. [Strategist] Define implementation phases with business rationale for each (blocked by tasks 1, 2)
5. [Lead] USER FEEDBACK GATE — Present initial phase structure to user. Ask user to: confirm phase priorities, adjust scope, flag misalignment, and provide direction for detailed planning (blocked by tasks 3, 4)
6. [Prioritizer] Sequence phases by dependency order and risk — resolve conflicts based on user direction (blocked by task 5)
7. [Outcomes Analyst] Define success criteria and acceptance conditions per phase (blocked by task 5)
8. [Stakeholder Advocate] Feasibility review — challenge assumptions and flag risks (blocked by tasks 6, 7)
9. [Outcomes Analyst] Refine outcomes based on feasibility feedback (blocked by task 8)
10. [All] Cross-review: validate plan coherence across strategic, dependency, outcomes, and stakeholder perspectives
11. [Lead] Compile roadmap document with phase briefs for implementation teams

Important: Each phase brief in the final roadmap should be directly usable as input to
/spawn-feature-team or /spawn-design-team. Include: phase goal, features included,
dependencies on prior phases, success criteria, and business rationale.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Roadmap document with phase briefs → feeds into `/spawn-feature-team`, `/spawn-design-team`

---

### Mode 2: Technical Spec

**Team:** Architect, API Designer, Risk Analyst, DX Advocate

```
Create an agent team called "plan-spec-[project-slug]" to write a technical specification for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Architect** — Define the high-level technical design: system boundaries, component
   architecture, data flow, and technology choices. Identify the core abstractions and how
   they compose. Read existing architecture docs and codebase structure to ensure the spec
   fits the existing system. Focus on the "what" and "how" at a structural level.
   Use Sonnet model.

2. **API Designer** — Design the interfaces: API endpoints, request/response schemas, data
   models, state transitions, and integration contracts. Define clear boundaries between
   components. Write schemas that are specific enough for implementation but flexible enough
   for iteration. Include error handling and edge cases in the contract.
   Use Sonnet model.

3. **Risk Analyst** — Identify technical risks, failure modes, and edge cases. For each risk,
   assess likelihood and impact. Propose mitigations or design alternatives that reduce risk.
   Challenge optimistic assumptions about performance, scalability, and complexity. Flag areas
   where the spec is ambiguous or underspecified.
   Use Sonnet model.

4. **DX Advocate** — Represent the developer experience perspective. Evaluate the spec from
   the implementer's viewpoint: is this clear enough to build from? Are there missing details?
   Is the API ergonomic? Are error messages helpful? Identify where the spec needs examples,
   diagrams, or clarification. Review existing codebase patterns to ensure consistency.
   Use Sonnet model.

[IF SECURITY REVIEWER SELECTED]
5. **Security Reviewer** — Review the spec for security implications: authentication,
   authorization, input validation, data protection, OWASP considerations. Ensure security
   requirements are explicit in the spec, not assumed.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
6. **DevOps Advisor** — Review deployment, infrastructure, and observability requirements.
   Identify what needs to be provisioned, monitored, or configured. Flag spec decisions that
   create operational burden.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final spec synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[Feature or system being specified]

### Current State
[Existing system, codebase context]

### Constraints
[Tech stack, performance requirements, timeline]

### Stakeholders
[Implementers, reviewers, users]

### Success Definition
[What a complete, usable spec looks like]

### Additional Context
[Feature scope, integration points, data requirements, non-functional requirements, open questions]

### Project Analysis
[Relevant codebase findings]

Create these tasks:
1. [Architect] Analyze existing system and define high-level technical design — components, boundaries, data flow
2. [API Designer] Draft API contracts, data models, and integration interfaces
3. [DX Advocate] Review existing codebase patterns and developer conventions (blocked by task 1)
4. [Risk Analyst] Identify technical risks, failure modes, and edge cases (blocked by tasks 1, 2)
5. [Lead] USER FEEDBACK GATE — Present initial design and API contracts to user. Ask user to: confirm approach, flag concerns, clarify ambiguities, and set priorities for detailed spec (blocked by tasks 3, 4)
6. [Architect] Refine architecture based on user direction — detail component internals (blocked by task 5)
7. [API Designer] Finalize API contracts with error handling, edge cases, and examples (blocked by task 5)
8. [Risk Analyst] Propose mitigations for accepted risks — design alternatives where needed (blocked by task 5)
9. [DX Advocate] Write implementation guide with examples and developer notes (blocked by tasks 6, 7)
10. [All] Cross-review: validate spec coherence across architecture, API, risk, and DX perspectives
11. [Lead] Compile technical specification document

Important: The final spec should be detailed enough for implementation teams to build from
without further clarification. Include: system design, API contracts, data models, error
handling, security considerations, and implementation guidance. Feeds into /spawn-feature-team.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Technical specification document → feeds into `/spawn-feature-team`

---

### Mode 3: Architecture Decision

**Team:** Solution Architect, Explorer, Trade-off Analyst, Critic

```
Create an agent team called "plan-adr-[project-slug]" to make an architecture decision about [OBJECTIVE].

Spawn [4-6] teammates:

1. **Solution Architect** — Frame the decision context and define the evaluation framework.
   Articulate what we're deciding, why it matters, and what criteria will guide the choice.
   Read existing architecture and codebase to understand the current system. Synthesize
   inputs from other teammates into a clear recommendation with rationale.
   Use Sonnet model.

2. **Explorer** — Research and document each option thoroughly. For each approach, describe:
   how it works, what it requires, what it enables, and what it precludes. Provide concrete
   examples, reference implementations, and relevant prior art. Go deep on technical details
   that affect the decision.
   Use Sonnet model.

3. **Trade-off Analyst** — Build a structured comparison matrix across all options. Evaluate
   each option against the defined criteria (performance, cost, complexity, team expertise,
   reversibility, time to implement). Quantify where possible. Identify hidden costs and
   second-order consequences. Make trade-offs explicit, not implicit.
   Use Sonnet model.

4. **Critic** — Challenge every option and every assumption. Identify failure modes, scaling
   limits, and worst-case scenarios. Ask "what could go wrong?" for each approach. Push back
   on the recommended option — if it survives scrutiny, the decision is stronger. Play devil's
   advocate even on the winning option.
   Use Sonnet model.

[IF SECURITY REVIEWER SELECTED]
5. **Security Reviewer** — Evaluate security implications of each option. Identify which
   approaches create security advantages or risks. Flag compliance considerations.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
6. **DevOps Advisor** — Evaluate operational implications of each option. Assess deployment
   complexity, monitoring needs, and operational burden for each approach.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final ADR synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[Decision being made]

### Current State
[Current system and why a decision is needed]

### Constraints
[Non-negotiables that constrain the decision]

### Stakeholders
[Who decides, who's affected]

### Success Definition
[What a good decision outcome looks like]

### Additional Context
[Decision context, known options, evaluation criteria, reversibility, team expertise]

### Project Analysis
[Relevant codebase findings]

Create these tasks:
1. [Solution Architect] Frame the decision context — what we're deciding, why, and evaluation criteria
2. [Explorer] Research and document each option in depth — capabilities, requirements, examples
3. [Trade-off Analyst] Build initial comparison matrix across options (blocked by tasks 1, 2)
4. [Lead] USER FEEDBACK GATE — Present options and initial analysis to user. Ask user to: eliminate options, adjust criteria, add considerations, and set direction for deep analysis (blocked by task 3)
5. [Explorer] Deep-dive on remaining options based on user direction (blocked by task 4)
6. [Trade-off Analyst] Finalize comparison with quantified trade-offs and second-order effects (blocked by tasks 4, 5)
7. [Critic] Challenge the leading option — identify failure modes, worst cases, and hidden costs (blocked by task 6)
8. [Solution Architect] Draft recommendation with full rationale, addressing Critic's challenges (blocked by task 7)
9. [All] Cross-review: validate ADR coherence — does the recommendation survive all perspectives?
10. [Critic] Final challenge — last chance to raise concerns before the decision is recorded
11. [Lead] Compile Architecture Decision Record (ADR) document

Important: The final ADR should follow the standard format: Title, Status, Context, Decision,
Consequences. Include the comparison matrix, rejected options with reasons, and implementation
guidance. The ADR should be a durable reference for future teams.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Architecture Decision Record (ADR) → feeds into implementation teams

---

### Mode 4: Migration Strategy

**Team:** State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate

```
Create an agent team called "plan-migration-[project-slug]" to plan the migration of [OBJECTIVE].

Spawn [4-6] teammates:

1. **State Analyst** — Document the current state comprehensively: system architecture, data
   schemas, integrations, traffic patterns, and operational characteristics. Then document the
   target state with equal rigor. Produce a clear gap analysis showing what changes between
   current and target. Read existing codebase and infrastructure docs to ground the analysis.
   Use Sonnet model.

2. **Migration Planner** — Design the migration path: sequencing, phases, rollback points, and
   parallel-run strategies. Determine whether to migrate incrementally (strangler fig), in
   parallel (dual-write), or via a cutover. Define the migration order for components and data.
   Create a step-by-step execution plan with clear checkpoints.
   Use Sonnet model.

3. **Risk Mitigator** — Identify migration risks across all dimensions: data loss, downtime,
   performance degradation, feature regression, and integration failures. For each risk, define
   detection methods, mitigation strategies, and rollback procedures. Create a risk matrix with
   likelihood, impact, and mitigation status. Define go/no-go criteria for each phase.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent the perspectives of everyone affected: end users,
   development team, operations team, and business stakeholders. Define communication plans
   for each audience. Identify training needs. Flag user-facing changes that need careful
   handling. Ensure the migration timeline accounts for organizational readiness.
   Use Sonnet model.

[IF SECURITY REVIEWER SELECTED]
5. **Security Reviewer** — Review migration for security implications: data in transit, access
   control during transition, credential migration, audit trail continuity.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
6. **DevOps Advisor** — Plan infrastructure for the migration: parallel environments, data
   pipelines, monitoring during transition, DNS/routing changes, rollback infrastructure.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final migration plan synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[What's being migrated and why]

### Current State
[Current system description — stack, scale, data]

### Constraints
[Downtime tolerance, budget, timeline, team capacity]

### Stakeholders
[Users, dev team, ops team, business stakeholders]

### Success Definition
[What a successful migration looks like]

### Additional Context
[Target system, migration drivers, downtime tolerance, data migration complexity]

### Project Analysis
[Relevant codebase and infrastructure findings]

Create these tasks:
1. [State Analyst] Document current state — architecture, data, integrations, traffic
2. [State Analyst] Document target state and produce gap analysis (blocked by task 1)
3. [Risk Mitigator] Identify migration risks and failure modes (blocked by task 1)
4. [Migration Planner] Design initial migration approach — incremental vs cutover vs parallel (blocked by task 2)
5. [Lead] USER FEEDBACK GATE — Present current/target gap analysis and proposed approach to user. Ask user to: confirm approach, adjust risk tolerance, set phase priorities (blocked by tasks 3, 4)
6. [Migration Planner] Create detailed phase plan with rollback points and checkpoints (blocked by task 5)
7. [Risk Mitigator] Define mitigations and go/no-go criteria per phase (blocked by tasks 5, 6)
8. [Stakeholder Advocate] Create communication and training plan per stakeholder group (blocked by task 5)
9. [All] Cross-review: validate migration plan coherence — does each phase have clear entry/exit criteria and rollback?
10. [Risk Mitigator] Final risk assessment — pre-mortem on the full plan (blocked by task 9)
11. [Stakeholder Advocate] Finalize stakeholder communication timeline (blocked by task 9)
12. [Lead] Compile migration plan document with phase details, risk matrix, and communication plan

Important: The final migration plan should include: current/target state analysis, migration
approach, phased execution plan with rollback points, risk matrix with mitigations, go/no-go
criteria, and stakeholder communication plan.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Migration plan with phases, risk matrix, rollback procedures → feeds into implementation teams

---

### Mode 5: Business Case

**Team:** Market Analyst, Financial Analyst, Strategist, Risk Analyst

```
Create an agent team called "plan-bizcase-[project-slug]" to build a business case for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Market Analyst** — Research the market context: competitive landscape, market size, trends,
   and customer needs. Identify the market opportunity and how this initiative captures it.
   Ground the business case in external evidence, not just internal assumptions. Find comparable
   initiatives or case studies that support the argument.
   Use Sonnet model.

2. **Financial Analyst** — Build the financial model: costs (build, operate, maintain), revenue
   impact (new revenue, retained revenue, cost savings), and timeline to value. Define ROI,
   payback period, and NPV where appropriate. Model best-case, expected, and worst-case scenarios.
   Make assumptions explicit and sensitivity-test key variables.
   Use Sonnet model.

3. **Strategist** — Frame the strategic argument: how does this initiative align with company
   strategy, competitive positioning, and long-term vision? Identify strategic risks of NOT
   doing this (competitive threats, technical debt, market window). Build the narrative that
   connects the financial case to the strategic context.
   Use Sonnet model.

4. **Risk Analyst** — Identify business risks: market risk, execution risk, technology risk,
   and opportunity cost. For each risk, assess probability and impact. Compare the risk profile
   of investing vs not investing. Identify key assumptions that, if wrong, would invalidate
   the business case.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide quantitative foundation: usage data, customer metrics, market
   data, and benchmarks. Validate financial assumptions with data. Identify metrics gaps
   where assumptions can't be data-backed.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Represent the customer perspective: what problem does this solve for
   customers? What's the customer demand signal? How does this affect retention and satisfaction?
   Ground the case in customer evidence (surveys, interviews, support tickets, churn data).
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final business case synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[Initiative or investment being justified]

### Current State
[Current situation and why change is needed]

### Constraints
[Budget, timeline, organizational constraints]

### Stakeholders
[Decision makers, budget owners, affected teams]

### Success Definition
[What approval and successful execution look like]

### Additional Context
[Investment size, market context, revenue model, alternatives, decision makers]

### Project Analysis
[Relevant business documents and context]

Create these tasks:
1. [Market Analyst] Research market context — competitive landscape, trends, opportunity size
2. [Financial Analyst] Build initial financial model — costs, revenue impact, timeline to value
3. [Strategist] Frame strategic alignment and competitive positioning (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present market context, initial financials, and strategic framing to user. Ask user to: validate assumptions, adjust scope, flag missing considerations (blocked by tasks 2, 3)
5. [Financial Analyst] Refine financial model with scenario analysis — best/expected/worst case (blocked by task 4)
6. [Risk Analyst] Identify and assess business risks — compare invest vs not-invest (blocked by task 4)
7. [Strategist] Build the strategic narrative connecting financials to strategy (blocked by tasks 4, 5)
8. [Market Analyst] Provide supporting evidence — case studies, benchmarks, customer signals (blocked by task 4)
9. [All] Cross-review: validate business case coherence — do the numbers, strategy, and risks tell a consistent story?
10. [Risk Analyst] Sensitivity analysis — which assumptions, if wrong, break the case? (blocked by task 9)
11. [Lead] Compile business case document with executive summary, financials, and recommendation

Important: The final business case should include: executive summary, strategic context,
market analysis, financial model with scenarios, risk assessment, and clear recommendation.
Feeds into Product Roadmap mode for execution planning.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Business case decision document → feeds into Product Roadmap mode

---

### Mode 6: Go-to-Market

**Team:** Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator

```
Create an agent team called "plan-gtm-[project-slug]" to create a go-to-market plan for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Positioning Strategist** — Define product positioning: what is it, who is it for, why is
   it better than alternatives? Craft the core messaging framework: value proposition, key
   messages per audience, and competitive differentiation. Ensure positioning is specific and
   defensible, not generic. Review existing product docs for positioning inputs.
   Use Sonnet model.

2. **Channel Planner** — Design the distribution strategy: which channels reach the target
   audience most effectively? Evaluate direct vs indirect, paid vs organic, and online vs
   offline channels. Build a channel mix with expected reach, cost, and timeline for each.
   Define channel-specific tactics and content needs.
   Use Sonnet model.

3. **Customer Advocate** — Represent the target customer throughout GTM planning. Define
   customer personas, buying journey stages, and decision criteria. Identify adoption barriers
   and how to address them. Ensure all GTM activities are grounded in customer reality, not
   internal assumptions. Review customer feedback sources for evidence.
   Use Sonnet model.

4. **Launch Coordinator** — Plan the launch execution: timeline, milestones, dependencies,
   and team responsibilities. Define launch phases (soft launch, beta, GA). Create launch
   checklists and readiness criteria. Coordinate across positioning, channels, and customer
   activities. Plan post-launch measurement and iteration.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide market data, customer metrics, and competitive benchmarks.
   Define measurement framework for GTM success. Set up tracking for key launch metrics.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Deep customer empathy: buying process, objections, switching costs,
   and what messaging resonates. Review customer interviews, support data, and feedback.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final GTM plan synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[Product or feature being launched]

### Current State
[Product readiness, existing market presence]

### Constraints
[Budget, timeline, team resources]

### Stakeholders
[Marketing, sales, product, engineering, customers]

### Success Definition
[Launch success metrics]

### Additional Context
[Target audience, competitive positioning, channels, pricing]

### Project Analysis
[Relevant product and market documents]

Create these tasks:
1. [Positioning Strategist] Define product positioning — value prop, key messages, differentiation
2. [Customer Advocate] Define customer personas, buying journey, and adoption barriers
3. [Channel Planner] Evaluate channel options and build initial channel mix (blocked by tasks 1, 2)
4. [Lead] USER FEEDBACK GATE — Present positioning, personas, and channel options to user. Ask user to: validate positioning, confirm target audience, select channels, adjust priorities (blocked by task 3)
5. [Positioning Strategist] Refine messaging for selected channels and audiences (blocked by task 4)
6. [Channel Planner] Detail channel tactics, content needs, and budget allocation (blocked by task 4)
7. [Customer Advocate] Design onboarding and adoption strategy for target personas (blocked by task 4)
8. [Launch Coordinator] Create launch timeline with phases, milestones, and readiness criteria (blocked by tasks 5, 6, 7)
9. [All] Cross-review: validate GTM plan coherence — do positioning, channels, and launch plan align?
10. [Launch Coordinator] Define post-launch measurement plan and iteration triggers (blocked by task 9)
11. [Lead] Compile GTM plan with positioning, channel strategy, launch timeline, and success metrics

Important: The final GTM plan should include: positioning framework, customer personas,
channel strategy with tactics, launch timeline, readiness criteria, and measurement plan.
Feeds into Product Roadmap mode for execution alignment.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** GTM plan with positioning, channels, launch timeline → feeds into Product Roadmap mode

---

### Mode 7: OKR / Goals

**Team:** Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate

```
Create an agent team called "plan-okr-[project-slug]" to define OKRs and goals for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Strategic Planner** — Define objectives that connect to higher-level strategy. Ensure each
   objective is ambitious but achievable, qualitative but clear, and inspiring but actionable.
   Map how objectives cascade from company/department strategy to team-level goals. Identify
   gaps where strategic priorities lack corresponding objectives.
   Use Sonnet model.

2. **Metrics Designer** — Design key results that are specific, measurable, and time-bound.
   For each key result, define: the metric, current baseline, target value, measurement method,
   and data source. Ensure metrics are leading indicators (not just lagging), are within the
   team's control, and avoid perverse incentives. Define 2-4 key results per objective.
   Use Sonnet model.

3. **Alignment Reviewer** — Check alignment in all directions: vertical (does this support
   the strategy above?), horizontal (are there conflicts with other teams' OKRs?), and internal
   (do the key results actually measure the objective?). Identify dependencies between OKRs
   that need coordination. Flag OKRs that are really tasks disguised as goals.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent the perspectives of everyone who owns, contributes to,
   or is measured by these OKRs. Ensure OKRs are understood and accepted, not just assigned.
   Identify where OKRs create tension between teams. Review existing metrics and prior OKR
   cycles for context.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide baselines for all proposed metrics. Identify which metrics are
   currently tracked and which need new instrumentation. Validate that targets are realistic
   based on historical data.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Ensure OKRs reflect customer impact, not just internal activity.
   Challenge OKRs that measure output without measuring outcome. Add customer-centric
   key results where missing.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final OKR synthesis.

## Planning Context

[COMPILED INTERVIEW RESULTS]

### Objective
[What goals are being set and for whom]

### Current State
[Current metrics, prior OKRs, organizational context]

### Constraints
[Time horizon, organizational scope, measurement capabilities]

### Stakeholders
[OKR owners, contributors, leadership]

### Success Definition
[What good OKRs look like for this context]

### Additional Context
[Strategic context, time horizon, existing metrics, prior OKRs, organizational scope]

### Project Analysis
[Relevant strategy documents and existing metrics]

Create these tasks:
1. [Strategic Planner] Define draft objectives aligned to strategy — ambitious, qualitative, actionable
2. [Metrics Designer] Inventory existing metrics and identify baselines
3. [Alignment Reviewer] Review strategic context and identify alignment requirements (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present draft objectives and alignment analysis to user. Ask user to: confirm objectives, adjust ambition level, flag missing areas, and prioritize (blocked by tasks 2, 3)
5. [Metrics Designer] Design key results for confirmed objectives — specific, measurable, time-bound (blocked by task 4)
6. [Strategic Planner] Refine objectives based on user direction and metrics feasibility (blocked by tasks 4, 5)
7. [Alignment Reviewer] Check alignment — vertical, horizontal, and internal coherence (blocked by tasks 5, 6)
8. [Stakeholder Advocate] Review OKRs for ownership clarity, acceptance, and inter-team tensions (blocked by task 7)
9. [All] Cross-review: validate OKR tree coherence — do objectives, key results, and ownership form a clear picture?
10. [Metrics Designer] Finalize measurement plan — data sources, tracking cadence, review schedule (blocked by task 9)
11. [Lead] Compile OKR document with objectives, key results, ownership, and measurement plan

Important: The final OKR document should include: objective tree, key results with baselines
and targets, ownership map, measurement plan, and alignment notes. Feeds into Product Roadmap
and/or Technical Spec modes for execution planning.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** OKR tree with objectives, key results, and measurement plan → feeds into Product Roadmap, Technical Spec modes

---

## Output

After spawning, inform the user:
- The team has been created with [4-6] teammates for **[MODE NAME]** planning
- **Phase 1 (Analysis):** Teammates explore the planning space from their distinct perspectives
- **Phase 2 (Your Turn):** You'll be presented with initial findings — this is the user feedback gate where you choose direction before the team invests in detailed planning
- **Phase 3 (Detailed Planning):** Refined work based on your direction
- **Phase 4 (Cross-Review):** All teammates validate plan coherence
- **Phase 5 (Synthesis):** Lead compiles the final [OUTPUT FORMAT] document
- All teammates use Sonnet — planning is analysis and writing, not code generation
- The final deliverable feeds into [DOWNSTREAM COMMANDS] for execution
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
