---
name: spawn-research-team
description: Spawn a research and discovery agent team to investigate a topic from multiple angles
argument-hint: <topic to research>
---

# Spawn Research & Discovery Team

Create an agent team to conduct parallel research on the specified topic.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a clear research topic via `$ARGUMENTS`

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

If `$ARGUMENTS` is provided, use it as the research topic. If not, ask the user what they want to research.

**Spawn the following team with this exact prompt (replacing [TOPIC] with the user's topic):**

```
Create an agent team called "research-[topic-slug]" to research [TOPIC]. Spawn 3 teammates:

1. **Explorer** — Investigate the technical landscape: available APIs, libraries,
   performance characteristics, and compatibility with our stack. Focus on concrete
   capabilities and limitations. Read our codebase to understand integration points.

2. **Analyst** — Evaluate from a requirements perspective: what are our actual needs,
   what constraints do we have, and how do different options compare on cost, complexity,
   and maintainability? Review existing code patterns to understand what fits.

3. **Critic** — Play devil's advocate: what could go wrong with each approach? What are
   the hidden costs, scaling concerns, and vendor lock-in risks? Challenge the other
   teammates' findings and probe for weaknesses.

Use Sonnet for all teammates to keep costs manageable.

Create these tasks:
1. [Explorer] Survey available options (document at least 3 approaches)
2. [Analyst] Define evaluation criteria based on project requirements
3. [Critic] Identify risks and failure modes for each approach
4. [All] Cross-review: teammates challenge each other's findings
5. [Lead] Synthesize into a recommendation with clear rationale

Have teammates share findings with each other and debate trade-offs before synthesis.
Wait for all teammates to complete before synthesizing.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

## Output

After spawning, inform the user:
- The team has been created with 3 teammates (Explorer, Analyst, Critic)
- Use Shift+Up/Down to select and message individual teammates
- Use Ctrl+T to view the shared task list
- The lead will synthesize findings when all teammates finish
