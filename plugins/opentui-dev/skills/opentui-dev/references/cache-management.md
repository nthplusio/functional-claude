# Cache Management

The opentui-dev plugin maintains a local cache file to store fetched documentation and session learnings.

## Cache Location

**File:** `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`

The `.cache/` directory is within the plugin itself and is gitignored. This keeps learnings relative to the plugin that uses them.

## Cache Structure

The cache uses YAML frontmatter for metadata with markdown body for content:

```yaml
---
last_refresh: 2026-01-30
cache_version: 1
learnings_count: 0
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

### OpenTUI Core
[Cached imperative API documentation, Renderables, Constructs]

### OpenTUI React
[Cached React reconciler documentation, hooks, JSX elements]

### OpenTUI Solid
[Cached Solid reconciler documentation, signals, JSX elements]

## Learnings

### Successful Patterns

- [2026-01-30] Pattern description...

### Mistakes to Avoid

- [2026-01-30] Mistake description...
```

## Automatic Behavior

### Weekly Reference Refresh (SessionStart)

On session start, the plugin checks if the cache needs refreshing:

1. If `.cache/learnings.md` doesn't exist, creates it
2. If `last_refresh` is more than 7 days old, suggests fetching fresh documentation
3. Preserves the Learnings section when refreshing

**Sources to fetch:**

- OpenTUI Repository: https://github.com/anomalyco/opentui
- Core docs: https://github.com/anomalyco/opentui/tree/main/packages/core/docs
- Examples: https://github.com/anomalyco/opentui/tree/main/packages/core/src/examples
- Awesome OpenTUI: https://github.com/msmps/awesome-opentui

### Learnings Capture (SessionEnd)

At session end, if OpenTUI work was done:

1. Prompts to capture learnings
2. User describes successful patterns or mistakes
3. Appends to Learnings section with date prefix

## Manual Operations

### Force Cache Refresh

Delete the cache file to force full refresh:

```bash
rm "${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md"
```

Or edit the `last_refresh` date to more than 7 days ago.

### Disable Features

Edit the `settings` section in frontmatter:

```yaml
settings:
  auto_refresh: false      # Disable documentation refresh
  capture_learnings: false # Disable end-of-session learning prompts
```

### Clear Learnings Only

Edit the file and remove content under the `## Learnings` section, keeping the headers:

```markdown
## Learnings

### Successful Patterns

### Mistakes to Avoid
```

## Cache Template

When creating a new cache file, use this template:

```yaml
---
last_refresh: YYYY-MM-DD
cache_version: 1
learnings_count: 0
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

### OpenTUI Core
[Documentation will be populated on first refresh]

### OpenTUI React
[Documentation will be populated on first refresh]

### OpenTUI Solid
[Documentation will be populated on first refresh]

## Learnings

### Successful Patterns

### Mistakes to Avoid
```

## Why .cache/?

The `.cache/` directory convention signals:

1. **Private files** - User-specific, not for version control
2. **Regeneratable** - Can be deleted and rebuilt
3. **Plugin-relative** - Learnings stay with the plugin that uses them

The directory is listed in `.gitignore` to prevent accidental commits.
