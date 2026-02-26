# Formal Scoring Enforcement — Architect Specification

**Supersedes:** `task-02-scoring-enforcement-design.md` (initial design)
**Incorporates:** Risk constraints from `task-03-risks.md`

---

## Problem Statement

Issue #16 finding: review team spawn used `78/100` — a continuous impressionistic score — instead of the binary rubric in `spec-quality-scoring.md`. This happens because:

1. **spawn-core.md dispatch step 3** says "Run discovery interview" — scoring is not named as a distinct mandatory step in the dispatch pattern
2. **Spawn command scoring steps** say "Follow the scoring protocol from..." — a reference, not an enforcement contract
3. **No format mandate** in any command file — so informal scores like `78/100` or "looks complete" satisfy the letter of the instruction
4. **Scoring is positioned as optional output** (score included in spawn prompt) rather than a gate that must visibly fire before sizing

---

## Design: Enforcement in spawn-core.md

### Current Dispatch Pattern (Step 4 in spawn-core.md)

```
1. Run prerequisites check
2. Parse --mode flag or auto-infer
3. Run discovery interview
4. Apply adaptive sizing
5. Dispatch to spawn command
```

Scoring is absent from this list entirely — it's handled inside individual command files, which is why it can be skipped or informally done.

### Revised Dispatch Pattern

```
1. Run prerequisites check
2. Parse --mode flag or auto-infer
3. Run discovery interview (from shared/discovery-interview.md)
4. **Run spec quality scoring** (from shared/spec-quality-scoring.md) — MANDATORY
5. Apply adaptive sizing — BLOCKED until scoring output is displayed
6. Dispatch to spawn command with compiled context
```

Add to spawn-core.md a new **Scoring Invariant** section:

```markdown
## Scoring Invariant

Spec quality scoring is a mandatory gate between discovery and sizing. It MUST execute for
every spawn regardless of mode or flags. Sizing cannot begin until the full dimension
breakdown has been displayed to the user.

### Required Output Format

Before proceeding to adaptive sizing, display:

  Spec Quality: N/6 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]

This exact format is required. Variations like "78/100", "looks complete", or point-based
scores are non-compliant.

### How to Score

For each of the 6 dimensions in spec-quality-scoring.md:
1. Read that dimension's binary question
2. Answer YES (✓) or NO (✗) based ONLY on what is present in the compiled Context — not inference or assumption
3. Record a one-line rationale for each ✗ (used in gate prompt)

### Gate Logic

- Default threshold: 4 passing dimensions
- Override: --min-score N flag (strip from $ARGUMENTS before passing downstream)
- If passing >= threshold: display score, proceed to sizing
- If passing < threshold: display score + per-failed-dimension remediation list, then prompt:

  Missing:
  - [Dimension]: [specific data needed to pass]
  - [Dimension]: [specific data needed to pass]

  Refine the spec (re-run discovery for missing areas), or type "proceed" to spawn anyway.

- If user types "proceed": spawn proceeds, score included in prompt unchanged

### Goal Dimension Handling

If Goal Clarity fails (✗), surface it distinctly regardless of total score:

  Warning: Goal dimension failed. Teams that spawn without a clear goal frequently misalign.
  Consider clarifying before proceeding.

This warning fires even when total score >= threshold (e.g., 5/6 with Goal failing).

### Spawn Prompt Inclusion

Include score in the spawn prompt's Context section as:

  ### Spec Quality
  Score: N/6 dimensions [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]

This gives spawned teammates visibility into spec quality and enables AAR traceability.
```

---

## Changes to spawn-core.md

**Section: Dispatch Pattern** — add step 4 (scoring) between discovery and sizing; renumber current step 4 (sizing) to step 5.

**Add:** New "Scoring Invariant" section (full text above).

**No other spawn-core.md changes needed** — verbosity control, team naming, model selection, and sizing rules are unaffected.

---

## Changes to spec-quality-scoring.md

Add **Enforcement Contract** section:

```markdown
## Enforcement Contract

This scoring protocol is called from spawn-core.md as a mandatory dispatch step.
Spawn commands MUST NOT implement informal scoring in place of this rubric.

Non-compliant formats:
- Point-based scores ("78/100", "85 points")
- Letter grades ("B+")
- Impressionistic ratings ("mostly complete", "looks good")
- Omitting the dimension breakdown entirely

Compliant format (only acceptable form):
  Spec Quality: N/6 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]

6/6 confirms structural completeness only — not semantic correctness. A spec can pass
all dimensions and still describe the wrong feature. Scoring validates spec structure,
not intent alignment.
```

**Fix stale doc:** Change "5 dimensions" to "6 dimensions" wherever it appears in spec-quality-scoring.md and discovery-interview.md.

---

## Changes to Spawn Command Scoring Steps

### Current (all 3 commands)

> "Follow the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`."
> "Evaluate the compiled Context section using binary-checkable questions."
> "Display the score with dimension breakdown before proceeding."

This wording allows informal scoring because it says "binary-checkable questions" but doesn't mandate the output format.

### Replacement Template (identical for spawn-build, spawn-think, spawn-create)

Replace each command's scoring step with:

```markdown
### Step N: Spec Quality Scoring

Evaluate the compiled Context section against the 6 binary dimensions defined in
`${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

**Procedure:**
1. For each dimension, read its binary question and answer YES (✓) or NO (✗)
2. Base answers ONLY on content present in the Context — not inference
3. For each ✗, note the specific information that would make it pass

**Required output (display before proceeding to sizing):**
Spec Quality: N/6 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]

Apply gate logic and Goal warning per `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md` Scoring Invariant.
Include score in the spawn prompt as `### Spec Quality`.
```

The key change: the output format is now **quoted verbatim** in the command file — not just "display the score with breakdown." This closes the informal-scoring loophole.

The gate logic and Goal warning are delegated to spawn-core.md Scoring Invariant rather than repeated per command — single source of truth.

---

## Traceability for AAR

With `### Spec Quality` included in every spawn prompt:
- AAR can correlate spec quality at spawn time with team outcome quality
- `/evaluate-spawn` can surface "spawn had 3/6 score, outcome rated poor" patterns
- Over time, this validates or revises the threshold (Phase 2 calibration mode)

The per-dimension breakdown (not just the total) in the spawn prompt enables fine-grained correlation: e.g., "teams that spawn with Goal ✗ show 40% higher rework rate."

---

## Issue #16 Fix Summary

| Problem | Fix |
|---------|-----|
| "78/100" informal score in review spawn | Enforcement Contract in spec-quality-scoring.md explicitly lists non-compliant formats; verbatim format mandate in spawn command steps |
| Scoring absent from dispatch pipeline | Added as mandatory step 4 in spawn-core.md dispatch pattern |
| No blocker between scoring and sizing | Scoring Invariant states sizing is BLOCKED until score displayed |
| Goal failure not surfaced distinctly | Goal warning fires on ✗ regardless of total score |
| Per-dimension breakdown not required | Verbatim format in command steps requires all 6 indicators |
