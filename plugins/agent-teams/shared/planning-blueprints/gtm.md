# Planning Blueprint: Go-to-Market

**Team:** Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator
**Team name:** `plan-gtm-[project-slug]`

```
Create an agent team called "plan-gtm-[project-slug]" to create a go-to-market plan for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Positioning Strategist** — Define product positioning: what, who, why better than
   alternatives. Craft core messaging framework: value proposition, key messages per audience,
   competitive differentiation. Ensure positioning is specific and defensible.
   Use Sonnet model.

2. **Channel Planner** — Design distribution strategy: which channels reach the target audience.
   Evaluate direct vs indirect, paid vs organic. Build channel mix with expected reach, cost,
   and timeline. Define channel-specific tactics and content needs.
   Use Sonnet model.

3. **Customer Advocate** — Define customer personas, buying journey stages, and decision
   criteria. Identify adoption barriers and how to address them. Ground all GTM activities
   in customer reality.
   Use Sonnet model.

4. **Launch Coordinator** — Plan launch execution: timeline, milestones, dependencies,
   responsibilities. Define launch phases (soft launch, beta, GA). Create checklists
   and readiness criteria. Plan post-launch measurement and iteration.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide market data, customer metrics, competitive benchmarks. Define
   measurement framework for GTM success.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Deep customer empathy: buying process, objections, switching costs,
   resonant messaging. Review customer interviews, support data, and feedback.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: research/strategy tasks ~5-10 tool calls, writing tasks ~5-10 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Positioning Strategist] (~5-10 tool calls) Define product positioning — value prop, key messages, differentiation
2. [Customer Advocate] (~5-10 tool calls) Define customer personas, buying journey, and adoption barriers
3. [Channel Planner] (~5-10 tool calls) Evaluate channel options and build initial channel mix (blocked by tasks 1, 2)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present positioning, personas, and channel options. Ask user to: validate positioning, confirm audience, select channels, adjust priorities (blocked by task 3)
5. [Positioning Strategist] (~5-10 tool calls) Refine messaging for selected channels and audiences (blocked by task 4)
6. [Channel Planner] (~5-10 tool calls) Detail channel tactics, content needs, and budget allocation (blocked by task 4)
7. [Customer Advocate] (~5-10 tool calls) Design onboarding and adoption strategy for target personas (blocked by task 4)
8. [Launch Coordinator] (~5-10 tool calls) Create launch timeline with phases, milestones, readiness criteria (blocked by tasks 5, 6, 7)
9. [All] (~5-10 tool calls) Cross-review: validate GTM plan coherence — positioning, channels, and launch aligned?
10. [Launch Coordinator] (~5-10 tool calls) Define post-launch measurement plan and iteration triggers (blocked by task 9)
11. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Positioning Strategist → "Positioning & Messaging", Channel Planner → "Channel Strategy & Tactics", Customer Advocate → "Personas & Adoption Strategy", Launch Coordinator → "Launch Timeline & Readiness". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Launch Coordinator] (~5-10 tool calls) Merge domain sections into gtm-plan.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `gtm-plan.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: positioning framework, customer personas, channel strategy with tactics,
launch timeline, readiness criteria, and measurement plan. Feeds into Product Roadmap mode.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `gtm-plan.md` → feeds into Product Roadmap mode
