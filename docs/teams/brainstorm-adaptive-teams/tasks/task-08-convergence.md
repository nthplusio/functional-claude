# Task 8: Convergence — Ranked Recommendations

**Evaluation criteria:**
1. Token budget impact (PRIMARY)
2. Choice paralysis reduction
3. Duplication elimination
4. Feasibility / implementation risk
5. Alignment with constraints (keep persona system, 3 commands, no NLP)

---

## Scoring Matrix

Each idea scored 1-3 per criterion (3 = high impact/low risk).

| ID | Idea | Token Budget | Paralysis | Duplication | Feasibility | Alignment | **Total** |
|----|------|-------------|-----------|-------------|-------------|-----------|-----------|
| B1 | Shared Protocol Include | 2 | 1 | 3 | 3 | 3 | **12** |
| D1 | Token Budget Manifest | 3 | 2 | 1 | 3 | 3 | **12** |
| A1s | 3 Commands as wrappers (stepping stone) | 1 | 3 | 1 | 3 | 3 | **11** |
| C1 | 3-Core Discovery Questions | 2 | 2 | 2 | 3 | 3 | **12** |
| A3 | Verbosity Flag | 2 | 2 | 1 | 3 | 3 | **11** |
| A2 | Adaptive Team Sizing | 2 | 2 | 1 | 3 | 3 | **11** |
| C2s | Haiku for Discovery (stepping stone) | 3 | 1 | 1 | 3 | 3 | **11** |
| B2s | Base Agent stepping stone | 1 | 1 | 3 | 3 | 3 | **11** |
| A1f | Blueprint consolidation (full) | 1 | 3 | 2 | 2 | 3 | **11** |
| B2f | Role file refactoring (full) | 1 | 1 | 3 | 2 | 3 | **10** |
| B3 | Centralized Persona Library | 2 | 1 | 3 | 2 | 3 | **11** |
| C2f | Phase-tagged model selection (full) | 3 | 1 | 2 | 2 | 3 | **11** |
| D2 | Artifact Schema Validation | 1 | 1 | 2 | 2 | 3 | **9** |

---

## Ranked Recommendations

### Tier 1: Ship First — High impact, low risk, S-effort

**#1 — B1: Shared Protocol Include** (Score: 12)
- Extract Task Blocking Protocol to `shared/task-blocking-protocol.md`, replace all verbatim copies
- Zero behavioral change, immediate maintenance payoff
- Prerequisite for everything in Cluster B
- *Trade-off:* Include directive support uncertain; lint-hook fallback captures 80% of benefit regardless

**#2 — D1: Token Budget Manifest** (Score: 12)
- Add `token_budget` YAML block to each spawn command with defaults per tier
- Makes token economics visible and enforceable; directly hits PRIMARY constraint
- Standalone — no dependencies
- *Trade-off:* Agents may ignore directives; mitigation is explicit per-agent system prompt target

**#3 — C1: 3-Core Discovery Questions** (Score: 12)
- Lock all discovery to: goal, constraints, success criteria + 0-2 keyword-triggered optionals
- Eliminates the 3-10 question variance; XS tasks skip entirely
- Simple string-match keyword routing (not NLP — stays within constraints)
- *Trade-off:* May be insufficient for genuinely complex tasks; `verbose` mode escape hatch

### Tier 2: Ship Second — Medium effort, high structural value

**#4 — A1 (stepping stone): 3 Commands as Thin Wrappers** (Score: 11)
- `spawn-build`, `spawn-think`, `spawn-create` wrap existing blueprints
- Users get simplified UX immediately; blueprint consolidation is deferred
- *Trade-off:* Blueprint intent classification (8→3) requires mapping table + user validation before full consolidation

**#5 — C2 (stepping stone): Haiku for Discovery Phase** (Score: 11)
- Apply Haiku model to all discovery/planning phases across all teams
- Biggest token savings with lowest execution risk (discovery is structured extraction, not reasoning)
- *Trade-off:* Phase boundaries occasionally ambiguous; default to Sonnet when uncertain

**#6 — A3: Verbosity Flag** (Score: 11)
- `--quiet` suppresses intermediate output, surfaces final deliverable only
- Directly addresses "verbose output" pain point for small tasks
- *Trade-off:* Agents may not honor the directive reliably; requires testing

**#7 — A2: Adaptive Team Sizing** (Score: 11)
- Post-discovery subtask count drives roster size (1-3 → pair, 4-6 → small, 7+ → full)
- Eliminates "heavy team for small task" structurally; user approves roster
- *Trade-off:* Requires subtask listing as a discovery output; add to C1 template

### Tier 3: Ship Third — Higher effort, foundational for future evolution

**#8 — B2/B3: Base Agent + Persona Library** (Score: 10-11)
- `base-agent.md` with delta role files; centralized persona registry with capability tags
- Cuts per-file content ~40%, enables future dynamic composition (Cluster E)
- *Trade-off:* Behavioral regression risk during migration; requires before/after validation per role

**#9 — A1 (full): Blueprint Consolidation** (Score: 11)
- Merge 8 blueprints into 3 manifest-driven spawn commands
- With Visionary's Component Manifest model: each command becomes ~10 lines of YAML
- *Trade-off:* Highest restructuring effort; step 4 stepping stone validates the approach first

**#10 — C2 (full): Phase-Tagged Model Selection** (Score: 11)
- Full phase ladder: Haiku (discovery) → Sonnet (execution) → Opus (synthesis) declared in manifests
- Requires D1 (budget manifest) to exist as the config home
- *Trade-off:* Phase tagging adds overhead to task assignment templates

**#11 — D2: Artifact Schema Validation** (Score: 9)
- YAML frontmatter schema on pipeline handoff artifacts, validation pre-task hook
- Addresses context drift between agents; lowest urgency relative to other items
- *Trade-off:* Adds authoring friction; keep required fields minimal (4 max)

---

## Key Tensions

| Tension | Description | Recommended Resolution |
|---------|-------------|----------------------|
| Token savings vs output quality | Haiku for discovery is cheaper but may miss nuance | Use Haiku only for structured Q&A (discovery); never for synthesis |
| Simplicity vs flexibility | 3 commands cover 80% of cases; edge cases need flags | Ship stepping stone first, add flags incrementally as gaps emerge |
| DRY architecture vs migration risk | Refactoring role files can introduce behavioral drift | Before/after system prompt diff for one role before batch migration |
| Schema validation vs authoring speed | Frontmatter adds friction to fast artifact writing | Minimum viable schema (4 fields); never validate optional fields |
| Budget enforcement vs agent autonomy | Agents may ignore token targets in system prompts | Make target explicit in each agent's prompt; facilitator announces budget at session start |

---

## Architecture Proposal (Top Idea Synthesis)

The top recommendations converge on a single coherent architecture:

```
plugins/agent-teams/
├── commands/
│   ├── spawn-build.md      # ~10 lines: intent + manifest ref
│   ├── spawn-think.md      # ~10 lines: intent + manifest ref
│   └── spawn-create.md     # ~10 lines: intent + manifest ref
├── shared/
│   ├── spawn-core.md       # discovery template, sizing rules, budget defaults
│   ├── task-blocking-protocol.md   # single source of truth
│   ├── base-agent.md       # universal behaviors delta
│   └── output-standard.md # output format standards
└── skills/team-personas/
    ├── visionary.md        # role delta only + capability tags
    ├── realist.md
    ├── facilitator.md
    └── [others]
```

**Data flow for a typical spawn:**
```
User: /spawn-think --budget m "monorepo migration strategy?"

1. spawn-think.md reads manifest → intent=think, budget=m → size=M
2. spawn-core.md loads: shared protocol, 3-core discovery, Sonnet model
3. Discovery (3 questions): goal, constraints, success criteria
4. Subtask count → team size confirmed: 3 agents (visionary + realist + facilitator)
5. Execution: agents work in parallel within budget envelope
6. Output: concise artifact to docs/teams/ with YAML frontmatter
```

**What this eliminates:**
- 8 blueprints × 200-400 lines = ~2,400 lines → 3 manifests × 10 lines = 30 lines + ~400 lines shared
- Task Blocking Protocol duplication (currently 8 copies → 1)
- Choice paralysis (8+ spawn commands → 3)
- Discovery interview variance (3-10 questions → 3 fixed + 0-2 optional)
- Heavy teams for small tasks (adaptive sizing + budget flag)

**Cluster E future path:** Once commands are manifests (data not prose), dynamic team composition becomes implementable. The persona registry with capability tags is the bridge — teams already select personas by capability; the next step is doing it automatically based on task signals.
