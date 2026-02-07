---
name: spawn-review-team
description: Spawn a code review agent team with security, performance, and quality reviewers
argument-hint: <PR number, branch name, or module to review>
---

# Spawn Code Review & QA Team

Create an agent team for parallel code review with specialized reviewers.

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

## Team Configuration

If `$ARGUMENTS` is provided, use it as the review target. Parse it to determine:
- **PR number** (e.g., `#142`, `142`) → review that PR's changes
- **Branch name** (e.g., `feat/auth`) → review diff from main
- **Module path** (e.g., `src/auth/`) → review that module

If not provided, ask the user what they want to review.

**Spawn the following team (replacing [TARGET] with the review target):**

```
Create an agent team called "review-[target-slug]" to review [TARGET]. Spawn 3 reviewers:

1. **Security Reviewer** — Focus exclusively on security implications: authentication
   and authorization checks, input validation, SQL/XSS/command injection risks,
   sensitive data exposure, CSRF protection, and dependency vulnerabilities.
   Rate each finding by severity (Critical/High/Medium/Low).

2. **Performance Reviewer** — Focus on performance impact: database query patterns
   (N+1 queries, missing indexes), memory allocation, caching opportunities,
   algorithmic complexity, bundle size impact, and unnecessary re-renders.
   Estimate performance impact where possible.

3. **Quality Reviewer** — Focus on code quality and maintainability: adherence to
   project patterns, naming conventions, error handling completeness, test coverage
   gaps, documentation needs, and separation of concerns. Check that existing tests
   still pass and new code has adequate coverage.

Use Sonnet for all reviewers to keep costs manageable.

Create these tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [All] Cross-reference findings across review domains
8. [Lead] Compile unified review report with prioritized action items

Each reviewer should produce a structured report. Have them share reports so they
can cross-reference findings (e.g., a performance issue might also be a security
concern). Focus only on changed/target code, not pre-existing issues.
Wait for all reviewers to complete before compiling the unified report.
```

## Output

After spawning, inform the user:
- The team has been created with 3 reviewers (Security, Performance, Quality)
- Each reviewer produces a structured report with severity ratings
- Reviewers cross-reference findings to catch multi-domain issues
- The lead will compile a unified review when all reviewers finish
- Use Shift+Up/Down to message specific reviewers with additional context
