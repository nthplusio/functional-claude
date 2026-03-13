# Phase 2: Delta Sync and Session Integration - Research

**Researched:** 2026-03-13
**Domain:** Timestamp-based delta sync, TTL cache expiry, session-start hook integration for a Claude Code plugin
**Confidence:** HIGH

## Summary

Phase 2 transforms the Phase 1 foundation (cache-store, GitHub adapter, Linear adapter) into a working cache-first session experience. The core value delivery is that sessions start instantly from cached data, `/pm` fetches only what changed, and staleness is always visible to the user. This phase touches five requirements across two domains: sync engine (SYNC-02, SYNC-03, SYNC-04) and session integration (SESS-01, SESS-02).

The implementation has four distinct deliverables: (1) a `sync-meta.json` file alongside `issues.json` that tracks `lastSyncedAt`, `lastFullSyncAt`, and TTL state -- enabling delta sync decisions without parsing the full issue set; (2) a `fetchDelta` method on both adapters -- GitHub via `gh api` with `since` parameter (server-side filtering, verified working), Linear via sort-by-updatedAt with client-side timestamp comparison (the only viable path given MCP constraints); (3) modification of `pm-session-start.js` to read cached issues and inject a summary into `systemMessage` with freshness indicators -- strictly read-only, no API calls; and (4) modification of `pm-status` skill and `/pm` command to use cache-first display with on-demand delta sync and `--refresh` force-pull.

The highest-risk technical challenge is the `gh api` response shape difference: `gh api` returns snake_case fields (`updated_at`, `state: "open"`) while the existing Phase 1 `normalizeGitHubIssues` function expects camelCase from `gh issue list` (`updatedAt`, `state: "OPEN"`). The delta path MUST normalize these differences. The second risk is getting the session-start hook modification right -- it must inject issue data into `systemMessage` while staying within the 30-second timeout and making zero API calls (cache read only). The third risk is the freshness indicator design: three tiers (FRESH/STALE/EXPIRED) must be defined with clear time boundaries and user-visible messaging from day one, not retrofitted.

**Primary recommendation:** Split into three plans: (1) sync-meta.json + TTL logic + delta fetch methods on both adapters; (2) session-start hook modification for cache-first systemMessage injection with freshness tiers; (3) pm-status skill + /pm command modifications for cache-first display, delta-on-demand, and --refresh flag.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-02 | Plugin performs delta sync using timestamp filtering -- GitHub via `gh api` `since` parameter, Linear via `list_issues` sorted by `updatedAt` with client-side comparison | GitHub delta path verified: `gh api repos/{owner}/{repo}/issues --method GET -f since={ISO8601}` returns only issues updated after timestamp. Response uses snake_case (`updated_at`, `state: "open"`) -- adapter must normalize. Linear path: sort-by-updatedAt + compare against `lastSyncedAt` is the only viable approach given MCP constraints. |
| SYNC-03 | Cache automatically expires after configurable TTL (default 24h), triggering full sync on next access | Requires new `sync-meta.json` file with `lastFullSyncAt` and `ttlHours`. TTL check compares `lastFullSyncAt + ttlHours` against current time. When expired, session-start hook signals staleness; next `/pm` invocation triggers full sync via existing `fetchAll`. |
| SYNC-04 | User can force a full cache refresh with `/pm --refresh` | `/pm` command (commands/pm.md) and `pm-status` skill need modification. `--refresh` bypasses TTL and delta, calls `fetchAll` directly, overwrites cache. Must keep old cache until new data is fully written (atomic swap). |
| SESS-01 | Session-start hook loads cached issue data and injects it into system message without making API calls | Hook reads `issues.json` and `sync-meta.json` from `cache/<slug>/` directory. Formats issue summary (grouped by status) into existing `systemMessage` lines array. Zero API calls -- cache read only. |
| SESS-02 | When cache is stale or expired, system message indicates staleness level so user knows data freshness | Three freshness tiers: FRESH (synced within 1 hour), STALE (synced within TTL but older than 1 hour), EXPIRED (older than TTL). Each tier has distinct messaging in systemMessage. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `fs` (built-in) | Node.js 24.x | Read sync-meta.json and issues.json in hook; write sync-meta.json after delta | Already used in cache-store.js and both hook files |
| `path` (built-in) | Node.js 24.x | Cache path construction | Already used in cache-store.js and hook files |
| `child_process` (built-in) | Node.js 24.x | `execFileSync` for `gh api` delta fetch in hook | Already used in pm-session-start.js |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cache-store.js` (Phase 1) | internal | `readIssues`, `writeIssues`, `getCacheDir`, `CACHE_VERSION` | Every cache read/write operation |
| `github-adapter.js` (Phase 1) | internal | `fetchAll`, `normalizeGitHubIssues`, `extractPriorityFromLabels` | Full sync fallback, reuse normalization helpers |
| `linear-adapter.js` (Phase 1) | internal | `normalizeLinearIssues`, `normalizeLinearState` | Normalize Linear delta results |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `sync-meta.json` as separate file | Embed metadata in `issues.json` header | Separate file allows checking TTL without parsing the full issue set. Worth the extra file for Phase 2+ where TTL checks happen every session start. |
| `gh api` for delta sync | `gh issue list --json` with manual date comparison | `gh issue list` has no `--since` flag. `gh api` is the only path for server-side timestamp filtering. |
| Three freshness tiers (FRESH/STALE/EXPIRED) | Two tiers (FRESH/EXPIRED) | Three tiers give the user meaningful intermediate information. "Synced 3h ago" is different from "never synced" or "synced 2 days ago". |

**No installation needed** -- all dependencies are Node.js built-ins and Phase 1 internal modules.

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions/modifications)

```
plugins/project-manager/
  hooks/
    lib/
      cache-store.js       # MODIFY: add readSyncMeta, writeSyncMeta, mergeIssues functions
      github-adapter.js    # MODIFY: add fetchDelta method using gh api with since parameter
      linear-adapter.js    # MODIFY: add normalizeLinearDelta for client-side timestamp comparison
    pm-session-start.js    # MODIFY: read cache, inject issue summary into systemMessage
    pm-session-end.js      # EXISTING: no changes in Phase 2
    hooks.json             # EXISTING: no changes
  skills/
    pm-status/SKILL.md     # MODIFY: read from cache first, show freshness, trigger delta on-demand
  commands/
    pm.md                  # MODIFY: add --refresh flag support, cache-first flow
```

### Pattern 1: Sync Metadata File (sync-meta.json)

**What:** A small JSON file alongside `issues.json` that stores sync timestamps, TTL configuration, and issue count -- enabling fast TTL decisions without parsing the full issue set.

**When to use:** Every session start (TTL check), every delta sync (update timestamps), every full sync (reset timestamps).

**Schema:**
```json
{
  "version": 1,
  "lastSyncedAt": "2026-03-13T10:30:00.000Z",
  "lastFullSyncAt": "2026-03-12T08:00:00.000Z",
  "ttlHours": 24,
  "issueCount": 12,
  "syncType": "delta",
  "provider": "linear"
}
```

**Design decisions:**
- `lastSyncedAt`: Most recent sync (delta or full). Used as the `since` parameter for next delta.
- `lastFullSyncAt`: Last complete refresh. TTL expiry is based on this, not `lastSyncedAt`, to ensure periodic full refreshes catch deletions even when deltas succeed.
- `ttlHours`: Stored in file (not hardcoded) for future per-project configuration (UX-03 deferred).
- `issueCount`: Cached count for systemMessage display without parsing `issues.json`.

### Pattern 2: GitHub Delta Sync via `gh api`

**What:** Fetch only issues updated since `lastSyncedAt` using the GitHub REST API `since` parameter.

**When to use:** Delta sync for GitHub-tracked projects during `/pm` invocation.

**CRITICAL: Response shape differs from `gh issue list`:**

| Field | `gh issue list --json` | `gh api` |
|-------|------------------------|----------|
| Updated timestamp | `updatedAt` (camelCase) | `updated_at` (snake_case) |
| State | `"OPEN"` / `"CLOSED"` (uppercase) | `"open"` / `"closed"` (lowercase) |
| Assignees | `[{login}]` | `[{login}]` (same) |
| Labels | `[{name}]` | `[{name}]` (same) |
| Body | `body` | `body` (same) |
| ID | `number` | `number` (same) |

**Example:**
```javascript
// Source: Verified via direct gh api test on cli/cli repo, 2026-03-13
function fetchDelta(projectConfig, lastSyncedAt) {
  const repoKey = projectConfig.repoKey;

  const output = execFileSync('gh', [
    'api', `repos/${repoKey}/issues`,
    '--method', 'GET',
    '-f', `since=${lastSyncedAt}`,
    '-f', 'state=all',
    '-f', 'per_page=100',
  ], {
    encoding: 'utf8',
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const rawIssues = JSON.parse(output);
  return normalizeGitHubApiIssues(rawIssues);
}

// Separate normalizer for gh api response (snake_case fields)
function normalizeGitHubApiIssues(rawIssues) {
  const issues = {};

  for (const raw of rawIssues) {
    // Filter out pull requests (GitHub API returns PRs in issues endpoint)
    if (raw.pull_request) continue;

    const id = '#' + raw.number;
    issues[id] = {
      id,
      title: raw.title,
      status: raw.state === 'open' ? 'started' : 'completed',
      priority: extractPriorityFromLabels(raw.labels),
      assignee: raw.assignees?.[0]?.login || null,
      description: (raw.body || '').slice(0, 500),
      updatedAt: raw.updated_at,  // snake_case from gh api
      tracker: 'github',
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}
```

**Important:** The GitHub REST API `/repos/{owner}/{repo}/issues` endpoint returns both issues AND pull requests. Pull requests have a `pull_request` field. The normalizer MUST filter these out, otherwise PR data pollutes the issue cache.

### Pattern 3: Linear Delta Sync (Sort-and-Compare)

**What:** Fetch issues sorted by `updatedAt DESC`, compare each against `lastSyncedAt`, keep only those newer than the threshold.

**When to use:** Delta sync for Linear-tracked projects. Happens at skill-time (model active, MCP available), not hook-time.

**Example (skill instruction pattern):**
```markdown
## Delta Sync (Linear)

1. Fetch recent issues sorted by updatedAt:
   ```
   list_issues {
     team: "<team_key>",
     project: "<project_name>",
     sortBy: "updatedAt",
     sortDirection: "DESC",
     limit: 50
   }
   ```

2. Compare each issue's updatedAt against the cached lastSyncedAt.
   Issues with updatedAt > lastSyncedAt are the delta.

3. Normalize delta issues using the linear-adapter normalizer.

4. Merge into existing cache (update existing entries, add new ones).

5. Update sync-meta.json with new lastSyncedAt timestamp.
```

**Constraint:** The Linear MCP `list_issues` tool does NOT support `updatedAt` date-range filtering. Sort-and-compare is the only viable delta approach. For 10-50 assigned issues, fetching 50 sorted by `updatedAt DESC` and filtering client-side is functionally equivalent to server-side filtering.

### Pattern 4: Cache Merge (Delta into Existing)

**What:** Merge delta results into the existing `issues.json` by updating matched entries and adding new ones.

**When to use:** After every successful delta fetch.

**Example:**
```javascript
function mergeIssues(existing, delta) {
  // Shallow copy existing issues
  const merged = { ...existing };

  // Overlay delta issues (new or updated)
  for (const [id, issue] of Object.entries(delta)) {
    merged[id] = issue;
  }

  return merged;
}
```

**Design decision:** Delta merge is additive only. Issue deletion detection requires the TTL full-refresh backstop (SYNC-03). Phase 2 does NOT implement per-issue verification of deletions -- that is handled by periodic full refresh. This is documented as an acceptable trade-off in PITFALLS.md.

### Pattern 5: Freshness Tiers

**What:** Three-tier staleness classification for cache data, displayed in every system message that includes issue data.

| Tier | Condition | System Message | User Action |
|------|-----------|----------------|-------------|
| FRESH | `lastSyncedAt` within 1 hour | `"Issue data synced X minutes ago"` | None needed |
| STALE | `lastSyncedAt` within TTL but older than 1 hour | `"Issue data from X hours ago -- run /pm to refresh"` | Suggest `/pm` |
| EXPIRED | `lastFullSyncAt` older than TTL | `"Issue data is X days old (expired) -- run /pm --refresh for full sync"` | Strongly suggest `/pm --refresh` |

**Example:**
```javascript
function classifyFreshness(syncMeta) {
  const now = Date.now();
  const lastSync = new Date(syncMeta.lastSyncedAt).getTime();
  const lastFull = new Date(syncMeta.lastFullSyncAt).getTime();
  const ttlMs = (syncMeta.ttlHours || 24) * 60 * 60 * 1000;
  const oneHourMs = 60 * 60 * 1000;

  if (now - lastFull > ttlMs) {
    return { tier: 'EXPIRED', age: now - lastSync, message: formatExpired(now - lastSync) };
  }
  if (now - lastSync > oneHourMs) {
    return { tier: 'STALE', age: now - lastSync, message: formatStale(now - lastSync) };
  }
  return { tier: 'FRESH', age: now - lastSync, message: formatFresh(now - lastSync) };
}
```

### Pattern 6: Session-Start Hook Cache Injection

**What:** The session-start hook reads cached issues and sync metadata, formats an issue summary, and appends it to the existing `systemMessage`.

**When to use:** Every session start where a matching project has a cache.

**Critical constraints:**
- Zero API calls (cache read only)
- Must stay within 30-second hook timeout (cache reads take < 10ms)
- Must not break existing systemMessage content (project info, Linear workspace, etc.)
- Must include freshness indicator on every display

**Data flow:**
```
1. Existing hook logic runs (project detection, gh auth switch, branch detection)
2. Read sync-meta.json from cache/<slug>/
3. If no sync-meta.json: skip issue injection (no cache yet)
4. Read issues.json from cache/<slug>/
5. Classify freshness tier
6. Format issue summary grouped by status
7. Append to systemMessage lines array
```

### Anti-Patterns to Avoid

- **API calls in session-start hook:** The hook MUST only read from cache. All sync (delta or full) happens during `/pm` command or skill execution when the model is active. Making API calls in the hook risks timeout, delays session start, and is unnecessary when cached data exists.
- **Deleting cache before refresh completes:** `/pm --refresh` must fetch new data first, then atomically overwrite. Never delete-then-fetch, which creates a window with no data if the fetch fails.
- **Using `Date.now()` as `lastSyncedAt`:** Use the most recent `updatedAt` from the API response instead. This avoids clock skew between the local machine and the API server. If the API response is empty, use the current time with a 60-second overlap buffer.
- **Hardcoding TTL in code:** Store `ttlHours` in `sync-meta.json`. Default to 24 but read from file. This enables future per-project configuration (UX-03).
- **Single `lastSyncedAt` for both full and delta:** Track `lastFullSyncAt` separately. TTL expiry is based on `lastFullSyncAt` to ensure periodic complete refreshes even when delta syncs succeed -- this is the backstop for ghost issues.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timestamp comparison | Custom date parsing logic | `new Date(iso).getTime()` comparison | ISO 8601 strings are directly parseable by JavaScript Date; no custom parser needed |
| Human-readable time ago | Custom duration formatter | Simple function: hours < 1 = "X minutes ago", hours < 24 = "X hours ago", else "X days ago" | Three cases cover all needs; no library warranted |
| Cache merge | Deep merge library | `Object.entries` loop with shallow property copy | Issues are flat objects keyed by ID; a simple loop is clearer and correct |
| Atomic sync-meta writes | New atomic write implementation | Reuse `writeIssues` pattern from cache-store.js (or add `writeSyncMeta` to same module) | Same atomic temp+rename pattern; extract as shared helper |
| GitHub pagination for delta | Custom pagination loop | `per_page=100` -- for delta sync, 100 is sufficient (rarely >100 issues change in 24h for a single project) | Pagination would be needed only for very active repos; add in v1.x if needed |

**Key insight:** Phase 2 is mostly wiring and integration, not new algorithms. The cache-store, normalizers, and adapters from Phase 1 do the heavy lifting. Phase 2 adds timestamps, TTL decisions, and hook/skill modifications.

## Common Pitfalls

### Pitfall 1: `gh api` Returns Pull Requests in Issues Endpoint

**What goes wrong:** The GitHub REST API `/repos/{owner}/{repo}/issues` endpoint returns both issues AND pull requests. Without filtering, PR data pollutes the issue cache.
**Why it happens:** GitHub's data model treats PRs as a subtype of issues. The `since` parameter applies to both.
**How to avoid:** Check for `raw.pull_request` field on each returned item. If present, skip it -- it's a PR, not an issue. The Phase 1 `fetchAll` using `gh issue list --json` does not have this problem because `gh issue list` excludes PRs automatically.
**Warning signs:** Issue count in cache is higher than expected; entries appear without a corresponding Linear/GitHub issue.

### Pitfall 2: `gh api` Snake-Case vs Phase 1 CamelCase

**What goes wrong:** Phase 1's `normalizeGitHubIssues` expects camelCase fields (`updatedAt`, `state: "OPEN"`). The `gh api` response uses snake_case (`updated_at`, `state: "open"`). Passing `gh api` output to Phase 1's normalizer silently produces wrong data: `updatedAt` is `undefined`, state comparisons fail.
**Why it happens:** `gh issue list --json` (used by Phase 1 fetchAll) reformats fields to camelCase. `gh api` returns the raw GitHub REST API response in snake_case.
**How to avoid:** Write a separate `normalizeGitHubApiIssues` function specifically for `gh api` output. Do NOT reuse Phase 1's `normalizeGitHubIssues` for delta sync. Alternatively, add a field-mapping shim that converts snake_case to camelCase before calling the existing normalizer.
**Warning signs:** All delta-fetched GitHub issues have `undefined` for `updatedAt`; issues show wrong status because `"open" !== "OPEN"` comparison fails.

### Pitfall 3: Stale `lastSyncedAt` from Local Clock Skew

**What goes wrong:** Setting `lastSyncedAt = new Date().toISOString()` uses the local machine's clock. If the local clock is ahead of the API server's clock, issues updated between `serverNow` and `localNow` are missed on the next delta sync.
**Why it happens:** The `since` parameter must match the API server's notion of time, not the client's.
**How to avoid:** After a successful sync, set `lastSyncedAt` to the maximum `updatedAt` value from the returned issues (this is the server's timestamp). If the API returns no issues, use the current time minus 60 seconds as a safety buffer.
**Warning signs:** Delta sync occasionally returns zero results despite recent known changes; issues "appear" on full refresh that were missed by delta.

### Pitfall 4: Session-Start Hook Exceeds Timeout with API Calls

**What goes wrong:** Adding delta sync logic to the session-start hook causes it to make API calls (gh api, MCP) that add 3-15 seconds of latency, risking the 30-second timeout.
**Why it happens:** The temptation to refresh data at session start to maximize freshness.
**How to avoid:** The session-start hook MUST be read-only for cache data. It reads `sync-meta.json` and `issues.json`, formats the summary, and emits `systemMessage`. All API sync happens when the user runs `/pm` (model-active context). This keeps hook execution under 2 seconds.
**Warning signs:** Intermittent session start failures; slow session startup reported by users.

### Pitfall 5: `/pm --refresh` Leaves Cache Empty on Failure

**What goes wrong:** The refresh flow deletes the existing cache before fetching new data. If the fetch fails (API down, timeout, rate limit), there is no data to display.
**Why it happens:** Natural implementation: clear old data, fetch new data, write. But the "clear" step is premature.
**How to avoid:** Fetch new data first, then atomically overwrite. The existing `writeIssues` already uses temp+rename, so writing new data simply overwrites the old file atomically. If the fetch fails, the old cache is still intact.
**Warning signs:** Running `/pm --refresh` during an API outage leaves the user with no data at all.

### Pitfall 6: Linear Delta Sync Misses Issues When Cache Is Very Stale

**What goes wrong:** The sort-by-updatedAt approach fetches the N most recently updated issues. If the cache is very stale (e.g., 3 days old) and many issues changed, the delta might not reach far enough back in time to capture all changes.
**Why it happens:** `limit: 50` returns at most 50 issues. If 60 issues changed in 3 days, the oldest 10 changes are missed.
**How to avoid:** When the cache is EXPIRED (beyond TTL), trigger a full sync (`fetchAll`) instead of delta. Delta sync should only be used when the cache is FRESH or STALE (within TTL). The TTL check in `sync-meta.json` determines which path to take.
**Warning signs:** After a long absence, some issues show old statuses; running `/pm --refresh` shows different results than a plain `/pm`.

## Code Examples

### sync-meta.json Read/Write (cache-store.js extension)

```javascript
// Source: Extension to existing cache-store.js module
function readSyncMeta(slug, cacheRoot) {
  try {
    const dir = getCacheDir(slug, cacheRoot);
    const filePath = path.join(dir, 'sync-meta.json');

    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (data && data.version) return data;
  } catch (_e) {}

  return null;
}

function writeSyncMeta(slug, meta, cacheRoot) {
  try {
    const dir = getCacheDir(slug, cacheRoot);
    const filePath = path.join(dir, 'sync-meta.json');
    const tmpPath = filePath + '.tmp.' + process.pid;

    fs.writeFileSync(tmpPath, JSON.stringify(meta, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
    return true;
  } catch (_e) {
    try {
      const dir = path.join(cacheRoot || CACHE_ROOT, slug);
      fs.unlinkSync(path.join(dir, 'sync-meta.json.tmp.' + process.pid));
    } catch (_e2) {}
    return false;
  }
}
```

### GitHub Delta Fetch (github-adapter.js extension)

```javascript
// Source: Verified via direct gh api test, 2026-03-13
function fetchDelta(projectConfig, lastSyncedAt) {
  const repoKey = projectConfig.repoKey;

  const output = execFileSync('gh', [
    'api', `repos/${repoKey}/issues`,
    '--method', 'GET',
    '-f', `since=${lastSyncedAt}`,
    '-f', 'state=all',
    '-f', 'per_page=100',
  ], {
    encoding: 'utf8',
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const rawIssues = JSON.parse(output);
  return normalizeGitHubApiIssues(rawIssues);
}

// Normalizer for gh api response (snake_case fields, lowercase state)
function normalizeGitHubApiIssues(rawIssues) {
  const issues = {};

  for (const raw of rawIssues) {
    if (raw.pull_request) continue;  // Skip PRs

    const id = '#' + raw.number;
    issues[id] = {
      id,
      title: raw.title,
      status: raw.state === 'open' ? 'started' : 'completed',
      priority: extractPriorityFromLabels(raw.labels || []),
      assignee: raw.assignees?.[0]?.login || null,
      description: (raw.body || '').slice(0, 500),
      updatedAt: raw.updated_at,  // NOTE: snake_case from gh api
      tracker: 'github',
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}
```

### Session-Start Hook Issue Injection

```javascript
// Source: Extension to existing pm-session-start.js main() function
// Placed AFTER existing systemMessage construction, BEFORE console.log output

// --- Phase 2: Cache-first issue injection ---
const cacheStore = require('./lib/cache-store');
const slug = project.slug || repoKey.replace('/', '-');
const syncMeta = cacheStore.readSyncMeta(slug);
const cachedData = cacheStore.readIssues(slug);

if (cachedData && cachedData.issues && syncMeta) {
  const freshness = classifyFreshness(syncMeta);
  const issues = Object.values(cachedData.issues);

  // Group by status
  const inProgress = issues.filter(i => i.status === 'started');
  const upNext = issues.filter(i => i.status === 'unstarted');

  lines.push('', `### Cached Issues (${freshness.message})`);

  if (inProgress.length > 0) {
    lines.push('', '**IN PROGRESS:**');
    for (const issue of inProgress.slice(0, 5)) {
      lines.push(`- ${issue.id} - ${issue.title}`);
    }
  }

  if (upNext.length > 0) {
    lines.push('', '**UP NEXT:**');
    for (const issue of upNext.slice(0, 3)) {
      lines.push(`- ${issue.id} - ${issue.title}`);
    }
  }

  if (freshness.tier === 'EXPIRED') {
    lines.push('', '> Issue data has expired. Run `/pm --refresh` for a full sync.');
  } else if (freshness.tier === 'STALE') {
    lines.push('', '> Run `/pm` to refresh issue data.');
  }
}
```

### Freshness Classification

```javascript
function classifyFreshness(syncMeta) {
  const now = Date.now();
  const lastSync = new Date(syncMeta.lastSyncedAt || 0).getTime();
  const lastFull = new Date(syncMeta.lastFullSyncAt || 0).getTime();
  const ttlMs = (syncMeta.ttlHours || 24) * 60 * 60 * 1000;
  const oneHourMs = 60 * 60 * 1000;

  const ageSinceSync = now - lastSync;
  const ageSinceFull = now - lastFull;

  if (ageSinceFull > ttlMs) {
    return { tier: 'EXPIRED', age: ageSinceSync, message: formatAge(ageSinceSync) + ' -- expired' };
  }
  if (ageSinceSync > oneHourMs) {
    return { tier: 'STALE', age: ageSinceSync, message: formatAge(ageSinceSync) + ' ago' };
  }
  return { tier: 'FRESH', age: ageSinceSync, message: 'synced ' + formatAge(ageSinceSync) + ' ago' };
}

function formatAge(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  return days + 'd';
}
```

### Cache Merge Helper

```javascript
function mergeIssues(existingData, deltaResult) {
  const merged = { ...existingData.issues };

  for (const [id, issue] of Object.entries(deltaResult.issues)) {
    merged[id] = issue;
  }

  return {
    version: existingData.version,
    tracker: existingData.tracker,
    syncedAt: deltaResult.syncedAt,
    issues: merged,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gh issue list --json` for everything | `gh api` with `since` for delta, `gh issue list` for full | `gh api` always supported `since`; `gh issue list` does not | Delta sync with server-side filtering is vastly more efficient |
| Fetch all on every `/pm` call | Cache-first with on-demand delta | This phase | Session startup goes from 3-10s to < 100ms for cache read |
| No freshness indicators | Three-tier FRESH/STALE/EXPIRED | This phase | User always knows how old their data is |

**Deprecated/outdated:**
- `gh issue list --since`: Does not exist. The `--since` flag is NOT available on `gh issue list`. Must use `gh api` for server-side timestamp filtering.

## Open Questions

1. **Linear MCP `list_issues` pagination for large teams**
   - What we know: The official MCP tool accepts a `limit` parameter. Default is unclear (likely 50 from Linear API defaults).
   - What's unclear: Whether the MCP tool returns pagination cursors for fetching additional pages. If not, `limit: 50` is a hard ceiling for delta sync.
   - Recommendation: Use `limit: 50` for delta sync. For teams with more than 50 active issues, the TTL full-refresh backstop will catch anything missed. Validate during implementation by testing with actual MCP response.

2. **GitHub API rate limiting for delta sync**
   - What we know: Authenticated `gh api` calls have 5,000 requests/hour limit. Each delta sync uses 1 request.
   - What's unclear: Whether the per_page=100 limit is sufficient for very active repos where >100 issues change in a 24h period.
   - Recommendation: 100 is sufficient for all configured projects (all use Linear as primary tracker). If a GitHub-primary project has >100 delta changes in 24h, the TTL full refresh handles it. Add pagination in v1.x if needed.

3. **Where to run Linear delta sync (hook vs skill)**
   - What we know: MCP tools cannot be called from hooks. Linear delta must happen when the model is active.
   - What's unclear: Whether to embed delta sync logic in `pm-status` skill or create a separate `pm-sync` skill.
   - Recommendation: Embed in `pm-status` skill for now. Adding a skill means the model discovers and invokes it. Putting delta sync as Step 2 in the existing `pm-status` flow (before formatting) is simpler and avoids a new skill file. If complexity grows, extract to `pm-sync` in Phase 3.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node --test` runner + `node:assert` |
| Config file | None -- zero-config; tests run via CLI |
| Quick run command | `node --test plugins/project-manager/hooks/lib/*.test.js` |
| Full suite command | `node --test plugins/project-manager/hooks/lib/*.test.js` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-02 (GitHub) | `fetchDelta` calls `gh api` with `since`, normalizes snake_case response, filters PRs | unit (normalizer) + integration (gh api mock) | `node --test plugins/project-manager/hooks/lib/github-adapter.test.js` | Exists (needs delta tests added) |
| SYNC-02 (Linear) | `normalizeLinearDelta` filters issues by `updatedAt > lastSyncedAt` | unit | `node --test plugins/project-manager/hooks/lib/linear-adapter.test.js` | Exists (needs delta tests added) |
| SYNC-03 | TTL check: `lastFullSyncAt + ttlHours > now` triggers EXPIRED classification | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (needs sync-meta + TTL tests) |
| SYNC-04 | Full refresh writes new cache atomically (keeps old until new is written) | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (needs mergeIssues tests) |
| SESS-01 | Issue summary injected into systemMessage from cache (no API calls) | manual | Verify by running session start and checking system context | N/A -- hook integration test |
| SESS-02 | Freshness tier displayed: FRESH/STALE/EXPIRED with correct messaging | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js` | Exists (needs freshness tier tests) |

### Sampling Rate

- **Per task commit:** `node --test plugins/project-manager/hooks/lib/*.test.js`
- **Per wave merge:** Same as above (single test suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `cache-store.test.js` -- needs new tests for: `readSyncMeta`, `writeSyncMeta`, `mergeIssues`, `classifyFreshness`, TTL expiry logic
- [ ] `github-adapter.test.js` -- needs new tests for: `normalizeGitHubApiIssues` (snake_case handling, PR filtering), `fetchDelta` shape validation
- [ ] `linear-adapter.test.js` -- needs new tests for: delta filtering logic (issues with `updatedAt > lastSyncedAt`)

Existing test infrastructure from Phase 1 is solid. No new test files needed -- extend existing ones.

## Sources

### Primary (HIGH confidence)

- **Direct verification:** `gh api repos/cli/cli/issues --method GET -f since="2026-03-01T00:00:00Z"` returns filtered results with snake_case fields (`updated_at`, `state: "open"`) -- verified 2026-03-13
- **Direct verification:** `gh api` issue response includes `pull_request` field on PR items -- must filter to avoid cache pollution
- **Direct verification:** `gh issue list --json state` returns `"OPEN"/"CLOSED"` (uppercase); `gh api` returns `"open"/"closed"` (lowercase) -- confirmed 2026-03-13
- **Existing codebase:** `pm-session-start.js` (193 lines) -- established patterns for hook I/O, `systemMessage` construction, `require()`, fail-open, `execFileSync`
- **Existing codebase:** `cache-store.js` (147 lines) -- `readIssues`, `writeIssues`, `getCacheDir`, atomic write pattern, backup recovery
- **Existing codebase:** `github-adapter.js` (119 lines) -- `fetchAll`, `normalizeGitHubIssues`, `extractPriorityFromLabels`
- **Existing codebase:** `linear-adapter.js` (81 lines) -- `normalizeLinearIssues`, `normalizeLinearState`
- **Phase 1 tests:** All 16 cache-store tests pass; adapter normalizer tests pass -- Phase 1 output is solid

### Secondary (MEDIUM confidence)

- [GitHub REST API Issues](https://docs.github.com/en/rest/issues/issues) -- `since` parameter, snake_case response format, PR inclusion behavior
- [Linear MCP list_issues tool schema (Glama)](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) -- `sortBy`, `sortDirection`, `limit` parameters available; no `since`/`updatedAt` filter
- Project research: `.planning/research/ARCHITECTURE.md` -- sync-meta schema, dual-path delta, hook vs skill boundary
- Project research: `.planning/research/PITFALLS.md` -- hook timeout, ghost issues, cache corruption, stale data

### Tertiary (LOW confidence)

- Linear MCP pagination behavior for `limit > 50` -- unverified for the specific MCP version installed
- Whether `list_issues` returns recently archived/trashed issues in the response (affects ghost detection)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all built-in Node.js modules; extends verified Phase 1 modules
- Architecture: HIGH -- session-start hook pattern, adapter extension, and cache merge are straightforward extensions of established codebase patterns
- Pitfalls: HIGH -- `gh api` snake_case difference verified directly; PR inclusion verified; hook timeout constraint from official docs; freshness tiers designed from PITFALLS.md research
- GitHub delta: HIGH -- `gh api` `since` parameter tested with real data; response shape documented with field-level comparison
- Linear delta: MEDIUM -- sort-and-compare approach is well-understood but MCP pagination behavior unverified at implementation time

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain; no fast-moving dependencies)
