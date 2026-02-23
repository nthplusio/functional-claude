# Task Blocking Protocol

Canonical protocol block that MUST be embedded in every spawn prompt. Teammates don't inherit the lead's conversation or read skill files, so this protocol must be included directly in the prompt text they receive.

## Why This Exists

Without this protocol, teammates:
- Start blocked tasks early, wasting effort on stale assumptions
- Skip reading upstream deliverables, producing misaligned outputs
- Send "standing by" noise messages while waiting
- Ignore user feedback gate decisions
- Resist shutdown, wasting tokens on unnecessary wind-down messages
- Lose progress during compaction because task state wasn't preserved in task descriptions
- Serialize independent tasks instead of parallelizing them, wasting time
- Silently work around infrastructure blockers, creating hidden technical debt

## Protocol Block

Spawn prompts reference this block via `[Include Task Blocking Protocol from shared/task-blocking-protocol.md]`. The lead reads this file at spawn time and embeds the Protocol Block in the prompt text teammates receive:

```
**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- If you have multiple unblocked tasks assigned to you, work them in parallel rather than sequentially — launch concurrent work streams where the tasks don't share output files
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) — task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes
```

## Escalation Protocol

Spawn prompts reference this block via `[Include Escalation Protocol from shared/task-blocking-protocol.md]`. The lead reads this section at spawn time and embeds it alongside the Task Blocking Protocol block:

```
**Escalation Protocol -- ALL teammates MUST follow:**
- If you encounter an infrastructure or tooling blocker (migration failures, build failures,
  environment issues, dependency conflicts, CI/CD errors), DO NOT silently work around it
- Instead, message the lead with: (1) what failed, (2) the error message, (3) your proposed
  workaround and its trade-offs
- The lead will either approve the workaround or escalate to the user
- Code-level problems (logic bugs, test failures, API design questions) are yours to solve —
  only escalate infrastructure issues where workarounds create hidden technical debt
```

## Placement

Place the protocol blocks after the task list and before any closing coordination instructions:

```
Create these tasks:
1. [Owner] Task description
...
N. [Lead] Compile deliverables

[TASK BLOCKING PROTOCOL BLOCK HERE]

[ESCALATION PROTOCOL BLOCK HERE]

[OUTPUT STANDARDS BLOCK HERE]

[SHUTDOWN PROTOCOL BLOCK HERE]
```

## When to Include

**Always.** Every spawn prompt that creates tasks with dependencies needs this protocol. Even teams with no explicit blocking dependencies benefit from the shutdown compliance and idle behavior rules.

Blueprints with deep dependency chains (Frontend Design, Productivity Systems, Brainstorming) are especially vulnerable to protocol violations because later tasks depend on specific outputs from earlier ones.

Blueprints with long-running tasks (Feature teams, Productivity teams) are especially vulnerable to compaction data loss because teammates may accumulate significant context before compaction triggers.
