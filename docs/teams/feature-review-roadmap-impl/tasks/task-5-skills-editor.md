---
task: 5
title: "team-coordination: remove stale Discovery Interview, collapse Blocked Task Behavior, trim User Feedback Gate"
owner: skills-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 5: team-coordination SKILL.md Cleanup

## Result

**604 → 481 lines** (-123 lines, ~20% reduction)

## Changes Made

### 1. Collapsed Blocked Task Behavior (lines 66–83, 18 → 1 line)

Replaced 7-bullet list + "Including in Spawn Prompts" sub-section with a single paragraph pointing to the canonical protocol block. All behavioral rules remain in `shared/task-blocking-protocol.md`.

**Savings: 14 lines**

### 2. Replaced Discovery Interview Pattern section (lines 274–346, 73 → 4 lines)

Replaced full section (When to Include table, Standard Structure code block with stale 5-question format, Adaptive Behavior, Batch Presentation, Output Compilation code block, Canonical Implementations list) with 3-line summary + cross-reference to `shared/discovery-interview.md`.

The old "5 core questions" content was stale — discovery-interview.md uses a 3-core-question format with dynamic follow-ups. This also fixes the correctness issue.

**Savings: 69 lines**

### 3. Trimmed User Feedback Gate section (lines 348–415, partial)

Kept: "How It Differs from Plan Approval" table (7 lines), "Placement Guidance" table (10 lines).
Cut: "When to Include" table (12 lines), "Implementation" code block (14 lines), "Standard Phrasing" block (8 lines).

**Savings: 40 lines**

## Files Modified

- `/home/scoussens/Source/functional-claude/plugins/agent-teams/skills/team-coordination/SKILL.md`
