# Task 03: Practical Ideas — Realist Brainwriting
**Author:** Realist (Practical Thinker)
**Lens:** Implementation feasibility, migration paths, tech debt reduction, token economics

---

## Ideas

**[MERGE-3]** Collapse 8 blueprints into 3 universal spawn commands (`spawn-build`, `spawn-think`, `spawn-create`) with sub-types as flags, not separate files. `Effort: M`

**[SHARED-PROTOCOL]** Extract the Task Blocking Protocol (duplicated verbatim in every spawn command) into a single `shared/task-blocking-protocol.md` reference — update once, applies everywhere. `Effort: S`

**[COMPLEXITY-CLASSIFIER]** Replace 3-10 question discovery interviews with a 2-question pre-spawn classifier that outputs low/medium/high complexity and auto-routes to solo, pair, or full team. `Effort: S`

**[TOKEN-MANIFEST]** Add a `token_budget` block to each team blueprint declaring estimated cost per agent and max team size — makes token economics explicit and enforceable at spawn time. `Effort: S`

**[ROLE-INHERITANCE]** Define a `base-agent.md` with universal behaviors and have specialist role files contain only their unique delta, cutting per-file content ~40% and eliminating behavioral drift. `Effort: M`

**[ADAPTIVE-SIZING]** After discovery, count subtasks and auto-size the team: 1-3 subtasks = solo/pair, 4-6 = small team, 7+ = full team — user approves the proposed roster before spawn. `Effort: M`

**[VERBOSITY-FLAG]** Add a `--verbosity` flag (quiet/normal/verbose) to spawn commands so small tasks can suppress intermediate status and only surface the final deliverable. `Effort: S`

**[DISCOVERY-3CORE]** Lock discovery to exactly 3 required questions (goal, constraints, success criteria) plus 0-2 optional domain questions chosen by the facilitator — no more open-ended 10-question interviews. `Effort: S`

**[ARTIFACT-SCHEMA]** Enforce a lightweight YAML frontmatter schema on pipeline handoff artifacts so downstream agents validate input before consuming it, catching context drift as early failures. `Effort: M`

**[MODEL-TIERS]** Map team phases to model tiers — Haiku for discovery/planning, Sonnet for execution, Opus for synthesis/review — declared in the task assignment, not hardcoded per blueprint. `Effort: M`
