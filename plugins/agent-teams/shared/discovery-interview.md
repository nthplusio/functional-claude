# Discovery Interview

Canonical discovery interview pattern for pre-spawn context gathering. Builds rich shared context that all teammates receive in the spawn prompt, ensuring aligned work from the first turn.

## Why This Exists

Without a discovery interview, teammates start with only a brief topic string and must independently discover constraints, goals, and context — leading to shallow, misaligned outputs. The interview moves context gathering before the spawn so teammates can start working immediately.

## Core Questions

Every discovery interview asks up to 3 core questions. These are universal across all team types:

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Goal** — "What behavior must the system exhibit when this is done? What should the user be able to do that they can't do today?" | Anchors on observable behavior — prevents scope drift and keeps focus on outcomes, not implementation |
| 2 | **Constraints** — "What are the non-negotiables? (timeline, budget, tech stack, team size, compliance, etc.)" | Filters out infeasible approaches early — saves teammates from wasted exploration |
| 3 | **Success criteria** — "How will you verify this works? What observable behavior confirms success?" | Gives teammates testable targets — focuses on what can be validated externally, not internally |

## Optional Questions

Ask 0-2 additional questions triggered by keyword detection in `$ARGUMENTS`. These are NOT asked by default — only when the keyword match suggests they'd add value.

| Trigger Keywords | Optional Question | Purpose |
|---|---|---|
| existing, prior, already, current, legacy, migrate | **Existing context** — "What related work already exists? Prior specs, code, research, or design docs?" | Prevents reinventing existing patterns; surfaces integration points |
| quality, polish, fast, speed, performance, trade-off | **Quality priority** — "What matters most — correctness, performance, UX polish, or shipping speed?" | Shapes trade-off decisions during execution |

## Adaptive Skip Logic

**Skip questions already answered in `$ARGUMENTS`.** Apply these rules:

1. Parse `$ARGUMENTS` for explicit answers to each question
2. If the user's initial prompt answers 2+ core questions, skip those and present only unanswered ones
3. If `$ARGUMENTS` answers all 3 core questions, skip the interview entirely and proceed to the next step
4. Always confirm understanding before spawning: "Based on your description, here's what I understand: [summary]. Anything to adjust?"

## Token Budget Block

Include this YAML structure in the spawn prompt's Context section to help teammates calibrate their effort:

```yaml
# Token Budget (informational — guides teammate effort allocation)
budget:
  discovery: 10%    # Context gathering (already done via interview)
  analysis: 30%     # Initial analysis and exploration
  feedback: 10%     # User feedback gate preparation
  execution: 40%    # Detailed work after feedback
  synthesis: 10%    # Final compilation and deliverables
```

Adjust percentages based on team type:
- **Research teams:** analysis 40%, execution 30% (research-heavy)
- **Feature teams:** analysis 20%, execution 50% (implementation-heavy)
- **Brainstorming teams:** analysis 20%, execution 40%, synthesis 20% (convergence-heavy)

## Presentation

Present questions using `AskUserQuestion` in a single batch (not one at a time). This respects the user's time while gathering comprehensive context.

## Output Compilation

Compile all interview answers into a structured `## [Team-Type] Context` section in the spawn prompt:

```markdown
## [Team-Type] Context

### Goal
[What we're trying to achieve, desired end state]

### Constraints
[Non-negotiables: budget, timeline, tech stack, etc.]

### Success Criteria
[How success is measured, what done looks like]

### Additional Context
[Answers to optional questions, if asked]

### Project Analysis
[Findings from codebase/document analysis, if applicable]
```

## Refinement Phase

After compiling interview answers, run the refinement protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-refinement.md`.

This step generates 2–4 targeted follow-up questions derived from the compiled context, probing edge cases, failure modes, and boundary conditions. The output is a `### Edge Cases` subsection added to the compiled Context block.

**When to include:** Same as discovery interview — if a discovery interview was run, run refinement. If the interview was skipped (all answers in `$ARGUMENTS`), refinement is still recommended but can be skipped.

**Skip:** User can skip refinement by typing "skip". Skipping penalizes the edge-case dimension in quality scoring.

## Quality Scoring

After refinement completes (or is skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

Scoring evaluates 5 dimensions of spec completeness using binary yes/no questions (not impressionistic ratings). Each dimension is worth 20 points, producing a 0–100 score.

**Gate:** If score is below threshold (default 50), the user is prompted to refine or proceed. The score is included in the spawn prompt's Context section regardless of whether the gate fired.

**Flag:** Spawn commands accept `--min-score N` to override the default threshold.

## Scenario Collection (Feature Mode Only)

After quality scoring (or after refinement if scoring is skipped), run the scenario collection protocol from `${CLAUDE_PLUGIN_ROOT}/shared/scenario-collection.md`.

This step collects behavioral acceptance scenarios — Given/When/Then descriptions of expected behavior — before any code is written. Scenarios serve as an external validation baseline: the user's definition of correct behavior, frozen before spawning.

**When to include:** Feature mode spawns only. Debug mode uses bug reproduction steps instead.

**Process:** Present 1 concrete example scenario derived from the Goal section, then ask the user to write at least 1 more. Minimum 2 scenarios total. Format compliance secondary to coverage.

**Output:** Scenarios written to `docs/scenarios/[feature-slug].md` and included as `### Acceptance Scenarios` in the Feature Context block.

**Skip:** User can type "skip". Skipping means no scenario file is created and quality scoring penalizes the acceptance criteria dimension.

## When to Include

Include a discovery interview when **shared context quality drives output quality**:

| Include | Skip |
|---------|------|
| Planning teams (plan quality depends on understanding constraints) | Debug teams (bug description IS the input; urgency matters) |
| Research teams (research direction depends on knowing what matters) | Review teams (code diff IS the input; use brief interview instead) |
| Design teams (design decisions depend on understanding users) | Teams where input is already structured (spec documents, etc.) |
| Brainstorming teams (ideation quality depends on problem space) | |
| Feature teams (implementation depends on scope and criteria) | |

## Extended Questions

Individual spawn commands may define their own extended questions beyond the 3 core + 2 optional ones defined here. The core questions provide a universal baseline; commands add domain-specific depth.

For example:
- **Planning team** adds 5 mode-specific questions per mode (7 modes)
- **Research team** adds 2 mode-specific questions per mode (3 modes)
- **Feature team** adds questions about existing context and quality bar
- **Brainstorming team** adds category-specific questions (Tech/Product/Process/Ops)

When designing extended questions for new commands, follow this pattern:
- Present as a markdown table with `#`, `Question`, and `When to Ask` columns
- Bold the question title, then quote the actual phrasing
- Include a "When to Ask" condition to prevent over-questioning
