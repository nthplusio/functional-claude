---
task: 12
title: Decompose spawn-core.md → spawn-shared.md
owner: structural-editor
status: completed
---

# Task 12: Decompose spawn-core.md (P3)

## Result

214-line spawn-core.md decomposed to ~114-line spawn-shared.md. Original deleted. All references updated.

## Files Created

- `plugins/agent-teams/shared/spawn-shared.md` (~114 lines) — keeps Adaptive Sizing, Model Selection, Project Analysis Additions

## Files Modified

- `plugins/agent-teams/commands/spawn-build.md` — 3 references updated
- `plugins/agent-teams/commands/spawn-think.md` — 4 references updated
- `plugins/agent-teams/commands/spawn-create.md` — 3 references updated
- `plugins/agent-teams/shared/discovery-interview.md` — 1 reference updated
- `plugins/agent-teams/plugin-manifest.json` — updated entry (also fixed `planning-blueprints.md` → `planning-blueprints/`)

## Files Deleted

- `plugins/agent-teams/shared/spawn-core.md` (214 lines)

## Sections Removed

| Section | Lines | Disposition |
|---------|-------|-------------|
| Verbosity Control | ~51 lines (59-109) | Content below for command-editor (task 13) |
| Team Name Conventions | ~21 lines (111-131) | Content below for command-editor (task 13) |
| Dispatch Pattern | ~19 lines (133-151) | Deleted — describes obvious behavior |

## Sections Kept

| Section | Lines |
|---------|-------|
| Adaptive Sizing | ~39 lines |
| Model Selection | ~18 lines |
| Project Analysis Additions | ~57 lines |

---

## Content for Command-Editor (Task 13)

### Verbosity Control (inline into each command's output step)

```
Three verbosity levels control post-spawn output:

| Flag | Behavior | When to Use |
|---|---|---|
| `--quiet` | Suppress post-spawn narrative. Show only: team name, teammate count, and "Team spawned." | Experienced users, scripted workflows, chaining commands |
| `--normal` (default) | Standard output: team summary, phase overview, key shortcuts, pipeline context | Most interactive use |
| `--verbose` | Full output: everything in normal + detailed task list, dependency graph, model assignments, token budget | Debugging, learning, first-time users |

**Detecting Verbosity:**
1. Check `$ARGUMENTS` for `--quiet`, `--normal`, or `--verbose` flags
2. Strip the flag from `$ARGUMENTS` before passing to the discovery interview
3. Default to `--normal` if no flag is present

**Output Templates:**

Quiet Mode:
Team "[TEAM-NAME]" spawned with [N] teammates. Use Shift+Up/Down to interact.

Normal Mode (default):
Team "[TEAM-NAME]" created with [N] teammates:
- [Role 1], [Role 2], [Role 3]

**Phases:**
1. [Phase description]
2. [Phase description — YOUR TURN: feedback gate]
3. [Phase description]

Shortcuts: Shift+Up/Down (teammates), Ctrl+T (task list)
Pipeline: [downstream commands]
Artifacts: docs/teams/[TEAM-NAME]/

Verbose Mode (everything in normal, plus):
**Tasks:**
1. [Owner] Task description
2. [Owner] Task description (blocked by 1)
...
**Dependencies:** [visual graph or description]
**Models:** [per-teammate model assignments]
**Token budget:** discovery 10% | analysis 30% | feedback 10% | execution 40% | synthesis 10%
```

### Team Name Conventions (inline into each command's spawn step)

```
Generate team names using this pattern: `[command-prefix]-[mode-slug]-[topic-slug]`

| Command | Prefix | Example |
|---|---|---|
| spawn-build --mode feature | `feature` | `feature-user-auth` |
| spawn-build --mode debug | `debug` | `debug-login-timeout` |
| spawn-think --mode research | `research-[submode]` | `research-eval-auth-libs` |
| spawn-think --mode planning | `plan-[submode]` | `plan-roadmap-myapp` |
| spawn-think --mode review | `review` | `review-pr-142` |
| spawn-create --mode design | `design` | `design-settings-page` |
| spawn-create --mode brainstorm | `brainstorm` | `brainstorm-api-auth` |
| spawn-create --mode productivity | `productivity` | `productivity-ci-pipeline` |

Slug rules: lowercase, hyphen-separated, max 30 chars, strip "the/a/an/for/with/and", first 3-4 meaningful words.
```
