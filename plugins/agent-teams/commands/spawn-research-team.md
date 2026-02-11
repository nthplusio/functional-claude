---
name: spawn-research-team
description: Spawn a research and discovery agent team with 3 modes — Technology Evaluation, Landscape Survey, Risk Assessment — including discovery interview, user feedback gate, and optional teammates
argument-hint: <topic to research>
---

# Spawn Research & Discovery Team

Create an agent team to conduct structured research across 3 modes, each spawning a purpose-built team with distinct roles, a discovery interview for rich shared context, a user feedback gate after initial findings, and mode-specific output formats that feed into downstream team commands.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a research topic via `$ARGUMENTS`

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

Present the mode table and ask the user which research mode fits their need. If the mode is obvious from `$ARGUMENTS`, confirm it rather than asking.

| # | Mode | When to Use |
|---|------|-------------|
| 1 | **Technology Evaluation** | Evaluating specific technologies, libraries, or approaches for adoption — comparing concrete options against project requirements |
| 2 | **Landscape Survey** | Mapping the full landscape of a domain — understanding what exists, how options relate, and where gaps are |
| 3 | **Risk Assessment** | Investigating risks, failure modes, and dependencies — understanding what could go wrong before committing |

**Auto-inference keywords:**
- Compare, evaluate, which should we use, pros/cons, benchmark → **Technology Evaluation**
- Survey, landscape, what's available, ecosystem, state of the art, options → **Landscape Survey**
- Risk, failure modes, what could go wrong, dependencies, security audit → **Risk Assessment**

**Pipeline context:** Feeds from `/spawn-planning-team` (research needs identified during planning); feeds into `/spawn-planning-team` (informed decisions), `/spawn-feature-team` (technology choices made), `/spawn-design-team` (design approach informed by research)

## Step 2: Discovery Interview

Before spawning the team, conduct a structured interview to deeply understand the research topic. The interview results become shared context for all teammates — this ensures focused, relevant research rather than broad surface-level exploration.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Core Questions (ask up to 5, all modes)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Research objective** — "What specifically do we need to learn? What decision will this research inform?" | Anchors the research — prevents aimless exploration |
| 2 | **Current understanding** — "What do you already know about this? What have you already tried or researched?" | Prevents re-discovering known information |
| 3 | **Constraints** — "What are the non-negotiables? (tech stack, budget, timeline, team skills, compliance)" | Filters out options that violate hard constraints |
| 4 | **Depth vs breadth** — "Do you need deep analysis of a few options, or a broad survey of many? How many options should we evaluate?" | Shapes research scope and teammate allocation |
| 5 | **Output format** — "What does a useful research output look like? A recommendation? A comparison matrix? A risk register?" | Ensures the deliverable matches the user's needs |

### Extended Questions by Mode (ask 2 per mode)

#### Technology Evaluation
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Candidate options** — "What specific technologies or approaches are you considering? Are there any you've already ruled out?" | Always — defines the evaluation scope |
| 7 | **Evaluation criteria** — "What matters most — performance, developer experience, community support, cost, maturity?" | Always — weights the comparison |

#### Landscape Survey
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Domain boundaries** — "What's the scope of the landscape we're mapping? Where does the boundary of this domain lie?" | Always — prevents scope creep |
| 7 | **Focus areas** — "Are there specific aspects of the landscape you care most about? Categories or segments to prioritize?" | When the domain is large |

#### Risk Assessment
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Risk context** — "What system, decision, or change are we assessing risks for? What's the blast radius if things go wrong?" | Always — scopes the assessment |
| 7 | **Known concerns** — "Are there specific risks you're already worried about? Areas where you suspect problems?" | When the user has prior intuition |

Present questions in batches of 3-5 using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 3: Optional Teammates

Ask the user if they want to include optional teammates that add specialized depth:

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **Domain Expert** | Deep domain-specific knowledge that generalists would miss — architecture patterns, compliance requirements, or ecosystem nuances | Technology evaluations in specialized domains (e.g., ML infrastructure, fintech compliance) |
| **Implementer** | Feasibility checking — can this actually be integrated into our codebase? Prototypes or proof-of-concept validation | Technology evaluations where integration complexity is a key concern |

## Step 4: Project Analysis

Before spawning, quickly analyze the project to identify relevant context:

- Project structure, technology stack, and existing dependencies
- Existing documentation, ADRs, or prior research related to the topic
- README, CONTRIBUTING, or architecture docs
- Dependency files (package.json, requirements.txt, etc.) for compatibility analysis
- Any existing code that relates to the research topic

Include findings in the Research Context section of the spawn prompt.

## Step 5: Spawn the Team

Compile the interview results into a `## Research Context` section and spawn the mode-specific team. Replace all placeholders with actual content from the interview and project analysis.

Team name: `research-[mode-slug]-[topic-slug]` (e.g., `research-eval-auth-libraries`, `research-landscape-ml-ops`, `research-risk-cloud-migration`)

All teammates use Sonnet — research is analysis and writing, not code generation. Enable delegate mode.

---

### Mode 1: Technology Evaluation

**Team:** Explorer, Analyst, Critic

```
Create an agent team called "research-eval-[topic-slug]" to evaluate [TOPIC].

Spawn [3-5] teammates:

1. **Explorer** — Investigate each candidate technology in depth: capabilities, API design,
   performance characteristics, maturity, community health, and ecosystem. Read documentation,
   review examples, and assess compatibility with our stack. Produce a structured profile for
   each option covering: what it does, how it works, what it requires, and what it enables.
   Read our codebase in [PROJECT_DIRS] to understand integration points.
   Use Sonnet model.

2. **Analyst** — Build a structured comparison matrix across all candidates. Evaluate each
   option against the defined criteria ([EVALUATION_CRITERIA]). Quantify where possible
   (bundle size, benchmarks, API surface area). Identify hidden costs: learning curve,
   migration effort, maintenance burden, license implications. Make trade-offs explicit.
   Use Sonnet model.

3. **Critic** — Challenge every option and every assumption. For each candidate, identify
   failure modes, scaling limits, vendor lock-in risks, and worst-case scenarios. Probe for
   weaknesses the Explorer missed. Ask "what happens when this breaks?" for each option.
   Push back on the leading option — if it survives scrutiny, the recommendation is stronger.
   Use Sonnet model.

[IF DOMAIN EXPERT SELECTED]
4. **Domain Expert** — Bring deep [DOMAIN] expertise to the evaluation. Identify requirements
   and constraints that generalists would miss. Evaluate candidates against domain-specific
   criteria (compliance, performance baselines, integration patterns). Flag domain-specific
   risks and best practices.
   Use Sonnet model.

[IF IMPLEMENTER SELECTED]
5. **Implementer** — Assess integration feasibility for the top candidates. Review our codebase
   to identify integration points, migration paths, and compatibility issues. If time permits,
   create a minimal proof-of-concept for the leading option. Flag unexpected technical blockers.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final synthesis.

## Research Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Research Objective
[What we need to learn, what decision this informs]

### Current Understanding
[What's already known, what's been tried]

### Constraints
[Non-negotiables: tech stack, budget, timeline, team skills, compliance]

### Evaluation Criteria
[What matters most — ranked by importance]

### Candidate Options
[Technologies or approaches being evaluated]

### Project Analysis
[Relevant codebase findings, existing dependencies, integration points]

Create these tasks:
1. [Explorer] Research each candidate option in depth — capabilities, API, performance, ecosystem
2. [Analyst] Define evaluation criteria and build initial comparison framework
3. [Critic] Identify risks, failure modes, and hidden costs for each option (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present initial profiles and comparison to user. Ask user to: eliminate options, adjust evaluation criteria, add considerations, and set direction for deep analysis (blocked by tasks 2, 3)
5. [Explorer] Deep-dive on remaining options based on user direction (blocked by task 4)
6. [Analyst] Finalize comparison matrix with quantified trade-offs (blocked by tasks 4, 5)
7. [Critic] Challenge the leading option — stress test assumptions and probe edge cases (blocked by task 6)
8. [All] Cross-review: validate findings across explorer, analyst, and critic perspectives
9. [Analyst] Final recommendation with confidence levels and caveats (blocked by task 8)
10. [Lead] Compile technology evaluation report with comparison matrix, recommendation, and migration guidance — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `evaluation-report.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`
11. [Lead] Produce actionable next steps — what downstream team commands to run with which inputs

Important: The final evaluation report should include: candidate profiles, comparison matrix,
recommendation with rationale, risks and mitigations, and concrete next steps. The report
should be directly usable as input to /spawn-planning-team (for roadmapping adoption) or
/spawn-feature-team (for implementing the chosen technology).

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Technology evaluation report with comparison matrix and recommendation → feeds into `/spawn-planning-team`, `/spawn-feature-team`
**Artifact files:** `docs/teams/[TEAM-NAME]/evaluation-report.md` (primary), `tasks/` (task outputs)

---

### Mode 2: Landscape Survey

**Team:** Explorer, Mapper, Analyst

```
Create an agent team called "research-landscape-[topic-slug]" to survey the landscape of [TOPIC].

Spawn [3-5] teammates:

1. **Explorer** — Cast a wide net across the [DOMAIN] landscape. Identify all significant
   options, approaches, tools, and frameworks. For each, capture: name, category, maturity
   level, primary use case, and key differentiators. Prioritize breadth over depth — we need
   the full picture first. Read our codebase in [PROJECT_DIRS] to understand relevance.
   Use Sonnet model.

2. **Mapper** — Organize the Explorer's findings into a structured landscape map. Create
   categories, identify relationships between options (competitors, complements, alternatives).
   Map the landscape by dimensions the user cares about ([FOCUS_AREAS]). Identify gaps —
   areas where no good options exist. Produce a visual-friendly taxonomy.
   Use Sonnet model.

3. **Analyst** — Evaluate the landscape from a strategic perspective. Identify trends —
   what's emerging, what's maturing, what's declining. Assess market dynamics: consolidation,
   fragmentation, open-source vs commercial. For [FOCUS_AREAS], provide deeper analysis
   including adoption patterns, community health, and sustainability signals.
   Use Sonnet model.

[IF DOMAIN EXPERT SELECTED]
4. **Domain Expert** — Bring deep [DOMAIN] expertise to identify options and categories
   that generalists would overlook. Validate the Mapper's taxonomy against industry-standard
   classifications. Add domain-specific context to the Analyst's trend analysis.
   Use Sonnet model.

[IF IMPLEMENTER SELECTED]
5. **Implementer** — Assess practical adoption feasibility for the most relevant options.
   Review our codebase to identify which categories and options are most relevant to our
   specific situation. Flag integration considerations.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final synthesis.

## Research Context

[COMPILED INTERVIEW RESULTS]

### Research Objective
[What landscape we're mapping, what decision this informs]

### Current Understanding
[What's already known about this landscape]

### Constraints
[Boundaries on what's relevant to our situation]

### Domain Boundaries
[Scope of the landscape — where the edges are]

### Focus Areas
[Specific aspects or segments to prioritize]

### Project Analysis
[Relevant codebase findings, existing tools in use]

Create these tasks:
1. [Explorer] Broad survey — identify all significant options across the [DOMAIN] landscape
2. [Mapper] Begin categorization framework based on initial findings and focus areas
3. [Analyst] Research landscape trends — what's emerging, maturing, and declining (blocked by task 1)
4. [Lead] USER FEEDBACK GATE — Present initial landscape overview to user. Ask user to: identify most relevant categories, flag gaps, adjust scope, and prioritize areas for deeper analysis (blocked by tasks 2, 3)
5. [Explorer] Deep-dive on user-prioritized categories — more options, more detail (blocked by task 4)
6. [Mapper] Refine landscape map with category relationships, gaps, and annotations (blocked by tasks 4, 5)
7. [Analyst] Strategic analysis of prioritized categories — adoption, sustainability, trajectory (blocked by task 4)
8. [All] Cross-review: validate landscape map completeness and accuracy
9. [Analyst] Final landscape assessment with recommendations for further investigation (blocked by task 8)
10. [Lead] Compile landscape survey report with map, trend analysis, and recommended next steps — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `landscape-report.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`
11. [Lead] Identify which areas warrant deeper investigation via /spawn-research-team (Technology Evaluation mode)

Important: The final landscape map should be structured so that specific categories can be
fed into Technology Evaluation mode for deeper comparison. Include: landscape taxonomy,
option profiles, trend analysis, gap analysis, and recommended next steps.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Landscape survey report with taxonomy and trend analysis → feeds into `/spawn-research-team` (Technology Evaluation), `/spawn-planning-team`
**Artifact files:** `docs/teams/[TEAM-NAME]/landscape-report.md` (primary), `tasks/` (task outputs)

---

### Mode 3: Risk Assessment

**Team:** Risk Analyst, System Analyst, Mitigator

```
Create an agent team called "research-risk-[topic-slug]" to assess risks for [TOPIC].

Spawn [3-5] teammates:

1. **Risk Analyst** — Identify and categorize all significant risks across dimensions:
   technical risk, operational risk, security risk, compliance risk, and business risk.
   For each risk, assess likelihood (1-5), impact (1-5), and detectability. Build a
   prioritized risk matrix. Read our codebase in [PROJECT_DIRS] to ground the assessment
   in our actual system.
   Use Sonnet model.

2. **System Analyst** — Analyze the system architecture to identify vulnerability points,
   failure modes, and dependency chains. Map critical paths, single points of failure, and
   blast radius for each risk. Understand how failures cascade. Review existing error
   handling, monitoring, and recovery mechanisms.
   Use Sonnet model.

3. **Mitigator** — For each identified risk, design specific mitigation strategies. Evaluate
   mitigation options by cost, complexity, and risk reduction. Distinguish between prevention
   (reduce likelihood), detection (identify early), and recovery (limit impact). Propose
   monitoring and alerting for the highest-priority risks.
   Use Sonnet model.

[IF DOMAIN EXPERT SELECTED]
4. **Domain Expert** — Bring deep [DOMAIN] expertise to identify domain-specific risks that
   generalists would miss. Validate risk assessments against industry standards and known
   failure patterns. Add compliance and regulatory risk considerations.
   Use Sonnet model.

[IF IMPLEMENTER SELECTED]
5. **Implementer** — Assess the feasibility and cost of proposed mitigations. Review our
   codebase to identify existing safeguards and gaps. Estimate implementation effort for
   priority mitigations. Flag mitigations that would require architectural changes.
   Use Sonnet model.

Enable delegate mode — focus on coordination, user feedback, and final synthesis.

## Research Context

[COMPILED INTERVIEW RESULTS]

### Research Objective
[What we're assessing risks for, what decision this informs]

### Current Understanding
[Known risks, existing safeguards]

### Constraints
[Risk tolerance, budget for mitigations, compliance requirements]

### Risk Context
[System or decision being assessed, blast radius, known concerns]

### Known Concerns
[Specific risks already identified or suspected]

### Project Analysis
[Relevant codebase findings, existing error handling, monitoring]

Create these tasks:
1. [System Analyst] Analyze system architecture — dependencies, critical paths, failure modes
2. [Risk Analyst] Identify and categorize risks across all dimensions (blocked by task 1)
3. [Risk Analyst] Build prioritized risk matrix with likelihood, impact, and detectability scores (blocked by task 2)
4. [Lead] USER FEEDBACK GATE — Present initial risk matrix to user. Ask user to: validate risk priorities, flag missing risks, adjust risk tolerance, and set direction for mitigation planning (blocked by task 3)
5. [Mitigator] Design mitigation strategies for top-priority risks (blocked by task 4)
6. [System Analyst] Validate mitigations against architecture — feasibility and side effects (blocked by task 5)
7. [Risk Analyst] Reassess residual risk after proposed mitigations (blocked by tasks 5, 6)
8. [All] Cross-review: validate risk register completeness and mitigation feasibility
9. [Mitigator] Final mitigation plan with implementation priorities and monitoring (blocked by task 8)
10. [Lead] Compile risk assessment report with risk register, mitigation plan, and monitoring recommendations — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `risk-assessment.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`
11. [Lead] Identify actions that should be addressed via /spawn-feature-team or /spawn-debug-team

Important: The final risk register should include: categorized risks with scores, mitigation
strategies with cost estimates, residual risk levels, monitoring plan, and implementation
priority. The register should inform downstream decision-making and feed into planning or
implementation teams.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Risk assessment report with risk register and mitigation plan → feeds into `/spawn-planning-team`, `/spawn-feature-team`, `/spawn-debug-team`
**Artifact files:** `docs/teams/[TEAM-NAME]/risk-assessment.md` (primary), `tasks/` (task outputs)

---

## Output

After spawning, inform the user:
- The team has been created with [3-5] teammates for **[MODE NAME]** research
- **Phase 1 (Initial Survey):** Teammates explore the research space from their distinct perspectives
- **Phase 2 (Your Turn):** You'll be presented with initial findings — this is the user feedback gate where you choose direction before the team invests in deep analysis
- **Phase 3 (Deep-Dive):** Focused research based on your direction
- **Phase 4 (Cross-Review):** All teammates validate findings across perspectives
- **Phase 5 (Synthesis):** Lead compiles the final [OUTPUT FORMAT] report
- All teammates use Sonnet — research is analysis and writing, not code generation
- The final deliverable feeds into [DOWNSTREAM COMMANDS] for next steps
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — the primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
