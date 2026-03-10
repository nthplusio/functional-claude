# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Multi-plugin marketplace architecture with composable skill-based plugins

**Key Characteristics:**
- Plugin-based extensibility with no monolithic core
- Skill-driven organization within each plugin (focused, reusable topic modules)
- Hook-based middleware layer for cross-cutting concerns (version validation, security, workflow gates)
- Command-driven user interactions with persistent agent backends
- Version synchronization across four distributed points (critical coordination requirement)

## Layers

**Marketplace Layer:**
- Purpose: Central registry and distribution point for all plugins
- Location: `.claude-plugin/marketplace.json`
- Contains: Plugin manifest with name, description, version, and source path
- Depends on: Individual plugin manifests at `plugins/<name>/.claude-plugin/plugin.json`
- Used by: Claude Code plugin loader on marketplace install

**Plugin Layer:**
- Purpose: Encapsulated features with skills, agents, commands, and hooks
- Location: `plugins/<plugin-name>/`
- Contains: Skills (SKILL.md files), agents (AGENT.md files), commands (CMD.md files), hooks (hooks.json and JS handlers)
- Depends on: Marketplace for installation; other plugins may depend on this plugin's skills
- Used by: Claude Code session loading, marketplace registry

**Skill Layer:**
- Purpose: Topic-focused knowledge modules with YAML frontmatter metadata
- Location: `plugins/<name>/skills/<skill-name>/SKILL.md`
- Contains: YAML frontmatter (name, description, version), markdown content, reference subdirectories
- Depends on: No external dependencies; skills are self-contained
- Used by: Agent prompts, command documentation, user-facing help

**Agent Layer:**
- Purpose: Autonomous subagents with specific tools, models, and behavioral rules
- Location: `plugins/<name>/agents/<agent-name>.md`
- Contains: YAML frontmatter (name, description, tools list, model, color), markdown system prompt
- Depends on: Referenced skills for context; task-blocking protocol enforced by CLAUDE.md
- Used by: User invocations or spawn commands; agents delegate to other agents

**Command Layer:**
- Purpose: User-invocable slash commands with step-by-step workflows
- Location: `plugins/<name>/commands/<cmd-name>.md`
- Contains: YAML frontmatter (name, description, allowed-tools), markdown steps with $ARGUMENTS substitution
- Depends on: Skills for reference documentation; may invoke agents
- Used by: Claude Code slash command parser

**Hook Layer:**
- Purpose: Middleware for intercepting tool calls and enforcing policies
- Location: `.claude/hooks/` (root) and `plugins/<name>/hooks/` (per-plugin)
- Contains: `hooks.json` (configuration) and executable JS handlers (PreToolUse, Stop, SessionStart matchers)
- Depends on: Parsed tool commands and stdin JSON
- Used by: Claude Code session runtime; fires before/after tool execution

## Data Flow

**Plugin Installation Flow:**

1. User runs `/plugin marketplace add nthplusio/functional-claude`
2. Claude Code reads `.claude-plugin/marketplace.json`
3. Marketplace lists all plugins with versions and paths
4. For selected plugin, reads `plugins/<name>/.claude-plugin/plugin.json` for metadata
5. Plugin loader recursively discovers and caches skills, agents, commands in `.cache/`
6. Hooks register into `.claude/settings.json` `enabledPlugins` section

**Version Synchronization Flow:**

1. Developer bumps version in `plugins/<name>/.claude-plugin/plugin.json` (source of truth)
2. On git commit, `PreToolUse` hook (`.claude/hooks/check-version-bump.js`) fires
3. Hook auto-syncs version to three other locations:
   - `plugins/<name>/skills/*/SKILL.md` (all YAML frontmatter)
   - `.claude-plugin/marketplace.json` (plugin entry)
   - `docs/memory.md` (plugin table)
4. If code changes detected but plugin.json version NOT bumped, hook denies commit
5. Hook stages synced files for commit

**Skill Resolution Flow:**

1. Agent/command markdown references skill by path: `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`
2. Claude Code expands `${CLAUDE_PLUGIN_ROOT}` at load time to actual plugin directory
3. Skill content loaded into context; YAML frontmatter fields (version, name) parsed
4. Multiple skills can be composed into single agent/command prompt

**Task Execution Flow (agent-teams):**

1. Agent workflow defines task list with blockedBy dependencies
2. `TaskList` call returns all tasks and dependency graph
3. Agent checks task.blockedBy before claiming work
4. When blocked tasks complete, dependent tasks unblock
5. Agent uses `TaskUpdate` to record progress in task description
6. On context compaction, agent resumes by reading task descriptions

**Hook Interception Flow:**

1. User tool call (Read, Edit, Bash, etc.) captured by Claude Code runtime
2. PreToolUse hooks evaluated against tool name matcher regex
3. If matcher fires, hook command executed with JSON tool_input on stdin
4. Hook handler decides: allow/deny with optional reason
5. Stop hooks run after tool execution completes (no permission decision)
6. SessionStart hooks run when plugin loads (initialization)

**State Management:**

- **Plugin Cache:** `.cache/` directories (gitignored) store compiled skill/agent/command metadata
- **Version State:** Distributed across 4 files; hook keeps in sync atomically
- **Hook State:** Stored in `.claude/settings.json` `enabledPlugins` and root hook config
- **Task State:** Stored in task descriptions (`docs/teams/<team>/tasks/task-{N}-{role}.md`)
- **Team Documentation:** `docs/teams/`, `docs/plans/`, `docs/retrospectives/` for team workflows

## Key Abstractions

**Plugin Manifest:**
- Purpose: Declares plugin identity, version, and marketplace presence
- Examples: `plugins/<name>/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Pattern: JSON with name, version (semantic), description fields

**Skill:**
- Purpose: Self-contained knowledge module on specific topic
- Examples: `plugins/agent-teams/skills/team-blueprints/SKILL.md`, `plugins/claude-plugin-dev/skills/hook-development/SKILL.md`
- Pattern: YAML frontmatter + markdown; versioned independently; discoverable by name

**Agent:**
- Purpose: Autonomous specialized worker with constrained tools and behavioral rules
- Examples: `plugins/agent-teams/agents/team-architect.md`, `plugins/claude-plugin-dev/agents/agent-creator.md`
- Pattern: YAML frontmatter (name, tools, model, color) + markdown system prompt; referenced by spawn commands

**Command:**
- Purpose: Sequential step-based workflow invoked by user via slash syntax
- Examples: `plugins/claude-plugin-dev/commands/bump-version.md`, `plugins/claude-plugin-dev/commands/create-plugin.md`
- Pattern: YAML frontmatter + numbered steps with tool calls; $ARGUMENTS substitution

**Hook:**
- Purpose: Declarative middleware for tool use enforcement and automation
- Examples: `.claude/hooks/check-version-bump.js` (PreToolUse), `plugins/dev-workflow/hooks/exit-plan-check.js`
- Pattern: hooks.json matcher config + JS executable; stdin JSON input, stdout JSON response

## Entry Points

**Marketplace Entry:**
- Location: `.claude-plugin/marketplace.json`
- Triggers: `/plugin marketplace add nthplusio/functional-claude`
- Responsibilities: Central registry for all 15 plugins with versions and descriptions

**Plugin Loader Entry:**
- Location: `plugins/<name>/.claude-plugin/plugin.json`
- Triggers: Plugin installation via `/plugin install <plugin>@functional-claude`
- Responsibilities: Plugin metadata, version declaration, trigger for skill/agent/command discovery

**Hook Entry Points:**
- Location: `.claude/settings.json` and `plugins/<name>/hooks/hooks.json`
- Triggers: Claude Code session start, tool execution, session end
- Responsibilities: Security validation (no secrets), version bumping automation, workflow gates

**Skill Entry Points:**
- Location: `plugins/<name>/skills/<skill-name>/SKILL.md`
- Triggers: Agent/command references to skill path
- Responsibilities: Topic documentation, examples, reference material

**Agent Entry Points:**
- Location: `plugins/<name>/agents/<agent-name>.md`
- Triggers: User invocation (spawn), command delegation, team assembly
- Responsibilities: Autonomous task execution with tool constraints and behavioral protocols

**Command Entry Points:**
- Location: `plugins/<name>/commands/<cmd-name>.md`
- Triggers: `/bump-version`, `/create-plugin`, `/pre-release`, `/project`, etc.
- Responsibilities: Guided workflows with step-by-step instructions and validation

## Error Handling

**Strategy:** Fail-safe with explicit escalation protocols

**Patterns:**

- **Hook Failures:** If hook returns no response within timeout, tool execution denied (deny-safe)
- **Version Mismatches:** Detected by check-version-bump.js; commit blocked until fixed
- **Blocked Tasks:** Agent checks blockedBy before starting work; goes idle if all tasks blocked
- **Sensitive Data:** PreToolUse hook scans Write/Edit operations; commit denied if secrets detected
- **Escalation Protocol (agents):** Infrastructure failures (builds, migrations) escalated to lead; code-level problems resolved by agent
- **Task Dependencies:** TaskList call returns full dependency graph; agent can't claim blocked task

## Cross-Cutting Concerns

**Logging:**
- Plugin hook execution logged to `.claude/hooks/debug.log` (append-only)
- Agent progress tracked in task descriptions via `TaskUpdate`
- Session insights captured by session-insights plugin

**Validation:**
- Version synchronization enforced by PreToolUse hook on all commits
- Sensitive data detection on all Write/Edit operations
- Workflow gates (plan mode exit) validated by dev-workflow plugin
- Plugin manifests validated for structural correctness

**Authentication & Authorization:**
- GitHub credentials per-project in project-manager plugin
- Linear API tokens configured via project settings
- Gemini CLI credentials (advisory-only, sandbox enforcement)
- SSH keys for tabby-dev connections

**Security:**
- Pre-commit hook denies commits with API keys, .env files, credentials
- Hook patterns search for: sk-*, ghp_*, Bearer, api_key, secret, private keys
- Public repo enforcement via security scanning on every commit
- Plugin settings cache cleared between sessions for credential isolation

**Concurrency:**
- Agent-teams spawn multiple agents in parallel with role-based task assignment
- Task blocking ensures sequential work without race conditions
- Shared file modification coordination via task descriptions
- Adaptive team sizing based on project scope (spawn-build, spawn-think, spawn-create)

