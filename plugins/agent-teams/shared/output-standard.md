# Output Standards

Canonical output standards block included in every spawn prompt. Controls verbosity, prevents restating shared context, and directs task output to the standard artifact directory.

## Why This Exists

Without output standards, teammates:
- Write essay-length responses when bullet points suffice
- Restate the entire shared context section back, wasting tokens
- Bury conclusions under preamble and throat-clearing
- Write task outputs to inconsistent or missing locations

## Protocol Block

Include this block verbatim in every spawn prompt, replacing `[CONTEXT-TYPE]` with the appropriate value from the lookup table below:

```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the [CONTEXT-TYPE] Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

### Context-Type Lookup Table

| Team Command | Context-Type Value |
|---|---|
| spawn-feature-team | Feature |
| spawn-research-team | Research |
| spawn-design-team | Design |
| spawn-review-team | Review |
| spawn-debug-team | Debug |
| spawn-planning-team | Planning |
| spawn-productivity-team | Productivity |
| spawn-brainstorming-team | Brainstorming |
| spawn-build | Feature / Debug (by mode) |
| spawn-think | Research / Planning / Review (by mode) |
| spawn-create | Design / Brainstorming / Productivity (by mode) |

### Variation: Single-Source-of-Truth Rule

For teams where multiple teammates might define the same data models or schemas (Technical Spec, Research Evaluation), add this line after "Never restate":

```
- Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name
```

This is used by: spawn-planning-team, spawn-research-team.

### Variation: Debug Team (Simplified)

The debug team uses a 4-line variant without the "Never restate" line (investigators need different context norms since they're testing competing hypotheses):

```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

## Placement

Place immediately after the Task Blocking Protocol block, inside the spawn prompt code fence.
