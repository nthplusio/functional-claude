---
name: Session Insights
description: >
  This skill should be used when the user asks to "analyze sessions",
  "review my Claude usage", "session insights", "what have I been working on",
  "improve my workflow", "analyze conversation history", or mentions reviewing
  past Claude Code sessions. Routes to /session-review or /session-stats commands.
version: 0.1.1
---

# Session Insights

Analyze your Claude Code conversation history with interactive selection, deep drill-down, and workflow improvement generation.

## What This Plugin Does

Session Insights provides programmatic analysis of your local Claude Code session data:

- **Interactive browsing** — select specific projects, sessions, or date ranges to analyze
- **Deep drill-down** — extract turn-by-turn detail from specific sessions at configurable detail levels
- **Workflow improvements** — turn analysis into concrete CLAUDE.md additions, commands, skills, or hooks
- **Usage statistics** — cross-session aggregate stats on tool usage, token consumption, and activity patterns

### How It Differs from Built-in `/insights`

The built-in `/insights` command generates a broad HTML report across up to 50 sessions with Haiku-level analysis. Session Insights complements it with:

1. **Interactive session selection** instead of automatic sampling
2. **Opus-level depth** for focused analysis of specific sessions
3. **Actionable output** — generates CLAUDE.md improvements, not just reports
4. **Programmatic parsing** — Node.js scripts keep raw JSONL out of context (handles 1GB+ data)

## Available Commands

### `/session-review` — Deep Analysis Workflow

A 6-phase interactive workflow:

1. **Discovery** — Browse projects and usage overview
2. **Session Selection** — Pick specific sessions or date ranges
3. **Analysis** — 3 parallel agents analyze insights, improvements, and patterns
4. **Synthesis** — Consolidated report with statistics dashboard
5. **Drill-Down** — Interactive deep-dive into specific findings
6. **Workflow Improvement** — Generate CLAUDE.md additions and automation suggestions

### `/session-stats` — Quick Dashboard

Fast overview of usage statistics:
- Total sessions, projects, messages, date range
- Top projects by session count
- Token usage summary
- Most-used tools
- Activity patterns by day and hour

## How Scripts Work

All analysis uses streaming Node.js scripts at `${CLAUDE_PLUGIN_ROOT}/scripts/`:

| Script | Purpose |
|--------|---------|
| `list-projects.js` | Enumerate projects with session counts and sizes |
| `list-sessions.js` | List sessions for a project with metadata |
| `extract-session.js` | Structured turn-by-turn summary with detail levels (low/medium/high) |
| `extract-history.js` | Parse history.jsonl with filters |
| `aggregate-stats.js` | Cross-session aggregate statistics |

Scripts read JSONL files via `readline` streaming — they never load entire files into memory. Output is JSON to stdout.

**IMPORTANT**: Always use scripts to parse session data. Never read `.jsonl` files directly into context — they can be megabytes in size and would consume the entire context window.

## Data Format

- **`~/.claude/history.jsonl`** — One line per user message with `{display, sessionId, project, timestamp}`
- **`~/.claude/projects/<dash-path>/<session-id>.jsonl`** — Full transcripts with `user`, `assistant`, `progress`, `file-history-snapshot` types
- Project directories use dashes for path separators (e.g., `-home-user-Source-project`)

## Privacy

All analysis is performed locally. No session data leaves your machine. Scripts read from `~/.claude/` and output structured JSON — the raw conversation content stays in the JSONL files.
