---
name: spawn-build
description: "Unified build command — spawn a feature development or debugging team with adaptive sizing, discovery interview, and verbosity control"
argument-hint: "[--mode feature|debug] [--quiet|--verbose] <description>"
---

# Spawn Build Team

Unified entry point for **building and fixing** code. Auto-infers the right mode from your description, runs a streamlined discovery interview, applies adaptive sizing, and spawns a self-contained team.

## Modes

| Mode | When to Use | Team Composition |
|---|---|---|
| **feature** | Building something new — features, endpoints, components | Frontend, Backend, Tester + optional DevOps, Documentation |
| **debug** | Fixing something broken — bugs, regressions, incidents | 3 hypothesis investigators |

## Process

### Step 1: Prerequisites

Follow the prerequisites check from `${CLAUDE_PLUGIN_ROOT}/shared/prerequisites-check.md`.
- Input-type: "feature description or bug description"

### Step 2: Parse Flags

Extract from `$ARGUMENTS`:
- `--mode feature` or `--mode debug` (optional — auto-infer if absent)
- `--quiet`, `--normal`, or `--verbose` (optional — default `--normal`)
- Strip flags from `$ARGUMENTS` before proceeding

### Step 3: Mode Selection

**Auto-inference keywords:**

| Keywords | Mode |
|---|---|
| build, implement, add, create, feature, endpoint, component, page, new | **feature** |
| fix, bug, broken, error, crash, regression, investigate, debug, failing, incident | **debug** |

If keywords match, confirm the mode:
```
Your description suggests [MODE] mode. Proceeding — say "actually [OTHER]" to switch.
```

If no match, ask:
```
Are you building something new (feature) or fixing something broken (debug)?
```

### Step 4: Discovery Interview

Follow the discovery interview from `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md`.

**Mode-specific extended questions:**

#### Feature Mode (ask up to 2)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Existing context** — "What related code already exists? Any prior work, specs, or design docs?" | When keywords: existing, prior, migrate, refactor |
| 5 | **Quality bar** — "What matters most — correctness, performance, UX polish, or shipping speed?" | When keywords: quality, polish, fast, performance |

#### Debug Mode (ask up to 1)

| # | Question | When to Ask |
|---|----------|-------------|
| 4 | **Reproduction** — "Can you describe the exact symptoms — what you expected vs what happened?" | When the bug description is vague (< 20 words) |

### Step 5: Adaptive Sizing

Follow the adaptive sizing rules from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

- **Feature mode:** Count layers (frontend, backend, tests, infra, docs) as subtasks
- **Debug mode:** Always recommend 3 investigators (the adversarial structure is the mechanism)

### Step 6: Optional Teammates (Feature Mode Only)

Ask the user if they want optional teammates:

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **DevOps** | Infrastructure setup — CI/CD changes, environment config, deployment | Features needing new infrastructure (databases, queues, external services) |
| **Documentation** | User-facing docs, API docs, changelog entries | Public-facing features, API changes |

### Step 7: Project Analysis

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

### Step 8: Spawn the Team

#### Feature Mode

Team name: `feature-[feature-slug]`

**Spawn the following team (replacing placeholders with actual content):**

```
Create an agent team called "feature-[feature-slug]" to implement [FEATURE]. Spawn [3-5] teammates:

1. **Frontend** — Implement the UI layer: components, pages, and state management.
   Work in [FRONTEND_DIRS]. Follow existing component patterns in the codebase.
   Coordinate with Backend on API contracts before implementing data fetching.

2. **Backend** — Implement the API layer: endpoints, services, and data access.
   Work in [BACKEND_DIRS]. Define the API contract first and share it with Frontend
   before they start data fetching. Follow existing route patterns.

3. **Tester** — Write comprehensive tests for both layers. Start with unit tests
   for individual components and services, then integration tests for the full flow.
   Work in [TEST_DIRS]. Wait for Frontend and Backend to define interfaces before
   writing integration tests.

[IF DEVOPS SELECTED]
4. **DevOps** — Set up infrastructure for the feature: database migrations, environment
   variables, CI/CD pipeline changes, deployment configuration. Work in [INFRA_DIRS].
   Complete infrastructure setup before Backend begins implementation.

[IF DOCUMENTATION SELECTED]
5. **Documentation** — Write user-facing documentation, API docs, and changelog entries.
   Work in [DOCS_DIRS]. Wait for implementation to stabilize before writing detailed docs.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Feature Context

### Goal
[What the feature does, user-facing behaviors]

### Tech Constraints
[Libraries, patterns, architectural constraints to follow]

### Product Constraints
[Non-negotiables — budget, timeline, scope boundaries]

### Acceptance Criteria
[Must-have behaviors, definition of done]

### Existing Context
[Related code, prior work, specs, design docs, project analysis findings]

### Quality Priority
[Correctness vs performance vs UX polish vs shipping speed]

Create these tasks:
1. [Lead] Define API contracts and data flow for the feature
2. [Lead] USER FEEDBACK GATE — Present API contract to user. Ask user to: confirm the API design, adjust endpoints/schemas, flag missing behaviors, and approve before implementation begins
3. [Backend] Implement API endpoints and services (blocked by task 2)
4. [Frontend] Implement UI components and pages (blocked by task 2)
5. [Backend] Add input validation and error handling (blocked by task 3)
6. [Frontend] Implement data fetching and error states (blocked by tasks 3, 4)
7. [Tester] Write unit tests for backend services (blocked by task 5)
8. [Tester] Write unit tests for frontend components (blocked by task 6)
9. [Tester] Write integration tests for full flow (blocked by tasks 7, 8)
10. [Backend] Compile implementation summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `implementation-summary.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`

Important: Each teammate should only modify files in their designated directories
to avoid conflicts. Frontend and Backend must agree on API contracts before implementation.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Never restate the Feature Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Output format:** Implemented feature + API contract document + test report
**Artifact files:** `docs/teams/[TEAM-NAME]/implementation-summary.md` (primary), `tasks/` (task outputs)
**Pipeline:** feeds from `/spawn-think --mode planning`, `/spawn-create --mode design` → feeds into `/spawn-think --mode review`

#### Debug Mode

Team name: `debug-[bug-slug]`

Before spawning, formulate 3 distinct hypotheses based on the bug description and codebase analysis. Present to user for confirmation before spawning.

**Hypothesis Confirmation Gate:**
```
Based on the bug description, here are 3 hypotheses I'd assign to investigators:

1. **[Hypothesis-A-Name]**: [CONCRETE THEORY 1 — what could cause these symptoms]
2. **[Hypothesis-B-Name]**: [CONCRETE THEORY 2 — alternative explanation]
3. **[Hypothesis-C-Name]**: [CONCRETE THEORY 3 — less obvious possibility]

Does this cover the right ground? Should I adjust any hypothesis?
```

**Spawn the following team (replacing placeholders with concrete hypotheses):**

```
Create an agent team called "debug-[bug-slug]" to investigate: [BUG DESCRIPTION].

Spawn 3 investigator teammates, each pursuing a different hypothesis:

1. **[Hypothesis-A-Name]** — Investigate whether [CONCRETE THEORY 1 based on symptoms].
   Look at [RELEVANT FILES/MODULES]. Try to reproduce the issue through this code path.
   If you find evidence supporting OR contradicting this theory, share it with the other
   investigators immediately.

2. **[Hypothesis-B-Name]** — Investigate whether [CONCRETE THEORY 2 based on recent changes].
   Check [RELEVANT FILES/MODULES]. Look for recent changes that could have introduced this
   behavior. Share findings with other investigators.

3. **[Hypothesis-C-Name]** — Investigate whether [CONCRETE THEORY 3 - less obvious cause].
   Look at [EDGE CASES, EXTERNAL DEPS, CONFIG]. Your job is also to challenge the other
   investigators' conclusions — if they find something, try to disprove it.

Create these tasks:
1. [All] Read error logs and reproduce the issue
2. [[Hypothesis-A]] Trace code path for [theory 1]
3. [[Hypothesis-B]] Check recent changes related to [theory 2]
4. [[Hypothesis-C]] Examine edge cases for [theory 3]
5. [All] Share findings and challenge each other's theories
6. [Lead] Identify root cause from surviving theory
7. [Lead] ROOT CAUSE CONFIRMATION — Present the identified root cause and supporting evidence to user. Ask user to: confirm the root cause makes sense, provide additional context, and approve before proposing a fix (blocked by task 6)
8. [Lead] Propose fix based on confirmed root cause (blocked by task 7) — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `root-cause-analysis.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`

Have investigators actively debate. When one finds evidence, others should try to
disprove it. The theory that survives scrutiny is most likely correct.
Require plan approval before implementing any fix.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically)
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
- When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints -- do NOT include approaches, options, or paths the user explicitly rejected
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

**Output Standards -- ALL teammates MUST follow:**
- Be concise and direct. Use bullet points, tables, and short paragraphs — not essays
- Lead with conclusions, then supporting evidence — not the other way around
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Output format:** Root cause analysis + hypothesis investigation results + fix proposal
**Artifact files:** `docs/teams/[TEAM-NAME]/root-cause-analysis.md` (primary), `tasks/` (task outputs)
**Pipeline:** feeds from `/spawn-think --mode review`, `/spawn-build --mode feature` → feeds into `/spawn-build --mode feature` (fix)

### Step 9: Output

Follow the verbosity templates from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

**Feature mode output:**
- The team has been created with [3-5] teammates (Frontend, Backend, Tester + optional)
- **Phase 1 (API Contract):** The lead defines the API contract and data flow
- **Phase 2 (Your Turn):** Review the API contract before implementation begins
- **Phase 3 (Implementation):** Frontend and Backend work in parallel
- **Phase 4 (Testing):** Tester writes unit and integration tests
- **Phase 5 (Summary):** Lead compiles an implementation summary
- Artifacts written to `docs/teams/[TEAM-NAME]/`

**Debug mode output:**
- The team has been created with 3 investigators pursuing confirmed hypotheses
- The adversarial structure ensures theories are challenged, not just confirmed
- Root cause confirmation before fix proposal
- Artifacts written to `docs/teams/[TEAM-NAME]/`

## Migration

| Legacy Command | Equivalent |
|---|---|
| `/spawn-feature-team <feature>` | `/spawn-build --mode feature <feature>` |
| `/spawn-debug-team <bug>` | `/spawn-build --mode debug <bug>` |

Legacy commands remain functional with deprecation notice. Use the unified command for adaptive sizing, verbosity control, and streamlined discovery.
