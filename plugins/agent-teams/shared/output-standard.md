# Output Standards

Canonical output standards block included in every spawn prompt. Controls verbosity, prevents restating shared context, and directs task output to the standard artifact directory.

## Why This Exists

Without output standards, teammates:
- Write essay-length responses when bullet points suffice
- Restate the entire shared context section back, wasting tokens
- Bury conclusions under preamble and throat-clearing
- Write task outputs to inconsistent or missing locations

## Protocol Block

Spawn prompts reference this block via `[Include Output Standards from shared/output-standard.md]`. The lead reads this file at spawn time, replaces `[CONTEXT-TYPE]` with the appropriate value from the lookup table below, and embeds the result in the prompt text teammates receive:

```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the [CONTEXT-TYPE] Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` — keep each under 500 lines. Filename is specified in your task description.
```

## Task Output Filename Convention

Task output files in `docs/teams/[TEAM-NAME]/tasks/` MUST follow this naming pattern:

```
task-{N}-{role-slug}.md
```

Where:
- `{N}` = task number as assigned in the spawn prompt (unpadded: `1`, `2`, `11`)
- `{role-slug}` = lowercase, hyphenated role name (e.g., `architect`, `risk-analyst`, `api-designer`)

**Examples:**
- Task 1 owned by Architect → `task-1-architect.md`
- Task 3 owned by Risk Analyst → `task-3-risk-analyst.md`
- Task 9 owned by API Designer → `task-9-api-designer.md`

**Exceptions:**
- USER FEEDBACK GATE tasks produce no file
- Cross-review (`[All]`) tasks produce no file
- Compilation tasks use artifact name: `task-{N}-[artifact-slug].md` (e.g., `task-11-roadmap.md`)

The lead specifies the expected filename in each task description. Teammates MUST use the specified name.

### Context-Type Lookup Table

| Team Command | Context-Type Value |
|---|---|
| spawn-build | Feature / Debug (by mode) |
| spawn-think | Research / Planning / Review (by mode) |
| spawn-create | Design / Brainstorming / Productivity (by mode) |

### Variation: Single-Source-of-Truth Rule

For teams where multiple teammates might define the same data models or schemas (Technical Spec, Research Evaluation), add this line after "Never restate":

```
- Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name
```

This is used by: spawn-think (Planning and Research modes).

### Variation: Debug Team (Simplified)

The debug team uses a 4-line variant without the "Never restate" line (investigators need different context norms since they're testing competing hypotheses):

```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` — keep each under 500 lines. Filename is specified in your task description.
```

## Placement

Place immediately after the Task Blocking Protocol block, inside the spawn prompt code fence.
