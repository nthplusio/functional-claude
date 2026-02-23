# Shutdown Protocol

Structured team shutdown sequence that ensures participant retrospective input is collected and AAR runs before team data is destroyed. Without this, TeamDelete destroys config and task data before AAR can analyze it, teammates aren't asked for process feedback, and the AAR is skipped or runs with incomplete data.

## Why This Exists

Without a shutdown protocol:
- `TeamDelete` destroys team config and task lists before AAR can read them
- Teammates are never asked for their perspective on what went well or poorly
- AAR is skipped entirely or treated as optional post-hoc activity
- Process improvements are lost because no structured retrospective happens

## Shutdown Sequence

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

### Phase 1: Participant Retrospective

Before sending shutdown requests, message each teammate with these 3 questions (mapped to FM 7-0 core questions):

```
Before we wrap up — answer briefly:
1. What was your understanding of the goal?
2. What went well in how the team operated?
3. What would you change about how we worked together?
```

Collect all responses. These become primary data for the AAR's "What Went Well?" and "What Could Be Improved?" sections.

**If a teammate doesn't respond** (idle timeout, compaction): proceed without their input. Note the gap in the AAR.

### Phase 2: Shutdown Teammates

Send `shutdown_request` to all teammates. Wait for approvals.

If a teammate rejects (mid-write on a file): wait for them to finish, then re-send.

### Phase 3: Run AAR

Run `/after-action-review [team-name]` with participant retrospective responses available as primary data.

The AAR protocol will:
- Use participant responses for Q1 (goal alignment), Q3 (what went well), and Q4 (improvements)
- Pull task data from the still-intact task list
- Read team config from the still-intact team directory
- Write the AAR to `docs/retrospectives/[team-name]-aar.md`

### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first
5. Check for evaluate-spawn retrospective at `docs/retrospectives/[team-name].md`
6. If that file is absent: display — "No evaluate-spawn retrospective found for this team. Run `/evaluate-spawn` to capture learnings before session ends? (optional — press Enter to skip)"
7. If user runs `/evaluate-spawn`: wait for completion, then proceed to TeamDelete
8. If user skips: proceed to TeamDelete

Then call `TeamDelete` to clean up team config and task directories.

## Protocol Block

Spawn prompts reference this block via `[Include Shutdown Protocol from shared/shutdown-protocol.md]`. The lead reads this file at spawn time and embeds the Protocol Block in the prompt text teammates receive:

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows — if found, run Scenario Invalidation Check (see `shared/shutdown-protocol.md` Phase 0) and present user with accept/fix/proceed options before continuing
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md` — if absent, display: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)"
```

## When to Include

**Always.** Every spawn prompt should include the Shutdown Protocol block. Even small teams benefit from structured shutdown — the cost is minimal (3 questions per teammate) and the retrospective data compounds across sessions.

## Placement

Place immediately after the Output Standards block, inside the spawn prompt code fence:

```
Create these tasks:
1. [Owner] Task description
...
N. [Lead] Compile deliverables

[TASK BLOCKING PROTOCOL BLOCK HERE]

[OUTPUT STANDARDS BLOCK HERE]

[SHUTDOWN PROTOCOL BLOCK HERE]
```
