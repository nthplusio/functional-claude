---
name: pm-issues
description: Use this skill when creating, updating, or closing a Linear issue; when the user describes untracked work that should be a Linear issue; when drafting issue content; or when the user says "create an issue", "log this in Linear", "add this to Linear", "update the issue", "close out the issue", "mark it done".
version: 0.10.4
---

# PM Issue Management

Create, update, and close Linear issues with consistent, clean formatting.

## Issue Templates

Always use the appropriate template based on issue type. Keep it concise — no filler, no unnecessary sections.

### Bug Template

```markdown
## What's Broken
[One sentence: what fails and the user impact]

## Steps to Reproduce
1.
2.

## Acceptance Criteria
- [ ] Bug no longer occurs under the described conditions
- [ ] [Regression test or verification step if applicable]
```

### Feature Template

```markdown
## Goal
[One sentence: what we're enabling and why it matters]

## Acceptance Criteria
- [ ]
- [ ]
```

### Task Template

```markdown
## Goal
[One sentence: what needs to be done and why]

## Acceptance Criteria
- [ ]
```

## Creating an Issue

### Step 1: Classify the issue type
Ask the user: "Is this a bug, feature, or task?" — or classify from context.

### Step 2: Draft content using the template
Fill in the template based on the user's description. Ask clarifying questions only if the problem statement or acceptance criteria are unclear.

**Quality checklist before creating:**
- [ ] Problem statement is one sentence, specific, and includes impact
- [ ] Acceptance criteria are testable and unambiguous
- [ ] No vague language ("improve", "enhance", "handle edge cases" without specifics)
- [ ] Issue is scoped to one PR's worth of work — if it needs 2+ PRs, decompose into a parent with sub-issues

**Scoping rule:** Each issue should be completable in a single PR. If the user describes a large feature (e.g., "add auth system"), suggest decomposing it into a parent issue with sub-issues (e.g., "add middleware", "add token refresh", "add logout"). The parent issue needs no PR — it closes when all sub-issues close.

### Step 3: Confirm and create
Show the draft to the user for quick review, then create:

```
save_issue {
  team: "<team_key>",
  title: "<concise title>",
  description: "<template content>",
  priority: <1-4>,  // 1=urgent, 2=high, 3=normal, 4=low
  assignee: "me",
  project: "<project_name>"  // only if linear_project_id is set in project config
}
```

If a `linear_project_id` is configured, always attach new issues to that project. If not set, create issues at the team level only.

### Step 4: Cache the new issue
Update `~/.claude/project-manager/cache/<slug>/context.json` with the new issue ID and title.

---

## Updating an Issue

When work in progress diverges from the issue description:

1. Fetch current issue: `get_issue { id: "<issue_id>" }`
2. Draft updated description or title
3. Show diff to user: "Here's what I'd update..."
4. Apply: `save_issue { id: "<issue_id>", title?, description?, state? }`

---

## Closing an Issue

Linear auto-closes issues via PR descriptions when using the `Closes <ID>` format in PRs. Do not manually close issues unless:
- The work was abandoned
- It was resolved without a PR

To manually close: `save_issue { id: "<issue_id>", state: "completed" }`

To find available states: `list_issue_statuses { team: "<team_key>" }`.

---

## Proactive Issue Detection

When the user describes work, check if it matches an open issue:
1. Search: `list_issues { query: "<keywords>", team: "<team_key>", project: "<project_name>" }`
   Include `project` in the search if `linear_project_id` is configured, to avoid matching issues from other projects.
2. If no match found → suggest creating one
3. If a match found → confirm: "Is this related to [ENG-42 · Auth refactor]?"
