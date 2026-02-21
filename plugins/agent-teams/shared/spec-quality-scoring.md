# Spec Quality Scoring

Binary-checkable scoring system that evaluates compiled discovery interview context. Produces a 0–100 score with dimension breakdown and gates spawning when score is below threshold.

## Why This Exists

Without scoring, there's no signal on whether a spec is complete enough to produce good team output. Claude may score its own fluent prose as high-quality (the "fluency trap"). Binary-checkable questions prevent this by evaluating specific, verifiable properties — not impressions.

## Scoring Dimensions

5 dimensions, each worth 20 points. Every dimension uses a single binary yes/no question.

| Dimension | Binary Question | Points | What to Check |
|---|---|---|---|
| Goal clarity | "Does the Goal section include a specific, measurable outcome? (e.g., 'users can export reports as PDF' not 'improve reporting')" | 20 | Look for a concrete verb + noun describing observable behavior |
| Constraints specificity | "Are at least 2 technical or behavioral constraints named explicitly in the Constraints section?" | 20 | Count explicit constraints (framework, library, pattern, timeline, etc.) |
| Success criteria measurability | "Does the Success Criteria section contain at least 1 testable condition? (e.g., 'API returns 200 with valid payload' not 'works correctly')" | 20 | Look for a condition that could be written as an automated test |
| Edge case coverage | "Are at least 2 non-happy-path scenarios enumerated in the Edge Cases section?" | 20 | Count explicit edge cases; if Edge Cases section says "Refinement skipped", score 0 |
| Acceptance criteria presence | "Is there at least 1 acceptance criterion that describes end-to-end user-visible behavior?" | 20 | Look for a behavior description that spans the full feature, not just a component. In feature mode, the `### Acceptance Scenarios` section (from scenario collection) satisfies this — score 0 if scenarios were skipped and no other acceptance criteria exist |

## Scoring Protocol

1. Read the compiled `## [Team-Type] Context` section (after refinement)
2. Evaluate each dimension using ONLY its binary question — answer yes (20 points) or no (0 points)
3. Sum the scores
4. Display: `Spec Quality Score: [N]/100 [Goal: ✓/✗] [Constraints: ✓/✗] [Edge Cases: ✓/✗] [Success: ✓/✗] [Acceptance: ✓/✗]`

## Gate Logic

- Default threshold: 50 (configurable via `--min-score N` flag in spawn commands)
- If score >= threshold: proceed to spawn. Display score as confirmation.
- If score < threshold: display score + list missing dimensions + prompt:
  ```
  Spec Quality Score: [N]/100 [dimension breakdown]

  Explicit quality gates prevent the J-curve dip — spawning on an incomplete spec
  wastes more time than refining upfront.

  Missing: [list of failed dimensions with what's needed]

  Options:
  1. Refine the spec (re-run discovery interview for missing areas)
  2. Proceed anyway (type "proceed")
  ```
- If user selects "proceed", spawn proceeds. Score is still included in the spawn prompt.

## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)

## Integration with Spawn Prompt

Include the score in the spawn prompt's Context section as a `### Spec Quality` subsection:

```markdown
### Spec Quality
Score: [N]/100 [Goal: ✓] [Constraints: ✓] [Edge Cases: ✓] [Success: ✓] [Acceptance: ✗]
```

This gives teammates visibility into spec quality at spawn time.

## Skip Behavior

If the discovery interview was skipped entirely (all answers in `$ARGUMENTS`), scoring still runs against whatever context is available. The score may be low — that's the intended signal.
