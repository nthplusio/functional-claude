---
name: tabby-dev
description: Get Tabby terminal development overview, project status, and guidance on available skills
argument-hint: [topic]
---

# Tabby Terminal Development Overview

Provide the user with Tabby terminal development guidance based on the current configuration context.

## Instructions

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/tabby-dev/SKILL.md` for the full overview skill content
2. Read reference files in `${CLAUDE_PLUGIN_ROOT}/skills/tabby-dev/references/` as needed

## Topic Routing

If `$ARGUMENTS` specifies a topic, focus on that area:

| Argument | Action |
|----------|--------|
| `visual` | Theme, colors, fonts, appearance - use tabby-visual skill knowledge |
| `keys` | Keybindings and hotkeys - use tabby-keybindings skill knowledge |
| `ssh` | SSH connections and profiles - use tabby-connections skill knowledge |
| `serial` | Serial port connections - use tabby-connections skill knowledge |
| `connections` | All connection types - use tabby-connections skill knowledge |
| `plugins` | Plugin discovery and development - use tabby-plugins skill knowledge |
| `status` | Show current installation detection |

## Default Overview (no arguments)

If no arguments provided, present:

1. **Installation Status** - What the SessionStart hook detected (version, config path)
2. **Available Skills** - List the 4 focused skills with their trigger phrases
3. **Quick Reference** - Config location, YAML format, key settings
4. **Troubleshooting** - Mention the tabby-troubleshoot agent for debugging
5. **Configuration Analysis** - Suggest `/tabby-recon` for a deeper audit

## Available Focused Skills

| Skill | Topic | Example Triggers |
|-------|-------|-----------------|
| tabby-visual | Themes, colors, fonts, appearance | "tabby theme", "color scheme" |
| tabby-keybindings | Hotkeys, shortcuts, multi-chord | "tabby hotkeys", "keybindings" |
| tabby-connections | SSH, serial, telnet profiles | "ssh profile", "serial connection" |
| tabby-plugins | Plugin discovery and development | "tabby plugin", "install plugin" |
