---
name: team-blueprints
description: |
  This skill should be used when the user wants pre-designed agent team configurations for common application development phases. Use this skill when the user asks for a "research team", "feature development team", "code review team", "debug team", "design team", "planning team", "roadmap team", "team blueprint", "team template", or says "spawn a team for [development phase]".

  Provides 8 ready-to-use team blueprints: Research & Discovery, Feature Development, Code Review & QA, Debugging & Investigation, Frontend Design, Planning & Roadmapping, Productivity Systems, and Brainstorming & Ideation.
version: 0.24.0
---

# Agent Team Blueprints

Pre-designed team configurations for eight application development phases. Each blueprint defines the team composition, teammate roles, task structure, and the prompt to use.

## Unified Commands

Three commands provide entry points with adaptive sizing, verbosity control, and auto-mode inference. They dispatch to the blueprints documented below.

| Unified Command | Modes |
|---|---|
| `/spawn-build` | feature, debug |
| `/spawn-think` | research (3 submodes), planning (7 submodes), review (3 submodes) |
| `/spawn-create` | design (3 submodes), brainstorm (4 categories), productivity |

**What unified commands add:**
- **Adaptive sizing** — Auto-recommends solo/pair/full team based on subtask count
- **Verbosity control** — `--quiet`, `--normal` (default), `--verbose` flags
- **Auto-mode inference** — Detects the right mode from your description keywords
- **Streamlined discovery** — 3 core questions + 0-2 optional, with adaptive skip

---

## Blueprints

| # | Blueprint | Command | Best For | Team Size |
|---|-----------|---------|----------|-----------|
| 1 | Research & Discovery | `/spawn-think --mode research` | Evaluating tech, landscape surveys | 3-5 |
| 2 | Feature Development | `/spawn-build --mode feature` | Multi-layer features (UI+API+DB) | 3-5 |
| 3 | Code Review & QA | `/spawn-think --mode review` | PR review, quality audit | 3-5 |
| 4 | Debugging | `/spawn-build --mode debug` | Hard bugs, production incidents | 3 |
| 5 | Frontend Design | `/spawn-create --mode design` | UI features needing design process | 4 |
| 6 | Adaptive Planning | `/spawn-think --mode planning` | Roadmaps, specs, ADRs | 3-4 |
| 7 | Productivity Systems | `/spawn-create --mode productivity` | Workflow optimization | 5 |
| 8 | Brainstorming | `/spawn-create --mode brainstorm` | Creative ideation | 3-5 |

For full team compositions, task structures, modes, and mechanisms, see [references/blueprint-definitions.md](references/blueprint-definitions.md).

---

## Choosing the Right Blueprint

```
Is the task about understanding something?     → Research & Discovery (3 modes)
Is the task about building something new?      → Feature Development
Is the task about reviewing existing work?     → Code Review & QA (3 modes)
Is the task about fixing something broken?     → Debugging & Investigation
Is the task about designing a user interface?  → Frontend Design (3 modes)
Is the task about sequencing what to build?    → Planning & Roadmapping (7 modes)
Is the task about optimizing workflows?        → Productivity Systems
Is the task about generating creative ideas?   → Brainstorming & Ideation
Is it a mix?                                   → Use team-architect agent for custom design
```

### Pipeline Composition

When a task spans multiple phases, chain blueprints together using their pipeline context:

```
Need to explore before building?      → Research → Feature Dev
Need to plan before building?         → Planning → Feature Dev
Need design before implementation?    → Design → Feature Dev → Review
Need ideas before planning?           → Brainstorming → Planning → Feature Dev
Found bugs during review?             → Review → Debug → Feature Dev (fix)
Need to optimize an existing flow?    → Productivity → Feature Dev (automation)
Full product cycle?                   → Business Case → Roadmap → Spec → Feature Dev → Review
```

---

## Design Patterns

Five reusable patterns across all blueprints:
- **Adaptive Mode** — Single command supports multiple operational modes
- **Cross-Team Pipeline** — Chain teams for multi-phase workflows
- **Discovery Interview** — Rich shared context via structured intake
- **User Feedback Gate** — Mid-course correction checkpoints
- **Artifact Output** — Persistent deliverables to `docs/teams/`

For pattern details and implementation guidance, see [references/design-patterns.md](references/design-patterns.md).

---

## Reference Files

| File | Contents |
|------|----------|
| [references/blueprint-definitions.md](references/blueprint-definitions.md) | Full definitions for all 8 blueprints — team compositions, modes, mechanisms, pipelines |
| [references/design-patterns.md](references/design-patterns.md) | 5 reusable patterns + customization guidance |
