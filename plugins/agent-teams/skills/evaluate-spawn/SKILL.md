---
name: evaluate-spawn
description: |
  This skill should be used when the user asks to evaluate a completed team spawn session, capture session learnings, or review how a spawn went. Use this skill when the user says "evaluate spawn", "evaluate-spawn", "how did the spawn go", "capture learnings", "review spawn session", "spawn retrospective", or at the soft prompt after a team completes its work.

  This is a voluntary post-spawn evaluation that captures session learnings and produces structured retrospective data. It asks exactly 3 questions (hard cap) to minimize friction while maximizing signal.
version: 0.15.3
---

# Post-Spawn Workflow Evaluation

Voluntary evaluation skill that captures session learnings after a team completes its work. Produces structured retrospective data written to `docs/retrospectives/[team-name].md`.

## When to Use

- After any team spawn completes (feature, debug, research, planning, review, design, brainstorm)
- Prompted via soft suggestion in spawn completion messages — never blocks session end
- Can also be invoked manually at any time: `/evaluate-spawn`

## Evaluation Protocol

Ask exactly 3 questions (hard cap). Present all via `AskUserQuestion` in a single batch.

### Question 1: Score Prediction Accuracy

**"Did the spec quality score predict actual output quality?"**

| Option | Description |
|---|---|
| Score matched reality | High spec score → good output, or low score → poor output |
| Score was too optimistic | Spec scored well but output had issues |
| Score was too pessimistic | Spec scored low but output was fine |
| N/A — no scoring was used | Scoring wasn't part of this spawn |

### Question 2: First Fix Needed

**"What was the first thing you had to fix or change after reviewing the team's output?"**

Free text answer, followed by structured follow-up:

**"Why did this need fixing?"**

| Option | Description |
|---|---|
| Spec didn't mention it | The discovery interview missed this requirement |
| Refinement didn't surface it | Edge-case refinement should have caught this |
| Team ignored it | The spec covered it but the team didn't follow through |
| Nothing needed fixing | Output was correct as delivered |

### Question 3: Scenario Coverage

**"What fraction of pre-spawn scenarios did the Tester validate?"**

| Option | Description |
|---|---|
| All scenarios validated | Every scenario in `docs/scenarios/` was checked |
| Most validated (>50%) | Majority covered, some missed |
| Few validated (<50%) | Most scenarios were not checked |
| No scenarios existed | Scenario collection was skipped for this spawn |
| N/A — no Tester role | This team type doesn't include a Tester |

## Output Format

Write evaluation results to `docs/retrospectives/[team-name].md`. Create the `docs/retrospectives/` directory if it doesn't exist.

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
spec-score: [N/100 or "not scored"]
type: [feature|debug|research|planning|review|design|brainstorm]
---

# Retrospective: [team-name]

## Score Accuracy
[User's answer to Question 1]

## First Fix
**What:** [User's free text answer]
**Root cause:** [spec gap | refinement gap | team ignored | nothing needed]

## Scenario Coverage
[User's answer to Question 3]

## Actionable Insights
[1-2 bullet points synthesized from the answers — what should change in the spec pipeline, refinement questions, or team instructions to prevent this issue next time. If "nothing needed fixing", note what worked well.]
```

## Rubric Update Process

Evaluations produce input; rubric updates are a **manual human step**.

The user reads `docs/retrospectives/` periodically and updates:
- `shared/spec-quality-scoring.md` — Adjust dimensions or thresholds based on score accuracy data
- `shared/spec-refinement.md` — Add new question categories based on recurring "refinement didn't surface it" patterns
- `shared/discovery-interview.md` — Adjust core questions based on recurring "spec didn't mention it" patterns

After 3+ evaluations, the retrospective corpus should show at least one traceable rubric update.
