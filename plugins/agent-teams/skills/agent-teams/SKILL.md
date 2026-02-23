---
name: agent-teams
description: |
  This skill should be used when the user asks about Claude Code agent teams, wants to understand team-based development workflows, or needs guidance on when and how to use agent teams. Use this skill when the user asks to "create a team", "use agent teams", "coordinate agents", "parallel development", "team workflow", or says "how do agent teams work".

  This skill provides an overview of agent teams, when to use them vs subagents, and routes to focused skills for team blueprints and coordination patterns.
version: 0.18.0
---

# Agent Teams for Application Development

Agent teams let you coordinate multiple Claude Code sessions working together on complex tasks. One session acts as the **team lead** coordinating work, while **teammates** work independently in their own context windows and communicate directly with each other.

## When to Use Agent Teams

Agent teams are most effective when parallel exploration adds real value:

| Use Case | Why Teams Excel |
|----------|----------------|
| **Research & Discovery** | Multiple teammates investigate different aspects simultaneously |
| **Feature Development** | Teammates each own a separate module without stepping on each other |
| **Code Review & QA** | Reviewers apply different lenses (security, performance, tests) in parallel |
| **Debugging** | Teammates test competing hypotheses and challenge each other's findings |
| **Frontend Design** | Product, design, development, and accessibility perspectives in creative tension |
| **Planning & Roadmapping** | Strategic, dependency, outcomes, and stakeholder perspectives funnel into actionable phase briefs |
| **Productivity Systems** | Sequential persona pipeline discovers, designs, reviews, refines, and compounds workflow improvements |
| **Brainstorming & Ideation** | Structured divergence/convergence with independent brainwriting, user feedback gate, and idea refinement |
| **Cross-Layer Coordination** | Frontend, backend, and test changes each owned by a different teammate |

### Agent Teams vs Subagents

| Aspect | Subagents | Agent Teams |
|--------|-----------|-------------|
| **Context** | Own window; results return to caller | Own window; fully independent |
| **Communication** | Report back to main agent only | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Shared task list with self-coordination |
| **Best for** | Focused tasks where only the result matters | Complex work requiring discussion and collaboration |
| **Token cost** | Lower (results summarized back) | Higher (each teammate is a separate instance) |

**Rule of thumb:** Use subagents for quick, focused workers. Use agent teams when teammates need to share findings, challenge each other, and coordinate independently.

### When NOT to Use Teams

Teams add ~40 coordination tool calls of overhead per team created (TaskCreate + TaskUpdate + SendMessage). Skip teams and use plan-then-implement when:
- Fewer than 3 genuinely parallel workstreams
- A single agent can hold all necessary context
- The task is primarily sequential
- Total expected work is under ~30 minutes

### Team Sizing Guidelines

| Constraint | Guideline |
|------------|-----------|
| Teams per session | Max 2 (sessions with 7+ teams spent ~50% of turns on coordination) |
| Tasks per team | Cap at 8 (beyond this, TaskUpdate churn dominates) |
| Agents per team | 3-4 preferred (lead + 2-3 specialists) |
| Messages | Batch instructions into one SendMessage per teammate |

## Prerequisites

Agent teams are experimental and must be enabled:

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Quick Start

Tell Claude to create a team using natural language:

```
Create an agent team with 3 teammates to [describe your task].
Have one teammate focus on [aspect 1], one on [aspect 2], and one on [aspect 3].
```

Claude creates the team, spawns teammates, assigns tasks, and coordinates work based on your prompt.

## Available Skills

| Skill | Purpose | Example Triggers |
|-------|---------|-----------------|
| **team-blueprints** | Pre-designed team configurations for 8 development phases | "research team", "feature team", "review team", "debug team", "design team", "planning team", "productivity team", "brainstorming team" |
| **team-coordination** | Task management, messaging, plan approval, shutdown | "manage tasks", "team communication", "delegate mode" |
| **team-personas** | Reusable behavioral profiles with deep methodology and scoring | "personas", "behavioral profiles", "productivity loop", "auditor persona" |

## Available Commands

| Command | Description |
|---------|-------------|
| `/agent-teams` | Plugin overview and quickstart |
| `/spawn-build` | Spawn a feature development or debugging team (modes: feature, debug) |
| `/spawn-think` | Spawn a research, planning, or review team (modes: research, planning, review) |
| `/spawn-create` | Spawn a design, brainstorming, or productivity team (modes: design, brainstorm, productivity) |

## Team Architecture

An agent team consists of:

| Component | Role |
|-----------|------|
| **Team Lead** | The main Claude Code session that creates the team, spawns teammates, and coordinates |
| **Teammates** | Separate Claude Code instances that each work on assigned tasks |
| **Task List** | Shared list of work items that teammates claim and complete |
| **Mailbox** | Messaging system for direct communication between agents |

Teams and tasks are stored locally:
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

## Best Practices

1. **Give teammates enough context** — They load CLAUDE.md but don't inherit the lead's conversation history. Include task-specific details in spawn prompts.
2. **Size tasks appropriately** — Not too small (coordination overhead), not too large (long without check-ins). Self-contained units with clear deliverables.
3. **Avoid file conflicts** — Break work so each teammate owns different files.
4. **Monitor and steer** — Check progress, redirect approaches, synthesize findings.
5. **Start with research** — If new to teams, start with review/research tasks before parallel implementation.

## Reference Documentation

For complete API documentation, tool descriptions, and detailed patterns, see:
`${CLAUDE_PLUGIN_ROOT}/skills/agent-teams/references/agent-teams-reference.md`
