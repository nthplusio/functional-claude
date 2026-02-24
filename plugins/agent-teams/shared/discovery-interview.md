# Discovery Interview

Canonical discovery interview pattern for pre-spawn context gathering. Builds rich shared context that all teammates receive in the spawn prompt, ensuring aligned work from the first turn.

## Why This Exists

Without a discovery interview, teammates start with only a brief topic string and must independently discover constraints, goals, and context — leading to shallow, misaligned outputs. The interview moves context gathering before the spawn so teammates can start working immediately.

## Core Questions

Every discovery interview asks up to 3 core questions (universal across all team types), followed by up to 7 dynamic follow-up questions. Total interview cap: 10 questions.

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Goal** — "What behavior must the system exhibit when this is done? What should the user be able to do that they can't do today?" | Anchors on observable behavior — prevents scope drift and keeps focus on outcomes, not implementation |
| 2 | **Constraints** — "What are the non-negotiables? (timeline, budget, tech stack, team size, compliance, etc.)" | Filters out infeasible approaches early — saves teammates from wasted exploration |
| 3 | **Success criteria** — "How will you verify this works? What observable behavior confirms success?" | Gives teammates testable targets — focuses on what can be validated externally, not internally |

## Dynamic Follow-Up Questions

After the 3 core questions, generate up to 7 dynamic follow-ups for a total cap of 10 questions. Dynamic questions come from three sources, evaluated in order:

### Source 1: Mode-Specific Extended Questions (Minimum Floor)

Each spawn command defines its own extended questions (see "Extended Questions" section at the end of this doc). Always include the applicable extended questions for the current mode before applying other heuristics. These are the minimum floor — not the cap.

### Source 2: Feature-Characteristic Heuristics

After including mode-specific extended questions, apply this heuristic table. For each characteristic present in `$ARGUMENTS` or the compiled Goal answer, add the corresponding question (if budget allows under the 10-question cap):

| Feature Characteristic | Trigger Signal | Follow-Up Question |
|---|---|---|
| Batch operations | "bulk", "batch", "multiple records", "import", "export" | "Should batch failures stop the entire operation, or continue processing remaining items?" |
| Data mutations | "update", "delete", "edit", "modify", "write", "save" | "What rollback or undo behavior is expected if the operation fails partway through?" |
| UI changes | "component", "page", "screen", "UI", "UX", "display", "render" | "Are there accessibility requirements (screen readers, keyboard nav, contrast ratios) to meet?" |
| Async / background work | "async", "queue", "background", "job", "scheduled", "worker" | "How should the user be notified when the background operation completes or fails?" |
| Authentication / sessions | "auth", "login", "session", "token", "permission", "role" | "What happens when the user's session expires mid-operation?" |
| External integrations | "API", "webhook", "third-party", "service", "integration" | "If the external service is unavailable, should the feature degrade gracefully or block?" |
| Pagination / large datasets | "list", "table", "paginate", "scroll", "search results", "records" | "What is the expected upper bound on records, and how should the feature behave at scale?" |
| State shared across users | "collaborative", "shared", "concurrent", "real-time", "sync" | "What happens when two users modify the same record simultaneously?" |
| User input / forms | "form", "input", "field", "submit", "upload", "enter" | "What are the valid formats and ranges for each input? What happens with invalid input?" |
| Soft-delete / archive | "archive", "soft-delete", "hide", "inactive", "restore" | "Can archived items be restored? Who can restore them?" |

Apply all matching rows (multiple characteristics may match). Stop when the 10-question cap is reached.

### Source 3: Ambiguity Detection

After core questions are answered, scan each answer for ambiguity signals before presenting follow-ups. An answer is ambiguous if it:
- Uses undefined pronouns ("it", "they", "this") without clear referent
- Contains vague quantifiers ("some", "a few", "many", "often") without definition
- Lists options without specifying which applies ("or", "either/or", "depending on")
- Uses passive voice hiding the actor ("it should be saved" — saved by whom? where?)

For each ambiguous answer, generate one clarifying follow-up referencing the specific text: e.g., "You said 'it should notify users' — which users, and via what channel?"

Ambiguity follow-ups count against the 10-question cap.

### Batch Presentation

Present all queued questions in batches of 2-3 using `AskUserQuestion`. Never ask one question at a time. Recommended batching:
- Batch 1: 3 core questions (or fewer if already answered in `$ARGUMENTS`)
- Batch 2: Mode-specific extended + top 2 heuristic matches
- Batch 3 (if needed): Remaining heuristic + ambiguity follow-ups

If fewer than 2 follow-ups remain, combine with the nearest batch.

### Stop Conditions

Stop generating questions when ANY of the following is true:
1. **Cap reached**: 10 questions have been asked (counting all phases)
2. **No remaining triggers**: No heuristic rows match and no ambiguity detected
3. **User signals done**: User responds "skip", "enough", "proceed", or an equivalent dismissal
4. **Coverage complete**: All applicable heuristic categories have been probed (even if under cap)

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

### Prior Run Insights
[Populated from Retrospective Scan (see spawn-shared.md). Include only if scan returned actionable content. Hard limit: max 3 bullets, max 100 words total. If cold-start guard fired (fewer than 3 matching retrospectives), omit this subsection entirely — do not add an empty placeholder.]
```

## Edge Cases Output

After dynamic follow-up questions complete (or are skipped), compile all heuristic and ambiguity follow-up answers into a `### Edge Cases` subsection appended to the compiled Context block:

```markdown
### Edge Cases

- **[Heuristic Category or Ambiguity]:** [User's answer]
- **[Heuristic Category or Ambiguity]:** [User's answer]
```

If the user skipped all follow-ups:
```markdown
### Edge Cases
[Skipped — edge case coverage not assessed]
```

The edge-case dimension in spec quality scoring evaluates whether this subsection contains substantive answers. Skipping penalizes that dimension.

## Quality Scoring

After dynamic follow-up questions complete (or are skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.

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

## Expected Outcomes Compilation (Research and Planning Modes Only)

After quality scoring, for Research and Planning spawns, compile a `### Expected Outcomes` subsection in the Context block. This freezes the pre-spawn definition of done before the team begins work — the evaluate-spawn Think profile checks against it at completion.

**Skip for:** Debug, Feature, Design, Brainstorm, Productivity, Review modes.

### Research Mode Format

```markdown
### Expected Outcomes

**Decision question:** [The specific question this research must answer]
**Options under consideration:** [List the options being evaluated]
**Minimum confidence threshold:** [High confidence required / Medium confidence acceptable / Directional signal sufficient]
**Out of scope:** [What this research should NOT try to answer]
```

Derive from the discovery interview:
- Decision question: from the Goal answer ("What are you trying to decide?")
- Options: from Candidate Options extended question if asked, otherwise derive from Goal
- Confidence threshold: from Success Criteria answer
- Out of scope: from Constraints answer

### Planning Mode Format

```markdown
### Expected Outcomes

**Phase count:** [Expected number of phases/milestones in the plan]
**Feasibility constraint:** [Key constraint the plan must respect — budget, timeline, team capacity]
**Stakeholder success definition:** [What the key stakeholder considers success — from discovery interview]
**Out of scope:** [What this plan should NOT address]
```

Derive from the discovery interview:
- Phase count: from the Goal or Constraints answer (approximate is fine — "3-4 phases")
- Feasibility constraint: from the Constraints answer
- Stakeholder success definition: from Success Criteria answer
- Out of scope: from Constraints answer

**If the user didn't provide enough data:** Ask one follow-up question specific to the missing field. Do not skip Expected Outcomes silently — an incomplete expected outcomes block is better than none.

**User skip:** User can type "skip". Skipping means no `### Expected Outcomes` subsection. The evaluate-spawn Think profile's outcomes validation question will be skipped if no section is present.

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

Individual spawn commands define their own extended questions (Source 1 in the Dynamic Follow-Up Questions protocol above). The core questions provide a universal baseline; commands add domain-specific depth.

For example:
- **Planning team** adds 5 mode-specific questions per mode (7 modes)
- **Research team** adds 2 mode-specific questions per mode (3 modes)
- **Feature team** adds questions about existing context and quality bar
- **Brainstorming team** adds category-specific questions (Tech/Product/Process/Ops)

When designing extended questions for new commands, follow this pattern:
- Present as a markdown table with `#`, `Question`, and `When to Ask` columns
- Bold the question title, then quote the actual phrasing
- Include a "When to Ask" condition to prevent over-questioning
