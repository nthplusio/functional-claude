---
task: 8
title: "Architecture Review — agent-teams v0.15.0"
owner: architecture-reviewer
team: review-agent-teams-v015
date: 2026-02-20
---

# Architecture Review: agent-teams v0.15.0

## Verdict

The refactoring is structurally sound. The 3-tier approach achieves its goals with two notable weaknesses: dispatch-by-reference rather than by execution creates fragile unified commands, and the protocol blocks remain duplicated in spawn prompts despite centralization in shared/.

---

## 1. shared/ Abstraction Quality

**Assessment: Good abstraction, incomplete deduplication.**

The 6 shared/ files correctly identify the 6 cross-cutting concerns that were inline across 8 commands:

| File | Purpose | Quality |
|---|---|---|
| `task-blocking-protocol.md` | 7-rule canonical protocol block | Good — clear "why this exists" rationale |
| `output-standard.md` | Verbosity and artifact standards | Good — lookup tables are precise |
| `prerequisites-check.md` | Env var + argument check | Good — simple, well-specified |
| `discovery-interview.md` | 3-core + 2-optional interview pattern | Good — adaptive skip logic is well-defined |
| `spawn-core.md` | Adaptive sizing, model selection, verbosity, team naming | Good — consolidates 4 distinct mechanisms |
| `base-agent.md` | Communication defaults, artifact structure, shutdown | Good — but partially redundant with task-blocking-protocol.md |

**The deduplication gap:** Unified commands still embed the full protocol blocks verbatim inside their spawn prompt code fences (e.g., spawn-build.md lines 167-181, 240-252). The shared/ files describe what to include but do not eliminate the need to copy it. This is architecturally correct (teammates don't inherit skill files), but the SKILL.md for team-coordination still documents the protocol inline at line 72-79 before redirecting to shared/. That inline version is now a drift risk.

**The `base-agent.md` overlap issue:** `base-agent.md` references task-blocking-protocol.md and output-standard.md for canonical content, but also restates some behaviors (shutdown compliance, communication defaults). The file's role is unclear — it reads as a "meta-reference" for spawn prompt authors, but commands don't reference it. Its value over directly reading the two canonical files is low.

---

## 2. Command Category Boundaries

**Assessment: Well-bounded for build and create; think is too broad.**

| Command | Scope | Modes | Submodes | Assessment |
|---|---|---|---|---|
| `spawn-build` | Implementation work | 2 | 0 | Clean — build/fix boundary is intuitive |
| `spawn-create` | Generative/creative work | 3 | 7 | Clean — design/brainstorm/productivity share "generative" intent |
| `spawn-think` | Analytical work | 3 | 13 | Strained — research, planning, and review have different output types and team structures |

**The spawn-think breadth problem:** Planning has 7 submodes with highly variable team compositions (3-4 teammates each, different for every submode). Review has 3 submodes with fixed reviewers. Research has 3 submodes with different teams. Lumping these under one command creates a 13-submode dispatch tree that the command cannot fully implement inline — it delegates planning submodes entirely to the legacy command via reference: "For the full team composition, task lists, and spawn prompts for each of the 7 planning submodes, reference the legacy command at `${CLAUDE_PLUGIN_ROOT}/commands/spawn-planning-team.md`" (spawn-think.md line 240). This is a thin wrapper that doesn't actually wrap — it redirects.

**spawn-build is the cleanest:** Feature vs debug is a natural split. The adversarial debug structure (3 competing hypotheses) is meaningfully distinct from the layered feature structure. The command implements both modes inline without delegation.

**spawn-create is defensible:** Design, brainstorm, and productivity share "generative" intent even though their team structures differ significantly (4 fixed, 3-5 variable, 5 fixed pipeline). The shared brainstorming diverge/converge pattern is the common thread.

---

## 3. Dispatch Pattern Scalability

**Assessment: The pattern works but has two scaling failure modes.**

The dispatch pattern (prerequisites → mode infer → interview → sizing → delegate to legacy) has a clean linear shape. Problems:

**Failure Mode 1: Delegation instead of wrapping for spawn-think planning submodes.** When the unified command cannot implement the full logic inline, it references the legacy command as canonical. This means:
- spawn-think is not self-contained for planning
- The planning team structure lives in two places (spawn-planning-team.md and referenced from spawn-think.md)
- A user reading spawn-think.md cannot understand the full planning behavior without following the reference

**Failure Mode 2: Auto-inference keyword collision risk.** The 3 commands have distinct keyword tables, but some keywords could plausibly match multiple commands:
- "design" is in spawn-create keywords but could be "architecture design" (spawn-think planning ADR)
- "process" is in spawn-create productivity keywords but could be "process planning"
- "investigate" is in spawn-build debug keywords but could be "investigate options" (spawn-think research)

The per-command keyword tables are not cross-referenced, so collisions are invisible at authoring time.

**The pattern scales to ~5 submodes per command.** Beyond that, the inline implementation either becomes too long or delegates to legacy (as spawn-think does for planning). The current count is: build=2, create=7, think=13. The think command is already over the scaling threshold.

---

## 4. Persona Registry Design

**Assessment: Sound design, limited scope.**

The registry correctly separates:
- **Catalog** — what exists, with tags and loop positions
- **Capability tags** — methodology vs role tags (well-separated)
- **Matching guide** — by team type and by capability need
- **Application pattern** — standard "read persona at path" snippet

**Strengths:**
- Capability tags enable matching without reading each persona definition
- The loop position column captures the Auditor→Compounder sequential dependency clearly
- The matching guide explicitly notes which team types do NOT use registered personas (planning, research, debug, design) and explains why — this prevents misuse

**Weaknesses:**
- Registry covers only 8 personas: the 5-loop productivity personas + 3 brainstorm personas. Ad-hoc roles (Explorer, Analyst, Critic in research; Security/Performance/Quality reviewers; Frontend/Backend/Tester) are not registered. The registry does not explain this omission.
- `Analyst` in the registry (productivity loop position 3) shares a name with `Analyst` used informally in research teams (Explorer, **Analyst**, Critic). This naming collision is invisible without cross-checking.
- The registry is a skill file (`skills/team-personas/registry.md`) but team-architect.md at step 3.5 directs the agent to read `skills/team-personas/SKILL.md` (not registry.md). This routing may cause the agent to miss the structured catalog.

---

## 5. Deprecation Strategy

**Assessment: Correct approach, missing removal timeline clarity.**

All 8 legacy commands have deprecation headers pointing to the unified replacement. The headers are consistent:
```
> **Deprecated in v0.15.0** — Use `/spawn-build --mode feature` instead. This command remains fully functional but will be removed in v1.1.0.
```

**Strengths:**
- Headers are non-breaking — commands remain functional
- Migration table in each unified command maps all legacy → unified equivalents
- Team-blueprints SKILL.md documents unified commands clearly in a "New in v0.14.0" section (version mismatch noted below)

**Weaknesses:**
- **Version mismatch in team-blueprints/SKILL.md:** The "New in v0.14.0" header (line 13 in team-blueprints/SKILL.md) should read v0.15.0, since the skill version is 0.15.0. This creates a confusing inconsistency.
- **Removal version hardcoded:** "removed in v1.1.0" is a commitment embedded in 8 files. If the timeline slips, these 8 files need updating.
- **spawn-think's incomplete implementation:** If spawn-planning-team is removed in v1.1.0, spawn-think becomes broken for planning submodes since it delegates to the legacy file for the full spawn prompt details. The delegation relationship must be resolved before removal.

---

## 6. Module Boundary Clarity

**Assessment: Good separation with one cross-boundary dependency.**

| Layer | Contents | Boundary |
|---|---|---|
| `shared/` | Protocol and pattern reference docs | Clean — read by commands only |
| `commands/` | User-invocable spawn commands | Clean — reference shared/ |
| `skills/` | Skill and blueprint docs, persona registry | Mostly clean |
| `agents/` | team-architect autonomous agent | Clean — reads skills/ and shared/ |
| `references/` | Per-persona markdown files | Clean |

**The cross-boundary issue:** spawn-build.md, spawn-think.md, and spawn-create.md embed literal `${CLAUDE_PLUGIN_ROOT}/shared/...` paths in their spawn prompt text blocks. These paths are passed to spawned teammates at runtime. If the shared/ directory moves, all embedded paths in all spawn prompts break. There's no indirection layer.

**Legacy commands** embed protocol blocks inline (not by reference) — they're self-contained for backward compatibility. This is the right choice given deprecation, but it means legacy commands benefit from Tier 1 in documentation only, not in runtime behavior.

---

## Key Findings Summary

| Area | Rating | Issue |
|---|---|---|
| shared/ abstraction | Good | Protocol blocks still embedded verbatim in spawn prompts (intentional but creates drift risk in SKILL.md) |
| Command boundaries | Good | spawn-think's 13 submodes stretch the dispatch pattern; planning delegation is incomplete |
| Dispatch pattern | Good | Delegation to legacy for spawn-think planning is a fragility; keyword collision not cross-referenced |
| Persona registry | Good | Analyst name collision; ad-hoc roles not explained; routing to registry.md vs SKILL.md inconsistency |
| Deprecation | Good | "New in v0.14.0" version mismatch; spawn-think delegation must be resolved before v1.1.0 removal |
| Module boundaries | Good | `${CLAUDE_PLUGIN_ROOT}` path embedding in spawn prompts creates tight coupling to directory structure |

## Recommended Actions (Priority Order)

1. **[High] Resolve spawn-think planning delegation before v1.1.0 removal.** Either inline all 7 planning submode spawn prompts into spawn-think.md, or extract them into standalone files that spawn-think and spawn-planning-team both reference.

2. **[Medium] Fix "New in v0.14.0" in team-blueprints/SKILL.md** — should be v0.15.0.

3. **[Medium] Clarify base-agent.md's role or remove it.** It's referenced in shared/ documentation but not referenced by any command. If it's guidance for spawn prompt authors, add a header saying so. If it's superseded by task-blocking-protocol.md + output-standard.md, remove it.

4. **[Medium] Cross-reference keyword tables across commands** to detect and resolve collision cases before they cause runtime mode-inference errors.

5. **[Low] Add an "Ad-hoc roles" section to the persona registry** explaining why Explorer, Critic, Frontend, Backend, etc. are not registered personas, and when to use them vs registered personas.

6. **[Low] Route team-architect agent to registry.md** (not just SKILL.md) at step 3.5, since registry.md is the actual catalog with capability tags.
