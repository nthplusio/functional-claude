# Repository Memory

This document contains accumulated knowledge about the functional-claude plugin marketplace repository. Reference this when working with plugins, marketplace structure, or repository conventions.

## Repository Identity

- **Repository:** `nthplusio/functional-claude`
- **Type:** Claude Code Plugin Marketplace
- **Purpose:** Terminal and development workflow plugins
- **Visibility:** Public (security hooks enforce no sensitive data commits)

## Current Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| wezterm-dev | 0.7.13 | WezTerm terminal configuration and customization |
| hyper-dev | 0.3.8 | Hyper terminal configuration and plugin development |
| prisma-dev | 0.1.7 | Prisma ORM development with schema analysis and migration safety |
| shadcn-dev | 0.2.2 | shadcn/ui and Tailwind CSS v4 development workflows |
| code-quality | 1.0.0 | Deterministic code quality infrastructure — git hooks, lint-staged, and formatters |
| claude-plugin-dev | 0.4.1 | Plugin development with guided workflows and AI-assisted creation |
| opentui-dev | 0.1.6 | OpenTUI terminal interface development with component design and layout |
| dev-workflow | 0.2.1 | Development workflow validation and planning tools |
| tabby-dev | 0.1.4 | Tabby terminal configuration, SSH connections, and plugin development |
| agent-teams | 0.21.2 | Agent team blueprints, coordination patterns, and reusable personas for parallel development. Unified commands (spawn-build, spawn-think, spawn-create) with adaptive sizing and verbosity control |
| gemini-cli | 0.6.4 | Gemini CLI integration for large context review, batch processing, and image generation via nano-banana extension |
| session-insights | 0.1.1 | Interactive session analysis, deep drill-down into conversation history, and workflow improvement generation |

## Architecture Overview

The plugins use a **multi-skill architecture** with focused, composable skills:

### Component Types

| Component | Purpose | Auto-Invocation |
|-----------|---------|-----------------|
| **Skills** | Conceptual guidance, multi-step workflows | Yes (model can invoke) |
| **Agents** | Complex autonomous tasks (debugging, setup) | Yes (model can delegate) |
| **Hooks** | Event-driven automation (backup, learnings) | Automatic on events |

### Plugin Structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (name, version, description)
├── hooks/
│   └── hooks.json            # PreToolUse/Stop hooks
├── skills/
│   ├── <main-skill>/         # Overview skill (links to focused skills)
│   │   ├── SKILL.md
│   │   ├── examples/
│   │   └── references/
│   ├── <focused-skill-1>/    # Focused skill (specific topic)
│   │   └── SKILL.md
│   └── <focused-skill-2>/
│       ├── SKILL.md
│       └── references/
├── agents/
│   └── <agent-name>.md       # Autonomous agent (flat file)
└── .cache/                   # Gitignored - runtime cache
```

## WezTerm Plugin (v0.7.9)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| wezterm-dev | Overview, base config | "configure wezterm", "wezterm config" |
| wezterm-keybindings | Tmux-style keybindings | "leader key", "tmux-style", "pane splitting" |
| wezterm-visual | Opacity, blur, cursor, colors | "opacity", "blur", "cursor", "theme" |
| wezterm-tabs | Tab bar with Nerd Font icons | "tab bar", "nerd font icons", "process icons" |
| wezterm-agent-deck | Agent Deck integration | "agent deck", "claude monitoring" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| wezterm-troubleshoot | Autonomous debugging | "wezterm not working", "fix wezterm", "debug wezterm" |

## Hyper Plugin (v0.3.4)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-dev | Overview, base config | "configure hyper", "hyper config" |
| hyper-keybindings | Keymap customization | "hyper keys", "shortcuts" |
| hyper-visual | Opacity, colors, cursor | "opacity", "colors", "cursor" |
| hyper-plugins | Plugin development | "create plugin", "decorateConfig", "redux" |
| hyper-themes | Theme creation | "create theme", "color scheme" |
| hyper-ecosystem | Plugin discovery | "popular plugins", "find plugin", "recommendations" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| hyper-troubleshoot | Autonomous debugging | "hyper not working", "fix hyper", "debug hyper" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| hyper-session-start | SessionStart | Detects Hyper version, refreshes caches |
| verify-hyper-backup | PreToolUse | Verifies backup before config edits |
| check-hyper-learnings | Stop | Prompts for learnings capture |

### Cache Files

| File | Refresh | Purpose |
|------|---------|---------|
| hyper-config.json | Daily | Version, config path, installed plugins |
| docs-index.json | Daily | Documentation source URLs |
| plugin-ecosystem.json | Weekly | Top 25 popular plugins |
| learnings.md | Daily | Documentation and session learnings |

## Prisma Plugin (v0.1.4)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| prisma-dev | Overview, general guidance | "configure prisma", "prisma orm" |
| prisma-schema | Schema design and syntax | "prisma model", "schema.prisma", "relations" |
| prisma-migrations | Migration workflows | "prisma migrate", "migration" |
| prisma-queries | Query patterns and CRUD | "prisma client", "findMany", "create" |
| prisma-recon | Repository analysis | "analyze prisma", "schema recon" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| prisma-troubleshoot | Autonomous debugging | "prisma not working", "prisma error", "P2002" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| block-manual-migration | PreToolUse | Blocks manual .sql creation in migrations/ |
| remind-migrate-after-schema-change | PostToolUse | Reminds to run prisma migrate dev after schema.prisma edits |
| prisma-recon | SessionStart | Analyzes schema and caches findings |

## shadcn-dev Plugin (v0.1.6)

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| shadcn-dev | Overview, project setup | "set up shadcn", "configure shadcn", "shadcn init" |
| shadcn-components | Component usage and customization | "add button", "create dialog", "shadcn accordion" |
| shadcn-forms | Form building with react-hook-form | "form validation", "zod schema", "useForm" |
| shadcn-theming | Theme and color customization | "dark mode", "theme colors", "css variables" |
| shadcn-data-tables | TanStack Table integration | "data table", "sortable table", "column sorting" |
| tailwindv4 | Tailwind CSS v4 features | "tailwind v4", "css-first config", "oklch colors" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| shadcn-agent | Full-capability development agent for multi-step shadcn/ui work | "build a login page", "scaffold a dashboard", "create a data table with sorting" |
| shadcn-troubleshoot | Autonomous debugging | "shadcn not working", "component not rendering", "hydration error" |

### Commands

| Command | Purpose |
|---------|---------|
| /shadcn-dev | Overview of shadcn/ui development guidance, project status, and skill routing |
| /shadcn-recon | Analyze project for shadcn/ui setup and recommend components |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| cache-refresh | SessionStart | Checks if documentation cache needs refreshing |
| learnings-capture | Stop | Prompts for learnings capture after shadcn work |

## Code Quality Plugin (v1.0.0)

Deterministic code quality infrastructure — git hooks, lint-staged, and formatters that run on every commit and push.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| code-quality | Overview, routing to focused skills | "code quality", "quality checks", "set up code quality" |
| code-quality-setup | Guided setup: detect → recommend → configure | "set up code quality", "configure git hooks", "add pre-commit hooks", "set up lint-staged" |
| code-quality-hooks | Git hook framework deep reference | "configure husky", "set up lefthook", "add pre-push hook" |
| code-quality-lint | Linter, formatter, lint-staged reference | "set up eslint", "configure prettier", "add biome", "set up ruff" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| code-quality-troubleshoot | Diagnose broken hooks and configs | "git hooks not running", "lint-staged not working", "husky broken" |

### Commands

| Command | Purpose |
|---------|---------|
| /code-quality-setup | Guided setup workflow for git hooks and lint-staged |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| code-quality-recon | SessionStart | Detects quality infrastructure, suggests setup or migration |

### Supported Frameworks

- **Husky** — JS/TS single-package projects
- **Lefthook** — Monorepos, polyglot projects
- **pre-commit** — Python projects, polyglot repos
- **Shell scripts** — Rust, Go, minimal setups

### Migration from Pre-Commit Plugin

The legacy `pre-commit` plugin used a Claude PreToolUse hook to intercept `git push` — this only ran when Claude performed the push. The `code-quality` plugin sets up real git hooks that run for every developer. If `.claude/pre-commit.json` is detected, `/code-quality-setup` guides the migration.

## opentui-dev Plugin (v0.1.3)

OpenTUI terminal interface development with TypeScript/Bun.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| opentui-dev | Overview, framework selection | "build TUI", "OpenTUI", "terminal interface" |
| opentui-components | Components reference | "text component", "input field", "select options" |
| opentui-layout | Flexbox layout system | "layout", "flexbox", "positioning" |
| opentui-keyboard | Keyboard input handling | "keyboard shortcuts", "key events", "focus" |
| opentui-animation | Timeline animations | "animation", "timeline", "easing" |

### Agent

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| opentui-troubleshoot | Autonomous debugging | "opentui not working", "TUI crash", "layout broken" |

### Command

| Command | Purpose |
|---------|---------|
| /opentui-scaffold | Create new OpenTUI project with framework selection |

### Reference Files

| File | Purpose |
|------|---------|
| references/core-reference.md | Core imperative API |
| references/react-reference.md | React reconciler patterns |
| references/solid-reference.md | Solid reconciler patterns |
| references/components-reference.md | All components by category |
| references/layout-reference.md | Yoga/Flexbox layout |
| references/keyboard-reference.md | Input handling |
| references/animation-reference.md | Timeline animations |
| references/testing-reference.md | Test renderer and snapshots |
| references/cache-management.md | Cache refresh strategy and learnings |

## claude-plugin-dev Plugin (v0.3.4)

Plugin development documentation with guided workflows and AI-assisted creation.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| claude-plugin-dev | Overview, quick reference | "create a plugin", "plugin structure", "how do plugins work" |
| plugin-structure | Directory layout and manifest | "plugin layout", "plugin.json", "plugin directories" |
| skill-development | Writing SKILL.md files | "create a skill", "skill description", "skill frontmatter" |
| agent-development | Writing AGENT.md files | "create an agent", "subagent", "agent tools" |
| hook-development | Creating hooks.json | "create a hook", "PreToolUse", "hook events" |
| mcp-integration | MCP server configuration | "add MCP server", ".mcp.json", "external tools" |
| command-development | Writing slash commands | "create a command", "slash command", "$ARGUMENTS" |
| plugin-settings | User configuration patterns | ".local.md", "plugin settings", "configuration file" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| plugin-validator | Validate plugin structure | "validate plugin", "check plugin", "review my plugin" |
| agent-creator | AI-assisted agent generation | "create an agent", "generate an agent", "design an agent" |
| skill-reviewer | Skill quality review | "review my skill", "check skill quality", "improve skill" |

### Commands

| Command | Purpose |
|---------|---------|
| /create-plugin | 8-phase guided plugin creation workflow |
| /bump-version | Synchronize version across all 4 sync points for a plugin |
| /plugin-status | Quick dashboard of plugin versions, sync status, and pending changes |
| /pre-release | Pre-commit validation — catches version mismatches before the hook rejects |

### Reference Files

| File | Purpose |
|------|---------|
| references/docs-cache.md | Compressed official documentation |
| references/conventions.md | Patterns from anthropics/claude-plugins-official |
| references/examples.md | Complete plugin examples |

## dev-workflow Plugin (v0.2.0)

Development workflow validation and planning tools.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| plan-validation | Checklist integrated into plan creation | "create a plan", "plan the implementation", "enter plan mode" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| dev-gutcheck | Thorough post-plan validation | "gut check this plan", "validate this plan", "sanity check before implementing" |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| exit-plan-check | PreToolUse (ExitPlanMode) | Suggests running gut-check before plan approval |

## tabby-dev Plugin (v0.1.0)

Tabby terminal configuration, SSH connections, and plugin development.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| tabby-dev | Overview, base config | "configure tabby", "tabby config" |
| tabby-visual | Themes, colors, fonts, appearance | "tabby theme", "colors", "cursor" |
| tabby-keybindings | Hotkeys, shortcuts, multi-chord | "tabby hotkeys", "shortcuts" |
| tabby-connections | SSH, serial, telnet profiles | "ssh profile", "serial connection" |
| tabby-plugins | Plugin discovery and development | "tabby plugin", "install plugin" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| tabby-troubleshoot | Autonomous debugging | "tabby not working", "fix tabby", "debug tabby" |
| tabby-cache-update | Silent cache refresh | Triggered by SessionStart hook when cache is stale |

### Commands

| Command | Purpose |
|---------|---------|
| /tabby-recon | Analyze Tabby configuration and recommend optimizations |
| /tabby-dev | Overview of Tabby development guidance with optional [topic] argument |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| tabby-session-start | SessionStart | Detects Tabby version, config path, refreshes caches |
| verify-tabby-backup | PreToolUse | Verifies backup before config edits |
| check-tabby-learnings | Stop | Prompts for learnings capture |

### Cache Files

| File | Refresh | Purpose |
|------|---------|---------|
| tabby-config.json | Daily | Version, config path, connection counts |
| sources.json | - | Documentation source URLs |
| learnings.md | Weekly | Documentation and session learnings |

## agent-teams Plugin (v0.17.1)

Agent team blueprints, coordination patterns, and reusable personas for parallel development. Unified commands (spawn-build, spawn-think, spawn-create) with adaptive sizing and verbosity control. All teams feature discovery interviews for rich shared context, user feedback gates for mid-course correction, pipeline context for chaining teams together, and artifact output to `docs/teams/` for persistent, git-tracked deliverables.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| agent-teams | Overview, concepts, when to use | "agent teams", "create a team", "coordinate agents" |
| team-blueprints | Pre-designed team configs with design patterns, unified command mapping | "research team", "feature team", "review team", "debug team", "design team", "planning team", "productivity team", "brainstorming team" |
| team-coordination | Task management, messaging, lifecycle, discovery interviews, user feedback gates | "manage tasks", "team communication", "delegate mode" |
| team-personas | Reusable behavioral profiles with deep methodology, persona registry with capability tags | "personas", "behavioral profiles", "productivity loop", "auditor persona" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| team-architect | Custom team design with persona support and advanced pattern awareness | "design a team", "custom team", "what team do I need" |

### Commands — Unified (v0.15.0)

| Command | Purpose |
|---------|---------|
| /agent-teams | Plugin overview with available commands and quickstart |
| /spawn-build | Build teams — feature development (`--mode feature`) or debugging (`--mode debug`). Adaptive sizing, verbosity control |
| /spawn-think | Thinking teams — research (`--mode research`), planning (`--mode planning`), or review (`--mode review`). 13 submodes total |
| /spawn-create | Creative teams — design (`--mode design`), brainstorm (`--mode brainstorm`), or productivity (`--mode productivity`). Persona-driven |
| /calibrate-scoring | Aggregate Build profile retrospective data to surface spec quality threshold calibration recommendations. Requires R3+R11 data and 10+ Build retrospectives. |

### Shared Files (v0.16.0)

| File | Purpose |
|------|---------|
| shared/task-blocking-protocol.md | Canonical task dependency protocol (referenced by all commands) |
| shared/output-standard.md | Output standards with context-type lookup table |
| shared/shutdown-protocol.md | Structured shutdown sequence — participant retrospective, AAR gating, TeamDelete safety |
| shared/aar-protocol.md | After-action review with participant-first FM 7-0 design, 2-scope (plugin/project) system |
| shared/spec-quality-scoring.md | Pass/fail dimension scoring (6 dimensions), API accuracy check |
| shared/planning-blueprints.md | Spawn prompts for all 7 planning submodes |
| shared/prerequisites-check.md | Environment variable check template |
| shared/discovery-interview.md | 3 core + 2 optional keyword-triggered questions, adaptive skip |
| shared/spawn-core.md | Adaptive sizing, model selection, verbosity flags, team name slugs |
| shared/base-agent.md | Universal teammate behaviors, communication defaults, artifact defaults |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| dedup-guard | PreToolUse | Prevents duplicate team creation and teammate spawning |

### Reference Files

| File | Purpose |
|------|---------|
| references/agent-teams-reference.md | Complete API reference, tools, architecture, best practices |
| references/auditor.md | Auditor persona: Productivity Systems Analyst (`#discovery #scoring #planning`) |
| references/architect.md | Architect persona: Solution Architect (`#design #blueprint #phased`) |
| references/analyst.md | Analyst persona: Senior Engineering Analyst (`#review #multi-pass #scoring`) |
| references/refiner.md | Refiner persona: Convergence Loop Specialist (`#iteration #convergence #implementation`) |
| references/compounder.md | Compounder persona: Systems Review Partner (`#synthesis #patterns #tracking`) |
| references/facilitator.md | Facilitator persona: Session Facilitator (`#coordination #brainstorm #convergence`) |
| references/visionary.md | Visionary persona: Divergent Thinker (`#brainstorm #divergent #creative`) |
| references/realist.md | Realist persona: Practical Thinker (`#brainstorm #convergent #feasibility`) |
| skills/team-personas/registry.md | Centralized persona catalog with capability tags and matching guide |

## gemini-cli Plugin (v0.6.0)

Gemini CLI integration for large context review, batch processing, and image generation via nano-banana extension. Includes file-output pattern, configurable timeouts, retry logic, output validation, and batch command. Validates CLI installation, authentication, and extension availability on session start.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| gemini-cli | Overview, setup, CLI usage | "use gemini", "gemini cli", "configure gemini" |
| gemini-review | Large context review via Gemini headless mode | "review with gemini", "gemini code review", "large context review" |
| gemini-images | Image/icon generation via nano-banana extension | "generate image", "create icon", "nano-banana", "gemini image" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| gemini-review | Autonomous large context review delegation | "use gemini to review", "second opinion from gemini" |
| gemini-troubleshoot | Diagnose CLI, auth, and extension issues | "gemini not working", "fix gemini", "gemini error" |
| gemini-cache-update | Silent cache refresh | Triggered by SessionStart hook when cache is stale |

### Commands

| Command | Purpose |
|---------|---------|
| /gemini-batch | Sequential batch review of multiple targets with rate limit awareness and aggregate summary |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| gemini-session-start | SessionStart | Validates CLI installation, auth env vars, and nano-banana extension |

### Cache Files

| File | Refresh | Purpose |
|------|---------|---------|
| sources.json | - | Documentation source URLs |
| learnings.md | Weekly | Documentation and session learnings |

## session-insights Plugin (v0.1.0)

Interactive session analysis, deep drill-down into Claude Code conversation history, and workflow improvement generation. Uses programmatic Node.js streaming scripts to parse JSONL session data without loading raw files into context.

### Skills

| Skill | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| session-insights | Overview, routing to commands | "analyze sessions", "review my Claude usage", "session insights", "what have I been working on" |

### Agents

| Agent | Purpose | Trigger Phrases |
|-------|---------|-----------------|
| session-analyst | Deep-dive analysis for specific dimensions (insights, improvements, patterns) | Launched by /session-review Phase 3 |
| workflow-improver | Generates concrete workflow improvements from analysis findings | Launched by /session-review Phase 6 |

### Commands

| Command | Purpose |
|---------|---------|
| /session-review | 6-phase deep analysis: discovery, selection, parallel analysis, synthesis, drill-down, workflow improvement |
| /session-stats | Quick dashboard of usage statistics |

### Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| session-insights-session-start | SessionStart | Quick data availability check with message/session/project counts |

### Scripts

| Script | Purpose |
|--------|---------|
| list-projects.js | Enumerate projects with session counts and sizes |
| list-sessions.js | List sessions for a project with metadata |
| extract-session.js | Turn-by-turn session extraction with detail levels (low/medium/high) |
| extract-history.js | Parse history.jsonl with project/date filters |
| aggregate-stats.js | Cross-session aggregate statistics with sampling |

## Root-Level Skills

| Skill | Purpose |
|-------|---------|
| terminal-cache | Shared cache management for terminal plugins |

## Directory Structure

```
functional-claude/
├── .claude-plugin/
│   ├── plugin.json           # Root manifest (for marketplace itself)
│   └── marketplace.json      # Lists all plugins with versions
├── hooks/
│   └── hooks.json            # Security hook (blocks sensitive data commits)
├── docs/
│   └── memory.md             # This file - repository knowledge
├── skills/
│   └── terminal-cache/       # Shared terminal cache skill
│       └── SKILL.md
└── plugins/
    ├── wezterm-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── wezterm-dev/         # Main skill (overview)
    │   │   ├── wezterm-keybindings/
    │   │   ├── wezterm-visual/
    │   │   ├── wezterm-tabs/
    │   │   └── wezterm-agent-deck/
    │   ├── agents/
    │   │   └── wezterm-troubleshoot.md
    │   └── .cache/
    ├── hyper-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── hyper-dev/           # Main skill (overview)
    │   │   ├── hyper-keybindings/
    │   │   ├── hyper-visual/
    │   │   ├── hyper-plugins/
    │   │   └── hyper-themes/
    │   ├── agents/
    │   │   └── hyper-troubleshoot.md
    │   └── .cache/
    ├── prisma-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── prisma-dev/          # Main skill (overview)
    │   │   ├── prisma-schema/
    │   │   ├── prisma-migrations/
    │   │   ├── prisma-queries/
    │   │   └── prisma-recon/
    │   ├── agents/
    │   │   └── prisma-troubleshoot.md
    │   └── .cache/
    ├── shadcn-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── commands/
    │   │   └── shadcn-recon.md
    │   ├── skills/
    │   │   ├── shadcn-dev/          # Main skill (overview)
    │   │   ├── shadcn-components/
    │   │   ├── shadcn-forms/
    │   │   ├── shadcn-theming/
    │   │   ├── shadcn-data-tables/
    │   │   └── tailwindv4/
    │   ├── agents/
    │   │   └── shadcn-troubleshoot.md
    │   └── .cache/
    ├── code-quality/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/
    │   │   ├── hooks.json
    │   │   └── code-quality-recon.js
    │   ├── skills/
    │   │   ├── code-quality/
    │   │   │   └── SKILL.md
    │   │   ├── code-quality-setup/
    │   │   │   └── SKILL.md
    │   │   ├── code-quality-hooks/
    │   │   │   └── SKILL.md
    │   │   └── code-quality-lint/
    │   │       └── SKILL.md
    │   ├── agents/
    │   │   └── code-quality-troubleshoot.md
    │   ├── commands/
    │   │   └── code-quality-setup.md
    │   └── .cache/
    ├── claude-plugin-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── skills/
    │   │   ├── claude-plugin-dev/      # Main skill (overview)
    │   │   │   └── references/
    │   │   ├── plugin-structure/
    │   │   ├── skill-development/
    │   │   ├── agent-development/
    │   │   ├── hook-development/
    │   │   └── mcp-integration/
    │   ├── agents/
    │   │   ├── agent-creator.md
    │   │   ├── plugin-validator.md
    │   │   └── skill-reviewer.md
    │   └── .cache/
    ├── opentui-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── commands/
    │   │   └── opentui-scaffold.md
    │   ├── skills/
    │   │   ├── opentui-dev/           # Main skill (overview)
    │   │   │   └── references/
    │   │   ├── opentui-components/
    │   │   ├── opentui-layout/
    │   │   ├── opentui-keyboard/
    │   │   └── opentui-animation/
    │   ├── agents/
    │   │   └── opentui-troubleshoot.md
    │   └── .cache/
    ├── dev-workflow/
    │   ├── .claude-plugin/plugin.json
    │   ├── skills/
    │   │   └── plan-validation/
    │   │       └── SKILL.md
    │   ├── agents/
    │   │   └── dev-gutcheck.md
    │   ├── hooks/
    │   │   ├── hooks.json
    │   │   └── exit-plan-check.js
    │   └── .cache/
    ├── tabby-dev/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── commands/
    │   │   ├── tabby-recon.md
    │   │   └── tabby-dev.md
    │   ├── skills/
    │   │   ├── tabby-dev/             # Main skill (overview)
    │   │   ├── tabby-visual/
    │   │   ├── tabby-keybindings/
    │   │   ├── tabby-connections/
    │   │   └── tabby-plugins/
    │   ├── agents/
    │   │   ├── tabby-troubleshoot.md
    │   │   └── tabby-cache-update.md
    │   └── .cache/
    └── agent-teams/
        ├── .claude-plugin/plugin.json
        ├── hooks/hooks.json
        ├── commands/
        │   ├── agent-teams.md
        │   ├── spawn-build.md
        │   ├── spawn-think.md
        │   ├── spawn-create.md
        │   └── calibrate-scoring.md
        ├── skills/
        │   ├── agent-teams/           # Main skill (overview)
        │   │   └── references/
        │   ├── team-blueprints/
        │   ├── team-coordination/
        │   └── team-personas/
        │       ├── SKILL.md
        │       └── references/
        │           ├── auditor.md
        │           ├── architect.md
        │           ├── analyst.md
        │           ├── refiner.md
        │           ├── compounder.md
        │           ├── facilitator.md
        │           ├── visionary.md
        │           └── realist.md
        ├── agents/
        │   └── team-architect.md
        └── .cache/
    └── gemini-cli/
        ├── .claude-plugin/plugin.json
        ├── hooks/
        │   ├── hooks.json
        │   └── gemini-session-start.js
        ├── commands/
        │   └── gemini-batch.md
        ├── skills/
        │   ├── gemini-cli/            # Main skill (overview)
        │   ├── gemini-review/
        │   └── gemini-images/
        ├── agents/
        │   ├── gemini-review.md
        │   ├── gemini-troubleshoot.md
        │   └── gemini-cache-update.md
        └── .cache/
    └── session-insights/
        ├── .claude-plugin/plugin.json
        ├── hooks/
        │   ├── hooks.json
        │   └── session-insights-session-start.js
        ├── scripts/
        │   ├── list-projects.js
        │   ├── list-sessions.js
        │   ├── extract-session.js
        │   ├── extract-history.js
        │   └── aggregate-stats.js
        ├── commands/
        │   ├── session-review.md
        │   └── session-stats.md
        ├── skills/
        │   └── session-insights/       # Single overview skill
        │       └── SKILL.md
        ├── agents/
        │   ├── session-analyst.md
        │   └── workflow-improver.md
        └── .cache/
```

## Version Synchronization

**Critical:** Plugin versions must be synchronized across three locations:

1. `plugins/<name>/.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
2. `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"` in plugins array
3. `plugins/<name>/skills/<skill>/SKILL.md` - frontmatter `version:` (all skills in plugin)

When bumping versions:
- Update all locations simultaneously
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Commit version changes together

## Marketplace Configuration

### marketplace.json Schema

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "functional-claude",
  "owner": { "name": "nthplusio" },
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "Brief description",
      "version": "X.Y.Z"
    }
  ]
}
```

### plugin.json Schema

```json
{
  "name": "plugin-name",
  "version": "X.Y.Z",
  "description": "Brief description"
}
```

## Hook Patterns

### Root-Level Hooks

Located at `hooks/hooks.json`:

**Security Hook** (PreToolUse on Write/Edit):
- Validates all Write/Edit operations for sensitive data
- API keys, tokens, secrets
- .env files with real values
- Private URLs, credentials
- Personal information

**Version Bump Hook** (PreToolUse on Bash):
- Triggers on `git commit` commands
- Validates plugin version synchronization:
  - plugin.json version is bumped for code changes
  - marketplace.json has matching version
  - All SKILL.md files have matching version in frontmatter
- Blocks commits with version mismatches

### Plugin Hooks

Each plugin can define hooks in `plugins/<name>/hooks/hooks.json`:

**PreToolUse hooks** - Run before tool execution:
- Backup verification before config edits
- Exit code 0 = allow, exit code 2 = block

**Stop hooks** - Run when Claude finishes:
- Check transcript for plugin-related work
- Prompt for learnings capture if relevant
- Response format: `{}` (allow) or `{"decision": "block", "reason": "..."}` (block)

### Hook Types

**Command hooks** (`"type": "command"`):
```json
{
  "type": "command",
  "command": "bash \"${CLAUDE_PLUGIN_ROOT}/hooks/script.sh\"",
  "timeout": 10
}
```

Note: Use command-based hooks (bash scripts that output JSON) instead of prompt-based hooks for reliable JSON output.

### Hook Output Formats (Critical)

**Different hook events require different JSON output formats.** Using the wrong format will cause hooks to silently fail.

| Hook Event | Allow Format | Block Format |
|------------|--------------|--------------|
| **PreToolUse** | `{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "allow" } }` | `{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..." } }` |
| **Stop** | `{}` | `{ "decision": "block", "reason": "..." }` |
| **Stop (with message)** | `{ "stopReason": "..." }` | N/A (shows message to user without blocking) |
| **SessionStart** | `{ "continue": true }` or `{ "continue": true, "systemMessage": "..." }` | N/A |

**Common Mistakes:**
1. Using `{ ok: true/false }` for Stop hooks - this is WRONG
2. Using `{ permissionDecision: "allow" }` without the `hookSpecificOutput` wrapper for PreToolUse - this is WRONG
3. Calling `process.exit(0)` before async operations complete in SessionStart hooks
4. Using `{ "decision": "block", "reason": "..." }` for informational Stop hook messages - this shows as "error" in the UI. Use stderr for informational output + `{}` on stdout instead

**PreToolUse Helper Function:**
```javascript
function respond(decision, reason = null) {
  const response = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: decision
    }
  };
  if (reason) {
    response.hookSpecificOutput.permissionDecisionReason = reason;
  }
  console.log(JSON.stringify(response));
  process.exit(0);
}
```

**Stop Hook Pattern (blocking):**
```javascript
if (shouldBlock) {
  console.log(JSON.stringify({ decision: "block", reason: "..." }));
} else {
  console.log(JSON.stringify({}));  // Allow - empty object
}
```

**Stop Hook Pattern (informational - shows message without blocking):**
```javascript
if (hasMessageForUser) {
  // stopReason shows message to user without "Stop hook error" framing
  console.log(JSON.stringify({ stopReason: "[plugin-name] Message here" }));
} else {
  console.log(JSON.stringify({}));
}
```

**SessionStart Async Pattern (Detached Background Process):**

For slow operations (fetching docs, calling Claude CLI), use a detached background script:

```javascript
// Main script: plugin-dev-session-start.js
const { spawn } = require('child_process');

// Fast synchronous work (context detection, cache checks)...

if (docsNeedRefresh) {
  // Spawn detached background process for slow work
  const backgroundScript = path.join(__dirname, 'plugin-dev-cache-refresh.js');
  const child = spawn(process.execPath, [backgroundScript, cacheDir, today, learningsPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref(); // Allow parent to exit independently
}

// Output immediately and exit - don't await anything
console.log(JSON.stringify({ continue: true, systemMessage: "..." }));
```

Background script (`plugin-dev-cache-refresh.js`) handles slow operations:
- Receives args via CLI: `node plugin-dev-cache-refresh.js <cacheDir> <today> <learningsPath>`
- Does all slow work (Claude CLI, HTTP fetches, file writes)
- Runs completely detached from parent process
- Parent exits immediately, background process continues

**Benefits:**
- Session starts instantly (no blocking on cache refresh)
- Cache still refreshes reliably in background
- If background fails, next session will retry

### Environment Variables in Hooks

- `${CLAUDE_PLUGIN_ROOT}` - Absolute path to plugin directory
- `${CLAUDE_PROJECT_DIR}` - Project root where Claude Code was started

## Skill Structure

### SKILL.md Frontmatter

```yaml
---
name: Skill Display Name
description: Trigger phrases and when-to-use guidance
version: X.Y.Z
---
```

### Agent AGENT.md Frontmatter

```yaml
---
name: Agent Display Name
description: Trigger phrases and when-to-use guidance
tools:
  - Read
  - Bash
  - Grep
  - Glob
  - WebFetch
---
```

## Development Workflow

### Testing Plugins Locally

```bash
claude --plugin-dir ./plugins/wezterm-dev
```

### Installing from Marketplace

```
/plugin marketplace add nthplusio/functional-claude
/plugin install wezterm-dev@functional-claude
```

### Creating a New Skill

1. Create directory: `plugins/<name>/skills/<skill-name>/`
2. Create SKILL.md with YAML frontmatter
3. Add references/ directory if needed
4. Update version across all locations

### Creating a New Agent

1. Create file: `plugins/<name>/agents/<agent-name>.md`
2. Add YAML frontmatter with name, description, tools
3. Define system prompt in markdown body
4. Test with triggering scenarios

## Conventions

### Naming

- Plugin names: lowercase with hyphens (`wezterm-dev`, `hyper-dev`)
- Skill names: `<plugin>-<topic>` (e.g., `wezterm-keybindings`)
- Agent names: `<plugin>-<action>` (e.g., `wezterm-troubleshoot`)
- Hook scripts: descriptive (`verify-wezterm-backup.sh`)

### Versions

- Start at `0.1.0` for new plugins
- Increment PATCH for fixes
- Increment MINOR for new features (new skills, agents)
- Increment MAJOR for breaking changes

### Documentation Strategy

Plugins use **static reference files** (`references/*.md`) checked into the repository as the primary knowledge source. For users with Context7 installed (via `claude-plugins-official` marketplace), skills can optionally query up-to-date documentation on demand.

**Key Rules:**
- No runtime caching or network fetching in SessionStart hooks
- SessionStart hooks should only detect tool versions and environment status
- Reference files in `skills/<name>/references/` provide always-available documentation
- Context7 queries are optional enhancements, not required

### Security

- Never commit API keys, tokens, or credentials
- Never commit .env files with real values
- Root security hook blocks sensitive data automatically

## Canonical Hook Patterns

This section documents the standard patterns that all plugins should follow. Each plugin maintains its own copy of these utilities since plugins are installed in isolation.

### SessionStart Hook Pattern

SessionStart hooks should do work in the hook itself (not delegate to agents) and output user-friendly status messages.

**Standard Output Format:**
```
[plugin-name] Brief status (e.g., "Hyper 3.4.1, 5 plugins")
```

**Reference Implementation:** `plugins/hyper-dev/hooks/hyper-session-start.js`

**Key Components:**
1. Detect installation/version
2. Check cache staleness
3. Refresh documentation cache asynchronously (don't block session)
4. Output user-friendly status message

**Utility Functions (copy to each plugin):**

```javascript
// Fetch URL with timeout and redirect handling
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    request.on('error', reject);
    request.on('timeout', () => { request.destroy(); reject(new Error('Request timeout')); });
  });
}

// Strategy 1: Use Claude CLI for high-quality extraction (preferred)
function fetchWithClaudeCli(url, prompt, timeout = 60000) {
  try {
    const result = execSync(
      `claude --print --model haiku --allowed-tools WebFetch --dangerously-skip-permissions "${prompt}"`,
      { encoding: 'utf8', timeout, maxBuffer: 1024 * 1024, windowsHide: true }
    );
    return result.trim();
  } catch (e) {
    return null; // Fall back to HTTP extraction
  }
}

// Strategy 2: Basic HTTP + HTML extraction (fallback)
function extractTextFromHtml(html) {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return text.replace(/\s+/g, ' ').trim();
}
```

### Learnings Capture (Stop Hook) Pattern

Stop hooks should use rich category-based pattern matching with contextual messages.

**Reference Implementation:** `plugins/hyper-dev/hooks/check-hyper-learnings.js`

**Standard Structure:**

```javascript
const patterns = {
  config: /...config file patterns.../i,
  skills: /...skill name patterns.../i,
  api: /...API term patterns.../i,
  // plugin-specific categories
};

// Match patterns and build contextual message
const matchedCategories = [];
for (const [category, pattern] of Object.entries(patterns)) {
  if (pattern.test(transcript)) {
    matchedCategories.push(category);
  }
}

if (matchedCategories.length > 0) {
  let reason = "This session involved [plugin] work";
  if (matchedCategories.includes('specific_category')) {
    reason += " (specific context)";
  }
  reason += ". Consider capturing learnings:\n";
  reason += "- Successful Patterns: ...\n";
  reason += "- Mistakes to Avoid: ...\n";
  // plugin-specific categories
}
```

**Standard Learnings Categories:**
- Successful Patterns
- Mistakes to Avoid
- Plugin-specific category (e.g., "Plugin Patterns", "Schema Patterns")
- Discovery category (e.g., "Configuration Discoveries", "Ecosystem Discoveries")

### Backup Verification (PreToolUse) Pattern

PreToolUse hooks should protect config files by requiring dated backups before edits.

**Reference Implementation:** `plugins/hyper-dev/hooks/verify-hyper-backup.js`

**Key Features:**
1. Check if target file matches protected patterns
2. Look for backup with today's date: `{file}.bak.YYYY-MM-DD`
3. Block with clear instructions if no backup found
4. Always allow on errors (fail open)

### Agent Frontmatter Standards

All agents should include these fields:

```yaml
---
name: agent-name
description: |
  Description with trigger phrases.

  <example>
  Context: When this triggers
  user: "example request"
  assistant: "I'll use the agent-name agent to handle this."
  <commentary>
  Why this triggers the agent.
  </commentary>
  </example>
tools:
  - Read
  - Bash
  - Grep
  - Glob
  - WebFetch
model: sonnet
---
```

**Required Fields:**
- `name`: kebab-case identifier
- `description`: Multi-line with trigger phrases AND example block(s)
- `tools`: Minimal set needed for the agent's task
- `model`: Usually `sonnet` for troubleshooting agents

### Cache Architecture Standards

All plugins with caching should follow this structure:

```
.cache/
├── sources.json           # What to fetch and when
├── {plugin}-config.json   # Installation/version detection
├── docs-index.json        # Fetch timestamps
└── learnings.md           # Docs + user learnings
```

**sources.json Schema:**
```json
{
  "$schema": "https://anthropic.com/claude-code/cache-sources.schema.json",
  "refresh_interval_days": 7,
  "sources": [
    {
      "name": "Source Name",
      "url": "https://example.com/docs",
      "prompt": "Instructions for extracting content",
      "section": "Section header in learnings.md"
    }
  ],
  "preserve_sections": ["Learnings", "Successful Patterns", "Mistakes to Avoid"]
}
```

**learnings.md Format:**
```markdown
---
last_refresh: YYYY-MM-DD
cache_version: 1
learnings_count: N
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

### Section Name
[Cached content]

## Learnings

### Successful Patterns
[User learnings - preserved across refreshes]

### Mistakes to Avoid
[User learnings - preserved across refreshes]
```

### Stale File Cleanup

When plugins are updated via `/plugin install`, old files persist on disk (Claude Code has no uninstall lifecycle). The **manifest-based cleanup** pattern detects and removes orphaned files.

**Components:**
- `plugin-manifest.json` — Declarative file list shipped with each plugin version
- `hooks/stale-cleanup.js` — SessionStart hook that diffs manifest vs disk, removes stale files
- `.cache/cleanup-state.json` — Tracks which version was last cleaned (prevents re-running)
- `scripts/generate-plugin-manifest.js` — Developer tool to regenerate manifests before release

**plugin-manifest.json Schema:**
```json
{
  "version": "X.Y.Z",
  "preserve": [".cache/", ".claude-plugin/"],
  "files": ["relative/path/to/file.md", "..."]
}
```

- `preserve`: Directory prefixes never touched (protects user data and plugin metadata)
- `files`: Every file in the plugin, relative to plugin root (includes itself)

**Adoption Status:**

| Plugin | Manifest | Cleanup Hook |
|--------|----------|-------------|
| agent-teams | Yes | Yes |

**Workflow:** `/bump-version` regenerates the manifest automatically. `/pre-release` validates manifest version and file list. New plugins can adopt by running `node scripts/generate-plugin-manifest.js plugins/<name>` and adding the stale-cleanup hook.

## Official Documentation

- **Claude Code Plugins Reference**: https://code.claude.com/docs/en/plugins-reference
  - Complete technical reference for plugin manifest schema, CLI commands, and component specifications
  - Plugin components: skills, agents, hooks, MCP servers, LSP servers
  - Hook events: PreToolUse, PostToolUse, Stop, SubagentStop, SessionStart, SessionEnd, UserPromptSubmit, PreCompact, Notification
  - Hook types: command, prompt, agent
  - Environment variables: `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PROJECT_DIR}`

- **Status Line Configuration**: https://code.claude.com/docs/en/statusline
  - Custom status line displayed at bottom of Claude Code interface

---

*Last updated: See git history for this file*
