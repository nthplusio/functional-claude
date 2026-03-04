---
name: project-manager
description: Use this skill when the user says "project manager", "pm", "where are we", "what's in progress", "what should I work on next", "let's work on this project", "project status", "open issues", "what's next", or asks about Linear issues, GitHub PRs, or issue tracking for the current project. Also use proactively when the user describes work that doesn't appear to be tracked in Linear.
version: 0.4.0
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
| Surfacing blockers (requested explicitly) | `pm-blockers` |

## Project Context

The `pm-session-start` hook has already injected the active project context into this session. Refer to the **Active Project** section at the top of the system context for:
- Repo name and GitHub user
- Linear team key
- Current branch

## Linear MCP Validation

At the start of any Linear-related operation, verify the MCP is available:

```
Use the linear MCP tool (e.g., linear_get_teams or linear_get_viewer) to confirm it responds.
```

If it fails:
- Warn: "⚠ Linear MCP is not responding. Working from cached state — changes will not sync until Linear is available."
- Continue using `~/.claude/project-manager/cache/<slug>/context.json` for last-known issue state

## Proactive Issue Suggestion

When the user describes work they're about to do, check whether it maps to an open Linear issue. If not, proactively suggest:

> "I don't see a Linear issue for this. Want me to create one?"

Then use the `pm-issues` skill to draft it with the appropriate template.

## Proactive PR Scope Awareness

During implementation, be aware of the growing diff size and scope. Proactively check in with the user at these points:

- **After completing the core change** — confirm the approach before continuing with tests and cleanup
- **When the diff crosses ~300 lines** — quick scope check, suggest splitting if warranted
- **When unexpected complexity appears** — ask whether to update the issue scope or split into sub-issues

These check-ins are gentle nudges, not blockers. The goal is to catch scope drift early rather than discovering it at PR review time. See the `pm-branches` skill for full sizing guidance.
