# Review Report Template

Canonical structure for the `review-report.md` artifact produced by `spawn-think --mode review`. The Quality Reviewer (compilation task) uses this template when assembling domain sections into the final report.

## Finding ID Convention

Assign IDs at first mention in task outputs and carry them through to the final report:

| Prefix | Domain |
|--------|--------|
| `S` | Security |
| `P` | Performance |
| `Q` | Quality |

Examples: `S1`, `S2`, `P1`, `Q3`. IDs are assigned sequentially within each domain, starting at 1.

## User Insight Section

Every finding MUST include a `#### User Insight` subsection. When writing initial domain sections (tasks 12-14), populate from gate feedback if available; otherwise use the placeholder.

**Placeholder (no feedback yet):**
```
#### User Insight
_Awaiting user review_
```

**After gate feedback — use the applicable format:**
```
#### User Insight
**Dismissed** — [rationale] — Confirmed [date]

#### User Insight
**Downgraded to [severity]** — [reasoning]

#### User Insight
**Fixed** — [what was changed or decided]

#### User Insight
**Deferred** — [rationale and timeline]

#### User Insight
**Confirmed** — [additional context that supports the finding]
```

A single finding may have multiple insight lines if the user provided layered context.

## Report Template

```markdown
---
artifact: review-report
team: [TEAM-NAME]
type: review
date: [YYYY-MM-DD]
target: [review target — PR number, branch, module path]
---

# Code Review Report — [Target]

## Executive Summary

| Domain | Critical | High | Medium | Low | Total |
|--------|----------|------|--------|-----|-------|
| Security | N | N | N | N | N |
| Performance | N | N | N | N | N |
| Quality | N | N | N | N | N |
| **Total** | **N** | **N** | **N** | **N** | **N** |

### Must Fix (Critical + High)

| ID | Domain | Severity | Finding | File |
|----|--------|----------|---------|------|
| S1 | Security | Critical | [one-line description] | `path/to/file.ts` |

### Post-Merge Track (Medium + Low)

| ID | Domain | Severity | Finding | File |
|----|--------|----------|---------|------|
| P1 | Performance | Medium | [one-line description] | `path/to/file.ts` |

## Fix Sequencing

Dependency ordering for must-fix items. State blocking relationships explicitly.

1. [Fix S1] — [rationale for why it must land first]
2. [Fix S2] — depends on S1 (shared auth path)
3. [Fix P1, Q1–Q3] — independent, can land in any order

## Security Findings

### [ID] — [SEVERITY]: [Title]

**File**: `path/to/file.ts:line-range`
**Description**: [What the code does and why it's a problem]
**Fix**: [Specific actionable change]

#### User Insight
_Awaiting user review_

---

[Repeat for each security finding]

## Performance Findings

[Same structure as Security Findings]

## Quality & AI Pattern Findings

[Same structure as Security Findings]

### AI Pattern Findings

| # | Pattern | File | Location | Finding | Severity |
|---|---------|------|----------|---------|----------|
| 1 | [Pattern name] | [file path] | [line/function] | [Specific issue] | [Critical/High/Medium/Low] |

_[If no findings: "No AI-specific patterns detected. All 6 checklist items checked."]_

## Cross-Domain Interactions

Findings that span domains or have ordering dependencies across the Security / Performance / Quality boundary.

| Finding Pair | Interaction | Recommendation |
|---|---|---|
| S1 + P2 | Both touch the auth middleware layer | Fix S1 first; P2 optimization is invalid until auth path is stable |

_[If none: "No cross-domain interactions identified."]_

## Appendix — Finding Index

Flat reference table for all findings. Update `Status` after user feedback and deep-dives.

| ID | Domain | Severity | Title | File | Lines | Status |
|----|--------|----------|-------|------|-------|--------|
| S1 | Security | Critical | [title] | `file.ts` | 234-290 | Open |
| S2 | Security | High | [title] | `file.ts` | 45-67 | Dismissed |
| P1 | Performance | Medium | [title] | `file.ts` | 102 | Fixed |
```

## Example: User Insight Lifecycle

**Initial finding (written at task 12):**
```markdown
### S1 — CRITICAL: No Tenant Isolation (Cross-Agency Data Access)
**File**: `tracked-files.service.ts:234-590`
**Description**: All data operations are global — no tenant scoping applied. Any authenticated user can read or modify records belonging to other agencies.
**Fix**: Add agency scoping middleware or Prisma extension for tenant isolation.

#### User Insight
_Awaiting user review_
```

**After gate feedback (updated before domain section is finalized):**
```markdown
### ~~S1 — DISMISSED: No Tenant Isolation~~
**File**: `tracked-files.service.ts:234-590`
**Description**: All data operations are global — no tenant scoping applied.
**Fix**: ~~Add agency scoping middleware~~ — see User Insight.

#### User Insight
**Dismissed** — This is an internal-only application. All authenticated users with the appropriate permission level are authorized to access data across all agencies. The flat authorization model is intentional and consistent with the rest of the codebase (e.g., `TripTicketsService`). Confirmed by user on [date].
```
