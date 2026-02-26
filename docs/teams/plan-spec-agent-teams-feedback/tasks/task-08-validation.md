---
task: 8
title: "Cross-Validation Report — All Specs"
owner: risk-analyst
team: plan-spec-agent-teams-feedback
date: 2026-02-22
status: complete
---

# Cross-Validation Report

**Verdict summary:** All 6 specs are implementable. Two BLOCKING issues require fixes before compilation. Seven ADVISORY notes for the implementer.

---

## BLOCKING Issues

### BLOCKING-1: R10 references wrong line range for Calibration Mode in spec-quality-scoring.md

**Where:** task-06-spec-r10.md, "File 2: shared/spec-quality-scoring.md" section

**Claim:** R10 cites "Current Calibration Mode section (lines 50–55)" and quotes:
```
## Calibration Mode

For the first 10 sessions using scoring:
- Append to the score display: `(Calibration session [N]/10 — threshold will adjust based on /evaluate-spawn data)`
- Track session count via the retrospective corpus (Phase 2)
```

**Actual file (verified):** This is correct content but note R1 (task-01) also targets this exact same section with a full replacement. R10's instruction is to "append after the existing Calibration Mode section (insert immediately after the last bullet)" — but R1 will have already replaced that entire section. R10 must execute AFTER R1, and its append target line becomes the last bullet of R1's new content, not the original bullet.

**Required fix:** The compilation task (task-10) must sequence R1 before R10 on spec-quality-scoring.md. R10's "Append after" instruction should reference R1's final bullet as the anchor:
```
- If `docs/retrospectives/` does not exist or contains no files: display N=0
```

**Severity:** BLOCKING — applying R10 to the pre-R1 file will produce duplicate/conflicting Calibration Mode content.

---

### BLOCKING-2: R11 Build profile insertion point references a non-existent section at implementation time

**Where:** task-02-spec-r4-r11.md, "Change 1: Add Gate Bypass Question to Build Profile"

**Claim:** "Insertion point: After the `### Question 3: Score Accuracy` block added by R3, before `### Deferred Section`."

**Problem:** At the time R11 is applied, `### Question 3: Score Accuracy` will only exist if R3 has already been applied. The spec correctly notes "Implement R3 before R11 for the Build profile" but does not specify what anchor text to use as the insertion boundary for the implementer. If R3 is not yet applied, R11 has no valid insertion point for the Build profile.

**Required fix:** Make the dependency explicit and provide a fallback anchor. Add to R11 Change 1: "If R3 is not yet applied, do not implement the Build profile change — implement Think and Create profile changes only (Changes 2 and 3 are independent)."

**Severity:** BLOCKING for Build profile R11 if implementation order is not enforced. Think/Create changes remain unblocked.

---

## ADVISORY Notes

### ADVISORY-1: R1 insertion point text is verified correct

Actual `spec-quality-scoring.md` lines 50–54 match R1's quoted "Existing text (lines 52–55)" exactly (line offset of 2 is acceptable — the content match is what matters). No issue.

### ADVISORY-2: R4 insertion point text is verified correct

Actual `shutdown-protocol.md` lines 46–54 match R4's quoted "Existing Phase 4 text (lines 48–54)" exactly. Protocol Block verbatim (lines 60–65) matches R4's quoted before-text exactly. Critic correction (nudge in shutdown-protocol, not spawn-core) is correctly applied in the spec.

### ADVISORY-3: R2 insertion text is verified correct

`shutdown-protocol.md` Phase 1 heading `### Phase 1: Participant Retrospective` exists at line 15. R2's insertion instruction "insert BEFORE `### Phase 1: Participant Retrospective`" is valid. `scenario-collection.md` `- **Partial**: ...` bullet exists at line 98 — insertion anchor is valid.

### ADVISORY-4: R3 Deferred section text matches exactly

Actual `SKILL.md` lines 84–89 match R3's quoted Deferred section exactly, including the score accuracy checkbox. R3 Change 1 (remove score accuracy from Deferred) and Change 2 (add Question 3 before Deferred) are both correctly targeted. The template at lines 160–167 and 178–186 are verified against the actual file — the frontmatter and body match the before-text in R3.

### ADVISORY-5: R5 cold-start guard threshold is correct per Critic

The Critic required `< 3` matching retrospectives triggers skip. R5 spec says "If total matched count < 3: skip scan." Correct. The spec also correctly handles the two-format problem (profile: vs type: fields) that the Critic flagged as brittleness.

### ADVISORY-6: R7 scope is correctly limited to Research+Planning only

R7 spec explicitly states "Skip for: Debug, Feature, Design, Brainstorm, Productivity, Review modes." The Critic's scope reduction (Research + Planning only) is applied correctly.

### ADVISORY-7: R2 effort is correctly re-rated Medium

R2 spec frontmatter shows `effort: Medium` — matching the Critic's correction from Low to Medium.

---

## Cross-Spec Consistency Check

### 3-Question Build Profile Cap

| Question | Source | Status |
|---|---|---|
| Auto-derived: Scenario Coverage | Existing | Counts toward cap |
| Q1: Setup Alignment | Existing | Explicit question 1 |
| Q2: Gap Identification (conditional) | Existing | Explicit question 2 |
| Q3: Score Accuracy | R3 | Added — at cap limit |
| Q4: Gate Bypass (conditional) | R11 | Conditional only when score below threshold |

**Assessment:** R3 takes Q3 (the cap limit). R11 makes Q4 conditional (only fires when score was below threshold AND gate was bypassed). The SKILL.md frontmatter states "at most 2 explicit questions per profile (hard cap: 3 including auto-derived)." R11's Q4 is technically a 4th question but only fires when gate-bypass is relevant. This is a judgment call — the cap as stated is "at most 2 explicit questions" not "at most 3 total". R11 adds a conditional question that wasn't counted in the cap definition. **Implementer must decide: treat conditional questions as inside or outside the cap.** Both specs acknowledge the conflict and R3 explicitly takes priority.

### Dependency Chain Verification

| Chain | Status |
|---|---|
| R6 → R5 | Verified — R6 spec states "R5 (prerequisite — injection is meaningless without scan)" |
| R5a → R5 | Verified — R5a spec states "If R5 is not implemented, the section will have no data" |
| R10 → R3 + R11 | Verified — R10 spec states both as dependencies; adds "blocked by data volume" note |
| R7 → none | Verified — R7 spec states "R5 (retrospective scan): Not required. R7 is independent." |
| R2 → none | Verified — R2 spec states "None required — R2 is independent" |

### R7 Placement Conflict with R5a in planning-blueprints.md

R5a adds `### Lessons Applied` after `### Project Analysis` in the Planning Context Template. R7 adds `### Expected Outcomes` after `### Lessons Applied`. Both specs acknowledge this: R7 says "final sequence: Project Analysis → Lessons Applied → Expected Outcomes" and "Spec each insertion point relative to the section before it." This is correctly handled — no conflict if R5a is applied before R7 on planning-blueprints.md.

### R2 Protocol Block Conflict with R4 Protocol Block

Both R2 and R4 modify the Protocol Block verbatim text in `shutdown-protocol.md`. R2 adds a Phase 0 bullet to the top of the protocol block. R4 adds a nudge check bullet at the bottom. Both specs quote the same before-text — **they must be applied sequentially, not independently**. Applying both independently against the original before-text will produce two conflicting replacements. The compilation task must apply R2's Protocol Block change first, then apply R4's change to R2's output.

**Severity:** ADVISORY — must be handled in compilation sequencing, not a spec error.

---

## Missing Spec Coverage

### evaluate-spawn SKILL.md — Question cap signal for implementer

The SKILL.md description block says "at most 2 explicit questions per profile (hard cap: 3 including auto-derived)" but the specs (R3 + R11) add both Q3 and Q4 to Build profile. The implementer needs guidance on whether to update the SKILL.md description to reflect the new question count. No spec covers this metadata update.

**Recommendation:** Compiler (task-10) should note this as an implementation detail for the `/spawn-build` team.

### No spec for updating `docs/memory.md` version table

R10 creates a new file (`commands/calibrate-scoring.md`). Per CLAUDE.md, versions must sync across 4 points including `docs/memory.md`. No spec covers the memory.md update. This is a plugin maintenance concern, not a blocking implementation issue.

---

## Critic Corrections Verification

| Critic Correction | Applied In Spec? | Verified |
|---|---|---|
| R4 placement: shutdown-protocol.md (not spawn-core.md) | task-02 spec targets shutdown-protocol.md | YES |
| R2 effort re-rated Medium | task-03 frontmatter shows `effort: Medium` | YES |
| R7 scoped to Research+Planning only | task-05 "Skip for" list includes Design/Brainstorm/Productivity/Review | YES |
| R5 cold-start guard < 3 matching files | task-04 Step 2 says "If total matched count < 3: skip scan" | YES |
| R2 + R8 merged into single spec | task-03 covers both shutdown-protocol.md (primary) and scenario-collection.md (reference) | YES |

---

## Summary

| Category | Count | Items |
|---|---|---|
| BLOCKING | 2 | R10/R1 sequencing on spec-quality-scoring.md; R11 Build profile anchor dependency |
| ADVISORY | 7 | See ADVISORY-1 through ADVISORY-7 above |
| Insertion points verified correct | 4/4 | R1, R3, R4, R2 all match actual file content |
| Dependency chain intact | 5/5 | All stated dependencies are consistent |
| Critic corrections applied | 5/5 | All binding corrections from task-07 are present |

**Recommendation:** Resolve BLOCKING-1 and BLOCKING-2 in the compilation task (task-10) via explicit sequencing notes. All specs are otherwise correct and implementable.
