---
name: project-manager
description: Use this skill when the user says "project manager", "pm", "where are we", "what's in progress", "what should I work on next", "let's work on this project", "project status", "open issues", "what's next", or asks about Linear issues, GitHub PRs, or issue tracking for the current project. Also use proactively when the user describes work that doesn't appear to be tracked in Linear, when starting new work on main/master, or when branch naming suggests untracked work.
version: 0.9.1
---

# Project Manager

Central routing skill for project management workflows. Delegates to focused skills based on the task.

## Skill Routing

| Task | Skill to use |
|------|-------------|
| Session briefing, what's in progress, what's next | `pm-status` |
| Create, update, or close a Linear issue | `pm-issues` |
| Create a branch or write a PR description | `pm-branches` |
| Changing direction mid-feature, pivoting | `pm-pivot` |

## Project Context

The `pm-session-start` hook has already injected the active project context into this session. Refer to the **Active Project** section at the top of the system context for:
- Repo name and GitHub user
- Linear team key
- Current branch

## Linear MCP Validation

At the start of any Linear-related operation, verify the MCP is available:

```
Use the Linear MCP (e.g., get_user { query: "me" } or list_teams) to confirm it responds.
```

If it fails:
- Warn: "⚠ Linear MCP is not responding. Working from cached state — changes will not sync until Linear is available."
- Continue using `~/.claude/project-manager/cache/<slug>/context.json` for last-known issue state

## Proactive Issue Suggestion

When the user describes work they're about to do, check whether it maps to an open Linear issue. If not, proactively suggest:

> "I don't see a Linear issue for this. Want me to create one?"

Then use the `pm-issues` skill to draft it with the appropriate template.

## Proactive Work Tracking

At session start, evaluate the current branch and suggest appropriate actions:

### On main/master
The user is about to work without a feature branch. Before any code changes:
1. Ask what they're working on
2. Search Linear for a matching issue, or suggest creating one via `pm-issues`
3. Once an issue exists, suggest creating a branch via `pm-branches` (e.g., `feat/ENG-42-description`)

> "You're on main. Let's identify or create a Linear issue first, then set up a branch."

### On a feature branch without a Linear ID
The branch name doesn't contain a Linear issue ID (e.g., `feat/add-auth` instead of `feat/ENG-42-add-auth`):
- Ask if this work relates to an existing Linear issue
- If yes, note the association for session tracking
- If no, suggest creating one via `pm-issues`

> "This branch doesn't have a Linear ID. Is it related to an existing issue?"

### On a properly named feature branch
The branch contains a Linear ID (e.g., `feat/ENG-42-auth-middleware`):
- Confirm the active issue: "Working on ENG-42"
- No further prompting needed — the session-end hook will track progress automatically

