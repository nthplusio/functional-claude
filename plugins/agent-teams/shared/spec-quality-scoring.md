# Spec Quality Scoring

Pass/fail dimension scoring that evaluates compiled discovery interview context. Produces a dimension count with breakdown and gates spawning when too few dimensions pass.

## Why This Exists

Without scoring, there's no signal on whether a spec is complete enough to produce good team output. Claude may score its own fluent prose as high-quality (the "fluency trap"). Binary-checkable questions prevent this by evaluating specific, verifiable properties — not impressions.

Each dimension is designed through the lens of: **"Does this spec give the build team what they need to succeed?"** — testing whether the spec actually reduces post-build rework, not just structural completeness.

## Scoring Dimensions

6 dimensions, each pass/fail. Every dimension uses a single binary question focused on preventing a specific class of rework.

| Dimension | Binary Question | What It Prevents |
|---|---|---|
| Goal clarity | "Does the Goal section describe a specific, observable behavior?" (e.g., 'users can export reports as PDF' not 'improve reporting') | Teammates building different things |
| Constraints specificity | "Are ≥2 technical constraints named explicitly?" (framework, library, pattern, timeline, etc.) | Wrong framework/library/pattern choices |
| Testable success criteria | "Does Success Criteria contain ≥1 automatable condition?" (e.g., 'API returns 200 with valid payload' not 'works correctly') | "Done" arguments at review time |
| Edge case coverage | "Are ≥2 non-happy-path scenarios enumerated?" (score fail if Edge Cases section says "Refinement skipped") | Fragile implementations that break on edge inputs |
| Acceptance scenarios | "Is there ≥1 end-to-end user-visible behavior described?" (spans the full feature, not just a component. In feature mode, the `### Acceptance Scenarios` section satisfies this — score fail if scenarios were skipped and no other acceptance criteria exist) | Components that work individually but not together |
| API/library accuracy | "Do code snippets use correct method signatures from actual libraries?" (parameter names, return types, schema syntax match the codebase's actual imports) | Post-build type errors and API misuse |

## Scoring Protocol

1. Read the compiled `## [Team-Type] Context` section (after refinement)
2. Evaluate each dimension using ONLY its binary question — answer pass or fail
3. Count passing dimensions
4. Display: `Spec Quality: 5/6 [Goal: ✓] [Constraints: ✓] [Edge Cases: ✓] [Success: ✓] [Acceptance: ✓] [API Accuracy: ✗]`

## Gate Logic

- Default threshold: 4 (configurable via `--min-score N` flag in spawn commands — accepts dimension count)
- If passing >= threshold: proceed to spawn. Display score as confirmation.
- If passing < threshold: display score + list missing dimensions + prompt:
  ```
  Spec Quality: 2/6 [dimension breakdown]

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
- Before displaying the spec quality score, count calibration sessions:
  1. Glob `docs/retrospectives/*.md`
  2. For each file, read the frontmatter `spec-score:` field
  3. Count files where `spec-score:` is present and is NOT the string "not scored"
  4. That count is N
- Append to the score display: `(Calibration session N/10 — threshold will adjust based on /evaluate-spawn data)`
- If N >= 10: omit the calibration suffix — display score without calibration note
- If `docs/retrospectives/` does not exist or contains no files: display N=0

After 10+ Build profile retrospectives accumulate with score accuracy data (from R3), run `/calibrate-scoring` to aggregate patterns and receive a threshold adjustment recommendation.

## Integration with Spawn Prompt

Include the score in the spawn prompt's Context section as a `### Spec Quality` subsection:

```markdown
### Spec Quality
Score: 5/6 dimensions [Goal: ✓] [Constraints: ✓] [Edge Cases: ✓] [Success: ✓] [Acceptance: ✓] [API Accuracy: ✗]
```

This gives teammates visibility into spec quality at spawn time.

## Skip Behavior

If the discovery interview was skipped entirely (all answers in `$ARGUMENTS`), scoring still runs against whatever context is available. The score may be low — that's the intended signal.
