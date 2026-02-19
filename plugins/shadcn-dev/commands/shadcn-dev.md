---
name: shadcn-dev
description: Get shadcn/ui development overview, project status, and guidance on available skills
argument-hint: [topic]
---

# shadcn/ui Development Overview

Provide the user with shadcn/ui development guidance based on the current project context.

## Instructions

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/shadcn-dev/SKILL.md` for the full overview skill content
2. Read reference files in `${CLAUDE_PLUGIN_ROOT}/skills/shadcn-dev/references/` as needed

## Topic Routing

If `$ARGUMENTS` specifies a topic, focus on that area:

| Argument | Action |
|----------|--------|
| `setup` | Guide through project initialization with `npx shadcn@latest init` |
| `components` | Component usage and customization - use shadcn-components skill knowledge |
| `forms` | Form building with react-hook-form + zod - use shadcn-forms skill knowledge |
| `theming` | Theme and dark mode setup - use shadcn-theming skill knowledge |
| `tables` | Data table setup with TanStack Table - use shadcn-data-tables skill knowledge |
| `tailwind` | Tailwind CSS v4 configuration - use tailwindv4 skill knowledge |
| `status` | Show current project detection from components.json |

## Default Overview (no arguments)

If no arguments provided, present:

1. **Project Status** - What the SessionStart hook detected (style, components count, config path)
2. **Available Skills** - List the 5 focused skills with their trigger phrases
3. **Quick Reference** - CLI commands, key dependencies, project structure
4. **Troubleshooting** - Mention the shadcn-troubleshoot agent for debugging
5. **Project Analysis** - Suggest `/shadcn-recon` for a deeper audit

## Available Focused Skills

| Skill | Topic | Example Triggers |
|-------|-------|-----------------|
| shadcn-components | Component usage and customization | "add button", "dialog component" |
| shadcn-forms | react-hook-form + zod integration | "form validation", "zod schema" |
| shadcn-theming | CSS variables, dark mode, colors | "dark mode", "theme colors" |
| shadcn-data-tables | TanStack Table integration | "data table", "sortable table" |
| tailwindv4 | Tailwind CSS v4 features | "tailwind v4", "@theme block" |
