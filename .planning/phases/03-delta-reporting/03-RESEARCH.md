# Phase 3: Delta Reporting - Research

**Researched:** 2026-03-14
**Domain:** Issue change diffing and user-facing change summaries
**Confidence:** HIGH

## Summary

Phase 3 is the final phase of the v1 roadmap. It addresses a single requirement (SYNC-05): after a delta sync completes, the user sees a change summary listing which issues changed and what fields moved (e.g., "NTH-42: In Progress -> In Review"), and when nothing changed, the plugin reports "no changes" explicitly.

The existing delta sync infrastructure (Phase 2) already fetches changed issues and merges them into the cache, but it does not track _what_ changed. The `mergeIssues` function in `cache-store.js` performs a blind shallow spread (`{ ...existing.issues, ...delta.issues }`) -- it returns merged data but discards the before/after diff. Phase 3 adds a pure `diffIssues` function that compares existing cached issues against incoming delta issues field-by-field, producing structured change records. The pm-status skill (Step 4) then formats these diffs as a human-readable change summary inserted between the sync step and the briefing.

**Primary recommendation:** Add a single `diffIssues(existingIssues, deltaIssues)` function to `cache-store.js` that returns an array of change objects. Integrate it into the pm-status skill's delta sync step (Step 4) so the model outputs the change summary before the briefing. No new files needed -- this extends existing modules.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-05 | Delta sync produces a change summary showing which issues changed and what fields moved (e.g., "NTH-42: In Progress -> In Review") | `diffIssues` function compares existing vs delta issues; pm-status skill formats and displays the diff after delta sync; "no changes" case when delta is empty |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins | n/a | `node:test`, `node:assert/strict` | Already used for all 110 existing tests |
| cache-store.js | existing | Add `diffIssues` function alongside `mergeIssues` | Central module for all cache operations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pm-status SKILL.md | existing | Display change summary in Step 4 after delta sync | User runs `/pm` with STALE cache |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `diffIssues` in cache-store.js | Separate `diff-engine.js` module | Overkill for a single pure function; cache-store already has `mergeIssues` which is the natural companion |
| Per-field diff of all fields | Status-only diff | Requirements explicitly say "what fields moved" -- must diff at least status, priority, assignee, title |

**Installation:**
```bash
# No new dependencies -- pure JavaScript, no npm install needed
```

## Architecture Patterns

### Current Module Structure (no new files)
```
plugins/project-manager/hooks/lib/
  cache-store.js          # ADD: diffIssues function
  cache-store.test.js     # ADD: diffIssues tests
plugins/project-manager/skills/pm-status/
  SKILL.md                # MODIFY: Step 4 to include change summary output
```

### Pattern 1: Pure Diff Function
**What:** `diffIssues(existingIssues, deltaIssues)` -- a pure function that takes two issue maps (keyed by ID) and returns an array of change records.
**When to use:** Called _before_ `mergeIssues` during delta sync, using the same existing cache data and delta result that `mergeIssues` consumes.
**Example:**
```javascript
// Source: derived from existing mergeIssues pattern in cache-store.js
function diffIssues(existingIssues, deltaIssues) {
  const changes = [];

  for (const [id, deltaIssue] of Object.entries(deltaIssues)) {
    const existing = existingIssues[id];

    if (!existing) {
      // New issue -- not in cache before
      changes.push({ id, type: 'new', title: deltaIssue.title, fields: [] });
      continue;
    }

    // Compare tracked fields
    const fields = [];
    const DIFF_FIELDS = ['status', 'priority', 'assignee', 'title'];
    for (const field of DIFF_FIELDS) {
      const oldVal = existing[field];
      const newVal = deltaIssue[field];
      if (oldVal !== newVal) {
        fields.push({ field, from: oldVal, to: newVal });
      }
    }

    if (fields.length > 0) {
      changes.push({ id, type: 'updated', title: deltaIssue.title, fields });
    }
    // If no fields changed (only updatedAt timestamp changed), skip -- not user-visible
  }

  return changes;
}
```

### Pattern 2: Change Summary Formatting
**What:** The pm-status skill formats the `changes` array into a concise, human-readable block.
**When to use:** In Step 4 of pm-status skill, after delta sync and before the briefing.
**Example output:**
```
CHANGES SINCE LAST SYNC
  NTH-42 Auth middleware refactor: In Progress -> In Review
  NTH-99 API rate limiting: priority P3 -> P1
  NTH-105 New dashboard layout (new)

3 issues changed
```

### Pattern 3: No Changes Case
**What:** When delta sync returns zero changed issues, explicitly report "No changes since last sync" rather than showing nothing.
**When to use:** Required by success criteria #2 -- empty delta must produce explicit message.
**Example:**
```
No changes since last sync (synced 2h ago)
```

### Anti-Patterns to Avoid
- **Diffing after merge:** Must diff BEFORE calling `mergeIssues` -- after merge, the before-state is lost
- **Diffing description field:** Description is truncated to 500 chars and noisy -- skip it from user-visible diffs (changes too often for non-meaningful reasons)
- **Including updatedAt in user-visible diff:** Timestamp always changes for delta issues -- it is the filter criterion, not a meaningful change. Only diff user-visible fields.
- **Storing diff history in cache:** Out of scope per REQUIREMENTS.md ("Granular change history: Duplicates tracker's audit log; track only current vs. previous")

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep object comparison | Custom recursive deep-diff | Simple field-by-field loop over known fields | NormalizedIssue has flat, known fields -- no nesting to recurse |
| Change history persistence | File-based diff log | Ephemeral diff computed at sync time | Requirements explicitly exclude granular change history |
| Rich formatting (colors, tables) | Terminal escape codes | Plain text in skill output | Skill output is consumed by Claude model as text, not terminal |

**Key insight:** The NormalizedIssue schema is flat (no nested objects beyond what normalizers already flatten). A simple `!==` comparison per field is sufficient -- no deep comparison needed.

## Common Pitfalls

### Pitfall 1: Losing Before-State by Diffing After Merge
**What goes wrong:** Calling `mergeIssues` first, then trying to diff -- the cache now contains the merged data, and the before-state is gone.
**Why it happens:** The natural code flow is "fetch delta, merge, done." Diffing is an afterthought.
**How to avoid:** Call `diffIssues(existing.issues, delta.issues)` BEFORE `mergeIssues(existing, delta)`. Store the changes array, then merge, then format.
**Warning signs:** If the diff function takes `merged` data as input, it cannot produce meaningful changes.

### Pitfall 2: Noisy Diffs from Non-Meaningful Field Changes
**What goes wrong:** Showing diffs for `description` or `updatedAt` produces long, noisy output that obscures real changes.
**Why it happens:** Every delta issue has a changed `updatedAt` (that is the filter criterion). Descriptions may have minor edits.
**How to avoid:** Only diff user-visible, meaningful fields: `status`, `priority`, `assignee`, `title`. Exclude `description`, `updatedAt`, `tracker`, `id`.
**Warning signs:** Every delta issue showing as "changed" even when only the timestamp moved.

### Pitfall 3: Priority Displayed as Raw Numbers
**What goes wrong:** Change summary shows "priority: 2 -> 1" which is meaningless to users.
**Why it happens:** The NormalizedIssue stores priority as a number (0-4).
**How to avoid:** Format priority values as labels in the change summary: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low. This formatting belongs in the skill (display layer), not in `diffIssues` (data layer).
**Warning signs:** Users seeing raw numbers in priority change lines.

### Pitfall 4: Version Bump Hook Enforcement
**What goes wrong:** Commits fail because version isn't bumped across all 4 sync points.
**Why it happens:** This repo has a PreToolUse hook (`check-version-bump.js`) that enforces version synchronization.
**How to avoid:** Use `/bump-version project-manager <version>` before committing. Each commit that modifies plugin files needs a version bump.
**Warning signs:** Pre-commit hook rejection messages.

## Code Examples

### diffIssues Function Signature
```javascript
// cache-store.js -- add alongside mergeIssues

/**
 * Compare existing cached issues against incoming delta issues.
 * Returns an array of change records describing what changed per issue.
 *
 * Only compares user-visible fields: status, priority, assignee, title.
 * Issues in delta but not in existing are marked as 'new'.
 * Issues in delta with no field changes (only updatedAt moved) are omitted.
 *
 * @param {object} existingIssues - Current cached issues keyed by ID
 * @param {object} deltaIssues - Delta sync issues keyed by ID
 * @returns {Array<{id: string, type: string, title: string, fields: Array<{field: string, from: any, to: any}>}>}
 */
function diffIssues(existingIssues, deltaIssues) {
  const changes = [];
  const DIFF_FIELDS = ['status', 'priority', 'assignee', 'title'];

  for (const [id, deltaIssue] of Object.entries(deltaIssues)) {
    const existing = existingIssues[id];

    if (!existing) {
      changes.push({ id, type: 'new', title: deltaIssue.title, fields: [] });
      continue;
    }

    const fields = [];
    for (const field of DIFF_FIELDS) {
      const oldVal = existing[field];
      const newVal = deltaIssue[field];
      if (oldVal !== newVal) {
        fields.push({ field, from: oldVal, to: newVal });
      }
    }

    if (fields.length > 0) {
      changes.push({ id, type: 'updated', title: deltaIssue.title, fields });
    }
  }

  return changes;
}
```

### Skill Integration (pm-status Step 4 -- GitHub example)
```javascript
// In the pm-status delta sync node one-liner, after fetchDelta and before mergeIssues:
const delta = gh.fetchDelta({ repoKey: '<org/repo>' }, meta.lastSyncedAt);
const existing = cs.readIssues(slug);
const changes = cs.diffIssues(existing.issues, delta.issues);
const merged = cs.mergeIssues(existing, delta);
cs.writeIssues(slug, merged);
cs.writeSyncMeta(slug, { ...meta, lastSyncedAt: delta.syncedAt, syncType: 'delta', issueCount: Object.keys(merged.issues).length });
console.log(JSON.stringify({ changes, deltaCount: Object.keys(delta.issues).length, totalCount: Object.keys(merged.issues).length }));
```

### Change Summary Display Format
```
// Skill formats the changes array from the JSON output:
// When changes exist:
CHANGES SINCE LAST SYNC
  NTH-42 Auth middleware refactor: started -> completed
  NTH-99 API rate limiting: priority High -> Urgent
  NTH-105 New dashboard layout (new)

// When no changes:
No changes since last sync
```

### Test Pattern (following existing TDD conventions)
```javascript
// cache-store.test.js -- follows existing describe/it pattern with node:test

describe('diffIssues', () => {
  it('returns empty array when deltaIssues is empty', () => {
    const result = diffIssues({ 'NTH-1': { id: 'NTH-1', status: 'started' } }, {});
    assert.deepEqual(result, []);
  });

  it('marks new issues (in delta but not in existing)', () => {
    const result = diffIssues({}, { 'NTH-1': { id: 'NTH-1', title: 'New', status: 'started' } });
    assert.equal(result.length, 1);
    assert.equal(result[0].type, 'new');
  });

  it('detects status field change', () => {
    const existing = { 'NTH-1': { id: 'NTH-1', title: 'Auth', status: 'started', priority: 2, assignee: 'Scott' } };
    const delta = { 'NTH-1': { id: 'NTH-1', title: 'Auth', status: 'completed', priority: 2, assignee: 'Scott' } };
    const result = diffIssues(existing, delta);
    assert.equal(result[0].fields[0].field, 'status');
    assert.equal(result[0].fields[0].from, 'started');
    assert.equal(result[0].fields[0].to, 'completed');
  });

  it('omits issues where only updatedAt changed', () => {
    const existing = { 'NTH-1': { id: 'NTH-1', title: 'Auth', status: 'started', priority: 2, assignee: 'Scott' } };
    const delta = { 'NTH-1': { id: 'NTH-1', title: 'Auth', status: 'started', priority: 2, assignee: 'Scott' } };
    const result = diffIssues(existing, delta);
    assert.equal(result.length, 0);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Silent merge (Phase 2) | Diff-then-merge (Phase 3) | This phase | Users see what changed instead of just refreshed counts |
| `deltaCount` only | `changes` array with field-level diffs | This phase | Actionable change information |

**What exists vs. what needs building:**
- EXISTS: `mergeIssues` (blind merge), `fetchDelta` (GitHub), `normalizeLinearDelta` (Linear), pm-status skill Step 4
- NEEDS BUILDING: `diffIssues` function, change summary formatting in skill, "no changes" handling

## Open Questions

1. **Should the change summary also appear in the session-start hook systemMessage?**
   - What we know: The session-start hook currently runs delta sync is NOT in the hook -- the hook only reads cached data. Delta sync happens on-demand in the pm-status skill.
   - What's unclear: Whether the user expects to see changes at session start vs. only when running `/pm`.
   - Recommendation: Keep delta reporting in the pm-status skill only (Step 4). The session-start hook is read-only and has a 30s timeout constraint. This matches the existing architecture where hooks never make API calls.

2. **Should formatChangeSummary be a cache-store function or skill-level formatting?**
   - What we know: `diffIssues` returns raw data (change records). Formatting involves priority label mapping and text layout.
   - What's unclear: Whether to put a `formatChangeSummary` in cache-store.js or let the skill handle formatting.
   - Recommendation: Add a `formatChangeSummary(changes)` function in cache-store.js. This keeps the node one-liner in the skill clean (just `console.log(cs.formatChangeSummary(changes))`) and the formatting logic is testable. The function is small and pairs naturally with `diffIssues`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (Node.js built-in, v18+) |
| Config file | none -- direct `node --test` invocation |
| Quick run command | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` |
| Full suite command | `node --test plugins/project-manager/hooks/lib/cache-store.test.js plugins/project-manager/hooks/lib/github-adapter.test.js plugins/project-manager/hooks/lib/linear-adapter.test.js` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-05a | diffIssues detects status field changes | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05b | diffIssues detects priority field changes | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05c | diffIssues detects assignee field changes | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05d | diffIssues detects title field changes | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05e | diffIssues marks new issues (in delta, not in existing) | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05f | diffIssues returns empty array when no meaningful changes | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05g | formatChangeSummary produces human-readable output | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05h | formatChangeSummary returns "no changes" for empty array | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (add tests) |
| SYNC-05i | pm-status skill Step 4 outputs change summary | manual-only | Manual: run `/pm` with stale cache | Justification: skill is a markdown instruction file executed by the model, not programmatic code |

### Sampling Rate
- **Per task commit:** `node --test plugins/project-manager/hooks/lib/cache-store.test.js`
- **Per wave merge:** `node --test plugins/project-manager/hooks/lib/cache-store.test.js plugins/project-manager/hooks/lib/github-adapter.test.js plugins/project-manager/hooks/lib/linear-adapter.test.js`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. `cache-store.test.js` already exists with 37 tests, `node:test` framework is in use, and new tests follow the identical pattern.

## Sources

### Primary (HIGH confidence)
- `plugins/project-manager/hooks/lib/cache-store.js` -- read directly; `mergeIssues` function at line 220, `classifyFreshness` at line 262, all 10 exports confirmed
- `plugins/project-manager/hooks/lib/cache-store.test.js` -- read directly; 37 tests in existing file, `node:test` + `node:assert/strict` pattern confirmed
- `plugins/project-manager/hooks/lib/github-adapter.js` -- read directly; `fetchDelta` at line 163, `normalizeGitHubApiIssues` at line 127
- `plugins/project-manager/hooks/lib/linear-adapter.js` -- read directly; `normalizeLinearDelta` at line 93
- `plugins/project-manager/skills/pm-status/SKILL.md` -- read directly; 7-step cache-first flow, Step 4 delta sync with `deltaCount`/`totalCount` output
- `.planning/REQUIREMENTS.md` -- read directly; SYNC-05 definition and out-of-scope items (granular change history excluded)
- `.planning/phases/02-delta-sync-and-session-integration/02-01-SUMMARY.md` through `02-03-SUMMARY.md` -- read directly; all Phase 2 decisions and patterns

### Secondary (MEDIUM confidence)
- None needed -- all findings based on direct source code reading

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, extending existing modules only
- Architecture: HIGH -- `diffIssues` is a natural companion to `mergeIssues`, both pure functions on the same data shapes
- Pitfalls: HIGH -- derived from direct analysis of existing code flow (merge-before-diff ordering, field selection, priority number display)

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain -- NormalizedIssue schema is project-internal)
