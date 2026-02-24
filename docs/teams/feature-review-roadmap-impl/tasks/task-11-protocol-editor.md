---
task: 11
title: base-agent.md cleanup
owner: protocol-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 11: base-agent.md Cleanup

## Changes Made

**File:** `plugins/agent-teams/shared/base-agent.md`

### 1. Artifact Defaults section (lines 41-91 → 3 lines, -48 lines)

Replaced directory tree + frontmatter schemas + root index + write/skip table with:
- One paragraph covering directory structure, frontmatter fields, and root index
- One sentence on write vs skip decision
- Cross-reference to team-coordination skill → Artifact Output Protocol for full schemas

### 2. Shutdown Compliance section (lines 99-111 → 2 lines, -11 lines)

Collapsed two subsections (Retrospective Questions + Shutdown Requests) into two compact sentences:
- Retrospective: 2-3 sentences per question, focus on process and coordination patterns
- Shutdown: approve immediately unless mid-write, do not reject to finish up

## Result

110 lines → 61 lines. Both changes match the exact before/after in task-7-quality-reviewer.md Finding 3a and 3b. Full schemas remain authoritative in team-coordination skill. Shutdown approval rule stays as human-readable summary (appropriate for base-agent as plugin-author reference, not spawn embedding).
