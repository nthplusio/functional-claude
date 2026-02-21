---
name: spawn-productivity-team
description: Spawn a productivity systems team that runs a 5-persona improvement loop — includes pre-spawn interview, user feedback gate after scored plan, and pipeline context
argument-hint: <workflow or process to optimize>
---

# Spawn Productivity Systems Team

> **Deprecated in v0.15.0** — Use `/spawn-create --mode productivity` instead. This command remains fully functional but will be removed in v1.1.0.

Create an agent team that runs the full productivity loop: Auditor → Architect → Analyst → Refiner → Compounder. Each persona's output feeds the next, compounding improvements over time rather than producing isolated outputs. Includes a pre-spawn interview to give the Auditor rich starting context and a user feedback gate after the scored improvement plan.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a workflow or process to optimize via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Pre-Spawn Interview

Before spawning the team, conduct a structured interview to give the Auditor rich starting context. This moves context gathering before spawn so the Auditor can start analyzing immediately instead of spending a turn interviewing the user.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Interview Questions (ask up to 4)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Target workflow** — "Describe the workflow or process you want to optimize. Walk me through a typical cycle — what happens, in what order, and who's involved?" | Gives the Auditor a detailed workflow map to analyze |
| 2 | **Pain points** — "What are the biggest friction points? Where do you lose the most time or energy?" | Directs the Auditor to the highest-impact bottlenecks first |
| 3 | **Current tools** — "What tools, scripts, or automation do you already use for this workflow?" | Prevents the Architect from proposing solutions that already exist |
| 4 | **Success metric** — "If this optimization succeeds, what would be different? How would you measure improvement?" | Anchors the Compounder's evaluation criteria and the final report |

Present questions in a single batch using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 2: Project Analysis

Before spawning, quickly analyze the project to identify:
- The current workflow or process related to the user's target
- Existing automation, scripts, or tooling already in place
- Known pain points or bottlenecks (from READMEs, TODOs, issue trackers)
- The project structure and technology stack (to inform feasibility scoring)

Include findings in the Productivity Context section of the spawn prompt.

**Pipeline context:** Feeds into `/spawn-feature-team` (for implementing automation solutions from the Architect's blueprint); Compounder output feeds the next productivity cycle.

## Step 3: Spawn the Team

Compile the interview results into a `## Productivity Context` section and spawn the team. Replace all placeholders with actual content from the interview and project analysis.

**Spawn the following team (replacing placeholders with actual project details):**

```
Create an agent team called "productivity-[project-slug]" to optimize [WORKFLOW / PROCESS].

Spawn 5 teammates:

1. **Auditor** — Productivity Systems Analyst who discovers bottlenecks and quantifies their cost.
   Read the Auditor persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md
   Follow the methodology phases (Discovery → Scoring → 4-Week Plan), scoring criteria,
   and behavioral instructions defined in the persona.
   Your inputs come from the Productivity Context section below — the user has already
   described their workflow, pain points, current tools, and success metrics.
   Your outputs feed into the Architect.
   Read relevant project files in [PROJECT_DIRS] to understand the current workflow.
   Use Sonnet model.

2. **Architect** — Solution Architect who transforms prioritized problems into implementable blueprints.
   Read the Architect persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md
   Follow the methodology phases (Problem Definition → Approach Map → Blueprint → Dependencies),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Auditor's scored task inventory and 4-week plan.
   Your outputs feed into the Analyst.
   Read project structure in [PROJECT_DIRS] to understand technical constraints.
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
   Stop when Convergence Score >= 8 or diminishing returns (delta < 0.5).
   Use default model (iterative refinement benefits from strongest reasoning).

5. **Compounder** — Systems Review Partner who closes the loop and identifies patterns for the next cycle.
   Read the Compounder persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md
   Follow the methodology phases (Progress Check → Friction Log → Next Target → Pattern Recognition),
   scoring criteria, and behavioral instructions defined in the persona.
   Your inputs come from the Refiner's refined implementation and convergence report.
   Your outputs feed into the next cycle's Auditor (or the user for manual review).
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Productivity Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Target Workflow
[Detailed workflow description — what happens, in what order, who's involved]

### Pain Points
[Biggest friction points, where time/energy is lost]

### Current Tools
[Existing automation, scripts, tooling in use]

### Success Metric
[What improvement looks like, how to measure it]

### Project Analysis
[Relevant project structure, existing automation, known bottlenecks]

Create these tasks:
1. [Auditor] Discover bottlenecks — analyze the workflow described in Productivity Context
2. [Auditor] Score all identified tasks on Time Cost, Energy Drain, and Feasibility (blocked by task 1)
3. [Auditor] Produce prioritized 4-week improvement plan with Automation Scores (blocked by task 2)
4. [Lead] USER FEEDBACK GATE — Present the Auditor's scored improvement plan to user. Ask user to: confirm priority ranking, adjust which bottlenecks to address first, flag constraints the Auditor missed, and approve before the Architect starts designing solutions (blocked by task 3)
5. [Architect] Restate the top problems from the approved plan and ask clarifying questions (blocked by task 4)
6. [Architect] Map 2-3 approaches per problem, ranked by simplicity with tradeoffs (blocked by task 5)
7. [Architect] Create phased blueprint with rollback points and dependency map (blocked by task 6)
8. [Analyst] Pass 1-2: Architecture and Code Quality review of the blueprint (blocked by task 7)
9. [Analyst] Pass 3-4: Reliability and Performance review with tradeoff matrix (blocked by task 8)
10. [Refiner] Generate initial implementation addressing Critical findings (blocked by task 9)
11. [Refiner] Run convergence loop — score, diagnose, rewrite until quality bar met (blocked by task 10)
12. [Compounder] Review all outputs — progress check, friction log, patterns, next target (blocked by task 11)
13. [Compounder] Compile final report with cumulative impact summary and next-cycle recommendations — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `productivity-report.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`

Important: This team is intentionally sequential — each persona's output feeds the next.
The loop is the mechanism: improvements compound because each cycle builds on accumulated knowledge.
The user feedback gate after the Auditor's scored plan ensures the Architect designs solutions
for the right bottlenecks. When the Compounder finishes, the user can run another cycle with
the accumulated insights. Implementation outputs can be fed into /spawn-feature-team for
further development.

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
- Never restate the Productivity Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Output format (per-phase deliverables):**
- **Auditor:** Scored bottleneck inventory + 4-week improvement plan
- **Architect:** Phased blueprint with rollback points
- **Analyst:** Multi-pass review report with tradeoff matrix
- **Refiner:** Refined implementation with convergence report
- **Compounder:** Cycle report with friction log, patterns, and next target

Final synthesis feeds into the next productivity cycle or into `/spawn-feature-team` for implementing automation.
**Artifact files:** `docs/teams/[TEAM-NAME]/productivity-report.md` (primary), `tasks/` (task outputs)

## Output

After spawning, inform the user:
- The team has been created with 5 teammates following the productivity loop
- **Phase 1 (Discovery):** The Auditor analyzes the workflow using the context you provided
- **Phase 2 (Your Turn):** You'll review the Auditor's scored improvement plan before the Architect starts designing solutions — this is the user feedback gate
- **Phase 3 (Pipeline):** Architect → Analyst → Refiner → Compounder, each building on the previous output
- **Phase 4 (Synthesis):** Lead compiles the final report with cumulative impact and next-cycle recommendations
- The task chain is intentionally sequential: each persona's output feeds the next
- Delegate mode keeps the lead focused on the final synthesis
- 4 teammates use Sonnet (analysis and writing); the Refiner uses the default model (iterative refinement benefits from strongest reasoning)
- When the Compounder finishes, you can run the team again with accumulated insights for the next improvement cycle
- Implementation outputs can be fed into `/spawn-feature-team` for development
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — the primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
