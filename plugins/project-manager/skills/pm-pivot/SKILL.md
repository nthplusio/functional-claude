---
name: pm-pivot
description: Use this skill when the user changes direction mid-feature, describes a significant scope change, says the approach isn't working, wants to abandon the current approach, or says "we need to rethink this", "let's change direction", "this isn't right", "pivot", "different approach". Also use when the user's current work no longer matches the active Linear issue.
version: 0.4.0
---

# PM Pivot — Direction Change Handler

When work diverges from the original Linear issue, surface the decision clearly and recommend a path.

## Detecting a Pivot

A pivot has occurred when ANY of these are true:
- The user describes a solution significantly different from the issue's description
- The scope expanded or contracted materially
- The original acceptance criteria can no longer be met as written
- The user explicitly says they're taking a different approach

## Step 1: Surface the Divergence

Clearly state what changed:
> "The current approach differs from ENG-42 (Auth middleware refactor). Originally we were planning [original approach], but now we're [new approach]."

## Step 2: Recommend a Path

Evaluate and recommend ONE of these options — don't just list them, pick the most appropriate one and explain why:

### Option A: Update the existing issue
**When to recommend:** The core goal is the same, only the implementation approach changed.
- Update the issue description with the new approach
- Keep the same issue ID (branch name stays valid)
- Add a note explaining the pivot: "Pivoted from X to Y because..."

### Option B: Create a new issue, cancel the old one
**When to recommend:** The scope, goal, or acceptance criteria fundamentally changed.
- Create a new issue with the updated goal and fresh acceptance criteria
- Cancel or mark the original issue as "Won't Do" with a note
- Create a new branch: `<type>/<NEW-ID>-<description>`
- The original branch/PR should either be closed or retargeted

### Option C: Split into two issues
**When to recommend:** The pivot revealed additional work that should be tracked separately.
- Keep the original issue for what was already built
- Create a new issue for the new direction
- Update acceptance criteria on the original to match what was actually built

## Step 3: Execute the Chosen Path

After the user confirms:

**For Option A — Update existing:**
```
linear_update_issue {
  id: <issue_id>,
  description: <updated template with new approach>,
  title: <updated title if needed>
}
```

**For Option B — New issue + cancel old:**
```
linear_create_issue { ... }  // new issue
linear_update_issue { id: <old_id>, stateId: <cancelled_state_id> }
// Get cancelled state: linear_get_workflow_states { teamId } → type: "cancelled"
```
Then use `pm-branches` to create a new branch with the new issue ID.

**For Option C — Split:**
```
linear_create_issue { ... }  // new issue for new direction
linear_update_issue { id: <old_id>, description: <narrowed scope> }
```

## Step 4: Update Cache

Write the updated issue context to `~/.claude/project-manager/cache/<slug>/context.json`.
