# Task 2: Formal Scoring Enforcement Design

## Current State Analysis

### What exists in spec-quality-scoring.md
- 6 binary pass/fail dimensions (Goal, Constraints, Success, EdgeCases, Acceptance, APIAccuracy)
- Scoring protocol: evaluate compiled context, count passing, display `N/6 [breakdown]`
- Gate: threshold 4 by default; below threshold → prompt to refine or "proceed"
- Score included in spawn prompt's `### Spec Quality` subsection
- Calibration mode for first 10 sessions

### What's broken (Issue #16)
The scoring file is correct as spec but the **spawn commands are not enforcing it rigorously**:

1. **spawn-build Step 5:** Says "evaluate using pass/fail dimension questions" but doesn't require dimension-by-dimension output
2. **spawn-think Step 6:** Says "binary-checkable questions" but wording is loose enough to allow impressionistic scores
3. **spawn-create Step 6:** Same as spawn-think — references the protocol but doesn't mandate the breakdown format
4. **All commands:** The score display format (`5/6 [Goal: ✓] ...`) is documented only in spec-quality-scoring.md, not enforced in the spawn command steps

There's also a **dimension count mismatch**: discovery-interview.md line 97 says "5 dimensions" but spec-quality-scoring.md defines 6. This is a stale doc bug.

---

## Scoring Enforcement Design

### Core Fix: Make Enforcement Explicit in Each Spawn Command

The scoring steps in spawn-build, spawn-think, spawn-create must be rewritten to mandate:

1. **Dimension-by-dimension evaluation** — evaluate each of the 6 dimensions by answering its binary question explicitly (yes/no), not by overall impression
2. **Required output format** — the exact string `Spec Quality: N/6 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]` must appear before proceeding to sizing
3. **Per-dimension rationale** — when a dimension fails, must state what's missing (feeds the gate prompt)
4. **Gate enforcement** — below-threshold gate must explicitly list failed dimensions with the specific information needed to fix each one

### Revised Scoring Step Template (for all 3 spawn commands)

Replace the current vague "follow the scoring protocol" with this explicit procedure:

```
### Step N: Spec Quality Scoring

Evaluate the compiled Context section against all 6 dimensions from
`${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`. For each dimension:

1. Read the binary question for that dimension
2. Answer yes (✓) or no (✗) based ONLY on what's in the Context section — not inference
3. Record the rationale for any ✗ (what specific information is missing)

**Required output format (display before proceeding to sizing):**
Spec Quality: N/6 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗] [API Accuracy: ✓/✗]

**Gate (default threshold: 4 dimensions):**
- N >= threshold: proceed. Include score in spawn prompt as `### Spec Quality`.
- N < threshold: display score + list each failed dimension with what's needed:
  ```
  Missing:
  - Constraints: need ≥2 named technical constraints (framework, library, pattern, or timeline)
  - Edge Cases: need ≥2 non-happy-path scenarios enumerated
  ```
  Then prompt: "Refine the spec (re-run discovery for missing areas), or type 'proceed' to spawn anyway."
- If user proceeds, include score in spawn prompt unchanged.

Parse `--min-score N` from `$ARGUMENTS` to override default threshold. Strip before passing downstream.
```

### Changes to spec-quality-scoring.md

**Add (Enforcement section):**
```
## Enforcement Contract

Spawn commands MUST:
1. Evaluate each dimension individually using only its binary question
2. Display the full 6-dimension breakdown in the exact format above before advancing
3. On gate failure, list each failed dimension with the specific data that would make it pass
4. Never use impressionistic scoring ("looks pretty good") — only binary answers to binary questions
```

**Fix stale doc:**
- Line 97 of discovery-interview.md: Change "5 dimensions" to "6 dimensions"

### Integration with Dynamic Discovery (Task 1)

Since the dynamic discovery algorithm now maps questions directly to scoring dimensions, the pre-spawn ambiguity score and the post-interview spec quality score should **converge**:
- If all required questions are answered → expect ≥ 4/6 dimensions to pass
- If user skips questions → expect corresponding dimensions to fail
- This creates a tight feedback loop: discovery gaps predict scoring failures

### spawn-core.md Changes

No changes needed to spawn-core.md for scoring enforcement. The dispatch pattern (Step 4 in the current dispatch order) calls the scoring step via individual command files.

However, add this to spawn-core.md's Dispatch Pattern section:
```
### Scoring Invariant
All spawn commands must display the full dimension breakdown before advancing to adaptive sizing.
Sizing decisions cannot begin until `Spec Quality: N/6 [...]` has been shown to the user.
```

---

## What This Achieves

**Before:** Spawn commands mention scoring but don't enforce dimension-by-dimension breakdown. Score may be impressionistic.

**After:**
- Every spawn shows explicit `N/6 [Goal: ✓/✗] [Constraints: ✓/✗] ...` before sizing
- Failed dimensions include specific remediation instructions
- No path to sizing without seeing the score
- Scoring and discovery are aligned — same 6 dimensions drive both
