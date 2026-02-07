# Functional Claude

Claude Code plugins for enhanced terminal and development workflows.

## Quick Start

```
/plugin marketplace add nthplusio/functional-claude
/plugin install <plugin-name>@functional-claude
```

## Available Plugins

### Terminal Configuration

| Plugin | Description | Install |
|--------|-------------|---------|
| [wezterm-dev](#wezterm-dev) | WezTerm terminal configuration | `/plugin install wezterm-dev@functional-claude` |
| [hyper-dev](#hyper-dev) | Hyper terminal configuration | `/plugin install hyper-dev@functional-claude` |
| [tabby-dev](#tabby-dev) | Tabby terminal configuration | `/plugin install tabby-dev@functional-claude` |

### Development Workflows

| Plugin | Description | Install |
|--------|-------------|---------|
| [prisma-dev](#prisma-dev) | Prisma ORM development | `/plugin install prisma-dev@functional-claude` |
| [shadcn-dev](#shadcn-dev) | shadcn/ui and Tailwind CSS v4 | `/plugin install shadcn-dev@functional-claude` |
| [opentui-dev](#opentui-dev) | OpenTUI terminal interfaces | `/plugin install opentui-dev@functional-claude` |
| [pre-commit](#pre-commit) | Pre-push quality checks | `/plugin install pre-commit@functional-claude` |
| [dev-workflow](#dev-workflow) | Plan validation and gut-checks | `/plugin install dev-workflow@functional-claude` |

### Plugin Authoring & Orchestration

| Plugin | Description | Install |
|--------|-------------|---------|
| [claude-plugin-dev](#claude-plugin-dev) | Plugin development guide | `/plugin install claude-plugin-dev@functional-claude` |
| [agent-teams](#agent-teams) | Multi-agent team coordination | `/plugin install agent-teams@functional-claude` |

---

## Plugin Details

### wezterm-dev

WezTerm terminal configuration and customization for Claude Code workflows. Includes tmux-style keybindings, visual effects, custom tab bars with Nerd Font icons, and Agent Deck integration for monitoring Claude Code agents.

**Skills:** wezterm-dev, wezterm-keybindings, wezterm-visual, wezterm-tabs, wezterm-agent-deck

**Say things like:**
- "configure WezTerm" / "wezterm config"
- "add tmux-style keybindings" / "leader key"
- "set terminal opacity" / "blur" / "theme"
- "create tab bar with icons"
- "set up Agent Deck"

---

### hyper-dev

Hyper terminal configuration and plugin development for Claude Code workflows. Covers keybindings, visual customization, theme creation, and building Hyper plugins with the Electron/React API.

**Skills:** hyper-dev, hyper-keybindings, hyper-visual, hyper-plugins, hyper-themes, hyper-ecosystem

**Say things like:**
- "configure Hyper" / "hyper config"
- "hyper keybindings" / "shortcuts"
- "hyper opacity" / "colors" / "cursor"
- "create hyper plugin" / "decorateConfig"
- "create hyper theme" / "popular hyper plugins"

---

### tabby-dev

Tabby terminal configuration, SSH connections, and plugin development. Covers visual customization, hotkeys, SSH/serial/telnet connection profiles, and discovering or building Tabby plugins.

**Skills:** tabby-dev, tabby-visual, tabby-keybindings, tabby-connections, tabby-plugins

**Say things like:**
- "configure Tabby" / "tabby config"
- "tabby theme" / "colors" / "font"
- "tabby hotkeys" / "shortcuts"
- "ssh profile" / "serial connection"
- "tabby plugin" / "install plugin"

---

### prisma-dev

Prisma ORM development with schema analysis, migration safety, and query guidance. Automatically analyzes your schema on session start and provides context-aware help for models, migrations, and queries.

**Skills:** prisma-dev, prisma-schema, prisma-migrations, prisma-queries, prisma-recon

**Say things like:**
- "prisma model" / "schema.prisma" / "relations"
- "prisma migrate" / "migration history"
- "prisma client" / "findMany" / "transactions"
- "analyze prisma" / "schema recon"

---

### shadcn-dev

shadcn/ui and Tailwind CSS v4 development workflows for React applications. Covers component usage, form building with react-hook-form/zod, theming, data tables with TanStack Table, and Tailwind CSS v4 migration.

**Skills:** shadcn-dev, shadcn-components, shadcn-forms, shadcn-theming, shadcn-data-tables, tailwindv4

**Commands:** `/shadcn-dev`, `/shadcn-recon`

**Say things like:**
- "set up shadcn" / "shadcn init"
- "add button" / "create dialog" / "dropdown menu"
- "form validation" / "zod schema" / "useForm"
- "dark mode" / "theme colors"
- "data table" / "sortable table"
- "tailwind v4" / "css-first config"

---

### opentui-dev

OpenTUI terminal interface development with TypeScript/Bun. Covers the Core imperative API, React reconciler, and Solid reconciler for building interactive terminal UIs with components, flexbox layout, keyboard handling, and animations.

**Skills:** opentui-dev, opentui-components, opentui-layout, opentui-keyboard, opentui-animation

**Command:** `/opentui-scaffold`

**Say things like:**
- "build a TUI" / "terminal interface"
- "text component" / "input field" / "select"
- "layout" / "flexbox" / "positioning"
- "keyboard shortcuts" / "key events"
- "animation" / "timeline" / "easing"

---

### pre-commit

Pre-push quality checks with auto-detection for JavaScript/TypeScript, Python, Rust, and Go projects. Configurable enforcement (block or warn) for typechecking, linting, building, and testing.

**Skills:** pre-commit-setup

**Say things like:**
- "set up pre-commit" / "configure pre-push checks"
- "add typecheck hooks" / "lint before push"

---

### dev-workflow

Development workflow validation and planning tools. Integrates a validation checklist into plan mode and provides a gut-check agent that reviews implementation plans before coding begins.

**Skills:** plan-validation

**Say things like:**
- "create a plan" / "plan the implementation"
- "gut check this plan" / "validate this plan"
- "sanity check before implementing"

---

### claude-plugin-dev

Documentation and conventions for building Claude Code plugins. Guided workflows for creating skills, agents, hooks, commands, and MCP integrations. Includes AI-assisted agent creation and plugin validation.

**Skills:** claude-plugin-dev, plugin-structure, skill-development, agent-development, hook-development, mcp-integration, command-development, plugin-settings

**Command:** `/create-plugin`

**Say things like:**
- "create a plugin" / "plugin structure"
- "create a skill" / "skill frontmatter"
- "create an agent" / "agent tools"
- "create a hook" / "PreToolUse"
- "add MCP server" / ".mcp.json"
- "create a command" / "slash command"

---

### agent-teams

Agent team blueprints and coordination patterns for parallel development. Pre-designed team configurations for research, feature development, code review, and debugging with multi-agent collaboration.

**Skills:** agent-teams, team-blueprints, team-coordination

**Commands:** `/agent-teams`, `/spawn-research-team`, `/spawn-feature-team`, `/spawn-review-team`, `/spawn-debug-team`

**Say things like:**
- "create a team" / "coordinate agents"
- "research team" / "feature team"
- "review team" / "debug team"
- "team communication" / "delegate mode"

---

## Development

To test plugins locally:

```bash
claude --plugin-dir ./plugins/wezterm-dev
```

To sync plugin versions (updates all 4 locations):

```bash
node scripts/sync-version.js <plugin-name> <new-version>
```

## License

MIT
