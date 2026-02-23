---
name: team-personas
description: |
  This skill should be used when the user asks about personas for agent teams, wants to understand how to apply deep behavioral profiles to teammates, or needs guidance on the productivity loop. Use this skill when the user asks about "personas", "behavioral profiles", "productivity loop", "auditor persona", "architect persona", "analyst persona", "refiner persona", "compounder persona", or says "what personas are available" or "how do personas work".

  Provides 8 reusable persona definitions that add deep methodology, scoring criteria, and interaction patterns to agent team teammates.
version: 0.19.0
---

# Team Personas

Deep behavioral profiles that transform brief teammate role descriptions into structured, methodology-driven agents. While team blueprints define *what* each teammate does, personas define *how* they think, score, iterate, and interact.

## What Are Personas

A **persona** is a reusable behavioral profile that gives a teammate:

- **Structured methodology** — Named phases with specific steps and outputs
- **Scoring criteria** — Quantitative dimensions for evaluating work quality
- **Interaction patterns** — When to pause, check in, validate, and hand off
- **Input/output contracts** — What each persona consumes and produces

**Brief role description (blueprint-style):**
> Analyst — Review the architecture for quality, reliability, and performance issues.

**Persona-enhanced (full behavioral profile):**
> A Senior Engineering Analyst who evaluates through 4 sequential passes (Architecture → Code Quality → Reliability → Performance), rates each dimension 1-10 with specific evidence, produces a tradeoff matrix, and pauses after each pass to share findings before continuing.

Personas are optional — blueprints work fine with brief role descriptions. Use personas when you need consistent methodology, reproducible quality, or when a teammate's *process* matters as much as their output.

**Two approaches to teammate behavior:** Deep personas (reference files with scored methodology phases) and rich inline role descriptions (detailed instructions embedded directly in the spawn prompt). The planning team uses rich inline descriptions because its 7 modes each need distinct role definitions that don't map to reusable persona files. The productivity and brainstorming teams use deep persona files because their roles have consistent methodology across uses. Choose the approach that fits: persona files for reusable methodology, inline descriptions for mode-specific or one-off roles.

## The Productivity Loop

The 5 personas form a continuous improvement cycle where each persona's output feeds the next:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌──────────┐    ┌───────────┐    ┌──────────┐    │
│   │ Auditor  │───▶│ Architect │───▶│ Analyst  │    │
│   │ Discover │    │  Design   │    │  Review  │    │
│   └──────────┘    └───────────┘    └──────────┘    │
│        ▲                                │           │
│        │                                ▼           │
│   ┌────────────┐              ┌──────────┐         │
│   │ Compounder │◀─────────────│ Refiner  │         │
│   │  Compound  │              │  Iterate │         │
│   └────────────┘              └──────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**The loop is the mechanism.** Individual personas produce good outputs; the loop compounds improvements over time because each cycle builds on the previous one's accumulated knowledge.

## Persona Catalog

| Persona | Title | Core Methodology | Key Mechanism | Phases |
|---------|-------|-----------------|---------------|--------|
| **Auditor** | Productivity Systems Analyst | Discovery → Scoring → 4-Week Plan | `Automation Score = (Time Cost + Energy Drain) x Feasibility` | 3 |
| **Architect** | Solution Architect | Problem Definition → Approach Map → Blueprint → Dependencies | 2-3 approaches ranked by simplicity, each with rollback points | 4 |
| **Analyst** | Senior Engineering Analyst | Architecture → Code Quality → Reliability → Performance | Multi-pass review with tradeoff matrices, pauses after each pass | 4 |
| **Refiner** | Convergence Loop Specialist | Generate → Score → Diagnose → Rewrite → Re-score | Stops at convergence (all criteria >= 8/10) or diminishing returns (delta < 0.5) | 5 |
| **Compounder** | Systems Review Partner | Progress Check → Friction Log → Next Target → Pattern Recognition | Maintains running inventory, tracks cumulative impact, feeds back to Auditor | 4 |
| **Facilitator** | Session Facilitator | Setup → Brainwriting Coordination → Collect & Cluster → Convergence | Manages divergence/convergence phases, enforces ideation rules, never contributes own ideas | 4 |
| **Visionary** | Divergent Thinker | Brainwriting → Building | Generates ambitious unconstrained ideas, cross-domain connections, quantity over quality | 2 |
| **Realist** | Practical Thinker | Brainwriting → Building | Grounds ideas in feasibility, offers stepping stones, bridges inspiration and execution | 2 |

## Using Personas

### Mode 1: Full Productivity Team

Use all 5 personas together as a complete improvement cycle:

```
/spawn-create --mode productivity <workflow or process to optimize>
```

This spawns a sequential team where each persona's output feeds the next, culminating in a synthesis report with next-cycle recommendations.

### Mode 2: Individual Persona

Apply a single persona to any teammate in any blueprint. For example, add the Analyst persona to a code reviewer in the Code Review & QA blueprint:

```
Create an agent team to review PR #42. Spawn 3 reviewers:

1. **Security Reviewer** — [brief role description as usual]

2. **Quality Reviewer** — Apply the Analyst persona for a structured, multi-pass review.
   Read the persona definition at:
   ${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md
   Follow the methodology phases and scoring criteria defined in the persona.

3. **Performance Reviewer** — [brief role description as usual]
```

### Mode 3: Custom Composition

Use the team-architect agent to design a custom team that mixes personas with ad-hoc roles:

```
Design a team for refactoring our auth module. I want the Architect persona
for the solution design and the Refiner persona for iterative improvement,
but regular teammates for the implementation work.
```

The team-architect agent knows about available personas and will suggest applying them where a teammate needs specific methodology, scoring criteria, or interaction patterns.

## Applying a Persona

To apply a persona to a teammate, include this in the spawn prompt for that teammate:

```
Read the [Persona Name] persona definition at:
${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/[name].md

Follow the methodology phases, scoring criteria, and behavioral instructions
defined in the persona. Your inputs come from [source] and your outputs
feed into [destination].
```

Replace `[name]` with the lowercase persona name: `auditor`, `architect`, `analyst`, `refiner`, `compounder`, `facilitator`, `visionary`, or `realist`.

### Persona Reference Files

Each persona is defined in a standalone reference file designed to be read directly by a teammate:

| Persona | Reference File |
|---------|---------------|
| Auditor | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md` |
| Architect | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md` |
| Analyst | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md` |
| Refiner | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/refiner.md` |
| Compounder | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md` |
| Facilitator | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md` |
| Visionary | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md` |
| Realist | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md` |

Each file is written in second-person ("You are...") so it can be directly injected into a teammate's behavioral context. Files include methodology phases, scoring criteria, behavioral instructions, input/output contracts, and dev workflow examples.
