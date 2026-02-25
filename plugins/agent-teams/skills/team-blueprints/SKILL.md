---
name: team-blueprints
description: |
  This skill should be used when the user wants pre-designed agent team configurations for common application development phases. Use this skill when the user asks for a "research team", "feature development team", "code review team", "debug team", "design team", "planning team", "roadmap team", "team blueprint", "team template", or says "spawn a team for [development phase]".

  Provides 8 ready-to-use team blueprints: Research & Discovery, Feature Development, Code Review & QA, Debugging & Investigation, Frontend Design, Planning & Roadmapping, Productivity Systems, and Brainstorming & Ideation.
version: 0.21.2
---

# Agent Team Blueprints

Pre-designed team configurations for eight application development phases. Each blueprint defines the team composition, teammate roles, task structure, and the prompt to use.

## New in v0.15.0: Unified Commands

Three unified commands provide simplified entry points with adaptive sizing, verbosity control, and auto-mode inference. They dispatch to the same blueprints documented below.

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

## Blueprint 1: Research & Discovery Team

**When to use:** Exploring a new technology, evaluating approaches, investigating a domain, or gathering information from multiple angles before making decisions.

**Why teams work here:** Research benefits enormously from parallel exploration. A single session gravitates toward one perspective; multiple teammates explore different facets simultaneously and share findings.

**Command:** `/spawn-think --mode research` (discovery interview, adaptive sizing, auto-infers submode)

### Research Modes

| # | Mode | Team Composition | Output → Pipeline |
|---|------|-----------------|--------|
| 1 | **Technology Evaluation** | Explorer, Analyst, Critic | `evaluation-report.md` → planning, feature |
| 2 | **Landscape Survey** | Explorer, Mapper, Analyst | `landscape-report.md` → research (eval), planning |
| 3 | **Risk Assessment** | Risk Analyst, System Analyst, Mitigator | `risk-assessment.md` → planning, feature |

**Optional teammates:** Domain Expert (specialized domains), Implementer (feasibility)

---

## Blueprint 2: Feature Development Team

**When to use:** Building a new feature that spans multiple layers (frontend, backend, data), multiple modules, or requires parallel implementation tracks.

**Why teams work here:** Feature development benefits from teammates each owning a distinct piece. Cross-layer changes (UI + API + database) are naturally parallelizable when each teammate owns their layer.

**Command:** `/spawn-build --mode feature` (discovery interview, API contract gate, adaptive sizing)

### Team Composition

| Teammate | Role | Optional |
|----------|------|----------|
| **Frontend** | UI components, state management | — |
| **Backend** | API endpoints, services | — |
| **Tester** | Unit + integration tests | — |
| **DevOps** | Migrations, CI/CD, infrastructure | Yes |
| **Documentation** | API docs, user docs, changelog | Yes |

**Key mechanism:** User feedback gate after API contract — changing contracts post-implementation is expensive.
**Pipeline:** planning / design / research → **Feature** → review

---

## Blueprint 3: Code Review & QA Team

**When to use:** Reviewing a pull request, auditing code quality, or conducting a thorough quality assessment before release.

**Why teams work here:** A single reviewer gravitates toward one type of issue. Splitting review criteria into independent domains means security, performance, and test coverage all get thorough attention simultaneously.

**Command:** `/spawn-think --mode review` (brief 3-question interview, auto-infers submode)

### Review Modes

| # | Mode | When to Use | Effect |
|---|------|-------------|--------|
| 1 | **Security-focused** | Auth changes, data handling, external integrations | Security Reviewer leads; extra threat-modeling tasks |
| 2 | **Performance-focused** | Database changes, high-traffic paths, large data | Performance Reviewer leads; extra profiling tasks |
| 3 | **Balanced** (default) | General code changes, feature implementations, refactors | All reviewers equal; standard task distribution |

### Team Composition

| Teammate | Role | Optional |
|----------|------|----------|
| **Security Reviewer** | Auth, injection, data exposure, OWASP top 10 | — |
| **Performance Reviewer** | N+1 queries, memory leaks, caching, complexity | — |
| **Quality Reviewer** | Patterns, naming, error handling, test coverage | — |
| **Accessibility Reviewer** | WCAG, keyboard nav, ARIA, color contrast | Yes |
| **Architecture Reviewer** | Design patterns, dependency direction, module boundaries | Yes |

**Pipeline:** feature / design → **Review** → debug (issues) / feature (rework)

---

## Blueprint 4: Debugging & Investigation Team

**When to use:** Tracking down a hard-to-reproduce bug, investigating a production incident, or debugging an issue where the root cause is unclear.

**Why teams work here:** Sequential investigation suffers from anchoring — once one theory is explored, subsequent investigation is biased toward it. Multiple independent investigators actively trying to disprove each other's theories means the surviving theory is much more likely to be the actual root cause.

**Command:** `/spawn-build --mode debug` (hypothesis confirmation gate, root cause confirmation before fix)

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **[Hypothesis-A-Name]** | First theory investigator | Most likely cause based on symptoms |
| **[Hypothesis-B-Name]** | Second theory investigator | Alternative cause based on recent changes |
| **[Hypothesis-C-Name]** | Contrarian investigator | Less obvious cause, challenges other theories |

**Key mechanism:** Adversarial structure — investigators actively challenge each other's findings. The surviving theory is most likely correct.
**Pipeline:** review / feature → **Debug** → feature (fix) / review (verify fix)

---

## Blueprint 5: Frontend Design Team

**When to use:** Designing and implementing a user interface where product requirements, visual design, technical implementation, and accessibility all need dedicated attention. Best for UI features that require more than just coding — where the *design process* matters as much as the output.

**Why teams work here:** A single session conflates design decisions with implementation details. Four distinct perspectives — product scope, visual design, code architecture, and user advocacy — create productive tension that results in a more thoughtful, accessible UI. The two-pass review (visual fidelity + accessibility) catches issues that a single reviewer would miss.

**Command:** `/spawn-create --mode design` (discovery interview, user feedback gate before implementation)

### Design Modes

| # | Mode | When to Use |
|---|------|-------------|
| 1 | **New Component** | Creating a new reusable component — design system additions, shared UI elements |
| 2 | **Page / Flow** | Designing a full page or multi-step flow — onboarding, checkout, dashboards |
| 3 | **Redesign** | Improving or reworking existing UI — modernization, UX improvements, accessibility fixes |

### Team Composition

| Teammate | Role | Model |
|----------|------|-------|
| **Product Owner** | User stories, acceptance criteria, scope boundaries | Sonnet |
| **Designer** | Component specs, states, layout, design tokens | Sonnet |
| **Frontend Dev** | Component architecture, state management, performance | Default |
| **User Advocate** | WCAG compliance, keyboard nav, screen readers | Sonnet |

**Key mechanism:** Two-pass review (Designer + User Advocate) after implementation catches issues a single reviewer misses.
**Pipeline:** planning / brainstorm → **Design** → review / feature (backend)

---

## Blueprint 6: Adaptive Planning Team (7 Modes)

**When to use:** Any planning task — from sequencing features to writing specs, making architecture decisions, planning migrations, building business cases, designing GTM plans, or setting OKRs. The command runs a discovery interview and spawns a mode-specific team.

**Why teams work here:** Different planning needs require fundamentally different team compositions and outputs. A roadmap needs strategists and prioritizers; a spec needs architects and API designers; a business case needs market and financial analysts. The adaptive mode system matches the team to the planning problem, while the shared interview → feedback gate → synthesis pipeline ensures consistent quality across all modes.

### Planning Modes

| # | Mode | Category | Team Composition | Output |
|---|------|----------|-----------------|--------|
| 1 | **Product Roadmap** | Technical | Strategist, Prioritizer, Outcomes Analyst, Stakeholder Advocate | Phase briefs → `/spawn-build --mode feature` |
| 2 | **Technical Spec** | Technical | Architect, API Designer, Risk Analyst | Spec document → `/spawn-build --mode feature` |
| 3 | **Architecture Decision** | Technical | Solution Architect, Explorer, Trade-off Analyst, Critic | ADR → implementation teams |
| 4 | **Migration Strategy** | Technical | State Analyst, Migration Planner, Risk Mitigator, Stakeholder Advocate | Migration plan |
| 5 | **Business Case** | Business | Market Analyst, Financial Analyst, Strategist, Risk Analyst | Decision document → Product Roadmap |
| 6 | **Go-to-Market** | Business | Positioning Strategist, Channel Planner, Customer Advocate, Launch Coordinator | GTM plan → Product Roadmap |
| 7 | **OKR / Goals** | Business | Strategic Planner, Metrics Designer, Alignment Reviewer, Stakeholder Advocate | OKR tree → Roadmap / Spec |

**Pipeline:** Business Case / GTM / OKR → Product Roadmap → Technical Spec → `/spawn-build --mode feature`

**Command:** `/spawn-think --mode planning` (discovery interview, user feedback gate, delegate mode for compilation)

### Task Structure (All Modes)

All 7 modes follow the same 5-phase task flow:

```
Phase 1 — Initial Analysis (tasks 1-3/4):  Parallel exploration from each teammate's perspective
Phase 2 — USER FEEDBACK GATE (task 4/5):   Lead presents findings, user chooses direction
Phase 3 — Detailed Planning (tasks 5/6-8): Refined work based on user's direction
Phase 4 — Cross-Review (task 9/10):        All teammates validate coherence
Phase 5 — Compilation (task 10/11/12):     Designated teammate compiles final output document
```

**Optional teammates:** DevOps Advisor (technical modes), Data Analyst + Customer Voice (business modes)
**Pipeline:** Business Case / GTM / OKR → **Planning** → feature / design

---

## Blueprint 7: Productivity Systems Team

**When to use:** Optimizing workflows, processes, or systems where you need to discover bottlenecks, design solutions, review quality, iteratively refine, and track improvements over time. Best when the *process of improvement* matters as much as any single output — when you want compounding gains across cycles.

**Why teams work here:** A single session can identify problems or propose solutions, but lacks the structured methodology to systematically score, prioritize, design with tradeoffs, review through multiple lenses, iterate to convergence, and track patterns across cycles. Five distinct personas — each with deep methodology, scoring criteria, and defined input/output contracts — form a pipeline where improvements compound because each cycle builds on accumulated knowledge.

**Command:** `/spawn-create --mode productivity` (4-question pre-spawn interview, feedback gate after Auditor's scored plan)

### Team Composition

| Teammate | Role | Model |
|----------|------|-------|
| **Auditor** | Bottleneck discovery, cost scoring, prioritized planning | Sonnet |
| **Architect** | Problem restatement, approach mapping, phased blueprints | Sonnet |
| **Analyst** | Multi-pass review: architecture, quality, reliability, performance | Sonnet |
| **Refiner** | Iterative improvement until quality bar met | Default |
| **Compounder** | Progress tracking, friction logging, pattern recognition | Sonnet |

**Key mechanism:** Intentionally sequential pipeline — each persona's output feeds the next. Compounder output seeds the next productivity cycle.
**Pipeline:** **Productivity** → feature (automation implementation) → next productivity cycle

---

## Blueprint 8: Brainstorming & Ideation Team

**When to use:** Generating creative ideas for a problem, feature, strategy, or process where you need diverse perspectives and structured evaluation. Best when the problem space is open-ended and you want to explore possibilities before committing to a direction.

**Why teams work here:** A single session anchors on its first idea and iterates from there. Structured brainstorming with independent brainwriting prevents anchoring bias — each teammate generates ideas without seeing others' work, producing genuinely diverse options. The user feedback gate keeps the human as the "decider," and the building phase adds implementation substance to winning ideas.

**Command:** `/spawn-create --mode brainstorm` (discovery interview, 4 categories: Tech/Product/Process/Ops, feedback gate after idea clustering)

### Team Composition

| Teammate | Role | Optional |
|----------|------|----------|
| **Facilitator** | Phase transitions, ideation rules, clustering, convergence | — |
| **Visionary** | Ambitious ideas, cross-domain connections, quantity over quality | — |
| **Realist** | Feasible ideas, implementation details, stepping stones | — |
| **User Voice** | Ideas grounded in user needs, adoption, experience | Yes |
| **Domain Expert** | Specialized ideas a generalist would miss | Yes |

**Key mechanism:** Independent brainwriting prevents anchoring bias — teammates generate ideas without seeing others' work. User feedback gate after clustering keeps the human as the "decider."
**Pipeline:** **Brainstorm** → planning / research / design / feature

---

## Design Patterns

These patterns are used across multiple blueprints. When customizing blueprints or designing new teams with the team-architect agent, apply these patterns where they add value.

### Adaptive Mode Pattern

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

### Cross-Team Pipeline Pattern

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

### Discovery Interview Pattern

Pre-spawn structured questioning that builds rich shared context for all teammates. Moves context gathering before the team spawns so teammates can start working immediately instead of interviewing the user.

**Structure:** 5 core questions (shared across modes) + 2-5 extended questions (per mode or category). Questions are presented in batches of 3-5 using `AskUserQuestion`. Questions already answered in `$ARGUMENTS` are skipped. Results are compiled into a structured `## Context` section in the spawn prompt.

**Blueprints using this pattern:** Planning, Research, Design, Brainstorming, Feature, Productivity

**When to use:** Any team where shared context quality directly drives output quality. See the "Discovery Interview Pattern" section in the team-coordination skill for detailed implementation guidance.

### User Feedback Gate Pattern

Mid-execution checkpoint where the lead presents findings to the user for prioritization and direction before the team invests in detailed work.

**Implementation:** A dedicated `[Lead]` task with blocking dependencies on both sides — upstream work must complete before the gate, and downstream work cannot start until the user responds.

**Blueprints using this pattern:** Planning (after initial phases), Research (after initial findings), Design (after specs + accessibility review), Feature (after API contract), Productivity (after Auditor's scored plan), Brainstorming (after idea clustering), Debug (root cause confirmation)

**When to use:** Any team where significant effort could go in the wrong direction without user input. See the "User Feedback Gate" section in the team-coordination skill for detailed implementation guidance.

### Artifact Output Pattern

Team deliverables are written to disk as git-tracked markdown files in `docs/teams/{team-name}/`, ensuring outputs persist after sessions and can be consumed by downstream pipeline teams.

**Two-tier system:**
- **Primary deliverable** — One main output file per team (e.g., `roadmap.md`, `evaluation-report.md`)
- **Task outputs** — Per-task analysis files in a `tasks/` subdirectory

**Artifact mapping by team type:** See `team-coordination` skill → Artifact Output Protocol → Artifact Mapping by Team Type.

A designated teammate compiles the primary deliverable with YAML frontmatter, writes task outputs, creates a team README, and updates the root index at `docs/teams/README.md`. See the "Artifact Output Protocol" section in the team-coordination skill for full frontmatter schemas and guidelines.

## Customizing Blueprints

These blueprints are starting points. Adapt them by:

1. **Adjusting team size** — Add or remove teammates based on task complexity
2. **Changing model** — Use Sonnet for cost-effective work, Opus for complex reasoning
3. **Adding plan approval** — For risky changes, require teammates to plan before implementing
4. **Enabling delegate mode** — Press Shift+Tab to keep the lead focused on coordination
5. **Defining file boundaries** — Assign specific directories to avoid merge conflicts

### Efficiency Guidelines

Session analysis shows coordination overhead scales non-linearly. Keep teams lean:

- **Cap tasks at 8 per team** — Beyond this, TaskUpdate churn dominates execution
- **Prefer 3-4 agents** — Larger teams increase SendMessage overhead without proportional output gains
- **Max 2 teams per session** — Chain sessions for complex multi-team pipelines instead
- **Batch instructions** — One detailed SendMessage per teammate beats multiple short follow-ups
- **Skip teams for small work** — If total implementation is under ~30 minutes or fewer than 3 parallel tracks, use plan-then-implement instead

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
