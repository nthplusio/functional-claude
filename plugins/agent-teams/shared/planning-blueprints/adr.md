# Planning Blueprint: Architecture Decision

**Team:** Solution Architect, Explorer, Trade-off Analyst, Critic
**Team name:** `plan-adr-[project-slug]`

```
Create an agent team called "plan-adr-[project-slug]" to make an architecture decision about [OBJECTIVE].

Spawn [4-5] teammates:

1. **Solution Architect** — Frame the decision context and evaluation framework. Articulate
   what we're deciding, why it matters, and what criteria guide the choice. Read existing
   architecture and codebase. Synthesize inputs into a clear recommendation with rationale.
   Use Sonnet model.

2. **Explorer** — Research each option thoroughly: how it works, what it requires, what it
   enables, what it precludes. Provide concrete examples and reference implementations.
   Go deep on technical details that affect the decision.
   Use Sonnet model.

3. **Trade-off Analyst** — Build structured comparison matrix across all options. Evaluate
   against defined criteria. Quantify where possible. Identify hidden costs and second-order
   consequences. Make trade-offs explicit.
   Use Sonnet model.

4. **Critic** — Challenge every option and assumption. Identify failure modes, scaling limits,
   worst-case scenarios. Push back on the leading option — if it survives scrutiny, the
   decision is stronger.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
5. **DevOps Advisor** — Evaluate operational implications of each option: deployment complexity,
   monitoring needs, operational burden.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

Effort budgets: research tasks ~8-12 tool calls, analysis tasks ~8-12 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Solution Architect] (~8-12 tool calls) Frame decision context — what we're deciding, why, and evaluation criteria
2. [Explorer] (~8-12 tool calls) Research and document each option — capabilities, requirements, examples
3. [Trade-off Analyst] (~8-12 tool calls) Build initial comparison matrix across options (blocked by tasks 1, 2)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present options and initial analysis to user. Ask user to: eliminate options, adjust criteria, set direction (blocked by task 3)
5. [Explorer] (~8-12 tool calls) Deep-dive on remaining options per user direction (blocked by task 4)
6. [Trade-off Analyst] (~8-12 tool calls) Finalize comparison with quantified trade-offs and second-order effects (blocked by tasks 4, 5)
7. [Critic] (~8-12 tool calls) Challenge the leading option — failure modes, worst cases, hidden costs (blocked by task 6)
8. [Solution Architect] (~8-12 tool calls) Draft recommendation with rationale, addressing Critic's challenges (blocked by task 7)
9. [All] (~5-10 tool calls) Cross-review: validate ADR coherence — does the recommendation survive all perspectives?
10. [Critic] (~5-10 tool calls) Final challenge — last chance to raise concerns before recording
11. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Solution Architect → "Decision Context & Recommendation", Explorer → "Options Analysis", Trade-off Analyst → "Comparison Matrix & Trade-offs", Critic → "Risks & Rejected Options". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 10)
12. [Solution Architect] (~5-10 tool calls) Merge domain sections into adr.md — resolve cross-references, deduplicate — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `adr.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 11)

ADR format: Title, Status, Context, Decision, Consequences. Include comparison matrix,
rejected options with reasons, and implementation guidance.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `adr.md` → feeds into implementation teams
