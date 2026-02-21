# Visionary Brainwriting — 8-10 Ideas

**Author:** Visionary (Divergent Thinker)
**Rules:** No evaluation, no feasibility checks, quantity over quality.

---

## Idea 1: One Command to Rule Them All — `/spawn`

Replace all 8 spawn commands with a single `/spawn` that accepts a freeform task description. The system classifies complexity and selects team type automatically — like a smart router that reads intent, not a menu you pick from.

**Inspiration:** How Unix `make` infers what to build from context, not from explicit flags.

---

## Idea 2: Living Team DNA — Genome-Style Composition

Define teams not as fixed blueprints but as composable "gene sequences" — each persona, protocol, and behavior is a modular gene. Spawn commands assemble a team from DNA fragments on the fly, producing hybrids like `[explorer-gene + critic-gene + writer-gene]` for exactly the right shape.

**Inspiration:** Biology — organisms aren't chosen from a menu, they're assembled from genetic building blocks.

---

## Idea 3: Team Scaling Tiers — XS/S/M/L/XL

Map task complexity to team size automatically: a one-liner fix gets a single agent (XS), a feature gets 3 agents (M), an architectural overhaul gets 5+ (XL). The user describes the task; the system picks the tier. No more spawning a 5-person brainstorm team to rename a variable.

**Inspiration:** T-shirt sizing in agile estimation — human-intuitive, fast to communicate.

---

## Idea 4: Adaptive Mid-Session Team Morphing

Teams that can grow or shrink mid-task without restarting. If a brainstorm session discovers a technical blocker, it spawns a specialist inline and dissolves them when the blocker is cleared — like a jazz ensemble where players step in and out for their solo.

**Inspiration:** Jazz improvisation — fluid role changes within a structured session.

---

## Idea 5: Team Skeletons — Ultra-Thin Shared Protocol Layer

Extract all shared protocol boilerplate (Task Blocking Protocol, output standards, persona instructions) into a single inherited "skeleton" file. Each spawn command becomes 20 lines instead of 300 — just the delta that makes it unique. Skeletons version independently and all teams inherit updates automatically.

**Inspiration:** Object-oriented inheritance — stop copy-pasting base class code into every subclass.

---

## Idea 6: The Complexity Interview Replaced by NLP Classification

Ditch the 3-10 question discovery interview entirely. Instead, the system does one NLP pass over the user's task description and a brief codebase scan, then infers: scope, team type, model tier, and token budget — presenting a "team card" for one-click approval or adjustment.

**Inspiration:** How airline booking sites replaced 20 questions with smart search-and-present.

---

## Idea 7: Async Parallel Brainwriting with Idea Collision Detection

During brainstorm sessions, run all brainwriters fully async and in parallel — then run a collision-detection pass before clustering that automatically flags semantic duplicates and surfaces unexpected combinations. Teams finish in one-third the time and the deduplication step becomes automatic.

**Inspiration:** How merge conflict detection works in git — parallel work, then smart reconciliation.

---

## Idea 8: Token Budget as a First-Class Spawn Parameter

Make token budget a named parameter at spawn time: `/spawn --budget tight "refactor auth module"`. Tight budgets auto-select Haiku, suppress discovery interviews, and produce bullet-only output. Generous budgets unlock deeper exploration. Budget is the primary dial, not team type.

**Inspiration:** How cloud compute lets you right-size instances before you run the job.

---

## Idea 9: Persona Archetypes as a Shared Library — Not Per-Team Copies

Centralize all persona definitions in one canonical library (`skills/team-personas/`). Teams reference personas by name rather than embedding full definitions. Adding a new persona type — say, a "Devil's Advocate" — instantly makes it available to every team type without editing 8 files.

**Inspiration:** Design systems — define once, reference everywhere, propagate updates automatically.

---

## Idea 10: Team Reputation System — Learn from Past Sessions

Track which team types produce the most user-approved outputs per task category. Over time, the system builds a "reputation map" that influences auto-selection: brainstorm teams that consistently land well on architecture tasks get higher weight when the next architecture task arrives.

**Inspiration:** Collaborative filtering (Netflix recommendations) applied to team selection.

---

## Summary

These 10 ideas attack the problem from different angles:
- **Reduction**: ideas 1, 3, 6 (fewer choices, smarter defaults)
- **Composition**: ideas 2, 5, 9 (modular, DRY architecture)
- **Adaptation**: ideas 4, 8, 10 (dynamic, context-aware behavior)
- **Speed**: ideas 6, 7 (remove friction, parallelize)
