---
name: bump-version
description: Synchronize version numbers across all four required locations for a plugin. Use when releasing a new plugin version.
allowed-tools: Read, Edit, Glob, Grep, Bash
---

# Bump Version Command

Atomically update a plugin's version across all four sync points, then verify consistency.

## Arguments

`$ARGUMENTS` should be: `<plugin-name> <new-version>`

Examples:
- `/bump-version gemini-cli 0.7.0`
- `/bump-version agent-teams 0.13.0`

If `$ARGUMENTS` is empty or incomplete, ask the user for the plugin name and new version.

## Steps

### Step 1: Validate Input

Parse `$ARGUMENTS` for plugin name and semantic version (X.Y.Z format).

If not provided, list available plugins by reading `.claude-plugin/marketplace.json` and ask the user to specify.

### Step 2: Read Current State

Read all four sync points in parallel:

1. `plugins/<plugin>/. claude-plugin/plugin.json` — the source of truth
2. `.claude-plugin/marketplace.json` — the marketplace entry
3. `docs/memory.md` — the plugin version table
4. All `SKILL.md` files under `plugins/<plugin>/skills/` (use Glob to find them)

Report the current version found at each location. Flag any existing mismatches.

### Step 3: Apply Version Updates

Update all four locations:

1. **plugin.json** — Edit the `"version"` field to the new version
2. **marketplace.json** — Edit the version for the matching plugin entry
3. **All SKILL.md files** — Edit the `version:` line in YAML frontmatter for each skill
4. **docs/memory.md** — Edit the version in the plugin table row

### Step 4: Verify

Run a Grep to confirm no stale version strings remain:

```bash
grep -rn "<old-version>" plugins/<plugin>/ .claude-plugin/marketplace.json docs/memory.md
```

Report results as a verification table:

```
## Version Bump: <plugin> <old> → <new>

| Location | Status |
|----------|--------|
| plugin.json | Updated |
| marketplace.json | Updated |
| skills/<name>/SKILL.md | Updated |
| docs/memory.md | Updated |

Verification: No stale version strings found.
```

If any stale strings are found, list them and offer to fix.

### Step 5: Summary

State: "Version bump complete. Ready to commit."

Do NOT commit automatically — the user will decide when to commit.
