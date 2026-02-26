---
task: 1
title: "Spec: R1 (Calibration Counter) and R3 (Score Accuracy Immediate)"
owner: architect
team: plan-spec-agent-teams-feedback
date: 2026-02-22
status: complete
recs: [R1, R3]
phase: A
gaps: [G4, G7]
files-modified:
  - plugins/agent-teams/shared/spec-quality-scoring.md
  - plugins/agent-teams/skills/evaluate-spawn/SKILL.md
---

# Spec: R1 — Fix Calibration Session Counter

## Summary

`shared/spec-quality-scoring.md` contains a Calibration Mode section that displays "Calibration session [N]/10" — but [N] is a placeholder with no implementation. The plugin never reads `docs/retrospectives/` to compute the actual count. This makes the calibration promise misleading and prevents users from knowing how close they are to meaningful threshold data.

**Change:** Replace the placeholder with an instruction to count retrospective files with a scored `spec-score:` frontmatter field. The count becomes the accurate N in "Calibration session N/10."

---

## Files Modified

- `plugins/agent-teams/shared/spec-quality-scoring.md`

---

## Insertion Point

Replace the entire `## Calibration Mode` section.

**Existing text (lines 52–55):**

```markdown
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

**Replace with:**

```markdown
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
```

---

## Exact Replacement Diff

**Before:**
```
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

**After:**
```
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
```

---

## Acceptance Criteria

1. When `docs/retrospectives/` contains 2 files with `spec-score: 4/6` and 1 file with `spec-score: "not scored"`, the display reads "Calibration session 2/10"
2. When `docs/retrospectives/` contains 0 files, the display reads "Calibration session 0/10"
3. When `docs/retrospectives/` contains 10 or more files with non-"not scored" spec-score values, the calibration suffix is omitted from the score display
4. `spec-score: "not scored"` (Think and Create profile retrospectives) does NOT increment the counter

---

## Edge Cases

| Situation | Behavior |
|---|---|
| `docs/retrospectives/` directory missing | N=0 — display "Calibration session 0/10" |
| File exists but has no `spec-score:` field | Skip — do not count |
| `spec-score: "not scored"` | Skip — do not count |
| `spec-score: 0/6` | Count — scored as zero but still calibration data |
| N >= 10 | Omit calibration suffix entirely from score display |
| Mixed files: some scored, some not | Count only scored files (not "not scored") |

---

## Dependencies

None. R1 is independent. R10 (`/calibrate-scoring` command) benefits from R1 being correct but does not require it.

---

---

# Spec: R3 — Move Score Accuracy from Deferred to Immediate

## Summary

`skills/evaluate-spawn/SKILL.md` Build profile has a "Deferred Section" with a score accuracy checkbox: `- [ ] Score accuracy — Did the spec quality score predict actual output quality?`. This checkbox is never revisited in practice — it produces orphaned data that no subsequent step reads. The deferred timing assumption is also wrong: implementation difficulty is evaluable at spawn completion, not weeks later.

**Change:** Remove the score accuracy checkbox from the Deferred section. Add it as an explicit immediate question in the Build profile. Write the answer to retrospective frontmatter so R10 (calibrate-scoring command) can aggregate it.

**Constraint:** Build profile has a hard cap of 3 questions (including auto-derived scenario coverage). Current explicit questions: Q1 (Setup Alignment) + Q2 (Gap Identification, conditional). Adding score accuracy as Q3 is within cap. R11 (gate bypass tracking) is also targeting this profile — if both R3 and R11 are implemented, R3 takes priority if a cap conflict arises.

---

## Files Modified

- `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

---

## Change 1: Remove from Deferred Section

**Existing Deferred section text (lines 84–89):**

```markdown
### Deferred Section

These items cannot be evaluated at spawn completion. They are included as checkboxes in the retrospective file for the user to fill in during periodic rubric reviews:

- [ ] **Score accuracy** — Did the spec quality score predict actual output quality? (matched / too optimistic / too pessimistic)
- [ ] **First fix** — What was the first thing you had to fix after using the output?
```

**Replace with:**

```markdown
### Deferred Section

These items cannot be evaluated at spawn completion. They are included as checkboxes in the retrospective file for the user to fill in during periodic rubric reviews:

- [ ] **First fix** — What was the first thing you had to fix after using the output?
```

(Score accuracy checkbox removed. First fix remains deferred — it requires post-use experience.)

---

## Change 2: Add Question 3 to Build Profile

**Insertion point:** After the `### Question 2: Gap Identification (conditional)` block, before `### Deferred Section`.

**Existing text at insertion boundary (line 83):**

```markdown
### Deferred Section
```

**Insert before that line:**

```markdown
### Question 3: Score Accuracy

**"Did the spec quality score reflect actual implementation difficulty? (A higher score should predict an easier build.)"**

| Option | Value written to frontmatter |
|---|---|
| Matched — score reflected actual difficulty | `score-accuracy: matched` |
| Score too optimistic — build was harder than the score suggested | `score-accuracy: too-optimistic` |
| Score too pessimistic — build was easier than the score suggested | `score-accuracy: too-pessimistic` |
| No spec score was used | `score-accuracy: not-scored` |

```

---

## Change 3: Update Build Profile Template (Output Format)

**Existing Build Profile Template frontmatter (lines 160–167):**

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: build
type: [feature|debug]
spec-score: [N/6 dimensions or "not scored"]
scenario-coverage: [N validated / M total (X%) or "no table found" or "N/A"]
---
```

**Replace with:**

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: build
type: [feature|debug]
spec-score: [N/6 dimensions or "not scored"]
scenario-coverage: [N validated / M total (X%) or "no table found" or "N/A"]
score-accuracy: [matched|too-optimistic|too-pessimistic|not-scored]
---
```

**Existing Build Profile Template body (lines 178–186):**

```markdown
## Setup Alignment
[User's answer to Question 1]

## Gap Identification
[User's answer to Question 2, or "No gaps identified" if Q1 was "Yes"]

## Deferred (fill in during rubric review)
- [ ] **Score accuracy**: matched / too optimistic / too pessimistic
- [ ] **First fix**: [describe first change needed after using output]
```

**Replace with:**

```markdown
## Setup Alignment
[User's answer to Question 1]

## Gap Identification
[User's answer to Question 2, or "No gaps identified" if Q1 was "Yes"]

## Score Accuracy
[User's answer to Question 3]

## Deferred (fill in during rubric review)
- [ ] **First fix**: [describe first change needed after using output]
```

---

## Change 4: Update Rubric Update Process (reference cleanup)

**Existing text in Rubric Update Process section referencing deferred score accuracy (line 256):**

```markdown
**Deferred checkboxes (Build profile):**
After 3+ evaluations, review the deferred sections across retrospective files to identify score accuracy trends and common first-fix categories.
```

**Replace with:**

```markdown
**Deferred checkboxes (Build profile):**
After 3+ evaluations, review the deferred sections across retrospective files to identify common first-fix categories. Score accuracy is now captured immediately (Question 3) — aggregate via `/calibrate-scoring` after 10+ Build profile retrospectives exist.
```

---

## Acceptance Criteria

1. Build profile evaluation asks Question 3 ("Did the spec quality score reflect actual implementation difficulty?") with three options
2. Answer is written to `score-accuracy:` frontmatter field in the retrospective file
3. Deferred section no longer contains the score accuracy checkbox
4. Existing Build profile retrospective files with the old checkbox format remain valid — they just have a deferred checkbox that was never filled in (backward-compatible)
5. Think and Create profile output format is unchanged
6. `score-accuracy: not-scored` is written when no spec score was used (guards against null in R10 aggregation)

---

## Edge Cases

| Situation | Behavior |
|---|---|
| User ran spawn without spec scoring | Offer "No spec score was used" option — write `score-accuracy: not-scored` |
| User doesn't remember score | Offer "No spec score was used" as fallback — not "not applicable" — to distinguish from skipped scoring |
| Q1 was "Yes" (no gap) but score was wrong | Q3 is unconditional — ask regardless of Q1/Q2 answers |
| Discovery interview was skipped entirely | Score accuracy still meaningful — spawn had an auto-scored spec |

---

## Interaction with R11 (Gate Bypass Tracking)

R11 adds another question to evaluate-spawn profiles. The Build profile hard cap is 3 questions including auto-derived scenario coverage:
- Auto-derived: Scenario Coverage (counts as Q1 toward cap)
- Q1: Setup Alignment
- Q2: Gap Identification (conditional — only if Q1 ≠ "Yes")
- Q3: Score Accuracy (R3, this spec)

R11 would add Q4. If R11 is implemented on the Build profile, one question must be deferred or made conditional. **Priority: R3 > R11 for Build profile.** R11 can be added to Think and Create profiles without cap conflict.

---

## Dependencies

- R1 (calibration counter): Independent of R3, but R1 + R3 together make the calibration claim honest
- R10 (`/calibrate-scoring` command): Depends on R3 being in place — R10 reads `score-accuracy:` frontmatter that R3 creates
