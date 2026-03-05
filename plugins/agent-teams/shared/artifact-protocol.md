# Artifact Output Protocol

Team deliverables (roadmaps, specs, evaluation reports, etc.) should be written to disk as git-tracked markdown files so they persist after sessions end and can be consumed by downstream teams in the cross-team pipeline.

## Why Artifacts Matter

- **Pipeline continuity** — Downstream teams can read upstream outputs from files instead of relying on message context that compacts away
- **Human reference** — Users can review, edit, and share team outputs outside of Claude Code sessions
- **Persistence** — Deliverables survive session end, context compaction, and team shutdown

## Directory Structure

All team artifacts are written to the project's `docs/teams/` directory:

```
docs/teams/
├── README.md                              # Root index — table of all team runs
├── plan-roadmap-myapp/
│   ├── README.md                          # Team metadata, artifact list, pipeline links
│   ├── roadmap.md                         # Primary deliverable
│   └── tasks/
│       ├── 01-strategic-objectives.md     # Task-level output
│       ├── 02-user-needs.md
│       └── ...
└── research-eval-auth-libs/
    ├── README.md
    ├── evaluation-report.md
    └── tasks/
        └── ...
```

**Two tiers:**
- **Primary deliverable** — The team's main output file (e.g., `roadmap.md`, `spec.md`, `evaluation-report.md`)
- **Task outputs** — Per-task analysis written to `tasks/` (numbered by task order, e.g., `01-strategic-objectives.md`)

## Frontmatter Schemas

### Team README (`docs/teams/{team-name}/README.md`)

```yaml
---
team: plan-roadmap-myapp
type: planning
mode: product-roadmap
topic: "MyApp product roadmap"
date: 2026-02-11
status: completed
teammates: 4
pipeline:
  from: null
  to: ["/spawn-build --mode feature", "/spawn-create --mode design"]
---
```

Body: team composition table, artifact list with relative links, pipeline links, context summary.

### Primary Deliverable (`docs/teams/{team-name}/{artifact}.md`)

```yaml
---
artifact: roadmap
team: plan-roadmap-myapp
type: planning
date: 2026-02-11
---
```

### Task Output (`docs/teams/{team-name}/tasks/{nn}-{slug}.md`)

```yaml
---
task: 1
title: "Analyze product vision"
owner: Strategist
team: plan-roadmap-myapp
date: 2026-02-11
---
```

## Root Index

The root index at `docs/teams/README.md` tracks all team runs. Create it if it doesn't exist, append to it if it does:

```markdown
# Team Artifacts

| Team | Type | Mode | Topic | Date | Status | Primary Artifact |
|------|------|------|-------|------|--------|-----------------|
| plan-roadmap-myapp | planning | product-roadmap | MyApp product roadmap | 2026-02-11 | completed | [roadmap.md](plan-roadmap-myapp/roadmap.md) |
```

## When to Write Task Artifacts

| Write | Skip |
|-------|------|
| Analysis, reports, and recommendations (research findings, risk matrices, design specs) | Code implementation tasks (the code itself is the artifact) |
| Plans, roadmaps, and strategies | Infrastructure or configuration tasks |
| Evaluation criteria and scoring | Tasks that only produce in-context messages |

## Artifact Mapping by Team Type

| Team Type | Dir Pattern | Primary Deliverable |
|-----------|------------|-------------------|
| Planning (Roadmap) | `plan-roadmap-{slug}` | `roadmap.md` |
| Planning (Spec) | `plan-spec-{slug}` | `spec.md` |
| Planning (ADR) | `plan-adr-{slug}` | `adr.md` |
| Planning (Migration) | `plan-migration-{slug}` | `migration-plan.md` |
| Planning (Business Case) | `plan-bizcase-{slug}` | `business-case.md` |
| Planning (GTM) | `plan-gtm-{slug}` | `gtm-plan.md` |
| Planning (OKR) | `plan-okr-{slug}` | `okr-tree.md` |
| Research (Eval) | `research-eval-{slug}` | `evaluation-report.md` |
| Research (Landscape) | `research-landscape-{slug}` | `landscape-report.md` |
| Research (Risk) | `research-risk-{slug}` | `risk-assessment.md` |
| Feature | `feature-{slug}` | `implementation-summary.md` |
| Design | `design-{slug}` | `component-spec.md` / `page-spec.md` / `redesign-spec.md` |
| Review | `review-{slug}` | `review-report.md` |
| Debug | `debug-{slug}` | `root-cause-analysis.md` |
| Productivity | `productivity-{slug}` | `productivity-report.md` |
| Brainstorming | `brainstorm-{slug}` | `brainstorm-output.md` |

## Standard Instructions for Spawn Prompts

The lead's final compilation/synthesis task should include artifact writing. Append to the task description:

```
Write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `[filename].md` with frontmatter,
task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`.
```
