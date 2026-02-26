# Task 1: Dynamic Interview Protocol Spec (#8) — v2

## Summary

Replace the fixed 3-core + 0-2-optional structure with a dynamic protocol: 3 fixed core questions + up to 7 dynamic follow-ups (total cap: 10). Dynamic follow-ups are triggered by (a) feature-characteristic heuristics and (b) ambiguity detection in prior answers. Fold `spec-refinement.md`'s edge-case questioning into this dynamic flow — the `### Edge Cases` subsection is still produced. All questions presented in batches of 2-3 via AskUserQuestion, not one at a time.

---

## Required Changes by File

### 1. `plugins/agent-teams/shared/discovery-interview.md`

#### Change A: Update "Core Questions" intro sentence

**FIND (line 11):**
```
Every discovery interview asks up to 3 core questions. These are universal across all team types:
```

**REPLACE WITH:**
```
Every discovery interview asks up to 3 core questions (universal across all team types), followed by up to 7 dynamic follow-up questions. Total interview cap: 10 questions.
```

---

#### Change B: Replace "Optional Questions" section entirely (lines 19–27)

**REMOVE:**
```markdown
## Optional Questions

Ask 0-2 additional questions triggered by keyword detection in `$ARGUMENTS`. These are NOT asked by default — only when the keyword match suggests they'd add value.

| Trigger Keywords | Optional Question | Purpose |
|---|---|---|
| existing, prior, already, current, legacy, migrate | **Existing context** — "What related work already exists? Prior specs, code, research, or design docs?" | Prevents reinventing existing patterns; surfaces integration points |
| quality, polish, fast, speed, performance, trade-off | **Quality priority** — "What matters most — correctness, performance, UX polish, or shipping speed?" | Shapes trade-off decisions during execution |
```

**REPLACE WITH:**
```markdown
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
```

---

#### Change C: Remove "Refinement Phase" section (lines 86–94) — replace with Edge Cases output note

**REMOVE (lines 86–94):**
```markdown
## Refinement Phase

After compiling interview answers, run the refinement protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-refinement.md`.

This step generates 2–4 targeted follow-up questions derived from the compiled context, probing edge cases, failure modes, and boundary conditions. The output is a `### Edge Cases` subsection added to the compiled Context block.

**When to include:** Same as discovery interview — if a discovery interview was run, run refinement. If the interview was skipped (all answers in `$ARGUMENTS`), refinement is still recommended but can be skipped.

**Skip:** User can skip refinement by typing "skip". Skipping penalizes the edge-case dimension in quality scoring.
```

**REPLACE WITH:**
```markdown
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
```

---

#### Change D: Update "Quality Scoring" lead-in sentence (line 98)

**FIND:**
```markdown
After refinement completes (or is skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.
```

**REPLACE WITH:**
```markdown
After dynamic follow-up questions complete (or are skipped), run the scoring protocol from `${CLAUDE_PLUGIN_ROOT}/shared/spec-quality-scoring.md`.
```

---

### 2. `plugins/agent-teams/shared/spec-refinement.md`

**Action: DELETE this file.**

Fully superseded by the Dynamic Follow-Up Questions protocol in `discovery-interview.md`. Its edge-case categories are absorbed into Source 2 (heuristic table) and Source 3 (ambiguity detection).

---

### 3. `plugins/agent-teams/plugin-manifest.json`

**FIND (line 30):**
```json
"shared/spec-refinement.md",
```

**REMOVE this line entirely.** The file no longer exists.

---

### 4. `plugins/agent-teams/skills/evaluate-spawn/SKILL.md`

**FIND (line 326):**
```markdown
- `shared/spec-refinement.md` — Add question categories based on recurring "spec refinement should have surfaced it" patterns
```

**REPLACE WITH:**
```markdown
- `shared/discovery-interview.md` § Feature-Characteristic Heuristics — Add heuristic rows based on recurring "spec should have surfaced it" patterns. Each new row needs: Feature Characteristic, Trigger Signal, Follow-Up Question.
```

---

### 5. Spawn command files: `spawn-build.md`, `spawn-think.md`, `spawn-create.md`

Grep confirms no direct `spec-refinement.md` references in command files:
```bash
grep -r "spec-refinement" plugins/agent-teams/commands/
# Expected: no matches
```

**No changes required to spawn command files.** They delegate to `discovery-interview.md` for the full interview protocol — the new dynamic flow is inherited automatically.

---

### 6. `plugins/agent-teams/shared/spec-quality-scoring.md`

**No changes required.** The edge-case dimension scoring question ("Does the spec address failure modes, error states, or boundary conditions?") evaluates the `### Edge Cases` subsection content. Under the new protocol:
- Heuristic follow-ups answered → `### Edge Cases` has content → dimension passes
- User skipped → `### Edge Cases` contains "[Skipped...]" → dimension fails

Score impact is identical to the old refinement skip penalty.

---

## Behavioral Diff Summary

| Aspect | Old behavior | New behavior |
|---|---|---|
| Structure | 3 core + 0-2 optional = max 5 | 3 core + up to 7 dynamic = max 10 |
| Dynamic triggers | 2 keyword matches in $ARGUMENTS | 10-row heuristic table + ambiguity detection |
| Mode-specific questions | Defined per spawn command, separate slot | Treated as minimum floor, count against 10-question cap |
| Refinement questions | Separate phase via spec-refinement.md | Folded into Sources 2 & 3 of dynamic follow-up |
| Batch presentation | All core at once; refinement all at once | Batches of 2-3 across all phases |
| Stop conditions | None explicit | 4 explicit stop conditions |
| Edge Cases subsection | Produced by spec-refinement.md phase | Produced by dynamic follow-up phase |
| spec-refinement.md | Separate file, called by reference | Deleted; logic absorbed into discovery-interview.md |

---

## Version Impact

| File | Action |
|---|---|
| `plugins/agent-teams/shared/discovery-interview.md` | Modified (4 changes: A, B, C, D) |
| `plugins/agent-teams/shared/spec-refinement.md` | Deleted |
| `plugins/agent-teams/plugin-manifest.json` | Remove `shared/spec-refinement.md` entry (line 30) |
| `plugins/agent-teams/skills/evaluate-spawn/SKILL.md` | Update improvement target reference at line 326 |
| `plugins/agent-teams/commands/spawn-think.md` | Update stale "3+2" string at line 258 (see Change E below) |
| `plugins/agent-teams/shared/spec-quality-scoring.md` | No change |
| `plugins/agent-teams/commands/spawn-build.md` | No change |
| `plugins/agent-teams/commands/spawn-create.md` | No change |
| Version bump | Part of v0.18.0 |

---

#### Change E: Update stale "3+2" documentation string in `spawn-think.md`

**FIND (line 258):**
```
- Streamlined 3+2 discovery interview from `shared/discovery-interview.md`
```

**REPLACE WITH:**
```
- Dynamic discovery interview (3 core + up to 7 follow-ups, cap 10) from `shared/discovery-interview.md`
```
