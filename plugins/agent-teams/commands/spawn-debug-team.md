---
name: spawn-debug-team
description: Spawn a debugging agent team with competing hypothesis investigators — includes hypothesis confirmation gate, root cause confirmation, and pipeline context
argument-hint: <bug description or symptoms>
---

# Spawn Debugging & Investigation Team

Create an agent team for parallel bug investigation with competing hypotheses. Includes a pre-spawn hypothesis confirmation gate (to validate investigator direction before spawning) and a root cause confirmation step (to validate findings before proposing a fix).

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

## Step 1: Hypothesis Formulation

If `$ARGUMENTS` is provided, use it as the bug description. If the bug description is vague, ask 1-2 clarifying questions:
- "Can you describe the exact symptoms — what you expected vs what happened?"
- "When did this start? Any recent changes that might be related?"

Analyze the bug description and the codebase to formulate 3 distinct hypotheses. Consider:
- The most likely cause based on symptoms
- An alternative cause based on recent changes (check `git log --oneline -20`)
- A less obvious cause (configuration, external dependencies, race conditions, edge cases)

Name hypotheses concretely (e.g., "race-condition", "null-reference", "config-drift") — not abstractly.

## Step 2: Hypothesis Confirmation Gate

Before spawning investigators, present the 3 hypotheses to the user for confirmation:

```
Based on the bug description, here are 3 hypotheses I'd assign to investigators:

1. **[Hypothesis-A-Name]**: [CONCRETE THEORY 1 — what could cause these symptoms]
2. **[Hypothesis-B-Name]**: [CONCRETE THEORY 2 — alternative explanation]
3. **[Hypothesis-C-Name]**: [CONCRETE THEORY 3 — less obvious possibility]

Does this cover the right ground? Should I adjust any hypothesis or add a direction
I'm missing?
```

Use AskUserQuestion to let the user confirm, adjust, or replace hypotheses. This prevents spawning investigators who pursue irrelevant theories.

## Step 3: Spawn the Team

**Pipeline context:** Feeds from `/spawn-review-team` (issues found during review), `/spawn-feature-team` (bugs introduced during implementation); feeds into `/spawn-feature-team` (implement the fix), `/spawn-review-team` (review the fix)

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
7. [Lead] ROOT CAUSE CONFIRMATION — Present the identified root cause and supporting evidence to user. Ask user to: confirm the root cause makes sense, provide additional context, and approve before proposing a fix (blocked by task 6)
8. [Lead] Propose fix based on confirmed root cause (blocked by task 7)

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

**Output format:** Root cause analysis + hypothesis investigation results + fix proposal → feeds into `/spawn-feature-team` (implement the fix), `/spawn-review-team` (review the fix)

## Output

After spawning, inform the user:
- The team has been created with 3 investigators, each pursuing a different confirmed hypothesis
- The adversarial structure ensures theories are challenged, not just confirmed
- Investigators will share evidence and debate as they discover findings
- **Root cause confirmation:** Before proposing a fix, the lead will present the root cause and evidence for your approval
- The lead requires plan approval before implementing a fix
- The fix proposal feeds into `/spawn-feature-team` for implementation or `/spawn-review-team` for review
- Use Shift+Up/Down to give investigators additional context or redirect them
