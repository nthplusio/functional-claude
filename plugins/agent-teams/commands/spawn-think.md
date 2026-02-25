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
- `--min-score N` (optional — override default spec quality threshold of 4 dimensions)
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

### Step 6: Spec Quality Scoring

Follow the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

- Evaluate the compiled Context section using binary-checkable questions
- Display the score with dimension breakdown before proceeding
- If score is below threshold, prompt user to refine or proceed
- Include the score in the spawn prompt's `### Spec Quality` subsection
- Parse `--min-score N` from `$ARGUMENTS` if present (strip before passing downstream)

### Step 7: Adaptive Sizing

Follow the adaptive sizing rules from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-shared.md`.

- **Research mode:** Count candidate options + analysis dimensions as subtasks
- **Planning mode:** Count planning phases + stakeholder groups as subtasks
- **Review mode:** Count review domains (security, performance, quality) as subtasks

### Step 8: Optional Teammates

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

### Step 9: Project Analysis

Analyze the project before spawning:

**Research mode:** Project structure, tech stack, dependencies, existing documentation, ADRs, related code
**Planning mode (technical):** Project structure, modules, architecture docs, dependency files. Scan `docs/decisions/` for existing ADRs and include them in the planning context (see `${CLAUDE_PLUGIN_ROOT}/shared/system-doc-protocol.md`)
**Planning mode (business):** Business docs, strategy docs, existing roadmaps, README
**Review mode:** Parse review target (PR number, branch name, or module path), identify changed files

Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-shared.md`:
- Mock Repository Scan (if applicable)
- **Retrospective Scan** — use `profile: think` for evaluate-spawn files, `type: research|planning|review` for AAR files

### Step 10: Spawn the Team

**Team name slug rules:** `[command-prefix]-[mode-slug]-[topic-slug]` — lowercase, hyphen-separated, max 30 chars, strip "the/a/an/for/with/and", first 3-4 meaningful words.

| Mode | Prefix | Example |
|---|---|---|
| research (eval) | `research-eval` | `research-eval-auth-libs` |
| research (landscape) | `research-landscape` | `research-landscape-ml-tools` |
| research (risk) | `research-risk` | `research-risk-migration` |
| planning | `plan-[submode]` | `plan-roadmap-myapp` |
| review | `review` | `review-pr-142` |

Compile interview results into a `## [Mode] Context` section and spawn the mode-specific team.

All teammates use Sonnet (analysis and writing, not code generation). Enable delegate mode. A designated teammate handles final document compilation.

After resolving a USER FEEDBACK GATE, broadcast a brief unblock notification (e.g., "Gate resolved — check TaskList for your next tasks") rather than sending per-teammate assignment messages. Teammates already have owners set and will check TaskList.

#### Research — Technology Evaluation

Team name: `research-eval-[topic-slug]`

```
Create an agent team called "research-eval-[topic-slug]" to evaluate [TOPIC].

## Behavioral Rules (read first)
- Call TaskList before starting any task. Never start a blocked task.
- Go idle when all tasks are blocked — the system notifies the lead. Do NOT send status messages.
- Answer retrospective questions immediately when the lead asks. Answer before approving shutdown.
- Use TaskUpdate to preserve progress notes — they survive compaction, conversation does not.
- Task outputs go to docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md (under 500 lines).

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

### Goal
[What we're researching and why]

### Constraints
[Non-negotiables that affect the research direction]

### Success Criteria
[How the research output will be evaluated]

### Additional Context
[Extended question answers, project analysis]

### Expected Outcomes
[From Expected Outcomes compilation step — Decision question, options, confidence threshold, out of scope. Omit section if user skipped.]

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]

Effort budgets: research tasks ~15-25 tool calls, analysis tasks ~10-20 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Explorer] (~15-25 tool calls) Research each candidate option in depth
2. [Analyst] (~10-20 tool calls) Define evaluation criteria and build initial comparison framework
3. [Critic] (~10-20 tool calls) Identify risks, failure modes, and hidden costs (blocked by task 1)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present initial profiles and comparison (blocked by tasks 2, 3)
5. [Explorer] (~15-25 tool calls) Deep-dive on remaining options per user direction (blocked by task 4)
6. [Analyst] (~10-20 tool calls) Finalize comparison matrix with quantified trade-offs (blocked by tasks 4, 5)
7. [Critic] (~10-20 tool calls) Challenge the leading option (blocked by task 6)
8. [All] (~5-10 tool calls) Cross-review findings
9. [Analyst] (~5-10 tool calls) Final recommendation with confidence levels (blocked by task 8)
10. [Analyst] (~5-10 tool calls) Compile evaluation report (scope: tasks 1-9) — write to `docs/teams/[TEAM-NAME]/`
```

**Artifact:** `evaluation-report.md` → feeds into `/spawn-think --mode planning`, `/spawn-build --mode feature`

#### Research — Landscape Survey

Team name: `research-landscape-[topic-slug]`

Spawn Explorer, Mapper, Analyst. Same protocol blocks (Task Blocking, Output Standards, Shutdown Protocol). Tasks: broad survey → categorize → trend analysis → USER FEEDBACK GATE → deep-dive priorities → refine map → strategic analysis → cross-review → compile landscape report.

**Artifact:** `landscape-report.md` → feeds into `/spawn-think --mode research` (eval mode)

#### Research — Risk Assessment

Team name: `research-risk-[topic-slug]`

Spawn Risk Analyst, System Analyst, Mitigator. Same protocol blocks (Task Blocking, Output Standards, Shutdown Protocol). Tasks: analyze architecture → identify risks → build risk matrix → USER FEEDBACK GATE → design mitigations → validate → reassess residual risk → cross-review → compile risk assessment.

**Artifact:** `risk-assessment.md` → feeds into `/spawn-think --mode planning`, `/spawn-build`

#### Planning — All 7 Submodes

Team names follow: `plan-[submode]-[project-slug]`

For the selected planning submode, read the mode-specific blueprint:

| Submode | Blueprint file |
|---------|---------------|
| roadmap | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/roadmap.md` |
| spec | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/spec.md` |
| adr | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/adr.md` |
| migration | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/migration.md` |
| bizcase | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/bizcase.md` |
| gtm | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/gtm.md` |
| okr | `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/okr.md` |

The Planning Context Template is in `${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md` — embed it in the Planning Context section of the spawn prompt.

Each submode follows the same 5-phase flow:
1. **Initial Analysis** — Parallel exploration from each teammate's perspective
2. **USER FEEDBACK GATE** — Lead presents findings, user chooses direction
3. **Detailed Planning** — Refined work based on user direction
4. **Cross-Review** — All teammates validate coherence
5. **Compilation** — Designated teammate compiles final document

The spawn-think command uses the blueprint team structures with these additions:
- Adaptive sizing from `shared/spawn-shared.md`
- Dynamic discovery interview (3 core + up to 7 follow-ups, cap 10) from `shared/discovery-interview.md`
- Verbosity control

**Artifacts by submode:** `roadmap.md`, `spec.md`, `adr.md`, `migration-plan.md`, `business-case.md`, `gtm-plan.md`, `okr-tree.md`

**Pipeline:** Business modes → technical modes → `/spawn-build --mode feature`

#### Review — All 3 Submodes

Team name: `review-[target-slug]`

```
Create an agent team called "review-[target-slug]" to review [TARGET].

## Behavioral Rules (read first)
- Call TaskList before starting any task. Never start a blocked task.
- Go idle when all tasks are blocked — the system notifies the lead. Do NOT send status messages.
- Answer retrospective questions immediately when the lead asks. Answer before approving shutdown.
- Use TaskUpdate to preserve progress notes — they survive compaction, conversation does not.
- Task outputs go to docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md (under 500 lines).

Spawn [3-5] reviewers:

1. **Security Reviewer** — Focus on security implications: authentication, authorization,
   injection risks, data exposure, CSRF, dependency vulnerabilities.
   Rate each finding by severity (Critical/High/Medium/Low).
   [IF SECURITY MODE: Lead reviewer with extra threat modeling tasks.]

2. **Performance Reviewer** — Focus on performance: database query patterns, memory allocation,
   caching, algorithmic complexity, bundle size.
   [IF PERFORMANCE MODE: Lead reviewer with extra profiling tasks.]

3. **Quality Reviewer** — Focus on code quality: project patterns, naming, error handling,
   test coverage, separation of concerns. Additionally, run the AI-code review checklist
   from `${CLAUDE_PLUGIN_ROOT}/shared/ai-code-review-checklist.md` — check for 6 AI-specific
   failure modes (over-abstraction, phantom error handling, hallucinated dependencies,
   test theater, redundant validation, missing idiomatic patterns). Produce a
   `### AI Pattern Findings` section in your output (present even with zero findings).

Use Sonnet for all reviewers. Enable delegate mode.

## Review Context
[Compiled interview results]

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]

Effort budgets: security/performance review tasks ~15-25 tool calls, quality review tasks ~10-20 tool calls, coordination tasks ~3-10 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Security] (~15-25 tool calls) Audit authentication and authorization paths — write to `docs/teams/[TEAM-NAME]/tasks/task-1-security.md`
2. [Security] (~15-25 tool calls) Check for injection vulnerabilities and data exposure — write to `docs/teams/[TEAM-NAME]/tasks/task-2-security.md`
3. [Performance] (~15-25 tool calls) Profile database queries and identify N+1 patterns — write to `docs/teams/[TEAM-NAME]/tasks/task-3-performance.md`
4. [Performance] (~15-25 tool calls) Review algorithmic complexity and caching opportunities — write to `docs/teams/[TEAM-NAME]/tasks/task-4-performance.md`
5. [Quality] (~10-20 tool calls) Verify adherence to project patterns and conventions — write to `docs/teams/[TEAM-NAME]/tasks/task-5-quality.md`
6. [Quality] (~10-20 tool calls) Assess test coverage and identify gaps — write to `docs/teams/[TEAM-NAME]/tasks/task-6-quality.md`
7. [Lead] (~5-8 tool calls) USER FEEDBACK GATE — Present all findings as a summary table (ID, domain, severity, one-line description). Ask user: (1) provide context on any findings (dismissals, severity changes, immediate fixes triggered), (2) prioritize for deep-dive, (3) adjust scope. Record all feedback as User Insights (see `${CLAUDE_PLUGIN_ROOT}/shared/review-report-template.md`) and broadcast to reviewers before unblocking deep-dives. (blocked by tasks 1, 2, 3, 4, 5, 6)
8. [Security] (~15-25 tool calls) Deep-dive on user-prioritized security findings (blocked by task 7) — write to `docs/teams/[TEAM-NAME]/tasks/task-8-security-deepdive.md`
9. [Performance] (~15-25 tool calls) Deep-dive on user-prioritized performance findings (blocked by task 7) — write to `docs/teams/[TEAM-NAME]/tasks/task-9-performance-deepdive.md`
10. [Quality] (~10-20 tool calls) Deep-dive on user-prioritized quality findings (blocked by task 7) — write to `docs/teams/[TEAM-NAME]/tasks/task-10-quality-deepdive.md`
11. [All] (~5-10 tool calls) Cross-reference findings across review domains — no written output (blocked by tasks 8, 9, 10)
12. [Security] (~5-10 tool calls) Write "Security Findings" domain section — one `### [ID] — [SEVERITY]: [Title]` block per finding with `#### User Insight` populated from gate feedback (use `_Awaiting user review_` if none received); follow template at `${CLAUDE_PLUGIN_ROOT}/shared/review-report-template.md` (blocked by task 11) — write to `docs/teams/[TEAM-NAME]/tasks/task-12-security-findings.md`
13. [Performance] (~5-10 tool calls) Write "Performance Findings" domain section — same format as task 12 (blocked by task 11) — write to `docs/teams/[TEAM-NAME]/tasks/task-13-performance-findings.md`
14. [Quality] (~5-10 tool calls) Write "Quality & AI Pattern Findings" domain section — include `### AI Pattern Findings` table; same format as task 12 (blocked by task 11) — write to `docs/teams/[TEAM-NAME]/tasks/task-14-quality-findings.md`
15. [Quality Reviewer] (~5-10 tool calls) Compile `review-report.md` following `${CLAUDE_PLUGIN_ROOT}/shared/review-report-template.md` — add executive summary with severity counts, fix sequencing, cross-domain interactions section, and finding index appendix — write to `docs/teams/[TEAM-NAME]/`: primary artifact as `review-report.md` with frontmatter, task outputs to `tasks/`, team README, update root index at `docs/teams/README.md` (blocked by tasks 12, 13, 14)
```

**Artifact:** `review-report.md` (template: `shared/review-report-template.md`) → feeds into `/spawn-build --mode debug` (issues), `/spawn-build --mode feature` (rework)

### Step 11: Output

Use the verbosity level parsed in Step 2 to format post-spawn output:

| Flag | Behavior |
|---|---|
| `--quiet` | Suppress narrative. Show only: team name, teammate count, and "Team spawned." |
| `--normal` (default) | Team summary, phase overview, key shortcuts, pipeline context |
| `--verbose` | Everything in normal + detailed task list, dependency graph, model assignments, token budget |

**Quiet mode:**
```
Team "[TEAM-NAME]" spawned with [N] teammates. Use Shift+Up/Down to interact.
```

**Normal mode (default):**
```
Team "[TEAM-NAME]" created with [N] teammates:
- [Role 1], [Role 2], [Role 3]

**Phases:**
1. [Phase description]
2. [Phase description — YOUR TURN: feedback gate]
3. [Phase description]

Shortcuts: Shift+Up/Down (teammates), Ctrl+T (task list)
Pipeline: [downstream commands]
Artifacts: docs/teams/[TEAM-NAME]/
```

**Verbose mode** (everything in normal, plus):
```
**Tasks:**
1. [Owner] Task description
2. [Owner] Task description (blocked by 1)
...
**Dependencies:** [visual graph or description]
**Models:** [per-teammate model assignments]
**Token budget:** discovery 10% | analysis 30% | feedback 10% | execution 40% | synthesis 10%
```

The shutdown protocol ensures AAR runs before TeamDelete. If the team shut down before AAR completed, run `/after-action-review [team-name]` manually.

After team completion, include:
1. `Run /evaluate-spawn to capture quick feedback? (2 questions)`

This prompt does not block session end.
