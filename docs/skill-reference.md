# Skill Reference

Quick reference for all skills across the functional-claude marketplace. Find the right skill by use case or trigger phrase.

## Terminal Configuration

### wezterm-dev (5 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| wezterm-dev | General WezTerm config, overview | "configure WezTerm", "wezterm config", "wezterm lua" |
| wezterm-keybindings | Tmux-style keybindings, pane management | "leader key", "tmux-style", "pane splitting", "vim-style navigation" |
| wezterm-visual | Opacity, blur, cursor, themes | "terminal opacity", "blur", "cursor style", "color scheme", "catppuccin" |
| wezterm-tabs | Tab bar with Nerd Font process icons | "tab bar", "nerd font icons", "process icons", "tab colors" |
| wezterm-agent-deck | Agent Deck for Claude Code monitoring | "agent deck", "claude monitoring", "agent status", "agent counts" |

### hyper-dev (6 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| hyper-dev | General Hyper config, overview | "configure Hyper", "hyper config", "hyper.js" |
| hyper-keybindings | Keyboard shortcuts | "hyper keybindings", "hyper keys", "hyper shortcuts" |
| hyper-visual | Opacity, colors, cursor, fonts | "hyper opacity", "hyper blur", "hyper colors", "hyper cursor" |
| hyper-plugins | Plugin development (Electron/React) | "create hyper plugin", "decorateConfig", "hyper redux", "hyper api" |
| hyper-themes | Theme creation and publishing | "create hyper theme", "hyper color scheme", "publish hyper theme" |
| hyper-ecosystem | Plugin discovery and recommendations | "popular hyper plugins", "find hyper plugin", "plugin recommendations" |

### tabby-dev (5 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| tabby-dev | General Tabby config, overview | "configure Tabby", "tabby config", "tabby terminal" |
| tabby-visual | Themes, colors, fonts, appearance | "tabby theme", "tabby colors", "tabby font", "tabby opacity" |
| tabby-keybindings | Hotkeys and multi-chord shortcuts | "tabby keybindings", "tabby hotkeys", "tabby shortcuts" |
| tabby-connections | SSH, serial, telnet profiles | "tabby ssh", "ssh profile", "serial connection", "port forwarding" |
| tabby-plugins | Plugin discovery and development | "tabby plugin", "install tabby plugin", "tabby marketplace" |

## Development Workflows

### prisma-dev (5 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| prisma-dev | General Prisma guidance, overview | "configure prisma", "prisma orm", "work with prisma" |
| prisma-schema | Schema design, models, relations | "prisma model", "schema.prisma", "prisma relations", "@@index", "prisma enum" |
| prisma-migrations | Migration workflows and safety | "prisma migrate", "database migration", "migrate dev", "rollback migration" |
| prisma-queries | Query patterns, CRUD operations | "prisma client", "findMany", "create", "prisma transactions", "nested writes" |
| prisma-recon | Repository analysis, schema scanning | "analyze prisma", "schema recon", "what models exist", "check prisma config" |

### shadcn-dev (6 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| shadcn-dev | Project setup, overview | "set up shadcn", "configure shadcn", "shadcn init" |
| shadcn-components | Component usage and customization | "add button", "create dialog", "dropdown menu", "shadcn accordion" |
| shadcn-forms | Forms with react-hook-form + zod | "form validation", "zod schema", "useForm hook", "form errors" |
| shadcn-theming | Dark mode, colors, CSS variables | "dark mode", "theme colors", "css variables", "color scheme" |
| shadcn-data-tables | TanStack Table integration | "data table", "sortable table", "column sorting", "row selection" |
| tailwindv4 | Tailwind CSS v4 features and migration | "tailwind v4", "css-first config", "oklch colors", "migrate to tailwind 4" |

### opentui-dev (5 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| opentui-dev | Framework overview, project setup | "build a TUI", "OpenTUI", "terminal interface" |
| opentui-components | UI components reference | "text component", "input field", "select", "textarea", "ascii-font" |
| opentui-layout | Flexbox layout system | "layout", "flexbox", "positioning", "spacing" |
| opentui-keyboard | Keyboard input handling | "keyboard shortcuts", "key events", "focus management" |
| opentui-animation | Timeline animations and easing | "animation", "timeline", "easing", "transitions" |

### pre-commit (1 skill)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| pre-commit-setup | Configure pre-push quality checks | "set up pre-commit", "configure pre-push checks", "add typecheck hooks" |

### dev-workflow (1 skill)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| plan-validation | Checklist for implementation plans | "create a plan", "plan the implementation", "enter plan mode" |

## Plugin Authoring & Orchestration

### claude-plugin-dev (8 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| claude-plugin-dev | Plugin development overview | "create a plugin", "plugin structure", "how do plugins work" |
| plugin-structure | Directory layout and manifest | "plugin layout", "plugin.json", "plugin directories" |
| skill-development | Writing SKILL.md files | "create a skill", "skill frontmatter", "skill description" |
| agent-development | Writing AGENT.md files | "create an agent", "subagent", "agent tools" |
| hook-development | Creating hooks.json | "create a hook", "PreToolUse", "hook events" |
| mcp-integration | MCP server configuration | "add MCP server", ".mcp.json", "external tools" |
| command-development | Writing slash commands | "create a command", "slash command", "$ARGUMENTS" |
| plugin-settings | User configuration patterns | ".local.md", "plugin settings", "configuration file" |

### agent-teams (3 skills)

| Skill | What It Does | Trigger Phrases |
|-------|-------------|-----------------|
| agent-teams | Overview, when to use teams | "agent teams", "create a team", "coordinate agents" |
| team-blueprints | Pre-designed team configurations | "research team", "feature team", "review team", "debug team" |
| team-coordination | Task management, messaging, lifecycle | "manage tasks", "team communication", "delegate mode" |

## Common Workflows

These plugin combinations work well together:

| Workflow | Plugins | Description |
|----------|---------|-------------|
| React development | shadcn-dev + pre-commit | UI components with quality gates before push |
| Database work | prisma-dev + dev-workflow | Schema changes with plan validation |
| Terminal setup | wezterm-dev *or* hyper-dev *or* tabby-dev | Pick one for your terminal emulator |
| Plugin authoring | claude-plugin-dev + dev-workflow | Build plugins with plan-first workflow |
| Team projects | agent-teams + dev-workflow | Multi-agent coordination with plan validation |
