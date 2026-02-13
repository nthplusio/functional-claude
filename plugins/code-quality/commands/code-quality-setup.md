---
name: code-quality-setup
description: Set up deterministic code quality infrastructure with git hooks and lint-staged
tools:
  - AskUserQuestion
  - Bash
  - Write
  - Read
  - Glob
  - Grep
---

# Code Quality Setup

Run the guided setup workflow from the `code-quality-setup` skill. This is the primary entry point for configuring git hooks, lint-staged, and formatters.

## Workflow

Follow the **4-step workflow** defined in the `code-quality-setup` skill:

1. **Detect** — Scan for ecosystems, tools, existing hooks, CI configs
2. **Recommend** — Select framework using the decision tree, present to user with `AskUserQuestion`
3. **Configure** — Install framework, create hooks, set up lint-staged
4. **Report** — Summary of what was created and how to customize

## Important

- Always use `AskUserQuestion` to confirm the recommended framework before installing
- Detect the package manager and use it consistently (don't mix npm/pnpm/yarn)
- Check for existing hook infrastructure before creating new hooks
- If `.claude/pre-commit.json` exists, follow the migration path
- Make hook scripts executable where required
- Test that hooks work after setup (dry-run a commit)
