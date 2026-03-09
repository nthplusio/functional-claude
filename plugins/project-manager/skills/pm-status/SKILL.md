---
name: pm-status
description: Use this skill when the user asks "where are we", "what's in progress", "what should I work on next", "project status", "catch me up", or "what's open". Provides a concise session briefing with in-progress issues and next suggested work. Do NOT include past session history unless the user explicitly asks.
version: 0.7.0
---

# PM Status Briefing

Deliver a concise, actionable briefing of current project state.

## Step 1: Confirm Project Context

Check the injected **Active Project** context for repo, Linear workspace, Linear team key, Linear project (if set), and gh user. If missing, prompt the user to run `/pm-setup`.

## Step 2: Query Linear for Current State

Use the Linear MCP to fetch issues assigned to the current user:

1. Get the current user:
   ```
   get_user { query: "me" }
   ```

2. Fetch in-progress issues assigned to me (scoped to project if configured):
   ```
   list_issues {
     assignee: "me",
     state: "started",
     team: "<team_key>",
     project: "<project_name>"   // only if linear_project_id is set
   }
   ```
   If no `linear_project_id` is configured, omit the project filter — query is team-scoped.

3. Fetch the top suggested next issues (unstarted, ordered by priority):
   ```
   list_issues {
     state: "unstarted",
     team: "<team_key>",
     project: "<project_name>",   // only if linear_project_id is set
     limit: 3
   }
   ```

If Linear MCP fails: warn and display cached state from `~/.claude/project-manager/cache/<slug>/context.json`.

## Step 3: Format the Briefing

Output format (keep it tight — no padding, no extra explanation):

```
Project: <displayName> · <org/repo> · gh: <gh_user> · <linear_workspace> / <linear_team_key> · <linear_project_name if set>

IN PROGRESS
  <ID> · <title> (<priority label>)
  <ID> · <title>

UP NEXT
  <ID> · <title> (<priority label>)
  <ID> · <title>
```

Rules:
- Show at most 5 in-progress issues
- Show at most 3 suggested next issues
- Priority labels: P0 = Critical, P1 = Urgent, P2 = Medium, P3 = Low
- Do NOT show closed or cancelled issues
- Do NOT show other team members' work unless asked
- Do NOT summarize past sessions unless explicitly requested

## Step 4: Offer Next Action

After the briefing, offer:
> "Want to pick up [top suggested issue], start something new, or is there a specific issue to look at?"
