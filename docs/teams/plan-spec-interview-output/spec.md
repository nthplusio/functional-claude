---
artifact: spec
team: plan-spec-interview-output
type: planning
date: 2026-02-22
issues: ["#8", "#18", "#19"]
version_target: v0.18.0
---

# Implementation Spec — Agent Teams v0.18.0

Three improvements to the `agent-teams` plugin shipping together as v0.18.0.

---

## Overview

| Issue | Change | Primary File |
|---|---|---|
| #8 | Replace fixed 3+2 interview with dynamic protocol (cap 10); fold and delete spec-refinement.md | `shared/discovery-interview.md` |
| #18 | Add dependency grep step to Risk Analyst role in Technical Spec mode only | `shared/planning-blueprints.md` |
| #19 | Add `task-{N}-{role-slug}.md` filename convention to output-standard.md; update base-agent.md and add worked example in spawn-core.md | `shared/output-standard.md` |

---

## Implementation Order

1. **#18** — `planning-blueprints.md` only; no cross-spec dependencies
2. **#19** — `output-standard.md`, `base-agent.md`, `spawn-core.md`; no cross-spec dependencies
3. **#8** — `discovery-interview.md` rewrite + `spec-refinement.md` deletion + 4 supporting file updates; do atomically (manifest + deletion together)

No conflicts between specs. #18 and #19 do not touch the same files.

---

## Issue #8 — Dynamic Discovery Interview

### Files Changed

| File | Action |
|---|---|
| `plugins/agent-teams/shared/discovery-interview.md` | 4 targeted changes (A–D) |
| `plugins/agent-teams/shared/spec-refinement.md` | **Delete** |
| `plugins/agent-teams/plugin-manifest.json` | Remove line 30 — `"shared/spec-refinement.md"` entry |
| `plugins/agent-teams/skills/evaluate-spawn/SKILL.md` | Update line 326 — improvement target reference |
| `plugins/agent-teams/commands/spawn-think.md` | Update line 258 — stale "3+2" string |

---

### Change A — Core Questions intro sentence

**File:** `shared/discovery-interview.md`, line 11

FIND:
```
Every discovery interview asks up to 3 core questions. These are universal across all team types:
```

REPLACE WITH:
```
Every discovery interview asks up to 3 core questions (universal across all team types), followed by up to 7 dynamic follow-up questions. Total interview cap: 10 questions.
```

---

### Change B — Replace "Optional Questions" section

**File:** `shared/discovery-interview.md`, lines 19–27

REMOVE entire section:
```markdown
## Optional Questions

Ask 0-2 additional questions triggered by keyword detection in `$ARGUMENTS`. These are NOT asked by default — only when the keyword match suggests they'd add value.

| Trigger Keywords | Optional Question | Purpose |
|---|---|---|
| existing, prior, already, current, legacy, migrate | **Existing context** — "What related work already exists? Prior specs, code, research, or design docs?" | Prevents reinventing existing patterns; surfaces integration points |
| quality, polish, fast, speed, performance, trade-off | **Quality priority** — "What matters most — correctness, performance, UX polish, or shipping speed?" | Shapes trade-off decisions during execution |
```

REPLACE WITH:
```markdown
## Dynamic Follow-Up Questions

After the 3 core questions, generate up to 7 dynamic follow-ups for a total cap of 10 questions. Dynamic questions come from three sources, evaluated in order:

### Source 1: Mode-Specific Extended Questions (Minimum Floor)

Each spawn command defines its own extended questions (see "Extended Questions" section at the end of this doc). Always include the applicable extended questions for the current mode before applying other heuristics. These are the minimum floor — not the cap.

### Source 2: Feature-Characteristic Heuristics

After including mode-specific extended questions, apply this heuristic table. For each characteristic present in `$ARGUMENTS` or the compiled Goal answer, add the corresponding question (if budget allows under the 10-question cap):

| Feature Characteristic | Trigger Signal | Follow-Up Question |
|---|---|---|
| Batch operations | "bulk", "batch", "multiple records", "import", "export" | "Should batch failures stop the entire operation, or continue processing remaining items?" |
| Data mutations | "update", "delete", "edit", "modify", "write", "save" | "What rollback or undo behavior is expected if the operation fails partway through?" |
| UI changes | "component", "page", "screen", "UI", "UX", "display", "render" | "Are there accessibility requirements (screen readers, keyboard nav, contrast ratios) to meet?" |
| Async / background work | "async", "queue", "background", "job", "scheduled", "worker" | "How should the user be notified when the background operation completes or fails?" |
| Authentication / sessions | "auth", "login", "session", "token", "permission", "role" | "What happens when the user's session expires mid-operation?" |
| External integrations | "API", "webhook", "third-party", "service", "integration" | "If the external service is unavailable, should the feature degrade gracefully or block?" |
| Pagination / large datasets | "list", "table", "paginate", "scroll", "search results", "records" | "What is the expected upper bound on records, and how should the feature behave at scale?" |
| State shared across users | "collaborative", "shared", "concurrent", "real-time", "sync" | "What happens when two users modify the same record simultaneously?" |
| User input / forms | "form", "input", "field", "submit", "upload", "enter" | "What are the valid formats and ranges for each input? What happens with invalid input?" |
| Soft-delete / archive | "archive", "soft-delete", "hide", "inactive", "restore" | "Can archived items be restored? Who can restore them?" |

Apply all matching rows (multiple characteristics may match). Stop when the 10-question cap is reached.

### Source 3: Ambiguity Detection

After core questions are answered, scan each answer for ambiguity signals before presenting follow-ups. An answer is ambiguous if it:
- Uses undefined pronouns ("it", "they", "this") without clear referent
- Contains vague quantifiers ("some", "a few", "many", "often") without definition
- Lists options without specifying which applies ("or", "either/or", "depending on")
- Uses passive voice hiding the actor ("it should be saved" — saved by whom? where?)

For each ambiguous answer, generate one clarifying follow-up referencing the specific text: e.g., "You said 'it should notify users' — which users, and via what channel?"

Ambiguity follow-ups count against the 10-question cap.

### Batch Presentation

Present all queued questions in batches of 2-3 using `AskUserQuestion`. Never ask one question at a time. Recommended batching:
- Batch 1: 3 core questions (or fewer if already answered in `$ARGUMENTS`)
- Batch 2: Mode-specific extended + top 2 heuristic matches
- Batch 3 (if needed): Remaining heuristic + ambiguity follow-ups

If fewer than 2 follow-ups remain, combine with the nearest batch.

### Stop Conditions

Stop generating questions when ANY of the following is true:
1. **Cap reached**: 10 questions have been asked (counting all phases)
2. **No remaining triggers**: No heuristic rows match and no ambiguity detected
3. **User signals done**: User responds "skip", "enough", "proceed", or an equivalent dismissal
4. **Coverage complete**: All applicable heuristic categories have been probed (even if under cap)
```

---

### Change C — Remove "Refinement Phase" section; add "Edge Cases Output"

**File:** `shared/discovery-interview.md`, lines 86–94

REMOVE:
```markdown
## Refinement Phase

After compiling interview answers, run the refinement protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-refinement.md`.

This step generates 2–4 targeted follow-up questions derived from the compiled context, probing edge cases, failure modes, and boundary conditions. The output is a `### Edge Cases` subsection added to the compiled Context block.

**When to include:** Same as discovery interview — if a discovery interview was run, run refinement. If the interview was skipped (all answers in `$ARGUMENTS`), refinement is still recommended but can be skipped.

**Skip:** User can skip refinement by typing "skip". Skipping penalizes the edge-case dimension in quality scoring.
```

REPLACE WITH:
```markdown
## Edge Cases Output

After dynamic follow-up questions complete (or are skipped), compile all heuristic and ambiguity follow-up answers into a `### Edge Cases` subsection appended to the compiled Context block:

```markdown
### Edge Cases

- **[Heuristic Category or Ambiguity]:** [User's answer]
- **[Heuristic Category or Ambiguity]:** [User's answer]
```

If the user skipped all follow-ups:
```markdown
### Edge Cases
[Skipped — edge case coverage not assessed]
```

The edge-case dimension in spec quality scoring evaluates whether this subsection contains substantive answers. Skipping penalizes that dimension.
```

---

### Change D — Update Quality Scoring lead-in

**File:** `shared/discovery-interview.md`, line 98

FIND:
```
After refinement completes (or is skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.
```

REPLACE WITH:
```
After dynamic follow-up questions complete (or are skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.
```

---

### Change E — Delete spec-refinement.md

Delete the file `plugins/agent-teams/shared/spec-refinement.md` entirely. Do not leave a stub.

---

### Change F — Remove spec-refinement.md from plugin manifest

**File:** `plugins/agent-teams/plugin-manifest.json`, line 30

FIND:
```json
"shared/spec-refinement.md",
```

REMOVE this line. (Must be done in the same commit as Change E to keep manifest consistent.)

---

### Change G — Update evaluate-spawn improvement target

**File:** `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`, line 326

FIND:
```markdown
- `shared/spec-refinement.md` — Add question categories based on recurring "spec refinement should have surfaced it" patterns
```

REPLACE WITH:
```markdown
- `shared/discovery-interview.md` § Feature-Characteristic Heuristics — Add heuristic rows based on recurring "spec should have surfaced it" patterns. Each new row needs: Feature Characteristic, Trigger Signal, Follow-Up Question.
```

---

### Change H — Update stale "3+2" string in spawn-think

**File:** `plugins/agent-teams/commands/spawn-think.md`, line 258

FIND:
```
- Streamlined 3+2 discovery interview from `shared/discovery-interview.md`
```

REPLACE WITH:
```
- Dynamic discovery interview (3 core + up to 7 follow-ups, cap 10) from `shared/discovery-interview.md`
```

---

### Acceptance Criteria — Issue #8

- [ ] `discovery-interview.md` contains no reference to `spec-refinement.md`
- [ ] `discovery-interview.md` § Dynamic Follow-Up Questions contains all 3 sources with the 10-row heuristic table
- [ ] Stop conditions enumerated (4 conditions)
- [ ] Batch presentation rule (2-3 per batch) stated
- [ ] `### Edge Cases` subsection still produced (content or skip marker)
- [ ] `spec-quality-scoring.md` edge-case dimension behavior unchanged (no edits needed)
- [ ] `spec-refinement.md` deleted (not stubbed)
- [ ] `plugin-manifest.json` no longer lists `shared/spec-refinement.md`
- [ ] `spawn-think.md:258` no longer says "3+2"
- [ ] `evaluate-spawn/SKILL.md:326` references `discovery-interview.md` heuristic table

---

## Issue #18 — Dependency Grep for Risk Analyst

### Files Changed

| File | Action |
|---|---|
| `plugins/agent-teams/shared/planning-blueprints.md` | Modify Mode 2 Risk Analyst role description (lines 130–134) and task-3 line (~line 158) |

Mode 5 (Business Case) Risk Analyst role: **no change** — different risk domain.

---

### Change A — Risk Analyst role description (Mode 2 only)

**File:** `shared/planning-blueprints.md`, lines 130–134

FIND:
```
3. **Risk Analyst** — Identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.
```

REPLACE WITH:
```
3. **Risk Analyst** — Before assessing risks, run a dependency grep: search the codebase for
   files that import, reference, or configure the component under spec (use Grep tool with the
   component name, key interfaces, and config keys as search terms). Include a "Dependency
   Surface" table in your task output listing affected files and their coupling type (import,
   config, test, docs). Then identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.
```

---

### Change B — Task 3 description line

**File:** `shared/planning-blueprints.md`, Mode 2 task list (~line 158)

FIND:
```
3. [Risk Analyst] Identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
```

REPLACE WITH:
```
3. [Risk Analyst] Run dependency grep on the component under spec, then identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
```

---

### Dependency Surface Table Format (produced in task output)

```markdown
## Dependency Surface

| File | Coupling Type | Notes |
|------|--------------|-------|
| src/api/auth.ts | import | Imports AuthService directly |
| config/app.yaml | config | Sets AUTH_TIMEOUT key |
```

Coupling types: `import`, `config`, `test`, `docs`, `indirect`

---

### Acceptance Criteria — Issue #18

- [ ] Mode 2 Risk Analyst role description begins with "Before assessing risks, run a dependency grep"
- [ ] Role description specifies Grep tool, component name, key interfaces, config keys as search terms
- [ ] Role description requires a "Dependency Surface" table with file + coupling type columns
- [ ] Mode 2 task-3 line references dependency grep
- [ ] Mode 5 (Business Case) Risk Analyst role is unchanged

---

## Issue #19 — Task Output Filename Convention

**Gate decision:** Convention is `task-{N}-{role-slug}.md`. Do NOT embed `→ write to ...` in individual task description lines. Instead: document the convention in `output-standard.md`, update `base-agent.md` to match, and add a worked example in `spawn-core.md`.

### Files Changed

| File | Action |
|---|---|
| `plugins/agent-teams/shared/output-standard.md` | Add filename convention section; update Protocol Block line (all 3 variants) |
| `plugins/agent-teams/shared/base-agent.md` | Update directory tree at lines 51–54 to use new convention |
| `plugins/agent-teams/shared/spawn-core.md` | Add worked example in "Lead Task Assignment Behavior" section |

---

### Change A — Add filename convention section to output-standard.md

**File:** `shared/output-standard.md`

INSERT after the "## Protocol Block" section (after line 24):

```markdown
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
```

---

### Change B — Update Protocol Block "Task outputs" line

**File:** `shared/output-standard.md`

FIND (appears in all 3 variants — standard, single-source-of-truth, debug):
```
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

REPLACE WITH (in all 3 locations):
```
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md` — keep each under 500 lines. Filename is specified in your task description.
```

---

### Change C — Update base-agent.md directory tree

**File:** `shared/base-agent.md`, lines 51–54

FIND:
```
    ├── 01-[task-slug].md        # Task-level output
    ├── 02-[task-slug].md
    └── ...
```

REPLACE WITH:
```
    ├── task-1-[role-slug].md    # Task-level output
    ├── task-2-[role-slug].md
    └── ...
```

---

### Change D — Add worked example in spawn-core.md

**File:** `shared/spawn-core.md`

In the "Lead Task Assignment Behavior" section (starting at line 170), append after the paragraph ending "...Responding to a teammate's question":

```markdown

**Task output filenames:** When writing task descriptions in the spawn prompt, include the expected output filename using the `task-{N}-{role-slug}.md` convention. Example:

```
1. [Architect] Analyze existing system, define high-level design — write to `docs/teams/[TEAM-NAME]/tasks/task-1-architect.md`
2. [API Designer] Draft API contracts and data models — write to `docs/teams/[TEAM-NAME]/tasks/task-2-api-designer.md`
3. [Risk Analyst] Run dependency grep, identify technical risks (NO blockers) — write to `docs/teams/[TEAM-NAME]/tasks/task-3-risk-analyst.md`
```

USER FEEDBACK GATE and `[All]` cross-review tasks produce no file — omit the filename from those lines.
```

---

### Acceptance Criteria — Issue #19

- [ ] `output-standard.md` contains a "Task Output Filename Convention" section documenting `task-{N}-{role-slug}.md`
- [ ] All 3 Protocol Block variants updated to reference `task-{N}-{role-slug}.md`
- [ ] `base-agent.md` directory tree uses `task-1-[role-slug].md` pattern (not `01-[task-slug].md`)
- [ ] `spawn-core.md` "Lead Task Assignment Behavior" section contains a worked example with 3 task lines
- [ ] No task description lines in blueprint or command files were individually edited (Change 3 dropped)

---

## Post-Implementation Checklist

- [ ] All changes for #18 applied (Mode 2 only, not Mode 5)
- [ ] All changes for #19 applied (output-standard.md, base-agent.md, spawn-core.md only)
- [ ] All changes for #8 applied atomically (spec-refinement.md deleted + manifest updated in same commit)
- [ ] Run `/bump-version agent-teams 0.18.0`
- [ ] Run `/pre-release agent-teams` — all 4 sync points pass
- [ ] Confirm `spec-refinement.md` is deleted (not emptied or stubbed)
- [ ] Confirm `plugin-manifest.json` no longer lists `shared/spec-refinement.md`
- [ ] Confirm `spawn-think.md:258` no longer says "3+2"
