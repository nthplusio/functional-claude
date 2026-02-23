# Scenario Collection

Protocol for collecting behavioral acceptance scenarios during discovery and storing them as external validation artifacts. Scenarios represent the user's pre-spawn intent — a holdout set that prevents implementation from drifting undetected.

## Why This Exists

Without external scenarios, the Tester writes tests based on the *implementation*, not the user's intent. If the implementation drifts from the spec, the tests drift with it — both pass while the feature is wrong. Scenarios collected before spawning create an independent validation baseline: the user's definition of correct behavior, frozen before any code exists.

## Collection Protocol

### When to Collect

Run during the discovery interview, after core questions and before output compilation. Feature mode only — debug mode uses bug reproduction steps instead.

### How to Collect

1. **Present a concrete example** derived from the Goal section of the interview:

   ```
   Here's an example scenario based on your goal:

   **Scenario: [descriptive name derived from goal]**
   - Given [precondition from constraints/context]
   - When [action from goal description]
   - Then [expected outcome from success criteria]

   Now write at least 1 more scenario covering a different behavior or edge case.
   You can use the Given/When/Then format or just describe the behavior — coverage matters more than format.
   ```

2. **Minimum 2 scenarios** total (the example counts as 1 if user confirms it). Format compliance is secondary to coverage — accept plain-language descriptions.

3. **Compile scenarios** into the output file immediately after collection.

### Skip Logic

User can type "skip" to proceed without scenarios.

- If skipped, no scenario file is created
- Quality scoring penalizes missing `### Acceptance Scenarios` in the Feature Context
- The Tester still writes tests, but without an external validation baseline

## Storage Convention

Scenarios are stored at: `docs/scenarios/[feature-slug].md`

### File Format

```markdown
---
feature: [feature-slug]
team: feature-[feature-slug]
date: [YYYY-MM-DD]
status: pre-spawn
---

# Scenarios: [Feature Name]

## Scenario 1: [Name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

## Scenario 2: [Name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected outcome]

<!-- Add more scenarios as needed -->
```

### Naming

- `[feature-slug]`: Kebab-case, derived from the feature name (e.g., `user-export-pdf`, `auth-password-reset`)
- Same slug used for the team name: `feature-[feature-slug]`

## Tester Validation Protocol

The Tester receives a distinct task: **"Validate implementation against `docs/scenarios/[feature-slug].md`"**

This is separate from writing unit tests. The Tester must:

1. Read `docs/scenarios/[feature-slug].md`
2. For each scenario, verify the implementation satisfies the described behavior
3. Produce a `### Scenario Notes` section in their task output:

```markdown
### Scenario Notes

| Scenario | Status | Notes |
|---|---|---|
| [Scenario 1 name] | Validated / Invalidated / Partial | [What matched or diverged] |
| [Scenario 2 name] | Validated / Invalidated / Partial | [What matched or diverged] |
```

- **Validated**: Implementation satisfies the scenario as described
- **Invalidated**: Implementation contradicts the scenario (scope drift detected)
- **Partial**: Some aspects match, others diverge — details in Notes column

**If any rows are Invalidated or Partial:** The Tester adds a `### Correction Opportunities` table immediately after `### Scenario Notes`. See `shared/shutdown-protocol.md` Phase 0 for the correction loop protocol the Lead runs on this output.

```markdown
### Correction Opportunities

| Scenario | Root Cause | Affected Task | Suggested Fix |
|----------|------------|---------------|---------------|
| [scenario name] | [brief root cause] | [task # and owner] | [specific fix description] |
```

## Integration Points

- **Discovery Interview**: Scenario collection runs after core questions, before output compilation
- **Feature Context**: Compiled scenarios included as `### Acceptance Scenarios` subsection
- **Spec Quality Scoring**: Missing `### Acceptance Scenarios` penalizes the acceptance criteria dimension
- **Tester Task List**: Scenario validation appears as a distinct task, separate from unit/integration tests
- **Shutdown Phase 0**: Tester's `### Correction Opportunities` table triggers the Scenario Invalidation Check in `shared/shutdown-protocol.md` — the Lead reads it and presents user with accept/fix/proceed options before AAR begins
