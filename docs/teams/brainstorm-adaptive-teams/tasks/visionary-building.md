# Visionary Building Phase — Task 6

**Author:** Visionary (Divergent Thinker)
**Phase:** Building — amplify, combine, extend prioritized ideas
**Binding constraints from user feedback:**
- 3 explicit commands (`spawn-build`, `spawn-think`, `spawn-create`) — NOT a single magic `/spawn`
- NLP auto-classification REJECTED — keep routing explicit and user-controlled
- Cluster E: aspirational only — referenced at end, no implementation detail

---

## Cluster A: Command & UX Consolidation — Enhanced

### Original ideas
Three explicit commands + XS-XL sizing tiers + verbosity flag.

### Enhancement: Sub-type flags as the scalability mechanism

The 3-command structure is the right call — explicit > magic. But the real power comes from sub-type flags that let each command cover its full range without spawning new top-level commands:

```
spawn-build --size xs "fix typo in README"          → 1 agent, Haiku, no discovery
spawn-build --size xl "refactor auth module"         → 4 agents, Sonnet, full discovery
spawn-think --mode quick "which DB engine?"          → 2 agents, tight budget
spawn-think --mode deep "architecture for new API"   → 5 agents, Sonnet + Opus synthesis
spawn-create --type docs "write migration guide"     → writer + reviewer pair
spawn-create --type design "design token system"     → full creative team
```

**Why this matters:** The 3-command surface stays stable forever. Sub-types absorb all future team variants without adding more top-level commands. Users memorize 3 verbs, not 8+ blueprints.

**Adjacent possibilities:** The `--size` flag directly maps to the token budget (XS → tight, XL → generous), creating a natural bridge to Cluster D's token economics.

---

### Enhancement: Smart defaults make flags optional

The `--size` and `--mode` flags should default intelligently based on task description length and keyword signals — but always remain overridable. Short descriptions → XS. Keywords like "architecture", "redesign", "strategy" → L or XL. Keywords like "fix", "update", "rename" → XS or S.

The difference from the rejected NLP approach: no black-box classification, no codebase scan, no "team card" to approve. Just keyword heuristics that are transparent and documented. User is always in control.

**Adjacent possibilities:** This same heuristic logic can power the discovery question count in Cluster C — fewer questions for small tasks, more for large ones.

---

## Cluster B: DRY Architecture — Enhanced

### Original ideas
Shared protocol skeleton file + include directives + role inheritance + centralized persona library.

### Enhancement: The "Component Manifest" model

Push the DRY idea further: each spawn command becomes a **manifest** that declares what it includes, not what it contains:

```yaml
# spawn-think.md — the entire file
name: spawn-think
base: shared/team-skeleton.md
personas:
  - visionary
  - realist
  - facilitator
discovery: shared/discovery-3q.md
output: shared/output-standard.md
token_budget: medium
model: sonnet
```

That's it. The spawn command is data, not prose. Everything reusable lives in `shared/`. Changing the Task Blocking Protocol means editing one file and it propagates to all 3 commands instantly.

**Why this matters:** Reduces each spawn command from ~300 lines to ~10 lines. Makes the system auditable — you can read the entire team structure at a glance. Eliminates drift between blueprints.

**Adjacent possibilities:** Manifests are machine-readable. A future tool could validate consistency across all manifests, generate documentation automatically, or render a "team card" preview before spawning.

---

### Enhancement: Persona library becomes a registry with capability tags

Extend the centralized persona library with capability tags:

```yaml
# skills/team-personas/visionary.md frontmatter
name: visionary
tags: [divergent, ideation, architecture, strategy]
token_weight: medium   # relative cost vs other personas
model_preference: sonnet
```

Spawn commands can then select personas by tag rather than name: `personas: [divergent, critic, writer]`. This means teams compose dynamically from the registry — adding a new persona type instantly makes it available to all teams without touching any spawn command.

**Adjacent possibilities:** Token weight tags enable the budget system (Cluster D) to auto-drop expensive personas when budget is tight, replacing them with lighter alternatives.

---

## Cluster C: Smart Discovery & Routing — Enhanced

### Original ideas (excluding rejected NLP classification)
3-core discovery questions + model tier auto-selection by phase.

### Enhancement: Discovery as a tiered protocol, not a fixed script

The 3-question minimum is correct. Extend it into a tiered system keyed to `--size`:

| Size | Discovery questions | Model |
|------|--------------------|----|
| XS | 0 — skip entirely | Haiku |
| S | 1 — "What's the goal?" | Haiku |
| M | 3 — goal, constraints, success | Sonnet |
| L | 3 + 2 optional domain-specific | Sonnet |
| XL | 3 core + up to 5 optional | Sonnet → Opus for synthesis |

**Why this matters:** XS tasks currently suffer the worst: they get the same 3-10 question interview as XL tasks. Tiered discovery makes the plugin feel responsive to task weight, not one-size-fits-all.

**Adjacent possibilities:** The optional domain-specific questions (for L/XL) can live in the spawn command manifest — `spawn-think` asks architecture questions, `spawn-build` asks technical constraint questions, `spawn-create` asks audience/format questions. Discovery becomes command-aware.

---

### Enhancement: Model selection ladder with explicit phase handoffs

Model selection should be explicit in the manifest and follow a phase ladder — not inferred:

```
Discovery phase:    Haiku (fast, cheap, good enough for Q&A)
Execution phase:    Sonnet (default workhorse)
Synthesis phase:    Sonnet (or Opus for XL tasks with --quality high flag)
```

**Why this matters:** Currently models are assigned per-agent and mostly defaulted. Explicit phase-based selection means the budget is predictable before the team starts. Users can audit it.

---

## Cluster D: Token Economics — Enhanced

### Original ideas
Token budget manifest + budget flag driving all downstream decisions.

### Enhancement: Budget as the master dial — everything derives from it

Flip the mental model: `--budget` is the first thing you set, and everything else derives from it automatically:

```
--budget xs    → Haiku, 0 discovery questions, 1-2 agents, bullet output only
--budget s     → Haiku/Sonnet, 1 question, 2-3 agents, concise output
--budget m     → Sonnet, 3 questions, 3-4 agents, standard output
--budget l     → Sonnet, 3+2 questions, 4-5 agents, detailed output
--budget xl    → Sonnet+Opus, full discovery, 5+ agents, full artifacts
```

`--size` and `--budget` are aliases for the same dial — one sets team size, the other sets cost ceiling. They should resolve to the same thing.

**Why this matters:** Token budget becomes the single lever users pull. Every other decision (model, team size, discovery depth, output format) is derived automatically. This directly addresses the PRIMARY design constraint without adding complexity.

**Adjacent possibilities:** Budget tiers can be named intuitively — `--budget quick-look`, `--budget deep-dive` — making the intent legible to new users without needing to understand what "Haiku" or "XL" means.

---

### Enhancement: Async parallel execution within a budget envelope

Where the agent SDK supports it, run team members in parallel within the declared budget envelope. A 3-agent team at `--budget m` should cost the same whether agents run sequentially or in parallel — but parallel runs complete faster.

**Why this matters:** Budget becomes a constraint on total cost, not on time. Users get faster results without paying more.

---

## Cluster E: Adaptive & Learning Systems (Aspirational Vision)

Per user decision: no implementation detail, referenced as future direction only.

The longer-term arc is toward teams that compose themselves dynamically (genome-style persona assembly), morph mid-session when blockers emerge, and accumulate reputation over time to improve auto-selection. The manifest + registry architecture proposed in Cluster B is the prerequisite — once teams are data (manifests) rather than prose (spawn commands), dynamic composition becomes implementable without a rewrite.

Pipeline artifact schema validation (Realist #9) is the one Cluster E idea closest to near-term — it's worth considering alongside the Cluster B work.

---

## Synthesis: How the Clusters Combine

The four prioritized clusters form a coherent whole when combined:

```
User runs: spawn-think --budget m "should we move to a monorepo?"

Step 1 (Cluster A):  3-command surface routes to spawn-think, budget=m → size=M
Step 2 (Cluster B):  Manifest loads: 3 personas from registry, shared skeleton, shared discovery
Step 3 (Cluster C):  Discovery tier M → asks 3 core questions, uses Sonnet
Step 4 (Cluster D):  Budget envelope enforced: Sonnet throughout, parallel where possible
Output:              Standard artifact in docs/teams/, concise format
```

The proposed architecture is:
- **3 spawn commands** (A) backed by **manifests** (B)
- **Manifests declare** personas, discovery tier, budget, model selection
- **Shared library** provides skeletons, personas, discovery scripts, output standards
- **Budget flag** is the single master dial (D) that drives discovery depth (C) and team size (A)

This collapses 8 blueprints of 200-400 lines each into 3 manifests of ~10 lines each + a shared library. Maintenance cost drops dramatically. New team types are added by composing existing library components, not writing new blueprints.
