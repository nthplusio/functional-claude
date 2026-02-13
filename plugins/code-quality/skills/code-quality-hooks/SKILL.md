---
name: code-quality-hooks
description: This skill should be used when the user asks to "configure husky",
  "set up lefthook", "add pre-push hook", "add pre-commit hook", "git hooks not running",
  "husky not working", "modify git hooks", or needs deep reference for a specific
  git hook framework.
version: 1.0.0
---

# Git Hook Framework Reference

Deep reference for managing git hooks across frameworks. Use `/code-quality-setup` for initial setup; this skill is for modifying, extending, or understanding existing hook configurations.

## Husky (JS/TS Projects)

**Best for:** Single-package JS/TS projects. Most popular in the JS ecosystem.

### Setup

```bash
# Install
npm add -D husky

# Initialize (creates .husky/ directory and adds prepare script)
npx husky init
```

This creates:
- `.husky/pre-commit` — default pre-commit hook
- `package.json` `"prepare": "husky"` script (runs on `npm install`)

### Hook Scripts

Hook files live in `.husky/` and are plain shell scripts:

**.husky/pre-commit:**
```bash
npx lint-staged
```

**.husky/pre-push:**
```bash
npm run typecheck
npm run build
npm test
```

### Adding a New Hook

```bash
# Create a new hook file
echo "npm test" > .husky/pre-push
```

Husky automatically makes hooks in `.husky/` executable. Supported git hooks: `pre-commit`, `pre-push`, `commit-msg`, `pre-rebase`, `post-merge`, etc.

### Bypassing Hooks

```bash
# Skip hooks for a single operation
git commit --no-verify
git push --no-verify
```

### Troubleshooting

- **Hooks not running after clone:** Run `npm install` (triggers `prepare` script)
- **Permission denied:** `chmod +x .husky/pre-commit`
- **Husky not initialized:** Check `package.json` for `"prepare": "husky"`, then run `npm run prepare`
- **Wrong Node version:** Hooks run in the shell's Node, not the project's. Use `nvm` or specify path.

---

## Lefthook (Monorepos / Polyglot)

**Best for:** Monorepos, polyglot projects, teams wanting parallel hook execution. No npm lifecycle dependency.

### Setup

```bash
# Install via npm
npm add -D lefthook

# Or install standalone (no Node dependency)
# brew install lefthook
# go install github.com/evilmartians/lefthook@latest

# Initialize
npx lefthook install
```

### Configuration

All configuration lives in `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint-js:
      glob: "*.{js,jsx,ts,tsx}"
      run: npx eslint --fix {staged_files} && git add {staged_files}
    lint-py:
      glob: "*.py"
      run: ruff check --fix {staged_files} && git add {staged_files}
    format:
      glob: "*.{json,md,yml,yaml,css}"
      run: npx prettier --write {staged_files} && git add {staged_files}

pre-push:
  commands:
    typecheck:
      run: npm run typecheck
    test:
      run: npm test
```

### Key Features

- **`{staged_files}`** — Expands to list of staged files matching the glob
- **`{all_files}`** — All tracked files matching the glob
- **`{push_files}`** — Files changed between local and remote
- **`parallel: true`** — Run commands concurrently (faster)
- **`glob:`** — Filter which files trigger the command
- **`root:`** — Run command from a subdirectory (monorepo packages)
- **`exclude:`** — Regex to exclude files

### Monorepo Configuration

```yaml
pre-commit:
  parallel: true
  commands:
    lint-frontend:
      root: "packages/frontend/"
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
    lint-backend:
      root: "packages/backend/"
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
    test-shared:
      root: "packages/shared/"
      run: npx vitest run
```

### Troubleshooting

- **Hooks not running:** `npx lefthook install` (re-installs git hooks)
- **Command not found:** Commands run in the repo root by default. Use `root:` for subdirectories.
- **Slow hooks:** Add `parallel: true` to the hook group
- **Debug output:** `LEFTHOOK_VERBOSE=1 git commit -m "test"`

---

## Pre-commit Framework (Python / Polyglot)

**Best for:** Python projects, polyglot repos. Manages hook dependencies automatically.

### Setup

```bash
pip install pre-commit
pre-commit install
```

### Configuration

`.pre-commit-config.yaml`:

```yaml
repos:
  # Ruff (Python linting + formatting)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # MyPy (Python type checking)
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks:
      - id: mypy
        additional_dependencies: []

  # General file checks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict

  # ESLint (if JS/TS files present)
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v9.15.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        additional_dependencies:
          - eslint@9
```

### Adding Pre-push Hooks

```yaml
repos:
  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: pytest
        language: system
        stages: [pre-push]
        pass_filenames: false
      - id: mypy-full
        name: mypy (full)
        entry: mypy .
        language: system
        stages: [pre-push]
        pass_filenames: false
```

```bash
pre-commit install --hook-type pre-push
```

### Key Commands

```bash
# Run against all files (useful for initial setup)
pre-commit run --all-files

# Run a specific hook
pre-commit run ruff --all-files

# Update hook versions
pre-commit autoupdate

# Skip hooks
SKIP=ruff git commit -m "wip"
```

### Troubleshooting

- **Hook fails on first run:** `pre-commit run --all-files` to initialize environments
- **Stale hook versions:** `pre-commit autoupdate`
- **Slow first run:** Pre-commit creates isolated environments per hook. First run installs them.
- **Cache issues:** `pre-commit clean` to clear cached environments

---

## Simple Shell Scripts (Rust / Go / Minimal)

**Best for:** Non-JS/Python projects, minimal dependencies, full control.

### Setup

```bash
# Create hooks directory
mkdir -p .githooks

# Tell git to use it
git config core.hooksPath .githooks
```

### Hook Scripts

**.githooks/pre-commit:**
```bash
#!/bin/sh
set -e

echo "Running pre-commit checks..."

# Format check (Rust)
if [ -f "Cargo.toml" ]; then
    cargo fmt -- --check
    cargo clippy -- -D warnings
fi

# Format check (Go)
if [ -f "go.mod" ]; then
    # Check if any Go files need formatting
    UNFORMATTED=$(gofmt -l $(find . -name "*.go" -not -path "./vendor/*") 2>/dev/null)
    if [ -n "$UNFORMATTED" ]; then
        echo "Files need formatting:"
        echo "$UNFORMATTED"
        exit 1
    fi
fi
```

**.githooks/pre-push:**
```bash
#!/bin/sh
set -e

echo "Running pre-push checks..."

# Rust
if [ -f "Cargo.toml" ]; then
    cargo check
    cargo test
fi

# Go
if [ -f "go.mod" ]; then
    go vet ./...
    go test ./...
fi
```

```bash
# Make hooks executable (required)
chmod +x .githooks/pre-commit .githooks/pre-push
```

### Sharing with the Team

Add to project README or a setup script:

```bash
# Team members run this after cloning
git config core.hooksPath .githooks
```

Or add a Makefile target:

```makefile
setup:
	git config core.hooksPath .githooks
```

### Troubleshooting

- **Hooks not running:** Check `git config core.hooksPath` — should output `.githooks`
- **Permission denied:** `chmod +x .githooks/*`
- **`core.hooksPath` not set:** Run `git config core.hooksPath .githooks` again
- **Hooks not shared:** Commit `.githooks/` to the repo and document the setup step

---

## Commit Message Hooks

All frameworks support `commit-msg` hooks for enforcing conventions:

### Conventional Commits with commitlint

```bash
# Install
npm add -D @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.js`:
```javascript
export default { extends: ['@commitlint/config-conventional'] };
```

**Husky:** `echo "npx commitlint --edit \$1" > .husky/commit-msg`

**Lefthook:**
```yaml
commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

**Pre-commit:**
```yaml
- repo: https://github.com/alessandrojcm/commitlint-pre-commit-hook
  rev: v9.18.0
  hooks:
    - id: commitlint
      stages: [commit-msg]
```
