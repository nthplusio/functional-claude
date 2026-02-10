---
name: team-coordination
description: |
  This skill should be used when the user needs guidance on managing an active agent team, coordinating tasks between teammates, handling team communication, or understanding team lifecycle. Use this skill when the user asks about "task management", "team communication", "delegate mode", "plan approval", "shutdown teammates", "team messaging", or says "how do I manage my team".

  Covers task management, messaging patterns, plan approval workflow, delegate mode, display modes, and graceful shutdown.
version: 0.5.0
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
- Synthesize results
- No file editing or code execution

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

```
1. Ask the lead: "Ask [teammate] to shut down"
2. Lead sends shutdown request
3. Teammate approves (exits) or rejects (continues working)
4. Repeat for each teammate
5. Ask lead: "Clean up the team"
```

**Important:**
- Teammates finish current work before shutting down
- Always use the lead to clean up (not teammates)
- Lead checks for active members before cleanup

## Quality Gates with Hooks

### TeammateIdle Hook

Runs when a teammate is about to go idle. Exit with code 2 to send feedback and keep them working.

### TaskCompleted Hook

Runs when a task is being marked complete. Exit with code 2 to prevent completion and send feedback.

Example: Require test coverage before a task can be marked complete.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|--------------|--------------|-----------------|
| Two teammates editing same file | Overwrites and conflicts | Assign file ownership boundaries |
| Too many small tasks | Coordination overhead | Combine related work into meaningful units |
| Running unattended too long | Wasted effort on wrong approaches | Check in periodically and steer |
| Broadcasting every message | Expensive and noisy | Default to direct messages |
| No task dependencies | Tasks done in wrong order | Define blocking relationships |
