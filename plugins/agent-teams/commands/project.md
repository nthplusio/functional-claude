---
name: project
description: "Manage project pipelines — create, list, status, next stage, skip, and archive multi-stage projects that wrap related team spawns"
argument-hint: "<create|list|status|next|skip|archive> [name] [options]"
---

# Project Pipeline Management

Manage multi-stage projects that wrap related team spawns into a pipeline with shared, accumulating context.

## Subcommands

| Subcommand | Usage | Behavior |
|------------|-------|----------|
| `create` | `/project create <name> [--stages ...] [--description "..."]` | Create project directory, write project.json and context.md |
| `list` | `/project list` | Table of all projects with status |
| `status` | `/project status [name]` | Detailed view of a project's stages and context |
| `next` | `/project next [name]` | Suggest and confirm the next spawn command |
| `skip` | `/project skip [name] [stage]` | Mark a stage as skipped |
| `archive` | `/project archive [name]` | Set project status to archived |

## Instructions

1. Parse `$ARGUMENTS` to extract the subcommand (first word)
2. Route to the matching section below
3. If no subcommand or unrecognized, show the subcommand table above

---

## create

**Usage:** `/project create <name> [--stages brainstorm,research,plan,build,review] [--description "..."]`

### Steps

1. **Parse name** from arguments — kebab-case, max 30 chars, alphanumeric + hyphens only. If missing, ask: "What should this project be called? (kebab-case, e.g., `auth-overhaul`)"

2. **Parse `--stages`** if provided — comma-separated list of stage names. Validate each against the stage-to-command mapping in `${CLAUDE_PLUGIN_ROOT}/shared/project-context-protocol.md`. If invalid stage found, display error with valid options. Default: `["brainstorm", "research", "plan", "build", "review"]`

3. **Parse `--description`** if provided. If not, ask one question: "What's this project about? (1-2 sentences)"

4. **Create directory:** `docs/projects/<name>/`

5. **Write `docs/projects/<name>/project.json`:**
   ```json
   {
     "name": "<name>",
     "description": "<description>",
     "status": "active",
     "createdAt": "<ISO timestamp>",
     "currentStage": "<first stage>",
     "config": {
       "stages": ["<stage1>", "<stage2>", "..."]
     },
     "stages": {
       "<stage1>": { "status": "pending" },
       "<stage2>": { "status": "pending" }
     }
   }
   ```

6. **Write `docs/projects/<name>/context.md`:**
   ```markdown
   # Project: <name>

   <description>

   ---
   ```

7. **Create/update `docs/projects/README.md`** — if missing, create with header and table. If exists, append row:
   ```markdown
   # Projects

   | Project | Description | Current Stage | Status | Created |
   |---------|-------------|---------------|--------|---------|
   | [<name>](/<name>/project.json) | <description> | <first stage> | active | <date> |
   ```

8. **Display:**
   ```
   Project "<name>" created with [N] stages: [stage1, stage2, ...]
   Next: /project next <name>
   Artifacts: docs/projects/<name>/
   ```

---

## list

**Usage:** `/project list`

### Steps

1. Scan `docs/projects/*/project.json` using Glob
2. If no projects found, display: "No projects found. Create one with `/project create <name>`"
3. Read each `project.json` and display table:

```
| Project | Description | Current Stage | Status | Stages |
|---------|-------------|---------------|--------|--------|
| auth-overhaul | Replace session auth | plan (3/5) | active | ██████░░░░ |
| api-redesign | Modernize REST API | build (4/5) | active | ████████░░ |
```

Progress bar: `█` for completed/skipped, `▓` for in_progress, `░` for pending.

---

## status

**Usage:** `/project status [name]`

### Steps

1. If name not provided, scan for active projects. If exactly one, use it. If multiple, ask user to pick.
2. Read `docs/projects/<name>/project.json`
3. Display detailed view:

```
## Project: <name>
<description>

| # | Stage | Status | Team | Date |
|---|-------|--------|------|------|
| 1 | brainstorm | completed | brainstorm-auth-ideas | 2026-03-06 |
| 2 | research | completed | research-eval-auth-libs | 2026-03-06 |
| 3 | plan | in_progress | plan-spec-auth-system | 2026-03-06 |
| 4 | build | pending | — | — |
| 5 | review | pending | — | — |

Context: [word count] words across [N] stage summaries
Next: /project next <name>
```

4. If `context.md` has content, show a brief preview (first 3 lines of the most recent stage summary)

---

## next

**Usage:** `/project next [name]`

### Steps

1. Resolve project (same logic as `status` — default to sole active project)
2. Read `project.json` → find `currentStage` (first stage with `status: "pending"`)
3. If no pending stages, display: "All stages complete. Run `/project archive <name>` to archive."
4. Map stage to command using the stage-to-command table from `${CLAUDE_PLUGIN_ROOT}/shared/project-context-protocol.md`
5. Display and prompt:

```
Next stage: [stage] ([N] of [total])

Suggested command:
  /[command] --project <name> --mode [mode] <project description context>

Run this command? (confirm / adjust / skip stage)
```

6. If user confirms, execute the suggested command via Skill tool
7. If user says "skip", run `/project skip <name> <stage>`
8. If user adjusts, let them modify the command and run manually

---

## skip

**Usage:** `/project skip [name] [stage]`

### Steps

1. Resolve project name (default to sole active project if omitted)
2. If stage not provided, use `currentStage` from project.json
3. Validate stage exists and is `pending` or `in_progress`
4. Update `project.json`:
   - Set stage status to `"skipped"`
   - Add `skippedAt` timestamp
   - Advance `currentStage` to next pending stage
5. Append skip note to `context.md`:
   ```markdown
   ## [Stage Name] — [Date]
   **Status:** Skipped
   ```
6. Update `docs/projects/README.md` row
7. Display: `Stage "[stage]" skipped. Current stage: [next]. Run '/project next' to continue.`

---

## archive

**Usage:** `/project archive [name]`

### Steps

1. Resolve project name
2. Read `project.json` — warn if stages are still pending: "Project has [N] pending stages. Archive anyway?"
3. Update `project.json`: set `status` to `"archived"`, add `archivedAt` timestamp
4. Update `docs/projects/README.md` row status
5. Display: `Project "[name]" archived. Artifacts remain at docs/projects/<name>/`
