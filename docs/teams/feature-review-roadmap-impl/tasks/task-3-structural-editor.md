---
task: 3
title: Split planning-blueprints.md into 7 mode files + _context-template.md
owner: structural-editor
status: completed
---

# Task 3: Split planning-blueprints.md (R1)

## Result

Completed. 519-line monolith split into 8 focused files. Original deleted. spawn-think.md reference updated.

## Files Created

```
plugins/agent-teams/shared/planning-blueprints/
  _context-template.md    (~38 lines) — shared Planning Context Template
  roadmap.md              (~63 lines) — Mode 1: Product Roadmap
  spec.md                 (~68 lines) — Mode 2: Technical Spec
  adr.md                  (~62 lines) — Mode 3: Architecture Decision
  migration.md            (~64 lines) — Mode 4: Migration Strategy
  bizcase.md              (~65 lines) — Mode 5: Business Case
  gtm.md                  (~63 lines) — Mode 6: Go-to-Market
  okr.md                  (~64 lines) — Mode 7: OKR/Goals
```

## Files Modified

- `plugins/agent-teams/commands/spawn-think.md` line ~254: replaced single monolith reference with mode-to-file lookup table

## Files Deleted

- `plugins/agent-teams/shared/planning-blueprints.md` (519 lines)

## Key Decisions

- Each mode file includes `[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]` in its spawn prompt Planning Context section
- Content is verbatim from original — no edits to spawn prompt content
- The `[Include Task Blocking Protocol ...]` embed directive preserved unchanged in each mode file (R6/CLAUDE.md work is separate)

## Token Savings

~415 lines saved per planning spawn (80% reduction). Only the selected mode file + _context-template.md (~104 lines total) needs to be read instead of all 519 lines.
