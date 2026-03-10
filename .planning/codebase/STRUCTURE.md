# Codebase Structure

**Analysis Date:** 2026-03-10

## Directory Layout

```
functional-claude/
├── .claude/                              # Root hook infrastructure and settings
├── .claude-plugin/                       # Marketplace root manifest
├── .git/                                 # Git repository metadata
├── .gitignore                            # Global ignore patterns
├── .gitattributes                        # Git attributes for line endings
├── .planning/                            # GSD framework outputs (created by orchestrator)
├── CLAUDE.md                             # Plugin development guidelines
├── PLUGIN-REFERENCE.md                   # Complete plugin API reference
├── README.md                             # Repository overview
├── docs/                                 # Repository documentation and memory
├── nanobanana-output/                    # External tool outputs (not committed)
├── plugins/                              # 15 published plugins
├── scripts/                              # Utility scripts for plugin maintenance
└── skills/                               # Shared skill library (legacy, now per-plugin)
```

## Directory Purposes

**`.claude/`:**
- Purpose: Root-level hook configuration and runtime state
- Contains: hooks.json-style configuration, executable hook handlers, debug logs
- Key files: `settings.json` (plugin enablement, hook config), `hooks/check-version-bump.js` (version sync)
- Access pattern: Hooked into Claude Code runtime; runs before/after all tool executions

**`.claude-plugin/`:**
- Purpose: Marketplace root manifest directory
- Contains: `marketplace.json` (central registry of 15 plugins)
- Key files: `marketplace.json` (plugin list, versions, descriptions)
- Access pattern: Read by Claude Code on plugin installation/update

**`plugins/`:**
- Purpose: Directory containing all 15 published plugins
- Contains: Subdirectories for each plugin (wezterm-dev, hyper-dev, prisma-dev, etc.)
- Access pattern: Each plugin is independently versioned and installable

**`docs/`:**
- Purpose: Repository-level documentation and memory
- Contains: `memory.md` (version table, hook patterns, cache architecture), `skill-reference.md`, planning/retrospective logs
- Subdirectories:
  - `plans/`: Implementation plans by phase
  - `teams/`: Team-specific documentation with task breakdowns
  - `retrospectives/`: Post-phase reviews and learnings

**`scripts/`:**
- Purpose: Development utility scripts
- Contains: `generate-plugin-manifest.js`, `sync-version.js`
- Usage: Run during plugin development to generate manifests and sync versions

**`skills/`:**
- Purpose: Legacy shared skill library
- Contains: `functional-claude/SKILL.md` (repository-level skills)
- Access pattern: Deprecated in favor of per-plugin skills in `plugins/<name>/skills/`

## Key File Locations

**Entry Points:**

- `.claude-plugin/marketplace.json`: Central registry of all plugins, versions, and descriptions
- `plugins/<name>/.claude-plugin/plugin.json`: Per-plugin metadata (name, version)
- `CLAUDE.md`: Development guidelines for plugin creators

**Configuration:**

- `.claude/settings.json`: Hook configuration and enabled plugins
- `.claude/hooks/check-version-bump.js`: Pre-commit version synchronization
- `.gitignore`: Excludes `.cache/`, `.env*`, debug logs, etc.

**Core Logic:**

- `plugins/<name>/skills/<skill-name>/SKILL.md`: Topic knowledge modules with examples
- `plugins/<name>/agents/<agent-name>.md`: Autonomous workers with tools and system prompts
- `plugins/<name>/commands/<cmd-name>.md`: User-invocable slash command workflows
- `plugins/<name>/hooks/hooks.json`: Plugin-specific hook configuration

**Testing:**

- No dedicated test directory; testing validation via pre-commit hook on version bumps
- `plugins/dev-workflow/` provides workflow validation and plan mode gates

## Naming Conventions

**Files:**

- Plugin manifests: `plugin.json` (lowercase, underscore)
- Skills: `SKILL.md` (uppercase, single file per skill directory)
- Agents: `<agent-name>.md` (lowercase with hyphens, flat in `agents/` directory)
- Commands: `<cmd-name>.md` (lowercase with hyphens, flat in `commands/` directory)
- Hooks config: `hooks.json` (lowercase)
- Hooks handlers: `<hook-type>-<plugin>-<purpose>.js` (e.g., `plugin-dev-session-start.js`)

**Directories:**

- Plugins: `<plugin-name>` (lowercase with hyphens, e.g., `wezterm-dev`, `claude-plugin-dev`)
- Skills: `<skill-name>/` (lowercase with hyphens, e.g., `team-blueprints`, `agent-development`)
- Standard subdirs: `.claude-plugin/`, `skills/`, `agents/`, `commands/`, `hooks/`, `.cache/`

**Versioning:**

- Format: Semantic versioning (X.Y.Z, e.g., 0.6.1)
- Four sync points: `plugin.json`, `marketplace.json`, `docs/memory.md`, all `SKILL.md` frontmatter
- Check-version-bump.js enforces synchronization on every commit

## Where to Add New Code

**New Plugin:**

- Create directory: `plugins/<plugin-name>/`
- Initialize structure:
  ```
  plugins/<plugin-name>/
  ├── .claude-plugin/plugin.json      # Version and metadata
  ├── hooks/hooks.json                # Plugin-specific hooks (optional)
  ├── skills/<skill-name>/SKILL.md    # Topic modules
  ├── agents/<agent-name>.md          # Autonomous workers (optional)
  ├── commands/<cmd-name>.md          # User commands (optional)
  └── .cache/                         # Gitignored runtime cache
  ```
- Register in: `.claude-plugin/marketplace.json`
- Run: `node scripts/generate-plugin-manifest.js plugins/<plugin-name>`

**New Skill within Plugin:**

- Create: `plugins/<plugin-name>/skills/<skill-name>/SKILL.md`
- YAML frontmatter required:
  ```yaml
  ---
  name: <skill-name>
  description: When and why to use this skill
  version: <plugin-version>
  ---
  ```
- Reference pattern: `${CLAUDE_PLUGIN_ROOT}/skills/<skill-name>/SKILL.md`
- Supporting files: Create `references/` subdirectory for reference materials

**New Agent within Plugin:**

- Create: `plugins/<plugin-name>/agents/<agent-name>.md`
- YAML frontmatter required:
  ```yaml
  ---
  name: <agent-name>
  description: When to invoke agent (with <example> blocks)
  tools: [tool1, tool2, ...]
  model: sonnet|haiku
  color: cyan|blue|etc
  ---
  ```
- System prompt below frontmatter
- Behavioral rules in `docs/memory.md` and `.claude/CLAUDE.md` (shared by all agents)

**New Command within Plugin:**

- Create: `plugins/<plugin-name>/commands/<cmd-name>.md`
- YAML frontmatter required:
  ```yaml
  ---
  name: <cmd-name>
  description: User-facing description
  allowed-tools: Read, Edit, Bash, etc
  ---
  ```
- Steps reference $ARGUMENTS for user input
- Pattern: Read → Validate → Apply → Verify

**New Hook:**

- Add to: `plugins/<plugin-name>/hooks/hooks.json` or `.claude/hooks/` (root)
- Pattern:
  ```json
  {
    "hooks": {
      "PreToolUse|Stop|SessionStart": [
        {
          "matcher": "ToolName|regex pattern",
          "hooks": [
            {
              "type": "command|prompt",
              "command": "${CLAUDE_PLUGIN_ROOT}/hooks/handler.js",
              "timeout": 30
            }
          ]
        }
      ]
    }
  }
  ```
- Handler: JS executable that reads JSON from stdin, outputs JSON to stdout

## Special Directories

**`.cache/`:**
- Purpose: Runtime cache for compiled skills, agents, commands metadata
- Generated: Yes (generated by Claude Code plugin loader)
- Committed: No (.gitignore excludes)
- Cleared: Between session restarts; can be safely deleted

**`nanobanana-output/`:**
- Purpose: Temporary output from external tools (nano-banana extension)
- Generated: Yes (by gemini-cli plugin)
- Committed: No (.gitignore excludes)
- Cleared: Manually or by script

**`.planning/codebase/`:**
- Purpose: GSD framework analysis documents
- Generated: Yes (by orchestrator running `/gsd:map-codebase`)
- Committed: No (.gitignore excludes)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**`.planning/phases/`:**
- Purpose: Implementation phase plans and breakdowns
- Generated: Yes (by orchestrator running `/gsd:plan-phase`)
- Committed: No (.gitignore excludes)
- Contains: Phase YAML with task lists, team configs, and execution summaries

## Plugin Inventory

**Terminal & Dev Environment (5 plugins):**
- `wezterm-dev` (0.7.16): WezTerm configuration and Agent Deck monitoring
- `hyper-dev` (0.3.11): Hyper terminal with plugin development
- `tabby-dev` (0.1.7): Tabby terminal with SSH/serial connections
- `opentui-dev` (0.1.9): OpenTUI terminal UI component development
- `obsidian-dev` (0.1.1): Obsidian plugin development

**Plugin Development & Meta (4 plugins):**
- `claude-plugin-dev` (0.6.1): Plugin creation, skills, agents, commands, hooks
- `code-quality` (1.0.3): Pre-commit hooks, lint-staged, formatters
- `project-manager` (0.7.0): Multi-project workflows, GitHub/Linear integration
- `gemini-cli` (0.6.9): Gemini CLI integration for large context review

**Framework-Specific Dev (3 plugins):**
- `prisma-dev` (0.1.11): Prisma ORM schema analysis and migrations
- `shadcn-dev` (0.2.5): shadcn/ui and Tailwind CSS v4 workflows
- `agent-teams` (0.23.2): Agent team blueprints and coordination patterns

**Workflow & Analysis (3 plugins):**
- `dev-workflow` (0.2.4): Plan mode validation and checklist integration
- `session-insights` (0.1.4): Session analysis and workflow improvements
- `repo-sme` (0.2.3): GitHub repo reading and analysis without write access

## Import & Dependency Patterns

**Skill References:**
- Pattern: `${CLAUDE_PLUGIN_ROOT}/skills/<skill-name>/SKILL.md`
- Environment expansion: CLAUDE_PLUGIN_ROOT is the plugin's root directory
- Cross-plugin: Not supported in skill references (single plugin context)

**Agent Delegation:**
- Pattern: Agents spawn other agents via implicit invocation
- Context: Agent system prompt references spawn commands like `/spawn-build`, `/spawn-think`
- Task blocking: Spawned agents respect task dependencies declared by parent

**Hook Registration:**
- Pattern: Per-plugin hooks in `hooks/hooks.json`, root hooks in `.claude/hooks/`
- Merge: Hooks are combined by Claude Code session loader
- Precedence: Root hooks evaluated before plugin hooks

**Version Dependencies:**
- Pattern: Versions must match across 4 locations for single plugin
- No explicit: Plugin A cannot depend on Plugin B version X
- Marketplace: All plugins are versioned independently

