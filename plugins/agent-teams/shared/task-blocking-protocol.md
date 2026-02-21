# Task Blocking Protocol

Canonical protocol block that MUST be included verbatim in every spawn prompt. Teammates don't inherit the lead's conversation or read skill files, so this protocol must be embedded directly in the prompt text they receive.

## Why This Exists

Without this protocol, teammates:
- Start blocked tasks early, wasting effort on stale assumptions
- Skip reading upstream deliverables, producing misaligned outputs
- Send "standing by" noise messages while waiting
- Ignore user feedback gate decisions
- Resist shutdown, wasting tokens on unnecessary wind-down messages

## Protocol Block

Include this block verbatim in every spawn prompt, inside the code fence that defines the team:

```
**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
```

## Placement

Place the protocol block after the task list and before any closing coordination instructions:

```
Create these tasks:
1. [Owner] Task description
...
N. [Lead] Compile deliverables

[TASK BLOCKING PROTOCOL BLOCK HERE]

[OUTPUT STANDARDS BLOCK HERE]
```

## When to Include

**Always.** Every spawn prompt that creates tasks with dependencies needs this protocol. Even teams with no explicit blocking dependencies benefit from the shutdown compliance and idle behavior rules.

Blueprints with deep dependency chains (Frontend Design, Productivity Systems, Brainstorming) are especially vulnerable to protocol violations because later tasks depend on specific outputs from earlier ones.
