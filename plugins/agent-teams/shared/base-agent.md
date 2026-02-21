# Base Agent Behaviors

Universal teammate behaviors that apply to ALL teammates in ALL team types. Reference this file from spawn prompts to ensure consistent communication, artifact handling, and protocol compliance.

## Protocol References

Every teammate MUST follow these protocols (included verbatim in spawn prompts):

1. **Task Blocking Protocol** — See `shared/task-blocking-protocol.md` for the canonical block
2. **Output Standards** — See `shared/output-standard.md` for the canonical block with context-type lookup

## Communication Defaults

### Message Discipline

- **Default to direct messages** — Use `SendMessage` with a specific recipient for normal communication
- **Never broadcast** unless the issue genuinely affects every teammate (e.g., "blocking bug found, stop all work")
- **Batch instructions** — One detailed message beats multiple short follow-ups
- **No status messages while idle** — The system notifies the lead automatically when you go idle

### Peer Communication

- When you discover something relevant to another teammate's work, message them directly
- Share evidence, not conclusions — let the other teammate draw their own conclusions from the data
- When disagreeing with another teammate, cite specific evidence rather than asserting opinion

### Lead Communication

- Message the lead only for: blocking issues, user feedback gate readiness, task completion with significant findings
- Do NOT message the lead with: progress updates, "standing by" notices, routine task claims

## Artifact Defaults

### Directory Structure

All team deliverables go to `docs/teams/[TEAM-NAME]/`:

```
docs/teams/[TEAM-NAME]/
├── README.md                    # Team metadata, artifact list, pipeline links
├── [primary-artifact].md        # Main deliverable with YAML frontmatter
└── tasks/
    ├── 01-[task-slug].md        # Task-level output
    ├── 02-[task-slug].md
    └── ...
```

### Frontmatter

Every artifact file includes YAML frontmatter:

```yaml
# Primary deliverable
---
artifact: [artifact-name]
team: [team-name]
type: [team-type]
date: [YYYY-MM-DD]
---

# Task output
---
task: [task-number]
title: "[task-title]"
owner: [teammate-name]
team: [team-name]
date: [YYYY-MM-DD]
---
```

### Root Index

The designated compiler teammate updates `docs/teams/README.md` with a row for this team run.

### When to Write Artifacts

| Write | Skip |
|---|---|
| Analysis, reports, recommendations | Code implementation (the code IS the artifact) |
| Plans, roadmaps, strategies | Infrastructure or configuration tasks |
| Evaluation criteria and scoring | Tasks that only produce in-context messages |

## Delegate Mode Compliance

When the lead is in delegate mode:
- The lead coordinates but does NOT write files
- A designated teammate handles final compilation and artifact writing
- Each spawn command specifies which teammate compiles (e.g., Architect for specs, Strategist for roadmaps)

## Shutdown Compliance

When you receive a `shutdown_request`:
- Approve immediately unless you are mid-write on a file
- If mid-write, finish the write, then approve
- Do NOT reject to "finish up" analysis or messages — those can be resumed later
