---
team: feature-agent-teams-feedback-loop
date: 2026-02-22
owner: infra-specialist
tasks: [6, 7, 8, 9, 10, 13-fixes]
recs: [R1, R5, R5a, R6, R10]
---

# Infra Specialist Task Output

## Tasks Completed

### Task 6 — R1: Fix Calibration Session Counter
**File:** `plugins/agent-teams/shared/spec-quality-scoring.md`

Replaced static `## Calibration Mode` placeholder with dynamic counter logic:
- Globs `docs/retrospectives/*.md`
- Reads `spec-score:` frontmatter per file
- Counts files where value is present and NOT "not scored"
- Displays N in "Calibration session N/10" suffix
- Omits suffix when N >= 10
- Displays N=0 when directory missing/empty

Also appended R10 reference after last bullet per BLOCKING-1 sequencing requirement.

---

### Task 7 — R5: Retrospective Scan with Cold-Start Guard
**Files:** `spawn-core.md`, `spawn-build.md`, `spawn-think.md`, `spawn-create.md`

**spawn-core.md:** Appended full `### Retrospective Scan` section with 4-step process:
- Step 1: Identify evaluate-spawn and AAR files, filter by profile/type
- Step 2: Cold-start guard — skip if < 3 matched files, display `Prior run scan: insufficient data (N/3 sessions)`
- Step 3: Sort by date, take 3 most recent, extract Actionable Insights and plugin-scope AAR improvements
- Step 4: Surface as `Prior runs (N found)` or report no actionable content

**Command files:** Added Retrospective Scan reference to Project Analysis step with correct filters:
- spawn-build: `profile: build` / `type: feature|debug`
- spawn-think: `profile: think` / `type: research|planning|review`
- spawn-create: `profile: create` / `type: design|brainstorm|productivity`

---

### Task 8 — R5a: Lessons Applied Section in Spawn Templates
**Files:** `planning-blueprints.md`, `spawn-build.md`

**planning-blueprints.md:** Added `### Lessons Applied` after `### Project Analysis` in Planning Context Template. Positioned to allow R7's `### Expected Outcomes` to follow (section order: Project Analysis → Lessons Applied → Expected Outcomes).

**spawn-build.md:** Added `### Lessons Applied` after `### Acceptance Scenarios` in Feature Context block.

Both use standard placeholder format: "Prior run found: [improvement description]" with omit-if-empty instruction.

---

### Task 9 — R6: Inject Prior Run Insights into Context Block
**File:** `plugins/agent-teams/shared/discovery-interview.md`

Added `### Prior Run Insights` after `### Project Analysis` in Output Compilation template with:
- Hard limit: max 3 bullets, max 100 words
- Cold-start omit behavior: omit entirely if guard fired, no empty placeholder
- Source attribution: "Populated from Retrospective Scan (see spawn-core.md)"

---

### Task 10 — R10: `/calibrate-scoring` Command
**Files:** `commands/calibrate-scoring.md` (new), `shared/spec-quality-scoring.md`

**calibrate-scoring.md:** Created full command with 7-step process:
- Parse flags (`--min-samples N`, `--verbose`)
- Collect Build profile retrospectives (profile: build filter)
- Aggregate score accuracy (matched/too-optimistic/too-pessimistic/not-scored)
- Aggregate gate bypass data (graceful skip if R11 absent)
- Generate calibration summary with 5-condition decision tree
- How to Apply section with exact edit instructions
- Verbose per-file detail table

**spec-quality-scoring.md:** Appended reference after R1's last bullet (correct BLOCKING-1 sequencing).

---

### Task 13 Fixes — Stale Embedded Protocol Blocks + docs/memory.md

**Shutdown Protocol blocks updated in 4 files:**
- `spawn-build.md` (2 instances: feature mode + debug mode) — replaced 4-bullet with 6-bullet
- `spawn-think.md` (all templates via replace_all) — replaced 4-bullet with 6-bullet
- `spawn-create.md` (all templates via replace_all) — replaced 4-bullet with 6-bullet

All now match the authoritative 6-bullet Protocol Block from `shared/shutdown-protocol.md` (R2 + R4 bullets added).

**docs/memory.md updated:**
- Added `/calibrate-scoring` to Commands table (agent-teams section)
- Added `calibrate-scoring.md` to directory structure listing
