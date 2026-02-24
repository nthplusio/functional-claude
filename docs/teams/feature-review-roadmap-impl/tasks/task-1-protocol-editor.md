---
task: 1
title: Rewrite task-blocking-protocol.md
owner: protocol-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 1: task-blocking-protocol.md Rewrite

## Changes Made

**File:** `plugins/agent-teams/shared/task-blocking-protocol.md`

### 1. Split idle bullet + RETROSPECTIVE EXCEPTION

Replaced single bullet 3 ("go idle silently") with two bullets:
- Idle bullet: "blocked or complete" (adds complete), removes "silently", explains system mechanism
- RETROSPECTIVE EXCEPTION: standalone bold named bullet with exact trigger description and sequencing constraint (answer before approving shutdown_request)
- 3 few-shot examples embedded immediately after RETROSPECTIVE EXCEPTION

### 2. Few-shot for blocked task handling

Added 3 examples (CORRECT/WRONG/WRONG) after "NEVER begin work on a blocked task" bullet.

### 3. Ownership bullets

Removed shutdown_request bullet (belongs in shutdown-protocol.md only — R8).
Added 2 new ownership bullets after TaskUpdate bullet:
- Teammate: check owner field on TaskGet before claiming unassigned tasks
- Lead: set owner via TaskUpdate on all tasks immediately at spawn time

### 4. Placement update

Changed from "after the task list" to "BEFORE the task list" — protocols come first so agents see constraints before work.

## Result

Protocol block is now 12 bullets (was 10). Idle + retrospective are cleanly separated. Ownership drift is addressed from both teammate and lead sides. Blocked task few-shots match exact format from task-10-researcher.md.
