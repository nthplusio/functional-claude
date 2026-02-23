# Spawn Core

Shared logic for the unified spawn commands (`spawn-build`, `spawn-think`, `spawn-create`). Defines adaptive team sizing, model selection, verbosity control, and team name conventions.

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

## Verbosity Control

Three verbosity levels control post-spawn output:

| Flag | Behavior | When to Use |
|---|---|---|
| `--quiet` | Suppress post-spawn narrative. Show only: team name, teammate count, and "Team spawned." | Experienced users, scripted workflows, chaining commands |
| `--normal` (default) | Standard output: team summary, phase overview, key shortcuts, pipeline context | Most interactive use |
| `--verbose` | Full output: everything in normal + detailed task list, dependency graph, model assignments, token budget | Debugging, learning, first-time users |

### Detecting Verbosity

1. Check `$ARGUMENTS` for `--quiet`, `--normal`, or `--verbose` flags
2. Strip the flag from `$ARGUMENTS` before passing to the discovery interview
3. Default to `--normal` if no flag is present

### Output Templates

#### Quiet Mode
```
Team "[TEAM-NAME]" spawned with [N] teammates. Use Shift+Up/Down to interact.
```

#### Normal Mode (default)
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

#### Verbose Mode
```
[Everything in normal mode, plus:]

**Tasks:**
1. [Owner] Task description
2. [Owner] Task description (blocked by 1)
...

**Dependencies:** [visual graph or description]
**Models:** [per-teammate model assignments]
**Token budget:** discovery 10% | analysis 30% | feedback 10% | execution 40% | synthesis 10%
```

## Team Name Conventions

Generate team names using this pattern: `[command-prefix]-[mode-slug]-[topic-slug]`

| Command | Prefix | Example |
|---|---|---|
| spawn-build --mode feature | `feature` | `feature-user-auth` |
| spawn-build --mode debug | `debug` | `debug-login-timeout` |
| spawn-think --mode research | `research-[submode]` | `research-eval-auth-libs` |
| spawn-think --mode planning | `plan-[submode]` | `plan-roadmap-myapp` |
| spawn-think --mode review | `review` | `review-pr-142` |
| spawn-create --mode design | `design` | `design-settings-page` |
| spawn-create --mode brainstorm | `brainstorm` | `brainstorm-api-auth` |
| spawn-create --mode productivity | `productivity` | `productivity-ci-pipeline` |

### Slug Generation

- Lowercase, hyphen-separated
- Max 30 characters for the topic slug
- Strip common words: "the", "a", "an", "for", "with", "and"
- Use first 3-4 meaningful words from the topic

## Dispatch Pattern

The unified commands are thin wrappers that:

1. Run prerequisites check (from `shared/prerequisites-check.md`)
2. Parse `--mode` flag or auto-infer mode from keywords
3. Run discovery interview (from `shared/discovery-interview.md` + command-specific extended questions)
4. Apply adaptive sizing (this file)
5. Dispatch to the appropriate legacy spawn command with compiled context

### Auto-Inference

Each unified command defines mode-specific keywords. If `$ARGUMENTS` contains a keyword match, auto-select the mode and confirm rather than asking:

```
Your topic suggests [MODE] mode. Proceeding with that — say "actually [OTHER-MODE]" to switch.
```

If no keywords match, present the mode table and ask.

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
