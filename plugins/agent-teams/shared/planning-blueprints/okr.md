# Planning Blueprint: OKR / Goals

**Team:** Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate
**Team name:** `plan-okr-[project-slug]`

```
Create an agent team called "plan-okr-[project-slug]" to define OKRs and goals for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Strategic Planner** — Define objectives connecting to higher-level strategy. Ensure each
   is ambitious but achievable, qualitative but clear. Map cascading from company/department
   to team-level. Identify gaps where strategic priorities lack objectives.
   Use Sonnet model.

2. **Metrics Designer** — Design key results: specific, measurable, time-bound. For each,
   define metric, baseline, target, measurement method, and data source. Use leading indicators,
   ensure team control, avoid perverse incentives. 2-4 key results per objective.
   Use Sonnet model.

3. **Alignment Reviewer** — Check alignment vertically (supports strategy above?), horizontally
   (conflicts with other teams?), and internally (key results measure the objective?). Identify
   inter-OKR dependencies. Flag OKRs that are tasks disguised as goals.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent everyone who owns, contributes to, or is measured by
   these OKRs. Ensure acceptance, not just assignment. Identify tension between teams. Review
   existing metrics and prior OKR cycles.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide baselines for all proposed metrics. Identify which are currently
   tracked vs need new instrumentation. Validate targets against historical data.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Ensure OKRs reflect customer impact, not just internal activity.
   Challenge OKRs measuring output without outcome. Add customer-centric key results.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: analysis/strategy tasks ~5-10 tool calls, writing tasks ~5-10 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Strategic Planner] (~5-10 tool calls) Define draft objectives aligned to strategy — ambitious, qualitative, actionable
2. [Metrics Designer] (~5-10 tool calls) Inventory existing metrics and identify baselines
3. [Alignment Reviewer] (~5-10 tool calls) Review strategic context and identify alignment requirements (blocked by task 1)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present draft objectives and alignment analysis. Ask user to: confirm objectives, adjust ambition, flag missing areas, prioritize (blocked by tasks 2, 3)
5. [Metrics Designer] (~5-10 tool calls) Design key results for confirmed objectives — specific, measurable, time-bound (blocked by task 4)
6. [Strategic Planner] (~5-10 tool calls) Refine objectives based on user direction and metrics feasibility (blocked by tasks 4, 5)
7. [Alignment Reviewer] (~5-10 tool calls) Check alignment — vertical, horizontal, and internal coherence (blocked by tasks 5, 6)
8. [Stakeholder Advocate] (~5-10 tool calls) Review OKRs for ownership clarity, acceptance, and inter-team tensions (blocked by task 7)
9. [All] (~5-10 tool calls) Cross-review: validate OKR tree coherence — objectives, key results, ownership form clear picture?
10. [Metrics Designer] (~5-10 tool calls) Finalize measurement plan — data sources, tracking cadence, review schedule (blocked by task 9)
11. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Strategic Planner → "Objective Tree & Rationale", Metrics Designer → "Key Results & Measurement Plan", Alignment Reviewer → "Alignment Analysis", Stakeholder Advocate → "Ownership & Accountability". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategic Planner] (~5-10 tool calls) Merge domain sections into okr-tree.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `okr-tree.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: objective tree, key results with baselines and targets, ownership map, measurement
plan, and alignment notes. Feeds into Product Roadmap and/or Technical Spec modes.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `okr-tree.md` → feeds into Product Roadmap, Technical Spec modes
