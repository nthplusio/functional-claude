---
name: pm
description: Cache-first project status briefing -- shows what's in progress, what's next, and validates project context. Reads from local cache first, syncs only when stale. Use --refresh to force a full re-pull from the issue tracker.
allowed-tools: Bash, Read, Write
---

# /pm — Project Status

Run a cache-first project status briefing for the current repository.

## Flags

- **`--refresh`**: Force a full re-pull from the issue tracker, bypassing cache freshness. Use when you suspect the cache is out of date or after making changes directly in Linear/GitHub.

## Steps

### Step 1: Verify Project Context

Check that the active project was detected by the SessionStart hook. Look for the **Active Project** section in the system context.

If no project context is loaded:
- Check if `~/.claude/project-manager/projects.json` exists
- If not: "No project profiles configured. Run `/pm-setup` to register this project."
- If it exists but this repo isn't in it: "This repo isn't registered. Run `/pm-setup` to add it."

### Step 2: Check for --refresh Flag

If the user passed `--refresh`, pass this flag through to the pm-status skill so it skips cache reads and performs a full sync.

### Step 3: Deliver the Briefing

Use the `pm-status` skill to read cached state, classify freshness, run delta sync or full sync as needed, and format the output. The skill follows a cache-first flow:

1. **Cache hit + FRESH**: Display cached data immediately (no API calls)
2. **Cache hit + STALE**: Run delta sync (fetch only changes), then display
3. **Cache miss or EXPIRED**: Run full sync, then display
4. **--refresh**: Always run full sync regardless of cache state

### Step 4: Offer Next Action

After the briefing, ask what to work on or whether to create/pick up an issue.
