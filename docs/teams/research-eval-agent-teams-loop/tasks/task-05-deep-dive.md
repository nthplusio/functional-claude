---
task: 5
title: "Deep-dive on 4 priority gaps"
owner: explorer
team: research-eval-agent-teams-loop
date: 2026-02-22
---

# Deep-Dive: 4 Priority Gaps

## Gap 1 (Critical): Retrieval Gap — Retrospective Data Never Consumed

### Exact data flow (current)

```
spawn command → discovery interview → spec compiled → spawn
                                                        ↑
                                                    (no readback)

team completes → AAR written → docs/retrospectives/[name]-aar.md
             → evaluate-spawn → docs/retrospectives/[name].md
             → scenario notes → inside docs/teams/[name]/tasks/
```

**The break:** No spawn command reads `docs/retrospectives/` at any point. Project analysis steps scan `docs/decisions/` (ADRs) and `docs/mocks/` — but not retrospectives.

### What exists

- `docs/retrospectives/` directory with two file types:
  - `[team-name]-aar.md` — YAML frontmatter: team, date, type, team-size, tasks-completed, spec-score, fidelity. Body: 5-section AAR with improvement table (Issue | Impact | Fix | Scope).
  - `[team-name].md` — YAML frontmatter: team, date, profile, type, spec-score, scenario-coverage. Body: Coverage/Setup/Blind Spots + Actionable Insights.

- `shared/system-doc-protocol.md` — already implements the scan-and-inject pattern for `docs/decisions/`:
  ```
  Architecture decisions: Found [N] ADRs in docs/decisions/
  - [feature-slug-1]-adr.md (YYYY-MM-DD)
  ```
  This is the template to replicate.

### What's missing

**A. A scan step in discovery interview or spawn-core**

`shared/spawn-core.md` already has a "Project Analysis Additions" section that adds mock repository scanning. A parallel block for retrospective scanning could be added:

```markdown
### Retrospective Scan

Check for `docs/retrospectives/` in the project root. If found, read the 3 most recent
files matching the current spawn type (by `type:` frontmatter field).

Extract from each:
- `### Actionable Insights` from evaluate-spawn files
- `## 5. What Could Be Improved?` table rows with `Scope: plugin` from AAR files

Report in the team context:
Prior runs ([N] found): [1-2 bullet summary of recurring improvement themes]
```

**B. An injection point in the Context block**

`shared/discovery-interview.md` Output Compilation section defines the Context block structure. A `### Prior Run Insights` subsection needs to be added — after `### Project Analysis`, before `### Spec Quality`:

```markdown
### Prior Run Insights
[If docs/retrospectives/ found and relevant files exist]
- [Recurring theme 1 from Actionable Insights]
- [Recurring theme 2]
[If no relevant retrospectives: "No prior run data for this spawn type."]
```

**C. Aggregation logic**

The scan needs to:
1. Filter by `type:` frontmatter matching the current spawn type (feature, planning, research, etc.)
2. Deduplicate insights across files (same theme appearing in 3 retrospectives = higher signal)
3. Limit to 3 most recent files to avoid stale data dominating

### Files that need to change

| File | Change |
|------|--------|
| `shared/spawn-core.md` | Add "Retrospective Scan" section to Project Analysis Additions |
| `shared/discovery-interview.md` | Add `### Prior Run Insights` subsection to Output Compilation |
| `commands/spawn-build.md` | Project analysis step references retrospective scan |
| `commands/spawn-think.md` | Same |
| `commands/spawn-create.md` | Same |

### Dependencies and ordering

- Requires `docs/retrospectives/` to contain files with consistent frontmatter and section headers (already true)
- No new file format needed — scan reads existing evaluate-spawn and AAR files
- Can be implemented independently of all other gaps
- Should ship before scoring calibration (Gap 4) — calibration reads the same retrospective data

### Minimal viable implementation

Smallest version: add the scan to `shared/spawn-core.md` Project Analysis Additions only, surfacing up to 3 bullets from `### Actionable Insights` sections of matching retrospective files. No injection into the Context block. Just make the data visible to the lead so they can manually incorporate it.

Full version: inject `### Prior Run Insights` into the compiled Context block so teammates receive prior learnings at spawn time.

---

## Gap 2 (Critical): No Rework Path — Full Re-spawn Required for Partial Failures

### Exact data flow (current)

```
Team completes → Tester produces ### Scenario Notes
              → evaluate-spawn parses scenario coverage
              → result written to docs/retrospectives/
              → session ends

If output quality is low:
  User must manually re-spawn entire team
  No mechanism to retry specific tasks
  No mechanism to inject correction context
```

### What a "patch spawn" needs

A patch spawn is a targeted re-spawn that:
1. Reads the original team's artifacts from `docs/teams/[team-name]/`
2. Identifies which tasks produced insufficient output
3. Spawns a smaller team (1-2 teammates) to redo only those tasks
4. Writes corrected output back to the same artifact location

### What exists that enables this

- `docs/teams/[team-name]/tasks/` — all task outputs are persisted and addressable by path
- `docs/teams/[team-name]/README.md` — team metadata including pipeline context
- Task outputs have YAML frontmatter (`task:`, `owner:`, `team:`) enabling identification
- The `### Scenario Notes` table in Tester output already flags Invalidated scenarios by name

### What's missing

**A. A patch spawn command or flag**

Potential syntax: `/spawn-build --patch [team-name]`

This would:
1. Read `docs/teams/[team-name]/` to understand the original team structure
2. Read `docs/retrospectives/[team-name].md` or `[team-name]-aar.md` for known gaps
3. Ask the user: "Which tasks need to be redone? (list task numbers or 'all')"
4. Spawn a minimal team (1-2 agents) targeted at only those tasks
5. Write corrected outputs to the same task files (overwrite)

**B. Tester scenario invalidation → actionable task retry**

When `### Scenario Notes` contains "Invalidated" rows, the lead could automatically:
1. Identify which task(s) produced the code that failed the scenario
2. Create a targeted correction task assigned to the original implementer
3. Provide the invalidated scenario as explicit correction context

This requires:
- A mapping from "Invalidated scenario" → "implementation task(s)"
- The Tester task output to include this mapping

**C. Incremental correction within active team**

For teams still running (not shut down), a simpler mechanism:
- Lead receives `### Scenario Notes` from Tester
- Lead creates a new task: `[Backend] Fix scenario [N] — [scenario name] was Invalidated. Root cause: [Tester notes]. Rewrite [specific function]. Re-run scenario validation.`
- This is already possible with current task tools — it's just not prescribed in any protocol

### Files that need to change

| File | Change |
|------|--------|
| `shared/scenario-collection.md` | Add "Scenario Failure → Correction Task" protocol |
| `commands/spawn-build.md` | Add `--patch [team-name]` flag handling |
| `shared/aar-protocol.md` | Add "Correction Opportunities" section identifying specific retryable tasks |

### Simpler near-term fix (no new command)

Add a protocol block to `shared/shutdown-protocol.md` or `commands/spawn-build.md`:

```
**If Tester produces Invalidated scenarios:**
Before shutdown, the lead creates targeted correction tasks:
- Read ### Scenario Notes table
- For each Invalidated row: create task "[Owner] Fix [scenario-name] — [Tester's notes]"
- Block AAR/shutdown until correction tasks complete (or user explicitly accepts failures)
```

This turns the current "accept or full re-spawn" into a three-option decision:
1. Accept the failure
2. Fix inline (new targeted tasks within active team)
3. Full re-spawn (existing behavior)

### Dependencies

- No dependency on retrieval gap fix (Gap 1)
- Can ship independently
- The inline fix (Option 2 above) requires zero new infrastructure — just a protocol addition

---

## Gap 3 (High): Think/Create Outcome-Setting — No Equivalent of Scenarios

### The gap

Feature spawns (spawn-build) have a concrete outcome-setting mechanism: `docs/scenarios/[slug].md` files. These are written before spawning and validated by the Tester after. Non-feature spawns have no equivalent.

| Spawn type | Pre-spawn outcome artifact | Post-spawn validation |
|------------|---------------------------|----------------------|
| Feature | `docs/scenarios/[slug].md` (Given/When/Then) | Tester validates → `### Scenario Notes` |
| Research | None | None |
| Planning | None | None |
| Review | None | None |
| Design | None | None |
| Brainstorm | None | None |
| Productivity | None | None |

### What outcome-setting looks like for non-feature spawns

**Research (technology evaluation):**
Pre-spawn outcome: "The evaluation report must address [decision question] with a clear recommendation for [options under consideration]."
Validation: Critic checks if leading option survived scrutiny. Final recommendation includes confidence level.

Currently partial — `spawn-think.md` research mode has a Critic role and final recommendation task. The gap is that the *decision question* isn't frozen before spawning as an external artifact.

**Planning:**
Pre-spawn outcome: "The roadmap must include [N] phases. Phase 1 must be executable within [constraint]. Success is defined as [stakeholder outcome]."
Validation: Outcomes Analyst checks each phase brief against measurable success criteria.

The success criteria from discovery interview are already captured in the Context block. The gap is they're embedded in the spawn prompt (visible only to teammates) rather than in a separate file that survives session end.

**Design:**
Pre-spawn outcome: "The component must implement [N] user stories. All WCAG 2.1 AA criteria must pass."
Validation: User Advocate runs accessibility review post-implementation.

Design mode already has a User Advocate reviewing against acceptance criteria. The gap is that Product Owner's user stories (task 1-2) aren't written to a persistent file before implementation begins.

**Brainstorm:**
Pre-spawn outcome: "We expect [N] distinct idea clusters. Success is [criterion]."
Brainstorm outcome-setting is inherently fuzzy — the point is to generate, not validate against a spec.

**Productivity:**
Pre-spawn outcome: "The improvement must reduce [bottleneck] by [measurable target]."
Compounder's output includes a "progress check" and "friction log" — closest existing equivalent.

### Minimal viable addition

A `### Expected Outcomes` section in the Context block (analogous to `### Spec Quality` for feature spawns). For each spawn type:

| Spawn type | Expected Outcomes format |
|------------|-------------------------|
| Research | Decision question + options under consideration + minimum confidence level for recommendation |
| Planning | Phase count + feasibility constraint + stakeholder success definition |
| Review | Review focus areas + known risk areas + minimum severity threshold to report |
| Design | User story count + accessibility requirement level + design system constraints |
| Brainstorm | Problem space + what "done" looks like + explicit non-goals |
| Productivity | Bottleneck target + measurable success metric + cycle boundary |

### Files that need to change

| File | Change |
|------|--------|
| `shared/discovery-interview.md` | Add "Expected Outcomes" compilation step after refinement |
| `commands/spawn-think.md` | Add `### Expected Outcomes` to each mode's Context block |
| `commands/spawn-create.md` | Same |
| `skills/evaluate-spawn/SKILL.md` | Add outcome validation to Think/Create profiles |

### Dependencies

- Low dependency on other gaps
- Builds on existing discovery interview infrastructure
- Think profile in evaluate-spawn already asks "Did the team investigate the right questions?" — could be strengthened to check against `### Expected Outcomes`

---

## Gap 4 (High): Scoring Calibration — Static Thresholds, Broken Promise

### The broken promise

`shared/spec-quality-scoring.md` contains:
```
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

The problem: "track session count via the retrospective corpus" is never specified. No code or protocol reads `docs/retrospectives/` to count sessions or derive a threshold adjustment.

### What calibration actually requires

**Step 1: Count calibration sessions**

Read `docs/retrospectives/` and count files with `spec-score:` frontmatter (not "not scored"). This is mechanically simple — it's a glob + frontmatter parse.

Add to `shared/spawn-core.md` or `shared/spec-quality-scoring.md`:
```
Calibration session counter:
- Count files at docs/retrospectives/*.md with spec-score: not "not scored"
- Sessions 1-10: show calibration notice
- Sessions 11+: calibration complete, proceed normally
```

**Step 2: Derive threshold from retrospective data**

The deferred section in evaluate-spawn Build profile contains:
```
- [ ] Score accuracy — Did the spec quality score predict actual output quality? (matched / too optimistic / too pessimistic)
```

When this is filled in (manually), it creates a signal:
- "too optimistic" → threshold may be too low (high-scoring specs producing bad output)
- "too pessimistic" → threshold may be too high (gate firing when output was actually fine)

But: this is in the deferred section, which means it's never filled in during the session. It requires a separate review pass by the user.

**Step 3: A calibration review command or protocol**

Current state: no mechanism exists to trigger a calibration review. The user must manually read all retrospective files and manually edit `spec-quality-scoring.md`.

Needed: Either (a) a `/calibrate-scoring` command that reads retrospectives and summarizes score accuracy trends, or (b) a trigger in `evaluate-spawn` that, after N sessions, prompts: "You have [N] retrospectives. Run calibration review? It takes 2 minutes."

### What score accuracy data actually looks like

From the one existing evaluate-spawn retrospective (`plan-spec-discovery-scoring.md`):
- `spec-score: 4/6 dimensions`
- `scenario-coverage: N/A` (planning, not feature)
- Coverage: Yes (no blind spots)

This is a Think profile — no deferred "score accuracy" section. Only Build profiles have the score accuracy deferred item.

For calibration to work, we need Build profile retrospectives with deferred sections filled in. Currently zero exist.

### Minimal viable calibration fix

**Phase 1 (quick win):** Fix the calibration session counter. Read `docs/retrospectives/` count, display accurate calibration session number. Zero behavioral change — just makes the displayed count accurate.

**Phase 2 (medium effort):** Add "score accuracy" to the immediate (non-deferred) questions in Build profile evaluate-spawn. Currently it's deferred because it "cannot be evaluated at spawn completion" — but asking "what was the first thing you had to fix?" immediately after spawn IS answerable and provides the same signal.

Change in `skills/evaluate-spawn/SKILL.md`:
- Move "Score accuracy" from Deferred to Question 2 for Build profile
- Rephrase: "Did the spec quality score reflect the actual difficulty of this implementation? (Higher score → easier build?)"

**Phase 3 (structural fix):** Add a `/calibrate-scoring` command or `evaluate-spawn` summary trigger that aggregates score accuracy across all Build retrospectives and recommends threshold adjustment.

### Files that need to change

| File | Change |
|------|--------|
| `shared/spec-quality-scoring.md` | Add calibration session counter mechanism |
| `skills/evaluate-spawn/SKILL.md` | Move score accuracy from deferred to immediate question |
| (new) `commands/calibrate-scoring.md` | Optional: aggregation command |

### Dependencies

- Calibration session counter (Phase 1) is independent of all other gaps
- Score accuracy as immediate question (Phase 2) requires no other infrastructure
- `/calibrate-scoring` command (Phase 3) benefits from more retrospective data volume — should be later

---

## Cross-Gap Dependencies and Sequencing

```
Gap 1 (Retrieval) ──────────────────────────────────────────┐
  ↓ enables                                                  │
Gap 4 (Calibration) — reads same retrospective data          │
  ↓ enables                                                  │
Better threshold → fewer false positives → less bypass       │
                                                             │
Gap 3 (Outcomes) ────────────────────────────────────────────┤
  ↓ independent                                              │
Creates outcome artifacts → future retrieval can surface them │
                                                             │
Gap 2 (Rework) ──────────────────────────────────────────────┘
  ↓ independent
Reduces re-spawn cost → makes quality bar enforcement viable
```

### Recommended sequencing

**Quick wins (no structural change, low effort):**
1. Gap 4 Phase 1: Fix calibration session counter (add to spawn-core.md)
2. Gap 2 inline fix: Add scenario invalidation → correction task protocol to shutdown-protocol.md
3. Gap 4 Phase 2: Move score accuracy from deferred to immediate question in evaluate-spawn

**Medium effort (new subsections, no new files):**
4. Gap 1 Minimal: Add retrospective scan to spawn-core.md Project Analysis Additions
5. Gap 3 Minimal: Add `### Expected Outcomes` to discovery interview compilation

**Structural fixes (new files or commands):**
6. Gap 1 Full: Inject `### Prior Run Insights` into compiled Context block
7. Gap 2 Full: `--patch [team-name]` flag in spawn-build
8. Gap 4 Phase 3: `/calibrate-scoring` command

---

## File Change Summary

| File | Gaps Addressed | Effort |
|------|---------------|--------|
| `shared/spawn-core.md` | Gap 1 (retrospective scan), Gap 4 (session counter) | Low |
| `shared/discovery-interview.md` | Gap 1 (Prior Run Insights injection), Gap 3 (Expected Outcomes) | Low-Medium |
| `shared/shutdown-protocol.md` | Gap 2 (inline correction task protocol) | Low |
| `skills/evaluate-spawn/SKILL.md` | Gap 4 (score accuracy from deferred to immediate) | Low |
| `shared/spec-quality-scoring.md` | Gap 4 (calibration counter mechanism) | Low |
| `commands/spawn-think.md` | Gap 3 (Expected Outcomes per mode) | Medium |
| `commands/spawn-create.md` | Gap 3 (Expected Outcomes per mode) | Medium |
| `commands/spawn-build.md` | Gap 2 (--patch flag) | Medium |
| `shared/scenario-collection.md` | Gap 2 (Scenario Failure → Correction Task) | Medium |
| (new) `commands/calibrate-scoring.md` | Gap 4 Phase 3 | High |
