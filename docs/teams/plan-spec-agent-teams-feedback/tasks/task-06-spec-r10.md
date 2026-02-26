---
task: 6
title: "Spec R10 — /calibrate-scoring Command"
owner: protocol-designer
team: plan-spec-agent-teams-feedback
date: 2026-02-22
recommendation: R10
phase: C
gaps: [G4, G8, G9]
effort: High
confidence: Medium
files-modified:
  - commands/calibrate-scoring.md (new)
  - shared/spec-quality-scoring.md (reference addition)
dependencies: [R3, R11, "10+ Build retrospectives with score-accuracy data"]
blocked-by-data: true
---

# Spec R10 — `/calibrate-scoring` Command

## Summary

New command that reads all Build profile retrospectives, aggregates `score-accuracy` (from R3) and `gate-bypassed`/`bypass-verdict` (from R11), and surfaces calibration trend data to help the user decide whether to adjust spec quality thresholds. The plugin cannot self-modify — threshold changes remain a manual human step.

**Blocked by data volume:** Do not implement until R3 and R11 are in place AND at least 10 Build profile retrospectives exist with `score-accuracy` data. At current usage rates this is a future milestone, not near-term. The command spec is written now so it's ready when data volume threshold is reached.

**Gaps addressed:**
- G4: Broken calibration promise — static thresholds despite stated mechanism
- G8: No aggregate signal — cannot identify patterns across retrospectives
- G9: Gate bypass untracked — once R11 is in place, bypass patterns can be surfaced

---

## Files Modified

| File | Change Type | Role |
|------|-------------|------|
| `commands/calibrate-scoring.md` | New file | Command definition |
| `shared/spec-quality-scoring.md` | Append reference | Points users to command |

---

## File 1: `commands/calibrate-scoring.md` (new)

**Full file content:**

```markdown
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
```

---

## File 2: `shared/spec-quality-scoring.md`

### Change: Update Calibration Mode section

**Current Calibration Mode section (lines 50–55):**
```markdown
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

**Note:** R1 (calibration counter fix) will update this section to make the session count accurate (reading from `docs/retrospectives/`). R10 adds a reference to the new command. The R1 spec owns the session counter fix. R10 adds only the command reference below.

**Sequencing requirement (BLOCKING-1 fix):** Apply R1 first. R1 replaces the entire Calibration Mode section. R10's append target becomes R1's last bullet:
```
- If `docs/retrospectives/` does not exist or contains no files: display N=0
```
Applying R10 before R1 will produce duplicate/conflicting Calibration Mode content.

**Append after the existing Calibration Mode section (insert immediately after the last bullet):**

```markdown

After 10+ Build profile retrospectives accumulate with score accuracy data (from R3), run `/calibrate-scoring` to aggregate patterns and receive a threshold adjustment recommendation.
```

---

## Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | `commands/calibrate-scoring.md` exists | File present in commands directory |
| 2 | Command reads only Build profile files (profile: build filter) | Process Step 2 specifies filter |
| 3 | Minimum sample threshold enforced (default 10, override with --min-samples) | Step 2 includes threshold check and insufficient-data message |
| 4 | Score accuracy aggregation covers all three states (matched/too-optimistic/too-pessimistic) | Step 3 lists all three states |
| 5 | Gate bypass aggregation gracefully handles missing R11 data | Step 4 specifies skip behavior when R11 absent |
| 6 | Decision tree covers all 5 conditions with explicit threshold values | Step 5 decision table present |
| 7 | "How to Apply" section present with exact file and field to edit | Step 6 present |
| 8 | Command is read-only (no writes unless user asks) | Step 7 specifies display-only output |
| 9 | `spec-quality-scoring.md` references the command | Appended sentence present |
| 10 | `--min-samples 1` bypass documented for checking current data volume | Step 1 mentions this override |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| R3 not yet implemented (no score-accuracy field in any file) | Step 3: all files read as "not-scored" — excluded from analysis. Summary shows "0 files with score accuracy data." Command recommends implementing R3 before running again. |
| R11 not yet implemented (no gate-bypassed field) | Step 4: skip bypass analysis entirely. Note in output. |
| All retrospectives are "matched" (perfect calibration) | Decision tree: "Threshold appears well-calibrated. No change recommended." |
| Mixed signals (30% optimistic, 30% pessimistic, 40% matched) | Decision tree: "Mixed signals — no change recommended. Check per-file detail with --verbose." |
| Team name has non-standard pattern (not feature-* or debug-*) | Profile detection uses frontmatter `profile: build` field only — team name pattern is not used. |
| User runs command with 5 retrospectives and --min-samples 5 | Allowed. Recommendation labeled "low confidence (5 samples)." Full recommendation only at default 10+ samples. |
| Retrospective file is malformed (missing frontmatter) | Skip file. Report: "Skipped N files (malformed frontmatter). Run --verbose to see which." |

---

## Dependencies

- **R3 (score accuracy immediate):** Must be implemented and have data in ≥10 retrospectives before this command delivers value.
- **R11 (gate bypass tracking):** Must be implemented for bypass analysis section. Command still works without R11 — skip bypass section gracefully.
- **Data volume:** 10+ Build retrospectives with R3 `score-accuracy` answered. This is the binding constraint — do not implement until this threshold is reachable.
- **R1 (calibration counter):** Recommended co-implementation — R1 fixes the session counter display in `spec-quality-scoring.md`, R10 adds the command reference. Both touch the same section.

## Implementation Order Note

Implement in this order:
1. R3 (score accuracy as immediate question) — starts building the data corpus
2. R11 (gate bypass tracking) — adds bypass signal
3. Wait for 10+ Build retrospectives
4. R10 (this command) — aggregates the accumulated corpus

Implementing R10 before R3/R11 produces a command that has no data to analyze.
