---
name: project-manager
description: Use this skill when the user says "project manager", "pm", "where are we", "what's in progress", "what should I work on next", "let's work on this project", "project status", "open issues", "what's next", or asks about Linear issues, GitHub PRs, or issue tracking for the current project. Also use proactively when the user describes work that doesn't appear to be tracked in Linear.
version: 0.5.1
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

