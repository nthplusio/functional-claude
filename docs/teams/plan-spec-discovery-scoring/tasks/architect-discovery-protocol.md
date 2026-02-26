# Dynamic Discovery Protocol — Architect Specification

**Supersedes:** `task-01-dynamic-discovery-design.md` (initial design)
**Incorporates:** Risk constraints from `task-03-risks.md` (all 6 binding constraints)

---

## Design Summary

Replace the fixed 3+2 question structure with a three-layer dynamic approach:
1. **Baseline layer** — 3 core questions, always asked unless pre-answered in `$ARGUMENTS`
2. **Ambiguity detection layer** — analyze responses for vague answers; generate targeted follow-ups
3. **Feature-characteristic layer** — heuristic questions triggered by detected task patterns

Max 10 questions total. Max 2 batches of 4 (= 8 dynamic questions). Stop when ambiguity is resolved or user signals done.

---

## Layer 1: Baseline (3 Core Questions)

These 3 questions remain always-asked — they are the universal baseline, not dynamically triggered.

| # | Label | Phrasing | Dimension |
|---|-------|----------|-----------|
| Q1 | **Goal** | "What must the system do when this is done? What can users do that they can't today?" | Goal clarity |
| Q2 | **Constraints** | "What are the non-negotiables — tech stack, timeline, budget, compliance?" | Constraints specificity |
| Q3 | **Success** | "How will you verify this works? What observable output confirms success?" | Testable success criteria |

**Pre-answer skip:** Before asking, parse `$ARGUMENTS` for explicit answers. Skip any core question that is already clearly answered. If all 3 are answered, skip the baseline layer entirely and proceed to ambiguity detection on `$ARGUMENTS` content.

**Adaptive skip confirmation:** Even if all 3 are pre-answered, display: "Based on your description, here's what I understand: [summary of Q1/Q2/Q3 answers]. Anything to adjust?" — this is a single-message confirmation, not a question batch.

---

## Layer 2: Ambiguity Detection

**Runs after baseline answers are collected (or after confirming pre-answers).** Analyze all available context (`$ARGUMENTS` + baseline answers) for vague signals:

### Ambiguity Signals and Follow-up Questions

| Signal | Detection Pattern | Follow-up Question | Dimension | Priority |
|--------|------------------|--------------------|-----------|----------|
| Vague goal | Goal answer contains words like "better", "improve", "faster", "easier", "more reliable" without specifics | "When you say [vague word], what specific behavior changes? Can you describe what a user would see/do differently?" | Goal clarity | P1 |
| Unconstrained scope | No technology named anywhere in context; goal spans multiple systems | "Which specific tech stack or framework is this targeting?" | Constraints | P1 |
| Unmeasurable success | Success answer contains "works correctly", "feels smooth", "users are happy", "good performance" | "What's the measurable threshold? (e.g., response < 200ms, error rate < 0.1%, task completion > 80%)" | Success | P1 |
| Missing edge cases | No mention of errors, failures, invalid inputs, limits | "What should happen when [most likely failure mode from goal description]?" | Edge cases | P2 |
| Missing user identity | No mention of who uses the feature; goal is system-focused | "Who are the primary users? Any permission levels or roles involved?" | Acceptance | P2 |
| Library/API underspecified | Code or schema mentioned without version or specific API names | "Which specific version of [library/API mentioned]? Any method signatures or schema you're targeting?" | API accuracy | P2 |

**Priority tiers** (binding constraint from risk analysis):
- **P1**: Ask if ambiguity detected — always goes in first batch
- **P2**: Ask if batch space remains — goes in second batch if P1 doesn't fill it
- **P3**: Skip if both batches are full

No more than 6 ambiguity-detection questions total (leaves room for feature-characteristic layer).

---

## Layer 3: Feature-Characteristic Heuristics

**Runs in parallel with ambiguity detection** — scan context for task patterns and queue conditional questions. These fire regardless of ambiguity level when the pattern matches.

| Detected Characteristic | Trigger Keywords/Patterns | Conditional Question | Dimension | Priority |
|------------------------|--------------------------|---------------------|-----------|----------|
| **Batch operations** | batch, bulk, import, export, process N records, queue, pipeline | "How should the system behave if part of the batch fails mid-run? Retry, partial success, or rollback?" | Edge cases | P1 |
| **Data mutation** | create, update, delete, write, save, submit, post, patch | "What's the rollback or undo behavior if the mutation fails or the user changes their mind?" | Edge cases | P1 |
| **Scheduling / time** | schedule, cron, daily, recurring, at [time], reminder, deadline | "How should timezone differences be handled? Is the schedule user-local or server-local?" | Constraints | P2 |
| **Multi-step flow** | wizard, onboarding, multi-step, checkout, flow, funnel, form with N steps | "What happens if the user abandons mid-flow? Is progress saved? Can they resume?" | Edge cases | P2 |
| **Existing similar feature** | like [existing feature], similar to, extend, replace, refactor existing | "What's the existing pattern or component to follow or avoid?" | Constraints | P2 |
| **External service dependency** | API, webhook, third-party, payment, auth, OAuth, SMS, email | "What happens when the external service is unavailable? Fallback, queue, or fail loudly?" | Edge cases | P1 |
| **Permissions / auth** | role, permission, admin, owner, access control, can/cannot, restrict | "Which roles have which permissions? Any elevation or delegation scenarios?" | Constraints | P1 |

Feature-characteristic questions are de-duplicated against mode-specific extended questions before being added to the batch (see Deduplication below).

---

## Batching and Ordering

### Full Question Pipeline

```
1. Parse $ARGUMENTS → score pre-answers for Q1/Q2/Q3
2. Ask unanswered baseline questions (Batch 0 if any, max 3)
3. Collect baseline answers
4. Run ambiguity detection on ALL context (arguments + baseline answers)
5. Run feature-characteristic scan on ALL context
6. Build question queue: P1 first, then P2, then P3
7. Deduplicate against mode-specific extended questions (remove any that overlap)
8. Batch 1: up to 4 questions from queue
9. After Batch 1: re-evaluate ambiguity on all answers so far
10. Batch 2: up to 4 remaining questions (only if significant ambiguity remains)
11. Mode-specific extended questions: asked only if NOT already covered by dynamic batches
12. Stop conditions check
```

### Batching Rules (binding)
- **Max 2 dynamic question batches** (not 3)
- **Max 4 questions per AskUserQuestion call**
- Batch 0 (baseline): up to 3 questions — asked if any core question is unanswered
- Batch 1: up to 4 questions — P1 priorities first
- Batch 2: up to 4 questions — only if ≥2 significant ambiguities remain after Batch 1
- Total dynamic cap: **8 questions** (Batches 1+2) + up to 2 mode-specific extended = 10 max

### Deduplication Contract (binding)

Before generating dynamic questions, the spawn command MUST pass its mode-specific extended question topics as a context list. Dynamic question generation suppresses any question whose topic overlaps with a mode-specific extended question.

Example: `spawn-build --mode feature` passes topics: `[existing-context, quality-bar]`. Dynamic question generator will not generate questions about existing context or quality bar — those will be asked as mode-specific extended questions instead.

Ordering after dedup: **baseline → dynamic Batch 1 → dynamic Batch 2 → mode-specific extended**

### Skip Semantics

- **Per-question skip:** User leaves a question answer blank or writes "skip this". Mark that question's dimension as "user-declined". Do NOT re-ask related questions in subsequent batches (dedup by topic).
- **Batch-level skip:** User types "skip" or "enough" or "proceed". Skip all remaining dynamic batches AND mode-specific extended questions. Proceed directly to spec confirmation.
- **Scoring impact of skip:** User-declined dimensions may fail their binary check. Spec quality score reflects actual completeness — no inflation for skipped areas.

---

## Stop Conditions

Stop dynamic questioning when any of the following is true:
1. 10 total questions have been asked (hard cap)
2. No P1 or P2 ambiguity signals remain after batch evaluation
3. User types "skip", "enough", "proceed", or equivalent
4. All 6 spec quality dimensions are already answered (would score 6/6 without asking more)

After stopping: show spec confirmation summary → run scoring → proceed to sizing.

---

## Risk Mitigations Applied

| Risk (from task-03) | Mitigation Applied |
|---|---|
| Over-questioning / fatigue | Max 2 dynamic batches; Batch 2 only fires if ≥2 ambiguities remain |
| Mode-specific duplication | Deduplication contract: command passes extended question topics before dynamic generation |
| Scoring false confidence | Language change: neutral "Score: N/6. Proceed or refine?" — not "looks good"; Goal dimension highlighted separately if it fails |
| Regression blast radius | Fix "5 dimensions" → "6 dimensions" in discovery-interview.md line 97; spec-refinement.md and scenario-collection.md integration preserved unchanged |
| AskUserQuestion overflow | P1/P2/P3 priority tiers; overflow truncates deterministically at P3 |

---

## Changes Required to discovery-interview.md

**Remove:**
- Section "Core Questions" (fixed 3-question table) → replace with "Baseline Layer" (same 3 questions, same phrasing, but documented as always-asked with pre-answer skip)
- Section "Optional Questions" (keyword-triggered 0-2) → replaced by dynamic layers
- The sentence "Ask 0-2 additional questions triggered by keyword detection" — replaced by ambiguity detection + feature-characteristic heuristics

**Add:**
- Layer 1: Baseline (preserving Q1/Q2/Q3 verbatim)
- Layer 2: Ambiguity Detection table
- Layer 3: Feature-Characteristic Heuristics table
- Batching and Ordering section (including full pipeline, deduplication contract, skip semantics)
- Stop Conditions section

**Fix:**
- Line 97: "Scoring evaluates 5 dimensions" → "Scoring evaluates 6 dimensions"

**Preserve unchanged:**
- Adaptive Skip Logic section (pre-answer detection)
- Token Budget Block section
- Presentation note (AskUserQuestion, single batch) → update to mention multi-batch with re-evaluation
- Output Compilation format
- Refinement Phase reference
- Quality Scoring reference
- Scenario Collection reference
- When to Include table
- Extended Questions convention for spawn commands

---

## Changes Required to Spawn Commands

Each spawn command's "Mode-specific extended questions" section needs:

1. **Add dedup instruction:** "Before asking these questions, pass topic labels `[topic1, topic2, ...]` to the dynamic question generator. Dynamic questions will not cover these topics. Ask mode-specific extended questions only for topics NOT already addressed in dynamic batches."

2. **No ceiling change needed:** "ask up to N" ceilings remain but are now enforced jointly with dynamic questions (total cap 10).

3. **No question text changes** — existing extended question phrasings are preserved.

Affected files: `commands/spawn-build.md`, `commands/spawn-think.md`, `commands/spawn-create.md`
