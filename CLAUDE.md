# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository (`nthplusio/functional-claude`) containing plugins for enhanced terminal and development workflows. The repository follows the Claude Code plugin marketplace structure.

**Security:** This is a public repository. A PreToolUse hook validates all file writes to prevent committing sensitive information (API keys, tokens, credentials, .env files, private URLs).

## Repository Memory

**When working with marketplace structure, plugins, hooks, skills, or version management, always read `docs/memory.md` first.** This file contains accumulated knowledge about:
- Current plugin versions and synchronization requirements
- Directory structure and file schemas
- Hook patterns and environment variables
- Skill structure and conventions
- Development workflows and best practices

## Development Commands

**Test a plugin locally:**
```bash
claude --plugin-dir ./plugins/wezterm-dev
```

**Install from marketplace (for users):**
```
/plugin marketplace add nthplusio/functional-claude
/plugin install wezterm-dev@functional-claude
```

## Architecture

### Marketplace Structure

```
.claude-plugin/
  plugin.json           # Root plugin manifest
  marketplace.json      # Marketplace manifest - lists all available plugins
hooks/
  hooks.json            # Root-level hooks (security validation)
skills/
  <skill-name>/         # Root-level skills (functional-claude development)
plugins/
  <plugin-name>/        # Each plugin is a directory
    .claude-plugin/
      plugin.json       # Plugin manifest (name, version, description)
    hooks/
      hooks.json        # PreToolUse/PostToolUse hooks
    skills/
      <skill-name>/
        SKILL.md        # Skill definition with frontmatter
        examples/       # Example code for the skill
        references/     # Reference documentation
```

### Key Files

- **`marketplace.json`**: Declares plugins available in the marketplace with source paths and versions
- **`plugin.json`**: Per-plugin metadata - version must match `marketplace.json`
- **`SKILL.md`**: Skill definition with YAML frontmatter (name, description, version) followed by markdown content
- **`hooks.json`**: Array of hook definitions for events like `PreToolUse`, `PostToolUse`

### Version Management

Plugin versions must be kept in sync across:
1. `plugins/<name>/.claude-plugin/plugin.json`
2. `.claude-plugin/marketplace.json`
3. `skills/<skill-name>/SKILL.md` frontmatter (if skill has version)

## Root-Level Components

### functional-claude skill

Development guidance for this repository:
- Plugin creation workflow
- Version synchronization
- Security requirements for public repo

### Security hook

PreToolUse hook on Write/Edit that validates no sensitive data is committed.

## Current Plugins

### wezterm-dev (v0.6.5)

WezTerm terminal configuration skill with:
- Lua configuration patterns
- Tmux-style keybindings
- Nerd Font icon reference
- Agent Deck integration for Claude Code monitoring
- PreToolUse hook to enforce config backup before edits

### hyper-dev (v0.1.5)

Hyper terminal configuration and plugin development skill with:
- JavaScript/React configuration
- Plugin development patterns
- Theme creation
- PreToolUse hook to enforce config backup before edits
