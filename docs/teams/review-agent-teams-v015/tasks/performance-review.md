---
reviewer: performance-reviewer
tasks: [3, 4]
scope: spawn-core.md, discovery-interview.md, spawn-build.md, spawn-think.md, spawn-create.md
date: 2026-02-20
---

# Performance Review: agent-teams v0.15.0

## Summary

The adaptive sizing, model selection, and discovery interview design are generally sound. Two issues warrant attention: (1) the "9+ subtasks → capped team" rule provides no user guidance on how to split phases, and (2) the token budget percentages don't add up to 100% and aren't variant-validated. Minor concerns around duplicate protocol blocks inflating spawn prompt size. No critical token-efficiency problems found.

---

## Task 3: Adaptive Sizing and Model Selection

### Sizing Thresholds

**Verdict: Reasonable with one gap.**

| Range | Verdict | Notes |
|---|---|---|
| 1-2 subtasks → solo | Correct | Coordination overhead argument is sound |
| 3-4 subtasks → pair | Correct | Best parallelism-to-overhead ratio |
| 5-8 subtasks → full team (3-5) | Correct | Range is intentionally flexible; reasonable |
| 9+ subtasks → cap at 4-5 + chain | Gap | No guidance on *how* to split into phases |

**Gap: 9+ subtasks cap lacks actionable guidance.** The rule says "split excess subtasks into follow-up phases" but the Subtask Counting section and unified commands give no instructions on how to do this. Users hitting this threshold will get a vague recommendation with no clear next step. Recommendation: add 1-2 sentences on splitting criteria (e.g., "group by dependency boundary" or "spawn follow-up after USER FEEDBACK GATE").

**Subtask counting rules are clear and non-overlapping.** The four counting rules (deliverable, investigation direction, stack layer, shared tasks excluded) are well-defined and won't cause inconsistent counts.

**User approval gate is well-designed.** The "just do it" escape hatch is a good UX decision that avoids repeated friction for experienced users. The gate template is concise.

### Model Selection by Phase

**Verdict: Mostly correct; one potential token waste pattern.**

| Phase | Model | Assessment |
|---|---|---|
| Discovery interview | Haiku | Correct — Q&A only, minimal reasoning |
| Analysis and writing | Sonnet | Correct — cost-effective for research |
| Code implementation | Opus (default) | Correct — strongest reasoning needed |
| Iterative refinement | Opus (default) | Acceptable, but may be over-spec'd |
| Coordination (lead) | Sonnet | Correct — coordination is orchestration, not reasoning |

**Potential over-spend: Iterative refinement at Opus.** The Refiner in productivity mode uses the default (Opus) model. For most refinement loops, Sonnet would be sufficient — the Refiner is polishing existing work, not doing novel reasoning. This is flagged in spawn-core.md with the note "iterative refinement benefits from strongest reasoning," but that justification is weaker than the justification for code implementation. Low-priority concern — Opus is the right call when refinement involves complex code convergence, but could be Sonnet for text-only productivity workflows.

**Review mode uses Sonnet for all reviewers** — this is explicitly correct per spawn-core.md's "all planning modes use Sonnet" rule. Consistent.

**Research mode (spawn-think) uses Sonnet for all teammates** — correct per spawn-core.md. Consistent.

**Design mode (spawn-create):** Product Owner, Designer, User Advocate → Sonnet; Frontend Dev → default (Opus). Consistent with model selection rules.

### Verbosity Control

**Verdict: Well-designed, correctly implemented.**

- Three-level system (quiet/normal/verbose) covers the user spectrum without over-engineering.
- Flag stripping before passing to discovery interview is correctly specified.
- Default to `--normal` is the right choice.
- Verbose mode's token budget display surfaces debugging info without adding processing overhead.
- The "skip gate" rule (`"just do it"` → suppress future gates in session) is a clean pattern.

### Duplicate Protocol Blocks: Token Cost

**Issue: Task Blocking Protocol and Output Standards blocks are duplicated 6+ times across the 3 commands.** Each spawn prompt embeds the full protocol block verbatim. Rough estimate: ~250 tokens per block × 2 blocks × 6 spawn prompts = ~3,000 tokens of repeated instruction in spawn prompts. This is unavoidable if teammates receive only their spawn prompt, but worth flagging for future refactoring (e.g., extract to a shared teammate-instructions.md referenced by all).

---

## Task 4: Discovery Interview Token Budget Impact

### Core Questions (3): Assessment

**Verdict: Well-targeted. No redundancy.**

| Question | Verdict | Notes |
|---|---|---|
| Goal | Essential | Prevents all scope drift |
| Constraints | Essential | Filters infeasible approaches early |
| Success criteria | Essential | Gives lead clear completion signal |

The 3 questions are tightly scoped and non-overlapping. Each has a clear purpose that maps to teammate behavior. No question could be removed without degrading output quality.

### Optional Questions (2): Assessment

**Verdict: Good trigger logic, minor overlap risk.**

| Trigger Keywords | Question | Assessment |
|---|---|---|
| existing, prior, already, current, legacy, migrate | Existing context | Correct — surfaces integration points |
| quality, polish, fast, speed, performance, trade-off | Quality priority | Correct — shapes trade-off decisions |

The keyword triggers are well-chosen. One overlap risk: `migrate` triggers the "existing context" optional question AND is a keyword for `spawn-think --mode planning` submode migration. This is unlikely to cause a problem in practice since the questions serve different purposes, but could confuse users who are asked about existing context when they just want to start a migration plan.

### Adaptive Skip Logic

**Verdict: Correct logic, one ambiguity.**

The 4 rules are sound:
1. Parse `$ARGUMENTS` for pre-answers — correct
2. Skip answered questions — correct
3. Skip interview entirely if all 3 answered — correct
4. Always confirm understanding — important safety net

**Ambiguity: "2+ core questions" skip threshold.** Rule 2 says "if the user's initial prompt answers 2+ core questions, skip those and present only unanswered ones." This is sensible, but the threshold isn't explained — why 2, not 1? A prompt answering 1 question should also skip that question. The current phrasing could be read as "only start skipping when 2+ are answered," which would ask unnecessary questions when only 1 is pre-answered. Recommendation: clarify rule 2 to "skip any individually answered questions; if all 3 are answered, skip the interview entirely."

### Token Budget Block

**Verdict: Math error; variants partially validated.**

**Math error: Default percentages sum to 100%, but variant adjustments don't.**

Default:
```
discovery: 10% + analysis: 30% + feedback: 10% + execution: 40% + synthesis: 10% = 100% ✓
```

Research variant (analysis 40%, execution 30%):
```
10% + 40% + 10% + 30% + 10% = 100% ✓
```

Feature variant (analysis 20%, execution 50%):
```
10% + 20% + 10% + 50% + 10% = 100% ✓
```

Brainstorm variant (analysis 20%, execution 40%, synthesis 20%):
```
10% + 20% + 10% + 40% + 20% = 100% ✓
```

**All variants sum correctly.** No math error — this was a false positive from my initial read. The budget block is sound.

**Substantive concern: "discovery: 10%" in spawn prompt is misleading.** The budget is included in the spawn prompt, but the discovery phase is already complete by the time the prompt is sent. Teammates will see `discovery: 10%` as an allocation they might try to spend, when they should treat it as pre-consumed. Recommendation: add a comment clarifying this (e.g., `# discovery already completed via pre-spawn interview`).

### Batch Presentation

**The instruction to use `AskUserQuestion` in a single batch is correct.** Asking questions one at a time would create unnecessary round-trips. The batch approach is token-efficient.

### Extended Questions per Command

**Assessment: Consistent pattern, correctly bounded.**

All 3 commands follow the same pattern: ask up to 2 extended questions, with explicit "When to Ask" conditions. This is well-designed — the conditions prevent question inflation.

One note: Review mode extended questions (#4 "Change context" and #5 "Known risk areas") are both marked "Always" — meaning review sessions always ask 5 questions total (3 core + 2 extended). This is intentional given that review quality is highly context-dependent, but it means review sessions have no skip optimization for the extended questions.

---

## Priority Findings

| Priority | Issue | Location | Impact |
|---|---|---|---|
| Medium | 9+ subtask cap gives no phase-split guidance | spawn-core.md:16 | UX friction — users get vague recommendation |
| Low | Adaptive skip logic ambiguous for 1-question pre-answers | discovery-interview.md:33 | Could ask 1 unnecessary question per session |
| Low | `discovery: 10%` in spawn prompt implies budget still available | discovery-interview.md:41-48 | Minor teammate confusion |
| Low | Refiner at Opus may be over-spec'd for text-only workflows | spawn-core.md:49 | Token waste in productivity-only sessions |
| Info | Task Blocking Protocol duplicated 6+ times across spawn prompts | all 3 commands | ~3k tokens of duplicate instructions per full pipeline |
