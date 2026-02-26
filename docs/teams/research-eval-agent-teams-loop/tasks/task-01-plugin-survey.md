---
task: 1
title: "Survey the entire agent-teams plugin surface area"
owner: explorer
team: research-eval-agent-teams-loop
date: 2026-02-22
---

# Plugin Survey: agent-teams v0.17.1

## Summary

The agent-teams plugin implements a 5-phase operational loop across 15 shared files, 4 commands, 6 skill directories, 8 personas, 1 agent, and 3 hooks. The loop is well-specified on paper but has a structural break: outputs from Phase 4 (AAR, evaluate-spawn) are written to disk but **never read back** by Phase 1-3 operations. Each spawn starts fresh with zero institutional memory from prior runs.

---

## Complete Component Inventory

### Commands (entry points)

| Command | File | Purpose |
|---------|------|---------|
| `/agent-teams` | `commands/agent-teams.md` | Plugin overview, routing, quickstart |
| `/spawn-build` | `commands/spawn-build.md` | Feature + debug team spawning |
| `/spawn-think` | `commands/spawn-think.md` | Research + planning + review spawning |
| `/spawn-create` | `commands/spawn-create.md` | Design + brainstorm + productivity spawning |

### Shared Files (15 total)

| File | Phase Role | Key Mechanism |
|------|-----------|---------------|
| `shared/prerequisites-check.md` | Pre-Phase 1 | Env var + arguments gate |
| `shared/discovery-interview.md` | Phase 1 | 3 core + 0-2 optional questions, adaptive skip, compiles Context block |
| `shared/spec-refinement.md` | Phase 1 | 2-4 edge-case follow-up questions derived from spec content |
| `shared/spec-quality-scoring.md` | Phase 1 | 6 binary pass/fail dimensions, gate at threshold 4 |
| `shared/scenario-collection.md` | Phase 1/2 | Given/When/Then scenarios frozen before spawn, validated by Tester |
| `shared/spawn-core.md` | Phase 2 | Adaptive sizing rules, model selection, verbosity control, team naming |
| `shared/planning-blueprints.md` | Phase 2/3 | 7 planning submode spawn prompts with task lists |
| `shared/base-agent.md` | Phase 3 | Universal teammate behaviors, artifact defaults, delegate mode |
| `shared/task-blocking-protocol.md` | Phase 3 | Dependency enforcement, compaction resilience, idle behavior |
| `shared/output-standard.md` | Phase 3 | Verbosity norms, artifact directory, 500-line limit |
| `shared/shutdown-protocol.md` | Phase 4 | Ordered shutdown: retrospective → shutdown_request → AAR → TeamDelete |
| `shared/aar-protocol.md` | Phase 5 | Military-format AAR, participant input, 4-question synthesis, issue creation |
| `shared/mock-repository.md` | Phase 3 | `docs/mocks/` convention, Tester integration |
| `shared/ai-code-review-checklist.md` | Phase 4 | 6 AI-specific failure modes for Quality Reviewer |
| `shared/system-doc-protocol.md` | Phase 5 | ADR template, planning team integration via `docs/decisions/` scan |

### Skills

| Skill | Purpose | Phase |
|-------|---------|-------|
| `skills/agent-teams/SKILL.md` | Overview, when-to-use, architecture | Reference |
| `skills/team-blueprints/SKILL.md` | 8 blueprint definitions, design patterns, pipeline map | Phase 2/3 |
| `skills/team-coordination/SKILL.md` | Task lifecycle, messaging, feedback gates, artifact protocol | Phase 3 |
| `skills/team-personas/SKILL.md` | 8 persona catalog, productivity loop, application guide | Phase 3 |
| `skills/after-action-review/SKILL.md` | AAR trigger routing → aar-protocol.md | Phase 4/5 |
| `skills/evaluate-spawn/SKILL.md` | Profile-based post-spawn evaluation, 3 profiles, rubric update process | Phase 5 |

### Agents

| Agent | Purpose | Tools |
|-------|---------|-------|
| `agents/team-architect.md` | Custom team design outside blueprints | Read, Glob, Grep, AskUserQuestion |

### Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `hooks/dedup-guard.js` | PreToolUse (TeamCreate, Task) | Prevent duplicate teams/teammates |
| `hooks/post-compact-recovery.js` | SessionStart (post-compaction) | Recovery guidance after context compaction |
| `hooks/stale-cleanup.js` | Plugin update | Remove stale files per manifest |

### Personas (8 reference files)

| Persona | Role | Methodology |
|---------|------|-------------|
| Auditor | Bottleneck discovery | Discovery → Scoring → 4-Week Plan (Automation Score formula) |
| Architect | Solution design | Problem Definition → Approach Map → Blueprint → Dependencies |
| Analyst | Multi-pass review | 4 passes: Architecture, Code Quality, Reliability, Performance |
| Refiner | Iterative improvement | Generate → Score → Diagnose → Rewrite → Re-score (convergence) |
| Compounder | Cycle synthesis | Progress Check → Friction Log → Next Target → Pattern Recognition |
| Facilitator | Brainstorm management | Setup → Brainwriting → Cluster → Convergence |
| Visionary | Divergent ideation | Brainwriting → Building |
| Realist | Practical grounding | Brainwriting → Building |

---

## 5-Phase Loop Mapping

### Phase 1: Gather Requirements

**Files involved:** `discovery-interview.md`, `spec-refinement.md`, `spec-quality-scoring.md`, `scenario-collection.md`

**Flow:**
1. Prerequisites check (env var + arguments)
2. Mode auto-inference from keywords
3. Discovery interview: 3 core questions + 0-2 optional, skip already-answered
4. Spec refinement: 2-4 edge-case questions derived from compiled context
5. Quality scoring: 6 binary dimensions, gate at 4/6 (configurable via `--min-score`)
6. Scenario collection (feature mode only): min 2 Given/When/Then scenarios, frozen to `docs/scenarios/[slug].md`

**Feedback loop status:** Score thresholds are static. No mechanism reads prior `docs/retrospectives/` to adjust questions or thresholds dynamically. Calibration note mentions "Phase 2 evaluate-spawn data" but the connection is never implemented — the rubric update process is explicitly manual.

### Phase 2: Set Expected Outcomes

**Files involved:** `spawn-core.md`, `planning-blueprints.md`, command files

**Flow:**
1. Adaptive sizing: subtask count → solo/pair/full team recommendation + user approval gate
2. Model selection: phase-based (Haiku for discovery, Sonnet for analysis, Opus for implementation)
3. Optional teammate selection
4. Project analysis: directory scan, mock repository scan, ADR scan
5. Spec quality score included in spawn prompt (`### Spec Quality` subsection)
6. Team name generation: `[command-prefix]-[mode-slug]-[topic-slug]`

**Feedback loop status:** No mechanism reads prior team runs to inform sizing, model choice, or team composition. The spec quality score is visible to teammates but not used to shape team structure decisions.

### Phase 3: Conduct Operations

**Files involved:** `base-agent.md`, `task-blocking-protocol.md`, `output-standard.md`, blueprint spawn prompts, persona reference files

**Flow:**
- Teammates receive spawn prompt with: Context block, Task Blocking Protocol, Output Standards, Shutdown Protocol
- Task dependency enforcement via `blockedBy` lists
- User feedback gates: mid-execution checkpoints where lead presents findings to user
- Artifact output: `docs/teams/[team-name]/tasks/` + primary deliverable
- Compaction resilience: task descriptions as durable state

**Feedback loop status:** Teammates start fresh each spawn with no awareness of prior team performance. No mechanism injects historical patterns (e.g., "previous runs of this team type found X issues") into spawn prompts.

### Phase 4: Review Output Quality

**Files involved:** `ai-code-review-checklist.md`, `scenario-collection.md` (Tester validation), shutdown protocol

**Flow:**
- Tester validates implementation against `docs/scenarios/[slug].md`, produces `### Scenario Notes`
- Quality Reviewer runs 6-item AI-specific checklist, produces `### AI Pattern Findings`
- Shutdown protocol: lead asks retrospective questions before sending shutdown_request
- evaluate-spawn: voluntary 2-question profile-based evaluation (soft prompt, not blocking)

**Feedback loop status:** Scenario validation produces a `### Scenario Notes` table. The evaluate-spawn skill parses this table for auto-derived scenario coverage. However, the coverage data is written to `docs/retrospectives/[team-name].md` and never read by subsequent spawns.

**Rework path gap:** Review output either passes or the session ends. No mechanism exists to re-trigger specific tasks for incremental correction without a full re-run.

### Phase 5: Capture and Feed Back Performance Improvements

**Files involved:** `aar-protocol.md`, `evaluate-spawn/SKILL.md`, `system-doc-protocol.md`

**Flow:**
- AAR: participant input → 4-question synthesis → `docs/retrospectives/[team-name]-aar.md`
- evaluate-spawn: 3 profiles (build/think/create), 2 explicit questions, deferred checkboxes
- Rubric update: **explicitly manual** — user reads retrospectives periodically and edits shared files
- ADR output: `docs/decisions/[feature-slug]-adr.md`, scanned by planning teams

**Feedback loop status:** This is the structural break.

- `docs/retrospectives/` grows per run but is never queried by Phase 1-3 operations
- `docs/decisions/` IS scanned by planning teams during project analysis — this works
- AAR improvement table has a `Scope` column (plugin vs project) that enables GitHub issue creation, but doesn't feed back into runtime behavior
- No spawn command reads historical retrospective data before spawning

---

## Key Structural Observations

### What works well

1. **Pre-spawn quality loop (Phases 1-2):** The discovery → refinement → scoring → scenario collection pipeline is well-integrated. Each step builds on the last. Quality score appears in spawn prompts.

2. **Artifact persistence:** `docs/teams/`, `docs/scenarios/`, `docs/decisions/`, `docs/retrospectives/` form a growing knowledge base. The pipeline pattern (team outputs feeding downstream teams) works for planning → feature → review chains.

3. **ADR integration (Phase 3→1 feedback):** `system-doc-protocol.md` explicitly instructs planning teams to scan `docs/decisions/` during project analysis. This is the one working feedback loop from historical runs.

4. **Task blocking protocol:** Compaction-resilient state via task descriptions. Dependency enforcement prevents wasted work.

5. **AAR participant-first principle:** Teammates speak before the lead synthesizes. This prevents lead projection bias and produces better improvement data.

### Structural gaps (retrieval break)

1. **AARs not consumed:** `docs/retrospectives/*-aar.md` files exist but no Phase 1-3 operation reads them. Each spawn is context-free with respect to prior process improvements.

2. **evaluate-spawn not consumed:** `docs/retrospectives/[team-name].md` files (evaluate-spawn output) accumulate but the "rubric update process" is explicitly a manual human step. No automatic surfacing occurs.

3. **No rework path:** Low-quality output triggers full re-run, not incremental correction. No mechanism exists to say "task 7 output was insufficient — retry with additional context."

4. **Calibration is static:** `spec-quality-scoring.md` mentions "calibration mode for first 10 sessions" with threshold adjustment "based on /evaluate-spawn data" — but the data connection is never implemented beyond the note.

5. **Scenario coverage not fed forward:** Tester `### Scenario Notes` data is parsed by evaluate-spawn but stays in retrospective files. No mechanism adjusts discovery interview questions based on recurring "Invalidated" patterns.

---

## Existing Retrospective Evidence

### plan-spec-discovery-scoring AAR (2026-02-21)

Key improvement items with plugin scope:
- Late task assignment messages cause reconciliation overhead → fix: `TaskUpdate` at spawn time
- Refinement folding conflict surfaced during validation, not at feedback gate → fix: "dependency grep" in risk task
- Inconsistent task output filenames → fix: filename convention in Output Standards

### plan-spec-discovery-scoring evaluate-spawn (2026-02-21)

Coverage: Yes — no blind spots identified. Design-validate-fix cycle cited as effective pattern for protocol specs. Discovery interview captured constraints well.

**Status:** These improvements are in the AAR at `docs/retrospectives/`. None have been applied to the plugin files (the late task assignment issue, filename convention, dependency grep step are not present in any shared files as of v0.17.1).

---

## Phase-to-File Matrix

| Phase | Shared Files | Commands | Skills | Hooks |
|-------|-------------|---------|--------|-------|
| 1: Requirements | discovery-interview, spec-refinement, spec-quality-scoring, scenario-collection | spawn-build, spawn-think, spawn-create | — | — |
| 2: Expected Outcomes | spawn-core, planning-blueprints | spawn-build, spawn-think, spawn-create | team-blueprints | — |
| 3: Operations | base-agent, task-blocking-protocol, output-standard, mock-repository | spawn-build, spawn-think, spawn-create | team-coordination, team-personas, team-blueprints | dedup-guard |
| 4: Review Quality | ai-code-review-checklist, scenario-collection (Tester), shutdown-protocol | spawn-build (soft prompt) | after-action-review, evaluate-spawn | — |
| 5: Feedback | aar-protocol, system-doc-protocol | — | after-action-review, evaluate-spawn | post-compact-recovery |

**The gap:** Phase 5 writes to disk. Phases 1-3 read project structure and `docs/decisions/` (ADRs only). They do not read `docs/retrospectives/`.
