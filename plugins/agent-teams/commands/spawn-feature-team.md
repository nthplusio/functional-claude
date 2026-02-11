---
name: spawn-feature-team
description: Spawn a feature development agent team with frontend, backend, and testing teammates
argument-hint: <feature description>
---

# Spawn Feature Development Team

Create an agent team for parallel feature implementation across multiple layers.

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

## Team Configuration

If `$ARGUMENTS` is provided, use it as the feature description. If not, ask the user what feature they want to build.

Before spawning, quickly analyze the project to identify:
- The frontend directory structure (e.g., `src/components/`, `app/`, `pages/`)
- The backend directory structure (e.g., `src/api/`, `src/services/`, `routes/`)
- The test directory structure (e.g., `tests/`, `__tests__/`, `*.test.*`)
- Existing patterns in the codebase

**Spawn the following team (replacing placeholders with actual project paths):**

```
Create an agent team called "feature-[feature-slug]" to implement [FEATURE]. Spawn 3 teammates:

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

Enable delegate mode — focus on coordination, not implementation.

Create these tasks:
1. [Lead] Define API contracts and data flow for the feature
2. [Backend] Implement API endpoints and services (blocked by task 1)
3. [Frontend] Implement UI components and pages (blocked by task 1)
4. [Backend] Add input validation and error handling (blocked by task 2)
5. [Frontend] Implement data fetching and error states (blocked by tasks 2, 3)
6. [Tester] Write unit tests for backend services (blocked by task 4)
7. [Tester] Write unit tests for frontend components (blocked by task 5)
8. [Tester] Write integration tests for full flow (blocked by tasks 6, 7)

Important: Each teammate should only modify files in their designated directories
to avoid conflicts. Frontend and Backend must agree on API contracts early.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

## Output

After spawning, inform the user:
- The team has been created with 3 teammates (Frontend, Backend, Tester)
- Delegate mode keeps the lead focused on coordination
- Task dependencies ensure proper ordering (API contract → implementation → tests)
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
