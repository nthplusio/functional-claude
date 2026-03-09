---
name: team-coordination
description: |
  This skill should be used when the user needs guidance on managing an active agent team, coordinating tasks between teammates, handling team communication, or understanding team lifecycle. Use this skill when the user asks about "task management", "team communication", "delegate mode", "plan approval", "shutdown teammates", "team messaging", or says "how do I manage my team".

  Covers task management, messaging patterns, plan approval workflow, delegate mode, display modes, and graceful shutdown.
version: 0.23.1
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

Teammates must respect task blocking — starting a blocked task wastes effort when upstream outputs change requirements. The canonical protocol block (including compaction resilience, shutdown compliance, and feedback gate rules) is in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — embed it verbatim in every spawn prompt.

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

A pre-spawn questioning phase that builds shared context for all teammates, allowing them to start working immediately rather than discovering constraints independently. Full specification in `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md`.

**Include when:** Context quality drives output quality (planning, research, design, brainstorm, feature teams).
**Skip when:** Input is already structured (debug bug description, review code diff, spec document).

## User Feedback Gate

A **user feedback gate** is a mid-execution checkpoint where the lead presents intermediate findings to the user for direction before the team invests in detailed work. It prevents expensive effort from going in the wrong direction.

### How It Differs from Plan Approval

| | Plan Approval | User Feedback Gate |
|---|---|---|
| **Direction** | Teammate → Lead | Lead → User |
| **Purpose** | Validate a teammate's implementation plan | Validate the team's analytical direction |
| **When** | Before a teammate starts risky implementation | After initial analysis, before detailed work |
| **Who decides** | The lead (approves/rejects teammate plans) | The user (confirms/adjusts team direction) |

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

For directory structure, frontmatter schemas, artifact mapping by team type, and standard spawn prompt instructions, see `${CLAUDE_PLUGIN_ROOT}/shared/artifact-protocol.md`.

## Team Efficiency Constraints

For right-sizing rules, coordination overhead budget, batching patterns, and anti-patterns, see `${CLAUDE_PLUGIN_ROOT}/shared/efficiency-guidelines.md`.

## Dedup Guard

A PreToolUse hook automatically prevents duplicate teams and teammates. The hook intercepts `TeamCreate` and `Task` calls and checks `~/.claude/teams/{team-name}/config.json` for existing state.

### What Gets Blocked

| Scenario | Detection | Remediation |
|----------|-----------|-------------|
| `TeamCreate` with a name that already exists | Config file found at `~/.claude/teams/{name}/` | Use the existing team, `TeamDelete` first, or pick a new name |
| `Task` spawning a teammate whose name is already registered | Case-insensitive match in config `members` array | `SendMessage` to assign new work, `shutdown_request` then respawn, or spawn with a different name |

### Fail-Safe

On any error (file read failure, JSON parse error, stdin issue), the hook allows the operation to proceed. This prevents the guard from blocking legitimate workflows.
