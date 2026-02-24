---
task: 10
title: "Synthesize best practices into specific plugin recommendations"
owner: researcher
team: review-agent-teams-plugin
date: 2026-02-23
---

# Best Practices Synthesis: Concrete Plugin Recommendations

## 1. Few-Shot Compliance Examples (Ready to Embed)

### For Task Blocking Protocol — Idle Behavior

Add immediately after the "go idle silently" bullet. Replace the current single sentence with this expanded version plus examples:

```
- If all your assigned tasks are blocked, go idle — stop taking turns and wait silently.
  The system automatically notifies the lead when you stop responding. You will be woken
  when a task unblocks or the lead messages you directly. Do NOT send "standing by" messages.

  CORRECT: TaskList shows all your tasks are blocked → do nothing, wait
  WRONG:   TaskList shows all your tasks are blocked → send "Standing by, waiting for task 3 to unblock"
  WRONG:   TaskList shows all your tasks are blocked → send "I'm idle, let me know when I'm needed"
```

### For Task Blocking Protocol — Blocked Task Handling

Add after the "NEVER begin work on a blocked task" bullet:

```
- NEVER begin work on a blocked task — upstream outputs may change your requirements entirely.

  CORRECT: TaskGet shows blockedBy: [3] → do not start → call TaskList → find unblocked tasks
  WRONG:   TaskGet shows blockedBy: [3] → start anyway with "I'll make reasonable assumptions"
  WRONG:   TaskGet shows blockedBy: [3] → message lead asking if you can start early
```

### For Shutdown Protocol — Retrospective Response

Add after the retrospective questions block:

```
Answer each question in 2-3 sentences. Focus on team process, not output quality.

CORRECT: "My goal was to audit spawn prompts for duplication. The task blocking system
         worked well — I never started a blocked task by accident. I'd change the output
         standards: 500-line limit was too generous, most tasks needed 150-200 lines max."

WRONG: "I understood the goal was to do a comprehensive review. Everything went great,
       the team worked well together. I don't have suggestions for improvement."
```

### For Shutdown Protocol — Shutdown Approval

Add at the end of the shutdown block in the teammates' protocol:

```
- When you receive a shutdown_request, approve it immediately unless mid-write on a file.

  CORRECT: Receive shutdown_request while idle → approve immediately
  CORRECT: Receive shutdown_request while writing task-5-researcher.md → finish write → approve
  WRONG:   Receive shutdown_request → finish sending a message first → approve
  WRONG:   Receive shutdown_request → reject to "wrap up analysis" or "send a final message"
```

---

## 2. Effort Budgeting Guidelines by Team Type

Based on Anthropic's multi-agent research finding that token usage explains 80% of performance variance, and their guidance to embed explicit scaling rules in prompts.

Add these as a single line in each task description (format: `~N-M tool calls`), OR add a team-level budget note at the top of the task list.

### Research Teams

| Team Type | Per-Teammate Budget | Rationale |
|---|---|---|
| research-eval | 15–25 tool calls | Multiple web searches + reads per candidate option; 3-5 candidates typical |
| research-landscape | 20–35 tool calls | Broad survey requires many sources; breadth over depth |
| research-risk | 10–20 tool calls | Deep reading of known codebase; bounded scope |

### Planning Teams

| Team Type | Per-Teammate Budget | Rationale |
|---|---|---|
| plan-spec | 8–15 tool calls | Codebase reads + document writes; bounded by existing system |
| plan-roadmap | 5–10 tool calls | Analysis and writing; minimal file exploration needed |
| plan-adr | 8–12 tool calls | Research + codebase reads + decision writing |
| plan-migration | 10–20 tool calls | Must understand full existing system before planning |
| plan-bizcase / gtm / okr | 5–10 tool calls | Mostly writing; external research optional |

### Review Teams

| Team Type | Per-Teammate Budget | Rationale |
|---|---|---|
| review (balanced) | 10–20 tool calls | Read changed files + explore referenced code |
| review (security mode) | 15–25 tool calls | Trace auth flows, check dependencies, OWASP checklist |
| review (performance mode) | 15–25 tool calls | Profile queries, check indexes, trace call paths |

### Build Teams

| Team Type | Per-Teammate Budget | Rationale |
|---|---|---|
| feature (Frontend/Backend) | 20–40 tool calls | Read patterns + implement + write tests; most token-intensive |
| feature (Tester) | 15–25 tool calls | Read contracts + write multiple test files |
| feature (DevOps/Docs) | 5–15 tool calls | Focused scope; fewer files to read/write |
| debug (Investigator) | 10–20 tool calls | Trace one code path deeply; bounded by hypothesis |

### Embed Format

Add as the first line of the task description in spawn prompts:

```
3. [Backend] Implement API endpoints and services (~20-35 tool calls) — ...
```

Or add a team-level note at the top of the task list:

```
Effort budgets: research tasks ~15-25 tool calls, writing tasks ~5-10 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.
```

---

## 3. Optimal Spawn Prompt Structure

### The Problem with Current Structure

Current structure (confirmed from `shared/task-blocking-protocol.md` placement instructions):

```
1. Team intro / role assignments    ← START (high attention)
2. Context section (Goal, Constraints, etc.)
3. Task list
4. Task Blocking Protocol           ← MIDDLE (30%+ degradation zone)
5. Escalation Protocol              ← MIDDLE
6. Output Standards                 ← MIDDLE
7. Shutdown Protocol                ← END
```

Critical behavioral rules are in the middle, where "Lost in the Middle" research shows 30%+ degradation. The team intro (which contains role assignment) is at the start — but that's less important than behavioral compliance.

### Recommended Structure

Move the three highest-failure-cost rules to the **first thing agents read**, before role details and before the task list:

```
[SPAWN PROMPT — RECOMMENDED ORDER]

## Behavioral Rules (read first — these override everything else)

**Task Blocking:** Call TaskList first. Never start a blocked task. Go idle silently when all tasks blocked — system notifies lead automatically. Approve shutdown_request immediately unless mid-write.

**Output:** Write to docs/teams/[TEAM-NAME]/tasks/task-{N}-{role-slug}.md. Lead with conclusions. Under 500 lines per file.

**Compaction:** Use TaskUpdate to preserve progress. After reset: TaskList → TaskGet in_progress → resume.

---

## Your Role

[Name] — [one-line role description]

---

## Context

### Goal
[...]

### Constraints
[...]

[etc.]

---

## Tasks

1. [Owner] Task description (~N tool calls) — write to task-1-owner.md
2. [Owner] Task description (blocked by 1)
...

---

## Full Protocol Reference

[Full Task Blocking Protocol block — for compliance during the session]
[Escalation Protocol block]
[Output Standards block]
[Shutdown Protocol block — Lead only]
```

**Key changes:**
- Behavioral rules summary at the very top (5-7 bullets covering the highest-failure-cost behaviors)
- Full protocol blocks moved to end as reference (still present, not removed — but not the first reading)
- Tasks come after context (agents need context to understand tasks)
- Role description stays early (agents need role to claim tasks)

### Why This Works

The "lost in the middle" finding applies to **retrieval** of information mid-session. For **initial setup** (the spawn moment), what matters is primacy — the first ~500 tokens receive disproportionate attention as the agent forms its behavioral frame. Putting a compressed behavioral summary first gives agents the most important rules during peak attention, then full protocol detail later for reference.

---

## 4. Context Engineering Checklist

A practical checklist for anyone modifying spawn prompts, based on the auto-loading capability confirmed in Claude Code docs ("teammates load CLAUDE.md, MCP servers, and skills automatically").

### What to Auto-Load vs Embed

**Put in CLAUDE.md (auto-loads, no spawn tokens needed):**
- [ ] Universal idle behavior (the system auto-notifies rule)
- [ ] Universal shutdown approval (approve immediately unless mid-write)
- [ ] Basic output formatting defaults (concise, bullets, lead with conclusions)
- [ ] Artifact directory convention (`docs/teams/[TEAM-NAME]/`)
- [ ] Few-shot compliance examples for idle and shutdown

**Put in spawn prompt (task-specific, must be embedded):**
- [ ] Role assignment and specific responsibilities
- [ ] Task list with dependencies and output filenames
- [ ] Team name and artifact paths (these are dynamic)
- [ ] Context section (Goal, Constraints, Acceptance Criteria — all dynamic)
- [ ] Task-specific effort budgets
- [ ] USER FEEDBACK GATE content and what decisions mean
- [ ] Any "single source of truth" ownership rules specific to this team

**Can be a loaded skill (optional, for teams that always use it):**
- [ ] Escalation Protocol (only needed for build teams — put in spawn-build skill)
- [ ] Scenario validation protocol (only needed for feature teams)
- [ ] AI code review checklist (only needed for review teams)

### Where to Position Content

- [ ] Behavioral summary (3-5 most critical rules) → **first 500 tokens**
- [ ] Role description → **before task list** (agents need role to claim tasks)
- [ ] Context section → **before task list** (agents need context to understand tasks)
- [ ] Task list → **middle** (agents read it to claim work, refer back repeatedly)
- [ ] Full protocol detail → **end** (reference during session, not initial setup)
- [ ] Effort budget hints → **in each task description** (where they're needed)

### When to Use External Memory vs Conversation Context

| Store in | Use for |
|---|---|
| TaskUpdate description | Progress notes, decisions made, files modified, remaining work |
| Output file (task-N-role.md) | Final task output, analysis, recommendations |
| Conversation context | Active reasoning, tool call results being processed right now |
| Team README | Team metadata, artifact list, pipeline links |
| CLAUDE.md | Universal rules that apply to all teams, always |

**Rule of thumb:** If information needs to survive context compaction or be readable by another teammate, it goes in a file or TaskUpdate. If it's ephemeral working memory for the current turn, conversation context is fine.

### Checklist: Before Adding a New Protocol Block

- [ ] Does this rule need to be in every spawn? If not, make it mode-specific
- [ ] Is this rule already covered by CLAUDE.md auto-loading? If yes, don't duplicate it
- [ ] Does this rule have a corresponding few-shot example showing correct behavior?
- [ ] Is this rule in the first 500 tokens (if it's a high-failure-cost behavior)?
- [ ] Does this rule have a clear failure mode description? (Why does it matter if violated?)
- [ ] Can this rule be expressed as a positive behavior rather than a prohibition?

### Checklist: Token Budget Audit

Before finalizing a spawn prompt:
- [ ] Count protocol overhead tokens (target: under 800 tokens total for protocol blocks)
- [ ] Check for duplicated rules (same rule appearing in 2+ blocks)
- [ ] Check if any universal rules in protocol blocks are already in CLAUDE.md
- [ ] Verify each task description includes effort budget hint
- [ ] Verify task output filenames are specified in task descriptions

---

## Implementation Priority

| Recommendation | Effort | Impact | Do First? |
|---|---|---|---|
| Add few-shot examples to protocol blocks | Low | High (11%→75% compliance) | Yes |
| Move behavioral summary to prompt start | Low | High (30% degradation fix) | Yes |
| Move universal rules to CLAUDE.md | Medium | High (1,500 tokens/spawn saved) | Yes |
| Add effort budgets to task descriptions | Low | Medium | Yes |
| Restructure full prompt order | Medium | Medium | After above |
| Add context engineering checklist to docs | Low | Medium (future authoring) | After above |
