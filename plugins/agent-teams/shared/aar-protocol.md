# After-Action Review (AAR) Protocol

Structured process evaluation based on the military AAR format (FM 7-0, Appendix K) — focuses on **team effectiveness**, not output quality. Complements `/evaluate-spawn` which evaluates output.

**Usable across:**
- All agent team spawn types (feature, debug, research, planning, review, design, brainstorm, productivity)
- Structured multi-step work (plan mode sessions, multi-phase implementations)
- Team-specific data (task lists, config) is enrichment when available, not a requirement

**Core principle:** Participants speak first, facilitator synthesizes. This prevents the lead from projecting their own narrative onto the team's experience.

## Prerequisites

- AAR must run BEFORE `TeamDelete` — team config is needed for usage data
- The team's task list must still be accessible (when running for an agent team)
- When running outside an agent team context (plan mode, manual), reconstruct from available data

## Phase 1: Collect Participant Input

**When teammates are still alive** (shutdown protocol Phase 1 has already collected this):

Use the responses collected during shutdown. Each teammate was asked:
1. "What was your understanding of the goal?"
2. "What went well in how the team operated?"
3. "What would you change about how we worked together?"

These map directly to FM 7-0 core questions and give each participant a voice.

**When teammates are already shut down** (AAR run after the fact):

This is a **reduced-fidelity AAR**. The lead reconstructs from task data and conversation memory. Note this prominently in the AAR document: `⚠️ Reduced-fidelity AAR — participant input was not collected before shutdown.`

## Phase 2: Lead Synthesis

Spend approximately equal time on questions 1-3, and 50% of total review time on question 4.

### 1. What Was the Plan?

Reconstruct the original intent:

- Read team config at `~/.claude/teams/[team-name]/config.json` — member names, roles, types (when available)
- Call `TaskList` to see all tasks, their statuses, and dependency structure (when available)
- Note the spec quality score if scoring was used (from spawn prompt context)
- Identify the original goal from the team name and task descriptions
- **Compare participant answers to "what was your understanding of the goal?"** — surface any misalignment between teammates' understanding and the actual plan

Present a concise summary: team composition, task count, dependency depth, and stated goal.

### 2. What Actually Happened?

Build a factual timeline:

- **Task completion order** — which tasks completed, which were blocked longest, any that were skipped or deleted
- **Scope changes** — tasks added mid-session, tasks re-scoped, requirements that changed after USER FEEDBACK GATEs
- **Blockers encountered** — compaction events, tool failures, permission issues, teammate coordination problems
- **Timeline anomalies** — tasks that took unexpectedly long, tasks completed out of expected order

Present as a numbered timeline with key events.

### 3. What Went Well and Why?

**Participant responses are primary data** — synthesize patterns across their answers to "what went well?"

Then add structural observations:

- **Team patterns** — effective peer communication, good task decomposition, productive adversarial dynamics
- **Dependency structure** — blocking relationships that prevented wasted work
- **Spec quality** — areas where the discovery interview captured exactly the right context
- **Tool usage** — effective use of TaskUpdate for progress tracking, clean artifact compilation

Present as bullet points with causal explanations (not just "X worked" but "X worked because Y").

### 4. What Could Be Improved and How?

This is the most valuable section — spend 50% of review time here.

**Participant responses are primary data** — synthesize their answers to "what would you change?" Then add structural observations the lead noticed.

Present findings as a table:

| # | Issue | Impact | Fix | Scope |
|---|-------|--------|-----|-------|
| 1 | [What went wrong or was suboptimal] | [Effect on output quality or team efficiency] | [Specific actionable change] | [plugin / project] |

**Scope definitions:**
- **plugin** — fix requires changing plugin files (protocols, blueprints, hooks, team composition, task structure, discovery interview, scoring)
- **project** — fix is specific to this project/codebase (invocation patterns, config, conventions)

## Usage Summary Collection

Collect team usage data from the team config, task list, and spawn prompt context. Render inline in the AAR document:

```markdown
### Team Usage Summary

| Agent | Role | Model | Tasks Completed | Notes |
|---|---|---|---|---|
| [name] | [purpose] | [model] | [N/total] | [observations] |
| **Total** | | | **[sum]** | |

**Token analysis:** Run `/session-stats` for detailed breakdown.
```

If the session-insights plugin is not available, note: `Install session-insights plugin for token tracking.`

## Issue Creation Flow

After completing the review, offer to create GitHub issues for improvements with **plugin** scope:

1. Present the filtered issue list (only plugin scope items)
2. For **plugin** scope issues, offer: `gh issue create --repo nthplusio/functional-claude --title "[AAR] [issue summary]" --body "[issue details from table]"`
3. For **project** scope issues, note in the AAR and suggest the user creates an issue in their own project repo if needed
4. Require explicit user confirmation before creating each issue
5. Skip issue creation if no plugin scope improvements were identified

## Output Format

Write the AAR to `docs/retrospectives/[team-name]-aar.md`. Create the `docs/retrospectives/` directory if it doesn't exist.

```markdown
---
team: [team-name]
date: [YYYY-MM-DD]
type: [feature|debug|research|planning|review|design|brainstorm|productivity]
team-size: [N teammates]
tasks-completed: [N/total]
spec-score: [N/6 dimensions or "not scored"]
fidelity: [full|reduced]
---

# After-Action Review: [team-name]

## 1. What Was the Plan?
[Team composition, goal, task structure, spec score]

## 2. What Actually Happened?
[Numbered timeline of key events]

## 3. Participant Voices

[Summary of each participant's raw input, attributed by name/role]

| Teammate | Goal Understanding | What Went Well | What They'd Change |
|---|---|---|---|
| [name/role] | [their answer] | [their answer] | [their answer] |

_If reduced-fidelity: ⚠️ Participant input was not collected before shutdown._

## 4. What Went Well?
[Bullet points with causal explanations, synthesized from participant input + lead observations]

## 5. What Could Be Improved?

| # | Issue | Impact | Fix | Scope |
|---|-------|--------|-----|-------|
| 1 | ... | ... | ... | ... |

## Team Usage Summary

| Agent | Role | Model | Tasks Completed | Notes |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
| **Total** | | | **[sum]** | |

**Token analysis:** Run `/session-stats` for detailed breakdown.
```

## Relationship to /evaluate-spawn

| Aspect | `/after-action-review` (AAR) | `/evaluate-spawn` |
|--------|------------------------------|-------------------|
| Evaluates | **Process** — team effectiveness | **Output** — spec quality prediction |
| Questions | Participant input + 4 structured (plan/actual/good/improve) | 3 structured (score accuracy/first fix/scenarios) |
| Best for | Understanding team dynamics and coordination | Calibrating spec scoring and refinement |
| When | Always after team completion | When spec scoring was used |
| Output | `[team-name]-aar.md` | `[team-name].md` |

Both write to `docs/retrospectives/` and can be run in the same session.
