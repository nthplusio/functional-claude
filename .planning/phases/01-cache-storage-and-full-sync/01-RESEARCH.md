# Phase 1: Cache Storage and Full Sync - Research

**Researched:** 2026-03-12
**Domain:** JSON file caching with atomic writes and multi-tracker full sync for a Claude Code plugin
**Confidence:** HIGH

## Summary

Phase 1 builds the foundation that every subsequent phase writes to: a normalized JSON cache at `cache/<slug>/issues.json` that stores issue data fetched from either GitHub Issues (via `gh` CLI) or Linear (via MCP `list_issues`), protected by atomic writes and fail-open error handling. The cache store module is the single most depended-on component in the entire incremental sync system.

The critical finding from codebase analysis is that **no plugin in this repository uses npm dependencies** -- all hooks are pure Node.js with only built-in modules (`fs`, `path`, `child_process`). The original research recommended `write-file-atomic@7.0.1`, but introducing the first-ever npm dependency to the plugin ecosystem is unnecessary when the atomic write pattern (write-to-temp-file, `fs.renameSync`) is approximately 15 lines of code using built-in `fs`. This keeps the plugin zero-dependency and consistent with every other plugin in the marketplace.

The full sync path has two variants: GitHub uses `gh issue list --json` (simpler for full pulls) or `gh api` with `--method GET` (needed for `since` parameter in Phase 2); Linear uses the MCP `list_issues` tool with team/project scoping. Both normalize to the same `NormalizedIssue` schema and write to the same cache format. The adapter pattern keeps tracker-specific logic isolated, so adding a third tracker later requires only a new adapter file.

**Primary recommendation:** Implement cache-store.js as a pure Node.js module with zero external dependencies, using `fs.writeFileSync` to a `.tmp` sibling file + `fs.renameSync` for atomic writes, and a `.bak` backup file for recovery from parse failures.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CACHE-01 | Plugin stores issue data (status, title, priority, assignee, description, updatedAt) in a normalized JSON cache at `cache/<slug>/issues.json` | Cache schema defined in Architecture Patterns section; NormalizedIssue fields verified against both GitHub API response and Linear MCP `list_issues` output |
| CACHE-02 | Cache writes use atomic write pattern (write-to-temp, then rename) to prevent corruption from process termination | Atomic Write Pattern section provides pure-Node.js implementation; `fs.renameSync` is POSIX-atomic on Linux/macOS; no npm dependency needed |
| CACHE-03 | Cache read/write failures are caught and never block session startup or command execution | Fail-Open Error Handling pattern documented with specific try/catch structure and fallback chain (parse fail -> .bak -> empty state) |
| CACHE-04 | Each project's cache is isolated in its own `cache/<slug>/` directory | Existing convention verified: `~/.claude/project-manager/cache/<slug>/` already used for `context.json`; four projects confirmed in live cache directory |
| SYNC-01 | Plugin can perform a full sync (fetch all relevant issues, normalize, write to cache) as the cold-start path | GitHub full sync via `gh issue list --json` verified working; Linear full sync via MCP `list_issues` with team/project scoping documented; both normalize to shared schema |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `fs` (built-in) | Node.js 24.x | JSON cache read/write, directory creation, atomic rename | Already used in every hook file; zero-dependency pattern established across all plugins |
| `path` (built-in) | Node.js 24.x | Cache path construction | Already used in both hook files |
| `child_process` (built-in) | Node.js 24.x | `execFileSync` for `gh` CLI calls | Already used in `pm-session-start.js` for git and gh commands |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `os` (built-in) | Node.js 24.x | `os.tmpdir()` fallback for atomic writes if same-directory temp fails | Only if cache directory has unusual filesystem constraints |
| `crypto` (built-in) | Node.js 24.x | Generate unique temp file suffixes | Optional; `Date.now() + process.pid` is sufficient for uniqueness |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled atomic write (15 lines) | `write-file-atomic@7.0.1` | Adds first npm dependency to entire plugin ecosystem; requires `package.json`, `node_modules`, `.gitignore` changes, and `plugin-manifest.json` update. The 15-line implementation covers our needs (single-process writes, Linux/macOS only). |
| `gh issue list --json` for full sync | `gh api repos/.../issues --method GET` | `gh issue list --json` is simpler for full pulls (handles pagination automatically, cleaner field names like `updatedAt` vs `updated_at`). Reserve `gh api` for Phase 2 delta sync where `since` parameter is needed. |
| Single `issues.json` with metadata | Separate `issues.json` + `sync-meta.json` | Two files adds complexity but allows reading sync metadata (TTL, lastSyncedAt) without parsing the full issue set. Worth it for Phase 2+. For Phase 1, a single `issues.json` with a metadata header is sufficient -- split into two files when Phase 2 needs it. |

**No installation needed** -- all dependencies are Node.js built-ins.

## Architecture Patterns

### Recommended Project Structure (Phase 1 additions)

```
plugins/project-manager/
  hooks/
    lib/
      cache-store.js       # NEW: Cache read/write with atomic writes and backup recovery
      github-adapter.js    # NEW: GitHub full sync via gh CLI
      linear-adapter.js    # NEW: Linear full sync via MCP list_issues (skill-driven)
    pm-session-start.js    # EXISTING: No changes in Phase 1
    pm-session-end.js      # EXISTING: No changes in Phase 1
    hooks.json             # EXISTING: No changes in Phase 1
```

**Key structural decision:** New modules go in `hooks/lib/` because they are CommonJS modules required by hook scripts. This follows the architecture from ARCHITECTURE.md and keeps the module system consistent.

### Pattern 1: Atomic Write with Backup Recovery

**What:** Write cache data to a temporary file, rename atomically, maintain a backup of the previous good state.

**When to use:** Every cache write operation.

**Example:**
```javascript
// Source: POSIX atomic rename pattern, adapted for this plugin's conventions
const fs = require('fs');
const path = require('path');

function atomicWriteJSON(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = filePath + '.tmp.' + process.pid;
  const bakPath = filePath + '.bak';

  const json = JSON.stringify(data, null, 2);

  // Write to temp file first
  fs.writeFileSync(tmpPath, json, 'utf8');

  // Backup current file if it exists
  try {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, bakPath);
    }
  } catch (_e) { /* backup is best-effort */ }

  // Atomic rename: this is the commit point
  fs.renameSync(tmpPath, filePath);
}
```

### Pattern 2: Fail-Open Cache Read with Fallback Chain

**What:** Attempt to read and parse the cache file. On failure, try the backup. On backup failure, return empty state. Never throw.

**When to use:** Every cache read operation.

**Example:**
```javascript
function readCache(filePath) {
  // Try primary file
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (data && data.version && data.issues) return data;
  } catch (_e) { /* fall through to backup */ }

  // Try backup
  const bakPath = filePath + '.bak';
  try {
    const raw = fs.readFileSync(bakPath, 'utf8');
    const data = JSON.parse(raw);
    if (data && data.version && data.issues) return data;
  } catch (_e) { /* fall through to empty */ }

  // Return empty state -- caller can trigger full sync
  return null;
}
```

### Pattern 3: Provider Adapter Interface

**What:** Abstract tracker-specific fetch logic behind a common interface so the cache store does not care whether data comes from GitHub or Linear.

**When to use:** Any code that fetches and normalizes issue data.

**Example:**
```javascript
// Both adapters export:
// fetchAll(projectConfig) -> { issues: { [id]: NormalizedIssue }, syncedAt: ISO8601 }

// NormalizedIssue schema:
const issue = {
  id: 'NTH-42',           // Linear ID (e.g., "NTH-42") or GitHub "#28"
  title: 'Auth middleware refactor',
  status: 'started',       // Normalized across trackers
  priority: 2,             // 0=none, 1=urgent, 2=high, 3=medium, 4=low
  assignee: 'scoussens',   // Display name or username
  description: 'Refactor the auth...',  // Truncated to ~500 chars
  updatedAt: '2026-03-10T14:30:00.000Z',
  tracker: 'linear'        // or 'github'
};
```

### Pattern 4: GitHub Full Sync via `gh issue list`

**What:** Use `gh issue list --json` for full sync. It handles pagination automatically and returns clean field names.

**When to use:** Full sync for GitHub-tracked projects.

**Example:**
```javascript
function fetchAllGitHub(projectConfig) {
  const repoKey = projectConfig.repoKey; // e.g., "nthplusio/functional-claude"
  const output = execFileSync('gh', [
    'issue', 'list',
    '--repo', repoKey,
    '--json', 'number,title,state,updatedAt,assignees,labels,body',
    '--state', 'all',
    '--limit', '200'
  ], { encoding: 'utf8', timeout: 15000 });

  const rawIssues = JSON.parse(output);
  const issues = {};

  for (const raw of rawIssues) {
    const id = `#${raw.number}`;
    issues[id] = {
      id,
      title: raw.title,
      status: normalizeGitHubState(raw.state),
      priority: extractPriorityFromLabels(raw.labels),
      assignee: raw.assignees[0]?.login || null,
      description: (raw.body || '').slice(0, 500),
      updatedAt: raw.updatedAt,
      tracker: 'github'
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}

function normalizeGitHubState(state) {
  // GitHub states are OPEN/CLOSED; map to normalized vocabulary
  return state === 'OPEN' ? 'started' : 'completed';
}
```

### Pattern 5: Linear Full Sync (Skill-Driven)

**What:** Linear data is fetched via MCP `list_issues` tool, which can only be invoked by the model during skill execution. The skill writes normalized data to the cache file.

**When to use:** Full sync for Linear-tracked projects. The skill instructs the model to call `list_issues`, normalize results, and write to the cache.

**Important constraint:** This cannot happen in hooks (hooks cannot call MCP tools). For Phase 1, Linear full sync is triggered by the model executing the pm-sync skill, not by the hook. GitHub full sync CAN happen in hooks since it uses `gh` CLI.

**Adapter code (normalizes MCP response):**
```javascript
// Called by the skill/model after receiving list_issues response
function normalizeLinearIssues(linearIssues, teamKey) {
  const issues = {};

  for (const raw of linearIssues) {
    const id = raw.identifier || `${teamKey}-${raw.number}`;
    issues[id] = {
      id,
      title: raw.title,
      status: normalizeLinearState(raw.state?.name || raw.status),
      priority: raw.priority || 0,
      assignee: raw.assignee?.name || raw.assignee?.displayName || null,
      description: (raw.description || '').slice(0, 500),
      updatedAt: raw.updatedAt,
      tracker: 'linear'
    };
  }

  return { issues, syncedAt: new Date().toISOString() };
}

function normalizeLinearState(stateName) {
  // Linear states vary by team; normalize to standard vocabulary
  const lower = (stateName || '').toLowerCase();
  if (lower.includes('backlog')) return 'backlog';
  if (lower.includes('todo') || lower.includes('unstarted')) return 'unstarted';
  if (lower.includes('progress') || lower.includes('started') || lower.includes('review')) return 'started';
  if (lower.includes('done') || lower.includes('complete')) return 'completed';
  if (lower.includes('cancel')) return 'cancelled';
  return 'unstarted'; // safe default
}
```

### Anti-Patterns to Avoid

- **MCP calls in hooks:** Hooks run as external Node.js processes before the model is active. They cannot invoke MCP tools. Linear sync must happen through skill execution (model-driven).
- **npm dependencies in hooks:** No plugin in this repository uses npm packages. The atomic write pattern is simple enough to hand-roll. Do not add `write-file-atomic` or `package.json`.
- **`fs.writeFileSync` directly to cache path:** Always write to temp file then rename. Direct writes are not atomic and will corrupt the cache on process kill.
- **Separate JSON file per issue:** For 10-100 issues, a single `issues.json` keyed by ID is faster to read and simpler to write atomically than 100 individual files.
- **Caching full issue descriptions:** Truncate to ~500 characters. Full descriptions can be thousands of characters with embedded images/links and bloat token cost when injected into context.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic file writes | Full `write-file-atomic` reimplementation with ownership, mode, chown | Simple `writeFileSync` to `.tmp` + `renameSync` | We only need POSIX atomicity for a single JSON file; no need for uid/gid management or Windows support |
| JSON schema validation | Custom schema validator | Simple version check + field presence guards | Cache format is controlled by us; if version does not match, trigger full refresh |
| Issue status normalization | Custom state machine per tracker | Simple string mapping functions | Both trackers have fewer than 10 states; a lookup map is sufficient |
| GitHub pagination | Custom cursor-based pagination | `gh issue list --limit 200` | `gh` CLI handles pagination internally; `--limit 200` covers all but the largest repositories |
| Cache directory creation | Complex directory management | `fs.mkdirSync(dir, { recursive: true })` | Already used in `pm-session-start.js` line 150; single call handles all parent directories |

**Key insight:** This phase is entirely about plumbing -- reliable file I/O and data normalization. The complexity comes from error handling edge cases, not from the core logic.

## Common Pitfalls

### Pitfall 1: Non-Atomic Cache Writes Cause Corruption

**What goes wrong:** Using `fs.writeFileSync` directly to `issues.json` truncates the file then writes. If the process is killed between truncation and write completion, the file is empty or contains partial JSON. The next read fails with `SyntaxError: Unexpected end of JSON input`.
**Why it happens:** `fs.writeFileSync` is not atomic. Claude Code itself had this exact bug with `.claude.json` corruption (GitHub issue #29036).
**How to avoid:** Always write to `issues.json.tmp.<pid>`, then `fs.renameSync` to `issues.json`. Maintain `issues.json.bak` as recovery fallback.
**Warning signs:** Occasional empty cache, issue counts resetting to zero between sessions.

### Pitfall 2: Missing Fail-Open in Cache Operations

**What goes wrong:** A `try/catch` is missing around cache read or write, causing an unhandled exception that crashes the hook process. The session fails to start.
**Why it happens:** Happy path works in testing; edge cases (permissions, disk full, corrupt JSON, missing directory) are not exercised.
**How to avoid:** Every public function in `cache-store.js` must wrap its body in try/catch and return a safe default (null for reads, silent failure for writes). The top-level hook already has fail-open, but cache-store should be independently fail-safe.
**Warning signs:** Session startup failures that go away on retry.

### Pitfall 3: GitHub `gh issue list` State Casing

**What goes wrong:** `gh issue list --json state` returns `"OPEN"` and `"CLOSED"` (uppercase). `gh api` returns `"open"` and `"closed"` (lowercase). Code that compares states case-sensitively breaks when switching between the two commands.
**Why it happens:** Different GitHub CLI commands use different serialization formats. Verified directly: `gh issue list --json state` returns `"OPEN"`, `gh api` returns `"open"`.
**How to avoid:** Always lowercase the state before normalizing: `raw.state.toLowerCase()`.
**Warning signs:** All GitHub issues show as "unstarted" because the state mapping fails silently.

### Pitfall 4: Linear MCP Response Shape Uncertainty

**What goes wrong:** The Linear MCP `list_issues` response may have different field names or nesting than expected. For example, `assignee` might be a string (display name) or an object (`{ name, displayName, id }`). The `state` might be a string or an object (`{ name, type }`).
**Why it happens:** MCP tools abstract the underlying API and their response shapes are not always documented precisely.
**How to avoid:** Write the normalizer defensively -- handle both string and object shapes for `assignee` and `state`. Log (but do not throw on) unexpected shapes so they can be diagnosed.
**Warning signs:** `null` values in normalized issues for fields that should have data.

### Pitfall 5: Cache Path Collision Between Projects

**What goes wrong:** Two projects with the same slug (e.g., both named "my-project" on different GitHub orgs) overwrite each other's cache.
**Why it happens:** The slug is derived from `project.slug || repoKey.replace('/', '-')`. If two projects happen to produce the same slug, their caches collide.
**How to avoid:** Use the full `repoKey` (e.g., `nthplusio/functional-claude`) as part of the slug, or use the slug from `projects.json` which is user-defined and unique per config entry. The existing code already uses `project.slug || repoKey.replace('/', '-')` -- verify that the fallback produces unique values for all configured projects.
**Warning signs:** One project's issues appearing in another project's status briefing.

## Code Examples

### Complete Cache Store Module Structure

```javascript
// hooks/lib/cache-store.js
'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_ROOT = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'project-manager', 'cache'
);

const CACHE_VERSION = 1;

/**
 * Get the cache directory for a project.
 * Creates it if it does not exist.
 */
function getCacheDir(slug) {
  const dir = path.join(CACHE_ROOT, slug);
  try { fs.mkdirSync(dir, { recursive: true }); } catch (_e) {}
  return dir;
}

/**
 * Read issues.json for a project. Returns null on any failure.
 */
function readIssues(slug) {
  const filePath = path.join(getCacheDir(slug), 'issues.json');
  // ... fallback chain: primary -> .bak -> null
}

/**
 * Write issues.json atomically for a project. Returns true/false.
 */
function writeIssues(slug, data) {
  const filePath = path.join(getCacheDir(slug), 'issues.json');
  // ... atomic write: .tmp -> rename, with .bak backup
}

module.exports = { getCacheDir, readIssues, writeIssues, CACHE_VERSION, CACHE_ROOT };
```

### GitHub Full Sync Entry Point

```javascript
// hooks/lib/github-adapter.js
'use strict';

const { execFileSync } = require('child_process');

function fetchAll(projectConfig) {
  const repo = projectConfig.repoKey; // "org/repo"
  const raw = execFileSync('gh', [
    'issue', 'list', '--repo', repo,
    '--json', 'number,title,state,updatedAt,assignees,labels,body',
    '--state', 'all', '--limit', '200'
  ], { encoding: 'utf8', timeout: 15000 });

  return normalizeGitHubIssues(JSON.parse(raw));
}

function normalizeGitHubIssues(rawIssues) {
  const issues = {};
  for (const raw of rawIssues) {
    const id = `#${raw.number}`;
    issues[id] = {
      id,
      title: raw.title,
      status: raw.state.toLowerCase() === 'open' ? 'started' : 'completed',
      priority: extractPriorityFromLabels(raw.labels || []),
      assignee: (raw.assignees && raw.assignees[0]?.login) || null,
      description: (raw.body || '').slice(0, 500),
      updatedAt: raw.updatedAt,
      tracker: 'github'
    };
  }
  return { issues, syncedAt: new Date().toISOString() };
}

module.exports = { fetchAll, normalizeGitHubIssues };
```

### Cache File Schema (issues.json)

```json
{
  "version": 1,
  "tracker": "linear",
  "syncedAt": "2026-03-12T10:30:00.000Z",
  "issues": {
    "NTH-42": {
      "id": "NTH-42",
      "title": "Auth middleware refactor",
      "status": "started",
      "priority": 2,
      "assignee": "Scott",
      "description": "Refactor the auth middleware to support...",
      "updatedAt": "2026-03-10T14:30:00.000Z",
      "tracker": "linear"
    },
    "NTH-45": {
      "id": "NTH-45",
      "title": "Add rate limiting",
      "status": "unstarted",
      "priority": 3,
      "assignee": "Scott",
      "description": "Implement rate limiting for API endpoints...",
      "updatedAt": "2026-03-09T08:00:00.000Z",
      "tracker": "linear"
    }
  }
}
```

**Design decisions:**
- `version` field enables schema migration in future phases (LIFE-02 deferred requirement)
- Issues keyed by ID (object map, not array) for O(1) lookup and merge during Phase 2 delta sync
- `syncedAt` at top level tracks when data was last fetched -- Phase 2 will split this into separate `sync-meta.json`
- `tracker` at top level identifies the source system
- `description` truncated at write time (not read time) to keep file size bounded

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct `fs.writeFileSync` to target | Write-to-temp + `fs.renameSync` | Long-standing POSIX pattern; became critical awareness in Node.js ecosystem after Claude Code `.claude.json` corruption (2025) | Prevents data loss on process kill |
| `gh issue list --json` for everything | `gh api` for delta (with `since`), `gh issue list` for full sync | `gh api` always supported `since`; `gh issue list` does not | Use the right tool for each sync type |
| SQLite for all structured caching | JSON files for small datasets (<500 records) | `node:sqlite` still experimental as of Node 24 | JSON files are simpler, zero-dependency, and sufficient at plugin scale |

**Deprecated/outdated:**
- `node:sqlite`: Still experimental on Node 24, RC on Node 25. Emits `ExperimentalWarning`. Not suitable for user-facing plugins.
- `lowdb`: Pure ESM since v3. Incompatible with CommonJS hook scripts.
- `conf`: Pure ESM. Same incompatibility.

## Open Questions

1. **Linear MCP `list_issues` exact response shape**
   - What we know: The tool accepts `team`, `project`, `assignee`, `state`, `sortBy`, `sortDirection`, `limit` parameters. It returns issue objects.
   - What's unclear: The exact field names and nesting in the response (e.g., is `assignee` a string or object? Is `state` a string or `{ name, type }`? Does `identifier` contain the team prefix like "NTH-42"?). This is documented as a Phase 2 research flag but affects Phase 1 normalizer code.
   - Recommendation: Write the Linear normalizer defensively to handle multiple response shapes. Validate during the first actual MCP call and adjust. The cache-store and GitHub adapter do not depend on this -- only the Linear adapter does.

2. **Sync-meta separation timing**
   - What we know: ARCHITECTURE.md specifies separate `issues.json` and `sync-meta.json` files. Phase 2 needs `lastSyncedAt` without parsing the full issue set.
   - What's unclear: Whether Phase 1 should create both files or embed metadata in `issues.json` and split later.
   - Recommendation: For Phase 1, embed `syncedAt` and `version` in the `issues.json` header. Phase 2 planning will split into separate files when TTL and delta sync metadata are needed. This avoids over-engineering Phase 1 while keeping the schema extensible.

3. **GitHub issue state granularity**
   - What we know: GitHub has two states: `OPEN` and `CLOSED`. The normalized schema needs five states: `backlog`, `unstarted`, `started`, `completed`, `cancelled`.
   - What's unclear: Whether to map `OPEN` to `started` (assumes active work) or `unstarted` (assumes queued). Both are defensible.
   - Recommendation: Map `OPEN` to `started` since GitHub Issues lack a backlog/unstarted distinction and the plugin's primary use case is showing what is active. Users who need finer granularity use Linear.

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
| CACHE-01 | Write normalized issue data to `cache/<slug>/issues.json` | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js -x` | No -- Wave 0 |
| CACHE-02 | Atomic write prevents corruption on process kill | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js -x` | No -- Wave 0 |
| CACHE-03 | Cache read/write failures are caught and never block | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js -x` | No -- Wave 0 |
| CACHE-04 | Per-project cache isolation in `cache/<slug>/` | unit | `node --test plugins/project-manager/hooks/lib/cache-store.test.js -x` | No -- Wave 0 |
| SYNC-01 | Full sync fetches all issues, normalizes, writes cache | unit + integration | `node --test plugins/project-manager/hooks/lib/github-adapter.test.js -x` | No -- Wave 0 |

### Sampling Rate

- **Per task commit:** `node --test plugins/project-manager/hooks/lib/*.test.js`
- **Per wave merge:** Same as above (single test suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `plugins/project-manager/hooks/lib/cache-store.test.js` -- covers CACHE-01, CACHE-02, CACHE-03, CACHE-04
- [ ] `plugins/project-manager/hooks/lib/github-adapter.test.js` -- covers SYNC-01 (GitHub path)
- [ ] `plugins/project-manager/hooks/lib/` directory -- does not exist yet, must be created

Note: Linear adapter testing requires MCP tool access (model-driven). Unit tests can validate the normalizer function in isolation, but full sync integration testing is manual-only for Linear.

## Sources

### Primary (HIGH confidence)

- Existing codebase: `plugins/project-manager/hooks/pm-session-start.js` -- established patterns for `fs`, `path`, `execFileSync`, `require()`, fail-open error handling, cache directory at `~/.claude/project-manager/cache/<slug>/`
- Existing codebase: `plugins/project-manager/hooks/pm-session-end.js` -- established patterns for transcript scanning, context loading, signal collection
- Direct verification: `gh issue list --json number,title,state,updatedAt,assignees,labels,body --state all --limit 2` returns correct fields with `state: "OPEN"/"CLOSED"` (uppercase)
- Direct verification: `gh api repos/.../issues --method GET -f state=all` returns fields with `state: "open"/"closed"` (lowercase) and `updated_at` (snake_case)
- [GitHub REST API Issues](https://docs.github.com/en/rest/issues/issues) -- `since` parameter, ISO 8601 timestamps
- [write-file-atomic npm](https://www.npmjs.com/package/write-file-atomic) -- v7.0.1, `engines: { node: "^20.17.0 || >=22.9.0" }`, CommonJS (evaluated and rejected due to zero-dependency convention)
- [Claude Code .claude.json corruption issue #29036](https://github.com/anthropics/claude-code/issues/29036) -- real-world JSON corruption from non-atomic writes

### Secondary (MEDIUM confidence)

- [Linear MCP list_issues tool schema (Glama)](https://glama.ai/mcp/servers/@scoutos/mcp-linear/tools/list_issues) -- confirmed parameter list (team, project, assignee, state, sortBy, sortDirection, limit); no date filtering
- [Fiberplane Linear MCP Server Analysis](https://blog.fiberplane.com/blog/mcp-server-analysis-linear/) -- 23 tools, task-oriented abstraction, no raw GraphQL access
- Project research: `.planning/research/ARCHITECTURE.md` -- component diagram, data flow, adapter interface
- Project research: `.planning/research/STACK.md` -- technology decisions, alternatives analysis
- Project research: `.planning/research/PITFALLS.md` -- corruption, fail-open, ghost issues, hook timeout

### Tertiary (LOW confidence)

- Linear MCP `list_issues` exact response shape -- field names and nesting unverified for the specific MCP version installed; normalizer written defensively

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all built-in Node.js modules, verified against existing codebase patterns
- Architecture: HIGH -- cache-store, adapters, and file schemas are well-defined; build order is clear
- Pitfalls: HIGH -- atomic write, fail-open, state casing, and path collision all verified from direct codebase inspection
- Linear adapter: MEDIUM -- MCP response shape is documented but not directly verified

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable domain; no fast-moving dependencies)
