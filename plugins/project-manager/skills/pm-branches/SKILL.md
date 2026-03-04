---
name: pm-branches
description: Use this skill when creating a git branch for a Linear issue, writing a PR description, opening a pull request, or linking a PR to a Linear issue. Trigger phrases: "create a branch", "new branch for this issue", "open a PR", "write the PR description", "link to Linear", "push this up".
version: 0.3.0
---

# PM Branches & PR Linking

Enforce consistent branch naming and PR descriptions that trigger Linear's auto-close via PR link.

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

**Critical:** The `Closes <ID>` line at the end of the PR description is what triggers Linear to auto-close the issue when the PR merges. Always include it.

For multiple issues: `Closes ENG-42, Closes ENG-45`

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
