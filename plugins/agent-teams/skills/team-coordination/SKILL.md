---
name: team-coordination
description: |
  This skill should be used when the user needs guidance on managing an active agent team, coordinating tasks between teammates, handling team communication, or understanding team lifecycle. Use this skill when the user asks about "task management", "team communication", "delegate mode", "plan approval", "shutdown teammates", "team messaging", or says "how do I manage my team".

  Covers task management, messaging patterns, plan approval workflow, delegate mode, display modes, and graceful shutdown.
version: 0.16.0
---

# Team Coordination Patterns

Guidance for managing active agent teams: task lifecycle, communication, plan approval, and team operations.

## Task Management

### Task States

Tasks progress through three states:

```
pending → in_progress → completed
```

Tasks can also have **dependencies**: a pending task with unresolved dependencies cannot be claimed until those dependencies are completed.

### Creating Tasks

The lead creates tasks that teammates work through:

```
Create the following tasks for the team:
1. Define API contract for user authentication (assign to Backend)
2. Implement login form component (assign to Frontend, blocked by task 1)
3. Write authentication tests (assign to Tester, blocked by tasks 1 and 2)
```

### Task Assignment Strategies

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Lead assigns** | When you know who should do what | Tell the lead which task goes to which teammate |
| **Self-claim** | When teammates can judge best | After finishing a task, teammates pick up the next unassigned, unblocked task |
| **Hybrid** | Most common | Lead assigns initial tasks, teammates self-claim follow-ups |

### Task Sizing

| Size | Risk | Recommendation |
|------|------|----------------|
| Too small | Coordination overhead exceeds benefit | Combine related micro-tasks |
| Too large | Teammates work too long without check-ins | Split into 5-6 tasks per teammate |
| Just right | Self-contained with clear deliverable | A function, test file, review report, or module |

### Dependency Management

Dependencies unblock automatically when the blocking task is completed:

```
Task 1: Define API types (no dependencies)
Task 2: Implement API endpoints (blocked by Task 1)
Task 3: Implement API client (blocked by Task 1)
Task 4: Integration tests (blocked by Tasks 2 and 3)
```

When Task 1 completes, Tasks 2 and 3 both become available. When both 2 and 3 complete, Task 4 unblocks.

### Blocked Task Behavior

Teammates **must** respect task blocking — starting a blocked task early leads to wasted work because upstream tasks may produce outputs that change requirements, interfaces, or approach.

Every teammate should follow this protocol:

1. **Check before starting:** Call `TaskList` and verify the task's `blockedBy` list is empty before beginning work
2. **Never start blocked tasks:** Even if you think you know what to do — upstream tasks may change your requirements
3. **Go idle silently when blocked:** Do NOT send "standing by" or status messages — the system notifies the lead automatically
4. **Check after completing:** Immediately call `TaskList` after completing a task to find newly unblocked tasks to claim
5. **Read upstream outputs:** When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it — they contain context you need
6. **Respect user decisions:** When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints — do not include approaches, options, or paths the user explicitly rejected
7. **Shutdown compliance:** When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

#### Including in Spawn Prompts

Since teammates don't inherit the lead's conversation or read skill files, the blocking protocol must be embedded directly in every spawn prompt. The canonical protocol block is defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — include it verbatim in every spawn prompt. See that file for the exact text, placement guidance, and rationale.

## Communication Patterns

### Message Types

| Type | Recipient | Cost | When to Use |
|------|-----------|------|-------------|
| **message** | One teammate | Low | Normal communication, questions, follow-ups |
| **broadcast** | All teammates | High (N messages) | Critical issues requiring immediate team-wide attention |

### When to Message vs Broadcast

**Use `message` (default):**
- Responding to a single teammate
- Following up on a specific task
- Sharing findings relevant to one person
- Normal back-and-forth communication

**Use `broadcast` (sparingly):**
- Critical blocking issues ("stop all work, breaking change found")
- Major announcements affecting every teammate
- Shared decisions that need everyone's input

### Direct Interaction

You can message any teammate directly without going through the lead:

- **In-process mode:** Shift+Up/Down to select a teammate, then type
- **Split-pane mode:** Click into a teammate's pane

### Teammate Idle State

Teammates go idle after every turn — this is normal. An idle teammate:
- **Can receive messages** (sending wakes them up)
- **Sends automatic idle notifications** to the lead
- **Is NOT done or unavailable** — just waiting for input

## Plan Approval Workflow

For complex or risky tasks, require teammates to plan before implementing.

### Enabling Plan Approval

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

### Approval Flow

```
1. Teammate works in read-only plan mode
2. Teammate sends plan approval request to lead
3. Lead reviews and either:
   a. Approves → teammate exits plan mode and implements
   b. Rejects with feedback → teammate revises and resubmits
```

### Guiding Approval Decisions

Tell the lead what criteria to use:

```
Only approve plans that:
- Include test coverage for all new code
- Don't modify the database schema without migration
- Keep the public API backwards-compatible
```

## Delegate Mode

Prevents the lead from implementing tasks itself — it can only coordinate.

### When to Use

- Lead keeps implementing instead of delegating
- You want strict separation of coordination and implementation
- Complex team operations where the lead should focus on orchestration

### How to Enable

Press **Shift+Tab** to cycle into delegate mode after starting a team.

The lead's available tools become coordination-only:
- Spawn and message teammates
- Manage tasks
- No file editing or code execution

### Compilation in Delegate Mode

In delegate mode, the lead cannot write files — so the final compilation/synthesis task must be assigned to a designated teammate, not the lead. Each spawn command assigns compilation to a domain-expert teammate (e.g., Architect compiles specs, Strategist compiles roadmaps, Analyst compiles research reports). The lead coordinates and presents user feedback gates; a teammate handles the final document write.

## Display Modes

### In-Process (Default)

All teammates run in your main terminal.

| Action | Shortcut |
|--------|----------|
| Select teammate | Shift+Up/Down |
| View session | Enter |
| Interrupt turn | Escape |
| Toggle task list | Ctrl+T |

### Split Panes

Each teammate gets its own pane (requires tmux or iTerm2).

Configure in settings.json:
```json
{
  "teammateMode": "tmux"
}
```

Or per-session:
```bash
claude --teammate-mode in-process
```

| Mode | Behavior |
|------|----------|
| `"auto"` | Split panes if already in tmux, otherwise in-process |
| `"in-process"` | All in main terminal |
| `"tmux"` | Auto-detect tmux vs iTerm2 |

## Team Lifecycle

### Startup

```
1. You describe the task and team structure
2. Claude creates team with shared task list
3. Teammates are spawned with your prompt + project context
4. Lead assigns initial tasks
5. Teammates begin work
```

### During Operation

```
Monitor → Steer → Synthesize

- Check teammate progress (Shift+Up/Down or click panes)
- Redirect approaches that aren't working
- Synthesize findings as they come in
- Reassign tasks if someone gets stuck
```

### Common Lead Issues

| Problem | Solution |
|---------|----------|
| Lead implements instead of delegating | Enable delegate mode (Shift+Tab) or say "Wait for teammates" |
| Lead shuts down too early | Tell it to wait for all tasks to complete |
| Teammate stuck on errors | Message them directly with additional instructions |

### Shutdown

The lead should batch shutdown requests — send all at once without waiting between:

```
1. Lead sends shutdown_request to ALL teammates (batch, not sequential)
2. Teammates MUST approve immediately unless mid-write on a file
3. If no response after 30s, lead re-sends the shutdown_request
4. Once all teammates have shut down, lead calls TeamDelete
```

**Teammate rules:**
- Approve shutdown immediately upon receiving the request
- Only exception: mid-write on a file (finish the write, then approve)
- Do NOT reject to "finish up" analysis or messages — those can be resumed later

**Lead rules:**
- Send all shutdown_requests in one batch, not one-by-one
- Re-request after 30s if a teammate hasn't responded
- Call `TeamDelete` after all teammates have shut down

## Quality Gates with Hooks

### TeammateIdle Hook

Runs when a teammate is about to go idle. Exit with code 2 to send feedback and keep them working.

### TaskCompleted Hook

Runs when a task is being marked complete. Exit with code 2 to prevent completion and send feedback.

Example: Require test coverage before a task can be marked complete.

## Discovery Interview Pattern

A **discovery interview** is a structured pre-spawn questioning phase that builds rich shared context for all teammates. Without it, teammates start with only a brief topic string and must independently discover constraints, goals, and context — leading to shallow, misaligned outputs.

### When to Include

Include a discovery interview when **shared context quality drives output quality**:

| Include | Skip |
|---------|------|
| Planning teams (the plan quality depends on understanding constraints) | Debugging teams (the bug description IS the input; urgency matters) |
| Research teams (research direction depends on knowing what matters) | Review teams (the code diff IS the input) |
| Design teams (design decisions depend on understanding users and constraints) | Teams where the input is already structured (e.g., a spec document) |
| Brainstorming teams (ideation quality depends on understanding the problem space) | |
| Feature teams (implementation depends on understanding scope and acceptance criteria) | |

### Standard Structure

Every discovery interview has **Core Questions** (asked for all modes/uses) and **Extended Questions** (asked based on mode, category, or complexity):

```
Core Questions (up to 5, always asked):
1. Objective — What are we doing? What's the desired end state?
2. Current state — What exists today?
3. Constraints — What are the non-negotiables?
4. Stakeholders — Who decides, who's affected?
5. Success definition — How will we know this succeeded?

Extended Questions (2-5, mode-specific):
6-10. Questions that probe deeper into the specific mode or category
```

### Adaptive Behavior

**Skip questions already answered in `$ARGUMENTS`.** If the user's initial prompt says "brainstorm API authentication approaches for our Express.js app, we need to support OAuth and JWT," skip questions about the topic, tech stack, and known approaches.

### Batch Presentation

Present questions in groups of 3-5 using `AskUserQuestion` rather than asking one at a time. This respects the user's time while still gathering comprehensive context.

### Output Compilation

Compile all interview answers into a structured `## Context` section (named for the team type — e.g., `## Planning Context`, `## Brainstorming Context`, `## Research Context`) in the spawn prompt. This section becomes shared context for all teammates:

```
## [Team Type] Context

### Objective
[What we're doing, desired end state]

### Current State
[What exists today, starting point]

### Constraints
[Non-negotiables: budget, timeline, tech stack, team size, regulatory]

### Stakeholders
[Key stakeholders, decision makers, affected parties]

### Success Definition
[How success is measured, what done looks like]

### Additional Context
[Mode-specific extended question answers — as applicable]

### Project Analysis
[Findings from codebase/document analysis — if applicable]
```

### Canonical Implementations

- **Planning team** (`/spawn-think --mode planning`) — 5 core + 5 extended questions per mode (7 modes), full context compilation
- **Brainstorming team** (`/spawn-create --mode brainstorm`) — 5 core + 5 extended questions, category-specific adaptation

## User Feedback Gate

A **user feedback gate** is a mid-execution checkpoint where the lead presents intermediate findings to the user for direction before the team invests in detailed work. It prevents expensive effort from going in the wrong direction.

### How It Differs from Plan Approval

| | Plan Approval | User Feedback Gate |
|---|---|---|
| **Direction** | Teammate → Lead | Lead → User |
| **Purpose** | Validate a teammate's implementation plan | Validate the team's analytical direction |
| **When** | Before a teammate starts risky implementation | After initial analysis, before detailed work |
| **Who decides** | The lead (approves/rejects teammate plans) | The user (confirms/adjusts team direction) |

### When to Include

Include a user feedback gate when **significant effort could go in the wrong direction**:

| Include | Skip |
|---------|------|
| Planning teams (phases could be wrongly prioritized) | Review teams (reviews are single-pass; cross-reference serves as validation) |
| Feature teams (API contracts are expensive to change post-implementation) | Debug teams (urgency; but DO confirm root cause before proposing fixes) |
| Design teams (implementation effort is wasted if specs are wrong) | |
| Brainstorming teams (building phase should only work on ideas the user cares about) | |
| Productivity teams (designing solutions for the wrong bottlenecks wastes effort) | |
| Research teams (deep-dive synthesis should focus on what the user found promising) | |

### Implementation

Create a dedicated `[Lead]` task with blocking dependencies on both sides:

```
Tasks:
...
4. [Teammate A] Initial analysis (produces findings)
5. [Teammate B] Alternative analysis (produces findings)
6. [Lead] USER FEEDBACK GATE — Present initial findings to user. Ask user to:
   confirm direction, adjust priorities, flag misalignment, and provide
   guidance for detailed work (blocked by tasks 4, 5)
7. [Teammate A] Detailed work based on user direction (blocked by task 6)
8. [Teammate B] Detailed work based on user direction (blocked by task 6)
...
```

The gate task **blocks all downstream tasks**, ensuring no teammate begins detailed work until the user has validated the direction.

### Standard Phrasing

The feedback gate task description should follow this pattern:

```
[Lead] USER FEEDBACK GATE — Present [what's being shown] to user. Ask user to:
[list of 3-4 specific actions the user can take], and provide direction for
[next phase of work] (blocked by tasks [upstream tasks])
```

### Placement Guidance

Place the feedback gate at the **most expensive decision point** — the moment where changing direction afterwards would waste the most effort:

| Team Type | Feedback Gate Placement | Why |
|-----------|------------------------|-----|
| Planning | After initial phase structure, before detailed planning | Phases set the frame for all subsequent work |
| Feature | After API contract definition, before implementation | API contracts are expensive to change |
| Design | After specs + accessibility review, before implementation | Implementation is the biggest cost |
| Brainstorming | After idea clustering, before building phase | Building should focus on user-selected ideas |
| Productivity | After Auditor's scored plan, before solution design | Designing for wrong bottlenecks wastes effort |
| Research | After initial findings, before deep-dive synthesis | Deep research should follow user interest |

## Artifact Output Protocol

Team deliverables (roadmaps, specs, evaluation reports, etc.) should be written to disk as git-tracked markdown files so they persist after sessions end and can be consumed by downstream teams in the cross-team pipeline.

### Why Artifacts Matter

- **Pipeline continuity** — Downstream teams can read upstream outputs from files instead of relying on message context that compacts away
- **Human reference** — Users can review, edit, and share team outputs outside of Claude Code sessions
- **Persistence** — Deliverables survive session end, context compaction, and team shutdown

### Directory Structure

All team artifacts are written to the project's `docs/teams/` directory:

```
docs/teams/
├── README.md                              # Root index — table of all team runs
├── plan-roadmap-myapp/
│   ├── README.md                          # Team metadata, artifact list, pipeline links
│   ├── roadmap.md                         # Primary deliverable
│   └── tasks/
│       ├── 01-strategic-objectives.md     # Task-level output
│       ├── 02-user-needs.md
│       └── ...
└── research-eval-auth-libs/
    ├── README.md
    ├── evaluation-report.md
    └── tasks/
        └── ...
```

**Two tiers:**
- **Primary deliverable** — The team's main output file (e.g., `roadmap.md`, `spec.md`, `evaluation-report.md`)
- **Task outputs** — Per-task analysis written to `tasks/` (numbered by task order, e.g., `01-strategic-objectives.md`)

### Frontmatter Schemas

#### Team README (`docs/teams/{team-name}/README.md`)

```yaml
---
team: plan-roadmap-myapp
type: planning
mode: product-roadmap
topic: "MyApp product roadmap"
date: 2026-02-11
status: completed
teammates: 4
pipeline:
  from: null
  to: ["/spawn-build --mode feature", "/spawn-create --mode design"]
---
```

Body: team composition table, artifact list with relative links, pipeline links, context summary.

#### Primary Deliverable (`docs/teams/{team-name}/{artifact}.md`)

```yaml
---
artifact: roadmap
team: plan-roadmap-myapp
type: planning
date: 2026-02-11
---
```

#### Task Output (`docs/teams/{team-name}/tasks/{nn}-{slug}.md`)

```yaml
---
task: 1
title: "Analyze product vision"
owner: Strategist
team: plan-roadmap-myapp
date: 2026-02-11
---
```

### Root Index

The root index at `docs/teams/README.md` tracks all team runs. Create it if it doesn't exist, append to it if it does:

```markdown
# Team Artifacts

| Team | Type | Mode | Topic | Date | Status | Primary Artifact |
|------|------|------|-------|------|--------|-----------------|
| plan-roadmap-myapp | planning | product-roadmap | MyApp product roadmap | 2026-02-11 | completed | [roadmap.md](plan-roadmap-myapp/roadmap.md) |
```

### When to Write Task Artifacts

| Write | Skip |
|-------|------|
| Analysis, reports, and recommendations (research findings, risk matrices, design specs) | Code implementation tasks (the code itself is the artifact) |
| Plans, roadmaps, and strategies | Infrastructure or configuration tasks |
| Evaluation criteria and scoring | Tasks that only produce in-context messages |

### Artifact Mapping by Team Type

| Team Type | Dir Pattern | Primary Deliverable |
|-----------|------------|-------------------|
| Planning (Roadmap) | `plan-roadmap-{slug}` | `roadmap.md` |
| Planning (Spec) | `plan-spec-{slug}` | `spec.md` |
| Planning (ADR) | `plan-adr-{slug}` | `adr.md` |
| Planning (Migration) | `plan-migration-{slug}` | `migration-plan.md` |
| Planning (Business Case) | `plan-bizcase-{slug}` | `business-case.md` |
| Planning (GTM) | `plan-gtm-{slug}` | `gtm-plan.md` |
| Planning (OKR) | `plan-okr-{slug}` | `okr-tree.md` |
| Research (Eval) | `research-eval-{slug}` | `evaluation-report.md` |
| Research (Landscape) | `research-landscape-{slug}` | `landscape-report.md` |
| Research (Risk) | `research-risk-{slug}` | `risk-assessment.md` |
| Feature | `feature-{slug}` | `implementation-summary.md` |
| Design | `design-{slug}` | `component-spec.md` / `page-spec.md` / `redesign-spec.md` |
| Review | `review-{slug}` | `review-report.md` |
| Debug | `debug-{slug}` | `root-cause-analysis.md` |
| Productivity | `productivity-{slug}` | `productivity-report.md` |
| Brainstorming | `brainstorm-{slug}` | `brainstorm-output.md` |

### Standard Instructions for Spawn Prompts

The lead's final compilation/synthesis task should include artifact writing. Append to the task description:

```
Write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `[filename].md` with frontmatter,
task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`.
```

## Team Efficiency Constraints

Empirical guidelines from session analysis — coordination overhead scales non-linearly with team size.

### Right-Sizing Rules

| Constraint | Guideline | Rationale |
|------------|-----------|-----------|
| **Teams per session** | Max 2 TeamCreates | Sessions with 7+ teams spent ~50% of turns on coordination |
| **Tasks per team** | Cap at 8 | Beyond 8, TaskUpdate churn dominates; combine related work |
| **Agents per team** | Prefer 3-4 (lead + 2-3 specialists) | Larger teams increase SendMessage overhead without proportional output |
| **Messages** | Batch instructions in one SendMessage | Sequential single-instruction messages waste turns |

### When NOT to Use Teams

Use plan-then-implement in the main session instead of spawning a team when:
- The work has fewer than 3 genuinely parallel workstreams
- A single agent can hold all necessary context
- The task is primarily sequential (each step depends on the previous)
- Total expected work is under ~30 minutes

### Coordination Overhead Budget

Expect roughly **40 coordination tool calls per team** (TeamCreate + TaskCreate + TaskUpdate + SendMessage). If the actual implementation work (Read + Edit + Write + Bash) would be fewer calls than the coordination overhead, the team adds more friction than value.

### Batching Patterns

**Batch task creation** — Create all tasks in rapid succession before spawning agents, rather than interleaving task creation with agent spawns.

**Batch messages** — When updating multiple teammates, compose one detailed message per teammate rather than sending multiple short follow-ups.

**Batch shutdown** — Send all shutdown_requests at once, not sequentially waiting for each response.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|--------------|--------------|-----------------|
| Two teammates editing same file | Overwrites and conflicts | Assign file ownership boundaries |
| Too many small tasks | Coordination overhead | Combine related work into meaningful units |
| Running unattended too long | Wasted effort on wrong approaches | Check in periodically and steer |
| Broadcasting every message | Expensive and noisy | Default to direct messages |
| No task dependencies | Tasks done in wrong order | Define blocking relationships |
| Starting blocked tasks early | Wasted effort, stale assumptions | Include Task Blocking Protocol in spawn prompts |
| Too many teams in one session | Coordination dominates execution | Max 2 teams; chain sessions for complex pipelines |
| Sequential single-instruction messages | Wastes turns on overhead | Batch instructions into one detailed message |

## Dedup Guard

A PreToolUse hook automatically prevents duplicate teams and teammates. The hook intercepts `TeamCreate` and `Task` calls and checks `~/.claude/teams/{team-name}/config.json` for existing state.

### What Gets Blocked

| Scenario | Detection | Remediation |
|----------|-----------|-------------|
| `TeamCreate` with a name that already exists | Config file found at `~/.claude/teams/{name}/` | Use the existing team, `TeamDelete` first, or pick a new name |
| `Task` spawning a teammate whose name is already registered | Case-insensitive match in config `members` array | `SendMessage` to assign new work, `shutdown_request` then respawn, or spawn with a different name |

### Fail-Safe

On any error (file read failure, JSON parse error, stdin issue), the hook allows the operation to proceed. This prevents the guard from blocking legitimate workflows.
