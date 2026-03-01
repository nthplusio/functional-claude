---
name: repo-sme
description: Manage GitHub repository SME sources — add, list, remove repos and query them directly
argument-hint: add <github-url> | list | remove <name> | ask <name> <question>
---

# /repo-sme

Manage locally-cloned GitHub repositories as Subject Matter Expert sources.

Parse `$ARGUMENTS` to dispatch on the first word.

---

## Dispatch Table

| First word | Action |
|------------|--------|
| `add` | Clone and register a GitHub repo |
| `list` | Show all registered repos |
| `remove` | Remove a repo from registry |
| `ask` | Query a repo via the SME agent |
| *(none)* | Show usage help |

---

## Constants

```
REGISTRY_DIR  = ~/.claude/repo-sme/
REGISTRY_FILE = ~/.claude/repo-sme/registry.json
REPOS_DIR     = ~/.claude/repo-sme/repos/
```

---

## `add <github-url>`

**Arguments:** `$ARGUMENTS` = `add https://github.com/owner/repo`

### Steps

1. **Validate the URL**
   - Must start with `https://github.com/`
   - Parse `owner` and `repoName` from the path segments
   - If invalid, show: `Error: URL must be a GitHub URL (https://github.com/owner/repo)`

2. **Load registry** — read `~/.claude/repo-sme/registry.json`
   - If missing: treat as `{ "repos": [] }`

3. **Check for duplicates**
   - If a repo with the same URL already exists: show its name and path, exit

4. **Derive a default name**
   - Use `repoName` as the default (e.g., `obsidian-api` from the URL)
   - If that name is already taken in the registry, append `-2`, `-3`, etc.

5. **Clone the repository**
   ```bash
   mkdir -p ~/.claude/repo-sme/repos/<owner>/
   git clone --depth 50 <url> ~/.claude/repo-sme/repos/<owner>/<repoName>/
   ```
   Show progress. If clone fails, report the error and stop.

6. **Write to registry**
   Add entry:
   ```json
   {
     "name": "<repoName>",
     "url": "<url>",
     "localPath": "/home/user/.claude/repo-sme/repos/<owner>/<repoName>",
     "addedAt": "<ISO timestamp>",
     "lastPulledAt": "<ISO timestamp>"
   }
   ```
   Save `registry.json` with pretty-print (2 spaces).

7. **Confirm**
   ```
   ✓ Registered obsidian-api
     Clone: ~/.claude/repo-sme/repos/obsidianmd/obsidian-api
     Tip: Ask questions with /repo-sme ask obsidian-api <question>
          or just ask me about the Obsidian API — I'll query the SME automatically.
   ```

---

## `list`

**Arguments:** `$ARGUMENTS` = `list`

### Steps

1. Read `~/.claude/repo-sme/registry.json`
   - If missing or empty repos array: show `No repos registered yet. Use /repo-sme add <github-url> to add one.`

2. For each repo, run these Bash commands:
   ```bash
   git -C <localPath> log -1 --format="%ci"        # last commit date
   git -C <localPath> rev-list --count HEAD         # total commit count
   git -C <localPath> branch --show-current         # current branch
   ```
   If the clone directory doesn't exist, show status `missing`.

3. Display as a formatted table:

   ```
   SME Repositories

   NAME            URL                                         BRANCH   COMMITS  LAST UPDATED          STATUS
   obsidian-api    https://github.com/obsidianmd/obsidian-api  master   142      2026-02-10 14:23:01   ok
   ```

   If status is `missing`, highlight it and suggest re-adding.

---

## `remove <name>`

**Arguments:** `$ARGUMENTS` = `remove obsidian-api`

### Steps

1. Read registry. If the name isn't found, show:
   ```
   Error: 'obsidian-api' not found.
   Registered repos: repo1, repo2
   ```

2. Use AskUserQuestion to confirm:
   - Question: "How do you want to remove 'obsidian-api'?"
   - Options:
     - "Registry only" — remove from registry, keep local clone files
     - "Registry + files" — remove from registry AND delete the local clone directory
     - "Cancel" — do nothing

3. Remove from registry array. Save updated `registry.json`.

4. If "Registry + files": run `rm -rf <localPath>` (confirm the path is inside `~/.claude/repo-sme/repos/` before deleting).

5. Confirm:
   ```
   ✓ Removed obsidian-api from registry.
   Local files deleted: ~/.claude/repo-sme/repos/obsidianmd/obsidian-api
   ```
   (Omit line 2 if registry-only.)

---

## `ask <name> <question...>`

**Arguments:** `$ARGUMENTS` = `ask obsidian-api What is TFile?`

### Steps

1. Parse: first word after `ask` = `name`, remainder = `question`

2. Read registry. If `name` not found:
   ```
   Error: 'obsidian-api' not registered.
   Registered repos: repo1, repo2
   Use /repo-sme list to see all repos.
   ```

3. Check that `localPath` exists on disk. If missing:
   ```
   Error: Clone not found at <localPath>.
   Try removing and re-adding: /repo-sme remove <name> then /repo-sme add <url>
   ```

4. Spawn the SME agent via the Task tool:
   ```
   subagent_type: repo-sme:repo-sme-expert
   prompt: |
     Repository: <name>
     Path: <localPath>
     Question: <question>
   ```

5. Return the SME agent's answer directly to the user.

---

## No Subcommand (usage help)

If `$ARGUMENTS` is empty or unrecognized, show:

```
/repo-sme — Repository Subject Matter Expert

Register GitHub repositories as local SME sources and query them for
grounded, citation-backed answers about external library APIs.

COMMANDS

  /repo-sme add <github-url>         Clone and register a repo
  /repo-sme list                      Show all registered repos
  /repo-sme remove <name>             Remove a repo from registry
  /repo-sme ask <name> <question>     Query a repo directly

EXAMPLES

  /repo-sme add https://github.com/obsidianmd/obsidian-api
  /repo-sme list
  /repo-sme ask obsidian-api What is the TFile interface?
  /repo-sme remove obsidian-api

AUTO-TRIGGERING

  Once a repo is registered, I will automatically query it when you ask
  about that library's API during your session. No need to use /repo-sme ask
  explicitly — just ask your question naturally.

DATA STORAGE

  Registry:  ~/.claude/repo-sme/registry.json
  Clones:    ~/.claude/repo-sme/repos/<owner>/<repo>/
```
