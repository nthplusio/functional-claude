# Planning Blueprint: Business Case

**Team:** Market Analyst, Financial Analyst, Strategist, Risk Analyst
**Team name:** `plan-bizcase-[project-slug]`

```
Create an agent team called "plan-bizcase-[project-slug]" to build a business case for [OBJECTIVE].

Spawn [4-6] teammates:

1. **Market Analyst** — Research market context: competitive landscape, size, trends, customer
   needs. Identify the market opportunity. Ground the case in external evidence, not assumptions.
   Find comparable initiatives or case studies.
   Use Sonnet model.

2. **Financial Analyst** — Build financial model: costs (build, operate, maintain), revenue
   impact (new, retained, savings), timeline to value. Define ROI, payback period, NPV.
   Model best/expected/worst scenarios. Make assumptions explicit and sensitivity-test them.
   Use Sonnet model.

3. **Strategist** — Frame strategic argument: alignment with company strategy, competitive
   positioning, long-term vision. Identify strategic risks of NOT investing. Build narrative
   connecting financials to strategy.
   Use Sonnet model.

4. **Risk Analyst** — Identify business risks: market, execution, technology, opportunity cost.
   Assess probability and impact. Compare invest vs not-invest risk profiles. Identify key
   assumptions that would invalidate the case if wrong.
   Use Sonnet model.

[IF DATA ANALYST SELECTED]
5. **Data Analyst** — Provide quantitative foundation: usage data, customer metrics, benchmarks.
   Validate financial assumptions with data. Identify metrics gaps.
   Use Sonnet model.

[IF CUSTOMER VOICE SELECTED]
6. **Customer Voice** — Represent customer perspective: problem solved, demand signal, retention
   and satisfaction impact. Ground the case in customer evidence.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: research/analysis tasks ~5-10 tool calls, writing tasks ~5-10 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Market Analyst] (~5-10 tool calls) Research market context — competitive landscape, trends, opportunity size
2. [Financial Analyst] (~5-10 tool calls) Build initial financial model — costs, revenue impact, timeline to value
3. [Strategist] (~5-10 tool calls) Frame strategic alignment and competitive positioning (blocked by task 1)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present market context, initial financials, and strategic framing. Ask user to: validate assumptions, adjust scope, flag missing considerations (blocked by tasks 2, 3)
5. [Financial Analyst] (~5-10 tool calls) Refine financial model with scenario analysis — best/expected/worst (blocked by task 4)
6. [Risk Analyst] (~5-10 tool calls) Identify and assess business risks — compare invest vs not-invest (blocked by task 4)
7. [Strategist] (~5-10 tool calls) Build strategic narrative connecting financials to strategy (blocked by tasks 4, 5)
8. [Market Analyst] (~5-10 tool calls) Provide supporting evidence — case studies, benchmarks, customer signals (blocked by task 4)
9. [All] (~5-10 tool calls) Cross-review: validate business case coherence — numbers, strategy, and risks consistent?
10. [Risk Analyst] (~5-10 tool calls) Sensitivity analysis — which assumptions, if wrong, break the case? (blocked by task 9)
11. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Market Analyst → "Market Analysis", Financial Analyst → "Financial Model & Scenarios", Strategist → "Strategic Narrative", Risk Analyst → "Risk Assessment & Sensitivity". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Strategist] (~5-10 tool calls) Merge domain sections into business-case.md — resolve cross-references, deduplicate, add executive summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `business-case.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

Include: executive summary, strategic context, market analysis, financial model with scenarios,
risk assessment, and recommendation. Feeds into Product Roadmap mode.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `business-case.md` → feeds into Product Roadmap mode
