---
name: pm-branches
description: Use this skill when creating a git branch for a Linear issue, writing a PR description, opening a pull request, or linking a PR to a Linear issue. Trigger phrases: "create a branch", "new branch for this issue", "open a PR", "write the PR description", "link to Linear", "push this up".
version: 0.4.0
---

# PM Branches & PR Linking

Enforce consistent branch naming and PR descriptions that trigger Linear's auto-close via PR link.

## Core Rule: 1 PR = 1 Issue

A PR should represent one unit of shippable work tied to one Linear issue. If an issue is well-scoped (one-sentence goal, testable acceptance criteria), the PR that satisfies it is naturally one reviewable, revertable unit.

**When extra work surfaces mid-PR:**
- **Bug found while building a feature** → create a new issue, fix it in a separate PR first, rebase your feature branch
- **Scope creep** → that's a pivot — use the `pm-pivot` skill
- **Tiny related cleanup** → if it's under ~10 lines and directly related, include it. If you have to explain why it's in this PR, it belongs in its own issue

**If you're tempted to put 3+ issues in one PR**, that's a signal the issues were either too granular or the work wasn't properly decomposed. Fix the issues, not the PR.

### Sub-Issue Pattern

For larger features, use Linear's parent/sub-issue hierarchy:
- **Parent issue:** "Add auth system" — no PR needed, closes when all sub-issues close
- **Sub-issues:** "Add auth middleware", "Add token refresh", "Add logout flow" — each gets its own branch and PR
- Each sub-issue PR uses `Closes <SUB-ID>` in the description
- Branch naming uses the sub-issue ID: `feat/NTH-44-auth-middleware`

## PR Sizing Guide

A well-sized PR can be reviewed in one sitting. Use these guidelines to keep PRs focused and reviewable.

**Target size:** ~200-400 lines changed. Under 200 is ideal. Over 500 warrants a check-in.

**Scope check — before opening a PR, verify:**
- [ ] Every changed file relates to the issue's acceptance criteria
- [ ] No "while I was here" changes (unrelated refactors, formatting, imports)
- [ ] Test changes match the code changes (no untested new paths)

**If the diff is growing beyond ~500 lines:**
> "This PR is getting large. Want to split it? We could ship [completed piece] now and continue [remaining work] in a follow-up issue."

Suggest splitting by identifying a shippable subset — something that passes tests and delivers partial value on its own. Create a new sub-issue for the remaining work.

### Mid-Work Check-Ins

Proactively check in with the user at natural breakpoints during implementation:

**After completing the core change** (before tests/cleanup):
> "Core implementation is done. Before I continue with tests — does this approach look right? Anything you'd change before we go further?"

**When the diff crosses ~300 lines:**
> "We're at ~300 lines changed. Still on track for a single PR, but want to do a quick scope check?"

**When work reveals unexpected complexity:**
> "This is turning out to be more involved than the issue described. Should we update the issue scope, or split this into two issues?"

These check-ins prevent the common pattern of building up a 1000-line PR before anyone looks at it. Catching misalignment early is cheaper than reworking a finished PR.

---

## Branch Naming Convention

Format: `<type>/<LINEAR-ID>-<short-description>`

- `type` = `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- `LINEAR-ID` = the Linear issue identifier (e.g., `ENG-42`)
- `short-description` = 2-4 words, lowercase, hyphenated

**Examples:**
```
feat/ENG-42-auth-middleware-refactor
fix/ENG-45-pagination-off-by-one
chore/ENG-51-update-dependencies
```

### Creating a Branch

```bash
git checkout -b feat/ENG-42-auth-middleware-refactor
```

Always confirm the Linear issue ID before creating the branch. If the work isn't tracked yet, use the `pm-issues` skill to create the issue first.

---

## PR Description Template

```markdown
## Summary
[1-3 bullet points describing what changed and why]

## Changes
- [Specific change 1]
- [Specific change 2]

## Testing
- [ ] [How to verify this works]
- [ ] [Edge cases tested]

Closes ENG-42
```

**Critical:** The `Closes <ID>` line at the end of the PR description is what triggers Linear to auto-close the issue when the PR merges. Always include it. One PR, one `Closes` line.

---

## Opening a PR

When the user says "open a PR" or "push this up":

1. Confirm the Linear issue ID from the current branch name or context
2. Check the current branch has been pushed: `git push -u origin <branch>`
3. Draft the PR description using the template above
4. Show the user the description for review
5. Create the PR:
   ```bash
   gh pr create \
     --title "<LINEAR-ID>: <concise title>" \
     --body "<description with Closes ENG-XX>"
   ```

### PR Title Format
```
ENG-42: Refactor auth middleware to support OAuth
```

The Linear ID at the front of the title makes it easy to scan in GitHub's PR list.

---

## Verifying the Link

After creating the PR, confirm the Linear issue shows the PR as attached:
```
linear_get_issue { id: <issue_id> } → check attachments or relations
```

If Linear doesn't pick it up automatically within a few minutes, the `Closes` keyword in the PR body is what matters — Linear scans it on merge.
