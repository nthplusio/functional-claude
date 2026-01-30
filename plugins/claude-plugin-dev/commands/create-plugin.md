---
name: create-plugin
description: Guided workflow to create a complete Claude Code plugin with interactive prompts
allowed-tools: Read, Write, Bash, Glob, Grep, AskUserQuestion
---

# Create Plugin Workflow

Guide the user through creating a complete Claude Code plugin in 8 phases. Use AskUserQuestion at each decision point to ensure the plugin meets their needs.

## Phase 1: Discovery

Use AskUserQuestion to understand the plugin:

**Questions to ask:**
1. What problem does this plugin solve?
2. What domain does it cover? (terminal, database, framework, etc.)
3. Who is the target user?

**Example questions:**
```
"What is the main purpose of your plugin?"
Options:
- Development workflow (testing, linting, CI/CD)
- Terminal customization
- Framework/library guidance
- Database management
- Other (describe)
```

**Capture:**
- Plugin name (kebab-case)
- Brief description
- Core use cases

## Phase 2: Component Planning

Determine what components the plugin needs:

**Questions to ask:**
1. Does it need conceptual guidance? → Skills
2. Does it need autonomous specialists? → Agents
3. Does it need user-triggered actions? → Commands
4. Does it need event automation? → Hooks
5. Does it need external tools? → MCP servers

**For each component type identified:**
- How many of this type?
- What are their names and purposes?

**Use AskUserQuestion:**
```
"What components does your plugin need?"
Options (multiSelect: true):
- Skills (conceptual guidance, documentation)
- Agents (autonomous specialists for complex tasks)
- Commands (user-triggered actions with /command)
- Hooks (event-driven automation)
- MCP servers (external tool integration)
```

## Phase 3: Detailed Design

For each component, clarify:

**Skills:**
- What topics does each cover?
- What trigger phrases should invoke it?
- Does it need reference files?

**Agents:**
- What tasks does each perform?
- What tools does it need?
- Should it trigger proactively?

**Commands:**
- What action does each perform?
- What arguments does it take?
- What tools does it need?

**Hooks:**
- What events should trigger it?
- What should it validate/check?
- What tools should be matched?

**Use skill-specific questions:**
```
"For your main skill '[name]', what topics should it cover?"
Options:
- Setup and configuration
- Common patterns and workflows
- Troubleshooting
- Best practices
- All of the above
```

## Phase 4: Structure Creation

Create the plugin directory structure:

```
$ARGUMENTS/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── [skill-name]/
│       ├── SKILL.md
│       └── references/
├── agents/
│   └── [agent-name]/
│       └── AGENT.md
├── commands/
│   └── [command-name].md
├── hooks/
│   └── hooks.json
├── .cache/
│   └── .gitignore
└── README.md
```

**Steps:**
1. Create directory structure
2. Create plugin.json with name, version, description
3. Create .gitignore for .cache/
4. Create README.md skeleton

**Verify:** Show created structure to user

## Phase 5: Component Implementation

For each component, use the appropriate helper:

**Skills:** Load `/claude-plugin-dev:skill-development` for guidance
**Agents:** Use `agent-creator` agent to design
**Commands:** Load `/claude-plugin-dev:command-development` for guidance
**Hooks:** Load `/claude-plugin-dev:hook-development` for guidance

**For each skill:**
1. Create SKILL.md with proper frontmatter
2. Write concise core content (~1,500 words)
3. Create references/ if detailed content needed
4. Review with `skill-reviewer` agent

**For each agent:**
1. Use `agent-creator` to design interactively
2. Generate AGENT.md with examples
3. Verify tool list is appropriate

**For each command:**
1. Create command file with frontmatter
2. Write clear instructions
3. Add argument handling

**For each hook:**
1. Add to hooks.json
2. Create hook script if needed
3. Test exit codes

## Phase 6: Validation

Run the plugin-validator agent:

```
Use the plugin-validator agent to check the plugin at ./$ARGUMENTS
```

**Address any issues:**
- Errors: Must fix before proceeding
- Warnings: Should fix for quality
- Info: Consider for polish

## Phase 7: Testing

Guide user through testing:

**Test command:**
```bash
claude --plugin-dir ./$ARGUMENTS
```

**Test checklist:**
- [ ] Skills load when triggered
- [ ] Agents delegate correctly
- [ ] Commands execute properly
- [ ] Hooks fire on events

**Use AskUserQuestion:**
```
"Did the plugin load successfully?"
Options:
- Yes, everything works
- Skills aren't loading
- Agents aren't triggering
- Commands not found
- Hooks not firing
- Other issue
```

**If issues:** Help debug based on reported problem

## Phase 8: Documentation

Finalize the README.md:

**Include:**
- Plugin description
- Installation instructions
- Component list with descriptions
- Configuration (if .local.md used)
- Examples

**README template:**
```markdown
# [Plugin Name]

[Brief description]

## Installation

```bash
claude --plugin-dir ./[plugin-name]
```

## Components

### Skills

| Skill | Description |
|-------|-------------|
| [name] | [description] |

### Agents

| Agent | Description |
|-------|-------------|
| [name] | [description] |

### Commands

| Command | Description |
|---------|-------------|
| /[name] | [description] |

## Usage

[Examples of common workflows]

## Configuration

[If applicable, document .local.md options]
```

## Progress Tracking

Use TodoWrite to track progress:

```
Phase 1: Discovery        [ ]
Phase 2: Component Plan   [ ]
Phase 3: Detailed Design  [ ]
Phase 4: Structure        [ ]
Phase 5: Implementation   [ ]
Phase 6: Validation       [ ]
Phase 7: Testing          [ ]
Phase 8: Documentation    [ ]
```

Mark each phase complete as you go.

## Workflow Summary

1. **Discovery** → Understand plugin purpose
2. **Component Planning** → Decide what's needed
3. **Detailed Design** → Clarify each component
4. **Structure Creation** → Create files/directories
5. **Implementation** → Build each component
6. **Validation** → Run plugin-validator
7. **Testing** → Test with --plugin-dir
8. **Documentation** → Complete README

Ask before proceeding to each phase. Validate user satisfaction at each step.
