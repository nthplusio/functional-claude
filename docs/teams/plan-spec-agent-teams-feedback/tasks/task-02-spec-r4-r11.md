---
task: 2
title: "Spec: R4 (Retrospective Nudge) and R11 (Gate Bypass Tracking)"
owner: architect
team: plan-spec-agent-teams-feedback
date: 2026-02-22
status: complete
recs: [R4, R11]
phase: A
gaps: [G6, G9, G10]
files-modified:
  - plugins/agent-teams/shared/shutdown-protocol.md
  - plugins/agent-teams/skills/evaluate-spawn/SKILL.md
---

# Spec: R4 — Retrospective Nudge at Session End

## Summary

`shared/shutdown-protocol.md` Phase 4 verifies the AAR file exists before calling TeamDelete. It does not check whether an evaluate-spawn retrospective exists. As a result, `/evaluate-spawn` is never prompted — users routinely complete sessions without capturing learnings. The completion rate is unknown and likely low.

**Change:** Add a soft nudge check to Phase 4 of the shutdown sequence. After verifying the AAR file, check for a `docs/retrospectives/[team-name].md` file (distinct from the AAR at `docs/retrospectives/[team-name]-aar.md`). If absent, display a one-line optional prompt before TeamDelete.

**Placement rationale (from Critic):** The nudge must appear in `shutdown-protocol.md`, not `spawn-core.md`. At spawn creation time there is no retrospective to find — the check must happen after team work completes.

---

## Files Modified

- `plugins/agent-teams/shared/shutdown-protocol.md`

---

## Insertion Point

**Existing Phase 4 text (lines 48–54):**

```markdown
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first

Then call `TeamDelete` to clean up team config and task directories.
```

**Replace with:**

```markdown
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first
5. Check for evaluate-spawn retrospective at `docs/retrospectives/[team-name].md`
6. If that file is absent: display — "No evaluate-spawn retrospective found for this team. Run `/evaluate-spawn` to capture learnings before session ends? (optional — press Enter to skip)"
7. If user runs `/evaluate-spawn`: wait for completion, then proceed to TeamDelete
8. If user skips: proceed to TeamDelete

Then call `TeamDelete` to clean up team config and task directories.
```

---

## Protocol Block Update

The `## Protocol Block` section contains an inlined verbatim block for spawn prompts. The shutdown protocol block embedded in spawn prompts should also reflect the nudge check so that leads acting from the spawn prompt alone have the full protocol.

**Existing Protocol Block verbatim content (lines 61–66):**

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

**Replace with:**

```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md` — if absent, display: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)"
```

---

## Exact Replacement Diffs

**Diff 1 — Phase 4 section:**

Before:
```
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first

Then call `TeamDelete` to clean up team config and task directories.
```

After:
```
### Phase 4: Verify and Delete

Before calling `TeamDelete`:
1. Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md`
2. If missing, prompt user: "AAR file not found. Skip AAR and delete team data? (y/n)"
3. If user confirms skip, proceed with TeamDelete
4. If user declines, run AAR first
5. Check for evaluate-spawn retrospective at `docs/retrospectives/[team-name].md`
6. If that file is absent: display — "No evaluate-spawn retrospective found for this team. Run `/evaluate-spawn` to capture learnings before session ends? (optional — press Enter to skip)"
7. If user runs `/evaluate-spawn`: wait for completion, then proceed to TeamDelete
8. If user skips: proceed to TeamDelete

Then call `TeamDelete` to clean up team config and task directories.
```

**Diff 2 — Protocol Block verbatim:**

Before:
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
```

After:
```
**Shutdown Protocol -- Lead MUST follow when ending the team:**
- Before shutdown, message each teammate: "Before we wrap up — answer briefly: (1) What was your understanding of the goal? (2) What went well in how the team operated? (3) What would you change?"
- Collect all responses before sending any shutdown_request
- After all teammates approve shutdown, run `/after-action-review [team-name]`
- Verify AAR file exists at `docs/retrospectives/[team-name]-aar.md` before calling TeamDelete
- After AAR is verified, check for `docs/retrospectives/[team-name].md` — if absent, display: "No evaluate-spawn retrospective found. Run `/evaluate-spawn` before deleting the team? (optional)"
```

---

## Acceptance Criteria

1. After AAR verification, the lead checks for `docs/retrospectives/[team-name].md` (not the `-aar.md` file)
2. If absent, displays exactly the optional prompt — does not block session end
3. If user responds with `/evaluate-spawn`, the skill runs and then TeamDelete follows
4. If user presses Enter or responds with any skip signal, TeamDelete proceeds immediately
5. If `docs/retrospectives/[team-name].md` already exists, no nudge is displayed
6. The Protocol Block embedded in spawn prompts includes the nudge instruction so leads using only the spawn prompt have the full protocol

---

## Edge Cases

| Situation | Behavior |
|---|---|
| Team ran `/evaluate-spawn` mid-session (manually) | File exists — no nudge displayed |
| Team name contains hyphens (common: `feature-auth-v2`) | Path construction: `docs/retrospectives/feature-auth-v2.md` — no special handling needed |
| AAR was skipped (user confirmed skip) | Still check for evaluate-spawn file — nudge independently of AAR status |
| User runs `/evaluate-spawn` in response to nudge but evaluate-spawn fails partway | Treat as complete — the file may be partially written. Do not re-prompt. |
| Two separate nudges in same session (user ran AAR, then nudge fires for different team) | This cannot happen — nudge fires once per shutdown sequence for one team |

---

## Dependencies

- None. R4 is independent of all other recommendations.
- R4 increases the data volume that R5 (retrospective scan) depends on.

---

---

# Spec: R11 — Gate Bypass Tracking

## Summary

`shared/spec-quality-scoring.md` Gate Logic allows users to type "proceed" to bypass the quality gate when spec score is below threshold. This bypass leaves no record — there is no retrospective signal on whether bypasses were correct decisions. Over time, users may habitually bypass the gate, eroding the quality system without any diagnostic signal.

**Change:** Add one question to all three evaluate-spawn profiles (Build, Think, Create) asking whether the spec quality gate was overridden and whether that was the right call. Write structured frontmatter fields to each retrospective file.

**Constraint (from R3 spec):** Build profile hard cap is 3 questions including auto-derived scenario coverage. R3 uses Q3. R11 would require Q4 on Build profile, which exceeds the cap. **Resolution:** Add R11's gate bypass question to Think and Create profiles without cap conflict. For Build profile, make the gate bypass question conditional — only ask if the spec score was below threshold (the gate-bypass scenario is what we care about; if score passed, the answer is always "no bypass").

---

## Files Modified

- `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

---

## Change 1: Add Gate Bypass Question to Build Profile

The Build profile already has R3's Question 3 (Score Accuracy). R11 must be added as a conditional fourth question to avoid exceeding the 3-question cap when there was no bypass.

**Insertion point:** After the `### Question 3: Score Accuracy` block added by R3, before `### Deferred Section`.

**Fallback (BLOCKING-2 fix):** If R3 is not yet applied, skip the Build profile change (Change 1) — implement Think and Create profile changes only (Changes 2 and 3 are independent). Return to Change 1 after R3 is applied and `### Question 3: Score Accuracy` exists as the anchor.

**Text to insert:**

```markdown
### Question 4: Gate Bypass (conditional)

Only ask if `spec-score:` frontmatter value is present AND the score was below the gate threshold (default: 4/6):

**"The spec quality gate showed a score below threshold. Did you proceed anyway, and if so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| Did not bypass — I refined the spec first | `gate-bypassed: false` |
| Bypassed — override was correct (spec was sufficient despite score) | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

If score met or exceeded threshold (no bypass scenario): write `gate-bypassed: false` to frontmatter without asking.

```

---

## Change 2: Add Gate Bypass Question to Think Profile

**Insertion point:** After `### Question 2: Blind Spots (conditional)` block, before the `---` separator that follows the Create profile section.

**Text to insert after Think Profile's Question 2 block:**

```markdown
### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

```

---

## Change 3: Add Gate Bypass Question to Create Profile

**Insertion point:** After `### Question 2: Constraint Adherence (conditional)` block, before the `---` separator.

**Text to insert after Create Profile's Question 2 block:**

```markdown
### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

```

---

## Change 4: Update All Three Profile Templates (Output Format)

**Build Profile Template — add to frontmatter:**

Existing frontmatter block (after R3 additions):
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

After R11:
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: build
type: [feature|debug]
spec-score: [N/6 dimensions or "not scored"]
scenario-coverage: [N validated / M total (X%) or "no table found" or "N/A"]
score-accuracy: [matched|too-optimistic|too-pessimistic|not-scored]
gate-bypassed: [true|false]
bypass-verdict: [correct|should-have-refined|n/a]
---
```

Add `## Gate Bypass` section to Build Profile Template body, after `## Score Accuracy`:
```markdown
## Gate Bypass
[User's answer to Question 4, or "Gate not triggered" if score met threshold]
```

**Think Profile Template — add to frontmatter:**

Existing:
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: think
type: [research|planning|review]
spec-score: "not scored"
scenario-coverage: "N/A"
---
```

After R11:
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: think
type: [research|planning|review]
spec-score: "not scored"
scenario-coverage: "N/A"
gate-bypassed: [true|false]
bypass-verdict: [correct|should-have-refined|n/a]
---
```

Add `## Gate Bypass` section to Think Profile Template body, after `## Blind Spots`:
```markdown
## Gate Bypass
[User's answer to Question 3]
```

**Create Profile Template — add to frontmatter:**

Existing:
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: create
type: [design|brainstorm|productivity]
spec-score: "not scored"
scenario-coverage: "N/A"
---
```

After R11:
```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: create
type: [design|brainstorm|productivity]
spec-score: "not scored"
scenario-coverage: "N/A"
gate-bypassed: [true|false]
bypass-verdict: [correct|should-have-refined|n/a]
---
```

Add `## Gate Bypass` section to Create Profile Template body, after `## Constraint Adherence`:
```markdown
## Gate Bypass
[User's answer to Question 3]
```

---

## Acceptance Criteria

1. Build profile: gate bypass question asked only when score was below threshold; if score met threshold, `gate-bypassed: false` written without asking
2. Think and Create profiles: gate bypass question asked unconditionally (as Q3)
3. All three profile retrospective files include `gate-bypassed:` and `bypass-verdict:` frontmatter fields
4. `bypass-verdict: n/a` written when `gate-bypassed: false`
5. Existing retrospective files without these fields remain valid — backward-compatible
6. R10 (`/calibrate-scoring`) can aggregate `gate-bypassed` and `bypass-verdict` across Build profile retrospectives

---

## Edge Cases

| Situation | Behavior |
|---|---|
| Think/Create profile — gate is never shown (not scored) | Q3 answer is typically "No override — gate was not triggered" → `gate-bypassed: false` |
| User ran spawn with `--min-score 0` (always passes) | Bypass never triggered — write `gate-bypassed: false` |
| User ran spawn with `--min-score 6` and score was 5/6 — bypassed | Gate bypass question fires — user chooses bypass verdict |
| Score frontmatter is `"not scored"` for Build profile | Bypass question conditionally: if user typed "proceed" for a non-scored spec, ask; otherwise skip |
| User cannot remember whether they bypassed | Default: "No override" — `gate-bypassed: false` |

---

## Dependencies

- R3 (Score Accuracy) for Build profile: R11's Q4 inserts after R3's Q3. If R3 is not implemented, R11's Build insertion point must shift.
- R10 (`/calibrate-scoring` command): Depends on R11 data for bypass trend aggregation.
- Think and Create profiles: No dependencies — R11 adds Q3 independently.

## Implementation Order Note

Implement R3 before R11 for the Build profile. For Think and Create profiles, R11 can be implemented independently.
