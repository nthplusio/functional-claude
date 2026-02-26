---
task: 4
title: "Spec: R5 (Retrospective Scan) and R6 (Prior Run Insights Injection)"
owner: architect
team: plan-spec-agent-teams-feedback
date: 2026-02-22
status: complete
recs: [R5, R6]
phase: B
gaps: [G1, G5]
files-modified:
  - plugins/agent-teams/shared/spawn-core.md
  - plugins/agent-teams/shared/discovery-interview.md
  - plugins/agent-teams/commands/spawn-build.md
  - plugins/agent-teams/commands/spawn-think.md
  - plugins/agent-teams/commands/spawn-create.md
---

# Spec: R5 — Retrospective Scan with Cold-Start Guard

## Summary

`shared/spawn-core.md` has a `## Project Analysis Additions` section with a Mock Repository Scan pattern. Nothing equivalent exists for retrospective files. Every spawn starts cold — prior evaluate-spawn learnings and AAR improvements are never surfaced at spawn time.

**Change:** Add a `### Retrospective Scan` subsection to `## Project Analysis Additions` in `shared/spawn-core.md`. Mirror the Mock Repository Scan pattern. Filter by matching retrospective type for the current spawn command. Apply cold-start guard: skip scan if fewer than 3 matching retrospectives exist.

**Two-format handling (Critic issue):** Evaluate-spawn files use `profile:` field (`build`, `think`, `create`). AAR files use `type:` field (`feature`, `debug`, `research`, `planning`, etc.). Both must be scanned with their respective field names. Map spawn command → retrospective filters:

| Spawn Command | Evaluate-Spawn filter | AAR filter |
|---|---|---|
| spawn-build | `profile: build` | `type: feature` or `type: debug` |
| spawn-think | `profile: think` | `type: research` or `type: planning` or `type: review` |
| spawn-create | `profile: create` | `type: design` or `type: brainstorm` or `type: productivity` |

**Deduplication approach:** Do not attempt semantic deduplication across files. Select the 3 most recent files (by date frontmatter), extract actionable insights, and let R6's 100-word cap prevent bloat. The lead synthesizes duplicates naturally.

---

## Files Modified

- `plugins/agent-teams/shared/spawn-core.md` (primary — scan protocol)
- `plugins/agent-teams/commands/spawn-build.md` (Step 8 Project Analysis)
- `plugins/agent-teams/commands/spawn-think.md` (equivalent Project Analysis step)
- `plugins/agent-teams/commands/spawn-create.md` (equivalent Project Analysis step)

---

## Change 1: Add Retrospective Scan to spawn-core.md

**Existing `## Project Analysis Additions` section (lines 153–168, end of file):**

```markdown
## Project Analysis Additions

During the project analysis step (before spawning), scan for shared assets in addition to the standard project structure analysis:

### Mock Repository Scan

Check for `docs/mocks/` in the project root. If found, report the available mocks in the team context:

```
Mock repository: Found [N] mocks in [M] domains at docs/mocks/
Domains: [list of domain directories]
```

If `docs/mocks/` doesn't exist: `Mock repository: Not found`

See `${CLAUDE_PLUGIN_ROOT}/shared/mock-repository.md` for the full mock convention.
```

**Append after the Mock Repository Scan block (at end of file):**

```markdown
### Retrospective Scan

During project analysis, scan for prior run learnings from `docs/retrospectives/`:

**Step 1: Identify target files**
- Glob `docs/retrospectives/*.md` (excludes `-aar.md` files)
- Glob `docs/retrospectives/*-aar.md`
- Filter evaluate-spawn files by matching `profile:` frontmatter to the current spawn command
- Filter AAR files by matching `type:` frontmatter to the current spawn command
- Use the mapping defined in the spawn command (spawn-build → `profile: build` / `type: feature|debug`, etc.)

**Step 2: Cold-start guard**
- Count matched files across both file types
- If total matched count < 3: skip scan. Display: `Prior run scan: insufficient data (N/3 sessions)`
- If total matched count >= 3: proceed to Step 3

**Step 3: Extract insights from matched files (most recent 3 only)**
- Sort matched files by `date:` frontmatter descending. Take the 3 most recent.
- From each evaluate-spawn file: extract `## Actionable Insights` section content
- From each AAR file: extract improvement table rows where `Scope` column = `plugin` (not `project` or `team`)
- Discard rows where improvement has already been applied (noted by any "applied" or "done" annotation)

**Step 4: Report**
- If insights found: surface as `Prior runs (N found): [extracted content]` in the team context
- If step 3 yields no actionable content (files exist but insights are empty): display `Prior run scan: N files found, no actionable insights`
- This output is consumed by R6 (Prior Run Insights injection) when building the Context block
```

---

## Exact Insertion Point

The file ends at line 168 (`See ${CLAUDE_PLUGIN_ROOT}/shared/mock-repository.md for the full mock convention.`). Insert after that line, after a blank line.

---

## Change 2: Reference Retrospective Scan in spawn-build.md

**Existing Step 8 Project Analysis section in spawn-build.md (lines 98–113):**

```markdown
### Step 8: Project Analysis

Before spawning, analyze the project to identify:

**Feature mode:**
- Frontend directory structure (e.g., `src/components/`, `app/`, `pages/`)
- Backend directory structure (e.g., `src/api/`, `src/services/`, `routes/`)
- Test directory structure (e.g., `tests/`, `__tests__/`, `*.test.*`)
- Existing patterns in the codebase (routing, state management, data access)

**Debug mode:**
- Recent git changes: `git log --oneline -20`
- Error logs and reproduction paths
- Code areas related to the bug description

Include findings in the Context section of the spawn prompt.
```

**Replace with:**

```markdown
### Step 8: Project Analysis

Before spawning, analyze the project to identify:

**Feature mode:**
- Frontend directory structure (e.g., `src/components/`, `app/`, `pages/`)
- Backend directory structure (e.g., `src/api/`, `src/services/`, `routes/`)
- Test directory structure (e.g., `tests/`, `__tests__/`, `*.test.*`)
- Existing patterns in the codebase (routing, state management, data access)

**Debug mode:**
- Recent git changes: `git log --oneline -20`
- Error logs and reproduction paths
- Code areas related to the bug description

Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan
- **Retrospective Scan** — use `profile: build` for evaluate-spawn files, `type: feature|debug` for AAR files

Include all findings in the Context section of the spawn prompt.
```

---

## Change 3: Add Retrospective Scan reference to spawn-think.md

Read the current spawn-think.md to locate its Project Analysis step, then add the same reference pattern:

**In spawn-think.md, locate the project analysis step (search for "Project Analysis" or "Step 8" or equivalent). Add to the analysis list:**

```markdown
Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan (if applicable)
- **Retrospective Scan** — use `profile: think` for evaluate-spawn files, `type: research|planning|review` for AAR files
```

> Note: Implementation team should read spawn-think.md immediately before editing to locate the exact insertion point and surrounding context.

---

## Change 4: Add Retrospective Scan reference to spawn-create.md

**In spawn-create.md, locate the project analysis step. Add to the analysis list:**

```markdown
Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan (if applicable)
- **Retrospective Scan** — use `profile: create` for evaluate-spawn files, `type: design|brainstorm|productivity` for AAR files
```

> Note: Implementation team should read spawn-create.md immediately before editing to locate the exact insertion point and surrounding context.

---

## Acceptance Criteria

1. When `docs/retrospectives/` contains 2 matching files, scan displays "Prior run scan: insufficient data (2/3 sessions)" and no insights are injected
2. When `docs/retrospectives/` contains 3+ matching files, scan extracts `## Actionable Insights` from evaluate-spawn files and plugin-scoped improvements from AAR files
3. Only files matching the spawn command's profile/type are counted toward the threshold
4. spawn-build scan filters by `profile: build` / `type: feature|debug`; does NOT count think or create profile retrospectives
5. If `docs/retrospectives/` directory doesn't exist, scan displays "Prior run scan: insufficient data (0/3 sessions)"
6. AAR files (`-aar.md` suffix) are handled separately from evaluate-spawn files (no `-aar.md` suffix)
7. Scan output is available for R6 to consume for Context block injection

---

## Edge Cases

| Situation | Behavior |
|---|---|
| `docs/retrospectives/` missing | Count = 0, cold-start guard fires, no scan |
| 2 evaluate-spawn + 0 AAR files = 2 total | Cold-start guard fires (< 3 total matched) |
| 2 evaluate-spawn + 1 AAR = 3 total | Threshold met — scan proceeds |
| Retrospective file has no `profile:` or `type:` field | Skip file — cannot classify |
| AAR improvement table has no `Scope` column | Extract all improvement rows as fallback |
| Retrospective file has no `## Actionable Insights` section | Skip that file's insights — do not error |
| 5 matching files exist, but only 2 have Actionable Insights content | Count all 5 toward threshold; extract from the 2 that have it |
| Future: retrospective format changes (new fields) | Old files without new fields are still counted if they have `profile:` or `type:` match — graceful degradation |

---

## Dependencies

- R4 (retrospective nudge): Increases retrospective data volume, making the scan more valuable over time. R5 functions without R4 but has less data.
- R6 (Prior Run Insights injection): Depends on R5's scan output. R6 is the consumer; R5 is the producer.

---

---

# Spec: R6 — Inject `### Prior Run Insights` into Context Block

## Summary

`shared/discovery-interview.md` Output Compilation section defines the structure of the `## [Team-Type] Context` block written into spawn prompts. This block currently ends with `### Project Analysis`. Prior run insights from R5's scan have no place in this structure — they are computed but not written anywhere teammates can read them.

**Change:** Add `### Prior Run Insights` as a new subsection after `### Project Analysis` in the Output Compilation template. Populate from R5 scan results. Hard limit: max 3 bullets, max 100 words. Omit entirely if R5 cold-start guard fired (no empty placeholder).

---

## Files Modified

- `plugins/agent-teams/shared/discovery-interview.md`

---

## Insertion Point

**Existing Output Compilation template (lines 62–81):**

```markdown
Compile all interview answers into a structured `## [Team-Type] Context` section in the spawn prompt:

```markdown
## [Team-Type] Context

### Goal
[What we're trying to achieve, desired end state]

### Constraints
[Non-negotiables: budget, timeline, tech stack, etc.]

### Success Criteria
[How success is measured, what done looks like]

### Additional Context
[Answers to optional questions, if asked]

### Project Analysis
[Findings from codebase/document analysis, if applicable]
```
```

**Replace the template block with:**

```markdown
Compile all interview answers into a structured `## [Team-Type] Context` section in the spawn prompt:

```markdown
## [Team-Type] Context

### Goal
[What we're trying to achieve, desired end state]

### Constraints
[Non-negotiables: budget, timeline, tech stack, etc.]

### Success Criteria
[How success is measured, what done looks like]

### Additional Context
[Answers to optional questions, if asked]

### Project Analysis
[Findings from codebase/document analysis, if applicable]

### Prior Run Insights
[Populated from Retrospective Scan (see spawn-core.md). Include only if scan returned actionable content. Hard limit: max 3 bullets, max 100 words total. If cold-start guard fired (fewer than 3 matching retrospectives), omit this subsection entirely — do not add an empty placeholder.]
```
```

---

## Exact Replacement Diff

**Before (the template block's closing lines):**
```markdown
### Project Analysis
[Findings from codebase/document analysis, if applicable]
```

**After:**
```markdown
### Project Analysis
[Findings from codebase/document analysis, if applicable]

### Prior Run Insights
[Populated from Retrospective Scan (see spawn-core.md). Include only if scan returned actionable content. Hard limit: max 3 bullets, max 100 words total. If cold-start guard fired (fewer than 3 matching retrospectives), omit this subsection entirely — do not add an empty placeholder.]
```

Note: This replacement is within the fenced code block in the Output Compilation section. Edit only the template content, not the surrounding prose.

---

## Prior Run Insights Formatting Protocol

The content written to `### Prior Run Insights` must follow this format:

```markdown
### Prior Run Insights
- [Insight 1 — one sentence, active voice, ≤35 words]
- [Insight 2 — one sentence, active voice, ≤35 words]
- [Insight 3 — one sentence, active voice, ≤35 words]
```

**Synthesis rules:**
1. Prefer insights from evaluate-spawn files (they reflect actual spawn outcomes)
2. Include AAR plugin-scope improvements only if they are not already captured by an evaluate-spawn insight
3. If the same theme appears in multiple retrospectives, write one bullet synthesizing the pattern (e.g., "Discovery interview consistently misses authentication edge cases across 3 prior runs")
4. Strip meta-commentary (e.g., do not write "The retrospective noted that..." — just state the insight directly)

**Examples of correct bullets:**
- "Discovery interview missed async validation requirements in 2 of 3 prior feature spawns"
- "Tester found scenario invalidations caused by missing error state scenarios — add error path to refinement questions"
- "Backend API contract approval gate reduced rework in all sessions where it was used"

**Examples of incorrect bullets:**
- "The team should be more careful" (not actionable)
- "Prior retrospective from 2026-01-15 notes that..." (meta-commentary)
- A 60-word run-on sentence (exceeds per-bullet intent)

---

## Acceptance Criteria

1. `### Prior Run Insights` appears in the Context block after `### Project Analysis` when R5 scan returns actionable content
2. If R5 cold-start guard fires, `### Prior Run Insights` subsection is completely absent from the Context block (no empty heading, no placeholder text)
3. Content is max 3 bullets, max 100 words total
4. All teammates receive the insights in their spawn prompt (because it's in the shared Context block)
5. Content is actionable — not a summary of the retrospective file, but a specific insight that changes how teammates approach the work

---

## Edge Cases

| Situation | Behavior |
|---|---|
| R5 scan returns 2 bullets but one is not actionable | Include only the actionable one — do not pad to 3 |
| R5 scan returns 4+ insights | Select top 3 by recency (from most recent retrospective file) |
| Insights exceed 100 words after drafting | Trim to 100 words — prioritize specificity over completeness |
| Cold-start guard fires | Subsection omitted entirely — no heading, no placeholder |
| R5 scan returns "no actionable insights" (files exist but empty) | Subsection omitted — same behavior as cold-start |
| Discovery interview was skipped (all answers in $ARGUMENTS) | R5 scan still runs during project analysis; insights still injected if available |

---

## Dependencies

- R5 (Retrospective Scan): Required prerequisite. R6 is meaningless without R5's scan output.
- R5a (Lessons Applied section): Complementary — R5a adds the same data to the Lead's Planning Context in blueprints; R6 adds it to the team's shared Context block for all teammates. These are not duplicates — one is lead-facing, one is team-facing.
