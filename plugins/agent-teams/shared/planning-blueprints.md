# Planning Blueprints

Spawn prompts for all 7 planning submodes. Referenced by `/spawn-think --mode planning`.

## Planning Context Template

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

### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]

### Expected Outcomes
[From Expected Outcomes compilation step — Phase count, feasibility constraint, stakeholder success definition, out of scope. Omit section if user skipped or mode is not Research/Planning.]
```

---

## Mode 1: Product Roadmap

**Team:** Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate
**Team name:** `plan-roadmap-[project-slug]`

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
11. [All] Write domain sections — each teammate writes their named section: Strategist → "Strategic Vision & Phase Rationale", Prioritizer → "Dependency Map & Sequencing", Outcomes Analyst → "Success Criteria & KPIs", Stakeholder Advocate → "Constraints & Stakeholder Impact". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategist] Merge domain sections into roadmap.md with phase briefs for implementation teams — resolve cross-references, deduplicate, add executive summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `roadmap.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Each phase brief should be directly usable as input to /spawn-build --mode feature or /spawn-create --mode design.
Include: phase goal, features, dependencies, success criteria, and business rationale.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `roadmap.md` → feeds into `/spawn-build --mode feature`, `/spawn-create --mode design`

---

## Mode 2: Technical Spec

**Team:** Architect, API Designer, Risk Analyst
**Team name:** `plan-spec-[project-slug]`

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
   edge cases. Verify all schemas and API examples against actual library documentation before finalizing.
   Use Sonnet model.

3. **Risk Analyst** — Before assessing risks, run a dependency grep: search the codebase for
   files that import, reference, or configure the component under spec (use Grep tool with the
   component name, key interfaces, and config keys as search terms). Include a "Dependency
   Surface" table in your task output listing affected files and their coupling type (import,
   config, test, docs). Then identify technical risks, failure modes, edge cases, and security
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
- API Designer compiles final `spec.md` with sections: Overview, System Architecture, API Contracts & Data Models, Risk & Security, Implementation Guide
- Before compiling, the compiler must verify all code snippets against actual library types — check method signatures, parameter names, return types, and schema syntax against the codebase's actual imports. Do not copy API usage from memory.

Create these tasks:
1. [Architect] Analyze existing system, define high-level design — components, boundaries, data flow, codebase patterns
2. [API Designer] Draft API contracts, data models, and integration interfaces
3. [Risk Analyst] Run dependency grep on the component under spec, then identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
4. [Lead] USER FEEDBACK GATE — Present design, contracts, and risks to user (blocked by 1, 2, 3)
5. [Architect] Refine architecture, write implementation guide with examples (blocked by 4)
6. [API Designer] Finalize contracts with error handling, edge cases, examples (blocked by 4)
7. [Risk Analyst] Propose mitigations for accepted risks (blocked by 4)
8. [All] Cross-review: validate spec coherence
9. [All] Write domain sections — each teammate writes their named section: Architect → "System Architecture & Implementation Guide", API Designer → "API Contracts & Data Models", Risk Analyst → "Risk Assessment & Mitigations". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 8)
10. [API Designer] Merge domain sections into spec.md — resolve cross-references, deduplicate, add overview — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `spec.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 9)

The final spec should be detailed enough for implementation without further clarification.
Feeds into /spawn-build --mode feature.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `spec.md` → feeds into `/spawn-build --mode feature`

---

## Mode 3: Architecture Decision

**Team:** Solution Architect, Explorer, Trade-off Analyst, Critic
**Team name:** `plan-adr-[project-slug]`

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
11. [All] Write domain sections — each teammate writes their named section: Solution Architect → "Decision Context & Recommendation", Explorer → "Options Analysis", Trade-off Analyst → "Comparison Matrix & Trade-offs", Critic → "Risks & Rejected Options". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Solution Architect] Merge domain sections into adr.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `adr.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

ADR format: Title, Status, Context, Decision, Consequences. Include comparison matrix,
rejected options with reasons, and implementation guidance.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `adr.md` → feeds into implementation teams

---

## Mode 4: Migration Strategy

**Team:** State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate
**Team name:** `plan-migration-[project-slug]`

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
12. [All] Write domain sections — each teammate writes their named section: State Analyst → "Current/Target State Analysis", Migration Planner → "Migration Approach & Phase Plan", Risk Mitigator → "Risk Matrix & Mitigations", Stakeholder Advocate → "Communication & Training Plan". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by tasks 10, 11)
13. [Migration Planner] Merge domain sections into migration-plan.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `migration-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 12)

Include: current/target state analysis, migration approach, phased execution with rollback,
risk matrix with mitigations, go/no-go criteria, and stakeholder communication plan.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `migration-plan.md` → feeds into implementation teams

---

## Mode 5: Business Case

**Team:** Market Analyst, Financial Analyst, Strategist, Risk Analyst
**Team name:** `plan-bizcase-[project-slug]`

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
11. [All] Write domain sections — each teammate writes their named section: Market Analyst → "Market Analysis", Financial Analyst → "Financial Model & Scenarios", Strategist → "Strategic Narrative", Risk Analyst → "Risk Assessment & Sensitivity". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategist] Merge domain sections into business-case.md — resolve cross-references, deduplicate, add executive summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `business-case.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: executive summary, strategic context, market analysis, financial model with scenarios,
risk assessment, and recommendation. Feeds into Product Roadmap mode.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `business-case.md` → feeds into Product Roadmap mode

---

## Mode 6: Go-to-Market

**Team:** Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator
**Team name:** `plan-gtm-[project-slug]`

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
11. [All] Write domain sections — each teammate writes their named section: Positioning Strategist → "Positioning & Messaging", Channel Planner → "Channel Strategy & Tactics", Customer Advocate → "Personas & Adoption Strategy", Launch Coordinator → "Launch Timeline & Readiness". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Launch Coordinator] Merge domain sections into gtm-plan.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `gtm-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: positioning framework, customer personas, channel strategy with tactics,
launch timeline, readiness criteria, and measurement plan. Feeds into Product Roadmap mode.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `gtm-plan.md` → feeds into Product Roadmap mode

---

## Mode 7: OKR / Goals

**Team:** Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate
**Team name:** `plan-okr-[project-slug]`

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
11. [All] Write domain sections — each teammate writes their named section: Strategic Planner → "Objective Tree & Rationale", Metrics Designer → "Key Results & Measurement Plan", Alignment Reviewer → "Alignment Analysis", Stakeholder Advocate → "Ownership & Accountability". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategic Planner] Merge domain sections into okr-tree.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `okr-tree.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: objective tree, key results with baselines and targets, ownership map, measurement
plan, and alignment notes. Feeds into Product Roadmap and/or Technical Spec modes.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Artifact:** `okr-tree.md` → feeds into Product Roadmap, Technical Spec modes
