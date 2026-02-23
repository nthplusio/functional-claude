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
- `--min-score N` (optional — override default spec quality threshold of 4 dimensions)
- `--skip-adr` (optional — suppress ADR generation in feature mode)
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

### Step 5: Spec Quality Scoring

Follow the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

- Evaluate the compiled Context section using pass/fail dimension questions
- Display the score as dimension count with breakdown before proceeding (e.g., `5/6 [Goal: ✓] ...`)
- If passing dimensions are below threshold, prompt user to refine or proceed
- Include the score in the spawn prompt's `### Spec Quality` subsection
- Parse `--min-score N` from `$ARGUMENTS` if present — accepts dimension count (strip before passing downstream)

### Step 6: Adaptive Sizing

Follow the adaptive sizing rules from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

- **Feature mode:** Count layers (frontend, backend, tests, infra, docs) as subtasks
- **Debug mode:** Always recommend 3 investigators (the adversarial structure is the mechanism)

### Step 7: Optional Teammates (Feature Mode Only)

Ask the user if they want optional teammates:

| Optional Teammate | Value Added | Best For |
|---|---|---|
| **DevOps** | Infrastructure setup — CI/CD changes, environment config, deployment | Features needing new infrastructure (databases, queues, external services) |
| **Documentation** | User-facing docs, API docs, changelog entries | Public-facing features, API changes |

### Step 8: Project Analysis

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

Also run the following scans from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`:
- Mock Repository Scan
- **Retrospective Scan** — use `profile: build` for evaluate-spawn files, `type: feature|debug` for AAR files

### Step 9: Spawn the Team

#### Feature Mode

Team name: `feature-[feature-slug]`

**Spawn the following team (replacing placeholders with actual content):**

```
Create an agent team called "feature-[feature-slug]" to implement [FEATURE].

The user is the architect. You are the implementer. Resolve ambiguity by asking, not by deciding. When the spec is unclear, surface the ambiguity to the user rather than making assumptions.

Spawn [3-5] teammates:

1. **Frontend** — Implement the UI layer: components, pages, and state management.
   Work in [FRONTEND_DIRS]. Follow existing component patterns in the codebase.
   Coordinate with Backend on API contracts before implementing data fetching.

2. **Backend** — Implement the API layer: endpoints, services, and data access.
   Work in [BACKEND_DIRS]. Define the API contract first and share it with Frontend
   before they start data fetching. Follow existing route patterns.

3. **Tester** — Write comprehensive tests for both layers. Start with unit tests
   for individual components and services, then integration tests for the full flow.
   Work in [TEST_DIRS]. Wait for Frontend and Backend to define interfaces before
   writing integration tests. Before creating any test fixtures, check `docs/mocks/`
   for existing mocks. Report found mocks in your task output. After creating new
   mocks, contribute them back to `docs/mocks/[domain]/` for future reuse.

[IF DEVOPS SELECTED]
4. **DevOps** — Set up infrastructure for the feature: database migrations, environment
   variables, CI/CD pipeline changes, deployment configuration. Work in [INFRA_DIRS].
   Complete infrastructure setup before Backend begins implementation.

[IF DOCUMENTATION SELECTED]
5. **Documentation** — Write user-facing documentation, API docs, and changelog entries.
   Work in [DOCS_DIRS]. Wait for implementation to stabilize before writing detailed docs.
   Unless `--skip-adr` was specified, also produce an Architecture Decision Record (ADR)
   at `docs/decisions/[feature-slug]-adr.md` following the template in
   `${CLAUDE_PLUGIN_ROOT}/shared/system-doc-protocol.md`. Use refinement phase output
   (edge cases, constraints) as ADR context. Include at least 1 rejected alternative.

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

### Acceptance Scenarios
[Behavioral scenarios from `docs/scenarios/[feature-slug].md` — user's pre-spawn definition of correct behavior. If scenarios were skipped, note "Scenarios not collected".]

### Lessons Applied
[If R5 retrospective scan returned plugin-scope improvements relevant to this feature spawn: 1–3 bullets from prior AAR improvement tables. Format: "Prior run found: [improvement description]." Omit this section entirely if R5 returned no data or R5 is not yet implemented.]

Create these tasks:
1. [Lead] Define API contracts and data flow for the feature
2. [Lead] USER FEEDBACK GATE — Present API contract to user. Ask user to: confirm the API design, adjust endpoints/schemas, flag missing behaviors, and approve before implementation begins
3. [Backend] Implement API endpoints and services (blocked by task 2)
4. [Frontend] Implement UI components and pages (blocked by task 2)
5. [Tester] Write unit tests for backend services — test against the API contract and acceptance criteria, NOT the implementation. Use contract schemas for expected inputs/outputs. (blocked by task 2)
6. [Tester] Write unit tests for frontend components — test against the API contract and component specs, NOT the implementation. (blocked by task 2)
7. [Backend] Add input validation and error handling (blocked by task 3)
8. [Frontend] Implement data fetching and error states (blocked by tasks 3, 4)
9. [Tester] Reconciliation — run all tests against the actual implementation. Fix test expectations that assumed wrong contract details. Report mismatches as bugs (implementation wrong) or spec gaps (contract underspecified). (blocked by tasks 5, 6, 7, 8)
10. [Tester] Write integration tests for full flow (blocked by task 9)
11. [Tester] Validate implementation against `docs/scenarios/[feature-slug].md` — for each scenario, verify behavior matches pre-spawn intent. Produce `### Scenario Notes` with Validated/Invalidated/Partial status per scenario. (blocked by task 10; skip if scenarios were not collected)
12. [Tester] Compile implementation summary — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `implementation-summary.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`. If Documentation teammate was not selected and `--skip-adr` was not specified, also produce an ADR at `docs/decisions/[feature-slug]-adr.md` following `${CLAUDE_PLUGIN_ROOT}/shared/system-doc-protocol.md`

Important: Each teammate should only modify files in their designated directories
to avoid conflicts. Frontend and Backend must agree on API contracts before implementation.
Tester writes tests against the contract, not the code — both sides target the same contract independently.

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
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

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

**Output format:** Root cause analysis + hypothesis investigation results + fix proposal
**Artifact files:** `docs/teams/[TEAM-NAME]/root-cause-analysis.md` (primary), `tasks/` (task outputs)
**Pipeline:** feeds from `/spawn-think --mode review`, `/spawn-build --mode feature` → feeds into `/spawn-build --mode feature` (fix)

### Step 10: Output

Follow the verbosity templates from `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md`.

The shutdown protocol ensures AAR runs before TeamDelete. If the team shut down before AAR completed, run `/after-action-review [team-name]` manually.

After team completion, include:
1. `Run /evaluate-spawn to capture quick feedback? (2 questions)`

This prompt does not block session end.

**Feature mode output:**
- The team has been created with [3-5] teammates (Frontend, Backend, Tester + optional)
- **Phase 1 (API Contract):** The lead defines the API contract and data flow
- **Phase 2 (Your Turn):** Review the API contract before implementation begins
- **Phase 3 (Implementation):** Frontend and Backend work in parallel
- **Phase 4 (Testing):** Tester writes unit and integration tests
- **Phase 5 (Summary):** Tester compiles an implementation summary
- Artifacts written to `docs/teams/[TEAM-NAME]/`

**Debug mode output:**
- The team has been created with 3 investigators pursuing confirmed hypotheses
- The adversarial structure ensures theories are challenged, not just confirmed
- Root cause confirmation before fix proposal
- Artifacts written to `docs/teams/[TEAM-NAME]/`
