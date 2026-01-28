---
name: terminal-cache
description: This skill manages cache refresh for terminal configuration plugins (WezTerm, Hyper). Use when you need to check cache freshness, refresh documentation from official sources, or capture session learnings. Invoked automatically by terminal skills on session start.
version: 1.0.0
---

# Terminal Cache Management

Shared cache management for terminal configuration plugins. This skill handles daily documentation refresh and session learnings capture.

## Cache System Overview

Terminal plugins (wezterm-dev, hyper-dev) maintain a two-tier cache:

1. **Reference Cache** - Daily-refreshed documentation from official sources
2. **Learnings Cache** - Session-accumulated knowledge (patterns, mistakes)

## Cache Location

Each plugin stores its cache at:
```
${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md
```

The `.cache/` directory is gitignored and stays with the plugin.

## Cache File Structure

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

[Fetched documentation from official sources]

## Learnings

### Successful Patterns

- [YYYY-MM-DD] Pattern description...

### Mistakes to Avoid

- [YYYY-MM-DD] Mistake description...
```

## Refresh Logic

When invoked by a terminal skill:

1. **Check cache file** - Read `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`
2. **Check freshness** - Compare `last_refresh` to today's date
3. **If stale or missing**:
   - Fetch documentation from official sources
   - Preserve existing Learnings section
   - Update `last_refresh` to today
4. **If fresh** - Proceed immediately

## Documentation Sources

### WezTerm
- Config reference: https://wezfurlong.org/wezterm/config/lua/config/index.html
- GitHub releases: https://github.com/wez/wezterm/releases
- Lua API: https://wezfurlong.org/wezterm/config/lua/wezterm/

### Hyper
- Official site: https://hyper.is/
- GitHub releases: https://github.com/vercel/hyper/releases
- Repository: https://github.com/vercel/hyper#readme

## Learnings Capture

At session end, terminal plugins prompt for learnings:

### Successful Patterns
Configurations, techniques, or approaches that worked well:
- Working code snippets
- Effective configurations
- Performance optimizations

### Mistakes to Avoid
Issues encountered and their solutions:
- Common pitfalls
- Debugging discoveries
- Platform-specific gotchas

## Manual Operations

### Force Cache Refresh
```bash
# Delete cache file to force full refresh
rm "${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md"
```

Or edit `last_refresh` to a past date.

### Disable Features
Edit the `settings` section in frontmatter:
```yaml
settings:
  auto_refresh: false      # Disable daily documentation refresh
  capture_learnings: false # Disable end-of-session learning prompts
```

### Clear Learnings Only
Keep headers but remove content:
```markdown
## Learnings

### Successful Patterns

### Mistakes to Avoid
```

## Cache Template

Use this template when creating a new cache file:

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

## Integration

Terminal skills reference this skill for cache management. The main skill checks cache on invocation, and the Stop hook prompts for learnings capture at session end.
