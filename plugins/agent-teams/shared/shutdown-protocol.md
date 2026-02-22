# Shutdown Protocol

Structured team shutdown sequence that ensures participant retrospective input is collected and AAR runs before team data is destroyed. Without this, TeamDelete destroys config and task data before AAR can analyze it, teammates aren't asked for process feedback, and the AAR is skipped or runs with incomplete data.

## Why This Exists

Without a shutdown protocol:
- `TeamDelete` destroys team config and task lists before AAR can read them
- Teammates are never asked for their perspective on what went well or poorly
- AAR is skipped entirely or treated as optional post-hoc activity
- Process improvements are lost because no structured retrospective happens

## Shutdown Sequence

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

Then call `TeamDelete` to clean up team config and task directories.

## Protocol Block

Include this block verbatim in spawn prompts, after the Output Standards block:

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
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
