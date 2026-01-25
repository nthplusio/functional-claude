# Cache Management

The wezterm-dev plugin maintains a local cache file to store fetched WezTerm documentation and session learnings.

## Cache Location

**File:** `~/.claude/wezterm-dev.local.md`

- Linux/macOS: `~/.claude/wezterm-dev.local.md`
- Windows: `C:\Users\<username>\.claude\wezterm-dev.local.md`

## Cache Structure

The cache uses YAML frontmatter for metadata with markdown body for content:

```yaml
---
last_refresh: 2026-01-25
cache_version: 1
learnings_count: 0
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

[Fetched WezTerm documentation, release notes, configuration tips]

## Learnings

### Successful Patterns

- [2026-01-25] Pattern description...

### Mistakes to Avoid

- [2026-01-25] Mistake description...
```

## Automatic Behavior

### Daily Reference Refresh (SessionStart)

On session start, the plugin checks if the cache needs refreshing:

1. If `~/.claude/wezterm-dev.local.md` doesn't exist, creates it
2. If `last_refresh` is not today's date, fetches fresh documentation
3. Preserves the Learnings section when refreshing

**Sources fetched:**

- Official WezTerm Config Docs: https://wezfurlong.org/wezterm/config/lua/config/index.html
- GitHub Releases: https://github.com/wez/wezterm/releases
- Lua API Reference: https://wezfurlong.org/wezterm/config/lua/wezterm/

### Learnings Capture (SessionEnd)

At session end, if WezTerm work was done:

1. Prompts to capture learnings
2. User describes successful patterns or mistakes
3. Appends to Learnings section with date prefix

## Manual Operations

### Force Cache Refresh

Delete or update the `last_refresh` date in frontmatter:

```bash
# Linux/macOS - delete cache to force full refresh
rm ~/.claude/wezterm-dev.local.md

# Or edit the last_refresh date to yesterday
```

### Disable Features

Edit the `settings` section in frontmatter:

```yaml
settings:
  auto_refresh: false      # Disable daily documentation refresh
  capture_learnings: false # Disable end-of-session learning prompts
```

### View Current Cache

```bash
cat ~/.claude/wezterm-dev.local.md
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

[Documentation will be populated on first refresh]

## Learnings

### Successful Patterns

### Mistakes to Avoid
```

## Troubleshooting

### Cache not refreshing

1. Check if `~/.claude/` directory exists
2. Verify file permissions allow writing
3. Check if `auto_refresh: false` in settings

### Learnings not being saved

1. Verify `capture_learnings: true` in settings
2. Ensure the session involved WezTerm work
3. Check file permissions

### Corrupted cache file

Delete and let it regenerate:

```bash
rm ~/.claude/wezterm-dev.local.md
```
