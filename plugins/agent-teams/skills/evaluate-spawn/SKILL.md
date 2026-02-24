---
name: evaluate-spawn
description: |
  This skill should be used when the user asks to evaluate a completed team spawn session, capture session learnings, or review how a spawn went. Use this skill when the user says "evaluate spawn", "evaluate-spawn", "how did the spawn go", "capture learnings", "review spawn session", "spawn retrospective", or at the soft prompt after a team completes its work.

  This is a voluntary post-spawn evaluation with profile-based questions tailored to all spawn types (build, think, create). Build profile asks up to 4 questions (3 explicit + 1 conditional gate bypass); Think and Create profiles ask up to 3 questions (2 explicit + 1 gate bypass). Hard cap includes auto-derived scenario coverage for Build.
version: 0.21.1
---

# Post-Spawn Evaluation

Voluntary evaluation skill that captures session learnings after a team completes its work. Uses **profile-based evaluation** — each spawn category gets questions answerable at the moment of completion. Produces structured retrospective data written to `docs/retrospectives/[team-name].md`.

## When to Use

- After any team spawn completes — feature, debug, research, planning, review, design, brainstorm, productivity
- Prompted via soft suggestion in spawn completion messages — never blocks session end
- Can also be invoked manually at any time: `/evaluate-spawn`

## Profile Selection

Detect the spawn type from the team name pattern (e.g., `feature-*`, `research-*`, `design-*`) or from `docs/teams/[team-name]/` artifacts. If the type cannot be determined, ask:

**"What type of spawn was this?"**

| Option | Maps to profile |
|---|---|
| Feature or Debug | Build |
| Research, Planning, or Review | Think |
| Design, Brainstorm, or Productivity | Create |

Route to the matching profile below.

---

## Build Profile (feature, debug)

Spec-driven teams that produce code. Has auto-derived scenario coverage, three explicit questions (plus one conditional gate bypass question), and a deferred section.

### Auto-Derived: Scenario Coverage

Parse the Tester's `### Scenario Notes` table from the team's task output or `docs/teams/[team-name]/` artifacts. The expected format (from `shared/scenario-collection.md`):

```markdown
### Scenario Notes

| Scenario | Status | Notes |
|---|---|---|
| [name] | Validated / Invalidated / Partial | [details] |
```

Count statuses:
- **Validated**: scenarios confirmed working
- **Invalidated**: scenarios that failed
- **Partial**: scenarios partially satisfied

Report as: `N validated / M total (X%)`. If no `### Scenario Notes` table is found, record `scenario-coverage: "no table found"`.

### Question 1: Setup Alignment

**"Did the discovery setup capture what mattered for the implementation?"**

| Option | Description |
|---|---|
| Yes — setup covered the key areas | Discovery interview and spec captured the important requirements |
| Partially — missed some areas | Some important aspects weren't surfaced during setup |
| No — setup missed the point | The discovery interview or spec fundamentally misaligned with the real need |

### Question 2: Gap Identification (conditional)

Only ask if Question 1 answer is **not** "Yes":

**"What did the setup miss, and where should it have been caught?"**

Free text answer for what was missed, followed by:

| Option | Description |
|---|---|
| Discovery interview should have asked | The core interview questions didn't cover this area |
| Spec refinement should have surfaced it | The refinement step should have caught this edge case |
| Scoring should have flagged it | A low score on a dimension should have prompted rework |
| Team should have caught it during work | The spec was fine — the team missed something it covered |

### Question 3: Score Accuracy

**"Did the spec quality score reflect actual implementation difficulty? (A higher score should predict an easier build.)"**

| Option | Value written to frontmatter |
|---|---|
| Matched — score reflected actual difficulty | `score-accuracy: matched` |
| Score too optimistic — build was harder than the score suggested | `score-accuracy: too-optimistic` |
| Score too pessimistic — build was easier than the score suggested | `score-accuracy: too-pessimistic` |
| No spec score was used | `score-accuracy: not-scored` |

### Question 4: Gate Bypass (conditional)

Only ask if `spec-score:` frontmatter value is present AND the score was below the gate threshold (default: 4/6):

**"The spec quality gate showed a score below threshold. Did you proceed anyway, and if so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| Did not bypass — I refined the spec first | `gate-bypassed: false` |
| Bypassed — override was correct (spec was sufficient despite score) | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

If score met or exceeded threshold (no bypass scenario): write `gate-bypassed: false` to frontmatter without asking.

### Deferred Section

These items cannot be evaluated at spawn completion. They are included as checkboxes in the retrospective file for the user to fill in during periodic rubric reviews:

- [ ] **First fix** — What was the first thing you had to fix after using the output?

---

## Think Profile (research, planning, review)

Analysis-driven teams that produce documents, decisions, recommendations.

### Question 1: Coverage

**"Did the team investigate the right questions and areas?"**

| Option | Description |
|---|---|
| Yes — covered the important ground | The analysis addressed the key questions and areas |
| Partially — some gaps | Important questions were addressed but some areas were missed |
| No — wrong focus | The team spent effort on the wrong areas |

### Question 1a: Expected Outcomes Validation (conditional)

Only ask if `### Expected Outcomes` section is present in the team's Context block (check `docs/teams/[team-name]/` artifacts):

**"Did the output address the Expected Outcomes defined before spawning?"**

| Option | Description |
|---|---|
| Yes — all outcomes addressed | The output answered the decision question / met the plan criteria at the specified confidence level |
| Partially — some outcomes addressed | Some outcomes were met but others were not addressed |
| No — outcomes not addressed | The output did not address the pre-spawn definition of done |

Write outcome verdict to retrospective as: `outcomes-addressed: all|partial|none`

If `### Expected Outcomes` section is NOT present: skip Question 1a entirely.

### Question 2: Blind Spots (conditional)

Only ask if Question 1 answer is **not** "Yes":

**"What important angle or concern was missed, and where should it have been caught?"**

Free text answer for what was missed, followed by:

| Option | Description |
|---|---|
| Discovery interview should have scoped it | The initial framing didn't include this angle |
| Team lead should have directed it | The lead's task breakdown missed this area |
| Teammates should have identified it | A teammate with the right focus area should have raised this |

### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

---

## Create Profile (design, brainstorm, productivity)

Creative/output-driven teams that produce ideas, concepts, artifacts, or workflow improvements.

### Question 1: Relevance

**"Did the output address the right problem space?"**

| Option | Description |
|---|---|
| Yes — targeted the actual need | The deliverables address the real problem or opportunity |
| Partially — some drift | Parts of the output are relevant but some effort was misdirected |
| No — wrong problem | The team solved a different problem than what was needed |

### Question 2: Constraint Adherence (conditional)

Only ask if Question 1 answer is **not** "Yes":

**"Were the stated constraints respected, and what was violated?"**

Free text answer for what was violated, followed by:

| Option | Description |
|---|---|
| Constraints weren't communicated clearly | The discovery interview didn't surface the real constraints |
| Constraints were stated but ignored | The team had the information but didn't follow it |
| Constraints conflicted — team chose wrong | The team made a reasonable tradeoff but picked the wrong side |

### Question 3: Gate Bypass

**"Did you override the spec quality gate (or skip it) when setting up this spawn? If so, was that the right call?"**

| Option | Value written to frontmatter |
|---|---|
| No override — gate was not triggered or spec was not scored | `gate-bypassed: false` |
| Bypassed — override was correct | `gate-bypassed: true`, `bypass-verdict: correct` |
| Bypassed — should have refined spec first | `gate-bypassed: true`, `bypass-verdict: should-have-refined` |

---

## Output Format

Write evaluation results to `docs/retrospectives/[team-name].md`. Create the `docs/retrospectives/` directory if it doesn't exist.

### Build Profile Template

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

# Retrospective: [team-name]

## Scenario Coverage
[Auto-derived results: N validated, N invalidated, N partial out of M total]

## Setup Alignment
[User's answer to Question 1]

## Gap Identification
[User's answer to Question 2, or "No gaps identified" if Q1 was "Yes"]

## Score Accuracy
[User's answer to Question 3]

## Gate Bypass
[User's answer to Question 4, or "Gate not triggered" if score met threshold]

## Deferred (fill in during rubric review)
- [ ] **First fix**: [describe first change needed after using output]

## Actionable Insights
[1-2 bullet points synthesized from the answers — what should change in the discovery interview, spec refinement, or team instructions. If no gaps, note what worked well.]
```

### Think Profile Template

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
profile: think
type: [research|planning|review]
spec-score: "not scored"
scenario-coverage: "N/A"
outcomes-addressed: [all|partial|none|"N/A — no Expected Outcomes defined"]
gate-bypassed: [true|false]
bypass-verdict: [correct|should-have-refined|n/a]
---

# Retrospective: [team-name]

## Coverage
[User's answer to Question 1]

## Expected Outcomes Validation
[User's answer to Question 1a, or "N/A — no Expected Outcomes section in team context" if Q1a was skipped]

## Blind Spots
[User's answer to Question 2, or "No blind spots identified" if Q1 was "Yes"]

## Gate Bypass
[User's answer to Question 3]

## Actionable Insights
[1-2 bullet points synthesized from the answers — what should change in discovery scoping, lead direction, or teammate focus areas. If no gaps, note what worked well.]
```

### Create Profile Template

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

# Retrospective: [team-name]

## Relevance
[User's answer to Question 1]

## Constraint Adherence
[User's answer to Question 2, or "No constraint violations" if Q1 was "Yes"]

## Gate Bypass
[User's answer to Question 3]

## Actionable Insights
[1-2 bullet points synthesized from the answers — what should change in constraint communication, team direction, or tradeoff guidance. If no gaps, note what worked well.]
```

## Rubric Update Process

Evaluations produce input; rubric updates are a **manual human step**.

The user reads `docs/retrospectives/` periodically and updates:

**Build profile inputs:**
- `shared/spec-quality-scoring.md` — Adjust dimensions or thresholds based on deferred score accuracy data
- `shared/discovery-interview.md` § Feature-Characteristic Heuristics — Add heuristic rows based on recurring "spec should have surfaced it" patterns. Each new row needs: Feature Characteristic, Trigger Signal, Follow-Up Question.
- `shared/discovery-interview.md` — Adjust core questions based on recurring "discovery interview should have asked" patterns

**Think profile inputs:**
- `shared/discovery-interview.md` — Improve scoping questions based on recurring "discovery should have scoped it" patterns
- Team lead task breakdown patterns — Adjust based on "lead should have directed it" data

**Create profile inputs:**
- `shared/discovery-interview.md` — Improve constraint elicitation based on recurring "constraints weren't communicated" patterns
- Team instructions — Adjust based on "constraints were stated but ignored" patterns

**Deferred checkboxes (Build profile):**
After 3+ evaluations, review the deferred sections across retrospective files to identify common first-fix categories. Score accuracy is now captured immediately (Question 3) — aggregate via `/calibrate-scoring` after 10+ Build profile retrospectives exist.
