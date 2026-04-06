# Design Patterns

These patterns are used across multiple blueprints. When customizing blueprints or designing new teams with the team-architect agent, apply these patterns where they add value.

## Adaptive Mode Pattern

One spawn command dispatches to mode-specific team compositions and task structures. This lets a single entry point serve multiple related use cases without creating separate commands.

**Structure:**
1. **Mode table** — Lists modes with "When to Use" descriptions and effects on team composition
2. **Auto-inference keywords** — Common terms that auto-select the mode from `$ARGUMENTS` (confirmed rather than asked)
3. **Mode-specific interviews** — Core questions shared across all modes + extended questions per mode
4. **Shared task skeleton** — All modes follow the same phase flow (e.g., Initial Analysis → Feedback Gate → Detailed Work → Cross-Review → Synthesis) with mode-specific task content

**Blueprints using this pattern:**
- Planning (7 modes) — most comprehensive implementation
- Research (3 modes) — Technology Evaluation, Landscape Survey, Risk Assessment
- Design (3 modes) — New Component, Page/Flow, Redesign
- Review (3 modes) — Security-focused, Performance-focused, Balanced

**When to use:** When a team concept serves multiple related use cases that need different team compositions, expertise, or deliverables — but share the same overall workflow shape.

## Cross-Team Pipeline Pattern

Teams chain together where one team's output becomes another team's input. This enables complex workflows to span multiple specialized teams rather than overloading a single team.

**Pipeline map:**

```
                        ┌─────────────────┐
                        │  Brainstorming   │
                        │  (ideation)      │
                        └────────┬────────┘
                                 │ winning ideas
                                 ▼
┌─────────────┐         ┌─────────────────┐
│ Business    │────────▶│    Planning      │
│ Case / GTM  │         │  (7 modes)      │
│ / OKR       │         └────────┬────────┘
└─────────────┘                  │ phase briefs / specs
                                 ▼
                        ┌─────────────────┐         ┌─────────────────┐
                        │   Research       │────────▶│   Design        │
                        │  (3 modes)      │         │  (3 modes)      │
                        └────────┬────────┘         └────────┬────────┘
                                 │ evaluation report          │ design specs
                                 ▼                            ▼
                        ┌─────────────────────────────────────┐
                        │          Feature Development         │
                        └────────────────┬────────────────────┘
                                         │ implementation
                                         ▼
                        ┌─────────────────────────────────────┐
                        │          Code Review & QA            │
                        └───────┬─────────────────┬───────────┘
                                │ issues found     │ rework needed
                                ▼                  ▼
                        ┌─────────────┐   ┌─────────────────┐
                        │   Debug     │   │ Feature (rework) │
                        │ (investigate)│   └─────────────────┘
                        └─────────────┘
```

**Key principle:** Each team's output section includes explicit downstream command references (e.g., "feeds into `/spawn-build --mode feature`"). This lets users chain teams without guessing which command comes next.

**Common pipelines:**
- **Full product cycle:** Business Case → Product Roadmap → Technical Spec → Feature Dev → Code Review
- **Design-to-implementation:** Brainstorming → Design → Feature Dev → Review
- **Bug lifecycle:** Review → Debug → Feature Dev (fix) → Review (verify fix)
- **Productivity loop:** Productivity Systems → Feature Dev (automation) → next Productivity cycle

## Discovery Interview Pattern

Pre-spawn structured questioning that builds rich shared context for all teammates. Moves context gathering before the team spawns so teammates can start working immediately instead of interviewing the user.

**Structure:** 5 core questions (shared across modes) + 2-5 extended questions (per mode or category). Questions are presented in batches of 3-5 using `AskUserQuestion`. Questions already answered in `$ARGUMENTS` are skipped. Results are compiled into a structured `## Context` section in the spawn prompt.

**Blueprints using this pattern:** Planning, Research, Design, Brainstorming, Feature, Productivity

**When to use:** Any team where shared context quality directly drives output quality. See the "Discovery Interview Pattern" section in the team-coordination skill for detailed implementation guidance.

## User Feedback Gate Pattern

Mid-execution checkpoint where the lead presents findings to the user for prioritization and direction before the team invests in detailed work.

**Implementation:** A dedicated `[Lead]` task with blocking dependencies on both sides — upstream work must complete before the gate, and downstream work cannot start until the user responds.

**Blueprints using this pattern:** Planning (after initial phases), Research (after initial findings), Design (after specs + accessibility review), Feature (after API contract), Productivity (after Auditor's scored plan), Brainstorming (after idea clustering), Debug (root cause confirmation)

**When to use:** Any team where significant effort could go in the wrong direction without user input. See the "User Feedback Gate" section in the team-coordination skill for detailed implementation guidance.

## Artifact Output Pattern

Team deliverables are written to disk as git-tracked markdown files in `docs/teams/{team-name}/`, ensuring outputs persist after sessions and can be consumed by downstream pipeline teams.

**Two-tier system:**
- **Primary deliverable** — One main output file per team (e.g., `roadmap.md`, `evaluation-report.md`)
- **Task outputs** — Per-task analysis files in a `tasks/` subdirectory

**Artifact mapping by team type:** See `${CLAUDE_PLUGIN_ROOT}/shared/artifact-protocol.md` → Artifact Mapping by Team Type.

A designated teammate compiles the primary deliverable with YAML frontmatter, writes task outputs, creates a team README, and updates the root index at `docs/teams/README.md`. See `${CLAUDE_PLUGIN_ROOT}/shared/artifact-protocol.md` for full frontmatter schemas and guidelines.

## Customizing Blueprints

These blueprints are starting points. Adapt them by:

1. **Adjusting team size** — Add or remove teammates based on task complexity
2. **Changing model** — Use Sonnet for cost-effective work, Opus for complex reasoning
3. **Adding plan approval** — For risky changes, require teammates to plan before implementing
4. **Enabling delegate mode** — Press Shift+Tab to keep the lead focused on coordination
5. **Defining file boundaries** — Assign specific directories to avoid merge conflicts

For efficiency guidelines (sizing, batching, overhead budget, anti-patterns), see `${CLAUDE_PLUGIN_ROOT}/shared/efficiency-guidelines.md`.
