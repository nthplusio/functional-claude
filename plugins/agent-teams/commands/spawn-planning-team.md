---
name: spawn-planning-team
description: Spawn an adaptive planning team with 7 modes — Product Roadmap, Technical Spec, Architecture Decision, Migration Strategy, Business Case, Go-to-Market, OKR/Goals
argument-hint: <what you need to plan>
---

# Spawn Adaptive Planning Team

Create an agent team for structured planning across 7 modes. Each mode spawns a purpose-built team with distinct roles, a discovery interview for shared context, a user feedback gate after initial analysis, and output formats that feed into downstream team commands.

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

Before spawning, conduct a structured interview to understand the planning topic. Results become shared context for all teammates.

**Adapt based on `$ARGUMENTS`** — skip questions already answered.

### Core Questions (ask up to 5, all modes)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Objective** — "What specifically are we planning? What's the desired end state?" | Anchors the session |
| 2 | **Current state** — "What exists today? What's the starting point?" | Context for gap analysis |
| 3 | **Constraints** — "What are the non-negotiables? (budget, timeline, tech stack, team size, regulatory)" | Filters out infeasible plans |
| 4 | **Stakeholders** — "Who are the key stakeholders? Who decides, who's affected, who implements?" | Shapes advocacy and communication |
| 5 | **Success definition** — "How will you know this plan succeeded? What does done look like?" | Anchors outcomes |

### Extended Questions by Mode (ask 2-5 based on complexity)

#### Product Roadmap
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Feature inventory** — "What features or capabilities need to be sequenced?" | Always |
| 7 | **User segments** — "Who are the target users? Different segments with different needs?" | When user impact matters |
| 8 | **Dependencies** — "Known dependencies between features or on external systems?" | When sequencing is complex |
| 9 | **Existing work** — "What's already been built, designed, or spec'd?" | When there's prior work |
| 10 | **Release cadence** — "How often do you ship? Release milestones?" | When timing matters |

#### Technical Spec
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Feature scope** — "What exactly should this feature do? User-facing behaviors?" | Always |
| 7 | **Integration points** — "What existing systems, APIs, or services does this touch?" | When not standalone |
| 8 | **Data requirements** — "What data does this feature need? Data model?" | When data is central |
| 9 | **Non-functional requirements** — "Performance, security, scalability requirements?" | When quality attributes matter |
| 10 | **Open questions** — "What's still unclear or undecided?" | Always |

#### Architecture Decision
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Decision context** — "What triggered this decision? Why now?" | Always |
| 7 | **Known options** — "What approaches have you already considered?" | When user has prior research |
| 8 | **Evaluation criteria** — "What matters most — performance, cost, simplicity, team expertise?" | Always |
| 9 | **Reversibility** — "How hard is it to change this later? One-way door?" | Always |
| 10 | **Team expertise** — "What does the team know well? What's unfamiliar?" | When skill fit matters |

#### Migration Strategy
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Current system** — "Describe the system being migrated — stack, scale, data volume" | Always |
| 7 | **Target system** — "What's the target? New stack, architecture, provider?" | Always |
| 8 | **Migration drivers** — "Why migrate? End of life, cost, performance, features?" | When motivation unclear |
| 9 | **Downtime tolerance** — "How much downtime is acceptable? Zero-downtime required?" | Always |
| 10 | **Data migration** — "What data needs to move? Volume and transformation complexity?" | When data is involved |

#### Business Case
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Investment** — "Estimated cost or investment required?" | Always |
| 7 | **Market context** — "Competitive landscape? What are competitors doing?" | When market positioning matters |
| 8 | **Revenue model** — "How does this generate or protect revenue?" | When ROI is primary argument |
| 9 | **Alternatives** — "Alternatives to this investment? Including 'do nothing'?" | Always |
| 10 | **Decision makers** — "Who approves this? What do they care about most?" | When audience shapes argument |

#### Go-to-Market
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Product readiness** — "Product state? MVP, beta, GA?" | Always |
| 7 | **Target audience** — "Ideal first customer? Their buying process?" | Always |
| 8 | **Competitive positioning** — "How is this different from alternatives?" | When differentiation matters |
| 9 | **Channels** — "Distribution channels available or planned?" | When channel strategy is open |
| 10 | **Pricing** — "Pricing model? Is pricing decided?" | When pricing affects GTM |

#### OKR / Goals
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Strategic context** — "Higher-level strategy these OKRs support?" | Always |
| 7 | **Time horizon** — "OKR period? Quarter, half, year?" | Always |
| 8 | **Existing metrics** — "Metrics already tracked? Data available?" | When measurement matters |
| 9 | **Prior OKRs** — "Previous OKRs? Achieved vs missed?" | When there's OKR history |
| 10 | **Organizational scope** — "Team, department, or company? Who owns each?" | When scope unclear |

Present questions in batches of 3-5 using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 3: Optional Teammates

Ask the user if they want to include optional teammates:

### Technical Modes (Product Roadmap, Technical Spec, Architecture Decision, Migration Strategy)

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **DevOps Advisor** | Infrastructure, deployment, CI/CD, observability | Migrations, architectures with ops impact |

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

### Business Modes
- Business documents, strategy docs, prior planning artifacts
- README or project description for product context
- Existing roadmaps, OKR documents, or business cases

Include findings in the Planning Context section of the spawn prompt.

## Step 5: Spawn the Team

Compile the interview results into a `## Planning Context` section and spawn the mode-specific team. Replace all placeholders with actual content from the interview and project analysis.

Team name: `plan-[mode-slug]-[project-slug]` (e.g., `plan-roadmap-myapp`, `plan-spec-auth-system`, `plan-adr-database`)

All teammates use Sonnet — planning is analysis and writing, not code generation. Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

### Shared Prompt Blocks

Include these blocks verbatim in every mode's spawn prompt.

#### Task Blocking Protocol

```
**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
```

#### Output Standards

```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Planning Context back — teammates already have it
- Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

#### Planning Context Template

All modes use this structure (replace bracketed placeholders with actual interview content):

```
## Planning Context

### Objective
[What we're planning, desired end state]

### Current State
[What exists today]

### Constraints
[Non-negotiables]

### Stakeholders
[Decision makers, affected parties]

### Success Definition
[How success is measured]

### Additional Context
[Mode-specific extended question answers]

### Project Analysis
[Findings from codebase/document analysis]
```

---

### Mode 1: Product Roadmap

**Team:** Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate

```
Create an agent team called "plan-roadmap-[project-slug]" to create a product roadmap for [OBJECTIVE].

Spawn [4-5] teammates:

1. **Strategist** — Analyze product vision and define strategic objectives. Identify core
   value propositions, differentiators, and strategic goals. Determine foundational vs
   incremental capabilities. Frame each phase in terms of business value delivered.
   Read project docs in [PROJECT_DOCS].
   Use Sonnet model.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build dependency
   graph showing which features require others first. Identify foundations that must be laid
   early (auth, data models, core APIs). Sequence by dependency order, risk, and value.
   Review project structure in [PROJECT_DIRS].
   Use Sonnet model.

3. **Outcomes Analyst** — Define measurable success criteria per phase. Write specific,
   testable definitions of done. Identify KPIs that prove each phase delivered value.
   Ensure outcomes are measurable, not aspirational.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   segments benefit from each phase. Flag constraints (budget, timeline, regulatory, capacity)
   that affect sequencing. Challenge assumptions about user value.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Assess infrastructure and deployment implications per phase. Identify
   CI/CD, monitoring, scaling requirements. Flag phases needing infrastructure before features.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [Strategist] Analyze product vision, define strategic objectives and core value propositions
2. [Stakeholder Advocate] Identify user needs, business constraints, and external dependencies
3. [Prioritizer] Map feature dependencies and technical prerequisites (blocked by task 1)
4. [Strategist] Define implementation phases with business rationale (blocked by tasks 1, 2)
5. [Lead] USER FEEDBACK GATE — Present initial phase structure to user. Ask user to: confirm priorities, adjust scope, flag misalignment (blocked by tasks 3, 4)
6. [Prioritizer] Sequence phases by dependency order and risk — resolve conflicts per user direction (blocked by task 5)
7. [Outcomes Analyst] Define success criteria and acceptance conditions per phase (blocked by task 5)
8. [Stakeholder Advocate] Feasibility review — challenge assumptions, flag risks (blocked by tasks 6, 7)
9. [Outcomes Analyst] Refine outcomes based on feasibility feedback (blocked by task 8)
10. [All] Cross-review: validate plan coherence across strategic, dependency, outcomes, and stakeholder perspectives
11. [Strategist] Compile roadmap with phase briefs for implementation teams — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `roadmap.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 10)

Each phase brief should be directly usable as input to /spawn-feature-team or /spawn-design-team.
Include: phase goal, features, dependencies, success criteria, and business rationale.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** Roadmap with phase briefs → feeds into `/spawn-feature-team`, `/spawn-design-team`
**Artifact files:** `docs/teams/[TEAM-NAME]/roadmap.md` (primary), `tasks/` (task outputs)

---

### Mode 2: Technical Spec

**Team:** Architect, API Designer, Risk Analyst

```
Create an agent team called "plan-spec-[project-slug]" to write a technical specification for [OBJECTIVE].

Spawn [3-4] teammates:

1. **Architect** — Define high-level technical design: system boundaries, components, data flow,
   technology choices. Read existing architecture and codebase to ensure fit. Focus on structural
   "what" and "how". Also owns developer experience: codebase patterns, implementation clarity,
   and worked examples for implementers.
   Use Sonnet model.

2. **API Designer** — Design interfaces: API endpoints, request/response schemas, data models,
   state transitions, integration contracts. Single source of truth for all data models and
   schemas — other teammates reference by name, never redefine. Include error handling and
   edge cases.
   Use Sonnet model.

3. **Risk Analyst** — Identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
4. **DevOps Advisor** — Review deployment, infrastructure, and observability requirements.
   Flag spec decisions that create operational burden.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

## Single Document Protocol

- API Designer is single source of truth for data models and schemas
- Other teammates reference models by name — never redefine
- Each teammate writes analysis to their task output file in `tasks/`
- Architect compiles final `spec.md` with sections: Overview, System Architecture, API Contracts & Data Models, Risk & Security, Implementation Guide

Create these tasks:
1. [Architect] Analyze existing system, define high-level design — components, boundaries, data flow, codebase patterns
2. [API Designer] Draft API contracts, data models, and integration interfaces
3. [Risk Analyst] Identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
4. [Lead] USER FEEDBACK GATE — Present design, contracts, and risks to user (blocked by 1, 2, 3)
5. [Architect] Refine architecture, write implementation guide with examples (blocked by 4)
6. [API Designer] Finalize contracts with error handling, edge cases, examples (blocked by 4)
7. [Risk Analyst] Propose mitigations for accepted risks (blocked by 4)
8. [All] Cross-review: validate spec coherence
9. [Architect] Compile spec.md — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `spec.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by 8)

The final spec should be detailed enough for implementation without further clarification.
Feeds into /spawn-feature-team.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** Technical specification → feeds into `/spawn-feature-team`
**Artifact files:** `docs/teams/[TEAM-NAME]/spec.md` (primary), `tasks/` (task outputs)

---

### Mode 3: Architecture Decision

**Team:** Solution Architect, Explorer, Trade-off Analyst, Critic

```
Create an agent team called "plan-adr-[project-slug]" to make an architecture decision about [OBJECTIVE].

Spawn [4-5] teammates:

1. **Solution Architect** — Frame the decision context and evaluation framework. Articulate
   what we're deciding, why it matters, and what criteria guide the choice. Read existing
   architecture and codebase. Synthesize inputs into a clear recommendation with rationale.
   Use Sonnet model.

2. **Explorer** — Research each option thoroughly: how it works, what it requires, what it
   enables, what it precludes. Provide concrete examples and reference implementations.
   Go deep on technical details that affect the decision.
   Use Sonnet model.

3. **Trade-off Analyst** — Build structured comparison matrix across all options. Evaluate
   against defined criteria. Quantify where possible. Identify hidden costs and second-order
   consequences. Make trade-offs explicit.
   Use Sonnet model.

4. **Critic** — Challenge every option and assumption. Identify failure modes, scaling limits,
   worst-case scenarios. Push back on the leading option — if it survives scrutiny, the
   decision is stronger.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Evaluate operational implications of each option: deployment complexity,
   monitoring needs, operational burden.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [Solution Architect] Frame decision context — what we're deciding, why, and evaluation criteria
2. [Explorer] Research and document each option — capabilities, requirements, examples
3. [Trade-off Analyst] Build initial comparison matrix across options (blocked by tasks 1, 2)
4. [Lead] USER FEEDBACK GATE — Present options and initial analysis to user. Ask user to: eliminate options, adjust criteria, set direction (blocked by task 3)
5. [Explorer] Deep-dive on remaining options per user direction (blocked by task 4)
6. [Trade-off Analyst] Finalize comparison with quantified trade-offs and second-order effects (blocked by tasks 4, 5)
7. [Critic] Challenge the leading option — failure modes, worst cases, hidden costs (blocked by task 6)
8. [Solution Architect] Draft recommendation with rationale, addressing Critic's challenges (blocked by task 7)
9. [All] Cross-review: validate ADR coherence — does the recommendation survive all perspectives?
10. [Critic] Final challenge — last chance to raise concerns before recording
11. [Solution Architect] Compile ADR document — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `adr.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 10)

ADR format: Title, Status, Context, Decision, Consequences. Include comparison matrix,
rejected options with reasons, and implementation guidance.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** Architecture Decision Record (ADR) → feeds into implementation teams
**Artifact files:** `docs/teams/[TEAM-NAME]/adr.md` (primary), `tasks/` (task outputs)

---

### Mode 4: Migration Strategy

**Team:** State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate

```
Create an agent team called "plan-migration-[project-slug]" to plan the migration of [OBJECTIVE].

Spawn [4-5] teammates:

1. **State Analyst** — Document current state comprehensively: architecture, data schemas,
   integrations, traffic patterns. Document target state with equal rigor. Produce gap
   analysis showing what changes. Read existing codebase and infrastructure docs.
   Use Sonnet model.

2. **Migration Planner** — Design migration path: sequencing, phases, rollback points,
   parallel-run strategies. Determine approach (strangler fig, dual-write, cutover). Define
   migration order for components and data. Create step-by-step execution plan with checkpoints.
   Use Sonnet model.

3. **Risk Mitigator** — Identify migration risks: data loss, downtime, performance degradation,
   feature regression, integration failures. For each risk, define detection, mitigation, and
   rollback. Create risk matrix with go/no-go criteria per phase.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent everyone affected: end users, dev team, ops, business.
   Define communication plans per audience. Identify training needs. Flag user-facing changes
   needing careful handling.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Plan infrastructure for migration: parallel environments, data pipelines,
   monitoring during transition, DNS/routing changes, rollback infrastructure.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [State Analyst] Document current state — architecture, data, integrations, traffic
2. [State Analyst] Document target state and produce gap analysis (blocked by task 1)
3. [Risk Mitigator] Identify migration risks and failure modes (blocked by task 1)
4. [Migration Planner] Design initial migration approach — incremental vs cutover vs parallel (blocked by task 2)
5. [Lead] USER FEEDBACK GATE — Present gap analysis and proposed approach to user. Ask user to: confirm approach, adjust risk tolerance, set phase priorities (blocked by tasks 3, 4)
6. [Migration Planner] Create detailed phase plan with rollback points and checkpoints (blocked by task 5)
7. [Risk Mitigator] Define mitigations and go/no-go criteria per phase (blocked by tasks 5, 6)
8. [Stakeholder Advocate] Create communication and training plan per stakeholder group (blocked by task 5)
9. [All] Cross-review: validate migration plan coherence — each phase has clear entry/exit criteria and rollback
10. [Risk Mitigator] Final risk assessment — pre-mortem on the full plan (blocked by task 9)
11. [Stakeholder Advocate] Finalize stakeholder communication timeline (blocked by task 9)
12. [Migration Planner] Compile migration plan — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `migration-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: current/target state analysis, migration approach, phased execution with rollback,
risk matrix with mitigations, go/no-go criteria, and stakeholder communication plan.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** Migration plan with phases, risk matrix, rollback procedures → feeds into implementation teams
**Artifact files:** `docs/teams/[TEAM-NAME]/migration-plan.md` (primary), `tasks/` (task outputs)

---

### Mode 5: Business Case

**Team:** Market Analyst, Financial Analyst, Strategist, Risk Analyst

```
Create an agent team called "plan-bizcase-[project-slug]" to build a business case for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Market Analyst** — Research market context: competitive landscape, size, trends, customer
   needs. Identify the market opportunity. Ground the case in external evidence, not assumptions.
   Find comparable initiatives or case studies.
   Use Sonnet model.

2. **Financial Analyst** — Build financial model: costs (build, operate, maintain), revenue
   impact (new, retained, savings), timeline to value. Define ROI, payback period, NPV.
   Model best/expected/worst scenarios. Make assumptions explicit and sensitivity-test them.
   Use Sonnet model.

3. **Strategist** — Frame strategic argument: alignment with company strategy, competitive
   positioning, long-term vision. Identify strategic risks of NOT investing. Build narrative
   connecting financials to strategy.
   Use Sonnet model.

4. **Risk Analyst** — Identify business risks: market, execution, technology, opportunity cost.
   Assess probability and impact. Compare invest vs not-invest risk profiles. Identify key
   assumptions that would invalidate the case if wrong.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide quantitative foundation: usage data, customer metrics, benchmarks.
   Validate financial assumptions with data. Identify metrics gaps.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Represent customer perspective: problem solved, demand signal, retention
   and satisfaction impact. Ground the case in customer evidence.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [Market Analyst] Research market context — competitive landscape, trends, opportunity size
2. [Financial Analyst] Build initial financial model — costs, revenue impact, timeline to value
3. [Strategist] Frame strategic alignment and competitive positioning (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present market context, initial financials, and strategic framing. Ask user to: validate assumptions, adjust scope, flag missing considerations (blocked by tasks 2, 3)
5. [Financial Analyst] Refine financial model with scenario analysis — best/expected/worst (blocked by task 4)
6. [Risk Analyst] Identify and assess business risks — compare invest vs not-invest (blocked by task 4)
7. [Strategist] Build strategic narrative connecting financials to strategy (blocked by tasks 4, 5)
8. [Market Analyst] Provide supporting evidence — case studies, benchmarks, customer signals (blocked by task 4)
9. [All] Cross-review: validate business case coherence — numbers, strategy, and risks consistent?
10. [Risk Analyst] Sensitivity analysis — which assumptions, if wrong, break the case? (blocked by task 9)
11. [Strategist] Compile business case — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `business-case.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 10)

Include: executive summary, strategic context, market analysis, financial model with scenarios,
risk assessment, and recommendation. Feeds into Product Roadmap mode.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** Business case decision document → feeds into Product Roadmap mode
**Artifact files:** `docs/teams/[TEAM-NAME]/business-case.md` (primary), `tasks/` (task outputs)

---

### Mode 6: Go-to-Market

**Team:** Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator

```
Create an agent team called "plan-gtm-[project-slug]" to create a go-to-market plan for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Positioning Strategist** — Define product positioning: what, who, why better than
   alternatives. Craft core messaging framework: value proposition, key messages per audience,
   competitive differentiation. Ensure positioning is specific and defensible.
   Use Sonnet model.

2. **Channel Planner** — Design distribution strategy: which channels reach the target audience.
   Evaluate direct vs indirect, paid vs organic. Build channel mix with expected reach, cost,
   and timeline. Define channel-specific tactics and content needs.
   Use Sonnet model.

3. **Customer Advocate** — Define customer personas, buying journey stages, and decision
   criteria. Identify adoption barriers and how to address them. Ground all GTM activities
   in customer reality.
   Use Sonnet model.

4. **Launch Coordinator** — Plan launch execution: timeline, milestones, dependencies,
   responsibilities. Define launch phases (soft launch, beta, GA). Create checklists
   and readiness criteria. Plan post-launch measurement and iteration.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide market data, customer metrics, competitive benchmarks. Define
   measurement framework for GTM success.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Deep customer empathy: buying process, objections, switching costs,
   resonant messaging. Review customer interviews, support data, and feedback.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [Positioning Strategist] Define product positioning — value prop, key messages, differentiation
2. [Customer Advocate] Define customer personas, buying journey, and adoption barriers
3. [Channel Planner] Evaluate channel options and build initial channel mix (blocked by tasks 1, 2)
4. [Lead] USER FEEDBACK GATE — Present positioning, personas, and channel options. Ask user to: validate positioning, confirm audience, select channels, adjust priorities (blocked by task 3)
5. [Positioning Strategist] Refine messaging for selected channels and audiences (blocked by task 4)
6. [Channel Planner] Detail channel tactics, content needs, and budget allocation (blocked by task 4)
7. [Customer Advocate] Design onboarding and adoption strategy for target personas (blocked by task 4)
8. [Launch Coordinator] Create launch timeline with phases, milestones, readiness criteria (blocked by tasks 5, 6, 7)
9. [All] Cross-review: validate GTM plan coherence — positioning, channels, and launch aligned?
10. [Launch Coordinator] Define post-launch measurement plan and iteration triggers (blocked by task 9)
11. [Launch Coordinator] Compile GTM plan — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `gtm-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 10)

Include: positioning framework, customer personas, channel strategy with tactics,
launch timeline, readiness criteria, and measurement plan. Feeds into Product Roadmap mode.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** GTM plan with positioning, channels, launch timeline → feeds into Product Roadmap mode
**Artifact files:** `docs/teams/[TEAM-NAME]/gtm-plan.md` (primary), `tasks/` (task outputs)

---

### Mode 7: OKR / Goals

**Team:** Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate

```
Create an agent team called "plan-okr-[project-slug]" to define OKRs and goals for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Strategic Planner** — Define objectives connecting to higher-level strategy. Ensure each
   is ambitious but achievable, qualitative but clear. Map cascading from company/department
   to team-level. Identify gaps where strategic priorities lack objectives.
   Use Sonnet model.

2. **Metrics Designer** — Design key results: specific, measurable, time-bound. For each,
   define metric, baseline, target, measurement method, and data source. Use leading indicators,
   ensure team control, avoid perverse incentives. 2-4 key results per objective.
   Use Sonnet model.

3. **Alignment Reviewer** — Check alignment vertically (supports strategy above?), horizontally
   (conflicts with other teams?), and internally (key results measure the objective?). Identify
   inter-OKR dependencies. Flag OKRs that are tasks disguised as goals.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent everyone who owns, contributes to, or is measured by
   these OKRs. Ensure acceptance, not just assignment. Identify tension between teams. Review
   existing metrics and prior OKR cycles.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide baselines for all proposed metrics. Identify which are currently
   tracked vs need new instrumentation. Validate targets against historical data.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Ensure OKRs reflect customer impact, not just internal activity.
   Challenge OKRs measuring output without outcome. Add customer-centric key results.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template with compiled interview results]

Create these tasks:
1. [Strategic Planner] Define draft objectives aligned to strategy — ambitious, qualitative, actionable
2. [Metrics Designer] Inventory existing metrics and identify baselines
3. [Alignment Reviewer] Review strategic context and identify alignment requirements (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present draft objectives and alignment analysis. Ask user to: confirm objectives, adjust ambition, flag missing areas, prioritize (blocked by tasks 2, 3)
5. [Metrics Designer] Design key results for confirmed objectives — specific, measurable, time-bound (blocked by task 4)
6. [Strategic Planner] Refine objectives based on user direction and metrics feasibility (blocked by tasks 4, 5)
7. [Alignment Reviewer] Check alignment — vertical, horizontal, and internal coherence (blocked by tasks 5, 6)
8. [Stakeholder Advocate] Review OKRs for ownership clarity, acceptance, and inter-team tensions (blocked by task 7)
9. [All] Cross-review: validate OKR tree coherence — objectives, key results, ownership form clear picture?
10. [Metrics Designer] Finalize measurement plan — data sources, tracking cadence, review schedule (blocked by task 9)
11. [Strategic Planner] Compile OKR document — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `okr-tree.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 10)

Include: objective tree, key results with baselines and targets, ownership map, measurement
plan, and alignment notes. Feeds into Product Roadmap and/or Technical Spec modes.

[Include Task Blocking Protocol and Output Standards from Shared Prompt Blocks above]
```

**Output format:** OKR tree with objectives, key results, and measurement plan → feeds into Product Roadmap, Technical Spec modes
**Artifact files:** `docs/teams/[TEAM-NAME]/okr-tree.md` (primary), `tasks/` (task outputs)

---

## Output

After spawning, inform the user:
- The team has been created with [3-5] teammates for **[MODE NAME]** planning
- **Phase 1 (Analysis):** Teammates explore the planning space from distinct perspectives
- **Phase 2 (Your Turn):** Initial findings presented — user feedback gate where you choose direction before detailed planning
- **Phase 3 (Detailed Planning):** Refined work based on your direction
- **Phase 4 (Cross-Review):** All teammates validate plan coherence
- **Phase 5 (Compilation):** Designated teammate compiles the final [OUTPUT FORMAT] document
- All teammates use Sonnet — planning is analysis and writing, not code generation
- Final deliverable feeds into [DOWNSTREAM COMMANDS] for execution
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
