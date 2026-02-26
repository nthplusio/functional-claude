---
task: 3
title: "Spec R2 — Unified Inline Correction Protocol"
owner: protocol-designer
team: plan-spec-agent-teams-feedback
date: 2026-02-22
recommendation: R2
phase: A
gaps: [G2, G5-partial]
effort: Medium
confidence: High
files-modified: [shared/shutdown-protocol.md, shared/scenario-collection.md]
---

# Spec R2 — Unified Inline Correction Protocol

## Summary

Adds a "Scenario Invalidation → Correction Loop" protocol that transforms the current binary choice (accept failures or full re-spawn) into a three-option decision tree. When the Tester produces Invalidated scenarios before shutdown, the Lead presents the user with structured options and can create targeted correction tasks within the active team — preserving context that would be lost after session end.

This spec merges R2 + R8 (Critic correction from task-07). One canonical protocol lives in `shared/shutdown-protocol.md`; `shared/scenario-collection.md` adds a reference link. Replaces the dropped R9 (--patch flag), which was killed because state reconstruction post-shutdown is unsolvable in the markdown+hooks architecture.

**Gap addressed:** G2 — No rework path for partial failures. Active-session correction preserves full team context; the post-shutdown --patch approach does not.

---

## Files Modified

| File | Change Type | Role |
|------|-------------|------|
| `shared/shutdown-protocol.md` | Insert new section | Primary owner of protocol |
| `shared/scenario-collection.md` | Append reference | Cross-pointer only |

**Plugin root:** `plugins/agent-teams/`

---

## File 1: `shared/shutdown-protocol.md`

### Current state (full file, reproduced for insertion context)

The file has this structure:
```
# Shutdown Protocol
[Why This Exists]
## Shutdown Sequence
### Phase 1: Participant Retrospective
### Phase 2: Shutdown Teammates
### Phase 3: Run AAR
### Phase 4: Verify and Delete
## Protocol Block
## When to Include
## Placement
```

### Insertion point

Insert a new **Phase 0: Scenario Invalidation Check** section immediately before `### Phase 1: Participant Retrospective`. This positions the correction loop at the correct lifecycle point: after Tester validation output exists, before AAR or shutdown begins.

**Exact text to insert BEFORE:**
```
### Phase 1: Participant Retrospective
```

**Content to insert:**

```markdown
### Phase 0: Scenario Invalidation Check

**Trigger:** Only runs for feature spawns where a Tester has produced `### Scenario Notes` output.

Before initiating Phase 1, the Lead reads the Tester's task output and checks `### Scenario Notes` for any rows with status `Invalidated` or `Partial`.

**If no Invalidated/Partial rows exist:** Skip Phase 0, proceed to Phase 1.

**If Invalidated or Partial rows exist:**

1. **Tester produces a `### Correction Opportunities` table** in their task output (added after `### Scenario Notes`):

   ```markdown
   ### Correction Opportunities

   | Scenario | Root Cause | Affected Task | Suggested Fix |
   |----------|------------|---------------|---------------|
   | [scenario name] | [brief root cause] | [task # and owner] | [specific fix description] |
   ```

2. **Lead reads the table and presents the user with three options:**

   ```
   Tester found [N] invalidated scenario(s). How do you want to proceed?

   (a) Accept — proceed to AAR and address failures in next spawn
   (b) Fix now — I'll create targeted correction tasks for the original implementers
       (blocks AAR until resolved or you accept)
   (c) Proceed — skip correction, note in AAR for future reference
   ```

3. **Option (a) — Accept:** Log accepted failures in AAR improvement table. Proceed to Phase 1.

4. **Option (b) — Fix now:**
   - Lead creates one task per Invalidated scenario, assigned to the original implementer
   - Task title format: `[Owner] Fix scenario: [scenario-name] — [one-line root cause]`
   - Task description includes: full `### Correction Opportunities` row, original scenario file path, instruction to re-run Tester validation after fix
   - AAR and shutdown are **blocked** until all correction tasks complete (status: completed) or user explicitly accepts remaining failures
   - After correction tasks complete, Tester re-validates the affected scenarios
   - If re-validation passes: proceed to Phase 1
   - If re-validation fails again: present options (a)/(c) only (no second correction loop)

5. **Option (c) — Proceed:** Skip correction. Lead records invalidated scenario names in AAR `### What Could Be Improved?` section. Proceed to Phase 1.

**Inter-teammate communication flow:**
- Tester → Lead: sends `### Correction Opportunities` table via SendMessage
- Lead → user: presents three options
- Lead → original implementer: sends correction task context via SendMessage (option b only)
- Original implementer → Lead: confirms fix complete
- Lead → Tester: requests re-validation of affected scenarios
- Tester → Lead: sends updated `### Scenario Notes`

**What "fix complete" means:** Correction task status set to `completed` AND Tester has re-validated the scenario as `Validated` or `Partial` (with user acceptance of remaining partial coverage).

```

### Also update the Protocol Block section

The Protocol Block (the verbatim text included in spawn prompts) must reference Phase 0. Update the existing block:

**Exact text to replace:**
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

**Replace with:**
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows — if found, run Scenario Invalidation Check (see `shared/shutdown-protocol.md` Phase 0) and present user with accept/fix/proceed options before continuing
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

---

## File 2: `shared/scenario-collection.md`

### Current state (relevant section)

The file ends with:
```markdown
## Integration Points

- **Discovery Interview**: Scenario collection runs after core questions, before output compilation
- **Feature Context**: Compiled scenarios included as `### Acceptance Scenarios` subsection
- **Spec Quality Scoring**: Missing `### Acceptance Scenarios` penalizes the acceptance criteria dimension
- **Tester Task List**: Scenario validation appears as a distinct task, separate from unit/integration tests
```

### Change: Append to Tester Validation Protocol

Insert after the `### Scenario Notes` table definition (line 94 in current file), after the `- **Partial**: ...` bullet:

**Exact text to insert AFTER:**
```
- **Partial**: Some aspects match, others diverge — details in Notes column
```

**Content to insert:**

```markdown

**If any rows are Invalidated or Partial:** The Tester adds a `### Correction Opportunities` table immediately after `### Scenario Notes`. See `shared/shutdown-protocol.md` Phase 0 for the correction loop protocol the Lead runs on this output.

```markdown
### Correction Opportunities

| Scenario | Root Cause | Affected Task | Suggested Fix |
|----------|------------|---------------|---------------|
| [scenario name] | [brief root cause] | [task # and owner] | [specific fix description] |
```
```

### Also append to Integration Points

**Exact text to insert after the last bullet in Integration Points:**

```markdown
- **Shutdown Phase 0**: Tester's `### Correction Opportunities` table triggers the Scenario Invalidation Check in `shared/shutdown-protocol.md` — the Lead reads it and presents user with accept/fix/proceed options before AAR begins
```

---

## Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | Phase 0 section exists in `shutdown-protocol.md` before Phase 1 | Read file, confirm heading order |
| 2 | Phase 0 triggers only on Invalidated/Partial rows | Protocol text includes explicit skip condition |
| 3 | Three options (a/b/c) are presented to user verbatim | Protocol block text contains all three options |
| 4 | Option (b) correction tasks have specified format and blocking behavior | Task title format and AAR-blocking rule both present |
| 5 | Inter-teammate communication flow is defined | All 6 SendMessage steps listed |
| 6 | "Fix complete" definition is unambiguous | Dual condition: task completed + Tester re-validated |
| 7 | Protocol Block in `shutdown-protocol.md` references Phase 0 | Updated block contains Phase 0 bullet |
| 8 | `scenario-collection.md` Tester Validation Protocol references the Correction Opportunities table | Reference bullet added |
| 9 | `scenario-collection.md` Integration Points references Phase 0 | Bullet added pointing to shutdown-protocol |
| 10 | No second correction loop (one fix cycle only) | Option (b) re-validation failure routes to (a)/(c) only |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Tester times out before writing Correction Opportunities | Lead proceeds with Phase 1, notes missing correction data in AAR improvement table |
| Original implementer is already shut down when option (b) selected | Lead must re-spawn that implementer as a minimal 1-agent task before correction can proceed; cost of this is user's awareness — present it before confirming option (b) |
| All scenarios are Invalidated (total failure) | Phase 0 still runs; option (b) creates correction tasks for all. User may prefer option (a) for total failures — present scenario count in the option presentation |
| Non-feature spawn (research, planning, etc.) | Phase 0 is skipped entirely — no `### Scenario Notes` table exists for these spawn types |
| Tester produces Partial rows only (no Invalidated) | Phase 0 still runs; user can accept partial coverage as sufficient. Option (b) can create tasks for partial rows if user wants full coverage |
| Correction task creates new Invalidated scenarios | Re-validation failure on second pass routes to options (a)/(c) only. No recursive correction loops. |
| User never responds to option prompt | Lead defaults to option (a) after reasonable wait. Log as accepted failure in AAR. |

---

## Dependencies

- **None required** — R2 is independent of all other Phase A/B recommendations.
- **R5 (retrospective scan):** Future enhancement only. Correction loop patterns visible in AAR data once R5 scan is implemented. Not needed for R2.
- **R9 (--patch flag):** Explicitly dropped. State reconstruction post-shutdown is unsolvable in the markdown+hooks architecture. R2 covers the majority use case within active session.
- **Note on R8 merger:** R8 (scenario-collection.md correction task protocol) is fully merged into this spec. `scenario-collection.md` gets a reference and the `### Correction Opportunities` table format. `shutdown-protocol.md` owns the decision flow and blocking logic. Implementing both sections in the same PR closes both R2 and R8.
