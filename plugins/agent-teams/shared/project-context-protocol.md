# Project Context Protocol

Defines how projects wrap multiple team spawns into a staged pipeline with shared, accumulating context. Projects sit above teams — a project owns stages, each stage maps to a team spawn, and context flows downstream via `context.md`.

## Project Resolution

When `--project <name>` is passed to a spawn command:

1. Resolve path: `docs/projects/<name>/project.json`
2. Validate: file exists, `status` is not `"archived"`
3. Parse `project.json` to determine current stage and prior context
4. If validation fails, display error and abort spawn

## Stage-to-Command Mapping

| Stage | Command | Default Mode |
|-------|---------|-------------|
| brainstorm | spawn-create | brainstorm |
| research | spawn-think | research |
| plan | spawn-think | planning |
| build | spawn-build | feature |
| review | spawn-think | review |

## Context Injection

When `--project` is set, inject upstream context into the spawn prompt's Context section:

1. Read `docs/projects/<name>/context.md`
2. If context.md has content beyond the header, inject as `### Upstream Context` after `### Prior Run Insights` (or `### Lessons Applied` in feature mode)
3. If context.md is thin (header only, no stage sections), read prior stage primary deliverables for richer context — summarize key decisions and outputs in 3-5 bullets

### Upstream Context Format

```markdown
### Upstream Context

**Project:** [name] — [description]
**Prior stages:** [completed stage names]

[Content from context.md stage summaries]
```

## Discovery Interview Adaptation

When upstream context exists from prior project stages:

- **Core questions still run** (cheap insurance against drift) but lead pre-populates answers from context.md and asks user to confirm/adjust: "Based on prior stages, here's what I understand: [summary from context.md]. Confirm or adjust?"
- Extended questions can reference upstream decisions: "The brainstorm stage identified [X] — does this still hold?"
- If user says "use prior context", "looks good", or similar affirmation, accept context.md answers as sufficient for core questions and move to follow-ups

## Artifact Output Routing

When `--project` is set:

- Write artifacts to `docs/projects/<name>/<stage>/` instead of `docs/teams/[team-name]/`
- Same directory structure: `README.md`, primary deliverable, `tasks/` subdirectory
- Same frontmatter schemas with added fields:
  ```yaml
  project: auth-overhaul
  stage: research
  ```
- Still update `docs/teams/README.md` root index for cross-reference (add `Project` column)

## Context Accumulation

After team shutdown (between AAR and TeamDelete), if the team was spawned with `--project`:

1. Read team's primary artifact and task outputs
2. Append structured summary to `docs/projects/<name>/context.md`:

```markdown
## [Stage Name] — [Date]
**Team:** [team-name]
**Summary:** [2-3 sentences of key outputs and decisions]
**Key Decisions:**
- [Decision 1]
- [Decision 2]
**Open Questions:** [questions for downstream stages]
```

3. Update `docs/projects/<name>/project.json`:
   - Set current stage's `status` to `"completed"`
   - Set `completedAt` timestamp
   - Record `teamName`
   - Advance `currentStage` to next pending stage (or `null` if all complete)
4. Display: `Project '[name]' advanced to [next-stage]. Run '/project next' to continue.`

## project.json Schema

```json
{
  "name": "auth-overhaul",
  "description": "Replace session auth with JWT + OAuth2",
  "status": "active",
  "createdAt": "2026-03-06T10:00:00Z",
  "currentStage": "plan",
  "config": {
    "stages": ["brainstorm", "research", "plan", "build", "review"]
  },
  "stages": {
    "brainstorm": { "status": "completed", "teamName": "brainstorm-auth-ideas", "completedAt": "2026-03-06T11:00:00Z" },
    "research": { "status": "completed", "teamName": "research-eval-auth-libs", "completedAt": "2026-03-06T12:00:00Z" },
    "plan": { "status": "in_progress", "teamName": "plan-spec-auth-system", "startedAt": "2026-03-06T13:00:00Z" },
    "build": { "status": "pending" },
    "review": { "status": "pending" }
  }
}
```

**Stage statuses:** `pending` → `in_progress` → `completed` | `skipped`

## When to Reference

- **Spawn commands** (spawn-build, spawn-think, spawn-create): for `--project` flag handling, context injection, artifact routing
- **Shutdown protocol**: for Phase 3.5 context accumulation
- **Discovery interview**: for upstream context adaptation
- **Artifact protocol**: for project artifact routing
