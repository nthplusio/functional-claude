---
task: 3
title: "Analyze agent adherence issues from prior AARs and protocol design"
owner: adherence-analyst
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 3: Adherence Analysis — Protocol Compliance Failures

## Summary

5 AARs covering 21 teammate instances reveal 4 recurring adherence failure patterns. The dominant failure (retrospective non-response, 9/9 cases across 3 teams) is caused by a genuine protocol conflict: the Task Blocking Protocol's "go idle silently" instruction competes with the Shutdown Protocol's expectation that teammates answer retrospective questions. The exception added in v0.17.2 exists in the canonical file but propagates inconsistently into spawn prompts.

---

## Failure Pattern #1: Retrospective Non-Response

**Evidence:** 100% failure rate across 3 of 5 teams.
- research-eval: 3/3 teammates failed to respond → reduced-fidelity AAR
- plan-spec-feedback: 2/2 required nudge (explicit statement: pattern same as research team)
- feature-feedback-loop: 4/4 required nudge ("consistent with known pattern from previous teams")
- plan-spec-discovery: both responded (first team chronologically — exception, not pattern)
- plan-spec-interview-output: Architect cycled idle without responding → reduced-fidelity AAR

**Root cause:** The Task Blocking Protocol tells teammates to "go idle silently" when waiting. Retrospective questions arrive after all tasks complete — exactly when the idle rule is active. The exception ("always respond to direct questions from the lead") was added in `task-blocking-protocol.md` but:
1. It's buried in the middle of a 12-bullet protocol block
2. The exception language ("e.g., retrospective questions") treats it as an example, not a named exception
3. The Shutdown Protocol block (what the lead follows) says nothing about this tension — it only instructs the lead on what to send, not how to keep teammates receptive

**Protocol conflict diagram:**
```
Task Blocking: "go idle silently when waiting"
                         ↕ conflict
Shutdown Phase 1: "message each teammate with 3 questions"
```

The lead sends questions → teammate is already in "idle silently" mode → questions go unprocessed.

---

## Failure Pattern #2: Task Ownership Drift

**Evidence:** research-eval AAR, Issue #1.
- Explorer claimed task 3 intended for Critic because owner was set in task description text but not via `TaskUpdate` at spawn time
- Critic went idle unnecessarily; Explorer did both tasks 1 and 3

**Root cause:** The Task Blocking Protocol says "Use `TaskUpdate` to record your approach before starting a task" but does not say "check if a task already has an owner before claiming it." The instruction for the lead to set owners at spawn time exists only in an improvement recommendation (AAR Issue #1), not in any protocol block that gets embedded in spawn prompts.

Discovery-scoring AAR (Issue #1) independently found the same problem: "Lead should set task owners via `TaskUpdate` at spawn time before sending any messages."

**Protocol gap:** No protocol block instructs:
- Leads to call `TaskUpdate` with owner at spawn time (before teammates see the task list)
- Teammates to check existing owner before claiming a task

---

## Failure Pattern #3: R2+R4 Conflict Rated ADVISORY Instead of BLOCKING

**Evidence:** plan-spec-feedback AAR, Issue #3. Risk Analyst's self-assessment.
- Both R2 and R4 specs targeted the same verbatim text block in shutdown-protocol.md
- Risk Analyst found the conflict, rated it ADVISORY
- Risk Analyst explicitly said in retrospective: "should have been BLOCKING, not ADVISORY"
- Required Architect to apply a sequenced fix in task 9; if missed, implementation would produce a broken file

**Root cause:** The validation criteria for the Risk Analyst role contain no automatic escalation rule for "multiple specs modify the same text block." The rating was a judgment call that went wrong. No protocol defines what makes a cross-spec conflict BLOCKING vs ADVISORY.

This failure mode is structural: the Risk Analyst role is defined in task descriptions, not in a shared protocol block — so there's no canonical escalation criteria document to reference.

---

## Failure Pattern #4: Stale Member Entries Blocking Re-spawn

**Evidence:** plan-spec-feedback AAR, Issue #1.
- Session boundary hit mid-execution; processes died
- Stale member entries in team config triggered dedup guard
- Required manual JSON edit to remove dead entries before re-spawning

**Root cause:** No protocol covers session-resume state. The Task Blocking Protocol covers compaction (in-process mode) but not full process death. The dedup guard correctly prevents duplicate spawns but has no mechanism to detect dead processes.

This is a platform/infrastructure issue rather than a prompt instruction issue — the fix belongs in the team management tooling, not the protocol blocks. However, the Task Blocking Protocol's compaction resilience section could be extended to distinguish between compaction recovery (process alive) and session-resume recovery (process dead, task state in JSON).

---

## Failure Pattern #5: Spec Drift After Feedback Gate

**Evidence:** plan-spec-interview-output AAR, Issue #1.
- Architect used `NN-[task-slug].md` format instead of user-chosen `task-{N}-{role-slug}.md`
- Architect included per-task line embedding despite gate decision for convention-only approach
- Required a second gate round

**Root cause:** When the lead relayed Risk Analyst findings to the Architect, no distinction was made between "findings for awareness" vs "findings that override your spec." The Architect treated risk findings as binding, overriding the user's explicit gate decision.

The protocol block for USER FEEDBACK GATE says "treat all user decisions as binding constraints — do NOT include approaches, options, or paths the user explicitly rejected" — but this is written for teammates to follow re: their own tasks, not about what to do when the lead relays a second party's findings post-gate.

---

## Protocol Design Issues (vs Execution Issues)

| # | Issue | Type | Affected Protocol |
|---|-------|------|-------------------|
| 1 | "Go idle silently" competes with retrospective question expectations | **Design conflict** | task-blocking-protocol.md |
| 2 | Exception for direct questions is buried, not named | **Visibility** | task-blocking-protocol.md |
| 3 | No instruction for leads to set owners at spawn time | **Missing instruction** | task-blocking-protocol.md |
| 4 | No instruction for teammates to check existing owner before claiming | **Missing instruction** | task-blocking-protocol.md |
| 5 | Shutdown Protocol block doesn't address teammate receptiveness | **Missing instruction** | shutdown-protocol.md |
| 6 | No criteria defining BLOCKING vs ADVISORY for cross-spec conflicts | **Missing definition** | (no file — Risk Analyst role gap) |
| 7 | Compaction resilience section doesn't cover session-resume (full process death) | **Coverage gap** | task-blocking-protocol.md |
| 8 | Post-gate risk relay has no "binding vs awareness" distinction | **Missing instruction** | task-blocking-protocol.md |

---

## Proposed Rewrites

### Fix #1: Rename and elevate the retrospective exception

**Current (task-blocking-protocol.md, Protocol Block, bullet 3):**
```
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
```

**Proposed:**
```
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages
- **RETROSPECTIVE EXCEPTION: When the lead sends you questions about goal understanding, what went well, or what you'd change — answer immediately. Do not treat these as "standing by" triggers. Retrospective questions arrive after all tasks complete, when you would otherwise be idle. Answer them before approving any shutdown_request.**
```

Rationale: Splitting into a separate named bullet removes the conflict. The current exception is an afterthought appended to the idle rule — making it a first-class bullet with bold emphasis changes the salience.

### Fix #2: Add explicit pre-shutdown receptiveness instruction to Shutdown Protocol block

**Current (shutdown-protocol.md, Protocol Block):**
```
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1)..."
- Collect all responses before sending any shutdown_request
```

**Proposed addition (after first bullet):**
```
- Before sending retrospective questions, message each teammate: "RETROSPECTIVE — please respond before going idle: ..."
- If a teammate does not respond within one reply cycle, send a direct nudge: "@[name] — please answer the retrospective questions before I send shutdown"
```

Rationale: Formalizes the nudge pattern that leads already use ad-hoc. Makes the nudge an expected step, not a failure recovery.

### Fix #3: Add owner-assignment instruction for leads in Task Blocking Protocol

**Current (task-blocking-protocol.md, Protocol Block):**
No instruction about task ownership at spawn time.

**Proposed addition (after TaskUpdate bullet):**
```
- **For leads spawning teams:** Set task owners via `TaskUpdate` immediately after creating tasks — before any teammate can call `TaskList`. This prevents ownership drift where any available teammate claims a task intended for a specific role.
- Before claiming any unassigned task, check its `owner` field via `TaskGet` — if an owner is already set for a role other than yours, do not claim it.
```

### Fix #4: Add session-resume distinction to compaction resilience

**Current (task-blocking-protocol.md, Protocol Block):**
```
- After any context reset (compaction, session resume), your FIRST action must be: call `TaskList`...
```

**Proposed:**
```
- After compaction (process continues): call `TaskList`, then `TaskGet` on any `in_progress` task assigned to you
- After session resume (new process, old task state): call `TaskList`, then `TaskGet` on any `in_progress` task. If your task has no progress notes, treat it as not started. If it has progress notes, resume from them. Do NOT re-claim tasks already marked `completed`.
```

---

## Priority Ranking

| Priority | Fix | Failure Rate | Impact |
|----------|-----|-------------|--------|
| 1 | Retrospective exception (Fix #1 + #2) | 9/9 teammates, 3/5 teams | Eliminates reduced-fidelity AARs |
| 2 | Task ownership at spawn (Fix #3) | 2 teams reported | Prevents idle Critic, duplicate work |
| 3 | Session-resume distinction (Fix #4) | 1 team, 5-10 min delay | Low freq, moderate impact |
| 4 | BLOCKING vs ADVISORY criteria | 1 team | Prevents broken implementation |

Fix #4 (BLOCKING/ADVISORY) requires a new section in the planning validation criteria — outside the scope of the shared protocol blocks. Recommend as a separate Risk Analyst role protocol, or a checklist addition to spawn-think planning mode.
