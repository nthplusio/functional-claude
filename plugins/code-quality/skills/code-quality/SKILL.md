---
name: code-quality
description: This skill should be used when the user asks about "code quality",
  "quality checks", "set up code quality", "quality infrastructure", or wants an
  overview of deterministic quality gates for their project.
version: 1.0.0
---

# Code Quality

Set up **deterministic** code quality infrastructure — git hooks, lint-staged, and formatters that run on every commit and push, regardless of whether the operation is triggered by Claude or by a developer at the terminal.

## Quick Start

Run `/code-quality-setup` to detect your ecosystem and configure everything in one guided workflow.

## What This Plugin Does

Instead of relying on Claude Code hooks (which only intercept operations Claude performs), this plugin helps you set up **real git hooks** that enforce quality at the infrastructure level:

- **Pre-commit hooks** — Run formatters and linters on staged files (fast, incremental)
- **Pre-push hooks** — Run type checks, builds, and tests (comprehensive, full codebase)
- **lint-staged** — Only check files you're actually committing (not the whole repo)

## Focused Skills

| Skill | When to Use |
|-------|-------------|
| **code-quality-setup** | Guided setup: detect ecosystem → recommend framework → configure hooks + lint-staged |
| **code-quality-hooks** | Deep reference for git hook frameworks (husky, lefthook, pre-commit, shell scripts) |
| **code-quality-lint** | Linter, formatter, and lint-staged configuration reference |

## Troubleshooting

If git hooks aren't running, hooks fail silently, or lint-staged isn't finding files, use the **code-quality-troubleshoot** agent for automated diagnosis.

## Migration from Legacy Pre-Commit Plugin

If this project has a `.claude/pre-commit.json` file, that was the legacy approach where checks only ran when Claude performed a `git push`. The new approach sets up real git hooks that run for everyone.

Run `/code-quality-setup` — it will detect the legacy config, map your existing check definitions to real hook content, and guide you through the migration.

### What Changed

| Before (pre-commit plugin) | After (code-quality plugin) |
|---|---|
| Claude Code PreToolUse hook intercepts `git push` | Real git pre-commit and pre-push hooks |
| Only runs when Claude pushes | Runs for every developer, every time |
| Custom `.claude/pre-commit.json` config | Standard tool configs (`.husky/`, `lefthook.yml`, etc.) |
| All checks run on full codebase | Pre-commit: staged files only (fast). Pre-push: full codebase |

## Supported Ecosystems

- **JavaScript/TypeScript** — ESLint, Biome, Prettier, TypeScript, husky, lefthook, lint-staged
- **Python** — Ruff, Black, Flake8, mypy, Pyright, pre-commit framework
- **Rust** — Clippy, rustfmt, cargo check/test
- **Go** — golangci-lint, gofmt, go vet
