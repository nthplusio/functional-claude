---
name: plugin-status
description: Quick dashboard of all plugins — versions, sync status, and pending changes. Use at session start or before releases.
allowed-tools: Read, Glob, Grep, Bash
---

# Plugin Status Dashboard

Show a fast overview of all plugins in the marketplace with version sync status and pending git changes.

## Arguments

`$ARGUMENTS` is optional:
- No arguments: show all plugins
- Plugin name: show detailed status for that plugin only (e.g., `/plugin-status gemini-cli`)

## Steps

### Step 1: Read Sources

Read these files in parallel:
1. `.claude-plugin/marketplace.json` — all plugin entries
2. `docs/memory.md` — first 30 lines (plugin version table)

### Step 2: Check Git Status

Run via Bash:

```bash
git diff --name-only HEAD 2>/dev/null; echo "---STAGED---"; git diff --cached --name-only 2>/dev/null; echo "---UNTRACKED---"; git ls-files --others --exclude-standard plugins/ 2>/dev/null
```

### Step 3: Version Sync Check

For each plugin (or just the specified one):

1. Read `plugins/<name>/.claude-plugin/plugin.json` to get the source-of-truth version
2. Compare against the version in `marketplace.json`
3. Use Grep to check SKILL.md frontmatter versions:
   ```
   grep -rn "^version:" plugins/<name>/skills/
   ```
4. Check the memory.md table row for that plugin

### Step 4: Present Dashboard

Format output as:

```
## Plugin Status

| Plugin | Version | Sync | Pending Changes |
|--------|---------|------|-----------------|
| wezterm-dev | 0.7.11 | OK | — |
| agent-teams | 0.12.0 | OK | 2 modified |
| gemini-cli | 0.6.1 | MISMATCH | 1 staged |
```

Sync column values:
- **OK** — all 4 locations match
- **MISMATCH** — list which locations differ

Pending Changes column:
- Count of modified, staged, and untracked files under `plugins/<name>/`
- Show "—" if clean

### Step 5: Detail View (if plugin specified)

If a specific plugin was named in `$ARGUMENTS`, also show:
- All file paths with mismatched versions
- List of pending file changes with their status (modified/staged/untracked)
- Suggestion: "Run `/bump-version <name> <version>` to sync" if mismatched

Keep the output compact. This is a quick status check, not a deep analysis.
