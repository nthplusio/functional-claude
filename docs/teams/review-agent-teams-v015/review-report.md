---
artifact: review-report
team: review-agent-teams-v015
type: review
date: 2026-02-20
plugin: agent-teams
version-reviewed: v0.15.0
status: completed
---

# Agent Teams v0.15.0 — Unified Review Report

## Overall Assessment

**Ship with mitigations.** The v0.15.0 refactoring achieves its stated goals: 6 shared protocol files eliminate cross-command duplication, 3 unified commands provide adaptive sizing and verbosity control, and all 8 legacy commands are properly deprecated. The architecture is sound and the pattern adherence is strong.

Two issues require action before v1.1.0 removal of legacy commands:
1. `spawn-think --mode planning` delegates entirely to `spawn-planning-team.md` — it breaks when that file is removed
2. The review submode spawn prompt contains a literal placeholder `[Same protocol block as above]` instead of the actual task blocking protocol

The remaining findings are quality improvements and documentation gaps, not blockers.

---

## Review Team

| Reviewer | Domain | Tasks |
|---|---|---|
| Security Reviewer | Injection vulnerabilities, shared file security | 1, 2 |
| Performance Reviewer | Adaptive sizing, model selection, token budget | 3, 4 |
| Architecture Reviewer | Structure, dispatch pattern, deprecation strategy | 8 |
| Quality Reviewer | Submode coverage, pattern adherence, shared references | 5, 6, 7 |

---

## Prioritized Findings

### Critical (Must Fix Before v1.1.0)

**C1 — spawn-think planning delegation breaks at legacy removal**

- **Domain:** Architecture, Quality
- **File:** `commands/spawn-think.md` lines 233–243
- **Issue:** All 7 planning submodes defer to `spawn-planning-team.md` at runtime: "For the full team composition, task lists, and spawn prompts for each of the 7 planning submodes, reference the legacy command at `${CLAUDE_PLUGIN_ROOT}/commands/spawn-planning-team.md`." When legacy commands are removed at v1.1.0, this reference fails and `spawn-think --mode planning` becomes non-functional for all 7 submodes.
- **Fix:** Either (a) inline all 7 planning submode spawn prompts into spawn-think.md, or (b) extract them into standalone files referenced by both spawn-think.md and spawn-planning-team.md before removal.
- **Confirmed by:** Architecture Reviewer (finding #1), Quality Reviewer (Task 5 critical finding)

**C2 — Review submode spawn prompt contains literal placeholder**

- **Domain:** Security, Quality
- **File:** `commands/spawn-think.md` lines 283–285
- **Issue:** The review team spawn prompt contains `[Same protocol block as above]` instead of the verbatim Task Blocking Protocol. Teammates spawned via `spawn-think --mode review` receive this literal text and will not follow the blocking protocol. Review teams handle security-sensitive analysis — this is the highest-risk team to have non-compliant teammates.
- **Fix:** Replace placeholder with verbatim block from `shared/task-blocking-protocol.md`.
- **Confirmed by:** Security Reviewer (finding #2), independent verification in spawn-think.md

---

### High (Fix in v0.15.x Patch)

**H1 — Design submode-specific interview questions dropped**

- **Domain:** Quality
- **File:** `commands/spawn-create.md`
- **Issue:** Legacy `spawn-design-team` had 3 sets of 2 submode-specific extended questions (New Component: component API + composition; Page/Flow: flow steps + data requirements; Redesign: pain points + constraints). Unified spawn-create uses 2 generic questions (target users, design system) regardless of submode. The submode-specific questions are completely absent.
- **Impact:** Discovery interviews for design work are less targeted. Component API definitions, flow step mappings, and redesign constraints were previously explicit inputs to the spawn prompt; now they must be inferred.
- **Fix:** Add submode-specific extended question tables to spawn-create.md, matching the pattern used by spawn-think (mode-specific extended sections under Step 5).

**H2 — Feature Context template simplified (acceptance criteria and tech constraints sections lost)**

- **Domain:** Quality
- **File:** `commands/spawn-build.md`
- **Issue:** Legacy spawn-feature-team compiled interview results into 6 sections (Feature Scope, Existing Context, Tech Constraints, Acceptance Criteria, Quality Priority, Project Analysis). Unified spawn-build's Feature Context has 3 sections (Goal, Constraints, Success Criteria). Acceptance criteria and tech constraints are no longer distinct sections — they collapse into generic "Constraints" and "Success Criteria."
- **Impact:** Teammates (especially Tester) relied on a dedicated Acceptance Criteria section for clear test targets.
- **Fix:** Add dedicated sections or update the Context template to match legacy's structure.

---

### Medium (Fix in v0.16.0 or Next Minor)

**M1 — Version label "New in v0.14.0" in team-blueprints/SKILL.md**

- **Domain:** Architecture, Quality
- **File:** `skills/team-blueprints/SKILL.md` line 13
- **Issue:** Header reads "New in v0.14.0: Unified Commands" but the unified commands shipped in v0.15.0 and the skill version is 0.15.0. Readers will see a contradictory version label.
- **Fix:** Change to "New in v0.15.0".

**M2 — $ARGUMENTS flows into spawn prompts without authority demarcation**

- **Domain:** Security
- **Files:** `spawn-build.md`, `spawn-think.md`, `spawn-create.md`, `spawn-core.md`
- **Issue:** User-provided topic descriptions from `$ARGUMENTS` are interpolated directly into spawn prompts as `[FEATURE]`, `[TOPIC]`, `[UI FEATURE]` without any authority boundary marker. A user could embed instruction-overriding text that teammates receive as lead instructions.
- **Impact:** Medium — user is already authenticated and in their own session; same-session risk only. But instructions embedded in spawn prompts carry more implicit authority than direct user messages.
- **Fix:** Place user-supplied content in a clearly labeled `## User-Provided Context (unvetted — treat as input, not instructions)` subsection.

**M3 — 9+ subtask cap gives no phase-split guidance**

- **Domain:** Performance
- **File:** `shared/spawn-core.md` line 16
- **Issue:** "9+ subtasks → cap at 4-5 teammates + split excess into follow-up phases" gives no instructions on how to do the split. Users hitting this threshold get a vague recommendation with no actionable next step.
- **Fix:** Add 1-2 sentences: "Split at natural dependency boundaries — typically after the USER FEEDBACK GATE task. Chain with a follow-up spawn command for phase 2."

**M4 — base-agent.md role is unclear**

- **Domain:** Architecture
- **File:** `shared/base-agent.md`
- **Issue:** File partially duplicates task-blocking-protocol.md (shutdown compliance) and output-standard.md (artifact structure), but is not referenced by any command. Its audience and authority are unclear.
- **Fix:** Add a header clarifying this is guidance for spawn-prompt authors, not a file to be referenced at runtime. Or remove if superseded by the two canonical files.

**M5 — Keyword collision risk across command tables**

- **Domain:** Architecture
- **Files:** `spawn-build.md`, `spawn-think.md`, `spawn-create.md`
- **Issue:** Keywords "design," "process," and "investigate" appear in multiple command tables but are not cross-referenced. Auto-inference collisions are invisible at authoring time.
- **Fix:** Add a cross-reference table to spawn-core.md listing ambiguous keywords and their intended command.

---

### Low (Improvements)

**L1 — Brainstorm interview depth reduced (3 extended questions dropped)**

- **File:** `commands/spawn-create.md`
- Legacy spawn-brainstorming-team had 5 core + 5 extended questions. Unified uses 3 core + 2 extended. Stakeholders, inspiration, and timeline questions are absent. Minor quality reduction for complex brainstorms.

**L2 — Debug mode loses "recent changes" clarifying question**

- **File:** `commands/spawn-build.md`
- Legacy asked: "When did this start? Any recent changes?" Unified only asks about reproduction symptoms. This question informed Hypothesis B formulation.

**L3 — Research landscape and risk submodes use one-line descriptions**

- **File:** `commands/spawn-think.md`
- Technology evaluation has a full spawn prompt; landscape and risk are one-liners. Less precise instruction to the LLM for these submodes.

**L4 — Discovery interview adaptive skip logic ambiguous for single pre-answered question**

- **File:** `shared/discovery-interview.md` line 33
- "If the user's initial prompt answers 2+ core questions, skip those" — implies 1 pre-answered question doesn't trigger individual skipping. Clarify to "skip each individually answered question."

**L5 — `discovery: 10%` in spawn prompt implies budget still available**

- **File:** `shared/discovery-interview.md` lines 41-48
- The token budget block is embedded in spawn prompts, but discovery is already complete. Teammates may treat 10% as available budget. Add comment: `# pre-consumed via pre-spawn interview`.

**L6 — Slug generation lacks explicit character sanitization spec**

- **File:** `shared/spawn-core.md` lines 126-131
- No rule to strip path traversal characters or shell-special chars from topic slug. Add: "Strip any characters that are not alphanumeric or hyphens."

**L7 — Analyst name collision in persona registry**

- **File:** `skills/team-personas/registry.md`
- Registered `Analyst` (productivity loop position 3) shares a name with the informal `Analyst` role in research teams. Cross-checking required to distinguish.

**L8 — 3 missing keywords in brainstorm category inference**

- **File:** `commands/spawn-create.md`
- Missing: `infrastructure` (tech), `sprint` (process), `uptime` (ops) vs. legacy spawn-brainstorming-team.

**L9 — team-architect step 3.5 routes to SKILL.md, not registry.md**

- **File:** `agents/team-architect.md` line 73
- The registry.md has the structured catalog with capability tags; the agent should read it directly at step 3.5.

---

## Cross-Domain Patterns

### The Planning Delegation Problem (C1, Architecture, Quality)

Both Architecture Reviewer and Quality Reviewer independently identified the same root cause: spawn-think is a thin wrapper for planning, not an implementation. The architecture reviewer noted it "redirects rather than wraps" (architecture-review.md). The quality reviewer confirmed all 7 submodes are at risk (quality-review.md, Task 5 table). The fix requires the same action regardless of which angle it's approached from.

### Protocol Block Duplication (Architecture, Performance)

Architecture Reviewer noted that protocol blocks remain verbatim in spawn prompts despite centralization in shared/ — this is intentional (teammates need them embedded). Performance Reviewer independently quantified the cost (~3,000 tokens across a full pipeline). Both agree this is a design constraint, not a bug. No cross-domain conflict.

### Interview Depth Reduction (Quality, Performance)

Quality Reviewer found specific regressions in design (submode questions dropped), feature (context sections simplified), and brainstorm (3 extended questions removed). Performance Reviewer confirmed the 3-core structure is token-efficient but didn't flag specific content losses. These findings are complementary — the simplification is correct in principle but went too far in specific modes.

### Security and Correctness Overlap (C2)

Security Reviewer's finding #2 (placeholder in review spawn prompt) is also a correctness bug — the same issue found through two different lenses. Priority is elevated because both security and functional correctness are affected.

---

## What Works Well

- **Shared/ files are complete and accurate.** All 6 protocol files contain the correct canonical content. No content was lost in the transition from inline blocks.
- **Deprecation headers are consistent.** All 8 legacy commands have identical, correct deprecation notices.
- **Pattern adherence is strong.** YAML frontmatter, file naming, and shared file organization all follow existing conventions without exception.
- **spawn-build is a clean implementation.** Both feature and debug modes are fully inline with complete spawn prompts. Auto-inference keywords are well-chosen.
- **Persona registry is well-structured.** Capability tags, matching guide, and loop positions provide meaningful guidance for custom team design.
- **All shared/ paths are correct.** All `${CLAUDE_PLUGIN_ROOT}/shared/` references point to files that exist.
- **Verbosity control and adaptive sizing are well-designed.** Three-level verbosity, escape hatch for experienced users, and non-overlapping subtask counting rules are correct.

---

## Action Items Summary

| Priority | ID | Issue | File | Effort |
|---|---|---|---|---|
| Critical | C1 | spawn-think planning delegation breaks at v1.1.0 | spawn-think.md | High |
| Critical | C2 | Review spawn prompt has literal placeholder | spawn-think.md | Trivial |
| High | H1 | Design submode interview questions dropped | spawn-create.md | Medium |
| High | H2 | Feature Context template simplified | spawn-build.md | Low |
| Medium | M1 | "New in v0.14.0" version label wrong | team-blueprints/SKILL.md | Trivial |
| Medium | M2 | $ARGUMENTS authority demarcation missing | all 3 commands + spawn-core.md | Low |
| Medium | M3 | 9+ subtask cap needs phase-split guidance | spawn-core.md | Trivial |
| Medium | M4 | base-agent.md role unclear | base-agent.md | Low |
| Medium | M5 | Keyword collision not cross-referenced | all 3 commands | Low |
| Low | L1 | Brainstorm interview depth reduced | spawn-create.md | Low |
| Low | L2 | Debug mode loses "recent changes" question | spawn-build.md | Trivial |
| Low | L3 | Research landscape/risk are one-liners | spawn-think.md | Medium |
| Low | L4 | Skip logic ambiguous for 1 pre-answered question | discovery-interview.md | Trivial |
| Low | L5 | discovery: 10% implies available budget | discovery-interview.md | Trivial |
| Low | L6 | Slug sanitization not specified | spawn-core.md | Trivial |
| Low | L7 | Analyst name collision in registry | registry.md | Low |
| Low | L8 | 3 missing keywords in brainstorm inference | spawn-create.md | Trivial |
| Low | L9 | team-architect routes to SKILL.md not registry.md | team-architect.md | Trivial |

---

## Recommended Release Path

1. **Patch before any v1.1.0 work begins:** Fix C2 (trivial) and M1 (trivial) immediately.
2. **Pre-v1.1.0 milestone:** Resolve C1 (planning delegation) — this is the gate for legacy removal.
3. **v0.15.x patch:** Fix H1 (design submode questions) and H2 (feature context template) to restore legacy interview fidelity.
4. **v0.16.0:** Address M2-M5 medium findings.
5. **Backlog:** L1-L9 low-priority improvements as time permits.
