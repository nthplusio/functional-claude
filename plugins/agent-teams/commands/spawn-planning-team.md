---
name: spawn-planning-team
description: Spawn a planning and roadmapping agent team to sequence implementation phases with business rationale
argument-hint: <business plan or feature set to sequence>
---

# Spawn Planning & Roadmapping Team

Create an agent team for the planning and roadmapping phase, with four distinct perspectives: strategic alignment, dependency sequencing, measurable outcomes, and stakeholder advocacy. This team focuses on WHAT to build and WHY — technical HOW is left to implementation teams.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a business plan or feature set via `$ARGUMENTS`

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

If `$ARGUMENTS` is provided, use it as the planning task description. If not, ask the user what business plan, feature set, or product vision they want to sequence into implementation phases.

Before spawning, quickly analyze the project to identify:
- Any existing planning documents, product specs, or roadmaps
- The project structure and major modules (to inform dependency analysis)
- Any existing implementation phases or milestones
- README, CONTRIBUTING, or architecture docs that reveal project goals

**Spawn the following team (replacing placeholders with actual project details):**

```
Create an agent team called "planning-[project-slug]" to plan and sequence the implementation of [BUSINESS PLAN / FEATURE SET].

Spawn 4 teammates:

1. **Strategist** — Analyze the business plan and define strategic objectives. Identify core
   value propositions, business differentiators, and strategic goals. Determine which
   capabilities are foundational vs incremental. Frame each implementation phase in terms
   of business value delivered, not just features shipped. Read project docs in
   [PROJECT_DOCS] to understand the current state.
   Use Sonnet model.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build a dependency
   graph showing which features require others to exist first. Identify technical foundations
   that must be laid early (auth, data models, core APIs). Sequence phases by dependency
   order, risk level, and value delivery. Flag circular dependencies and propose how to
   break them. Review project structure in [PROJECT_DIRS] to understand technical layers.
   Use Sonnet model.

3. **Outcomes Analyst** — Define measurable success criteria and acceptance conditions for
   each phase. Write specific, testable definitions of done. Identify KPIs that prove each
   phase delivered its intended value. Create acceptance criteria that implementation teams
   can directly verify. Ensure outcomes are measurable, not aspirational.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   user segments benefit from each phase. Flag business constraints (budget, timeline,
   regulatory, team capacity) that affect sequencing. Challenge assumptions about user
   value — push back when phases don't clearly serve users. Conduct feasibility checks
   on proposed timelines and scope.
   Use Sonnet model.

Enable delegate mode — focus on coordination and final roadmap synthesis, not analysis.

Create these tasks:
1. [Strategist] Analyze business plan and define strategic objectives — identify core value propositions and business goals
2. [Stakeholder Advocate] Identify user needs, business constraints, and external dependencies
3. [Prioritizer] Map feature dependencies and technical prerequisites (blocked by task 1)
4. [Strategist] Define implementation phases with business rationale for each (blocked by tasks 1, 2)
5. [Prioritizer] Sequence phases by dependency order and risk — resolve conflicts (blocked by tasks 3, 4)
6. [Outcomes Analyst] Define success criteria and acceptance conditions per phase (blocked by task 4)
7. [Stakeholder Advocate] Feasibility review — challenge assumptions and flag risks (blocked by tasks 5, 6)
8. [Outcomes Analyst] Refine outcomes based on feasibility feedback (blocked by task 7)
9. [All] Cross-review: validate plan coherence across strategic, dependency, outcomes, and stakeholder perspectives
10. [Lead] Compile roadmap document with phase briefs for implementation teams

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

## Output

After spawning, inform the user:
- The team has been created with 4 teammates (Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate)
- Delegate mode keeps the lead focused on synthesizing the final roadmap
- The task flow funnels from broad analysis to refined, actionable phase briefs
- All 4 teammates use Sonnet — planning is analysis and writing, not code generation
- The final deliverable is a roadmap with phase briefs that feed directly into implementation team commands
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
