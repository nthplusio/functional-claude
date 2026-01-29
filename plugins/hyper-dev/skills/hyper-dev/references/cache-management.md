# Cache Management

The hyper-dev plugin maintains multiple cache files for documentation, version detection, and plugin ecosystem data.

## Cache Location

**Directory:** `${CLAUDE_PLUGIN_ROOT}/.cache/`

The `.cache/` directory is within the plugin itself and is gitignored. This keeps data relative to the plugin.

## Cache Files

| File | Purpose | Refresh |
|------|---------|---------|
| `learnings.md` | Documentation and session learnings | Daily |
| `hyper-config.json` | Version detection, installed plugins | Daily (SessionStart) |
| `docs-index.json` | Documentation source index | Daily (SessionStart) |
| `plugin-ecosystem.json` | Top 25 popular plugins | Weekly (SessionStart) |

## Cache Structure

The cache uses YAML frontmatter for metadata with markdown body for content:

```yaml
---
last_refresh: 2026-01-26
cache_version: 1
learnings_count: 0
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

[Fetched Hyper documentation, release notes, configuration tips]

## Learnings

### Successful Patterns

- [2026-01-26] Pattern description...

### Mistakes to Avoid

- [2026-01-26] Mistake description...

### Plugin Patterns

- [2026-01-26] Reusable plugin technique...
```

## Automatic Behavior

### SessionStart Hook

On session start, the `hyper-session-start.js` hook runs:

1. **Version Detection:**
   - Tries `hyper --version` CLI
   - Falls back to app installation paths (platform-specific)
   - Writes results to `hyper-config.json`

2. **Config Discovery:**
   - Finds `.hyper.js` config file location
   - Extracts installed plugins list

3. **Documentation Index:**
   - Updates `docs-index.json` with source URLs
   - Marks Context7 sources (xterm.js, Electron)

4. **Plugin Ecosystem (Weekly):**
   - Queries npm for hyper-plugin packages
   - Indexes top 25 by popularity
   - Writes to `plugin-ecosystem.json`

### Daily Reference Refresh

The cache checks freshness on each session:

1. If `.cache/learnings.md` doesn't exist, creates it
2. If `last_refresh` is not today's date, fetches fresh documentation
3. Preserves the Learnings section when refreshing

**Sources fetched:**

- Official Hyper Website: https://hyper.is/
- GitHub Releases: https://github.com/vercel/hyper/releases
- Repository README: https://github.com/vercel/hyper#readme

### Learnings Capture (SessionEnd)

At session end, if Hyper work was done:

1. Prompts to capture learnings
2. User describes successful patterns, mistakes, or plugin techniques
3. Appends to Learnings section with date prefix

**Enhanced categories detected:**
- Successful Patterns
- Mistakes to Avoid
- Plugin Patterns
- Ecosystem Discoveries

## Manual Operations

### Force Cache Refresh

Delete the cache file to force full refresh:

```bash
rm "${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md"
```

Or edit the `last_refresh` date to yesterday.

### Disable Features

Edit the `settings` section in frontmatter:

```yaml
settings:
  auto_refresh: false      # Disable daily documentation refresh
  capture_learnings: false # Disable end-of-session learning prompts
```

### Clear Learnings Only

Edit the file and remove content under the `## Learnings` section, keeping the headers:

```markdown
## Learnings

### Successful Patterns

### Mistakes to Avoid

### Plugin Patterns
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

[Documentation will be populated on first refresh]

## Learnings

### Successful Patterns

### Mistakes to Avoid

### Plugin Patterns
```

## hyper-config.json Structure

Version detection and configuration cache:

```json
{
  "detected_version": "3.4.1",
  "detection_method": "cli",
  "detection_timestamp": "2026-01-29T10:00:00Z",
  "config_path": "~/.hyper.js",
  "installed_plugins": ["hypercwd", "hyper-search"]
}
```

**Detection methods:** `cli`, `app_bundle` (macOS), `app_directory` (Windows), `package_json` (Linux), `none`

## docs-index.json Structure

Documentation source index:

```json
{
  "last_refresh": "2026-01-29",
  "sources": [
    { "name": "hyper-website", "url": "https://hyper.is/", "type": "webfetch" },
    { "name": "github-releases", "url": "https://github.com/vercel/hyper/releases", "type": "webfetch" },
    { "name": "xterm-js", "library_id": "/xtermjs/xterm.js", "type": "context7" },
    { "name": "electron", "library_id": "/websites/electronjs", "type": "context7" }
  ]
}
```

## plugin-ecosystem.json Structure

Popular plugins index:

```json
{
  "last_refresh": "2026-01-29",
  "refresh_interval_days": 7,
  "total_found": 150,
  "indexed_count": 25,
  "top_plugins": [
    {
      "name": "hypercwd",
      "description": "Open new tabs in current directory",
      "version": "2.0.0",
      "npm_downloads_weekly": 5000,
      "patterns": ["cwd detection"],
      "key_exports": ["onApp", "decorateConfig"]
    }
  ]
}
```

## Why .cache/?

The `.cache/` directory convention signals:

1. **Private files** - User-specific, not for version control
2. **Regeneratable** - Can be deleted and rebuilt
3. **Plugin-relative** - Learnings stay with the plugin that uses them

The directory is listed in `.gitignore` to prevent accidental commits.
