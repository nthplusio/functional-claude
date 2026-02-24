# Planning Blueprint: Migration Strategy

**Team:** State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate
**Team name:** `plan-migration-[project-slug]`

```
Create an agent team called "plan-migration-[project-slug]" to plan the migration of [OBJECTIVE].

Spawn [4-5] teammates:

1. **State Analyst** — Document current state comprehensively: architecture, data schemas,
   integrations, traffic patterns. Document target state with equal rigor. Produce gap
   analysis showing what changes. Read existing codebase and infrastructure docs.
   Use Sonnet model.

2. **Migration Planner** — Design migration path: sequencing, phases, rollback points,
   parallel-run strategies. Determine approach (strangler fig, dual-write, cutover). Define
   migration order for components and data. Create step-by-step execution plan with checkpoints.
   Use Sonnet model.

3. **Risk Mitigator** — Identify migration risks: data loss, downtime, performance degradation,
   feature regression, integration failures. For each risk, define detection, mitigation, and
   rollback. Create risk matrix with go/no-go criteria per phase.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent everyone affected: end users, dev team, ops, business.
   Define communication plans per audience. Identify training needs. Flag user-facing changes
   needing careful handling.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Plan infrastructure for migration: parallel environments, data pipelines,
   monitoring during transition, DNS/routing changes, rollback infrastructure.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: system analysis tasks ~10-20 tool calls, planning/risk tasks ~10-15 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [State Analyst] (~10-20 tool calls) Document current state — architecture, data, integrations, traffic
2. [State Analyst] (~10-15 tool calls) Document target state and produce gap analysis (blocked by task 1)
3. [Risk Mitigator] (~10-15 tool calls) Identify migration risks and failure modes (blocked by task 1)
4. [Migration Planner] (~10-15 tool calls) Design initial migration approach — incremental vs cutover vs parallel (blocked by task 2)
5. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present gap analysis and proposed approach to user. Ask user to: confirm approach, adjust risk tolerance, set phase priorities (blocked by tasks 3, 4)
6. [Migration Planner] (~10-15 tool calls) Create detailed phase plan with rollback points and checkpoints (blocked by task 5)
7. [Risk Mitigator] (~10-15 tool calls) Define mitigations and go/no-go criteria per phase (blocked by tasks 5, 6)
8. [Stakeholder Advocate] (~5-10 tool calls) Create communication and training plan per stakeholder group (blocked by task 5)
9. [All] (~5-10 tool calls) Cross-review: validate migration plan coherence — each phase has clear entry/exit criteria and rollback
10. [Risk Mitigator] (~5-10 tool calls) Final risk assessment — pre-mortem on the full plan (blocked by task 9)
11. [Stakeholder Advocate] (~5-10 tool calls) Finalize stakeholder communication timeline (blocked by task 9)
12. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: State Analyst → "Current/Target State Analysis", Migration Planner → "Migration Approach & Phase Plan", Risk Mitigator → "Risk Matrix & Mitigations", Stakeholder Advocate → "Communication & Training Plan". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by tasks 10, 11)
13. [Migration Planner] (~5-10 tool calls) Merge domain sections into migration-plan.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `migration-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 12)

Include: current/target state analysis, migration approach, phased execution with rollback,
risk matrix with mitigations, go/no-go criteria, and stakeholder communication plan.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `migration-plan.md` → feeds into implementation teams
