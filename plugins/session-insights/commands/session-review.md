---
name: session-review
description: Deep session analysis with interactive selection, parallel agent analysis, and workflow improvement generation. Use for comprehensive review of Claude Code conversation history.
allowed-tools:
  - Bash
  - Read
  - Task
  - AskUserQuestion
argument-hint: "[project-name] [--after YYYY-MM-DD] [--before YYYY-MM-DD]"
---

# Session Review — Multi-Phase Workflow

Deep analysis of Claude Code sessions with interactive selection, parallel agent analysis, and workflow improvement generation.

## Phase 1: Discovery

Run these scripts via Bash to get an overview:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/list-projects.js"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract-history.js" --limit 30
```

Present the results as a formatted table showing:
- Project name (real path), session count, total size, date range
- Recent activity summary

If `$ARGUMENTS` contains a project name or path, pre-select that project. Otherwise, ask the user:

**Question**: Which project(s) would you like to analyze?
- Options: List the top projects by session count, plus "All projects" and "Custom date range"

Also ask: Would you like to review specific sessions, a date range, or a broad sample?

## Phase 2: Session Selection

Based on the user's choice, run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/list-sessions.js" --project "<dir-name>" [--after "<date>"] [--before "<date>"] [--limit 50]
```

Present a session table showing:
- Session ID (slug), start time, duration, message count, first user message preview, model

Ask the user to select specific sessions or confirm "sample all" for broad analysis.

## Phase 3: Analysis (Parallel Agents)

First, run aggregate statistics:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/aggregate-stats.js" --project "<dir-name>" [--after "<date>"] [--before "<date>"]
```

Then launch **3 parallel session-analyst agents** using the Task tool. Each agent focuses on one dimension:

### Agent 1: Insights & Learnings
- **Prompt**: "Analyze these sessions for insights and learnings. Focus on: what techniques worked well, knowledge gained, successful patterns, and clever approaches. Run `node '${CLAUDE_PLUGIN_ROOT}/scripts/extract-session.js' --file '<path>' --detail medium` for each session file listed below, then synthesize your findings as structured markdown."
- **Sessions**: Assign a subset of selected session file paths

### Agent 2: Areas of Improvement
- **Prompt**: "Analyze these sessions for areas of improvement. Focus on: friction points, errors and retries, rephrasing patterns (user had to rephrase requests), wasted effort, and tool misuse. Run `node '${CLAUDE_PLUGIN_ROOT}/scripts/extract-session.js' --file '<path>' --detail medium` for each session file listed below, then synthesize your findings as structured markdown."
- **Sessions**: Assign a subset of selected session file paths

### Agent 3: Workflow Patterns
- **Prompt**: "Analyze these sessions for workflow patterns. Focus on: common tool sequences, session structure patterns, time-of-day patterns, file operation patterns, and repetitive workflows that could be automated. Run `node '${CLAUDE_PLUGIN_ROOT}/scripts/extract-session.js' --file '<path>' --detail medium` for each session file listed below, then synthesize your findings as structured markdown."
- **Sessions**: Assign a subset of selected session file paths

Distribute sessions across agents. If there are N sessions, each agent gets roughly N/3. Use `subagent_type: "general-purpose"` and `model: "sonnet"` for each agent.

**CRITICAL**: Tell each agent to run `extract-session.js` via Bash — agents must NEVER read `.jsonl` files directly.

## Phase 4: Synthesis

Consolidate agent findings into a structured report:

### Key Insights & Learnings
- Top insights from Agent 1

### Areas of Improvement
- Ranked by frequency from Agent 2

### Workflow Patterns Identified
- Patterns and automation opportunities from Agent 3

### Usage Statistics Dashboard
- From aggregate-stats.js output: session counts, duration, tokens, tool usage, time patterns

Present the full report to the user.

## Phase 5: Drill-Down (Interactive)

Ask the user which findings they want to explore deeper. Based on their selection:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract-session.js" --file "<specific-session-path>" --detail high
```

Provide detailed analysis of the selected area, reading the high-detail extraction and discussing specific turns, tool usage patterns, or error sequences.

## Phase 6: Workflow Improvement (Optional)

Ask the user if they want to generate workflow improvements based on the analysis.

If yes, launch a **workflow-improver agent** using the Task tool:

- **subagent_type**: "general-purpose"
- **model**: "sonnet"
- **Prompt**: Include the analysis findings from Phase 4 and instruct the agent to:
  1. Read the current project's CLAUDE.md (if it exists)
  2. Read existing commands and skills in the project
  3. Generate concrete improvements:
     - CLAUDE.md additions based on learned patterns
     - Custom command suggestions for repetitive workflows
     - Skill recommendations for knowledge gaps
     - Hook recommendations for error patterns
  4. Return improvements as markdown blocks with clear labels

Present the generated improvements to the user and ask which ones to apply.

## Important Notes

- **Never read `.jsonl` files directly** — always use the scripts in `${CLAUDE_PLUGIN_ROOT}/scripts/`
- **Scripts output JSON to stdout** — parse the JSON output, don't display raw JSON to the user
- **Session files can be very large** — the `extract-session.js` script handles truncation
- **All data stays local** — no session data is sent anywhere
- **Be patient with analysis** — script execution on large sessions may take 10-30 seconds
