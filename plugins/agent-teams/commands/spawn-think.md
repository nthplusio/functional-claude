---
name: spawn-think
description: "Unified think command — spawn a research, planning, or review team with adaptive sizing, discovery interview, and verbosity control"
argument-hint: "[--mode research|planning|review] [--quiet|--verbose] <topic>"
---

# Spawn Think Team

Unified entry point for **analytical and evaluative** work. Auto-infers the right mode from your description, runs a streamlined discovery interview, applies adaptive sizing, and spawns a self-contained team.

## Modes

| Mode | Submodes | Team Composition |
|---|---|---|
| **research** | technology-eval, landscape, risk | Explorer, Analyst, Critic + optional Domain Expert, Implementer |
| **planning** | roadmap, spec, adr, migration, bizcase, gtm, okr | Mode-specific (see Planning Submodes) |
| **review** | security, performance, balanced | Security Reviewer, Performance Reviewer, Quality Reviewer + optional Accessibility, Architecture |

## Process

### Step 1: Prerequisites

Follow the prerequisites check from `${CLAUDE_PLUGIN_ROOT}/shared/prerequisites-check.md`.
- Input-type: "topic to research, plan, or review"

### Step 2: Parse Flags

Extract from `$ARGUMENTS`:
- `--mode research`, `--mode planning`, or `--mode review` (optional — auto-infer if absent)
- `--quiet`, `--normal`, or `--verbose` (optional — default `--normal`)
- Strip flags from `$ARGUMENTS` before proceeding

### Step 3: Mode Selection

**Auto-inference keywords:**

| Keywords | Mode |
|---|---|
| research, evaluate, compare, survey, landscape, assess risk, investigate options, what's available | **research** |
| plan, roadmap, spec, specification, architecture decision, ADR, migration, business case, GTM, go-to-market, OKR, goals, objectives | **planning** |
| review, PR, pull request, code review, audit, check code, security review, performance review | **review** |

If keywords match, confirm. If no match, ask with the 3-option prompt.

### Step 4: Submode Selection

#### Research Submodes

| Keywords | Submode | Team |
|---|---|---|
| compare, evaluate, which should we use, pros/cons, benchmark | **technology-eval** | Explorer, Analyst, Critic |
| survey, landscape, what's available, ecosystem, state of the art | **landscape** | Explorer, Mapper, Analyst |
| risk, failure modes, what could go wrong, dependencies, security audit | **risk** | Risk Analyst, System Analyst, Mitigator |

#### Planning Submodes

| Keywords | Submode | Team |
|---|---|---|
| roadmap, phases, sequencing, prioritize features | **roadmap** | Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate |
| spec, specification, requirements, feature design | **spec** | Architect, API Designer, Risk Analyst |
| ADR, architecture, decision, approach, trade-offs | **adr** | Solution Architect, Explorer, Trade-off Analyst, Critic |
| migration, migrate, upgrade, transition, move to | **migration** | State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate |
| business case, investment, ROI, justify, budget | **bizcase** | Market Analyst, Financial Analyst, Strategist, Risk Analyst |
| GTM, go-to-market, launch, positioning, channels | **gtm** | Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator |
| OKR, objectives, key results, goals, metrics | **okr** | Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate |

#### Review Submodes

| Keywords | Submode | Effect |
|---|---|---|
| auth, authentication, authorization, encryption, secrets, CSRF, XSS | **security** | Security Reviewer leads with extra threat modeling tasks |
| database, query, N+1, cache, latency, memory, bundle size | **performance** | Performance Reviewer leads with extra profiling tasks |
| feature, refactor, review, PR, changes | **balanced** (default) | All reviewers equal |

### Step 5: Discovery Interview

Follow the discovery interview from `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md`.

**Mode-specific extended questions:**

#### Research Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Candidate options** — "What specific options are you considering? Any already ruled out?" | technology-eval submode |
| 5 | **Depth vs breadth** — "Deep analysis of a few options, or broad survey of many?" | Always for research |

#### Planning Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Current state** — "What exists today? What's the starting point?" | Always |
| 5 | **Stakeholders** — "Who are the key stakeholders? Who decides, who's affected?" | When multiple people involved |

#### Review Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Change context** — "What does this change do and why?" | Always |
| 5 | **Known risk areas** — "Parts you're less confident about? Areas that feel fragile?" | Always |

### Step 6: Adaptive Sizing

Follow the adaptive sizing rules from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

- **Research mode:** Count candidate options + analysis dimensions as subtasks
- **Planning mode:** Count planning phases + stakeholder groups as subtasks
- **Review mode:** Count review domains (security, performance, quality) as subtasks

### Step 7: Optional Teammates

#### Research Mode

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **Domain Expert** | Deep domain-specific knowledge generalists would miss | Specialized domains (ML, fintech, compliance) |
| **Implementer** | Feasibility checking, prototype validation | Integration complexity concerns |

#### Planning Mode — Technical Submodes (roadmap, spec, adr, migration)

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **DevOps Advisor** | Infrastructure, deployment, CI/CD implications | Migrations, architectures with ops impact |

#### Planning Mode — Business Submodes (bizcase, gtm, okr)

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **Data Analyst** | Quantitative analysis, metric definition | Business cases needing numbers, OKRs needing baselines |
| **Customer Voice** | Customer perspective, adoption friction | GTM plans, customer-impact business cases |

#### Review Mode

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **Accessibility Reviewer** | WCAG compliance, keyboard navigation | Frontend PRs with UI changes |
| **Architecture Reviewer** | Structural analysis, design pattern adherence | Large structural PRs |

### Step 8: Project Analysis

Analyze the project before spawning:

**Research mode:** Project structure, tech stack, dependencies, existing documentation, ADRs, related code
**Planning mode (technical):** Project structure, modules, architecture docs, dependency files
**Planning mode (business):** Business docs, strategy docs, existing roadmaps, README
**Review mode:** Parse review target (PR number, branch name, or module path), identify changed files

### Step 9: Spawn the Team

Compile interview results into a `## [Mode] Context` section and spawn the mode-specific team.

All teammates use Sonnet (analysis and writing, not code generation). Enable delegate mode. A designated teammate handles final document compilation.

#### Research — Technology Evaluation

Team name: `research-eval-[topic-slug]`

```
Create an agent team called "research-eval-[topic-slug]" to evaluate [TOPIC].

Spawn [3-5] teammates:

1. **Explorer** — Investigate each candidate technology in depth: capabilities, API design,
   performance characteristics, maturity, community health, and ecosystem. Produce a
   structured profile for each option.
   Use Sonnet model.

2. **Analyst** — Build a structured comparison matrix across all candidates. Evaluate each
   option against defined criteria. Quantify where possible. Make trade-offs explicit.
   Use Sonnet model.

3. **Critic** — Challenge every option and assumption. Identify failure modes, scaling limits,
   vendor lock-in risks, and worst-case scenarios. Push back on the leading option.
   Use Sonnet model.

Enable delegate mode.

## Research Context
[Compiled interview results]

Create these tasks:
1. [Explorer] Research each candidate option in depth
2. [Analyst] Define evaluation criteria and build initial comparison framework
3. [Critic] Identify risks, failure modes, and hidden costs (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present initial profiles and comparison (blocked by tasks 2, 3)
5. [Explorer] Deep-dive on remaining options per user direction (blocked by task 4)
6. [Analyst] Finalize comparison matrix with quantified trade-offs (blocked by tasks 4, 5)
7. [Critic] Challenge the leading option (blocked by task 6)
8. [All] Cross-review findings
9. [Analyst] Final recommendation with confidence levels (blocked by task 8)
10. [Analyst] Compile evaluation report — write to `docs/teams/[TEAM-NAME]/`

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Research Context back — teammates already have it
- Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Artifact:** `evaluation-report.md` → feeds into `/spawn-think --mode planning`, `/spawn-build --mode feature`

#### Research — Landscape Survey

Team name: `research-landscape-[topic-slug]`

Spawn Explorer, Mapper, Analyst. Same protocol blocks. Tasks: broad survey → categorize → trend analysis → USER FEEDBACK GATE → deep-dive priorities → refine map → strategic analysis → cross-review → compile landscape report.

**Artifact:** `landscape-report.md` → feeds into `/spawn-think --mode research` (eval mode)

#### Research — Risk Assessment

Team name: `research-risk-[topic-slug]`

Spawn Risk Analyst, System Analyst, Mitigator. Same protocol blocks. Tasks: analyze architecture → identify risks → build risk matrix → USER FEEDBACK GATE → design mitigations → validate → reassess residual risk → cross-review → compile risk assessment.

**Artifact:** `risk-assessment.md` → feeds into `/spawn-think --mode planning`, `/spawn-build`

#### Planning — All 7 Submodes

Team names follow: `plan-[submode]-[project-slug]`

For the full team composition, Planning Context template, task lists, and spawn prompts for each of the 7 planning submodes, read the planning blueprints at `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints.md`.

Each submode follows the same 5-phase flow:
1. **Initial Analysis** — Parallel exploration from each teammate's perspective
2. **USER FEEDBACK GATE** — Lead presents findings, user chooses direction
3. **Detailed Planning** — Refined work based on user direction
4. **Cross-Review** — All teammates validate coherence
5. **Compilation** — Designated teammate compiles final document

The spawn-think command uses the blueprint team structures with these additions:
- Adaptive sizing from `shared/spawn-core.md`
- Streamlined 3+2 discovery interview from `shared/discovery-interview.md`
- Verbosity control

**Artifacts by submode:** `roadmap.md`, `spec.md`, `adr.md`, `migration-plan.md`, `business-case.md`, `gtm-plan.md`, `okr-tree.md`

**Pipeline:** Business modes → technical modes → `/spawn-build --mode feature`

#### Review — All 3 Submodes

Team name: `review-[target-slug]`

```
Create an agent team called "review-[target-slug]" to review [TARGET]. Spawn [3-5] reviewers:

1. **Security Reviewer** — Focus on security implications: authentication, authorization,
   injection risks, data exposure, CSRF, dependency vulnerabilities.
   Rate each finding by severity (Critical/High/Medium/Low).
   [IF SECURITY MODE: Lead reviewer with extra threat modeling tasks.]

2. **Performance Reviewer** — Focus on performance: database query patterns, memory allocation,
   caching, algorithmic complexity, bundle size.
   [IF PERFORMANCE MODE: Lead reviewer with extra profiling tasks.]

3. **Quality Reviewer** — Focus on code quality: project patterns, naming, error handling,
   test coverage, separation of concerns.

Use Sonnet for all reviewers. Enable delegate mode.

## Review Context
[Compiled interview results]

Create these tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [All] Cross-reference findings across review domains
8. [Quality Reviewer] Compile unified review report — write to `docs/teams/[TEAM-NAME]/`

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Review Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Artifact:** `review-report.md` → feeds into `/spawn-build --mode debug` (issues), `/spawn-build --mode feature` (rework)

### Step 10: Output

Follow the verbosity templates from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

## Migration

| Legacy Command | Equivalent |
|---|---|
| `/spawn-research-team <topic>` | `/spawn-think --mode research <topic>` |
| `/spawn-planning-team <topic>` | `/spawn-think --mode planning <topic>` |
| `/spawn-review-team <target>` | `/spawn-think --mode review <target>` |

Legacy commands remain functional with deprecation notice. Use the unified command for adaptive sizing, verbosity control, and streamlined discovery.
