---
task: 2
title: Rewrite shutdown-protocol.md
owner: protocol-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 2: shutdown-protocol.md Rewrite

## Changes Made

**File:** `plugins/agent-teams/shared/shutdown-protocol.md`

### 1. Phase 1 section update

Changed retrospective message format to use `**RETROSPECTIVE — please answer before going idle:**` header. Added explicit nudge step: if a teammate does not respond after one cycle, send follow-up "@[name] — retrospective questions above, please answer before I send shutdown." Updated non-response handling to note it in AAR (not silently skip).

### 2. Protocol Block update

Updated the embeddable protocol block to match Phase 1:
- "Before sending shutdown requests, message each teammate with this exact header..."
- RETROSPECTIVE header embedded in quoted message
- Explicit nudge step added
- "Collect all responses before sending any shutdown_request" → "After collecting all responses (or noting non-responses for the AAR), send shutdown_request to each teammate"

### 3. Placement update

Changed from "after the task list" to "BEFORE the task list" — consistent with task-blocking-protocol.md placement fix.

## Result

The RETROSPECTIVE header now matches the trigger in task-blocking-protocol.md's RETROSPECTIVE EXCEPTION bullet — teammates can pattern-match the exact header. Nudge sequence is explicit. Non-responses are surfaced in AAR instead of being silently dropped.
