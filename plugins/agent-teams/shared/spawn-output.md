# Spawn Output Format

Use the verbosity level parsed in Step 2 to format post-spawn output.

## Verbosity Levels

| Flag | Behavior |
|---|---|
| `--quiet` | Suppress narrative. Show only: team name, teammate count, and "Team spawned." |
| `--normal` (default) | Team summary, phase overview, key shortcuts, pipeline context |
| `--verbose` | Everything in normal + detailed task list, dependency graph, model assignments, token budget |

## Templates

**Quiet mode:**
```
Team "[TEAM-NAME]" spawned with [N] teammates. Use Shift+Up/Down to interact.
```

**Normal mode (default):**
```
Team "[TEAM-NAME]" created with [N] teammates:
- [Role 1], [Role 2], [Role 3]

**Phases:**
1. [Phase description]
2. [Phase description — YOUR TURN: feedback gate]
3. [Phase description]

Shortcuts: Shift+Up/Down (teammates), Ctrl+T (task list)
Pipeline: [downstream commands]
Artifacts: docs/teams/[TEAM-NAME]/
```

**Normal mode with `--project`** (replaces the last 3 lines above):
```
Artifacts: docs/projects/[PROJECT]/[STAGE]/
Project: [PROJECT] — stage [N] of [TOTAL] ([STAGE])
Upstream context: [N] prior stage(s) — [completed stage names]
Next stage: [NEXT] (run `/project next` after completion)
```

**Verbose mode** (everything in normal, plus):
```
**Tasks:**
1. [Owner] Task description
2. [Owner] Task description (blocked by 1)
...
**Dependencies:** [visual graph or description]
**Models:** [per-teammate model assignments]
**Token budget:** discovery 10% | analysis 30% | feedback 10% | execution 40% | synthesis 10%
```

## Post-Completion

The shutdown protocol ensures AAR runs before TeamDelete. If the team shut down before AAR completed, run `/after-action-review [team-name]` manually.

After team completion, include:
1. `Run /evaluate-spawn to capture quick feedback? (2 questions)`

This prompt does not block session end.
