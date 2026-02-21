---
name: publish-marketplace
description: Validate, commit, and push plugin changes to the marketplace. Runs pre-release checks, stages files, creates a release commit, and pushes to remote.
argument-hint: "[plugin-name] [--skip-push]"
allowed-tools: Read, Edit, Glob, Grep, Bash
---

# Publish Marketplace

End-to-end workflow: validate changed plugins, stage files, commit, and push to make plugins available in the marketplace. Wraps `/pre-release` validation + git commit + git push into a single command.

## Arguments

`$ARGUMENTS` is optional:
- No arguments: detect and publish all plugins with pending changes
- Plugin name: publish only that plugin (e.g., `/publish-marketplace agent-teams`)
- `--skip-push`: commit but don't push (for batching multiple publishes)

## Steps

### Step 1: Detect Changed Plugins

If no plugin specified in `$ARGUMENTS`, detect which plugins have pending changes:

```bash
git diff --name-only HEAD; git diff --cached --name-only; git ls-files --others --exclude-standard plugins/
```

Extract unique plugin names from paths matching `plugins/<name>/`. If no changes found, report "Nothing to publish" and stop.

### Step 2: Pre-Release Validation

For each changed plugin, run the same checks as `/pre-release`:

1. **Version bump check** — Read `plugins/<name>/.claude-plugin/plugin.json` and compare against last committed version via `git show HEAD:plugins/<name>/.claude-plugin/plugin.json`. If code changes exist but version is not bumped, stop and tell the user:

   > Version not bumped for `<name>`. Run `/bump-version <name> <suggested-version>` first.

   Suggest PATCH for fixes, MINOR for new features/files.

2. **Version sync check** — Verify the 4 sync points match:
   - `plugins/<name>/.claude-plugin/plugin.json`
   - `.claude-plugin/marketplace.json`
   - All `plugins/<name>/skills/*/SKILL.md` frontmatter
   - `docs/memory.md` plugin table

   Note: The pre-commit hook auto-syncs from plugin.json, so minor mismatches will be resolved at commit time. Only flag if plugin.json itself wasn't bumped.

3. **Required files check** — Verify plugin.json has name/version/description, every skill directory has a SKILL.md, and hooks.json is valid JSON if present.

If any check fails, stop and report issues with fix commands. Do NOT proceed to commit.

### Step 3: Present Change Summary

Show the user what will be published:

```
## Publish Summary

| Plugin | Version | Change Type | Files |
|--------|---------|-------------|-------|
| agent-teams | 0.15.0 → 0.15.1 | PATCH | 4 modified |
| gemini-cli | 0.6.4 | (unchanged) | 2 modified (refs only) |

### Files to Stage
- plugins/agent-teams/commands/spawn-think.md (modified)
- plugins/agent-teams/shared/planning-blueprints.md (new)
- ...

Proceed with commit and push?
```

Use AskUserQuestion to confirm before proceeding. Include options:
- **Publish** (Recommended) — Stage, commit, and push
- **Commit only** — Stage and commit, but don't push yet
- **Cancel** — Stop without committing

### Step 4: Stage Files

Stage all changed files for the detected plugins. Be specific — stage by plugin directory:

```bash
git add plugins/<name>/
```

Also stage the marketplace sync files that the pre-commit hook may update:
```bash
git add .claude-plugin/marketplace.json docs/memory.md
```

Do NOT use `git add -A` or `git add .` — only stage plugin-related files.

### Step 5: Commit

Build a commit message from the change summary:

**Single plugin:**
```
<type>(<plugin-name>): <brief description> (v<version>)
```

**Multiple plugins:**
```
release: publish <plugin-1> v<version>, <plugin-2> v<version>

- <plugin-1>: <brief change description>
- <plugin-2>: <brief change description>
```

Type should be inferred from changes:
- `feat` — new files (skills, agents, commands, shared/)
- `fix` — modifications to existing files
- `refactor` — restructuring without behavior change
- `docs` — reference/documentation-only changes
- `release` — multiple plugins or version-only bumps

Append the co-author line:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Use a HEREDOC for the commit message to preserve formatting.

### Step 6: Push (unless --skip-push)

If the user chose "Publish" and `--skip-push` is not set:

```bash
git push
```

If pushing to `main`, verify the branch name first and confirm with the user:
> Pushing directly to `main`. Confirm?

### Step 7: Report

Show the final result:

```
## Published

| Plugin | Version | Status |
|--------|---------|--------|
| agent-teams | 0.15.1 | Pushed to origin/main |

Commit: <short-hash> <message>

Users can install with:
/plugin marketplace add nthplusio/functional-claude
/plugin install <name>@functional-claude
```

If `--skip-push` was used or user chose "Commit only":
```
Committed locally. Run `git push` when ready.
```

## Error Handling

- **Pre-commit hook failure**: The version bump hook may reject the commit. If this happens, read the rejection reason, fix the issue (usually run `/bump-version`), and retry. Do NOT use `--no-verify`.
- **Push failure**: If push fails (behind remote, auth error), report the error and suggest `git pull --rebase` or checking credentials.
- **Merge conflicts**: Do not attempt to resolve automatically. Report the conflict and stop.
