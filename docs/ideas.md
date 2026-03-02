# Plugin & Feature Ideas

Captured improvement opportunities and plugin concepts. Sources include the hook ecosystem article by Civil Learning (Medium, Jan 2026) and the official Claude Code hooks guide.

---

## Hook Events Not Yet Used in This Marketplace

Most plugins here rely on `SessionStart`, `PreToolUse`, and `Stop`. Several hook events are completely untapped — each represents a plugin opportunity.

| Hook Event | Used? | Opportunity |
|------------|-------|-------------|
| `UserPromptSubmit` | No | Inject skill activation, validate prompts before Claude sees them |
| `PermissionRequest` | No | Auto-approve a configurable allowlist of safe commands |
| `Notification` | No | Cross-platform desktop notifications when Claude needs input |
| `ConfigChange` | No | Audit settings changes with timestamps |
| `PreCompact` | No | Save state before context compaction, backup transcript |
| `SessionEnd` | No | Cleanup temp files, write session summaries |
| `SubagentStart` | No | Log/audit which agents are spawned |
| `SubagentStop` | No | Validate subagent output before it returns |
| `TeammateIdle` | No | Slack/webhook notifications for agent team events |
| `TaskCompleted` | No | Verify tasks were actually completed before marking done |
| `WorktreeCreate` | No | Custom worktree init (install deps, set env vars, copy secrets) |
| `WorktreeRemove` | No | Cleanup worktree artifacts, post-merge summaries |
| `PostToolUseFailure` | No | Log failures, retry logic, error pattern detection |

---

## New Plugin Ideas

### `auto-format` — PostToolUse code formatter

**Problem:** Claude writes code, you still have to format it. Asking Claude to run prettier is a ritual that breaks flow.

**Idea:** A `PostToolUse` hook (matcher: `Edit|Write`) that detects the file extension and runs the appropriate formatter — no config required. Ecosystem detection like `code-quality` does: if `prettier` config exists use it, else fall back to defaults.

```json
{ "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "node format-on-write.js" }] }] }
```

- Formatters: `prettier` (JS/TS/CSS), `gofmt` (Go), `black` (Python), `rustfmt` (Rust), `shfmt` (bash)
- Reads file extension from `tool_input.file_path` via stdin JSON
- Silent on success, stderr on failure (never blocks)
- Config: opt-out list of glob patterns to skip

---

### `smart-approve` — PermissionRequest auto-approver

**Problem:** Clicking "approve" on `npm test` for the 400th time is a ritual. Every approve dialog is a context switch.

**Idea:** A `PermissionRequest` hook with a configurable allowlist of safe command patterns. Responds with `{"decision": "approve"}` automatically.

```json
// Returns {"decision": "approve"} for matching commands
{ "PermissionRequest": [{ "matcher": "Bash(npm test*|pnpm test*|cargo test*|bun test*)", "hooks": [...] }] }
```

- Ships with a conservative default allowlist (test runners, lint, type check)
- User extends via `.local.md` config: `ALLOW_PATTERNS=...`
- Anything not on the list still gets a real permission dialog
- Skill explains how to audit and customize the allowlist

---

### `session-context` — SessionStart context injector

**Problem:** Every Claude session starts cold. You know what's in flight. Claude doesn't.

**Idea:** A `SessionStart` hook that injects a dynamic context summary before any prompt:

```bash
## Current State
git status --short           # dirty files
git log --oneline -5         # recent commits
grep -r 'TODO:' src/ | head -5  # open TODOs
```

- Also injects on `compact` matcher — re-establishes context after compaction loss
- Optional: reads a `.claude-context.md` file from project root for static context
- Optional: pulls open GitHub issues or PR status via `gh` CLI

---

### `test-guardian` — agent-based Stop hook

**Problem:** Claude finishes and the tests are broken. You find out when you try to commit.

**Idea:** An agent-based `Stop` hook that runs the test suite and blocks Claude from "finishing" if tests fail.

```json
{ "Stop": [{ "hooks": [{ "type": "agent", "prompt": "Run the test suite. If tests fail, return {\"ok\": false, \"reason\": \"<failures>\"} so Claude fixes them." }] }] }
```

- Detects test runner from `package.json`, `Cargo.toml`, `pyproject.toml`
- Uses `stop_hook_active` check to avoid infinite loops
- Configurable: off by default, opt-in per project via `.local.md`
- Lighter alternative: prompt-based hook that just checks if Claude mentioned "test" in its response

---

### `notifications` — Notification hook plugin

**Problem:** You switch windows while Claude works. You don't know when it needs you.

**Idea:** Cross-platform desktop notifications via the `Notification` event.

```bash
# Linux: notify-send 'Claude Code' 'Needs your attention'
# macOS: osascript -e 'display notification "..." with title "Claude Code"'
# Windows: powershell toast
```

- Platform detection in the hook script
- Matcher options: `permission_prompt` (most useful), `idle_prompt`, or all (`*`)
- Skill explains how to customize notification text
- Could also support webhooks (Slack, Discord) via HTTP hook type

---

### `session-logger` — session activity recorder

**Problem:** No persistent record of what Claude did in a session. PostToolUseFailure events are invisible.

**Idea:** A suite of hooks that maintain a rolling `~/.claude/session-log.jsonl`:

- `PostToolUse` (matcher: `Bash`) → log every command run
- `PostToolUseFailure` → log errors with tool name and input
- `SessionEnd` → append session summary (files changed, commands run, duration)
- Provides a `/session-log` command to tail or search the log

Could integrate with the existing `session-insights` plugin's JSONL parsing.

---

### `file-guardian` — PreToolUse file protector

**Problem:** Claude occasionally tries to edit `.env`, `package-lock.json`, or other files it shouldn't touch.

**Idea:** A `PreToolUse` (matcher: `Edit|Write`) hook that blocks edits to protected file patterns and explains why.

```bash
PROTECTED=(".env" ".env.*" "package-lock.json" "yarn.lock" ".git/")
# Exit 2 with reason → Claude receives feedback and adjusts
```

- Ships with a sensible default blocklist
- User adds patterns via `.local.md`: `PROTECT_PATTERNS=...`
- Complements `code-quality` plugin (which validates commit content)
- Also useful: block writes to `node_modules/`, build output dirs

---

### `compaction-recovery` — context resurrection after compaction

**Problem:** After context compaction, Claude loses all session memory. Important decisions, constraints, and progress evaporate.

**Idea:** Two-hook strategy:

1. `PreCompact` — capture current state to a file before compaction happens
2. `SessionStart` (matcher: `compact`) — re-inject that file after compaction

```bash
# PreCompact: writes ~/.claude/pre-compact-context.md
# SessionStart[compact]: cat ~/.claude/pre-compact-context.md → systemMessage
```

- Pre-compact capture: git status, active tasks from `~/.claude/tasks/`, open files, last 5 messages summary
- Makes compaction nearly transparent from a context continuity standpoint
- Could use a Claude API call (haiku) to summarize what to preserve

---

### `worktree-setup` — WorktreeCreate initializer

**Problem:** When an agent spawns an isolated worktree, it starts without dependencies installed, env vars set, or project-specific setup done.

**Idea:** A `WorktreeCreate` hook that runs setup scripts in the new worktree before the agent starts working.

```bash
# In the new worktree:
cp ../.env.local .env.local  # Copy secrets (never committed)
bun install                  # Install deps
echo "Worktree ready at $WORKTREE_PATH"
```

- Reads a `.claude/worktree-setup.sh` from project root
- Falls back to auto-detecting package manager and running install
- Pairs with `WorktreeRemove` to clean up artifacts

---

### `task-verifier` — TaskCompleted prompt hook

**Problem:** In agent teams, teammates mark tasks complete too early. The team lead can't always tell.

**Idea:** A `TaskCompleted` hook (prompt-based) that asks Claude to verify the task was actually done before accepting the completion.

```json
{ "type": "prompt", "prompt": "Review the task description and the work done. Did the teammate actually complete all acceptance criteria? If not, return {\"ok\": false, \"reason\": \"what's missing\"}." }
```

- Lives inside the `agent-teams` plugin or as a standalone `task-verifier` plugin
- Configurable: only activates for specific team types
- Could be agent-based for tasks requiring code verification (run tests, check file exists)

---

### `bash-history` — Claude command history

**Problem:** No record of what shell commands Claude has run. Hard to audit or reproduce.

**Idea:** A simple `PostToolUse` (matcher: `Bash`) hook that appends to `~/.claude/bash-history.log`.

```bash
jq -r '"[\(.timestamp // "now")] \(.tool_input.command)"' >> ~/.claude/bash-history.log
```

- Ultra-lightweight: single line hook, no script
- Searchable with standard `grep`
- `/bash-history` command to tail the log or search by project
- Pairs with `session-logger` or could be a feature of it

---

## Improvements to Existing Plugins

### `repo-sme`
- **Non-GitHub sources**: Support `https://gitlab.com/`, `https://codeberg.org/`, and bare `git clone` URLs
- **Monorepo support**: `/repo-sme add <url> --subdir packages/ui` to register a subdirectory
- **Search scope**: Let the SME search across *all* registered repos when no name is specified
- **Private repos**: Support SSH clone URLs with key-based auth
- **Update command**: `/repo-sme update [name]` to force a pull outside of SessionStart

### `agent-teams`
- **SubagentStart/Stop hooks**: Log which agents get spawned, how long they run, what tools they use
- **TeammateIdle hook**: Fire a webhook/Slack notification when a teammate goes idle waiting
- **Task completion verification**: TaskCompleted prompt hook to validate before accepting completion
- **Worktree isolation**: WorktreeCreate hook to set up isolated environments per teammate

### `session-insights`
- **PreCompact hook**: Save critical session context before compaction so analysis survives it
- **SessionEnd hook**: Auto-save a session summary to `~/.claude/session-summaries/` without user intervention
- **Real-time mode**: PostToolUse hook to update live session stats dashboard while working

### `claude-plugin-dev`
- **HTTP hook type support**: Document how to write `type: "http"` hooks for external integrations
- **Agent-based hook**: Add a Stop hook that verifies the plugin being developed passes pre-release checks automatically
- **WorktreeCreate hook**: When testing a plugin in isolation, auto-setup the test worktree

### `code-quality`
- **PostToolUseFailure hook**: Log lint failures to help diagnose which patterns Claude keeps getting wrong
- **Stop hook (prompt-based)**: Before stopping, ask if all modified files pass quality checks

### `obsidian-dev`
- **Type resolution via repo-sme**: Integration guide — pair with `repo-sme add obsidian-api` for live source lookup

---

## Hook Patterns Worth Standardizing

These patterns keep appearing and could become shared conventions in the plugin ecosystem:

### The "fail open" pattern
All session hooks should catch errors and emit `{"continue": true}` — never block a session. Already used in `repo-sme`, `tabby-dev`. Should be explicitly documented.

### The `.local.md` config pattern
Using `.local.md` to let users opt into aggressive behaviors (auto-approve, strict test-guardian) without affecting shared project settings. Could be more consistently documented across plugins.

### The `systemMessage` injection pattern
SessionStart hooks can return `{"continue": true, "systemMessage": "..."}` to inject context. Currently used in `repo-sme`. Pattern is powerful but underused.

### The compact-specific SessionStart matcher
`"matcher": "compact"` on SessionStart fires only after compaction — useful for context recovery without re-running heavy logic on normal session starts.

---

## Sources

- [Claude Code Hooks: 5 Automations That Eliminate Developer Friction](https://medium.com/coding-nexus/claude-code-hooks-5-automations-that-eliminate-developer-friction-7b6ddeff9dd2) — Civil Learning, Coding Nexus, Jan 2026
- [Automate workflows with hooks — Claude Code Docs](https://code.claude.com/docs/en/hooks-guide)
