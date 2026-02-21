---
name: spawn-create
description: "Unified create command — spawn a design, brainstorming, or productivity team with adaptive sizing, discovery interview, and verbosity control"
argument-hint: "[--mode design|brainstorm|productivity] [--quiet|--verbose] <topic>"
---

# Spawn Create Team

Unified entry point for **creative and generative** work. Auto-infers the right mode from your description, runs a streamlined discovery interview, applies adaptive sizing, and spawns a self-contained team.

## Modes

| Mode | Submodes | Team Composition |
|---|---|---|
| **design** | component, page-flow, redesign | Product Owner, Designer, Frontend Dev, User Advocate |
| **brainstorm** | tech, product, process, ops | Facilitator, Visionary, Realist + optional User Voice, Domain Expert |
| **productivity** | (single mode) | Auditor, Architect, Analyst, Refiner, Compounder |

## Process

### Step 1: Prerequisites

Follow the prerequisites check from `${CLAUDE_PLUGIN_ROOT}/shared/prerequisites-check.md`.
- Input-type: "topic to design, brainstorm, or optimize"

### Step 2: Parse Flags

Extract from `$ARGUMENTS`:
- `--mode design`, `--mode brainstorm`, or `--mode productivity` (optional — auto-infer if absent)
- `--quiet`, `--normal`, or `--verbose` (optional — default `--normal`)
- `--min-score N` (optional — override default spec quality threshold of 50)
- Strip flags from `$ARGUMENTS` before proceeding

### Step 3: Mode Selection

**Auto-inference keywords:**

| Keywords | Mode |
|---|---|
| design, component, page, flow, UI, UX, layout, redesign, mockup, wireframe, interface | **design** |
| brainstorm, ideas, ideate, explore options, creative, possibilities, what if, generate ideas | **brainstorm** |
| optimize, workflow, process, productivity, bottleneck, efficiency, automate, improve process | **productivity** |

If keywords match, confirm. If no match, ask with the 3-option prompt.

### Step 4: Submode Selection

#### Design Submodes

| Keywords | Submode |
|---|---|
| component, widget, button, input, card, modal, dialog, picker | **component** |
| page, flow, screen, wizard, onboarding, dashboard, settings, layout | **page-flow** |
| redesign, rework, improve, modernize, fix UX, accessibility audit | **redesign** |

#### Brainstorm Categories

| Keywords | Category | Visionary Lens | Realist Lens |
|---|---|---|---|
| API, architecture, framework, library, performance, database | **tech** | Emerging tech, architectural moonshots | Implementation feasibility, tech debt |
| feature, user experience, onboarding, pricing, market, customers | **product** | User delight, market differentiation | Scope, timeline, resource constraints |
| workflow, pipeline, CI/CD, process, collaboration, meetings | **process** | Workflow transformation, automation | Change management, adoption friction |
| infrastructure, deployment, scaling, monitoring, reliability | **ops** | Infrastructure evolution, scaling | Budget, reliability, migration risk |

#### Productivity Mode

No submodes — always runs the full 5-persona loop.

### Step 5: Discovery Interview

Follow the discovery interview from `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md`.

**Mode-specific extended questions:**

#### Design Mode (ask 2 generic + up to 2 submode-specific)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Target users** — "Who will use this? Device, frequency, expertise level?" | Always |
| 5 | **Design system** — "Does the project have a design system or component library?" | Always |

**Submode-specific extended questions (ask 2 based on selected submode):**

| Submode | Q6 | Q7 |
|---------|----|----|
| **component** | **Component API** — "What props/configuration should this component accept? What variations are needed?" | **Composition** — "Where will this component be used? What parent/child relationships should it support?" |
| **page-flow** | **Flow steps** — "What are the steps in this flow? What's the happy path and the error paths?" | **Data requirements** — "What data does each step need? What APIs does this page call?" |
| **redesign** | **Pain points** — "What's wrong with the current design? What specific problems are we solving?" | **Constraints** — "What must stay the same? What can change? Any backwards-compatibility requirements?" |

#### Brainstorm Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Prior attempts** — "What has already been tried or considered? What didn't work?" | Always |
| 5 | **Scope boundaries** — "What's explicitly OUT of scope or off the table?" | Always |

#### Productivity Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Pain points** — "What are the biggest friction points? Where do you lose the most time?" | Always |
| 5 | **Current tools** — "What tools, scripts, or automation do you already use?" | Always |

### Step 6: Spec Quality Scoring

Follow the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

- Evaluate the compiled Context section using binary-checkable questions
- Display the score with dimension breakdown before proceeding
- If score is below threshold, prompt user to refine or proceed
- Include the score in the spawn prompt's `### Spec Quality` subsection
- Parse `--min-score N` from `$ARGUMENTS` if present (strip before passing downstream)

### Step 7: Adaptive Sizing

Follow the adaptive sizing rules from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

- **Design mode:** Count design deliverables as subtasks. Always 4 core teammates.
- **Brainstorm mode:** Always 3 core teammates; optionally add User Voice or Domain Expert.
- **Productivity mode:** Always 5 teammates (the sequential loop is the mechanism).

### Step 8: Optional Teammates

#### Design Mode

No optional teammates — the 4-person team (Product Owner, Designer, Frontend Dev, User Advocate) is fixed.

#### Brainstorm Mode

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **User Voice** | Ideas grounded in user needs, pain points, and experience | Product and Process brainstorms |
| **Domain Expert** | Deep domain-specific ideas generalists would miss | Tech and Ops brainstorms |

#### Productivity Mode

No optional teammates — the 5-persona loop is fixed.

### Step 9: Project Analysis

**Design mode:** Component directory structure, styling approach, design system/component library, test patterns, existing implementation (redesign mode)
**Brainstorm mode (tech category):** Technology stack, architecture, existing patterns, known pain points, integration points
**Productivity mode:** Current workflow tooling, existing automation, known bottlenecks, project structure

### Step 10: Spawn the Team

#### Design Mode

Team name: `design-[feature-slug]`

```
Create an agent team called "design-[feature-slug]" to design and implement [UI FEATURE].

Spawn 4 teammates:

1. **Product Owner** — Define requirements and acceptance criteria. Write user stories with
   clear "given/when/then" scenarios. Set scope boundaries — what's in v1 vs future.
   Use Sonnet model.

2. **Designer** — Create component specifications and interaction designs. Define visual
   hierarchy, layout, spacing, responsive breakpoints, and all interactive states
   (default, hover, focus, active, disabled, loading, error, empty). Specify design tokens
   and how the design maps to [STYLING_APPROACH].
   Use Sonnet model.

3. **Frontend Dev** — Implement components based on Designer specs and Product Owner
   requirements. Work in [COMPONENT_DIRS]. Follow existing patterns. Focus on performance.
   Write unit tests alongside implementation.

4. **User Advocate** — Review all specs and implementations for accessibility and usability.
   Verify WCAG 2.1 AA compliance: keyboard navigation, screen reader support, color contrast,
   focus management, ARIA attributes.
   Use Sonnet model.

Enable delegate mode.

## Design Context
[Compiled interview results]

Create these tasks:
1. [Product Owner] Define user stories and acceptance criteria
2. [Product Owner] Define scope boundaries — v1 vs deferred
3. [Designer] Audit existing components and design patterns for reuse (blocked by 1)
4. [User Advocate] Define accessibility requirements and testing criteria (blocked by 1)
5. [Designer] Create component specs: layout, states, responsive breakpoints (blocked by 2, 3)
6. [User Advocate] Review design specs for accessibility compliance (blocked by 4, 5)
7. [Lead] USER FEEDBACK GATE — Present design specs + accessibility review (blocked by 6)
8. [Frontend Dev] Implement components following design specs (blocked by 7)
9. [Frontend Dev] Implement interactive states and error handling (blocked by 8)
10. [Designer] Visual review of implementation against specs (blocked by 9)
11. [User Advocate] Accessibility review of implementation (blocked by 9)
12. [Frontend Dev] Address feedback from Designer and User Advocate (blocked by 10, 11)
13. [Product Owner] Final acceptance review against user stories (blocked by 12)
14. [Frontend Dev] Compile design artifacts — write to `docs/teams/[TEAM-NAME]/`

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) -- task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Design Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Artifact:** `component-spec.md` / `page-spec.md` / `redesign-spec.md`
**Pipeline:** feeds from `/spawn-think --mode planning`, `/spawn-create --mode brainstorm` → feeds into `/spawn-think --mode review`, `/spawn-build --mode feature`

#### Brainstorm Mode

Team name: `brainstorm-[topic-slug]`

```
Create an agent team called "brainstorm-[topic-slug]" to brainstorm: [TOPIC].

Spawn [3-5] teammates:

1. **Facilitator** — Session Facilitator who manages the divergence/convergence cycle.
   Read the Facilitator persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md
   You manage phase transitions and enforce ideation rules. You do NOT generate ideas yourself.
   Use Sonnet model.

2. **Visionary** — Divergent Thinker who generates ambitious, unconstrained ideas.
   Read the Visionary persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md
   Your lens for this session: [CATEGORY-SPECIFIC VISIONARY LENS].
   Use Sonnet model.

3. **Realist** — Practical Thinker who grounds ideas in feasibility.
   Read the Realist persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md
   Your lens for this session: [CATEGORY-SPECIFIC REALIST LENS].
   Use Sonnet model.

[IF USER VOICE SELECTED]
4. **User Voice** — Represent the end-user perspective in brainstorming. Generate ideas
   grounded in user needs, pain points, and daily experience.
   Use Sonnet model.

[IF DOMAIN EXPERT SELECTED]
5. **Domain Expert** — [CATEGORY-SPECIFIC DESCRIPTION]. Bring deep domain expertise
   to generate specialized ideas.
   Use Sonnet model.

## Brainstorming Context
[Compiled interview results]

Create these tasks:
1. [Facilitator] Define brainstorming parameters, communicate rules of engagement
2. [Visionary] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
3. [Realist] Brainwriting: Generate 8-10 ideas independently (blocked by 1)
[IF USER VOICE] 4. [User Voice] Brainwriting: Generate 8-10 ideas (blocked by 1)
[IF DOMAIN EXPERT] 5. [Domain Expert] Brainwriting: Generate 8-10 ideas (blocked by 1)
6. [Facilitator] Collect all ideas, remove duplicates, cluster by theme (blocked by 2-5)
7. [Lead] USER FEEDBACK GATE — Present clusters, ask user to prioritize/decline (blocked by 6)
8. [Visionary] Build on prioritized ideas — combine, enhance, amplify (blocked by 7)
9. [Realist] Add implementation details, stepping stones, effort estimates (blocked by 7)
10. [Facilitator] Convergence — evaluate against success criteria (blocked by 8-9)
11. [Facilitator] Compile final output with ranked recommendations — write to `docs/teams/[TEAM-NAME]/`

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) -- task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Brainstorming Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Artifact:** `brainstorm-output.md`
**Pipeline:** feeds into `/spawn-think --mode planning`, `/spawn-think --mode research`, `/spawn-create --mode design`, `/spawn-build --mode feature`

#### Productivity Mode

Team name: `productivity-[project-slug]`

```
Create an agent team called "productivity-[project-slug]" to optimize [WORKFLOW / PROCESS].

Spawn 5 teammates:

1. **Auditor** — Productivity Systems Analyst who discovers bottlenecks and quantifies their cost.
   Read the Auditor persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md
   Your inputs come from the Productivity Context section below.
   Your outputs feed into the Architect.
   Use Sonnet model.

2. **Architect** — Solution Architect who transforms prioritized problems into implementable blueprints.
   Read the Architect persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md
   Your inputs come from the Auditor's scored task inventory and 4-week plan.
   Your outputs feed into the Analyst.
   Use Sonnet model.

3. **Analyst** — Senior Engineering Analyst who evaluates solutions through multiple quality lenses.
   Read the Analyst persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md
   Your inputs come from the Architect's phased blueprint.
   Your outputs feed into the Refiner.
   Use Sonnet model.

4. **Refiner** — Convergence Loop Specialist who iteratively improves implementations.
   Read the Refiner persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/refiner.md
   Your inputs come from the Analyst's multi-pass review.
   Your outputs feed into the Compounder.
   Use default model (iterative refinement benefits from strongest reasoning).

5. **Compounder** — Systems Review Partner who closes the loop and identifies patterns.
   Read the Compounder persona at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md
   Your inputs come from the Refiner's refined implementation.
   Your outputs feed into the next cycle's Auditor.
   Use Sonnet model.

Enable delegate mode.

## Productivity Context
[Compiled interview results]

Create these tasks:
1. [Auditor] Discover bottlenecks — analyze the workflow
2. [Auditor] Score all tasks on Time Cost, Energy Drain, and Feasibility (blocked by 1)
3. [Auditor] Produce prioritized 4-week improvement plan (blocked by 2)
4. [Lead] USER FEEDBACK GATE — Present scored plan to user (blocked by 3)
5. [Architect] Restate top problems from the approved plan (blocked by 4)
6. [Architect] Map 2-3 approaches per problem, ranked by simplicity (blocked by 5)
7. [Architect] Create phased blueprint with rollback points (blocked by 6)
8. [Analyst] Pass 1-2: Architecture and Code Quality review (blocked by 7)
9. [Analyst] Pass 3-4: Reliability and Performance review (blocked by 8)
10. [Refiner] Generate initial implementation addressing Critical findings (blocked by 9)
11. [Refiner] Run convergence loop until quality bar met (blocked by 10)
12. [Compounder] Review all outputs — progress check, friction log, patterns (blocked by 11)
13. [Compounder] Compile final report — write to `docs/teams/[TEAM-NAME]/`

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) -- task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Productivity Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Artifact:** `productivity-report.md`
**Pipeline:** feeds into `/spawn-build --mode feature` (automation); Compounder output feeds next cycle

### Step 11: Output

Follow the verbosity templates from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

After team completion, include two prompts:
1. `Run /after-action-review to review team process and capture improvements` (always)
2. `Run /evaluate-spawn to assess output quality?` (only when spec scoring was used)

Neither prompt blocks session end.
