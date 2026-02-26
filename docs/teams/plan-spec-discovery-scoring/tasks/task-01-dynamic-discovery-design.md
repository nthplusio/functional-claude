# Task 1: Dynamic Discovery Protocol Design

## Current State Analysis

### Fixed 3+2 Structure (current)
- **Core:** 3 universal questions (Goal, Constraints, Success Criteria) — always asked if not in `$ARGUMENTS`
- **Optional:** 2 keyword-triggered questions (Existing context, Quality priority)
- **Extended:** Command-specific questions (2 for Feature, 1 for Debug, 2 for Research, etc.)
- **Total ceiling:** 5 core/optional + 2-4 extended = 7-9 max, but no explicit cap or ambiguity-driven logic

### Key Problems
1. Questions are asked by pattern-matching keywords, not by measuring actual ambiguity in the spec
2. The 3 core questions are always asked even when the spec is already rich
3. Extended questions are binary triggers (keyword match = ask), not weighted by need
4. No feedback loop between what was answered and what follow-up to ask
5. Refinement phase (from spec-refinement.md) is separate from discovery, creating a two-round gap

---

## Dynamic Protocol Design

### Core Principle
Replace keyword triggering with **ambiguity scoring per dimension** before asking any questions. Questions are selected by deficit — ask about what's missing, not what keywords suggest.

### Algorithm: Pre-Question Ambiguity Assessment

Before asking anything, parse `$ARGUMENTS` and score each of the 6 spec quality dimensions (reusing existing scoring rubric):

```
For each dimension D in {Goal, Constraints, Success, EdgeCases, Acceptance, APIAccuracy}:
  score[D] = "answered" | "partial" | "missing"
```

Rules:
- `answered`: `$ARGUMENTS` satisfies the dimension's binary question
- `partial`: `$ARGUMENTS` mentions it but incompletely (e.g., "fast" without specifics)
- `missing`: no signal in `$ARGUMENTS`

### Question Pool (10 max, drawn dynamically)

Replace the fixed 3+2 structure with a **ranked pool** of questions per spawn command. Each question maps to one or more scoring dimensions and has a **priority weight**:

| Priority | When to include |
|---|---|
| Required | dimension is `missing` |
| Conditional | dimension is `partial` |
| Elective | command-specific enrichment (may add even if dimension is `answered`) |

**Universal question pool (maps to spec dimensions):**

| Question ID | Dimension | Question | Priority |
|---|---|---|---|
| Q-goal | Goal | "What must the system do when this is done? What can users do that they can't today?" | Required if missing |
| Q-constraints | Constraints | "What are the non-negotiables? (tech stack, timeline, budget, compliance)" | Required if missing |
| Q-success | Success | "How will you verify this works? What observable output confirms success?" | Required if missing |
| Q-edge | EdgeCases | "What are the non-happy-path scenarios? What inputs or states should the system handle gracefully?" | Required if missing |
| Q-acceptance | Acceptance | "Describe one end-to-end user behavior that must work — from trigger to visible outcome?" | Required if missing |
| Q-api | APIAccuracy | "Which specific libraries, APIs, or schema versions are in scope?" | Conditional if partial |

**Command-specific elective questions** (defined per spawn command, max 4):
- Elective questions only added if pool < 10 questions total after required/conditional
- Maintain existing extended question tables in spawn commands — just reclassify them as elective

### Batching

- Present max 4 questions per `AskUserQuestion` call
- If total questions > 4: batch by priority (required first, then conditional, then elective)
- After each batch, re-evaluate ambiguity scores before deciding on next batch
- Stop if: (a) all required/conditional questions answered, or (b) 10 questions reached, or (c) user types "skip"

### Skip Semantics

- User can leave individual question answers blank — treat as "no answer, proceed without"
- User can type "skip" to skip remaining questions in the current batch AND all subsequent batches
- Per-question skip does NOT penalize scoring; full batch "skip" penalizes Edge Cases and Acceptance dimensions

### Adaptive Logic Flowchart

```
Parse $ARGUMENTS
  → Score 6 dimensions (answered/partial/missing)
  → Count missing/partial → build required+conditional question list
  → Add elective questions up to max 10
  → If total questions == 0: skip interview, go to scoring
  → If total questions > 0:
      Batch 1 (up to 4): present required questions
      Re-score after batch 1
      Batch 2 (up to 4): remaining required + conditional
      Re-score after batch 2
      Batch 3 (up to 2): elective only, if still below 10 and dimensions still missing
  → Compile context block
  → Confirm: "Based on your description, here's what I understand: [summary]. Anything to adjust?"
```

### Changes to discovery-interview.md

**Remove:**
- Fixed 3 core questions section
- Fixed 0-2 optional questions section
- Keyword-trigger mechanism for optional questions
- Spec-refinement.md integration call (fold into adaptive batching)

**Add:**
- Ambiguity scoring algorithm (above)
- Dynamic question pool concept (universal + command-specific elective)
- Multi-batch structure with re-evaluation between batches
- Updated skip semantics

**Preserve:**
- Token budget block
- Output compilation format
- Quality scoring step (unchanged)
- Scenario collection (unchanged)
- When-to-include table
- Extended questions convention for spawn commands

### Spawn Command Changes

Each spawn command's "Mode-specific extended questions" table needs:
- Reclassify existing questions as `elective` (no behavioral change, just label)
- Remove the "ask up to N" ceiling — dynamic algorithm handles this
- The elective pool per command should have up to 4 questions total (existing questions + any new ones)

No structural changes to spawn-build, spawn-think, spawn-create beyond the above reclassification.

---

## What This Achieves

**Before:** Ask 3 fixed questions even when spec is rich; miss edge-case questions when spec is vague.

**After:**
- Rich spec → 0-2 questions (only gaps filled)
- Vague spec → up to 10 targeted questions across all 6 dimensions
- Questions map directly to scoring dimensions → every question asked improves the eventual score
