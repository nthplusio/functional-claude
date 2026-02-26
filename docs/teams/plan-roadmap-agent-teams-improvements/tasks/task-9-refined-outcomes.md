# Task 9: Refined Outcomes Based on Feasibility Feedback

## Summary

Task 7 (success criteria) has been updated in-place with all feasibility refinements from Task 8. This document records the delta: what changed, why, and what was not changed.

---

## Changes Applied to Task 7

### Phase 1 Changes

**1b. Specification Quality Scoring**
- Default threshold lowered: 60 → 50. Rationale: without retrospective calibration data, 60 is arbitrary and may block valid spawns. Conservative start with explicit calibration framing ("Session #N of 10. Threshold calibration in progress.") prevents the gate from being tuned out.
- Added acceptance condition: each scoring dimension must be evaluated with a binary-checkable question. Prevents the fluency trap — Claude scoring fluent prose as high-quality spec.

**1c. External Scenario Validation**
- Added: discovery interview must include 1 concrete Given/When/Then example before prompting Seth to write his own. Prevents vague scenarios like "Given a user, when they log in, then it works."
- Minimum bar lowered: from implied perfection to "2 scenarios minimum." Format compliance matters less than coverage.
- Added: Tester must produce `### Scenario Notes` flagging scenarios invalidated by scope drift. Prevents false passes when a feature changes mid-session.

### Phase 2 Changes

**2b. Post-Spawn Workflow Evaluation**
- Question count hard-capped at 3 (was 3–4). Each additional question reduces completion rate.
- Each question now requires a structured follow-up that maps the answer to a specific fix category (spec format / refinement question / teammate instructions). Prevents free-text answers from being unactionable.
- Added: spawn-build and spawn-think completion messages include soft prompt "Run `/evaluate-spawn` to capture session learnings? (optional)." Reduces adoption friction without forcing it. Not a hook — the session ends cleanly regardless.

### Phase 3 Changes

**3a. System-Level Documentation Output**
- Model changed from opt-in (`--include-adr`) to opt-out (`--skip-adr`). Rationale: opt-in tools don't get used. ADRs are highest value when the corpus accumulates; that requires default behavior. `--skip-adr` provides an escape hatch.
- Added: Documentation teammate receives refinement phase output (edge cases, constraints, ambiguity log) as ADR context. Without this, ADRs contain implementation observations but not decision rationale.

---

## What Was Not Changed

| Decision | Rationale for Keeping |
|---|---|
| Phase order (1 → 2 → 3) | Dependency chain validated; no feasibility issue found with sequencing |
| Phase 1 bundle size | Risk flagged but no structural change needed — mitigation is release strategy (anchor on 1a), not scope reduction |
| 2a. AI Review Checklist | Low feasibility risk; criteria accurate as written |
| 2c. Mock Repository | Correct scoping confirmed; no changes needed |
| 3b. Insight Embedding | No feasibility issues; criteria accurate |
| Evaluation in Phase 2 (not Phase 1) | Confirmed correct — needs Phase 1 data to calibrate rubric meaningfully |
| `/evaluate-spawn` as a skill (not Stop hook) | Confirmed; Stop hook is wrong granularity for voluntary retrospective |

---

## Phase Independence — Updated Assessment

After feasibility review, phase independence holds. The one dependency that could undermine it:

**Phase 2 Evaluation depends on Phase 1 calibration data.** If Phase 1's scoring threshold is wrong (too high or too low), the evaluation's rubric-calibration value is reduced. Mitigation already applied: conservative threshold (50) + calibration notice makes Phase 1 self-labeling as "calibration mode" until retrospective data arrives.

**Phase 3 ADRs depend on Phase 1 refinement output** for rich content. Without refinement, ADRs can still be written — they'll contain implementation observations without the constraint/edge-case context from the refinement phase. Value is lower but not zero.

---

## Criteria Quality Check

Each refined acceptance condition now meets this bar:
- **Binary:** can be verified yes/no without judgment calls
- **Specific:** references a named file, section, or behavior
- **Independent:** can be checked without running the full system (most are readable from files or prompts)
- **Passable to /spawn-build:** each item is concrete enough to serve as a task for an implementation team
