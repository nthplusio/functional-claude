---
task: 14
title: Strip "Why This Exists" rationale sections from protocol files
owner: protocol-editor
team: feature-review-roadmap-impl
date: 2026-02-23
---

# Task 14: Strip "Why This Exists" Sections

## Changes Made

### task-blocking-protocol.md
- Removed 9-line `## Why This Exists` bullet list
- Replaced with: `> Prevents: blocked tasks starting early, standing-by noise, compaction data loss, and ignored user feedback gate decisions.`

### shutdown-protocol.md
- Removed 5-line `## Why This Exists` bullet list (kept one-line description in opening paragraph)
- Replaced with: `> Prevents: TeamDelete destroying task data before AAR runs, retrospective input being skipped, and process improvements being lost.`

### output-standard.md
- Removed 4-line `## Why This Exists` bullet list
- Replaced with: `> Prevents: essay-length responses, restated context, buried conclusions, and task outputs at inconsistent locations.`

## Result

~22 lines removed across 3 files. Rationale is preserved as a single blockquote line per file — scannable by plugin authors without consuming space. Section headers eliminated entirely.
