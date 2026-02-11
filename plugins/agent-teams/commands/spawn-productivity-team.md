---
name: spawn-productivity-team
description: Spawn a productivity systems team that runs a 5-persona improvement loop to discover, design, review, refine, and compound workflow improvements
argument-hint: <workflow or process to optimize>
---

# Spawn Productivity Systems Team

Create an agent team that runs the full productivity loop: Auditor → Architect → Analyst → Refiner → Compounder. Each persona's output feeds the next, compounding improvements over time rather than producing isolated outputs.

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

## Team Configuration

If `$ARGUMENTS` is provided, use it as the optimization target. If not, ask the user what workflow, process, or system they want to improve.

Before spawning, quickly analyze the project to identify:
- The current workflow or process related to the user's target
- Existing automation, scripts, or tooling already in place
- Known pain points or bottlenecks (from READMEs, TODOs, issue trackers)
- The project structure and technology stack (to inform feasibility scoring)

**Spawn the following team (replacing placeholders with actual project details):**

```
Create an agent team called "productivity-[project-slug]" to optimize [WORKFLOW / PROCESS].

Spawn 5 teammates:

1. **Auditor** — Productivity Systems Analyst who discovers bottlenecks and quantifies their cost.
   Read the Auditor persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md
   Follow the methodology phases (Discovery → Scoring → 4-Week Plan), scoring criteria,
   and behavioral instructions defined in the persona.
   Your inputs come from the user's description of [WORKFLOW / PROCESS].
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

Enable delegate mode — focus on coordination, synthesis, and the final report.

Create these tasks:
1. [Auditor] Discover bottlenecks — ask targeted questions about the current [WORKFLOW / PROCESS]
2. [Auditor] Score all identified tasks on Time Cost, Energy Drain, and Feasibility (blocked by task 1)
3. [Auditor] Produce prioritized 4-week improvement plan with Automation Scores (blocked by task 2)
4. [Architect] Restate the top problems from the Auditor's plan and ask clarifying questions (blocked by task 3)
5. [Architect] Map 2-3 approaches per problem, ranked by simplicity with tradeoffs (blocked by task 4)
6. [Architect] Create phased blueprint with rollback points and dependency map (blocked by task 5)
7. [Analyst] Pass 1-2: Architecture and Code Quality review of the blueprint (blocked by task 6)
8. [Analyst] Pass 3-4: Reliability and Performance review with tradeoff matrix (blocked by task 7)
9. [Refiner] Generate initial implementation addressing Critical findings (blocked by task 8)
10. [Refiner] Run convergence loop — score, diagnose, rewrite until quality bar met (blocked by task 9)
11. [Compounder] Review all outputs — progress check, friction log, patterns, next target (blocked by task 10)
12. [Lead] Synthesize final report with cumulative impact summary and next-cycle recommendations

Important: This team is intentionally sequential — each persona's output feeds the next.
The loop is the mechanism: improvements compound because each cycle builds on accumulated knowledge.
When the Compounder finishes, the user can run another cycle with the accumulated insights.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

## Output

After spawning, inform the user:
- The team has been created with 5 teammates following the productivity loop
- The task chain is intentionally sequential: Auditor → Architect → Analyst → Refiner → Compounder
- Delegate mode keeps the lead focused on the final synthesis
- 4 teammates use Sonnet (analysis and writing); the Refiner uses the default model (iterative refinement benefits from strongest reasoning)
- The Auditor will start by asking questions about the target workflow — answer them to feed the loop
- Each persona reads its behavioral profile from a reference file, ensuring deep methodology
- When the Compounder finishes, you can run the team again with accumulated insights for the next improvement cycle
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
