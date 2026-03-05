# Team Efficiency Guidelines

Empirical guidelines from session analysis — coordination overhead scales non-linearly with team size.

## Right-Sizing Rules

| Constraint | Guideline | Rationale |
|------------|-----------|-----------|
| **Teams per session** | Max 2 TeamCreates | Sessions with 7+ teams spent ~50% of turns on coordination |
| **Tasks per team** | Cap at 8 | Beyond 8, TaskUpdate churn dominates; combine related work |
| **Agents per team** | Prefer 3-4 (lead + 2-3 specialists) | Larger teams increase SendMessage overhead without proportional output |
| **Messages** | Batch instructions in one SendMessage | Sequential single-instruction messages waste turns |

## When NOT to Use Teams

Use plan-then-implement in the main session instead of spawning a team when:
- The work has fewer than 3 genuinely parallel workstreams
- A single agent can hold all necessary context
- The task is primarily sequential (each step depends on the previous)
- Total expected work is under ~30 minutes

## Coordination Overhead Budget

Expect roughly **40 coordination tool calls per team** (TeamCreate + TaskCreate + TaskUpdate + SendMessage). If the actual implementation work (Read + Edit + Write + Bash) would be fewer calls than the coordination overhead, the team adds more friction than value.

## Batching Patterns

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
