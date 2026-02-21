---
task: quality-review
title: "Quality Review — Tasks 5, 6, 7"
owner: quality-reviewer
team: review-agent-teams-v015
date: 2026-02-20
---

# Quality Review: Agent Teams v0.15.0

## Task 5: Unified Command Submode Coverage

### spawn-build (covers: feature, debug)

**Feature mode vs spawn-feature-team:**

| Aspect | Legacy (spawn-feature-team) | Unified (spawn-build --mode feature) | Status |
|---|---|---|---|
| Team composition | Frontend, Backend, Tester + optional DevOps/Docs | Same | OK |
| Discovery interview | 5 core questions | 3 core + up to 2 mode-specific extended | CHANGED |
| Optional teammates | DevOps, Documentation | Same | OK |
| Project analysis | Full (FE/BE/test dirs + patterns) | Same | OK |
| Spawn prompt | Full verbatim copy | Same content, same task list | OK |
| Output message | Detailed 5-phase summary + shortcuts + pipeline | Simplified template via spawn-core.md | Minor regression |
| Feature Context sections | 6 sections (scope, existing context, constraints, criteria, quality, project analysis) | 3 sections (goal, constraints, success criteria) | REGRESSION |

**Issue (Feature mode):** The legacy command collects 5 rich interview questions covering "existing context", "tech constraints", "acceptance criteria", and "quality bar priority" separately. The unified command reduced to 3 core questions (goal, constraints, success criteria) + up to 2 extended (existing context, quality bar). The unified command's **Feature Context** in the spawn prompt is simplified — it only has 3 sections vs. the legacy's 6 sections. Content that was previously captured separately (acceptance criteria as its own section, tech constraints as its own section) is now merged into generic "Constraints" and "Success Criteria" headings. This represents a **loss of interview depth** for the feature mode.

**Debug mode vs spawn-debug-team:**

| Aspect | Legacy (spawn-debug-team) | Unified (spawn-build --mode debug) | Status |
|---|---|---|---|
| Hypothesis gate | Uses AskUserQuestion; asks user to confirm/adjust/replace | Same | OK |
| Clarifying questions | 1-2 if bug description vague | Asks 1 question (reproduction only, when < 20 words) | Minor regression |
| Spawn prompt | Full verbatim copy | Same content | OK |
| Task list (8 tasks) | Identical | Identical | OK |
| Output message | Detailed summary | Simplified via spawn-core.md | Minor regression |

**Issue (Debug mode):** Legacy asks up to 2 clarifying questions ("symptoms" + "recent changes"); unified asks at most 1 ("reproduction"). The "when did this start / recent changes" question is dropped from the unified command — this input was used to formulate Hypothesis B ("alternative cause based on recent changes") and helped populate the git log check. This is a **minor feature loss**.

**Verdict for spawn-build:** Coverage is functionally complete but with interview depth regression for feature mode and one missing clarifying question for debug mode.

---

### spawn-think (covers: research, planning, review)

**Research submodes vs spawn-research-team:**

| Submode | Legacy | Unified | Status |
|---|---|---|---|
| technology-eval | Full 11-task spawn prompt with rich context template (6 sections), 7 extended questions | Identical spawn prompt; 3 core + 2 extended (candidate options, depth/breadth) | OK — spawn prompt identical |
| landscape | Full 11-task spawn prompt | Spawn prompt is condensed (tasks listed as one-liner, not full spawn text) | REGRESSION |
| risk | Full 11-task spawn prompt | Same condensed one-liner treatment | REGRESSION |

**Issue (Research):** The technology-eval submode has a complete spawn prompt in spawn-think.md. However, landscape and risk submodes are documented as one-line summaries ("Same protocol blocks. Tasks: broad survey → categorize → trend analysis → ...") rather than full spawn prompts. This is by design (explicit reference to legacy command), but the spawn-think command instructs the LLM to derive the full prompt from the one-liner. This is less precise than the legacy's verbatim spawn text.

Also: legacy discovery interview had **5 core + 2 extended questions per mode** (including evaluation criteria and domain boundaries). Unified uses **3 core + 2 optional** (candidate options, depth/breadth). The "evaluation criteria" extended question from legacy technology-eval is dropped in the unified command — this was previously used to populate the `[EVALUATION_CRITERIA]` placeholder in the Analyst's spawn description.

**Planning submodes vs spawn-planning-team:**

The spawn-think command explicitly defers all 7 planning submodes to the legacy command:

> "For the full team composition, task lists, and spawn prompts for each of the 7 planning submodes, reference the legacy command at `${CLAUDE_PLUGIN_ROOT}/commands/spawn-planning-team.md`."

This approach avoids duplication but creates a **runtime dependency** on the legacy file being present. If legacy commands are eventually removed (v1.1.0 per deprecation headers), spawn-think planning mode breaks unless the content is migrated.

| Submode | Coverage in spawn-think.md | Status |
|---|---|---|
| roadmap | Keyword listed + delegate to legacy | At-risk |
| spec | Keyword listed + delegate to legacy | At-risk |
| adr | Keyword listed + delegate to legacy | At-risk |
| migration | Keyword listed + delegate to legacy | At-risk |
| bizcase | Keyword listed + delegate to legacy | At-risk |
| gtm | Keyword listed + delegate to legacy | At-risk |
| okr | Keyword listed + delegate to legacy | At-risk |

**The planning delegation is the single largest risk in this refactoring.** When legacy commands are removed at v1.1.0, all 7 planning submodes in spawn-think will break.

**Review submodes vs spawn-review-team:**

| Submode | Legacy | Unified | Status |
|---|---|---|---|
| security | Lead reviewer role + extra threat modeling tasks | Same (IF SECURITY MODE conditional) | OK |
| performance | Lead reviewer role + extra profiling tasks | Same (IF PERFORMANCE MODE conditional) | OK |
| balanced | All reviewers equal | Same | OK |
| Interview | 3 questions: focus, change context, known risks | 2 extended questions (change context, known risk areas) — core 3 (goal, constraints, success criteria) are added | MINOR: interview restructured |
| Optional teammates | Accessibility, Architecture Reviewer | Same | OK |
| Spawn prompt task list | 8 tasks (identical) | Review spawn prompt text abbreviated — protocol blocks replaced with "[Same protocol block as above]" | OK (these are template instructions to the LLM) |

Review mode coverage is substantially complete. The abbreviated protocol block references are acceptable since they appear inside the spawn prompt definition that the LLM reads.

---

### spawn-create (covers: design, brainstorm, productivity)

**Design submodes vs spawn-design-team:**

| Submode | Legacy | Unified | Status |
|---|---|---|---|
| component | 2 extended questions (component API, composition) | Design mode has 2 extended questions (target users, design system) | REGRESSION |
| page-flow | 2 extended questions (flow steps, data requirements) | Same generic 2 questions; no submode-specific extensions | REGRESSION |
| redesign | 2 extended questions (pain points, constraints) | Same generic 2 questions; no submode-specific extensions | REGRESSION |

**Issue:** Legacy had submode-specific extended questions (7 unique questions across 3 submodes). Unified uses 2 generic extended questions (target users, design system) regardless of submode. The submode-specific questions (component API, flow steps, redesign pain points, redesign constraints) are **completely dropped**.

The spawn prompt content itself is identical. The regression is purely in the discovery interview depth.

**Brainstorm categories vs spawn-brainstorming-team:**

| Category | Legacy keywords | Unified keywords | Status |
|---|---|---|---|
| tech | API, architecture, framework, library, performance, database, infrastructure | API, architecture, framework, library, performance, database | Missing: `infrastructure` | Minor |
| product | Feature, user experience, onboarding, pricing, market, customers | Feature, user experience, onboarding, pricing, market, customers | OK |
| process | Workflow, pipeline, CI/CD, process, collaboration, meetings, sprint | Workflow, pipeline, CI/CD, process, collaboration, meetings | Missing: `sprint` | Minor |
| ops | Infrastructure, deployment, scaling, monitoring, reliability, uptime | Infrastructure, deployment, scaling, monitoring, reliability | Missing: `uptime` | Minor |

Also: Legacy has 5 core + 5 extended interview questions (with extended: stakeholders, decision criteria, inspiration, technical context, timeline). Unified has 3 core + 2 extended (prior attempts, scope boundaries). **3 extended questions are dropped** (stakeholders, inspiration/decision criteria, technical context/timeline). This reduces interview richness for brainstorm mode.

Legacy brainstorm: Facilitator spawn description includes "Follow the methodology phases (Setup → Brainwriting Coordination → Collect & Cluster → Convergence) and behavioral instructions defined in the persona." Unified drops this phase enumeration from the Facilitator spawn description. Minor regression in explicitness.

**Productivity mode vs spawn-productivity-team:**

| Aspect | Legacy | Unified | Status |
|---|---|---|---|
| Spawn prompt | Full verbatim | Full verbatim | OK |
| Task list (13 tasks) | Full with all persona references | Full with all persona references | OK |
| Interview | 4 questions | 3 core + 2 extended (pain points, current tools) | Minor: "target workflow" question dropped from core; absorbed by generic "Goal" question |
| Convergence stop condition | "Stop when Convergence Score >= 8 or diminishing returns (delta < 0.5)" | Present | OK |

Legacy had an explicit "Target workflow" question that asked users to walk through a typical cycle. This is partially covered by the generic "Goal" question in the unified command but loses the specificity of "walk me through a typical cycle — what happens, in what order, and who's involved?"

---

### Summary: Submode Coverage (Task 5)

| Unified Command | Mode | Coverage | Issues |
|---|---|---|---|
| spawn-build | feature | Complete | Interview depth reduced; context template simplified |
| spawn-build | debug | Complete | One clarifying question dropped |
| spawn-think | research/tech-eval | Complete | One extended question dropped |
| spawn-think | research/landscape | Condensed | One-liner instead of full spawn prompt |
| spawn-think | research/risk | Condensed | One-liner instead of full spawn prompt |
| spawn-think | planning (all 7) | Delegated to legacy | **BREAKS when legacy removed at v1.1.0** |
| spawn-think | review (all 3) | Complete | Minor interview restructuring |
| spawn-create | design (all 3 submodes) | Complete | Submode-specific interview questions dropped |
| spawn-create | brainstorm (all 4 categories) | Complete | 3 extended questions dropped; 3 minor keyword gaps |
| spawn-create | productivity | Complete | "Walk me through a typical cycle" question weakened |

**Critical finding:** `spawn-think --mode planning` delegates entirely to `spawn-planning-team.md` at runtime. When legacy commands are removed at v1.1.0, all 7 planning submodes will break. This is undocumented as a risk in the refactoring.

---

## Task 6: Pattern Adherence and Naming Conventions

### Deprecation Header Format

Checking consistency across all 8 legacy commands:

| File | Header | Removal Version |
|---|---|---|
| spawn-feature-team.md | `> **Deprecated in v0.15.0** — Use \`/spawn-build --mode feature\` instead. This command remains fully functional but will be removed in v1.1.0.` | v1.1.0 |
| spawn-debug-team.md | Same pattern | v1.1.0 |
| spawn-research-team.md | Same pattern | v1.1.0 |
| spawn-planning-team.md | Same pattern | v1.1.0 |
| spawn-review-team.md | Same pattern | v1.1.0 |
| spawn-design-team.md | Same pattern | v1.1.0 |
| spawn-brainstorming-team.md | Same pattern | v1.1.0 |
| spawn-productivity-team.md | Same pattern | v1.1.0 |

**Result: All 8 deprecation headers are consistent.** Same format, same placement (immediately after the `#` heading), same removal version. PASS.

### YAML Frontmatter (Commands)

All 3 unified commands have frontmatter:
- `spawn-build.md`: `name`, `description`, `argument-hint` — PASS
- `spawn-think.md`: `name`, `description`, `argument-hint` — PASS
- `spawn-create.md`: `name`, `description`, `argument-hint` — PASS

All 8 legacy commands have frontmatter:
- Checked: all have `name`, `description`, `argument-hint` — PASS

### YAML Frontmatter (SKILL.md files)

- `team-coordination/SKILL.md`: has `name`, `description`, `version: 0.15.0` — PASS
- `team-blueprints/SKILL.md`: has `name`, `description`, `version: 0.15.0` — PASS

### Shared File Organization

Shared files in `plugins/agent-teams/shared/`:
- `base-agent.md` — documentation file, no frontmatter (consistent with non-skill pattern)
- `discovery-interview.md` — documentation file, no frontmatter — PASS
- `output-standard.md` — documentation file, no frontmatter — PASS
- `prerequisites-check.md` — documentation file, no frontmatter — PASS
- `spawn-core.md` — documentation file, no frontmatter — PASS
- `task-blocking-protocol.md` — documentation file, no frontmatter — PASS

All 6 shared files follow consistent pattern: markdown documentation without YAML frontmatter, `#` heading, `## Why This Exists` or `## Protocol Block` structure. PASS.

### Persona Registry (registry.md)

`skills/team-personas/registry.md`:
- No YAML frontmatter — consistent with being a reference file under skills/, not a SKILL.md itself
- Uses `##` for main sections, table-heavy structure
- Capability tags use backtick-wrapped `#tag` format consistently
- Reference files use `${CLAUDE_PLUGIN_ROOT}` path convention — PASS

**Minor issue:** `registry.md` doesn't have the same YAML frontmatter pattern as `SKILL.md` files, but it's not a skill itself — it's a reference file. This is correct and consistent with other reference files.

### File Naming

- Unified commands: `spawn-build.md`, `spawn-think.md`, `spawn-create.md` — kebab-case, descriptive — PASS
- Shared files: `base-agent.md`, `discovery-interview.md`, etc. — kebab-case — PASS
- Registry: `registry.md` — PASS

### Migration Tables

All 3 unified commands include a `## Migration` section with a table mapping legacy → unified. Format is consistent across all 3. PASS.

### Version Bump Sync Points

Per task instructions, versions must match across 4 sync points. Checking v0.15.0:
- `team-coordination/SKILL.md`: `version: 0.15.0` — PASS
- `team-blueprints/SKILL.md`: `version: 0.15.0` — PASS

(plugin.json, marketplace.json, and docs/memory.md are other sync points — not checked here per scope.)

**Result for Task 6:** Pattern adherence is strong. No significant violations found.

---

## Task 7: Shared Reference Replacements

### What Was Replaced

The refactoring replaced inline protocol blocks in `team-coordination/SKILL.md`, `team-architect.md`, and `team-blueprints/SKILL.md` with references to `${CLAUDE_PLUGIN_ROOT}/shared/` files.

### Verification: team-coordination/SKILL.md

**Blocking protocol:** SKILL.md line 82 reads:
> "The canonical protocol block is defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — include it verbatim in every spawn prompt."

The shared file `task-blocking-protocol.md` contains the identical 7-bullet protocol block. **PASS** — content preserved, reference accurate.

**Discovery interview pattern:** SKILL.md still contains its own "Discovery Interview Pattern" section (lines 276-346) which is a teaching/reference section, not an inline protocol block that was replaced. This is correct — the SKILL.md teaches the pattern; the shared file provides the canonical implementation. **No regression.**

**Artifact output protocol:** SKILL.md still contains the full "Artifact Output Protocol" section with frontmatter schemas. This is reference content, not replaced by a shared file. **No regression.**

### Verification: team-architect.md

Line 150-151:
```
[Include Task Blocking Protocol from ${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md]
[Include Output Standards from ${CLAUDE_PLUGIN_ROOT}/shared/output-standard.md]
```

These are instructions to the agent to include the blocks from shared files. Both shared files exist and contain the canonical blocks. **PASS.**

The team-blueprints reference at line 65: `${CLAUDE_PLUGIN_ROOT}/skills/team-blueprints/SKILL.md` — this is correct, SKILL.md exists at that path.

The team-personas reference at line 73: `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/SKILL.md` — needs to verify this exists.

### Verification: team-blueprints/SKILL.md

Line 635-639:
> "Every spawn prompt must include the Task Blocking Protocol block. The canonical version is defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — see that file for the exact text, placement guidance, and rationale."

The shared file exists and contains the canonical block. **PASS.**

### Path Correctness

All `${CLAUDE_PLUGIN_ROOT}/shared/` paths reference files that exist:
- `shared/prerequisites-check.md` — exists
- `shared/discovery-interview.md` — exists
- `shared/spawn-core.md` — exists
- `shared/task-blocking-protocol.md` — exists
- `shared/output-standard.md` — exists
- `shared/base-agent.md` — exists

### Content Completeness Check

Comparing inline blocks (from legacy spawn-planning-team.md "Shared Prompt Blocks") to shared files:

**Task Blocking Protocol — legacy inline (spawn-planning-team.md, lines 186-194):**
```
**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
```

**shared/task-blocking-protocol.md — canonical block:**
Identical 7 bullets. **PASS — no content lost.**

**Output Standards — legacy inline (spawn-planning-team.md, lines 199-206):**
```
**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Planning Context back — teammates already have it
- Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**shared/output-standard.md — canonical block with Planning Context variation:**
The shared file defines the block with `[CONTEXT-TYPE]` placeholder and documents the single-source-of-truth rule as an explicit variation. Context-type lookup table maps `spawn-planning-team` → `Planning`. **PASS — no content lost; variation is explicitly handled.**

### Verification: team-personas/SKILL.md Reference in team-architect.md

team-architect.md line 73 references `${CLAUDE_PLUGIN_ROOT}/skills/team-personas/SKILL.md`. This file exists at `plugins/agent-teams/skills/team-personas/SKILL.md`. **PASS.**

### Verdict for Task 7

**Content preservation: PASS.** All inline protocol blocks that were referenced via shared files have identical content in the shared files. No content was lost.

**Path correctness: PASS** for all paths — all 6 shared/ files and both skills/ references exist.

**Rationale preservation:** Both team-coordination/SKILL.md and team-blueprints/SKILL.md correctly redirect readers to shared files for canonical blocks while retaining their own teaching/reference content. The distinction between "canonical protocol block" (in shared/) and "pattern documentation" (in SKILL.md) is well-maintained.

---

## Summary of Findings

### Critical Issues
1. **spawn-think planning mode depends on legacy files at runtime** — When `spawn-planning-team.md` is removed at v1.1.0, all 7 planning submodes in spawn-think will silently break. The delegation statement ("reference the legacy command at...") creates a runtime file dependency that is not documented as a risk.

### Significant Issues
2. **Design submode-specific interview questions dropped** — Legacy spawn-design-team had 3 sets of 2 submode-specific extended questions (component API, flow steps, redesign pain points/constraints). Unified spawn-create uses 2 generic questions regardless of submode. Loss affects output quality when submode is detected.
3. **Feature Context template simplified** — Unified spawn-build feature mode compiles 3 sections vs. legacy's 6 (acceptance criteria and tech constraints no longer have dedicated sections).

### Minor Issues
4. **Brainstorm interview depth reduced** — 5 core + 5 extended → 3 core + 2 extended. Stakeholders, inspiration, and timeline questions dropped.
5. **Debug mode loses "recent changes" clarifying question** — Used to formulate Hypothesis B; now relies on git log analysis alone.
6. **Research landscape and risk submodes use one-liners** — Less precise instruction to LLM than full spawn prompts.
7. **3 keyword gaps in brainstorm category inference** — Missing: `infrastructure` (tech), `sprint` (process), `uptime` (ops).
8. **spawn-think review interview restructured** — Same information gathered via different question framing.

### No Issues
- All 8 deprecation headers are consistent in format and content.
- All YAML frontmatter follows existing conventions.
- Shared file organization is clean and consistent.
- All shared/ file paths are correct.
- No content was lost in protocol block replacement.
- Persona registry follows appropriate patterns for a reference file.
- Migration tables are present and consistent across all 3 unified commands.
