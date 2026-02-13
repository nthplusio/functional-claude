---
name: code-quality-setup
description: This skill should be used when the user asks to "set up code quality",
  "configure git hooks", "add pre-commit hooks", "set up lint-staged", "add pre-push checks",
  "initialize code quality", or when starting a new project that needs quality gates.
version: 1.0.0
---

# Code Quality Setup

Guided workflow to detect your ecosystem, recommend a git hook framework, and configure deterministic quality infrastructure.

## 4-Step Workflow

### Step 1: Detect

Scan the project for ecosystems, existing quality tools, hook infrastructure, and CI configs.

**Detection matrix:**

| Category | What to Find |
|----------|-------------|
| Ecosystems | `package.json`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`, `go.mod` |
| Package managers | `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `package-lock.json` |
| Existing hooks | `.husky/`, `lefthook.yml`, `.pre-commit-config.yaml`, `.git/hooks/pre-commit`, `.githooks/` |
| Linters | `eslint.config.*`, `.eslintrc*`, `biome.json`, `ruff.toml`, `.golangci.yml`, `.golangci.yaml` |
| Formatters | `.prettierrc*`, `biome.json` (dual-use), `rustfmt.toml` |
| Type checkers | `tsconfig.json`, `mypy.ini`, `pyrightconfig.json` |
| lint-staged | `lint-staged` key in `package.json`, `.lintstagedrc*` |
| CI | `.github/workflows/`, `.gitlab-ci.yml` |

**Run detection:**

```bash
# Ecosystems and package managers
ls package.json tsconfig.json pyproject.toml Cargo.toml go.mod pnpm-lock.yaml yarn.lock bun.lockb package-lock.json 2>/dev/null

# Existing hook infrastructure
ls -d .husky lefthook.yml lefthook.yaml .pre-commit-config.yaml .githooks 2>/dev/null
ls .git/hooks/pre-commit .git/hooks/pre-push 2>/dev/null
# Check if git hooks are executable (not just samples)
file .git/hooks/pre-commit 2>/dev/null

# Linters and formatters
ls eslint.config.* .eslintrc* biome.json ruff.toml .golangci.yml .golangci.yaml .prettierrc* rustfmt.toml 2>/dev/null

# Type checkers
ls tsconfig.json mypy.ini pyrightconfig.json 2>/dev/null

# lint-staged
grep -l "lint-staged" package.json 2>/dev/null
ls .lintstagedrc* 2>/dev/null

# CI
ls -d .github/workflows .gitlab-ci.yml 2>/dev/null

# Legacy config (migration detection)
ls .claude/pre-commit.json 2>/dev/null
```

If `package.json` exists, also check scripts and dependencies:

```bash
# Check for relevant scripts
node -e "const p=require('./package.json'); console.log(JSON.stringify({scripts:Object.keys(p.scripts||{}),devDeps:Object.keys(p.devDependencies||{}),deps:Object.keys(p.dependencies||{})}))"
```

### Step 2: Recommend

Select a git hook framework using this opinionated decision tree:

```
Existing hook framework detected?
├── YES → Use existing (husky, lefthook, pre-commit, etc.)
│         Tell the user what was found, offer to add/modify hooks
└── NO  →
    ├── JS/TS project (package.json)?
    │   ├── YES → Monorepo (pnpm-workspace.yaml, nx.json, lerna.json)?
    │   │   ├── YES → lefthook (better monorepo support, no npm lifecycle dep)
    │   │   └── NO  → husky (most popular JS ecosystem, simple setup)
    │   └── NO  →
    │       ├── Python project (pyproject.toml)?
    │       │   └── YES → pre-commit framework (best polyglot support)
    │       └── Rust/Go/other?
    │           └── YES → Simple shell scripts (.githooks/ + core.hooksPath)
    └── No project files found → Ask user about their ecosystem
```

**Present the recommendation to the user with `AskUserQuestion`:**

- Explain which framework was chosen and why
- Offer the recommended framework as the first option
- Include 1-2 alternatives as other options
- Proceed with their choice

**Hook content strategy:**

| Hook | What to Run | Why |
|------|------------|-----|
| **Pre-commit** | Formatters + linters on **staged files only** | Fast feedback, incremental via lint-staged |
| **Pre-push** | Type checking + build + tests | Comprehensive, slower, runs on full codebase |

**lint-staged recommendations per ecosystem:**

For JS/TS projects:
- If Biome detected: `biome check --write`
- If ESLint + Prettier: `eslint --fix` then `prettier --write`
- If ESLint only: `eslint --fix`

For Python projects:
- If Ruff detected: `ruff check --fix` then `ruff format`
- If Black + Flake8: `black` then `flake8`

### Step 3: Configure

Install the chosen framework and create hook scripts.

#### Husky Setup (JS/TS)

```bash
# Detect package manager
PM="npm"
[ -f "pnpm-lock.yaml" ] && PM="pnpm"
[ -f "yarn.lock" ] && PM="yarn"
[ -f "bun.lockb" ] && PM="bun"

# Install husky
$PM add -D husky

# Initialize husky
npx husky init
```

Create `.husky/pre-commit`:

```bash
npx lint-staged
```

Create `.husky/pre-push`:

```bash
# Type checking
npm run typecheck 2>/dev/null || npx tsc --noEmit

# Build
npm run build

# Tests
npm test
```

**Adapt the pre-push script** based on what was detected in Step 1. Only include checks that have corresponding tools installed. Use the project's actual script names from `package.json`.

Install lint-staged:

```bash
$PM add -D lint-staged
```

Add lint-staged config to `package.json` or create `.lintstagedrc.json`:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

Or with Biome:

```json
{
  "*.{js,jsx,ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"]
}
```

Ensure `prepare` script exists in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

#### Lefthook Setup (Monorepos)

```bash
# Install lefthook
$PM add -D lefthook

# Initialize
npx lefthook install
```

Create `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,jsx,ts,tsx}"
      run: npx eslint --fix {staged_files} && git add {staged_files}
    format:
      glob: "*.{js,jsx,ts,tsx,json,md,yml,yaml}"
      run: npx prettier --write {staged_files} && git add {staged_files}

pre-push:
  commands:
    typecheck:
      run: npm run typecheck
    build:
      run: npm run build
    test:
      run: npm test
```

#### Pre-commit Framework Setup (Python)

```bash
pip install pre-commit
```

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0  # Check for latest version
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0  # Check for latest version
    hooks:
      - id: mypy
        additional_dependencies: []
```

```bash
pre-commit install
```

#### Simple Shell Scripts (Rust/Go/Other)

Create `.githooks/pre-commit`:

```bash
#!/bin/sh
set -e

# Rust
if [ -f "Cargo.toml" ]; then
    cargo fmt -- --check
    cargo clippy -- -D warnings
fi

# Go
if [ -f "go.mod" ]; then
    gofmt -l . | grep -q . && echo "Files need formatting" && exit 1
    golangci-lint run 2>/dev/null || true
fi
```

Create `.githooks/pre-push`:

```bash
#!/bin/sh
set -e

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
chmod +x .githooks/pre-commit .githooks/pre-push
git config core.hooksPath .githooks
```

### Step 4: Report

After setup completes, provide a summary:

```markdown
## Code Quality Setup Complete

### Framework: [husky/lefthook/pre-commit/shell scripts]

### Pre-commit hooks (run on every commit)
- [formatter] on staged [file types]
- [linter] on staged [file types]

### Pre-push hooks (run on every push)
- [typecheck command]
- [build command]
- [test command]

### Files created/modified
- [list of files]

### Customizing
- Edit [hook config location] to modify checks
- Edit [lint-staged config location] to change staged file processing
- See `code-quality-hooks` skill for framework-specific deep dives
- See `code-quality-lint` skill for linter/formatter configuration

### Testing your hooks
```bash
# Test pre-commit hook
git add . && git commit --dry-run

# Test pre-push hook
git push --dry-run
```
```

## Migration from Legacy `.claude/pre-commit.json`

If a `.claude/pre-commit.json` file is detected:

1. **Read the existing config** to understand what checks are defined
2. **Map old checks to new hooks:**
   - `typecheck` → pre-push hook
   - `lint` → pre-commit hook (lint-staged for staged files) + pre-push hook (full check)
   - `build` → pre-push hook
   - `test` → pre-push hook
3. **Set up the real hooks** using the workflow above, with commands from the legacy config
4. **After confirming hooks work**, offer to remove `.claude/pre-commit.json`
5. **Explain the shift**: "Previously these checks only ran when Claude pushed. Now they run on every push by any developer."

## Multi-Ecosystem Projects

For projects with multiple ecosystems (e.g., JS frontend + Python backend):

1. Detect all ecosystems present
2. Use the **most capable framework** that spans them:
   - If JS + Python → pre-commit framework (best polyglot) or lefthook (flexible globs)
   - If JS + Rust/Go → lefthook (language-agnostic commands)
3. Configure separate commands per ecosystem in the hook config
4. Use glob patterns to route files to the right tools
