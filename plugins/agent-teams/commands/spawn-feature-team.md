---
name: spawn-feature-team
description: Spawn a feature development agent team with frontend, backend, and testing teammates — includes discovery interview, user feedback gate after API contract, and optional teammates
argument-hint: <feature description>
---

# Spawn Feature Development Team

Create an agent team for parallel feature implementation across multiple layers, with a discovery interview for rich shared context, a user feedback gate after API contract definition (the most expensive decision point), and optional teammates for infrastructure and documentation needs.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a feature description via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Discovery Interview

Before spawning the team, conduct a structured interview to deeply understand the feature. The interview results become shared context for all teammates — this ensures aligned implementation rather than teammates guessing at requirements.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Core Questions (ask up to 5)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Feature scope** — "What exactly should this feature do? What are the user-facing behaviors?" | Defines what gets built — prevents scope creep and gold-plating |
| 2 | **Existing context** — "What related code already exists? Any prior work, specs, or design docs?" | Prevents reinventing existing patterns; surfaces integration points |
| 3 | **Tech constraints** — "Are there specific libraries, patterns, or architectural constraints to follow?" | Ensures implementation fits the codebase conventions |
| 4 | **Acceptance criteria** — "How will you know this feature is done? What are the must-have behaviors?" | Gives the Tester clear targets and gives the lead clear completion criteria |
| 5 | **Quality bar priority** — "What matters most for this feature — correctness, performance, UX polish, or shipping speed?" | Shapes trade-off decisions during implementation |

Present questions in batches of 3-5 using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 2: Optional Teammates

Ask the user if they want to include optional teammates:

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **DevOps** | Infrastructure setup — CI/CD changes, environment config, deployment considerations | Features that need new infrastructure (databases, queues, external services) |
| **Documentation** | User-facing documentation, API docs, changelog entries | Public-facing features, API changes, features requiring user education |

## Step 3: Project Analysis

Before spawning, quickly analyze the project to identify:
- The frontend directory structure (e.g., `src/components/`, `app/`, `pages/`)
- The backend directory structure (e.g., `src/api/`, `src/services/`, `routes/`)
- The test directory structure (e.g., `tests/`, `__tests__/`, `*.test.*`)
- Existing patterns in the codebase (routing, state management, data access)
- Any existing code related to the feature

Include findings in the Feature Context section of the spawn prompt.

**Pipeline context:** Feeds from `/spawn-planning-team` (phase briefs), `/spawn-design-team` (component specs), `/spawn-research-team` (technology decisions); feeds into `/spawn-review-team` (code review of implementation)

## Step 4: Spawn the Team

Compile the interview results into a `## Feature Context` section and spawn the team. Replace all placeholders with actual content from the interview and project analysis.

**Spawn the following team (replacing placeholders with actual project paths):**

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

Enable delegate mode — focus on coordination, not implementation.

## Feature Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Feature Scope
[What the feature does, user-facing behaviors]

### Existing Context
[Related code, prior work, specs, design docs]

### Tech Constraints
[Libraries, patterns, architectural constraints]

### Acceptance Criteria
[Must-have behaviors, definition of done]

### Quality Priority
[Correctness vs performance vs UX polish vs speed]

### Project Analysis
[Frontend/backend/test directory structure, existing patterns, related code]

Create these tasks:
1. [Lead] Define API contracts and data flow for the feature
2. [Lead] USER FEEDBACK GATE — Present API contract to user. Ask user to: confirm the API design, adjust endpoints/schemas, flag missing behaviors, and approve before implementation begins (this is the most expensive decision point — changing contracts after implementation is costly)
3. [Backend] Implement API endpoints and services (blocked by task 2)
4. [Frontend] Implement UI components and pages (blocked by task 2)
5. [Backend] Add input validation and error handling (blocked by task 3)
6. [Frontend] Implement data fetching and error states (blocked by tasks 3, 4)
7. [Tester] Write unit tests for backend services (blocked by task 5)
8. [Tester] Write unit tests for frontend components (blocked by task 6)
9. [Tester] Write integration tests for full flow (blocked by tasks 7, 8)
10. [Lead] Compile implementation summary — what was built, API contract, test coverage, and any deviations from plan

Important: Each teammate should only modify files in their designated directories
to avoid conflicts. Frontend and Backend must agree on API contracts before implementation.
The user feedback gate after task 1 prevents expensive rework — API contracts are the
foundation everything else builds on.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format:** Implemented feature + API contract document + test report → feeds into `/spawn-review-team`

## Output

After spawning, inform the user:
- The team has been created with [3-5] teammates (Frontend, Backend, Tester + optional)
- **Phase 1 (API Contract):** The lead defines the API contract and data flow
- **Phase 2 (Your Turn):** You'll review the API contract before implementation begins — this is the user feedback gate at the most expensive decision point
- **Phase 3 (Implementation):** Frontend and Backend work in parallel based on the approved contract
- **Phase 4 (Testing):** Tester writes unit and integration tests
- **Phase 5 (Summary):** Lead compiles an implementation summary
- Delegate mode keeps the lead focused on coordination
- Task dependencies ensure proper ordering (contract → approval → implementation → tests)
- The implementation summary feeds into `/spawn-review-team` for code review
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
