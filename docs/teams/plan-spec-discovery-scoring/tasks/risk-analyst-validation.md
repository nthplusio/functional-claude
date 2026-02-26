# Risk Analyst Validation: Architect's Detailed Specs

**Validates:** `architect-discovery-protocol.md` + `architect-scoring-enforcement.md`
**Against:** `risk-analyst-assessment.md` + Task 4 binding user decisions

---

## Summary

**4 of 6 binding constraints: PASS. 1: PARTIAL (reconcilable). 1: FAIL (requires resolution).**

One unresolved contradiction between the discovery protocol and the task 4 user decision on refinement folding. One batch-cap tension that needs clarification before implementation.

---

## Constraint-by-Constraint Validation

### Constraint 1: Max 2 dynamic-question batches (8 questions max) — PARTIAL

**User decision (task 4):** 2 batches default + conditional 3rd if ≥3 dimensions still missing after batch 2. Total hard cap: 12.

**Architect's spec:** States "Max 2 dynamic question batches" and "Total dynamic cap: 8 questions (Batches 1+2)" in the Batching Rules section. But the user explicitly approved a conditional 3rd batch.

**Conflict:** The architect's spec enforces a stricter cap than the user approved. The user decision allows batch 3 when ≥3 dimensions remain missing — the spec prohibits it entirely.

**Resolution needed:** The spec must add the conditional 3rd batch rule from task 4:
> "Batch 3 (up to 4): only if ≥3 significant ambiguities remain after Batch 2. Total hard cap: 12 questions."

The stop condition "No P1 or P2 ambiguity signals remain" already handles early termination — batch 3 only fires when the condition isn't met. This is additive, not a design change.

**Risk impact:** Low. Without the conditional 3rd batch, specs with 3+ missing dimensions after batches 1-2 get truncated. This increases scoring failures and gate prompts — the opposite of the goal.

---

### Constraint 2: Dynamic question generation receives mode's extended question list — PASS

**Architect's spec (§Deduplication Contract):** "Before generating dynamic questions, the spawn command MUST pass its mode-specific extended question topics as a context list. Dynamic question generation suppresses any question whose topic overlaps with a mode-specific extended question."

**Example given:** `spawn-build --mode feature` passes `[existing-context, quality-bar]` — dynamic questions about these topics suppressed.

**Assessment:** Contract is explicit, well-specified, and places responsibility on the spawn command (correct). The ordering is also correct: baseline → dynamic → mode-specific extended.

**Residual risk (low):** "Topic overlap" is semantic, not syntactic. If a dynamic question asks "What rollback behavior is needed?" and the mode-specific extended asks "What matters most — correctness or shipping speed?", an implementer might not recognize these as overlapping (they don't — but border cases will exist). Recommend adding 1-2 example overlap pairs to the contract for implementer guidance.

---

### Constraint 3: Adaptive skip ($ARGUMENTS parsing) runs before dynamic question generation — PASS

**Architect's spec (§Layer 1 §Pre-answer skip):** "Before asking, parse `$ARGUMENTS` for explicit answers. Skip any core question that is already clearly answered." And in §Full Question Pipeline step 1: "Parse `$ARGUMENTS` → score pre-answers for Q1/Q2/Q3" precedes all batch generation.

**Assessment:** Ordering is explicit and correct. The ambiguity scoring in step 4 also takes `$ARGUMENTS` as input ("Run ambiguity detection on ALL context (arguments + baseline answers)"), so pre-answers suppress dynamic questions too.

**Partial-answer handling:** The spec introduces a "partial" state for ambiguity detection. The earlier risk noted that partial answers should be acknowledged in follow-up phrasing. The spec's Layer 2 table shows follow-up questions like "When you say [vague word], what specific behavior changes?" — this implicitly references the partial answer. PASS on intent; the implementation note about explicit acknowledgment ("You mentioned X — to refine:") is still a good practice but is not a blocking gap.

---

### Constraint 4: Fix 5→6 dimension discrepancy in discovery-interview.md — PASS

**Architect's discovery spec (§Changes Required to discovery-interview.md §Fix):** "Line 97: 'Scoring evaluates 5 dimensions' → 'Scoring evaluates 6 dimensions'"

**Architect's scoring spec (§Changes to spec-quality-scoring.md):** "Fix stale doc: Change '5 dimensions' to '6 dimensions' wherever it appears in spec-quality-scoring.md and discovery-interview.md."

**Assessment:** Both specs address the fix. Covered.

---

### Constraint 5: Goal Clarity failure produces distinct warning even when total score >= threshold — PASS

**User decision (task 4):** "Warn but don't block. Show a distinct warning... but allow proceeding without typing 'proceed'."

**Architect's scoring spec (§Goal Dimension Handling):**
> "If Goal Clarity fails (✗), surface it distinctly regardless of total score: 'Warning: Goal dimension failed. Teams that spawn without a clear goal frequently misalign. Consider clarifying before proceeding.' This warning fires even when total score >= threshold."

**Assessment:** Warning is implemented, fires regardless of total score, doesn't block (no "type proceed" required). Matches user decision exactly. PASS.

**Language note (non-blocking):** The user decision specified the warning text as "⚠ Goal Clarity failed — spec may be too vague for aligned team output." The architect's spec uses slightly different wording. Recommend aligning to the user's exact phrasing for consistency with the decision record.

---

### Constraint 6: Define P1/P2/P3 priority tiers for deterministic overflow truncation — PASS

**Architect's spec:** P1/P2/P3 tiers defined in both Layer 2 (Ambiguity Detection) and Layer 3 (Feature-Characteristic Heuristics). Full Question Pipeline step 6: "Build question queue: P1 first, then P2, then P3."

**Assessment:** Tiers are defined, overflow behavior is deterministic (truncation at P3 boundary). PASS.

**Observation:** P3 is named in the tier definitions but no P3 questions are listed in the spec's tables. The tiers say "P3: Skip if both batches are full" but Layer 2 table tops out at P2 and Layer 3 tops out at P2. P3 is a truncation label, not a question category. This is fine — it means P3 questions would only come from mode-specific electives, which are handled after dynamic batches anyway. No gap.

---

## spec-refinement.md Folding: UNRESOLVED CONFLICT

**User decision (task 4):** "Fold refinement into dynamic batches: Accepted. Merge spec-refinement.md edge-case probing into the adaptive question pool. Remove the separate refinement phase."

**Architect's discovery spec (§Risk Mitigations Applied table):** "spec-refinement.md and scenario-collection.md integration **preserved unchanged**"

**Also in architect's discovery spec (§Changes Required to discovery-interview.md §Preserve unchanged):** "Refinement Phase reference" is listed under PRESERVE.

**These directly contradict the task 4 binding user decision.** The user accepted folding refinement into dynamic batches and removing the separate phase. The architect's spec instead preserves it.

### Why This Matters

spec-refinement.md currently:
1. Called from `discovery-interview.md` §Refinement Phase
2. Referenced in `evaluate-spawn/SKILL.md` as a rubric update target (user-facing: "spec refinement should have surfaced it")
3. Referenced in `plugin-manifest.json` (file listed as a plugin asset)
4. Contains self-referential instruction: "Each spawn command... should call the refinement phase after output compilation"

If refinement is folded into dynamic batches, the call in discovery-interview.md is removed. But the `evaluate-spawn` skill still references spec-refinement.md as a file to update. And plugin-manifest.json still lists it.

**Resolution options:**

| Option | Impact |
|--------|--------|
| A. Keep spec-refinement.md as a file, but remove the call from discovery-interview.md; fold its questions into Layer 3 heuristics | evaluate-spawn and manifest stay valid; refinement questions are absorbed |
| B. Remove the call AND deprecate spec-refinement.md; update evaluate-spawn to reference "discovery interview" instead | Cleaner; requires 3 file changes; manifest cleanup needed |
| C. Interpret user decision narrowly: fold the refinement *question generation* into dynamic batches, but keep spec-refinement.md as documentation | Avoids file removal; evaluate-spawn continues to work unchanged |

**Recommendation:** Option A or C. The user's decision was about removing the separate refinement *phase* (a UX-round reduction), not necessarily deleting the file. Option A achieves the user's goal — no separate AskUserQuestion call for refinement — while keeping spec-refinement.md as the authoritative description of edge-case question categories (which evaluate-spawn references).

**This requires an explicit decision from the architect before implementation.**

---

## Batch Cap Tension: Reconciled

**The apparent conflict:**
- Risk assessment: "max 8 questions" (2 batches × 4)
- User decision: conditional 3rd batch (up to 12 total)
- Architect's spec: "max 8 questions" (no 3rd batch)

**Reconciliation:**
- My constraint was a recommendation; user accepted it as a *default* with a conditional override
- Architect implemented the default correctly but missed the conditional override from task 4
- Fix: add "Batch 3 fires only if ≥3 dimensions missing after Batch 2" to the batching rules
- Practical impact: batch 3 is rare (requires a vague description AND two full batches of questions that don't resolve 3+ dimensions). The 2-batch default is still the common path.

---

## Additional Observations (Non-Blocking)

### Baseline Layer Naming
The architect renamed "Core Questions" to "Baseline Layer" — this is an implementation detail but the 3 questions are preserved verbatim with the same phrasing. No regression risk.

### Scoring Step Delegation
The architect correctly centralizes gate logic and Goal warning in spawn-core.md Scoring Invariant rather than repeating in each command. Spawn commands now defer to the invariant with: "Apply gate logic and Goal warning per `${CLAUDE_PLUGIN_ROOT}/shared/spawn-core.md` Scoring Invariant." This is cleaner than the initial design and reduces drift risk.

### Enforcement Contract Language
The non-compliant format list in scoring enforcement explicitly names "78/100" (the issue #16 example). This is good — concrete examples make compliance unambiguous.

---

## Verdict for Task 7 (Cross-Review)

| Item | Status | Action Needed |
|------|--------|--------------|
| Constraint 1: Batch cap | PARTIAL | Add conditional 3rd batch rule (≥3 missing → allow batch 3) |
| Constraint 2: Dedup contract | PASS | Optional: add 1-2 overlap examples |
| Constraint 3: Skip ordering | PASS | — |
| Constraint 4: 5→6 fix | PASS | — |
| Constraint 5: Goal warning | PASS | Optional: align warning text to task 4 exact phrasing |
| Constraint 6: Priority tiers | PASS | — |
| spec-refinement.md folding | FAIL | Architect must resolve: Option A (fold questions, keep file) or C (fold phase only) |

**The spec is implementation-ready on scoring enforcement.** The discovery protocol needs two targeted fixes (batch 3 conditional, refinement resolution) before it's ready to implement.
