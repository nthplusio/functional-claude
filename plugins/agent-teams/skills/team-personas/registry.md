# Persona Registry

Centralized catalog of all reusable personas with capability tags for matching personas to team types, modes, and roles.

## Catalog

| Persona | Title | Tags | Teams | Loop Position |
|---------|-------|------|-------|---------------|
| **Auditor** | Productivity Systems Analyst | `#discovery` `#scoring` `#planning` | productivity | 1 (entry) |
| **Architect** | Solution Architect | `#design` `#blueprint` `#phased` | productivity | 2 |
| **Analyst** | Senior Engineering Analyst | `#review` `#multi-pass` `#scoring` | productivity, review | 3 |
| **Refiner** | Convergence Loop Specialist | `#iteration` `#convergence` `#implementation` | productivity | 4 |
| **Compounder** | Systems Review Partner | `#synthesis` `#patterns` `#tracking` | productivity | 5 (exit) |
| **Facilitator** | Session Facilitator | `#coordination` `#brainstorm` `#convergence` | brainstorming | manager |
| **Visionary** | Divergent Thinker | `#brainstorm` `#divergent` `#creative` | brainstorming | parallel |
| **Realist** | Practical Thinker | `#brainstorm` `#convergent` `#feasibility` | brainstorming | parallel |

## Capability Tags

Tags indicate what a persona brings to a team. Use them to match personas to roles in custom teams.

### Methodology Tags

| Tag | Meaning | Personas |
|---|---|---|
| `#discovery` | Structured exploration and information gathering | Auditor |
| `#scoring` | Quantitative evaluation with defined criteria | Auditor, Analyst |
| `#review` | Multi-dimensional quality assessment | Analyst |
| `#multi-pass` | Sequential passes through the same material | Analyst |
| `#design` | Solution architecture and system design | Architect |
| `#blueprint` | Phased implementation plans with rollback points | Architect |
| `#iteration` | Convergence loops with measurable improvement | Refiner |
| `#convergence` | Driving toward a defined quality bar | Refiner, Facilitator |
| `#synthesis` | Combining findings into actionable outputs | Compounder |
| `#patterns` | Recognizing recurring themes across cycles | Compounder |

### Role Tags

| Tag | Meaning | Personas |
|---|---|---|
| `#brainstorm` | Idea generation and evaluation | Facilitator, Visionary, Realist |
| `#divergent` | Unconstrained thinking, quantity over quality | Visionary |
| `#convergent` | Practical filtering, feasibility assessment | Realist |
| `#creative` | Cross-domain connections, ambitious ideas | Visionary |
| `#feasibility` | Implementation grounding, effort estimation | Realist |
| `#coordination` | Phase management, rule enforcement | Facilitator |
| `#planning` | Sequencing and prioritization | Auditor, Architect |
| `#phased` | Work broken into phases with checkpoints | Architect |
| `#implementation` | Producing working code or configurations | Refiner |
| `#tracking` | Progress measurement across cycles | Compounder |

## Matching Guide

### By Team Type

| Team Type | Recommended Personas | Why |
|---|---|---|
| **Productivity** | All 5 loop personas (Auditor → Architect → Analyst → Refiner → Compounder) | The sequential loop IS the mechanism — each persona's output feeds the next |
| **Brainstorming** | Facilitator + Visionary + Realist (+ optional User Voice, Domain Expert) | Structured divergence/convergence requires role separation |
| **Code Review** | Analyst (for any reviewer needing multi-pass methodology) | Adds structured 4-pass review instead of ad-hoc scanning |
| **Feature Dev** | Architect (for complex features needing phased blueprints) | Adds phased blueprint with rollback points to implementation planning |
| **Planning** | None by default (uses rich inline role descriptions per mode) | Planning's 7 modes each need distinct roles that don't map to reusable personas |
| **Research** | None by default (uses brief role descriptions) | Research roles are topic-specific, not methodology-driven |
| **Debug** | None by default (investigators use hypothesis-specific roles) | Debugging's adversarial structure doesn't benefit from persona methodology |
| **Design** | None by default (uses domain-specific roles) | Design roles are UI-domain-specific |

### By Capability Need

| When a teammate needs... | Apply this persona |
|---|---|
| Structured bottleneck discovery with cost scoring | **Auditor** |
| Solution design with phased blueprints | **Architect** |
| Multi-pass quality review with tradeoff matrices | **Analyst** |
| Iterative convergence toward a quality bar | **Refiner** |
| Cross-cycle pattern recognition and tracking | **Compounder** |
| Brainstorming session management | **Facilitator** |
| Ambitious unconstrained ideation | **Visionary** |
| Feasibility grounding and effort estimation | **Realist** |

## Applying a Persona

Include this in the teammate's spawn description:

```
Read the [Persona Name] persona definition at:
${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/[name].md
Follow the methodology phases, scoring criteria, and behavioral instructions
defined in the persona. Your inputs come from [source] and your outputs
feed into [destination].
```

Replace `[name]` with the lowercase persona name: `auditor`, `architect`, `analyst`, `refiner`, `compounder`, `facilitator`, `visionary`, or `realist`.

## Reference Files

| Persona | File |
|---|---|
| Auditor | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/auditor.md` |
| Architect | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/architect.md` |
| Analyst | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/analyst.md` |
| Refiner | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/refiner.md` |
| Compounder | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/compounder.md` |
| Facilitator | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/facilitator.md` |
| Visionary | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/visionary.md` |
| Realist | `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/references/realist.md` |
