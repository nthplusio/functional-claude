---
name: pm
description: Project manager status briefing — shows what's in progress, what's next, and validates project context. Run at the start of a session to get oriented.
allowed-tools: Bash, Read, Write
---

# /pm — Project Status

Run a full project status briefing for the current repository.

## Steps

### Step 1: Verify Project Context

Check that the active project was detected by the SessionStart hook. Look for the **Active Project** section in the system context.

If no project context is loaded:
- Check if `~/.claude/project-manager/projects.json` exists
- If not: "No project profiles configured. Run `/pm-setup` to register this project."
- If it exists but this repo isn't in it: "This repo isn't registered. Run `/pm-setup` to add it."

### Step 2: Validate Linear MCP

Run a quick ping to confirm Linear MCP is available:
```
linear_get_viewer
```

If this fails:
- Warn: "⚠ Linear MCP is not responding. Showing cached state only."
- Read `~/.claude/project-manager/cache/<slug>/context.json` for last-known state
- Continue with cached data

### Step 3: Deliver the Briefing

Use the `pm-status` skill to query Linear and format the output.

### Step 4: Offer Next Action

After the briefing, ask what to work on or whether to create/pick up an issue.
