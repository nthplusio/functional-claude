---
task: 11
title: "Cross-reference findings across all review domains"
owner: quality-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 11: Cross-Reference — Converging Findings Across All Reviewers

## High-Confidence Issues (3+ reviewers aligned)

### Issue A: Protocol blocks placed AFTER task list — behavioral rules arrive too late

**Reviewers:** Adherence Analyst (task 8, Finding 1), Researcher (task 10, §3 Optimal Prompt Structure)

**Adherence:** Protocol blocks are placed after the task list in all 3 spawn commands. An agent that starts executing on its task list may process protocol rules mid-stream or miss them.

**Researcher:** Cites "Lost in the Middle" research — rules placed in the middle of a prompt show 30%+ recall degradation. Recommends moving a compressed behavioral summary to the first 500 tokens.

**Consensus fix:** Move `[Include ...]` directives BEFORE `Create these tasks:` in all 3 commands. Add a 3-5 bullet behavioral summary at the very start of the spawn prompt above the Context section. The full protocol blocks can move to the end as reference material.

**Files affected:** `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`, `shared/task-blocking-protocol.md` (## Placement section), `shared/shutdown-protocol.md` (## Placement section)

---

### Issue B: Retrospective non-response — idle rule conflicts with shutdown phase

**Reviewers:** Adherence Analyst (task 3 root cause analysis + task 8 rewrite), Researcher (task 10 few-shot examples), Quality Reviewer (task 1, shutdown approval rule in 3 files)

**Adherence:** 9/9 teammate instances failed to respond without a nudge across 3 of 5 teams. Root cause: "go idle silently" is active exactly when retrospective questions arrive (all tasks complete). The exception exists in the file but is buried and parenthetical.

**Researcher:** Few-shot examples for retrospective compliance can raise compliance from ~0% to high rates (citing Anthropic few-shot research). Proposes specific example text.

**Quality Reviewer:** Shutdown approval rule appears in 3 separate files — consistency unclear to agents, which may depress compliance.

**Consensus fix (3-part):**
1. Split the idle bullet into "go idle" + standalone "RETROSPECTIVE EXCEPTION" bullet with few-shot examples (Adherence Analyst's rewrite + Researcher's examples)
2. Update Shutdown Protocol block to use `**RETROSPECTIVE —**` header so agents can pattern-match the question type
3. Consolidate shutdown approval rule: canonical in shutdown-protocol.md, remove from task-blocking-protocol.md Protocol Block

**Files affected:** `shared/task-blocking-protocol.md` (Protocol Block), `shared/shutdown-protocol.md` (Protocol Block)

---

### Issue C: Universal protocol blocks embedded per-spawn vs auto-loading

**Reviewers:** Architecture Reviewer (task 9, Proposal 2), Researcher (task 10, §4 Context Engineering Checklist), Quality Reviewer (task 1 — "Why This Exists" sections serve human authors not spawn logic)

**Architecture Reviewer:** CLAUDE.md auto-loading confirmed in Claude Code docs. Task Blocking + Escalation + 4 of 5 Output Standards lines are universal — moving them to CLAUDE.md removes ~265 tokens per spawn. **Caveat:** requires verification that plugin CLAUDE.md loads for spawned teammates (not just lead).

**Researcher:** Confirms CLAUDE.md approach, adds checklist for what should be in CLAUDE.md vs spawn prompt vs skill file.

**Quality Reviewer:** "Why This Exists" rationale sections in protocol files serve plugin authors, waste tokens when files are read at spawn time.

**Consensus fix:**
1. Verify CLAUDE.md loading behavior for spawned teammates (Architect's P2 caveat is the blocker)
2. If verified: create `plugins/agent-teams/CLAUDE.md` with universal rules, reduce `[Include ...]` directives in commands
3. If NOT verified: consolidate 3 shared protocol files into `shared/teammate-protocols.md` (single embed directive — no token saving, but cleaner) and strip "Why This Exists" sections from protocol files

**Files affected:** New `plugins/agent-teams/CLAUDE.md` (or `shared/teammate-protocols.md`), all 3 commands

---

### Issue D: team-blueprints SKILL.md bloat — spawn prompt bodies repeated from commands

**Reviewers:** Quality Reviewer (tasks 1, 2, 7), Architecture Reviewer (task 4 — referenced as file size issue)

**Quality Reviewer:** 807-line file contains representative spawn prompts for all 8 blueprints (~250 lines) that duplicate the actual commands. Also: Configuration Tips (~50 lines) restate command behavior, artifact mapping table (~20 lines) duplicates team-coordination.

**Architecture Reviewer:** File architecture analysis confirms team-blueprints as a primary size outlier.

**Consensus fix:** team-blueprints → thin router. Keep: "When to use" + "Why teams work here" per blueprint, mode tables, Cross-Team Pipeline diagram, decision tree, Customizing Blueprints. Remove: representative spawn prompts (→ reference commands), Configuration Tips (→ merge unique tips into commands), duplicate artifact mapping table (→ reference team-coordination).

**Estimated reduction:** 807 → ~400 lines

**Files affected:** `skills/team-blueprints/SKILL.md`

---

### Issue E: planning-blueprints.md read in full for a single-mode spawn

**Reviewers:** Architecture Reviewer (task 9, Proposal 1 — clearest token win), Quality Reviewer (task 2 — identified as spawn-time cost)

**Architecture Reviewer:** 519 lines read per planning spawn; only 1 of 7 modes is used. ~415 lines (~80%) wasted on every `/spawn-think --mode planning` invocation. Proposes splitting into 7 mode files + shared context template.

**Quality Reviewer:** Confirms the file is a primary token cost for planning spawns. spawn-think.md correctly delegates to this file — the fix is pure structural split, not content change.

**No contradictions.** Both reviewers agree this is the highest-impact structural change with the lowest risk.

**Files affected:** `shared/planning-blueprints.md` → `shared/planning-blueprints/` directory (7 files + context template), `commands/spawn-think.md` (reference change)

---

## Contradictions and Tensions

### Tension 1: Prompt structure rewrite scope

**Researcher (task 10):** Proposes comprehensive prompt restructure — behavioral summary at very top, full protocol blocks moved to end as "reference," role description before context, context before task list.

**Adherence Analyst (task 8):** Proposes simpler fix — move `[Include ...]` directives before `Create these tasks:`. Does not advocate for a full structural rewrite.

**Resolution:** These are not contradictory — they're different scope levels. The Adherence Analyst's fix addresses the immediate problem (protocol before tasks). The Researcher's full restructure is additive improvement. Recommended approach: do Adherence Analyst's fix first (low risk, clear benefit), then evaluate whether the full restructure is warranted.

---

### Tension 2: CLAUDE.md auto-loading — is it verified?

**Architecture Reviewer (task 9):** Says "confirmed from platform spec" but flags it as P2 with "requires verification that plugin CLAUDE.md loads for spawned teammates."

**Researcher (task 10):** States "auto-loading capability confirmed in Claude Code docs" and treats it as established.

**Quality Reviewer:** Did not evaluate this — outside duplication scope.

**Resolution:** These are contradictory confidence levels for the same claim. The Architecture Reviewer is more cautious and correct to flag it. Before implementing CLAUDE.md approach, test empirically with a simple probe: spawn a teammate and check whether a CLAUDE.md rule was followed. If it works, proceed. If not, use the fallback (consolidate to `shared/teammate-protocols.md`).

---

### Tension 3: task-blocking-protocol.md — add bullets vs keep short

**Adherence Analyst (task 8):** Adds 3 new bullets to the protocol block (RETROSPECTIVE EXCEPTION + 2 ownership bullets) and few-shot examples.

**Researcher (task 10):** Also adds few-shot examples, AND recommends moving the full protocol blocks to the END of the prompt as "reference material" with a compressed 3-5 bullet summary at the START.

**Quality Reviewer:** Recommends removing the shutdown approval bullet from task-blocking-protocol.md (reducing by 1 bullet).

**Resolution:** Net effect is: add ~4 bullets, remove 1 bullet, add few-shot examples. Then move the full block to the END of each spawn prompt, with a compressed 5-bullet summary at the START. The block gets LONGER in absolute terms but appears LATER — the few-shot examples are worth the token cost given the compliance evidence.

---

## Reinforcing Changes (Combined Impact)

These changes reinforce each other and should be implemented together:

**Cluster 1: Retrospective compliance (Issues A + B)**
- Move protocols before task list (Issue A)
- Split idle bullet + add RETROSPECTIVE EXCEPTION (Issue B)
- Update Shutdown Protocol block with RETROSPECTIVE header (Issue B)
Combined effect: eliminates the most common failure mode (9/9 retrospective non-response)

**Cluster 2: Spawn token reduction (Issues C + E)**
- Split planning-blueprints.md (Issue E) — confirmed savings, do first
- CLAUDE.md universal rules (Issue C) — larger savings, verify first
Combined effect: reduces per-spawn context by ~500–700 tokens for planning spawns

**Cluster 3: Skills cleanup (Issue D)**
- team-blueprints thin router
- team-coordination Discovery Interview section update (stale 5-question structure)
- Duplicate artifact mapping table removal
Combined effect: reduces skill file bloat (~400 lines), eliminates stale content that contradicts discovery-interview.md

---

## Dependencies Between Changes

| Change | Must come before |
|---|---|
| Verify CLAUDE.md teammate loading | Implementing CLAUDE.md approach |
| Split planning-blueprints.md into 7 files | Updating spawn-think.md reference |
| Update task-blocking-protocol.md Protocol Block | Updating all 3 command `[Include ...]` directives (to embed updated block) |
| team-blueprints thin router | Verifying which Configuration Tips are unique (some may need to move into commands first) |

---

## Priority Stack (for task 12 / final report)

**Tier 1 — High impact, low risk, no dependencies:**
1. Split planning-blueprints.md (clear token savings, pure structural)
2. Protocol placement fix (move `[Include ...]` before task list)
3. Retrospective non-response fix (few-shot examples + idle/exception split)

**Tier 2 — High impact, requires verification:**
4. CLAUDE.md universal rules (verify loading behavior first)
5. team-blueprints thin router (review Configuration Tips for unique content first)

**Tier 3 — Medium impact, maintenance:**
6. team-coordination Discovery Interview section (stale content fix)
7. base-agent.md cleanup (artifact section → cross-reference)
8. spawn-core.md decomposition

**Not recommended:**
- Full prompt structure rewrite (Researcher §3): high benefit in theory, but scope is large and risk of breaking working spawn prompts is non-trivial. Implement Tier 1 first, then re-evaluate.
