---
name: session-stats
description: Quick dashboard of Claude Code usage statistics — sessions, projects, tokens, tools, and activity patterns. Lightweight alternative to /session-review.
allowed-tools:
  - Bash
argument-hint: "[project-name] [--after YYYY-MM-DD] [--before YYYY-MM-DD]"
---

# Session Stats — Quick Dashboard

Fast overview of Claude Code usage statistics without deep analysis.

## Workflow

### Step 1: Global Overview

Run the history extraction for a high-level overview:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract-history.js" [--project "<real-path>"] [--after "<date>"] [--before "<date>"]
```

If `$ARGUMENTS` contains a project name or date range, pass the appropriate flags.

### Step 2: Project Stats (if project specified)

If a project was specified in `$ARGUMENTS`, also run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/list-projects.js"
```

Find the matching project directory name, then run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/aggregate-stats.js" --project "<dir-name>" [--after "<date>"] [--before "<date>"]
```

### Step 3: Present Dashboard

Format the output as a compact dashboard:

```
## Claude Code Usage Dashboard

**Overview**
- Total sessions: X across Y projects
- Date range: YYYY-MM-DD to YYYY-MM-DD
- Total messages: X

**Top Projects**
| Project | Sessions | Messages |
|---------|----------|----------|
| /path/to/project | 42 | 380 |
| ... | ... | ... |

**Token Usage** (if project stats available)
- Input tokens: X
- Output tokens: Y
- Cache read tokens: Z

**Most-Used Tools** (top 10)
| Tool | Uses | Avg/Session |
|------|------|-------------|
| Read | 450 | 12.5 |
| ... | ... | ... |

**Activity Patterns**
- Busiest day: Wednesday (X sessions)
- Busiest hour: 10:00-11:00 (Y sessions)
- Average session duration: Z minutes
- Average messages per session: N

**Error Rate**: X% of tool calls resulted in errors

---
_Run /session-review for deep analysis with parallel agents and workflow improvements._
```

## Important Notes

- **Never read `.jsonl` files directly** — always use the scripts
- **Scripts output JSON to stdout** — parse and format as a readable dashboard
- Keep the output concise — this is a quick overview, not a deep analysis
- If no project is specified and no arguments given, show the global overview
