# Spawn Shared

Shared logic for the unified spawn commands (`spawn-build`, `spawn-think`, `spawn-create`). Defines adaptive team sizing and model selection.

## Adaptive Sizing

Determine team size based on subtask count from the discovery interview. Present the recommendation to the user for approval before spawning.

### Sizing Rules

| Subtask Count | Recommendation | Rationale |
|---|---|---|
| 1-2 subtasks | **Solo agent** — No team needed. Use a single agent with plan-then-implement. | Coordination overhead exceeds benefit for small tasks. |
| 3-4 subtasks | **Pair** — 2 teammates + lead. Minimal coordination, maximum parallelism. | Sweet spot for most tasks: enough parallelism without coordination tax. |
| 5-8 subtasks | **Full team** — 3-5 teammates + lead. Standard blueprint team. | Multiple parallel workstreams justify the coordination overhead. |
| 9+ subtasks | **Full team, capped** — 4-5 teammates + lead. Split excess subtasks into follow-up phases. | Beyond 5 teammates, coordination overhead dominates. Chain sessions instead. |

### User Approval Gate

Always present the sizing recommendation before spawning:

```
Based on your description, I'd recommend a [SIZE] team:
- [N] teammates: [ROLES]
- Estimated [M] tasks with [dependency description]

This is a [solo/pair/full] team. Want to proceed, or adjust the team size?
```

If the user says "just do it" or similar, skip the gate for future spawns in the same session.

### Subtask Counting

Count subtasks by analyzing the discovery interview results:
- Each distinct deliverable or work product = 1 subtask
- Each independent investigation direction = 1 subtask
- Each layer of a stack (frontend, backend, tests) = 1 subtask
- Shared analysis tasks (cross-review, synthesis) don't count toward sizing

## Model Selection

Choose models based on the phase of work, not the team type:

| Phase | Recommended Model | Rationale |
|---|---|---|
| Discovery interview | Haiku | Quick Q&A, no heavy reasoning needed |
| Analysis and writing | Sonnet | Cost-effective for research, planning, review |
| Code implementation | Default (Opus) | Strongest reasoning for code generation |
| Iterative refinement | Default (Opus) | Convergence loops need strongest reasoning |
| Coordination (lead) | Sonnet | Leads coordinate, not implement |

### Per-Blueprint Overrides

Some blueprints have specific model requirements documented in their spawn prompts:
- **Productivity team:** Refiner uses default model (iterative refinement)
- **Design team:** Frontend Dev uses default model (implementation)
- **All planning modes:** All teammates use Sonnet (analysis and writing)

## Project Analysis Additions

During the project analysis step (before spawning), scan for shared assets in addition to the standard project structure analysis:

### Mock Repository Scan

Check for `docs/mocks/` in the project root. If found, report the available mocks in the team context:

```
Mock repository: Found [N] mocks in [M] domains at docs/mocks/
Domains: [list of domain directories]
```

If `docs/mocks/` doesn't exist: `Mock repository: Not found`

See `${CLAUDE_PLUGIN_ROOT}/shared/mock-repository.md` for the full mock convention.

### Lead Task Assignment Behavior

Tasks in spawn prompts use `[Owner]` annotations (e.g., `[Backend]`, `[Tester]`). Teammates call `TaskList` on startup and claim tasks matching their role.

**Do NOT send direct messages to teammates about task assignments.** Only message about tasks when:
- Reassigning a task mid-session
- Adding context not in the task description
- Responding to a teammate's question

**Task output filenames:** When writing task descriptions in the spawn prompt, include the expected output filename using the `task-{N}-{role-slug}.md` convention. Example:

```
1. [Architect] Analyze existing system, define high-level design — write to `docs/teams/[TEAM-NAME]/tasks/task-1-architect.md`
2. [API Designer] Draft API contracts and data models — write to `docs/teams/[TEAM-NAME]/tasks/task-2-api-designer.md`
3. [Risk Analyst] Run dependency grep, identify technical risks (NO blockers) — write to `docs/teams/[TEAM-NAME]/tasks/task-3-risk-analyst.md`
```

**Domain-section tasks must include an explicit "read peer outputs" instruction.** When multiple teammates each write a section of a shared document, each task description must name the peer output paths to read before writing. Without this, teammates write their sections in isolation and produce redundant or contradictory content:

```
✓ CORRECT:
4a. [Security] Write security domain section — first read Architect output at task-1-architect.md and Risk Analyst output at task-3-risk-analyst.md, then write your section to task-4a-security.md
4b. [Performance] Write performance domain section — first read task-1-architect.md and task-3-risk-analyst.md, then write to task-4b-performance.md

✗ WRONG:
4a. [Security] Write security domain section — write to task-4a-security.md
4b. [Performance] Write performance domain section — write to task-4b-performance.md
```

USER FEEDBACK GATE and `[All]` cross-review tasks produce no file — omit the filename from those lines.

**`[All]` tasks must never produce written output.** Use `[All]` only for coordination tasks with no deliverable (e.g., "review the compiled output", "approve the final report"). If a task requires domain-specific written output from each teammate, split it into per-role subtasks with explicit owners:

**Cross-review tasks must have unambiguous ownership.** Assign to all teammates explicitly if every teammate contributes, or name a single owner and state what the others' roles are (reviewer, optional contributor, etc.). Never write a cross-review task that leaves ownership ambiguous — teammates will either all claim it or all skip it:

```
✓ CORRECT: 10. [All] Cross-review compiled report and add inline comments — each teammate reads the report at docs/teams/[TEAM-NAME]/report.md and appends their section's review notes
✓ CORRECT: 10. [Architect] Cross-review all domain outputs and produce a consolidated gaps list — other teammates may add notes but Architect owns the deliverable
✗ WRONG:   10. [All] Cross-review each other's work   ← ambiguous, no deliverable spec, no clear owner
```

```
12a. [Security] Write security domain section — write to `docs/teams/[TEAM-NAME]/tasks/task-12a-security.md`
12b. [Performance] Write performance domain section — write to `docs/teams/[TEAM-NAME]/tasks/task-12b-performance.md`
12c. [Quality] Write quality domain section — write to `docs/teams/[TEAM-NAME]/tasks/task-12c-quality.md`
```

### Retrospective Scan

During project analysis, scan for prior run learnings from `docs/retrospectives/`:

**Step 1: Identify target files**
- Glob `docs/retrospectives/*.md` (excludes `-aar.md` files)
- Glob `docs/retrospectives/*-aar.md`
- Filter evaluate-spawn files by matching `profile:` frontmatter to the current spawn command
- Filter AAR files by matching `type:` frontmatter to the current spawn command
- Use the mapping defined in the spawn command

**Step 2: Cold-start guard**
- Count matched files across both file types
- If total matched count < 3: skip scan. Display: `Prior run scan: insufficient data (N/3 sessions)`
- If total matched count >= 3: proceed to Step 3

**Step 3: Extract insights from matched files (most recent 3 only)**
- Sort matched files by `date:` frontmatter descending. Take the 3 most recent.
- From each evaluate-spawn file: extract `## Actionable Insights` section content
- From each AAR file: extract improvement table rows where `Scope` column = `plugin`
- Discard rows where improvement has already been applied

**Step 4: Report**
- If insights found: surface as `Prior runs (N found): [extracted content]` in the team context
- If step 3 yields no actionable content: display `Prior run scan: N files found, no actionable insights`
- This output is consumed by R6 (Prior Run Insights injection) when building the Context block
