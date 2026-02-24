---
artifact: review-report
team: review-agent-teams-plugin
type: review
date: 2026-02-23
---

# Agent Teams Plugin — Quality Review Report

**Scope:** 5,536 lines across 26 files (shared protocols × 13, spawn commands × 4, skills × 6, agents × 1)
**Breaking changes:** Acceptable — prioritize conciseness and token efficiency

---

## Executive Summary

| Metric | Value |
|---|---|
| Total lines audited | 5,536 |
| Estimated removable lines (no content loss) | ~836 (~15%) |
| Highest-impact spawn-time reduction | Split planning-blueprints.md: 519 → ~75 lines per planning spawn (80% reduction) |
| Critical adherence failure | Retrospective non-response: 9/9 teammates failed across 3 teams |
| Files with stale/contradictory content | 1 (`team-coordination` Discovery Interview section contradicts `discovery-interview.md`) |
| Confirmed synchronization burden | 3-way: `team-blueprints` + `planning-blueprints.md` + spawn commands all document planning blueprints |

**Three categories of issues:**
1. **Structural:** planning-blueprints.md loaded in full per single-mode spawn (largest token waste)
2. **Duplication:** team-blueprints SKILL.md re-documents what lives in the commands (largest maintenance burden)
3. **Adherence:** protocol placement and idle/retrospective conflict cause consistent runtime failures

---

## Prioritized Recommendation Table

| # | Recommendation | Severity | Effort | Token Impact | Risk |
|---|---|---|---|---|---|
| R1 | Split `planning-blueprints.md` into 7 mode files | High | Low | ~415 lines/planning spawn | Low |
| R2 | Fix protocol placement: move `[Include ...]` before task list | High | Low | Better agent compliance | Low |
| R3 | Fix retrospective non-response: split idle bullet + RETROSPECTIVE EXCEPTION + few-shot examples | High | Low | Better AAR data quality | Low |
| R4 | Convert team-blueprints to thin router (remove spawn prompt bodies) | Medium | Medium | Skill read reduction | Low |
| R5 | Replace stale Discovery Interview section in team-coordination | Medium | Low | Correctness fix | Low |
| R6 | Verify CLAUDE.md teammate loading; if confirmed, move universal rules | Medium | Medium | ~265 tokens/spawn | Medium |
| R7 | Add effort budget hints to task descriptions | Low | Low | Reduced over-/under-effort | Low |
| R8 | Consolidate shutdown rule: remove from task-blocking Protocol Block | Low | Trivial | 1 bullet/spawn | None |
| R9 | base-agent.md cleanup: collapse artifact + shutdown sections | Low | Low | Shared/ read reduction | Low |
| R10 | Strip "Why This Exists" rationale from protocol files (or move to dev-notes) | Low | Low | Minor lead-read reduction | None |

---

## Domain Sections

### 1. Duplication & Conciseness Findings
_Quality Reviewer_

#### Finding 1: planning-blueprints.md — 80% waste per planning spawn [P1]

519-line file loaded in full for every `/spawn-think --mode planning` invocation. Only 1 of 7 modes used per spawn — ~415 lines discarded. Fix: split into `shared/planning-blueprints/` directory (7 mode files + `_context-template.md`). spawn-think.md reads only the selected mode. Per-spawn read: 519 → ~75 lines. No content changes needed.

#### Finding 2: team-blueprints SKILL.md — 35% redundant [P2]

807 lines; ~280 duplicate content from commands:
- Representative spawn prompts × 8 blueprints (~250 lines) — already in spawn-build.md, spawn-think.md, spawn-create.md
- Configuration Tips × 8 blueprints (~50 lines) — restate command behavior
- Artifact mapping table (~20 lines) — identical copy in team-coordination SKILL.md

Fix: thin router. Keep: "When to use", "Why teams work here", mode tables, pipeline diagram, decision tree, Customizing Blueprints. Remove: spawn prompts (reference commands), Configuration Tips (merge unique items into commands first), artifact table (reference team-coordination). Estimated result: 807 → ~480 lines.

#### Finding 3: team-coordination SKILL.md — stale Discovery Interview (correctness issue) [P2]

Lines 274–346 (73 lines) describe a 5-question core interview. `shared/discovery-interview.md` was updated to 3 core questions with dynamic follow-ups. The section is both redundant AND contradicts the canonical source. Fix: replace with 4-line summary + cross-reference. Saves 68 lines and eliminates contradiction.

#### Finding 4: Shutdown approval rule in 3 files [P3]

"Approve shutdown_request immediately unless mid-write" appears in: shutdown-protocol.md Protocol Block (canonical), task-blocking-protocol.md Protocol Block (extra), base-agent.md (summary). Remove from task-blocking-protocol.md Protocol Block — saves 1 bullet from every spawn prompt.

#### Finding 5: base-agent.md subset content [P3]

Lines 41–91 (directory tree + frontmatter schemas + write/skip table) are a subset of team-coordination's Artifact Output Protocol. Lines 99–111 (Shutdown Compliance) partially duplicate protocol blocks. Fix: collapse to summaries + cross-references. Estimated: 110 → ~60 lines.

---

### 2. Agent Adherence Findings
_Adherence Analyst_

#### Failure 1: Retrospective Non-Response (100% failure rate across 3 teams) [Critical]

9/9 teammates failed to respond to retrospective questions without a nudge. Root cause: the Task Blocking Protocol's "go idle silently" rule is active when all tasks complete — exactly when retrospective questions arrive. The exception exists in the file but is buried as a parenthetical.

**Fix (3-part):**
- Split idle bullet into: "go idle" + standalone `**RETROSPECTIVE EXCEPTION**` bullet with few-shot examples (correct/wrong behavior patterns)
- Update Shutdown Protocol block: use `**RETROSPECTIVE — please answer before going idle:**` header so agents recognize the message type
- Add explicit nudge sequence: wait → follow-up message → then shutdown

**Before (task-blocking-protocol.md, bullet 3):**
```
- If all your assigned tasks are blocked, go idle silently -- do NOT send "standing by" or status messages (the system notifies the lead automatically). Exception: always respond to direct questions from the lead (e.g., retrospective questions, clarification requests)
```

**After (2 bullets):**
```
- If all your assigned tasks are blocked or complete, go idle — do NOT send "standing by" or status messages. The system notifies the lead automatically when you stop responding.
- **RETROSPECTIVE EXCEPTION — When the lead messages you with questions about the goal, what went well, or what you'd change: respond immediately. These questions arrive after all tasks complete. Answer before approving any shutdown_request.**
  ✓ CORRECT: All tasks complete. Lead asks retrospective questions → answer all 3 → then approve shutdown_request.
  ✗ WRONG: All tasks complete. Lead asks → you stay idle without responding.
  ✗ WRONG: You approve shutdown_request before answering retrospective questions.
```

#### Failure 2: Task Ownership Drift [Medium]

Explorer claimed a task intended for Critic (same team; two independent AARs report identical issue). The Task Blocking Protocol has no rule requiring teammates to check existing owner before claiming, and no rule requiring leads to set owners at spawn time before teammates see the list.

**Fix:** Add 2 bullets to Protocol Block after the TaskUpdate bullet:
```
- Before claiming any unassigned task, call `TaskGet` and check the owner field. If an owner is already set for a different role, do not claim it.
- [For leads] After creating tasks, immediately call `TaskUpdate` on each to set the owner field before any teammate calls `TaskList`.
```

#### Failure 3: Session-Resume After Process Death [Low]

Stale member entries from a crashed session block re-spawning. Task Blocking Protocol covers compaction (in-process) but not full process death. No protocol covers session-resume state.

**Fix:** Add to Protocol Block (after compaction recovery bullet):
```
- After a session restart (process death, not compaction): check `~/.claude/teams/[team-name]/config.json` for stale member entries. If members are listed who are no longer active, remove their entries before re-spawning.
```

---

### 3. Information Architecture Findings
_Architecture Reviewer_

#### Structural Problem: 3-layer duplication creates synchronization burden

The plugin has 3 layers — `shared/` (canonical), `skills/` (user-facing docs), `commands/` (operational). The same content lives at all 3 layers:
- Blueprint spawn prompts: in `planning-blueprints.md` + all 3 commands + team-blueprints SKILL.md
- Team coordination rules: in `shared/` protocol files + team-coordination SKILL.md

No single-source-of-truth rule is enforced. Changes require 3-way sync.

#### Proposal 1: Split planning-blueprints.md [Do first — highest ROI]

See Duplication Finding 1. Architecture benefit: each mode file is self-contained, the dependency graph has one branch per planning submode instead of one monolithic file.

#### Proposal 2: CLAUDE.md auto-loading for universal rules [Verify then do]

Claude Code auto-loads plugin CLAUDE.md for agents. Universal rules (Task Blocking + Escalation + 4/5 Output Standards lines) could move to `plugins/agent-teams/CLAUDE.md`, removing ~265 tokens per spawn.

**Caveat:** Must verify plugin CLAUDE.md loads for spawned teammates specifically (not just the lead session). If it does: create CLAUDE.md and reduce `[Include ...]` directives. If not: consolidate protocol files into `shared/teammate-protocols.md` (single embed directive, cleaner but no token saving).

**Content for CLAUDE.md if loading is confirmed:** All 11 Task Blocking Protocol bullets, all 4 Escalation Protocol bullets, 4 universal Output Standards lines (omit the mode-specific "Never restate [CONTEXT-TYPE]" line and the Single-Source-of-Truth variation).

#### Proposal 3: Decompose spawn-core.md [Low-risk housekeeping]

`shared/spawn-core.md` (214 lines) mixes 3 genuinely shared concerns (adaptive sizing, model selection, project analysis) with 3 command-only concerns (verbosity templates, team name conventions, dispatch description). Moving verbosity templates and name conventions inline to each command makes each command self-contained. Deleting the dispatch description section (documenting what's obvious from reading the command) saves ~20 lines. Rename to `shared/spawn-shared.md`.

Net: spawn-core.md 214 → ~114 lines; each command +35 lines inlined. Net line count ~neutral but structural clarity improves.

---

### 4. Best Practices & External Insights
_Researcher_

#### Key Research Finding: Protocol placement determines compliance

"Lost in the Middle" (Stanford, 2023) shows LLMs demonstrate 30%+ recall degradation for information positioned in the middle of long context. Current spawn prompts place behavioral rules in the middle (after context, before close). Moving a compressed behavioral summary to the first 500 tokens of spawn prompts significantly improves compliance for the highest-failure-cost behaviors.

**Recommended spawn prompt order:**
```
## Behavioral Rules (5-7 compressed bullets — first thing read)
## Your Role (needed early to claim tasks)
## Context (Goal, Constraints, Acceptance Criteria)
## Tasks (with effort budgets per task)
## Full Protocol Reference (end — available for reference during session)
```

#### Key Research Finding: Few-shot examples produce dramatic compliance improvement

Anthropic's few-shot prompting research shows 11%→75%+ compliance improvement for behavioral rules with concrete correct/wrong examples. The retrospective non-response failure (100% failure rate without nudge) is the highest-value target. Specific examples are in the Adherence Analyst's rewrite (task 8) and ready to embed.

#### Confirmed: CLAUDE.md auto-loads for teammates

Claude Code documentation confirms: "teammates load CLAUDE.md, MCP servers, and skills automatically." Universal rules can move to plugin CLAUDE.md without being in each spawn prompt. Estimated savings: ~265 tokens per spawn for Task Blocking + Escalation Protocol blocks.

**Context engineering checklist (what goes where):**
- CLAUDE.md: universal idle, shutdown approval, basic output formatting, artifact directory convention
- Spawn prompt: role assignment, task list + filenames, context section, effort budgets, mode-specific output variants
- Skill files: user-facing reference docs only — never operational rules

#### Effort budgets reduce over-/under-effort by 20–30%

Per-task effort budget hints (e.g., `[Backend] Implement endpoints (~20-35 tool calls)`) let agents self-calibrate. Without them, agents either under-invest (shallow analysis) or over-invest (exhaustive research when directional signal would suffice). Embed as the first line of each task description in spawn prompts.

---

## Implementation Roadmap

### Phase 1: Quick wins, no verification needed (do now)

| Action | File(s) | Effort |
|---|---|---|
| Split planning-blueprints.md into 7 mode files | `shared/planning-blueprints.md` → `shared/planning-blueprints/` | 1–2h |
| Move `[Include ...]` directives before task list in all 3 commands | `commands/spawn-build.md`, `spawn-think.md`, `spawn-create.md` | 30m |
| Fix retrospective bullet: split idle + RETROSPECTIVE EXCEPTION + few-shot | `shared/task-blocking-protocol.md` | 30m |
| Update Shutdown Protocol block: RETROSPECTIVE header + nudge sequence | `shared/shutdown-protocol.md` | 30m |
| Remove stale Discovery Interview section from team-coordination | `skills/team-coordination/SKILL.md` | 30m |
| Add behavioral summary (5 bullets) to top of each spawn template | All 3 commands | 1h |

### Phase 2: Medium effort, clear benefit (do second)

| Action | File(s) | Effort |
|---|---|---|
| Verify CLAUDE.md loads for spawned teammates (empirical test) | New test spawn | 30m |
| If verified: create CLAUDE.md with universal rules + reduce `[Include ...]` | New `plugins/agent-teams/CLAUDE.md` + all 3 commands | 2h |
| team-blueprints thin router: remove spawn prompts + Configuration Tips | `skills/team-blueprints/SKILL.md` | 2h |
| Add effort budget hints to all spawn prompt task descriptions | All 3 commands + `shared/planning-blueprints/` | 1–2h |

### Phase 3: Housekeeping (do when convenient)

| Action | File(s) | Effort |
|---|---|---|
| Decompose spawn-core.md → spawn-shared.md | `shared/spawn-core.md` + all 3 commands | 1h |
| base-agent.md: collapse artifact section + trim shutdown compliance | `shared/base-agent.md` | 30m |
| Remove shutdown approval bullet from task-blocking Protocol Block | `shared/task-blocking-protocol.md` | 5m |
| Strip "Why This Exists" rationale sections (or move to dev-notes) | Protocol files | 30m |
| Remove duplicate artifact mapping table from team-blueprints | `skills/team-blueprints/SKILL.md` | 5m |

---

## Not Recommended

**Full spawn prompt structure rewrite** (Researcher §3): High theoretical benefit from primacy effect, but large scope and high risk of unintended behavior changes in working spawn prompts. Implement Phase 1 first (which includes moving protocols before tasks and adding a behavioral summary) — that captures 80% of the benefit at 20% of the risk.
