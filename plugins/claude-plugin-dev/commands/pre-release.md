---
name: pre-release
description: Pre-commit validation for plugin releases. Catches version mismatches, missing files, and common errors before the commit hook rejects.
allowed-tools: Read, Glob, Grep, Bash
---

# Pre-Release Validation

Run the same checks the pre-commit hook performs — but proactively, so you can fix issues before attempting a commit.

## Arguments

`$ARGUMENTS` should be: `<plugin-name>`

Example: `/pre-release gemini-cli`

If `$ARGUMENTS` is empty, detect which plugins have pending changes:

```bash
git diff --name-only HEAD; git diff --cached --name-only; git ls-files --others --exclude-standard plugins/
```

Extract unique plugin names from paths matching `plugins/<name>/` and validate all of them.

## Validation Checks

For each plugin being validated, run these checks:

### Check 1: Version Bump Detection

Read `plugins/<name>/.claude-plugin/plugin.json` for the current version.

Compare against the last committed version:

```bash
git show HEAD:plugins/<name>/.claude-plugin/plugin.json 2>/dev/null
```

If the version hasn't changed but there are non-trivial file changes (SKILL.md, agents/, hooks/, commands/, plugin.json), flag it:

> Version not bumped. The pre-commit hook will reject this commit.
> Run `/bump-version <name> <suggested-version>` to fix.

Suggest PATCH bump (increment last number) unless changes look like a new feature (new files added → suggest MINOR bump).

### Check 2: Version Sync

Verify all 4 sync points match:

1. `plugins/<name>/.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`
3. All `plugins/<name>/skills/*/SKILL.md` frontmatter `version:` fields
4. `docs/memory.md` plugin table row

List any mismatches with file path and found version.

### Check 3: Required Files

Verify these exist:
- `plugins/<name>/.claude-plugin/plugin.json` has name, version, description
- Every skill directory under `plugins/<name>/skills/` contains a `SKILL.md`
- If `plugins/<name>/hooks/` exists, verify `hooks.json` is present and valid JSON

### Check 4: SKILL.md Frontmatter

For each SKILL.md, verify:
- Has `---` delimited YAML frontmatter
- Contains `name:` field
- Contains `description:` field with trigger phrases (check for quoted strings)
- Contains `version:` field matching plugin version

### Check 5: Staged File Review

```bash
git diff --cached --name-only -- plugins/<name>/
```

List what will be committed. Flag any suspicious files:
- `.env`, credentials, or secret-looking files
- Very large files (>100KB)
- Binary files in unexpected locations

## Output Format

Present results as a validation report:

```
## Pre-Release: <plugin-name> v<version>

### Version
- [ ] or [x] Version bumped from <old> → <new>
- [ ] or [x] All 4 sync points match

### Structure
- [ ] or [x] plugin.json valid
- [ ] or [x] All skills have SKILL.md with frontmatter
- [ ] or [x] Hooks valid (if present)

### Files to Commit
<list of staged/modified files>

### Issues Found
<numbered list of issues, or "No issues found — ready to commit.">
```

If issues are found, suggest the fix command for each (e.g., `/bump-version`, specific Edit instructions).

If no issues: "All checks passed. Ready to commit."
