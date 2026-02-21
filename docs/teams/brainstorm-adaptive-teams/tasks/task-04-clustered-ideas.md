# Task 4: Clustered Ideas for Agent-Teams Plugin Redesign

**Total ideas collected:** 20 (10 visionary, 10 realist)
**After deduplication:** 15 distinct ideas
**Clusters formed:** 5

---

## Deduplication Notes

Merged pairs (both brainwriters converged on same core idea):
- Visionary #1 (Single /spawn) + Realist #1 (Merge 8→3 commands) → **Cluster A**
- Visionary #5 (Team Skeletons) + Realist #5 (Role Inheritance) → **Cluster B**
- Visionary #6 (NLP Classification) + Realist #3 (Complexity Classifier) → **Cluster C**
- Visionary #8 (Token Budget as spawn param) + Realist #4 (Token Budget Manifest) → **Cluster D**
- Visionary #3 (XS-XL Tiers) + Realist #6 (Adaptive Sizing from subtask count) → **Cluster A** (sizing sub-theme)
- Realist #2 (Shared Protocol Include) is the concrete implementation of Visionary #5 skeleton idea → **Cluster B**
- Realist #8 (3-core discovery) + Visionary #6 (ditch interviews) → both in **Cluster C**

---

## Cluster A: Command & UX Consolidation

**Theme:** Fewer spawn commands, smarter routing — eliminate choice paralysis at the entry point.

| Idea | Source | Summary |
|------|--------|---------|
| Single `/spawn` with smart routing | Visionary #1 | One command, freeform description, auto-classifies intent |
| Merge 8→3 universal commands | Realist #1 | `spawn-build`, `spawn-think`, `spawn-create` with sub-type flags |
| XS/S/M/L/XL team size tiers | Visionary #3 | T-shirt sizing auto-mapped from task complexity |
| Adaptive team size from subtask count | Realist #6 | Post-discovery subtask count drives team roster, user approves |
| Output verbosity flag | Realist #7 | `--verbosity quiet/normal/verbose` — most small tasks want Quiet |

**Convergence signal:** Both brainwriters independently targeted the spawn UX as the highest-friction point. Realist's 3-command approach is a pragmatic midpoint between 8 commands and 1.

---

## Cluster B: DRY Architecture (Eliminate Duplication)

**Theme:** Extract shared boilerplate, define once, reference everywhere — reduce per-file content and maintenance burden.

| Idea | Source | Summary |
|------|--------|---------|
| Team Skeletons / Shared Protocol Layer | Visionary #5 | Single inherited file for Task Blocking Protocol + output standards |
| Shared Protocol Include directive | Realist #2 | `{{include shared/task-blocking-protocol.md}}` — update once, applies everywhere |
| Role Inheritance (base + extension) | Realist #5 | `base-agent.md` with delta files per role, cuts per-file content ~40% |
| Centralized Persona Library | Visionary #9 | All personas in `skills/team-personas/`, referenced by name not embedded |

**Convergence signal:** Strongest convergence of the session — both brainwriters identified context duplication as a core structural problem with near-identical solutions.

---

## Cluster C: Smart Discovery & Routing

**Theme:** Replace verbose discovery interviews with lightweight, automated complexity classification.

| Idea | Source | Summary |
|------|--------|---------|
| NLP Classification replaces interviews | Visionary #6 | One NLP pass over task + codebase scan → "team card" for approval |
| Complexity Classifier pre-spawn hook | Realist #3 | 2-3 questions → low/medium/high → solo/pair/full team |
| Unified discovery (3 core + 0-2 optional) | Realist #8 | Always: goal, constraints, success criteria. Then stop. |
| Model tier auto-selection by phase | Realist #10 | Haiku for discovery, Sonnet for execution, Opus for synthesis |
| Token budget as primary spawn dial | Visionary #8 | `--budget tight` → auto-selects model, suppresses interview, bullet output |

**Convergence signal:** Both brainwriters targeted the discovery interview as a key friction source. Realist's 3-question template is immediately actionable; Visionary's NLP classification is the aspirational end state.

---

## Cluster D: Token Economics & Model Selection

**Theme:** Make cost explicit, auto-select models by complexity, enforce budgets at spawn time.

| Idea | Source | Summary |
|------|--------|---------|
| Token budget manifest per team | Realist #4 | Declared `token_budget` block in blueprint, enforced at spawn |
| Token budget as first-class param | Visionary #8 | (also in Cluster C) `--budget` flag drives all downstream decisions |
| Model tier auto-selection by phase | Realist #10 | (also in Cluster C) Phase-tagged task assignments select model tier |
| Async parallel brainwriting + collision detection | Visionary #7 | Parallelize ideation, auto-dedup before clustering |

**Note:** Visionary #8 and Realist #10 bridge Clusters C and D — token budget and model selection are the mechanism by which smart routing is implemented.

---

## Cluster E: Adaptive & Learning Systems

**Theme:** Teams that evolve mid-session or across sessions — dynamic composition, feedback loops.

| Idea | Source | Summary |
|------|--------|---------|
| Adaptive mid-session team morphing | Visionary #4 | Spawn/dissolve specialists inline without restarting session |
| Genome-style composable team DNA | Visionary #2 | Teams assembled from modular persona "genes" on the fly |
| Team reputation / learning system | Visionary #10 | Track which team types perform well per task category, weight auto-selection |
| Pipeline artifact schema validation | Realist #9 | YAML frontmatter schema on handoff artifacts, fail fast on drift |

**Note:** These are the most visionary ideas with lowest immediate feasibility. Reputation system requires persistent state; mid-session morphing requires new infrastructure. Pipeline schema validation (Realist #9) is the most grounded idea in this cluster.

---

## Summary

| Cluster | Ideas | Convergence | Implementation Horizon |
|---------|-------|-------------|----------------------|
| A: Command & UX Consolidation | 5 | High | Near-term |
| B: DRY Architecture | 4 | Very High | Near-term |
| C: Smart Discovery & Routing | 5 | High | Near-to-mid term |
| D: Token Economics | 4 | Medium | Mid-term |
| E: Adaptive & Learning | 4 | Low | Long-term / aspirational |

**Total distinct ideas:** 15
**Strongest convergence:** Cluster B (both brainwriters identified identical structural solution)
**Highest user impact:** Cluster A (directly eliminates the choice paralysis pain point)
**Best token ROI:** Cluster D (directly addresses PRIMARY design goal)
