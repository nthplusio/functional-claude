---
name: spawn-review-team
description: Spawn a code review agent team with 3 modes — Security-focused, Performance-focused, Balanced — including brief interview, optional teammates, and pipeline context
argument-hint: <PR number, branch name, or module to review>
---

# Spawn Code Review & QA Team

Create an agent team for parallel code review with specialized reviewers, adaptive focus modes, a brief interview for review context, and optional teammates for frontend-heavy or structurally significant changes.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a review target via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Mode Selection

Present the mode table and ask the user which review focus fits their need. If the mode is obvious from `$ARGUMENTS` or context, confirm it rather than asking. Default to **Balanced** when unclear.

| # | Mode | When to Use | Effect |
|---|------|-------------|--------|
| 1 | **Security-focused** | Auth changes, data handling, external integrations, user input | Security Reviewer leads; gets extra tasks for threat modeling |
| 2 | **Performance-focused** | Database changes, high-traffic paths, large data processing | Performance Reviewer leads; gets extra tasks for profiling |
| 3 | **Balanced** (default) | General code changes, feature implementations, refactors | All reviewers equal; standard task distribution |

**Auto-inference keywords:**
- Auth, authentication, authorization, input validation, encryption, secrets, CSRF, XSS → **Security-focused**
- Database, query, N+1, cache, latency, throughput, memory, bundle size → **Performance-focused**
- Feature, refactor, review, PR, changes → **Balanced**

## Step 2: Brief Interview

Before spawning, ask 3 focused questions to give reviewers context about what changed and why. This prevents reviewers from spending time understanding intent that the author already knows.

**Adapt based on `$ARGUMENTS`** — skip questions already answered.

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Review focus** — "What should the reviewers pay the most attention to? Any specific concerns?" | Directs reviewer attention to the author's uncertainty areas |
| 2 | **Change context** — "What does this change do and why? What's the intent behind these changes?" | Prevents reviewers from misinterpreting intent |
| 3 | **Known risk areas** — "Are there parts of this change you're less confident about? Any areas that feel fragile?" | Gives reviewers explicit targets for deeper scrutiny |

## Step 3: Optional Teammates

Ask the user if they want to include optional teammates:

| Optional Teammate | Value Added | Best For |
|-------------------|------------|----------|
| **Accessibility Reviewer** | WCAG compliance, keyboard navigation, screen reader support, ARIA, color contrast | Frontend PRs with UI changes — forms, navigation, interactive components |
| **Architecture Reviewer** | Structural analysis, design pattern adherence, dependency management, abstraction quality | Large structural PRs — new modules, API redesigns, framework migrations |

## Step 4: Parse Review Target

Parse `$ARGUMENTS` to determine the review target:
- **PR number** (e.g., `#142`, `142`) → review that PR's changes
- **Branch name** (e.g., `feat/auth`) → review diff from main
- **Module path** (e.g., `src/auth/`) → review that module

**Pipeline context:** Feeds from `/spawn-feature-team` (review implemented feature), `/spawn-design-team` (review design implementation); feeds into `/spawn-debug-team` (investigate issues found), `/spawn-feature-team` (rework based on review findings)

## Step 5: Spawn the Team

**Spawn the following team (replacing [TARGET] with the review target):**

```
Create an agent team called "review-[target-slug]" to review [TARGET]. Spawn [3-5] reviewers:

1. **Security Reviewer** — Focus exclusively on security implications: authentication
   and authorization checks, input validation, SQL/XSS/command injection risks,
   sensitive data exposure, CSRF protection, and dependency vulnerabilities.
   Rate each finding by severity (Critical/High/Medium/Low).
   [IF SECURITY-FOCUSED MODE: You are the lead reviewer. Conduct additional threat modeling
   for the changed code paths. Identify attack vectors and assess the security posture change.]

2. **Performance Reviewer** — Focus on performance impact: database query patterns
   (N+1 queries, missing indexes), memory allocation, caching opportunities,
   algorithmic complexity, bundle size impact, and unnecessary re-renders.
   Estimate performance impact where possible.
   [IF PERFORMANCE-FOCUSED MODE: You are the lead reviewer. Conduct additional profiling
   analysis. Identify hot paths and assess the performance impact of each change.]

3. **Quality Reviewer** — Focus on code quality and maintainability: adherence to
   project patterns, naming conventions, error handling completeness, test coverage
   gaps, documentation needs, and separation of concerns. Check that existing tests
   still pass and new code has adequate coverage.

[IF ACCESSIBILITY REVIEWER SELECTED]
4. **Accessibility Reviewer** — Focus on accessibility compliance: WCAG 2.1 AA standards,
   keyboard navigation, screen reader support, color contrast ratios, focus management,
   ARIA attributes, touch targets, and error recovery. Review both the markup and the
   interactive behavior.
   Use Sonnet model.

[IF ARCHITECTURE REVIEWER SELECTED]
5. **Architecture Reviewer** — Focus on structural quality: design pattern adherence,
   dependency direction, abstraction appropriateness, module boundaries, coupling/cohesion,
   and backwards compatibility. Assess whether this change improves or degrades the
   architecture.
   Use Sonnet model.

Use Sonnet for all reviewers to keep costs manageable.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Review Context

### Review Focus
[What the author wants reviewers to pay attention to]

### Change Context
[What this change does and why — the author's intent]

### Known Risk Areas
[Parts the author is less confident about]

Create these tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [All] Cross-reference findings across review domains
8. [Quality Reviewer] Compile unified review report with prioritized action items — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `review-report.md` with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md`

Each reviewer should produce a structured report. Have them share reports so they
can cross-reference findings (e.g., a performance issue might also be a security
concern). Focus only on changed/target code, not pre-existing issues.
Wait for all reviewers to complete before compiling the unified report.

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
- Never restate the Review Context back — teammates already have it
- Every sentence should add new information. Cut filler, hedging, and throat-clearing
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**Output format:** Unified review report + per-reviewer reports + action items checklist → feeds into `/spawn-debug-team` (for investigating issues found), `/spawn-feature-team` (for rework)
**Artifact files:** `docs/teams/[TEAM-NAME]/review-report.md` (primary), `tasks/` (task outputs)

## Output

After spawning, inform the user:
- The team has been created with [3-5] reviewers in **[MODE NAME]** mode
- Each reviewer produces a structured report with severity ratings
- Reviewers cross-reference findings to catch multi-domain issues
- The lead will compile a unified review report when all reviewers finish
- No user feedback gate — reviews are single-pass; the cross-reference task serves as internal validation
- The review report feeds into `/spawn-debug-team` for investigating issues or `/spawn-feature-team` for rework
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — the primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to message specific reviewers with additional context
