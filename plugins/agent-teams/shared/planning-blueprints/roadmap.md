# Planning Blueprint: Product Roadmap

**Team:** Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate
**Team name:** `plan-roadmap-[project-slug]`

```
Create an agent team called "plan-roadmap-[project-slug]" to create a product roadmap for [OBJECTIVE].

Spawn [4-5] teammates:

1. **Strategist** — Analyze product vision and define strategic objectives. Identify core
   value propositions, differentiators, and strategic goals. Determine foundational vs
   incremental capabilities. Frame each phase in terms of business value delivered.
   Read project docs in [PROJECT_DOCS].
   Use Sonnet model.

2. **Prioritizer** — Map feature dependencies and technical prerequisites. Build dependency
   graph showing which features require others first. Identify foundations that must be laid
   early (auth, data models, core APIs). Sequence by dependency order, risk, and value.
   Review project structure in [PROJECT_DIRS].
   Use Sonnet model.

3. **Outcomes Analyst** — Define measurable success criteria per phase. Write specific,
   testable definitions of done. Identify KPIs that prove each phase delivered value.
   Ensure outcomes are measurable, not aspirational.
   Use Sonnet model.

4. **Stakeholder Advocate** — Represent user needs and business constraints. Identify which
   segments benefit from each phase. Flag constraints (budget, timeline, regulatory, capacity)
   that affect sequencing. Challenge assumptions about user value.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Assess infrastructure and deployment implications per phase. Identify
   CI/CD, monitoring, scaling requirements. Flag phases needing infrastructure before features.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: analysis tasks ~5-10 tool calls, writing tasks ~5-10 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Strategist] (~5-10 tool calls) Analyze product vision, define strategic objectives and core value propositions
2. [Stakeholder Advocate] (~5-10 tool calls) Identify user needs, business constraints, and external dependencies
3. [Prioritizer] (~5-10 tool calls) Map feature dependencies and technical prerequisites (blocked by task 1)
4. [Strategist] (~5-10 tool calls) Define implementation phases with business rationale (blocked by tasks 1, 2)
5. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present initial phase structure to user. Ask user to: confirm priorities, adjust scope, flag misalignment (blocked by tasks 3, 4)
6. [Prioritizer] (~5-10 tool calls) Sequence phases by dependency order and risk — resolve conflicts per user direction (blocked by task 5)
7. [Outcomes Analyst] (~5-10 tool calls) Define success criteria and acceptance conditions per phase (blocked by task 5)
8. [Stakeholder Advocate] (~5-10 tool calls) Feasibility review — challenge assumptions, flag risks (blocked by tasks 6, 7)
9. [Outcomes Analyst] (~5-10 tool calls) Refine outcomes based on feasibility feedback (blocked by task 8)
10. [All] (~5-10 tool calls) Cross-review: validate plan coherence across strategic, dependency, outcomes, and stakeholder perspectives
11. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Strategist → "Strategic Vision & Phase Rationale", Prioritizer → "Dependency Map & Sequencing", Outcomes Analyst → "Success Criteria & KPIs", Stakeholder Advocate → "Constraints & Stakeholder Impact". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategist] (~5-10 tool calls) Merge domain sections into roadmap.md with phase briefs for implementation teams — resolve cross-references, deduplicate, add executive summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `roadmap.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Each phase brief should be directly usable as input to /spawn-build --mode feature or /spawn-create --mode design.
Include: phase goal, features, dependencies, success criteria, and business rationale.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `roadmap.md` → feeds into `/spawn-build --mode feature`, `/spawn-create --mode design`
