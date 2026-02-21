# Task 07: Implementation Details, Effort Estimates & Risk Assessment
**Author:** Realist (Practical Thinker)
**Scope:** Clusters A, B, C, D (Cluster E = aspirational only, no detailed implementation)
**Binding constraints:**
- No NLP classification
- 3 explicit commands (`spawn-build`, `spawn-think`, `spawn-create`), not single magic `/spawn`
- Token budget is PRIMARY

---

## Cluster A: Command & UX Consolidation

### A1: 3 Explicit Spawn Commands (spawn-build / spawn-think / spawn-create)

**Implementation approach:**
1. Create three new command files: `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`
2. Each command is a thin wrapper that sets the team intent and delegates to a shared `spawn-core.md` template
3. `spawn-core.md` contains: discovery questions, team sizing logic, roster proposal, spawn execution
4. The 8 existing blueprint files are refactored to become internal presets — referenced by the 3 commands, not exposed directly to users
5. Deprecation notice added to old commands with a migration hint (`/spawn-feature` → use `/spawn-build`)

**Dependencies:**
- Cluster B (DRY Architecture) should land first — `spawn-core.md` references the shared protocol include
- Existing blueprints must be catalogued and mapped to one of the 3 intent categories before refactor

**Effort:** M
- Core work is template extraction and 3 new command files
- Risk is in correctly categorizing the 8 blueprints (some overlap, e.g. spawn-review could be build or think)

**Stepping stone (S):** Ship the 3 new commands as thin wrappers over existing blueprints first. Users get the simplified UX immediately; blueprint consolidation follows in a second pass.

**Key risk:** Misclassifying blueprint intent. Mitigation: draft the mapping table and validate with a user before refactoring. The 3 categories are broad enough that most blueprints have an obvious home.

---

### A2: Adaptive Team Sizing from Subtask Count

**Implementation approach:**
1. After discovery, the facilitator agent lists discovered subtasks explicitly
2. A sizing rule is applied: 1-3 subtasks → solo or pair; 4-6 → small team (3 roles); 7+ → full team
3. The facilitator proposes a named roster ("I suggest: Researcher + Implementer + Reviewer") and waits for user approval
4. The sizing rule lives in `spawn-core.md` as a readable decision table, not hidden logic

**Dependencies:** A1 (spawn-core.md must exist)

**Effort:** S
- The subtask count and sizing table is declarative — just add it to the discovery section of spawn-core.md
- Roster proposal pattern already exists in some blueprints; generalize it

**Key risk:** Discovery may not always produce a clean subtask list. Mitigation: the facilitator asks "list the subtasks" as one of the 3 core discovery questions (see C1).

---

### A3: Output Verbosity Flag

**Implementation approach:**
1. Add `verbosity: quiet | normal | verbose` to the spawn command invocation (e.g. `/spawn-build --quiet`)
2. Default is `normal` (current behavior)
3. `quiet` suppresses all intermediate agent status messages; only final deliverable is surfaced
4. `verbose` adds reasoning chains and checkpoint summaries
5. Each agent template checks its assigned verbosity level via a system prompt directive: "Your verbosity is set to {verbosity}. In quiet mode, suppress all status updates and only output your final deliverable."

**Dependencies:** A1 (shared spawn-core.md is the right place to propagate verbosity to agents)

**Effort:** S
- Purely additive — no behavior changes to existing agents, just a conditional on output format
- `quiet` mode delivers immediate value for small tasks

**Key risk:** Agents ignoring the verbosity directive. Mitigation: make the quiet/verbose instruction prominent and early in the system prompt. Test with a small task.

---

## Cluster B: DRY Architecture

### B1: Shared Task Blocking Protocol Include

**Implementation approach:**
1. Create `plugins/agent-teams/shared/task-blocking-protocol.md` with the canonical protocol text
2. Replace all verbatim copies in spawn command files with a reference: `{{include ../shared/task-blocking-protocol.md}}`
3. If the plugin system doesn't support `{{include}}` directives natively, use a build step: a pre-commit hook that inlines the shared file and validates that no spawn command contains a stale copy
4. Add a lint check: grep for "Task Blocking Protocol" in spawn files and warn if the text is embedded rather than referenced

**Dependencies:** None — this is a pure refactor, standalone

**Effort:** S
- The protocol text already exists; this is purely extracting and replacing
- If `{{include}}` isn't natively supported, the lint approach (warn on embedded copies) still captures 80% of the maintenance benefit

**Stepping stone:** Even without include directives, just having a single canonical source file is valuable — contributors know where to edit.

**Key risk:** Include directive support. Mitigation: check plugin system docs first. If not supported, the lint hook approach is the fallback and takes the same effort.

---

### B2: Base Agent + Role Extension Pattern

**Implementation approach:**
1. Create `plugins/agent-teams/shared/base-agent.md` containing:
   - Task Blocking Protocol reference (from B1)
   - Universal output standards (markdown, concise, no emojis)
   - Communication norms (use SendMessage, not plain text)
   - Standard anti-patterns (no self-censoring during brainwriting, etc.)
2. Each specialist role file (`researcher.md`, `critic.md`, etc.) begins with `{{extends base-agent}}` and contains only role-specific methodology and persona
3. Estimated content reduction: ~40% per role file by eliminating repeated boilerplate

**Dependencies:** B1 (base-agent.md references the shared protocol include)

**Effort:** M
- Requires reading all 8+ role files, identifying universal vs role-specific content, and restructuring
- The restructuring itself is mechanical but requires care — no behavioral regressions

**Stepping stone (S):** Create `base-agent.md` and validate it covers the universal behaviors. Don't restructure role files yet — just have the base file available. Role file refactoring is the second pass.

**Key risk:** Behavioral drift if universal behaviors are extracted incorrectly. Mitigation: keep old role files as reference during migration; run a before/after comparison of effective system prompt content for one role before doing all 8.

---

### B3: Centralized Persona Library

**Implementation approach:**
1. All persona definitions live in `plugins/agent-teams/skills/team-personas/` (already partially exists based on current architecture)
2. Spawn commands reference personas by name, not by embedding persona text
3. The persona library has a standard frontmatter schema: `name`, `role`, `methodology`, `anti-patterns`, `output-contract`
4. Teams declare their roster as a list of persona names; the spawn system assembles the full agent prompts at runtime

**Dependencies:** B2 (base-agent.md defines the universal layer; personas define the delta)

**Effort:** M
- Persona files may already exist — audit what's there before building
- The main work is standardizing frontmatter and wiring the reference system

**Key risk:** Persona text that's context-specific (tuned for one team type) vs truly universal. Mitigation: start with personas that appear in 3+ blueprints — those are the safe universal ones.

---

## Cluster C: Smart Discovery & Routing

### C1: 3-Core Discovery Questions (No NLP)

**Implementation approach:**
1. Lock the discovery interview to exactly 3 required questions, always in this order:
   - "What is the goal?" (one sentence)
   - "What are the constraints?" (time, scope, tech stack, token budget)
   - "What does success look like?" (concrete, measurable)
2. Add 0-2 optional domain questions selected by the facilitator based on task type keyword detection (simple string match, not NLP): if task mentions "schema" or "migration" → add "What's your current data model?"; if "PR" or "review" → add "What's the review focus?"
3. The facilitator enforces a response length limit — one sentence per answer

**Dependencies:** A1 (lives in spawn-core.md)

**Effort:** S
- The 3 questions are already implicit in every current interview; this is formalization
- Keyword-to-optional-question mapping is a small lookup table

**Key risk:** 3 questions may be insufficient for genuinely complex tasks. Mitigation: the `verbose` mode (A3) can enable extended discovery for users who want it; `quiet` mode skips optional questions entirely.

---

### C2: Model Tier Auto-Selection by Phase

**Implementation approach:**
1. Define 3 model tiers in a config block in `spawn-core.md`:
   - `discovery`: Haiku (structured extraction, low creativity needed)
   - `execution`: Sonnet (main work, balanced cost/quality)
   - `synthesis`: Opus (review, judgment, final output quality)
2. Each task assignment includes a `phase` tag: `phase: discovery | execution | synthesis`
3. Agents read their phase tag and use the mapped model — declared in system prompt as: "You are operating in the {phase} phase. Use model tier: {tier}."
4. The token budget manifest (D1) declares the per-phase budget alongside the model tier

**Dependencies:** D1 (token budget manifest is the natural home for the tier config)

**Effort:** M
- Model selection per task is API-supported; the config table is small
- The phase tagging requires updating all task assignment templates in spawn-core.md

**Stepping stone (S):** Apply model tier selection to discovery phase only first (Haiku for all 3-question interviews). This alone cuts meaningful token cost with zero risk to execution quality.

**Key risk:** Phase boundaries are sometimes blurry (is "writing a plan" discovery or execution?). Mitigation: err toward Sonnet for ambiguous phases — Haiku only for clearly structured data extraction.

---

## Cluster D: Token Economics

### D1: Token Budget Manifest per Team

**Implementation approach:**
1. Add a `token_budget` YAML block to each spawn command (or spawn-core.md for defaults):
   ```yaml
   token_budget:
     default: standard        # tight | standard | generous
     per_agent_max: 8000      # tokens per agent turn
     team_max: 40000          # total session budget
     model_tiers:             # links to C2
       discovery: haiku
       execution: sonnet
       synthesis: opus
   ```
2. At spawn time, the facilitator reads the budget block and announces it to the team: "This session has a standard budget. Each agent turn should target under 8,000 tokens."
3. A `--budget tight` flag overrides the default: suppresses verbosity, selects lighter models, limits optional discovery questions

**Dependencies:** None — this is additive metadata. C2 can reference it once both exist.

**Effort:** S
- The manifest is pure metadata — no new infrastructure
- The `--budget` flag as a spawn param is a one-line addition to the command template

**Key risk:** Agents ignoring the budget directive. Mitigation: make the per-agent token target explicit in the system prompt (not just the facilitator briefing). Test with a verbose agent to verify compliance.

---

### D2: Pipeline Artifact Schema Validation

**Implementation approach:**
1. Define a minimal YAML frontmatter schema for all `docs/teams/` handoff artifacts:
   ```yaml
   ---
   task: string           # task ID or name
   author: string         # agent role
   status: draft | final
   depends_on: []         # upstream artifact IDs
   ---
   ```
2. Add a pre-task hook: before consuming an artifact, an agent validates that required frontmatter fields are present
3. On schema failure: the agent surfaces a clear error ("Artifact missing required field: status") rather than silently consuming malformed context
4. Migration: new artifacts write schema-valid frontmatter; old ones get a deprecation warning on first read

**Dependencies:** None — standalone, can ship independently

**Effort:** M
- Schema definition is trivial; the validation hook requires wiring into the pre-task flow
- Incremental migration means no big-bang refactor of existing artifacts

**Stepping stone (S):** Define the schema and add it to the artifact template as documentation only. Agents are instructed to write valid frontmatter. Hook validation comes in a second pass once the format is stable.

**Key risk:** Schema adds friction to fast-moving artifact authoring. Mitigation: keep the required fields minimal (4-5 max). Optional fields are encouraged but never validated.

---

## Recommended Implementation Order

Based on dependencies and effort:

| Priority | Item | Effort | Unlocks |
|----------|------|--------|---------|
| 1 | B1: Shared Protocol Include | S | B2, all spawn refactors |
| 2 | D1: Token Budget Manifest | S | C2, spawn-core.md design |
| 3 | A1 stepping stone: 3 commands as wrappers | S | User UX win immediately |
| 4 | C1: 3-Core Discovery Questions | S | A2 (subtask count) |
| 5 | A3: Verbosity Flag | S | Immediate small-task UX |
| 6 | B2 stepping stone: base-agent.md creation | S | B2 full refactor |
| 7 | A2: Adaptive Team Sizing | S | Cleaner team proposals |
| 8 | C2 stepping stone: Haiku for discovery only | S | Token savings |
| 9 | A1 full: Blueprint consolidation | M | Maintenance reduction |
| 10 | B2 full: Role file refactoring | M | Per-file content reduction |
| 11 | B3: Centralized Persona Library | M | Persona reuse across teams |
| 12 | C2 full: Phase-tagged model selection | M | Full token optimization |
| 13 | D2: Artifact Schema Validation | M | Pipeline reliability |

**Total S-effort items:** 8 (quick wins, ship first)
**Total M-effort items:** 5 (structural improvements, ship after quick wins validate direction)

---

## Key Risks Summary

| Risk | Mitigation |
|------|------------|
| Blueprint intent misclassification (A1) | Map all 8 blueprints before refactoring; validate mapping with user |
| Include directive not supported natively (B1) | Lint hook fallback captures 80% of maintenance benefit |
| Role file behavioral regression (B2) | Before/after system prompt comparison for one role before batch refactor |
| Phase boundary ambiguity (C2) | Default to Sonnet for ambiguous phases; Haiku only for structured extraction |
| Agents ignoring budget directives (D1) | Make token target explicit in each agent's system prompt, not just facilitator briefing |
| Artifact schema friction (D2) | Minimum viable schema: 4 required fields only |
