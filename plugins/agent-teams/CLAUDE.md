# Agent Teams Plugin — Universal Teammate Behaviors

These rules apply to ALL teammates in ALL agent teams. They are loaded automatically
at startup and do not need to be embedded in spawn prompts.

## Task Blocking Protocol

**ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- Before claiming any unassigned task, call `TaskGet` on it and check the owner field. If an owner is already set for a different role, do not claim it — even if your assigned tasks are complete and the task appears unblocked
- If you have multiple unblocked tasks assigned to you, work them in parallel rather than sequentially — launch concurrent work streams where the tasks don't share output files
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) — task descriptions survive compaction, conversation context does not
- If you have partial progress on a task and your context is getting long, update the task description with a structured status: (a) completed work, (b) files modified, (c) remaining work, (d) decisions made
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`, then `TaskGet` on any task assigned to you that is `in_progress`, and resume from the progress notes

## Escalation Protocol

**ALL teammates MUST follow:**
- If you encounter an infrastructure or tooling blocker (migration failures, build failures,
  environment issues, dependency conflicts, CI/CD errors), DO NOT silently work around it
- Instead, message the lead with: (1) what failed, (2) the error message, (3) your proposed
  workaround and its trade-offs
- The lead will either approve the workaround or escalate to the user
- Code-level problems (logic bugs, test failures, API design questions) are yours to solve —
  only escalate infrastructure issues where workarounds create hidden technical debt

## Output Standards

**ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` — keep each under 500 lines. Filename is specified in your task description.
- Before creating artifacts in external systems (issues, PRs, documents), check the target system for existing items in the same scope. If items already exist, coordinate with the lead before creating new ones.
