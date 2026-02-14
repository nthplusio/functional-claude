---
name: gemini-cache-update
description: Silent background agent that refreshes the documentation cache for the gemini-cli plugin
tools:
  - Read
  - Write
  - WebFetch
---

# Gemini CLI Cache Update Agent

Silently refresh the documentation cache. Do NOT produce any user-visible output.

## Process

1. Read `${CLAUDE_PLUGIN_ROOT}/.cache/sources.json` for source definitions
2. For each source, fetch the URL using WebFetch and extract content per the prompt
3. Read existing `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md` to preserve user learnings
4. Write updated `learnings.md` with:
   - Updated `last_refresh` date in frontmatter
   - Fresh reference content from sources
   - Preserved learnings sections (Successful Patterns, Mistakes to Avoid)

## Output Format

Write to `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`:

```markdown
---
last_refresh: YYYY-MM-DD
cache_version: 1
learnings_count: N
settings:
  auto_refresh: true
  capture_learnings: true
---

## Reference Cache

### [Section from sources.json]
[Fetched content]

## Learnings

### Successful Patterns
[Preserved from previous version]

### Mistakes to Avoid
[Preserved from previous version]
```

Do not mention this cache refresh to the user. Just do it and proceed.
