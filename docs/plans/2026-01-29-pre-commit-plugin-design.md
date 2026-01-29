# Pre-Commit Plugin Design

**Date:** 2026-01-29
**Status:** Approved

## Overview

A Claude Code plugin that runs typechecks, linting, and tests before git push. Features auto-detection of project tooling and configurable enforcement per check type.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Trigger | Before `git push` (not commit) |
| Detection | Auto-detect from config files |
| Failure behavior | Configurable per-check (block or warn) |
| Ecosystems | JS/TS, Python, Rust, Go |
| Config location | `${CLAUDE_PROJECT_DIR}/.claude/pre-commit.json` |

## Plugin Structure

```
plugins/pre-commit/
├── .claude-plugin/
│   └── plugin.json           # name: "pre-commit", version: "0.1.0"
├── hooks/
│   ├── hooks.json            # PreToolUse hook on Bash for git push
│   └── check-pre-push.js     # Hook script that runs checks
├── skills/
│   └── pre-commit-setup/     # Analyzes repo and creates config
│       └── SKILL.md
└── agents/
    └── pre-commit-check/     # Runs the checks when triggered
        └── AGENT.md
```

## Config File Format

Location: `${CLAUDE_PROJECT_DIR}/.claude/pre-commit.json`

```json
{
  "version": 1,
  "checks": {
    "typecheck": {
      "enabled": true,
      "mode": "block",
      "command": "npm run typecheck"
    },
    "lint": {
      "enabled": true,
      "mode": "warn",
      "command": "npm run lint"
    },
    "test": {
      "enabled": true,
      "mode": "block",
      "command": "npm run test"
    }
  },
  "detected": {
    "ecosystem": "javascript",
    "packageManager": "npm",
    "tools": ["typescript", "eslint", "vitest"]
  }
}
```

### Fields

| Field | Purpose |
|-------|---------|
| `enabled` | Whether to run this check |
| `mode` | `"block"` (deny push) or `"warn"` (allow with message) |
| `command` | Shell command to run |
| `detected` | Metadata from auto-detection (informational) |

## Auto-Detection Logic

| Ecosystem | Detection Files | Typecheck | Lint | Test |
|-----------|-----------------|-----------|------|------|
| JavaScript/TypeScript | `package.json`, `tsconfig.json` | `tsc --noEmit` or `npm run typecheck` | `eslint .` or `npm run lint` | `npm test` or detected runner |
| Python | `pyproject.toml`, `setup.py`, `requirements.txt` | `mypy .` or `pyright` | `ruff check .` or `flake8` | `pytest` |
| Rust | `Cargo.toml` | `cargo check` | `cargo clippy` | `cargo test` |
| Go | `go.mod` | `go build ./...` | `golangci-lint run` | `go test ./...` |

### Detection Priority

1. Check `package.json` scripts for existing commands (`typecheck`, `lint`, `test`)
2. Look for tool-specific configs (`eslint.config.js`, `ruff.toml`, `clippy.toml`)
3. Fall back to standard tool commands if installed

If a tool isn't detected, that check is set to `enabled: false`.

## Hook Behavior

The PreToolUse hook on `Bash` intercepts `git push` commands:

1. Check if command is `git push` → if not, allow immediately
2. Check if `.claude/pre-commit.json` exists → if not, allow (not configured)
3. For each enabled check:
   - Run command
   - If fails and mode="block" → deny push with reason
   - If fails and mode="warn" → log warning, continue
4. All blocking checks passed → allow push

### Deny Response Format

```
Pre-push check failed: typecheck

Command: npm run typecheck
Output: [error output]

Fix the type errors before pushing.
```

## Setup Skill Workflow

1. Scan repository root for ecosystem indicators
2. For each detected ecosystem, check for typecheck/lint/test tools
3. Generate `.claude/pre-commit.json` with detected checks enabled
4. Output summary showing what was configured
5. Inform user they can edit the file to adjust modes or commands

### Multi-Ecosystem Support

If multiple ecosystems detected (e.g., `package.json` and `pyproject.toml`), create combined commands (e.g., `npm run typecheck && mypy .`).

## Implementation Tasks

1. Create plugin structure and plugin.json
2. Create pre-commit-setup skill with detection logic
3. Create check-pre-push.js hook script
4. Create hooks.json configuration
5. Create pre-commit-check agent for running checks
6. Update marketplace.json and memory.md
7. Test with sample repositories
