---
name: calibrate-scoring
description: "Aggregate Build profile retrospective data to surface spec quality threshold calibration recommendations"
argument-hint: "[--min-samples N] [--verbose]"
---

# Calibrate Scoring

Reads all Build profile retrospectives from `docs/retrospectives/` and aggregates:
- Score accuracy data (requires R3 — "score-accuracy" frontmatter field)
- Gate bypass patterns (requires R11 — "gate-bypassed" and "bypass-verdict" frontmatter fields)

Produces a calibration summary that helps the user decide whether to adjust spec quality thresholds in `shared/spec-quality-scoring.md`. The command surfaces recommendations; **all threshold changes are made manually by the user**.

## Prerequisites

Before running, confirm:

1. R3 (score accuracy immediate question) is implemented in `skills/evaluate-spawn/SKILL.md`
2. R11 (gate bypass tracking) is implemented in `skills/evaluate-spawn/SKILL.md`
3. At least 10 Build profile retrospectives exist with `score-accuracy` data

Run `/calibrate-scoring --min-samples 1` to check what data is currently available regardless of threshold.

## Process

### Step 1: Parse Flags

Extract from `$ARGUMENTS`:
- `--min-samples N` (optional — default 10; minimum retrospectives required before making a recommendation)
- `--verbose` (optional — show per-file detail alongside aggregate)
- Strip flags before proceeding

### Step 2: Collect Build Profile Retrospectives

Read all files at `docs/retrospectives/*.md`. Filter to Build profile only:
- Include files with `profile: build` frontmatter field
- Exclude files with `profile: think`, `profile: create`, or no profile field

Report: `Found N Build profile retrospectives.`

If N < `--min-samples` threshold:
```
Insufficient data for reliable calibration.
Found: N Build retrospectives
Required: [min-samples] (configurable with --min-samples)

Score accuracy question (R3) has been answered in: M of N files
Gate bypass tracking (R11) has been recorded in: P of N files

Run again after more retrospectives accumulate. Current data available with --min-samples 1.
```

If N >= threshold, proceed to Step 3.

### Step 3: Aggregate Score Accuracy

For each Build retrospective, read the `score-accuracy` frontmatter field (R3 output):
- `matched` — spec score predicted actual difficulty correctly
- `too-optimistic` — score was higher than actual implementation difficulty warranted
- `too-pessimistic` — score was lower than actual difficulty warranted
- `not-scored` — legacy file without R3 data (exclude from analysis)

Count and compute:
- `matched`: N files (X%)
- `too-optimistic`: N files (X%) — spec passed gate but implementation was harder than expected
- `too-pessimistic`: N files (X%) — spec was blocked or needed refinement but output was fine

### Step 4: Aggregate Gate Bypass Data

For each Build retrospective, read the `gate-bypassed` and `bypass-verdict` frontmatter fields (R11 output):
- `gate-bypassed: false` — no override
- `gate-bypassed: true, bypass-verdict: correct` — override was the right call
- `gate-bypassed: true, bypass-verdict: should-have-refined` — should have refined spec first

Count bypasses and compute bypass-was-wrong rate.

If R11 data is absent in all files (R11 not yet implemented): skip this section, note "Gate bypass data not available (R11 not implemented)."

### Step 5: Generate Calibration Summary

Display calibration summary:

```
## Spec Quality Calibration Summary
Based on N Build retrospectives (M with score accuracy data)

### Score Accuracy
[X]% matched     [N sessions]
[X]% too optimistic  [N sessions]  ← spec passed gate but build was harder
[X]% too pessimistic [N sessions]  ← spec was refined but output would have been fine

### Gate Bypass Patterns
[P]% of sessions bypassed the quality gate
[Q]% of bypasses were later judged incorrect (should have refined)

### Calibration Recommendation
[See decision tree below]
```

**Decision tree for recommendation:**

| Condition | Recommendation |
|-----------|---------------|
| >50% "too optimistic" (≥5 of 10) | Consider raising default threshold from 4 to 5 dimensions |
| >50% "too pessimistic" (≥5 of 10) | Consider lowering default threshold from 4 to 3 dimensions |
| >30% bypass rate AND >50% bypass-was-wrong | Consider adding friction to bypass path (not automatable — flag for user) |
| >30% bypass rate AND bypass-was-wrong <30% | Bypasses are well-calibrated — no change needed |
| Mixed or <50% in either direction | Threshold appears well-calibrated. No change recommended. |

Display as: `Recommendation: [raise threshold to 5 / lower threshold to 3 / no change needed / insufficient data]`

### Step 6: How to Apply Recommendation

Always end with:

```
## How to Apply

To adjust the threshold, edit `shared/spec-quality-scoring.md`:

Current: Default threshold: 4 (configurable via `--min-score N`)
Change: Default threshold: [N]

The plugin does not self-modify. This is a manual change.

After changing: Run /calibrate-scoring again after 10 more sessions to measure impact.
```

### Step 7: Verbose Output (--verbose flag)

If `--verbose` specified, add per-file detail before the summary:

```
## Per-File Detail
| Retrospective | Score | Score Accuracy | Gate Bypassed | Bypass Verdict |
|---|---|---|---|---|
| [team-name].md | N/6 | matched | false | N/A |
| ...
```

## Output Format (Default)

Display calibration summary in-terminal. Do not write to a file unless user explicitly asks. This is a read-only analysis command.
