---
name: after-action-review
description: |
  This skill should be used when the user asks to review a completed team's process, run an after-action review, or evaluate team effectiveness. Use this skill when the user says "after action review", "AAR", "process review", "team retrospective", "review team process", "how did the team work", or at the prompt after a team completes its work.

  Distinct from `/evaluate-spawn` (output quality). AAR evaluates team process. Both can run in the same session.
version: 0.18.0
---

# After-Action Review (AAR)

Process evaluation for completed agent teams. Reviews team effectiveness using the military AAR format — 4 structured questions that surface what worked, what didn't, and specific improvements.

## Prerequisites

- A team must have completed its work (all tasks done or session ending)
- Team config must still exist (run BEFORE `TeamDelete`)
- Works with any team type

## Protocol

Follow the AAR protocol at `${CLAUDE_PLUGIN_ROOT}/shared/aar-protocol.md`.

The protocol covers:
1. **Participant input** — collect each teammate's perspective before synthesis (FM 7-0 participant-first principle)
2. **4 core questions** — plan vs reality, successes, improvements (synthesized from participant responses)
3. **Usage summary** — team composition, task completion, model assignments
4. **Issue creation** — offer `gh issue create` for plugin scope improvements; project scope noted in AAR only
5. **Output** — writes to `docs/retrospectives/[team-name]-aar.md`

## Relationship to /evaluate-spawn

AAR evaluates **process** (team effectiveness); `/evaluate-spawn` evaluates **output** (spec quality prediction). See `aar-protocol.md` for full comparison.
