---
task: 8
title: "Deep-dive on adherence improvements with specific instruction rewrites"
owner: adherence-analyst
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 8: Adherence Deep-Dive — Before/After Rewrites

Covers 4 areas per gate direction: protocol placement, retrospective non-response, task ownership drift, idle semantics.

---

## 1. Protocol Placement Fix

**Problem:** Protocol blocks are placed AFTER the task list. Teammates read role descriptions and tasks first, then encounter the protocol — or miss it if they start acting on the task list immediately.

**Fix:** Move protocol blocks BEFORE the task list. Teammates see constraints before they see work.

### Before (current — review team in spawn-think.md):

```
## Review Context
[Compiled interview results]

Create these tasks:
1. [Security] Audit authentication and authorization paths
2. [Security] Check for injection vulnerabilities and data exposure
3. [Performance] Profile database queries and identify N+1 patterns
4. [Performance] Review algorithmic complexity and caching opportunities
5. [Quality] Verify adherence to project patterns and conventions
6. [Quality] Assess test coverage and identify gaps
7. [Lead] USER FEEDBACK GATE — Present top findings from each reviewer. Ask user to: prioritize findings, select deep-dive areas, adjust review scope (blocked by tasks 1, 2, 3, 4, 5, 6)
8. [Security] Deep-dive on user-prioritized security findings (blocked by task 7)
9. [Performance] Deep-dive on user-prioritized performance findings (blocked by task 7)
10. [Quality] Deep-dive on user-prioritized quality findings (blocked by task 7)
11. [All] Cross-reference findings across review domains (blocked by tasks 8, 9, 10)
12. [All] Write domain sections — each reviewer writes their named section...
13. [Quality Reviewer] Merge domain sections into review-report.md...

[Include Task Blocking Protocol, Escalation Protocol, Output Standards, and Shutdown Protocol from shared/task-blocking-protocol.md, shared/output-standard.md, and shared/shutdown-protocol.md]
```

### After (proposed):

```
## Review Context
[Compiled interview results]

[TASK BLOCKING PROTOCOL BLOCK]
[ESCALATION PROTOCOL BLOCK]
[OUTPUT STANDARDS BLOCK]
[SHUTDOWN PROTOCOL BLOCK]

Create these tasks:
1. [Security] Audit authentication and authorization paths
...
13. [Quality Reviewer] Merge domain sections into review-report.md...
```

**Why this matters:** When the protocol block comes after the task list, an agent that starts executing as soon as it sees its assigned tasks may never process the protocol. Placing protocols first establishes the operating rules before any task is visible. This mirrors how system prompts work — constraints come before instructions.

**Required change:** Update the `## Placement` section in both `shared/task-blocking-protocol.md` and `shared/shutdown-protocol.md`, and update the `[Include ...]` directives in all 3 spawn command files to move placement before `Create these tasks:`.

---

## 2. Retrospective Non-Response Fix

**Evidence:** 9/9 teammates across 3 teams failed to respond on first contact. Root cause: "go idle silently" instruction is active exactly when retrospective questions arrive (all tasks complete, nothing in queue).

### 2a. task-blocking-protocol.md — Before/After

#### Before (current Protocol Block, bullet 3):

```
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
```

#### After (proposed — split into 2 bullets):

```
- If all your assigned tasks are blocked or complete, go idle — do NOT send "standing by" or status messages. The system notifies the lead automatically when you stop responding.
- **RETROSPECTIVE EXCEPTION — When the lead messages you with questions about the goal, what went well, or what you'd change: respond immediately. Do not treat these as idle triggers. These questions arrive after all tasks complete, when you would otherwise stay idle. Answer before approving any shutdown_request.**
```

**What changed:**
- Removed "silently" — the positive framing ("The system notifies the lead") explains the mechanism without requiring suppression
- Made the exception a standalone named bullet with bold emphasis, not a parenthetical
- Specified the exact trigger ("questions about the goal, what went well, what you'd change") so agents recognize it by content, not just by sender
- Added the sequencing constraint: answer BEFORE approving shutdown_request

---

### 2b. shutdown-protocol.md — Before/After

#### Before (current Protocol Block):

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows...
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md`...
```

#### After (proposed):

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- For feature spawns: before Phase 1, check Tester's `### Scenario Notes` for Invalidated rows...
- Before sending shutdown requests, message each teammate with this exact header so they recognize it as a retrospective (not a task or standing-by message):
  "**RETROSPECTIVE — please answer before going idle:**
  1. What was your understanding of the goal?
  2. What went well in how the team operated?
  3. What would you change about how we worked together?"
- Wait for all responses. If a teammate does not respond after one cycle, send a follow-up: "@[name] — retrospective questions above, please answer before I send shutdown."
- After collecting all responses (or noting non-responses for the AAR), send shutdown_request to each teammate
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md`...
```

**What changed:**
- Added the `**RETROSPECTIVE —**` header so the message is visually distinct and matches the trigger condition in the Task Blocking Protocol RETROSPECTIVE EXCEPTION bullet
- Made the nudge sequence explicit (wait → follow-up → then shutdown)
- Clarified that non-responses should be noted for the AAR (not silently skipped)

---

### 2c. Few-Shot Compliance Examples

Embed these immediately after the RETROSPECTIVE EXCEPTION bullet in the Task Blocking Protocol block:

```
  ✓ CORRECT: All tasks complete. Lead sends retrospective questions. You answer all 3 questions, then approve the shutdown_request.
  ✗ WRONG: All tasks complete. Lead sends retrospective questions. You go idle without responding. Lead nudges. You then answer.
  ✗ WRONG: You approve shutdown_request before answering retrospective questions.
```

**Why few-shot examples work here:** The failure mode is not misunderstanding the rule — it's that the idle behavior pattern overrides the exception. Showing the concrete wrong behavior pattern ("you go idle without responding") makes the target failure recognizable.

---

## 3. Task Ownership Drift Fix

**Evidence:** Explorer claimed Critic's task in research-eval because owner was in description text but not set via TaskUpdate. Architect received late assignment messages for completed tasks in 2 separate sessions.

### task-blocking-protocol.md — New bullets

Add to the Protocol Block after the TaskUpdate progress notes bullet:

#### Before (no ownership instruction exists):

```
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes...
```

#### After (add 2 new bullets):

```
- Use `TaskUpdate` to record your approach before starting a task, then periodically update with progress notes (what's done, what remains, key decisions made, files modified) — task descriptions survive compaction, conversation context does not
- **Before claiming any unassigned task, call `TaskGet` on it and check the owner field. If an owner is already set for a different role, do not claim it — even if your assigned tasks are complete and the task appears unblocked.**
- **For leads at spawn time: immediately after creating tasks, call `TaskUpdate` on each task to set the owner field before any teammate calls `TaskList`. This prevents the first available teammate from claiming tasks intended for specific roles.**
```

**Why two separate bullets:** The first addresses teammate behavior (don't steal owned tasks). The second addresses lead behavior (set owners before teammates can see the list). These are distinct actors with distinct failure modes — merging them into one bullet reduces clarity.

**Side effect:** Fixes the late-assignment noise problem. If leads set owners at spawn time, the task system itself enforces assignment — no need for the lead to also send direct assignment messages. The duplicate-message noise 4 teammates reported in the feature team disappears.

---

## 4. Idle Semantics Clarification

**Problem:** "Go idle silently" frames idleness as a suppression behavior (don't do X). This is ambiguous — "silently" implies the agent is making an active choice to suppress output. Agents that don't model the system notification mechanism correctly may either: (a) send status messages anyway, or (b) become overly passive and suppress responses they should send.

### Before (current):

```
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
```

### After (proposed — incorporated into the split bullets from Fix #2a):

```
- If all your assigned tasks are blocked or complete, go idle — do NOT send "standing by" or status messages. The system notifies the lead automatically when you stop responding.
- **RETROSPECTIVE EXCEPTION — [see Fix #2a above]**
```

**Key framing changes:**
1. "Go idle" (not "go idle silently") — idleness is the state, not an action with suppression intent
2. "The system notifies the lead automatically when you stop responding" — explains the mechanism. The agent understands WHY it shouldn't send status messages (they're redundant, not forbidden for arbitrary reasons). This produces more robust compliance than pure prohibition.
3. "blocked or complete" — added "complete" to cover the end-of-session state where retrospective questions arrive. The original only said "blocked," which technically doesn't apply when all tasks are done.

---

## Summary: All Required File Changes

| File | Change | Section |
|------|--------|---------|
| `shared/task-blocking-protocol.md` | Split bullet 3 into "idle" + "RETROSPECTIVE EXCEPTION" with few-shot examples | Protocol Block |
| `shared/task-blocking-protocol.md` | Add 2 ownership bullets (teammate + lead) after TaskUpdate bullet | Protocol Block |
| `shared/task-blocking-protocol.md` | Update `## Placement` section to show protocols BEFORE task list | Placement |
| `shared/shutdown-protocol.md` | Add RETROSPECTIVE header, explicit nudge step, non-response AAR note | Protocol Block |
| `shared/shutdown-protocol.md` | Update `## Placement` section to show protocols BEFORE task list | Placement |
| `plugins/agent-teams/commands/spawn-build.md` | Move `[Include ...]` directive before `Create these tasks:` | Both modes |
| `plugins/agent-teams/commands/spawn-think.md` | Move `[Include ...]` directive before `Create these tasks:` | All templates |
| `plugins/agent-teams/commands/spawn-create.md` | Move `[Include ...]` directive before `Create these tasks:` | All templates |
