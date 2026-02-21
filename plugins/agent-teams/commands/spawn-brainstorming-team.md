---
name: spawn-brainstorming-team
description: Spawn a brainstorming and ideation team with structured divergence/convergence phases and a user feedback gate
argument-hint: <topic to brainstorm>
---

# Spawn Brainstorming & Ideation Team

> **Deprecated in v0.15.0** — Use `/spawn-create --mode brainstorm` instead. This command remains fully functional but will be removed in v1.1.0.

Create an agent team for structured brainstorming using research-backed ideation principles: independent brainwriting to prevent anchoring bias, a user feedback gate for human-in-the-loop prioritization, and a building phase to refine winning ideas.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a brainstorming topic via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Category Selection

Ask the user which brainstorming category best fits their topic. This shapes the Visionary and Realist lenses:

| Category | Visionary Lens | Realist Lens |
|----------|---------------|--------------|
| **Tech** | Emerging tech, architectural moonshots | Implementation feasibility, tech debt |
| **Product** | User delight, market differentiation | Scope, timeline, resource constraints |
| **Process** | Workflow transformation, automation | Change management, adoption friction |
| **Ops** | Infrastructure evolution, scaling | Budget, reliability, migration risk |

If the category is obvious from `$ARGUMENTS`, confirm it rather than asking. For example, "brainstorm API authentication approaches" is clearly Tech.

**Auto-inference keywords:**
- API, architecture, framework, library, performance, database, infrastructure → **Tech**
- Feature, user experience, onboarding, pricing, market, customers → **Product**
- Workflow, pipeline, CI/CD, process, collaboration, meetings, sprint → **Process**
- Infrastructure, deployment, scaling, monitoring, reliability, uptime → **Ops**

## Step 2: Discovery Interview

Before spawning the team, conduct a structured interview to deeply understand the brainstorming topic. The interview results become shared context for all teammates — this ensures rich, informed ideation rather than shallow brainstorming on a bare topic string.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Core Questions (ask up to 5)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Problem definition** — "What specifically are we brainstorming about? What's the current state?" | Anchors the session — teammates need to know what exists today |
| 2 | **Success criteria** — "What would a great brainstorming outcome look like? A list of options? A single recommendation? An action plan?" | Shapes the convergence phase output |
| 3 | **Constraints** — "What are the non-negotiables? (budget, timeline, tech stack, team size, etc.)" | The Realist needs these; prevents wasted ideas |
| 4 | **Prior attempts** — "What has already been tried or considered? What didn't work and why?" | Prevents teammates from re-proposing failed ideas |
| 5 | **Scope boundaries** — "What's explicitly OUT of scope or off the table?" | Anti-goals prevent wasted divergence |

### Extended Questions (ask 2-5 more based on category and complexity)

| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Stakeholders** — "Who cares about this decision? Who will be affected?" | Product / Process / Ops categories |
| 7 | **Decision criteria** — "How will you evaluate ideas? What matters most — speed, cost, quality, user impact?" | When success criteria are vague |
| 8 | **Inspiration** — "Are there examples from elsewhere that you admire or want to emulate?" | Product brainstorms |
| 9 | **Technical context** — "What's the relevant tech stack, architecture, or codebase context?" | Tech category (supplement with codebase analysis) |
| 10 | **Timeline** — "When does this decision need to be made? Is this exploratory or urgent?" | When urgency is unclear |

Present questions in batches of 3-5 using AskUserQuestion. Confirm understanding before proceeding to team spawn.

## Step 3: Optional Teammates

Ask if the user wants to include optional teammates:

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **User Voice** | Ideas grounded in user needs, pain points, and experience | Product and Process brainstorms |
| **Domain Expert** | Deep domain-specific ideas that generalists would miss | Tech and Ops brainstorms |

The Domain Expert's flavor depends on the category:
- **Tech:** Senior engineer in the specific domain
- **Product:** Product manager or customer researcher
- **Process:** Operations specialist
- **Ops:** DevOps/platform engineer

## Step 4: Codebase Analysis (Tech category)

If the category is Tech, quickly analyze the project to identify:
- Relevant technology stack and architecture
- Existing patterns related to the brainstorming topic
- Known pain points or TODOs related to the topic
- Integration points that ideas should be aware of

Include findings in the brainstorming context section of the spawn prompt.

**Pipeline context:** Feeds into `/spawn-planning-team` (turn winning ideas into roadmap items), `/spawn-research-team` (investigate feasibility of promising ideas), `/spawn-design-team` (design UI concepts from ideation), `/spawn-feature-team` (implement straightforward ideas directly)

## Step 5: Spawn the Team

Compile the interview results into a `## Brainstorming Context` section and spawn the team. Replace all placeholders with actual content from the interview.

**Spawn the following team:**

```
Create an agent team called "brainstorm-[topic-slug]" to brainstorm: [TOPIC].

Spawn [3-5] teammates:

1. **Facilitator** — Session Facilitator who manages the divergence/convergence cycle.
   Read the Facilitator persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md
   Follow the methodology phases (Setup → Brainwriting Coordination → Collect & Cluster → Convergence)
   and behavioral instructions defined in the persona.
   You manage phase transitions and enforce ideation rules. You do NOT generate ideas yourself.
   Use Sonnet model.

2. **Visionary** — Divergent Thinker who generates ambitious, unconstrained ideas.
   Read the Visionary persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md
   Follow the methodology phases (Brainwriting → Building) and behavioral instructions
   defined in the persona.
   Your lens for this session: [CATEGORY-SPECIFIC VISIONARY LENS].
   Use Sonnet model.

3. **Realist** — Practical Thinker who grounds ideas in feasibility and implementation reality.
   Read the Realist persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md
   Follow the methodology phases (Brainwriting → Building) and behavioral instructions
   defined in the persona.
   Your lens for this session: [CATEGORY-SPECIFIC REALIST LENS].
   Use Sonnet model.

[IF USER VOICE SELECTED]
4. **User Voice** — Represent the end-user perspective in brainstorming. Generate ideas
   grounded in user needs, pain points, and daily experience. During brainwriting, focus on
   what users actually want (not what's technically interesting). During building, evaluate
   ideas through the lens of user adoption and satisfaction. Ask: "Would a real user care
   about this? Would they notice? Would it change their behavior?"
   Use Sonnet model.

[IF DOMAIN EXPERT SELECTED]
5. **Domain Expert** — [CATEGORY-SPECIFIC DOMAIN EXPERT DESCRIPTION]. Bring deep
   [DOMAIN] expertise to the brainstorming. During brainwriting, generate ideas that require
   specialized knowledge — the kind of ideas a generalist would never think of. During
   building, add domain-specific implementation details and flag domain-specific risks that
   others would miss.
   Use Sonnet model.

## Brainstorming Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Problem Definition
[What we're brainstorming about, current state]

### Success Criteria
[What a great outcome looks like]

### Constraints
[Non-negotiables: budget, timeline, tech stack, etc.]

### Prior Attempts
[What's been tried, what didn't work]

### Scope Boundaries
[What's explicitly out of scope]

### Additional Context
[Stakeholders, decision criteria, inspiration, technical context, timeline — as applicable]

[IF TECH CATEGORY: ### Codebase Context]
[Relevant findings from codebase analysis]

Create these tasks:
1. [Facilitator] Define brainstorming parameters, communicate rules of engagement to all teammates
2. [Visionary] Brainwriting: Generate 8-10 ideas independently — no cross-talk, no evaluating feasibility (blocked by task 1)
3. [Realist] Brainwriting: Generate 8-10 ideas independently — no cross-talk, defer judgment (blocked by task 1)
[IF USER VOICE] 4. [User Voice] Brainwriting: Generate 8-10 ideas from user perspective — no cross-talk (blocked by task 1)
[IF DOMAIN EXPERT] 5. [Domain Expert] Brainwriting: Generate 8-10 ideas from domain expertise — no cross-talk (blocked by task 1)
6. [Facilitator] Collect all ideas, remove duplicates, cluster by theme, present to lead for user feedback (blocked by tasks 2-5)
7. [Lead] USER FEEDBACK GATE — Present clustered ideas to user. Ask user to: select clusters/ideas to prioritize, decline ideas that are off-target, and provide direction for the building phase (blocked by task 6)
8. [Visionary] Build on prioritized ideas — combine, enhance, amplify, extend (blocked by task 7)
9. [Realist] Add implementation details, stepping stones, effort estimates, risk assessment (blocked by task 7)
10. [Facilitator] Drive convergence — evaluate refined ideas against success criteria, rank by viability (blocked by tasks 8-9)
11. [Facilitator] Compile final brainstorm output with ranked recommendations, trade-offs, and next steps (blocked by task 10) — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `brainstorm-output.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`

Important: The brainwriting tasks (2-5) MUST be independent — no teammate should see others' ideas
until the Facilitator collects them. This prevents anchoring bias.
The user feedback gate (task 7) is mandatory — the human decides which ideas to invest in.

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
- Never restate the Brainstorming Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Output format:**
- **Ranked idea list** — Ideas scored against success criteria with viability ratings
- **Idea clusters** — Themed groupings showing how ideas relate
- **Recommended next steps** — For each top idea, which downstream command to run: `/spawn-planning-team` (for strategic ideas needing roadmapping), `/spawn-research-team` (for ideas needing feasibility research), `/spawn-design-team` (for UI/UX concepts), or `/spawn-feature-team` (for straightforward implementations)

**Artifact files:** `docs/teams/[TEAM-NAME]/brainstorm-output.md` (primary), `tasks/` (task outputs)

## Output

After spawning, inform the user:
- The team has been created with [3-5] teammates for structured brainstorming
- **Phase 1 (Brainwriting):** Teammates generate ideas independently — this prevents anchoring bias where everyone builds on whoever speaks first
- **Phase 2 (Sharing):** The Facilitator collects and clusters all ideas
- **Phase 3 (Your Turn):** You'll be presented with clustered ideas to prioritize or decline — this is the user feedback gate
- **Phase 4 (Building):** The Visionary enhances and the Realist adds implementation details to your prioritized ideas
- **Phase 5 (Convergence):** The Facilitator drives structured evaluation and the lead synthesizes the final output
- The Facilitator enforces brainstorming rules — no premature evaluation during ideation
- The final output includes recommended downstream commands for each top idea
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — the primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to interact with teammates or provide additional context
- Use Ctrl+T to monitor the shared task list
