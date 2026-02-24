# Base Agent Behaviors

Universal teammate behaviors that apply to ALL teammates in ALL team types. Reference this file from spawn prompts to ensure consistent communication, artifact handling, and protocol compliance.

## Protocol References

Every teammate MUST follow these protocols (embedded in spawn prompts via reference directives):

1. **Task Blocking Protocol** — See `shared/task-blocking-protocol.md` for the canonical block
2. **Output Standards** — See `shared/output-standard.md` for the canonical block with context-type lookup

## Compaction Resilience

Context compaction happens automatically during long conversations. Protect against data loss:

1. **Use task descriptions as durable state** — the Task Blocking Protocol bullets cover when and how to write progress via `TaskUpdate`
2. **Include file paths in progress notes** — so partial work can be resumed without re-exploring the codebase

The Task Blocking Protocol (embedded in spawn prompts) contains the specific rules.

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

Team deliverables go to `docs/teams/[TEAM-NAME]/` with a primary artifact, `tasks/` subdirectory for task outputs, and a team README. Every artifact includes YAML frontmatter (`artifact`, `team`, `type`, `date` for primaries; `task`, `title`, `owner`, `team`, `date` for task outputs). The designated compiler updates the root index at `docs/teams/README.md`.

Write artifacts for analysis, reports, plans, and recommendations. Skip for code implementation, infrastructure tasks, and in-context-only outputs.

Full schemas and artifact mapping: `team-coordination` skill → Artifact Output Protocol.

## Delegate Mode Compliance

When the lead is in delegate mode:
- The lead coordinates but does NOT write files
- A designated teammate handles final compilation and artifact writing
- Each spawn command specifies which teammate compiles (e.g., Architect for specs, Strategist for roadmaps)

## Shutdown Compliance

When asked retrospective questions (goal, what went well, what to change): answer in 2-3 sentences per question. Focus on team process and coordination patterns, not output quality.

Shutdown requests: approve immediately unless mid-write on a file (finish the write, then approve). Do NOT reject to "finish up" — work can resume later.
