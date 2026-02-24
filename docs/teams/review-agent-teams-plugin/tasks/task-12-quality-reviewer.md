---
task: 12
title: "Duplication & Conciseness Findings — section for final review report"
owner: quality-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Duplication & Conciseness Findings

_Quality Reviewer domain section for the final report. Cross-references: Protocol placement and CLAUDE.md approach are in "Information Architecture Findings" (Architecture Reviewer) and "Best Practices & External Insights" (Researcher). Adherence impact of these issues is in "Agent Adherence Findings" (Adherence Analyst)._

---

## Scope

5,536 lines across 26 files. This section covers: shared protocol files (2,118 lines), spawn commands (1,031 lines), skills (2,072 lines), agents (195 lines). Focus: redundant content that wastes tokens or creates maintenance debt.

---

## Finding 1: planning-blueprints.md is read in full for single-mode spawns

**Severity: High — spawn-time token waste on every planning invocation**

`shared/planning-blueprints.md` (519 lines) is read in full for every `/spawn-think --mode planning` invocation. Only one of 7 modes is used per spawn. ~415 lines (~80%) are loaded and discarded.

**Root cause:** The file stores all 7 mode blueprints in a single file. spawn-think.md references the entire file with a single directive.

**Fix:** Split into 7 mode files under `shared/planning-blueprints/` plus a shared context template. spawn-think.md reads only the selected mode file. Per-spawn read drops from 519 → ~75 lines (selected mode + context template). No content changes required — pure structural split.

**Effort:** Low. Risk: Low.

---

## Finding 2: team-blueprints SKILL.md contains duplicate spawn prompt bodies (~35% redundant)

**Severity: Medium — skill read waste, not spawn-time**

807-line file. Approximately 280 lines duplicate content from the actual spawn commands and planning-blueprints.md:

| Redundant content | Est. lines | Duplicates |
|---|---|---|
| Representative spawn prompts (8 blueprints) | ~250 | spawn-build.md, spawn-think.md, spawn-create.md, planning-blueprints.md |
| Configuration Tips sections (8 blueprints) | ~50 | spawn command behavior already documented there |
| Artifact mapping table | ~20 | team-coordination SKILL.md (identical) |
| "Task Blocking Protocol" reference section | ~6 | Points to shared/ file — commands already do this |

**Fix:** Convert team-blueprints to a thin router. Keep: "When to use" + "Why teams work here" metadata, mode tables, Cross-Team Pipeline diagram, decision tree, Customizing Blueprints. Replace spawn prompts with command references. Remove Configuration Tips (merge unique observations into commands first). Remove artifact mapping table (reference team-coordination).

**Unique content preserved:** ~527 lines. Estimated result: 807 → ~480 lines.

---

## Finding 3: team-coordination SKILL.md contains stale Discovery Interview section

**Severity: Medium — correctness issue, not just redundancy**

`skills/team-coordination/SKILL.md` lines 274–346 (73 lines) describes a 5-question discovery interview structure ("Core Questions up to 5, always asked: 1. Objective, 2. Current state, 3. Constraints, 4. Stakeholders, 5. Success definition").

`shared/discovery-interview.md` (the authoritative source) was updated to a **3-core-question format** with dynamic follow-ups. The team-coordination section is both redundant AND incorrect — it contradicts the canonical specification.

**Fix:** Replace entire "Discovery Interview Pattern" section with a 4-line summary and cross-reference to `shared/discovery-interview.md`. Saves 68 lines, eliminates the contradiction.

**Effort:** Low. Risk: Low (the fix removes incorrect guidance).

---

## Finding 4: Shutdown approval rule appears in 3 files

**Severity: Low — minor maintenance risk**

"Approve shutdown_request immediately unless mid-write on a file" appears in:
1. `shared/shutdown-protocol.md` Protocol Block — canonical, spawn-time
2. `shared/task-blocking-protocol.md` Protocol Block — extra bullet, spawn-time
3. `shared/base-agent.md` Shutdown Compliance — human-readable summary, not spawn-embedded

Having the rule in two spawn-time protocol blocks creates maintenance risk: if the rule changes, it must be updated in both places. The shutdown protocol is the semantically correct home for this rule.

**Fix:** Remove from task-blocking-protocol.md Protocol Block (saves 1 bullet from every spawn). Keep in shutdown-protocol.md (canonical) and base-agent.md (human author reference, acceptable).

**Effort:** Trivial. Risk: None.

---

## Finding 5: base-agent.md contains subset content better located in team-coordination

**Severity: Low — maintenance debt**

`shared/base-agent.md` contains:
- Directory structure tree and frontmatter schemas (lines 41–78, 38 lines) — subset of team-coordination's Artifact Output Protocol
- Shutdown compliance (lines 99–111, 13 lines) — partially duplicated by shutdown-protocol.md Protocol Block

These sections serve plugin authors reading base-agent.md. They're not a spawn-time cost (base-agent.md is not directly embedded in spawn prompts via the standard directives).

**Fix:** Collapse artifact section to 4-line summary + cross-reference team-coordination. Trim shutdown compliance to 4 lines (remove the rules already in protocol blocks, keep the retrospective question guidance).

**Estimated reduction:** base-agent.md 110 → ~60 lines.

---

## Finding 6: "Why This Exists" rationale sections in protocol files

**Severity: Low — token waste for lead reading at spawn setup**

Four shared files contain "Why This Exists" sections explaining the purpose of the protocol to human authors:
- `task-blocking-protocol.md`: 9 lines
- `shutdown-protocol.md`: 5 lines
- `output-standard.md`: 4 lines
- `discovery-interview.md`: 4 lines

These sections are read by the lead when constructing spawn prompts but contain no spawn-time-actionable content. They explain rationale that is only useful to plugin authors.

**Fix:** Move to a plugin developer notes file (`docs/plugin-dev-notes.md` or comment blocks), or collapse to 1-line comments. Not urgent — the lead reads these files infrequently.

---

## Quantified Summary

| Finding | Lines Saved | Token Impact | Priority |
|---|---|---|---|
| F1: Split planning-blueprints.md | ~415/spawn (80% reduction) | **High — every planning spawn** | P1 |
| F2: team-blueprints thin router | ~280 (35% reduction) | Medium — skill reads only | P2 |
| F3: team-coordination stale discovery section | ~68 (+ correctness fix) | Medium — skill reads only | P2 |
| F4: Shutdown rule dedup | ~1 bullet per spawn | Low | P3 |
| F5: base-agent subset cleanup | ~50 (45% reduction) | Low — not spawn-embedded | P3 |
| F6: "Why This Exists" sections | ~22 | Low | P4 |

**Total lines removable without content loss:** ~836 lines across all files (~15% of total 5,536)

---

## What NOT to Change

The protocol blocks (task-blocking-protocol.md, output-standard.md, shutdown-protocol.md) are intentionally embedded verbatim in spawn prompts — this is correct architecture. The lead reads the source file and copies the block into the prompt. This should not be changed; the duplication is the point.

Spawn prompts that are near-identical across modes (e.g., the Research spawns for Landscape and Risk Assessment) are intentionally kept separate because they have different team compositions and task structures. These are appropriate per-mode specifications, not redundancy.
