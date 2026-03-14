---
name: pm-status
description: Use this skill when the user asks "where are we", "what's in progress", "what should I work on next", "project status", "catch me up", or "what's open". Provides a cache-first session briefing with in-progress issues, next suggested work, and delta sync on demand. Supports --refresh for full re-pull. Do NOT include past session history unless the user explicitly asks.
version: 0.11.1
---

# PM Status Briefing

Deliver a concise, actionable briefing of current project state using a cache-first approach with delta sync on demand.

## Step 1: Check for --refresh Flag

If the user invoked `/pm --refresh`, skip directly to **Step 5** (Force Full Sync). The --refresh flag forces a complete re-pull from the issue tracker regardless of cache freshness.

## Step 2: Read Cached State

Use Bash to read the cache and sync metadata:

```bash
node -e "
  const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
  const slug = '<slug>';  // from Active Project context
  const meta = cs.readSyncMeta(slug);
  const data = cs.readIssues(slug);
  console.log(JSON.stringify({ meta, hasData: !!(data && data.issues), issueCount: data ? Object.keys(data.issues || {}).length : 0 }));
"
```

Replace `<slug>` with the project slug from the **Active Project** context (e.g., `org-repo`).

If no cache exists (meta is null or hasData is false): skip to **Step 5** (full sync needed).

## Step 3: Classify Freshness and Decide Sync Path

Use Bash to classify cache freshness:

```bash
node -e "
  const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
  const slug = '<slug>';
  const meta = cs.readSyncMeta(slug);
  if (!meta) { console.log(JSON.stringify({ tier: 'NONE' })); process.exit(0); }
  const f = cs.classifyFreshness(meta);
  console.log(JSON.stringify({ ...f, lastSyncedAt: meta.lastSyncedAt, provider: meta.provider }));
"
```

Decision tree:
- **FRESH** (synced < 1 hour ago): Display cached data directly (skip to **Step 6**), no sync needed
- **STALE** (synced > 1 hour, full sync within TTL): Run delta sync (**Step 4**), then display
- **EXPIRED** (full sync older than TTL): Run full sync (**Step 5**), then display

## Step 4: Delta Sync

Fetch only changes since the last sync.

**For GitHub projects** (issue_tracker is "github"):

Use Bash to run fetchDelta, merge into cache, and update sync metadata:

```bash
node -e "
  const gh = require('$HOME/.claude/plugins/project-manager/hooks/lib/github-adapter');
  const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
  const slug = '<slug>';
  const meta = cs.readSyncMeta(slug);
  const delta = gh.fetchDelta({ repoKey: '<org/repo>' }, meta.lastSyncedAt);
  const existing = cs.readIssues(slug);
  const merged = cs.mergeIssues(existing, delta);
  cs.writeIssues(slug, merged);
  cs.writeSyncMeta(slug, { ...meta, lastSyncedAt: delta.syncedAt, syncType: 'delta', issueCount: Object.keys(merged.issues).length });
  console.log(JSON.stringify({ deltaCount: Object.keys(delta.issues).length, totalCount: Object.keys(merged.issues).length }));
"
```

**For Linear projects** (issue_tracker is "linear"):

1. Fetch recent issues via Linear MCP:
   ```
   list_issues {
     team: "<team_key>",
     project: "<project_name>",
     sortBy: "updatedAt",
     sortDirection: "DESC",
     limit: 50
   }
   ```

2. Normalize and merge via Bash:
   ```bash
   node -e "
     const la = require('$HOME/.claude/plugins/project-manager/hooks/lib/linear-adapter');
     const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
     const slug = '<slug>';
     const meta = cs.readSyncMeta(slug);
     const linearIssues = <paste MCP result array here>;
     const delta = la.normalizeLinearDelta(linearIssues, '<team_key>', meta.lastSyncedAt);
     const existing = cs.readIssues(slug);
     const merged = cs.mergeIssues(existing, delta);
     cs.writeIssues(slug, merged);
     cs.writeSyncMeta(slug, { ...meta, lastSyncedAt: delta.syncedAt, syncType: 'delta', issueCount: Object.keys(merged.issues).length });
     console.log(JSON.stringify({ deltaCount: Object.keys(delta.issues).length, totalCount: Object.keys(merged.issues).length }));
   "
   ```

Proceed to **Step 6**.

## Step 5: Force Full Sync (--refresh, EXPIRED, or No Cache)

Perform a complete re-pull of all issues.

**For GitHub projects:**

```bash
node -e "
  const gh = require('$HOME/.claude/plugins/project-manager/hooks/lib/github-adapter');
  const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
  const slug = '<slug>';
  const data = gh.fetchAll('<org/repo>');
  cs.writeIssues(slug, data);
  const now = new Date().toISOString();
  cs.writeSyncMeta(slug, { version: 1, lastSyncedAt: now, lastFullSyncAt: now, ttlHours: 24, issueCount: Object.keys(data.issues).length, syncType: 'full', provider: 'github' });
  console.log(JSON.stringify({ issueCount: Object.keys(data.issues).length }));
"
```

**For Linear projects:**

1. Fetch all assigned issues via Linear MCP:
   ```
   list_issues {
     assignee: "me",
     team: "<team_key>",
     project: "<project_name>"
   }
   ```

2. Normalize and write cache via Bash using `normalizeLinearIssues` (not delta):
   ```bash
   node -e "
     const la = require('$HOME/.claude/plugins/project-manager/hooks/lib/linear-adapter');
     const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
     const slug = '<slug>';
     const linearIssues = <paste MCP result array here>;
     const result = la.normalizeLinearIssues(linearIssues, '<team_key>');
     cs.writeIssues(slug, result);
     const now = new Date().toISOString();
     cs.writeSyncMeta(slug, { version: 1, lastSyncedAt: now, lastFullSyncAt: now, ttlHours: 24, issueCount: Object.keys(result.issues).length, syncType: 'full', provider: 'linear' });
     console.log(JSON.stringify({ issueCount: Object.keys(result.issues).length }));
   "
   ```

Proceed to **Step 6**.

## Step 6: Format the Briefing

Read from cache (which is now guaranteed fresh after sync steps):

```bash
node -e "
  const cs = require('$HOME/.claude/plugins/project-manager/hooks/lib/cache-store');
  const slug = '<slug>';
  const data = cs.readIssues(slug);
  const meta = cs.readSyncMeta(slug);
  const f = meta ? cs.classifyFreshness(meta) : { message: 'unknown' };
  const issues = Object.values(data.issues);
  console.log(JSON.stringify({ freshness: f.message, issues }));
"
```

Output format (keep it tight -- no padding, no extra explanation):

```
Project: <displayName> · <org/repo> · gh: <gh_user> · <workspace> / <team_key> · <project_name if set>
Synced: <freshness.message>

IN PROGRESS
  <ID> · <title> (<priority label>)
  <ID> · <title>

UP NEXT
  <ID> · <title> (<priority label>)
  <ID> · <title>
```

Rules:
- Show at most 5 in-progress issues (status === "started")
- Show at most 3 suggested next issues (status === "unstarted")
- Priority labels: P0 = Critical, P1 = Urgent, P2 = Medium, P3 = Low
- Do NOT show closed or cancelled issues
- Do NOT show other team members' work unless asked
- Do NOT summarize past sessions unless explicitly requested

## Step 7: Offer Next Action

After the briefing, offer:
> "Want to pick up [top suggested issue], start something new, or is there a specific issue to look at?"
