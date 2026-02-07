---
name: agent-teams
description: Overview of agent teams plugin with available commands, skills, and quickstart guidance
argument-hint: [topic]
---

# Agent Teams Plugin Overview

Provide the user with agent teams guidance based on the current context.

## Instructions

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/agent-teams/SKILL.md` for the full overview
2. Check if agent teams are enabled by looking for `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` in the user's environment

## Topic Routing

If `$ARGUMENTS` specifies a topic, focus on that area:

| Argument | Action |
|----------|--------|
| `setup` | Guide through enabling agent teams in settings.json |
| `blueprints` | Show all 4 team blueprints with use cases — use team-blueprints skill |
| `research` | Detail the Research & Discovery team blueprint |
| `feature` | Detail the Feature Development team blueprint |
| `review` | Detail the Code Review & QA team blueprint |
| `debug` | Detail the Debugging & Investigation team blueprint |
| `coordination` | Team management and communication — use team-coordination skill |
| `reference` | Show API reference — read the reference document |

## Default Overview (no arguments)

If no arguments provided, present:

1. **Status** — Whether agent teams are enabled
2. **Available Commands** — List the 5 slash commands:
   - `/spawn-research-team <topic>` — Parallel research with Explorer, Analyst, Critic
   - `/spawn-feature-team <feature>` — Feature development with Frontend, Backend, Tester
   - `/spawn-review-team <target>` — Code review with Security, Performance, Quality reviewers
   - `/spawn-debug-team <bug>` — Bug investigation with competing hypothesis investigators
   - `/agent-teams [topic]` — This overview command
3. **Available Skills** — List the 3 focused skills:
   - `agent-teams` — Overview and concepts
   - `team-blueprints` — Pre-designed team configurations
   - `team-coordination` — Task management and communication patterns
4. **Team Architect Agent** — Mention the team-architect agent for custom team design
5. **Quick Start** — Show the simplest way to spawn a team

## Quick Start Example

```
# Enable agent teams (one-time setup)
Add to settings.json: { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }

# Spawn a team using a command
/spawn-research-team authentication approaches for our API

# Or describe what you need in natural language
Create an agent team to review PR #42 from security and performance angles
```
