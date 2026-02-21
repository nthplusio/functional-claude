# Agent-Teams Plugin Redesign: Brainstorm Final Output

**Session date:** 2026-02-20
**Problem:** 8 team blueprints → choice paralysis, heavy teams for small tasks, context duplication, verbose output
**Team:** Facilitator, Visionary, Realist

---

## Brainstorm Summary

- **Total ideas generated:** 20 (10 visionary, 10 realist)
- **After deduplication:** 15 distinct ideas
- **Clusters formed:** 5 (A–E)
- **User-prioritized clusters:** A, B, C, D (full); E (aspirational only)
- **User rejections:** NLP classification (over-engineered); single `/spawn` magic routing (prefer explicit 3 commands)

---

## Ranked Recommendations

### Tier 1: Ship First (S-effort, high impact, no dependencies)

**1. B1 — Shared Protocol Include**
Extract Task Blocking Protocol to `shared/task-blocking-protocol.md`. Replace all 8 verbatim copies with a single reference. Zero behavioral change, immediate maintenance payoff. Prerequisite for all DRY architecture work.
- *Risk:* Include directive support uncertain → fallback: lint hook that warns on embedded copies
- *Effort:* S

**2. D1 — Token Budget Manifest**
Add a `token_budget` YAML block to each spawn command declaring per-agent token target, team max, and model tiers. At spawn time, facilitator announces the budget. `--budget tight` flag overrides defaults.
- Directly hits the PRIMARY design goal: token budget becomes visible and enforceable
- *Risk:* Agents may ignore directives → mitigate by embedding token target in each agent's system prompt
- *Effort:* S

**3. C1 — 3-Core Discovery Questions**
Lock all discovery to exactly 3 required questions (goal, constraints, success criteria) + 0-2 optional domain questions triggered by keyword string-match (not NLP). XS tasks skip discovery entirely.
- Eliminates 3-10 question variance; reduces user fatigue; pairs naturally with adaptive sizing
- *Risk:* Insufficient for very complex tasks → `--verbose` flag enables extended discovery as escape hatch
- *Effort:* S

### Tier 2: Ship Second (S/M-effort, structural value)

**4. A1 stepping stone — 3 Commands as Thin Wrappers**
Create `spawn-build`, `spawn-think`, `spawn-create` as thin wrappers over existing blueprints. Users get simplified UX immediately. Blueprint consolidation is deferred to Tier 3.
- Resolves choice paralysis immediately (8+ commands → 3)
- *Risk:* Blueprint classification (8→3) needs mapping table validated before full consolidation
- *Effort:* S

**5. C2 stepping stone — Haiku for Discovery Phase**
Apply Haiku model to all discovery/planning phases. Haiku is sufficient for structured Q&A; Sonnet remains default for execution. Single largest token saving with lowest execution risk.
- *Risk:* Phase boundaries occasionally ambiguous → default to Sonnet when uncertain
- *Effort:* S

**6. A3 — Verbosity Flag**
Add `--quiet` / `--normal` / `--verbose` to spawn commands. Quiet mode suppresses intermediate agent status; only final deliverable surfaces. Default: normal (current behavior).
- Directly addresses "verbose output" pain point for small tasks
- *Risk:* Agents may not reliably honor the directive → test with a small task, make directive prominent in system prompt
- *Effort:* S

**7. A2 — Adaptive Team Sizing**
After discovery, count subtasks and auto-size roster: 1-3 → solo/pair; 4-6 → small team; 7+ → full team. User approves the proposed roster before spawn.
- Eliminates heavy-team-for-small-task structurally
- *Risk:* Requires subtask listing as a discovery output → add "list subtasks" to C1 template
- *Effort:* S

### Tier 3: Ship Third (M-effort, foundational for future)

**8. B2/B3 — Base Agent + Persona Library**
Create `base-agent.md` with universal behaviors. Role files contain delta only (cuts ~40% per file). Centralize personas in registry with capability tags (`name`, `tags`, `token_weight`, `model_preference`).
- Enables future dynamic team composition (Cluster E path)
- *Risk:* Behavioral regression during migration → before/after system prompt diff for one role before batch
- *Effort:* M

**9. A1 full — Blueprint Consolidation + Component Manifests**
Merge 8 blueprints into 3 manifest-driven commands. Each command becomes ~10 lines of YAML declaring personas, discovery tier, budget, model. Everything reusable lives in `shared/`.
- Reduces ~2,400 lines of blueprint prose to ~30 lines of manifests + ~400 lines shared
- *Risk:* Highest restructuring effort → stepping stone (Tier 2) validates the approach first
- *Effort:* M

**10. C2 full — Phase-Tagged Model Selection**
Full phase ladder declared in manifests: Haiku (discovery) → Sonnet (execution) → Opus (synthesis, XL tasks only). Each task assignment includes a `phase` tag; agents select model accordingly.
- *Risk:* Phase tagging adds overhead to task assignment templates → apply to new spawn commands only
- *Effort:* M

**11. D2 — Artifact Schema Validation** *(lower priority)*
Add minimal YAML frontmatter schema (4 required fields) to pipeline handoff artifacts. Pre-task hook validates before consumption. Catches context drift as early failures.
- *Risk:* Adds authoring friction → minimum viable schema, optional fields never validated
- *Effort:* M

---

## Trade-Off Analysis

| Tension | Options | Recommendation |
|---------|---------|----------------|
| Token savings vs output quality | Haiku everywhere vs Sonnet as default | Haiku for discovery only; Sonnet/Opus for execution and synthesis |
| UX simplicity vs flexibility | 3 fixed commands vs flags and sub-types | 3 commands + `--size`, `--budget`, `--quiet` flags (explicit, not magic) |
| DRY refactor vs regression risk | Big-bang vs incremental | Stepping stones first (wrappers, base-agent draft); batch refactor in second pass |
| Token enforcement vs agent autonomy | Facilitator-only announcement vs per-agent directive | Embed token target in each agent's system prompt; facilitator announcement is redundant reinforcement |
| Discovery depth vs user fatigue | 3 fixed vs 3-10 variable | 3 core + 0-2 optional; XS skips entirely; `--verbose` unlocks extended discovery |

---

## Architecture Proposal

Target end-state after all tiers shipped:

```
plugins/agent-teams/
├── commands/
│   ├── spawn-build.md      # ~10 lines YAML manifest
│   ├── spawn-think.md      # ~10 lines YAML manifest
│   └── spawn-create.md     # ~10 lines YAML manifest
├── shared/
│   ├── spawn-core.md            # discovery template, sizing rules, budget logic
│   ├── task-blocking-protocol.md
│   ├── base-agent.md            # universal behaviors
│   └── output-standard.md
└── skills/team-personas/
    ├── visionary.md    # delta + capability tags
    ├── realist.md
    ├── facilitator.md
    └── [others]
```

**Typical spawn flow after full implementation:**
```
User: /spawn-think --budget m "monorepo migration strategy?"

1. spawn-think reads manifest → intent=think, budget=m → size=M, model=sonnet
2. spawn-core loads: shared protocol, 3-core discovery, budget announcement
3. Discovery: 3 questions (Haiku model) → subtask count → roster proposal
4. User approves: Visionary + Realist + Facilitator (3 agents)
5. Execution: parallel within budget envelope (Sonnet)
6. Output: concise artifact with YAML frontmatter → docs/teams/
```

**What this eliminates vs current state:**
| Current | After |
|---------|-------|
| 8 spawn commands | 3 commands |
| ~2,400 lines of blueprint prose | ~30 lines manifests + ~400 lines shared |
| Task Blocking Protocol × 8 copies | 1 canonical source |
| 3-10 question discovery interviews | 3 fixed + 0-2 optional |
| Heavy teams for small tasks | Adaptive sizing from subtask count |
| Hardcoded Sonnet everywhere | Haiku → Sonnet → Opus phase ladder |
| Verbose output by default | `--quiet` flag suppresses intermediates |

---

## Cluster E: Aspirational Future Vision

Once commands are manifests (data, not prose), the path to dynamic team composition opens:
- **Genome-style composition:** teams assembled from persona capability tags at runtime
- **Mid-session morphing:** spawn/dissolve specialists inline when blockers emerge
- **Reputation system:** track team performance per task category; weight auto-selection over time

The persona registry with capability tags (Tier 3, B3) is the prerequisite. No additional infrastructure needed beyond what Tiers 1-3 deliver.

---

## Recommended Next Steps

1. **Start immediately:** B1 (shared protocol extract) — one file, no risk, unblocks everything
2. **Ship together as v1:** D1 + C1 + A1 stepping stone — visible token budget + streamlined discovery + 3 commands
3. **Validate with a real task:** Run a small task through the new 3-command surface with `--quiet` and `--budget tight` before proceeding to Tier 3
4. **Tier 3 gate:** Map all 8 existing blueprints to the 3 intent categories and get user sign-off on the mapping before full consolidation
