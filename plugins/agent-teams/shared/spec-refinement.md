# Spec Refinement

Structured edge-case prompting step inserted between discovery interview output compilation and team spawning. Generates targeted follow-up questions derived from the compiled spec content, producing a `### Edge Cases` subsection in the Context block.

## Why This Exists

Without refinement, discovery interviews gather intent but not edge cases. Teams encounter gaps mid-implementation — an error state nobody discussed, a permission boundary nobody defined, an empty state nobody designed — causing unplanned pivots and wasted tokens. Refinement surfaces these gaps before spawning so teammates can handle them from the start.

## Trigger

Run immediately after the discovery interview's `## Output Compilation` completes — before adaptive sizing, before spawning.

- **Input:** The compiled `## [Team-Type] Context` section
- **Output:** A `### Edge Cases` subsection appended to the Context block

## Refinement Protocol

1. Read the compiled `## [Team-Type] Context` section
2. Generate 2–4 follow-up questions **derived from the spec content** (not a fixed list)
3. Questions MUST probe at least two of the categories in the Question Generation Guide below
4. Questions MUST reference specific details from the compiled spec (e.g., "You mentioned user roles — what happens when a user's role changes mid-session?" not "What about error handling?")
5. Present all questions via `AskUserQuestion` in a single batch
6. Compile answers into a `### Edge Cases` subsection

## Question Generation Guide

Select 2–4 categories based on what the compiled spec contains. Adapt the templates to reference specific details from the spec.

| Category | Template | When to Probe |
|---|---|---|
| Error states | "What should happen when [specific operation from spec] fails?" | Always — every feature has failure modes |
| Permission boundaries | "Who can [specific action]? What happens if an unauthorized user attempts it?" | When spec mentions users, roles, or access |
| Empty states | "What does [specific UI/data element] look like when there's no data?" | When spec involves data display or lists |
| Failure modes | "If [external dependency from spec] is unavailable, should the feature degrade or block?" | When spec mentions external services, APIs, databases |
| Concurrent access | "What happens if two users [specific action] simultaneously?" | When spec involves shared state or collaborative features |
| Data validation | "What are the valid ranges/formats for [specific input from spec]? What happens with invalid input?" | When spec involves user input |

## Skip Logic

User can type "skip" or select "Skip refinement" to proceed without answering.

- If skipped, append this to the Context block:
  ```markdown
  ### Edge Cases
  [Refinement skipped — edge case coverage not assessed]
  ```
- Skipping penalizes the edge-case dimension in quality scoring (Phase 1b — future integration)

## Output Format

Append this subsection to the compiled `## [Team-Type] Context` block, after `### Project Analysis` (or the last existing subsection):

```markdown
### Edge Cases

Based on refinement:
- **[Category]:** [User's answer to the refinement question]
- **[Category]:** [User's answer]
- ...
```

## Integration with Spawn Commands

Each spawn command that references `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md` should call the refinement phase after output compilation. After compiling the interview output, follow the refinement protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-refinement.md`.
