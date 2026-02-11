---
name: spawn-debug-team
description: Spawn a debugging agent team with competing hypothesis investigators
argument-hint: <bug description or symptoms>
---

# Spawn Debugging & Investigation Team

Create an agent team for parallel bug investigation with competing hypotheses.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a bug description via `$ARGUMENTS`

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

If `$ARGUMENTS` is provided, use it as the bug description. If not, ask the user to describe the symptoms.

Before spawning, analyze the bug description and the codebase to formulate 3 distinct hypotheses. Consider:
- The most likely cause based on symptoms
- An alternative cause based on recent changes (check `git log --oneline -20`)
- A less obvious cause (configuration, external dependencies, race conditions, edge cases)

Name hypotheses concretely (e.g., "race-condition", "null-reference", "config-drift") — not abstractly.

**Spawn the following team (replacing placeholders with concrete hypotheses):**

```
Create an agent team called "debug-[bug-slug]" to investigate: [BUG DESCRIPTION].

Spawn 3 investigator teammates, each pursuing a different hypothesis:

1. **[Hypothesis-A-Name]** — Investigate whether [CONCRETE THEORY 1 based on symptoms].
   Look at [RELEVANT FILES/MODULES]. Try to reproduce the issue through this code path.
   If you find evidence supporting OR contradicting this theory, share it with the other
   investigators immediately.

2. **[Hypothesis-B-Name]** — Investigate whether [CONCRETE THEORY 2 based on recent changes].
   Check [RELEVANT FILES/MODULES]. Look for recent changes that could have introduced this
   behavior. Share findings with other investigators.

3. **[Hypothesis-C-Name]** — Investigate whether [CONCRETE THEORY 3 - less obvious cause].
   Look at [EDGE CASES, EXTERNAL DEPS, CONFIG]. Your job is also to challenge the other
   investigators' conclusions — if they find something, try to disprove it.

Create these tasks:
1. [All] Read error logs and reproduce the issue
2. [[Hypothesis-A]] Trace code path for [theory 1]
3. [[Hypothesis-B]] Check recent changes related to [theory 2]
4. [[Hypothesis-C]] Examine edge cases for [theory 3]
5. [All] Share findings and challenge each other's theories
6. [Lead] Identify root cause from surviving theory
7. [Lead] Propose fix based on confirmed root cause

Have investigators actively debate. When one finds evidence, others should try to
disprove it. The theory that survives scrutiny is most likely correct.
Require plan approval before implementing any fix.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

## Output

After spawning, inform the user:
- The team has been created with 3 investigators, each pursuing a different theory
- The adversarial structure ensures theories are challenged, not just confirmed
- Investigators will share evidence and debate as they discover findings
- The lead requires plan approval before implementing a fix
- Use Shift+Up/Down to give investigators additional context or redirect them
