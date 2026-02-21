# Prerequisites Check

Standard prerequisites verification block included at the top of every spawn command. Ensures agent teams are enabled and the user has provided the required input.

## Why This Exists

Agent teams require an experimental environment variable to be set. Without this check, the spawn command fails with a cryptic error. The prerequisites check provides a clear, actionable path to enable the feature.

## Protocol Block

Include this section near the top of every spawn command, replacing `[INPUT-TYPE]` with the appropriate description:

```markdown
## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a [INPUT-TYPE] via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
```

### Input-Type Lookup Table

| Team Command | Input-Type Value |
|---|---|
| spawn-build | feature description or bug description |
| spawn-think | topic to research, plan, or review |
| spawn-create | topic to design, brainstorm, or optimize |

## Behavior

1. Check for the environment variable first
2. If missing, show the JSON snippet and stop (do not proceed with the interview or spawn)
3. If present, check for `$ARGUMENTS`
4. If `$ARGUMENTS` is empty, prompt the user for the required input
5. If both checks pass, proceed to the next step (mode selection or discovery interview)
