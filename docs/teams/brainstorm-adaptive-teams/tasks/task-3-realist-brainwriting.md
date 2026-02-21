# Task 3: Realist Brainwriting
**Author:** Realist (Practical Thinker)
**Lens:** Implementation feasibility, migration paths, tech debt reduction, token economics

---

## 8-10 Practical Ideas for Agent-Teams Plugin Redesign

### Idea 1: Merge 8 Blueprints into 3 Universal Spawn Commands
Collapse the 8 spawn commands into 3: `spawn-build` (execution-focused), `spawn-think` (analysis/research), and `spawn-create` (generative/creative). Sub-types are declared with a flag or inline prompt, not separate files. The 8 blueprints become config presets internally referenced at spawn time.
**Feasibility:** Existing blueprints map cleanly — the main work is extracting shared scaffolding into a base template and parameterizing the differences. No new infrastructure needed.
**Effort:** M

---

### Idea 2: Shared Task Blocking Protocol Include
Extract the Task Blocking Protocol (currently duplicated verbatim in every spawn command) into a single `shared/task-blocking-protocol.md` file and use a `{{include}}` or `{{ref}}` directive. All 8 spawn files reference it by path. When the protocol changes, you update one file.
**Feasibility:** Claude Code already supports file references in system prompts. This is pure refactor — no behavioral change, immediate maintenance payoff.
**Effort:** S

---

### Idea 3: Complexity Classifier Pre-Spawn Hook
Add a pre-spawn hook that asks 2-3 targeted questions (not 3-10) and outputs a complexity score (low/medium/high). Low complexity routes to a solo agent with instructions; medium to a 2-person team; high to full team. The discovery interview is replaced by a structured classifier that enforces brevity.
**Feasibility:** The hook infrastructure already exists. The classifier logic is a short prompt template. The mapping table (complexity → team size) can be a config file.
**Effort:** S

---

### Idea 4: Token Budget Manifest per Team
Each team blueprint declares a `token_budget` block: estimated tokens per agent, max team size, output format constraints. The facilitator enforces this at spawn time and warns if the requested team would exceed budget. This makes token economics explicit and negotiable rather than invisible.
**Feasibility:** Token budgets are just metadata in plugin.json or a sidecar file. The enforcement is a pre-spawn check, not runtime monitoring. No new infrastructure needed beyond a simple comparison.
**Effort:** S

---

### Idea 5: Role Inheritance with Base + Extension Pattern
Define a `base-agent.md` with universal behaviors (task protocol, output standards, communication norms). Each specialist role file (`researcher.md`, `critic.md`) only contains the delta — its unique methodology and persona. Reduces per-file content by ~40%, eliminates drift when base behaviors change.
**Feasibility:** This is a standard inheritance pattern. The main work is identifying what's truly universal vs. role-specific and refactoring. Works with current file structure.
**Effort:** M

---

### Idea 6: Adaptive Team Size Based on Subtask Count
Instead of picking a team size at spawn, count the number of subtasks after discovery and auto-size the team. 1-3 subtasks = solo or pair; 4-6 = small team (3 roles); 7+ = full team. The user approves the proposed roster before spawn. Eliminates the "heavy team for a small task" problem structurally.
**Feasibility:** Subtask counting can happen in the discovery phase output. The mapping is a simple lookup. Roster proposal is already a pattern in some blueprints — generalize it.
**Effort:** M

---

### Idea 7: Output Verbosity Levels (Quiet / Normal / Verbose)
Add a `--verbosity` flag to spawn commands (or ask during discovery). Quiet = final deliverable only, no intermediate status. Normal = current behavior. Verbose = full reasoning chains and checkpoints. Most small tasks want Quiet. This directly addresses the "verbose output" pain point without changing the underlying workflow.
**Feasibility:** Verbosity is passed as a system prompt directive. Each agent checks its verbosity setting before producing output. Simple conditional in the agent template.
**Effort:** S

---

### Idea 8: Unified Discovery Template with Variable Question Count
Replace the 3-10 question discovery interviews with a single structured template: always ask 3 core questions (goal, constraints, success criteria) and 0-3 optional context questions based on domain. Reduces interview variance and user fatigue. The facilitator decides which optional questions apply based on the task type keyword.
**Feasibility:** The 3 core questions are already implied by every current interview. Extracting them and making the rest optional is a straightforward template refactor. Works immediately.
**Effort:** S

---

### Idea 9: Pipeline Artifact Schema Validation
The current pipeline system writes docs/teams/ artifacts as free-form markdown. Add a lightweight JSON schema (or YAML frontmatter standard) for handoff artifacts. Downstream agents validate the artifact before consuming it, surfacing schema mismatches as early failures rather than silent context drift.
**Feasibility:** JSON schema validation is trivial to add as a pre-task hook. The schema itself is small (5-8 required fields). Teams can migrate incrementally — new teams write schema-valid artifacts, old ones get a deprecation warning.
**Effort:** M

---

### Idea 10: Model Tier Auto-Selection by Task Phase
Map team phases to model tiers: discovery/planning phases use a lighter model (Haiku) for structured data extraction; execution phases use Sonnet; synthesis/review phases use Opus. The facilitator declares the phase in the task assignment, and agents use the assigned model tier. Token cost drops significantly for planning overhead.
**Feasibility:** Model selection per task is already possible in the Claude API. The phase-to-model mapping is a config table. The main work is tagging phases in spawn commands and wiring the selection logic.
**Effort:** M

---

## Summary Table

| # | Idea | Effort | Primary Benefit |
|---|------|--------|-----------------|
| 1 | Merge 8 blueprints into 3 universal commands | M | Reduces choice paralysis |
| 2 | Shared Task Blocking Protocol include | S | Eliminates duplication, easy maintenance |
| 3 | Complexity classifier pre-spawn hook | S | Right-sizes teams automatically |
| 4 | Token budget manifest per team | S | Makes token economics visible |
| 5 | Role inheritance base + extension pattern | M | Reduces per-file content ~40% |
| 6 | Adaptive team size from subtask count | M | Eliminates heavy-team-for-small-task |
| 7 | Output verbosity levels | S | Reduces verbose output noise |
| 8 | Unified discovery template (3 core + optional) | S | Reduces interview variance/fatigue |
| 9 | Pipeline artifact schema validation | M | Catches handoff drift early |
| 10 | Model tier auto-selection by phase | M | Reduces token cost for planning |
