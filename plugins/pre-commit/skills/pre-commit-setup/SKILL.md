---
name: pre-commit-setup
description: This skill should be used when the user asks to "set up pre-commit",
  "configure pre-push checks", "add typecheck/lint/test hooks", "initialize pre-commit",
  or when starting a new project that needs quality checks before pushing.
version: 0.2.1
---

# Pre-Commit Setup

Analyze the repository and create a configuration file for pre-push checks.

## What This Does

1. Scans the repository for ecosystem indicators (JS/TS, Python, Rust, Go)
2. Detects available typecheck, lint, build, and test tools
3. Creates `.claude/pre-commit.json` with discovered configuration
4. Reports what was found and how to customize

## Setup Process

### Step 1: Detect Ecosystems

Check for these files in the project root:

| File | Ecosystem |
|------|-----------|
| `package.json` | JavaScript/TypeScript |
| `tsconfig.json` | TypeScript (confirms JS ecosystem) |
| `pyproject.toml`, `setup.py`, `requirements.txt` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |

Run these checks:

```bash
# Check what exists
ls -la package.json tsconfig.json pyproject.toml setup.py requirements.txt Cargo.toml go.mod 2>/dev/null
```

### Step 2: Detect Tools Per Ecosystem

#### JavaScript/TypeScript

**Typecheck detection:**
```bash
# Check for TypeScript
if [ -f "tsconfig.json" ]; then
  # Check package.json for typecheck script
  grep -q '"typecheck"' package.json 2>/dev/null && echo "npm run typecheck"
  grep -q '"type-check"' package.json 2>/dev/null && echo "npm run type-check"
  # Fallback to tsc
  grep -q '"typescript"' package.json 2>/dev/null && echo "npx tsc --noEmit"
fi
```

**Lint detection:**
```bash
# Check for lint script first
grep -q '"lint"' package.json 2>/dev/null && echo "npm run lint"

# Check for ESLint config
ls eslint.config.* .eslintrc* 2>/dev/null && echo "npx eslint ."

# Check for Biome
[ -f "biome.json" ] && echo "npx biome check ."
```

**Build detection:**
```bash
# Check for build script
grep -q '"build"' package.json && echo "npm run build"

# Check for Turbo
[ -f "turbo.json" ] && echo "turbo run build"

# Check for monorepo workspaces
[ -f "pnpm-workspace.yaml" ] && echo "pnpm -r build"
[ -f "lerna.json" ] && echo "lerna run build"
```

**Test detection:**
```bash
# Check for test script
grep -q '"test"' package.json 2>/dev/null && echo "npm test"

# Detect test runner
grep -q '"vitest"' package.json 2>/dev/null && echo "vitest"
grep -q '"jest"' package.json 2>/dev/null && echo "jest"
```

**Package manager detection:**
```bash
[ -f "pnpm-lock.yaml" ] && echo "pnpm"
[ -f "yarn.lock" ] && echo "yarn"
[ -f "bun.lockb" ] && echo "bun"
[ -f "package-lock.json" ] && echo "npm"
```

#### Python

**Typecheck detection:**
```bash
# Check pyproject.toml for mypy or pyright
grep -q "mypy" pyproject.toml 2>/dev/null && echo "mypy ."
grep -q "pyright" pyproject.toml 2>/dev/null && echo "pyright"
[ -f "mypy.ini" ] && echo "mypy ."
[ -f "pyrightconfig.json" ] && echo "pyright"
```

**Lint detection:**
```bash
# Check for ruff (preferred)
grep -q "ruff" pyproject.toml 2>/dev/null && echo "ruff check ."
[ -f "ruff.toml" ] && echo "ruff check ."

# Fallback to flake8
grep -q "flake8" pyproject.toml 2>/dev/null && echo "flake8"
[ -f ".flake8" ] && echo "flake8"
```

**Build detection:**
```bash
[ -f "pyproject.toml" ] && grep -q "\[build-system\]" pyproject.toml && echo "python -m build"
```

**Test detection:**
```bash
# pytest is most common
grep -q "pytest" pyproject.toml 2>/dev/null && echo "pytest"
[ -f "pytest.ini" ] && echo "pytest"
[ -d "tests" ] && echo "pytest"
```

#### Rust

```bash
if [ -f "Cargo.toml" ]; then
  echo "typecheck: cargo check"
  echo "lint: cargo clippy -- -D warnings"
  echo "build: cargo build --release"
  echo "test: cargo test"
fi
```

#### Go

```bash
if [ -f "go.mod" ]; then
  echo "typecheck: go build ./..."
  # Check for golangci-lint config
  [ -f ".golangci.yml" ] || [ -f ".golangci.yaml" ] && echo "lint: golangci-lint run"
  echo "build: go build ./..."
  echo "test: go test ./..."
fi
```

### Step 3: Generate Configuration

Create `.claude/pre-commit.json`:

```json
{
  "version": 1,
  "checks": {
    "typecheck": {
      "enabled": true,
      "mode": "block",
      "command": "<detected-command>"
    },
    "lint": {
      "enabled": true,
      "mode": "block",
      "command": "<detected-command>"
    },
    "build": {
      "enabled": true,
      "mode": "block",
      "command": "<detected-command>"
    },
    "test": {
      "enabled": true,
      "mode": "block",
      "command": "<detected-command>"
    }
  },
  "detected": {
    "ecosystem": "<ecosystem>",
    "packageManager": "<pm>",
    "tools": ["<tool1>", "<tool2>"]
  }
}
```

**Rules:**
- If a check cannot be detected, set `"enabled": false` and `"command": ""`
- Default mode is `"block"` for all checks
- For multi-ecosystem repos, combine commands with `&&`
- For monorepos, use manual override with filter commands (e.g., `pnpm --filter @scope/pkg build`)

### Step 4: Report to User

After creating the config, output:

```
Created .claude/pre-commit.json

Detected ecosystem: JavaScript/TypeScript (npm)

Checks configured:
  typecheck: npm run typecheck (block)
  lint: npm run lint (block)
  build: npm run build (block)
  test: npm test (block)

These checks will run before git push. Edit the file to:
- Change mode from "block" to "warn" for softer enforcement
- Modify commands if the detected ones aren't correct
- Disable checks by setting "enabled": false
- For monorepos, use filter commands like "pnpm --filter @scope/pkg build"
```

## Multi-Ecosystem Example

For a repo with both `package.json` and `pyproject.toml`:

```json
{
  "version": 1,
  "checks": {
    "typecheck": {
      "enabled": true,
      "mode": "block",
      "command": "npm run typecheck && mypy ."
    },
    "lint": {
      "enabled": true,
      "mode": "block",
      "command": "npm run lint && ruff check ."
    },
    "build": {
      "enabled": true,
      "mode": "block",
      "command": "npm run build && python -m build"
    },
    "test": {
      "enabled": true,
      "mode": "block",
      "command": "npm test && pytest"
    }
  },
  "detected": {
    "ecosystem": "javascript,python",
    "packageManager": "npm",
    "tools": ["typescript", "eslint", "vitest", "mypy", "ruff", "pytest"]
  }
}
```

## Monorepo Example

For monorepos where you need targeted build commands:

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
      "mode": "block",
      "command": "npm run lint"
    },
    "build": {
      "enabled": true,
      "mode": "block",
      "command": "pnpm --filter @e2/shared build"
    },
    "test": {
      "enabled": true,
      "mode": "block",
      "command": "npm test"
    }
  }
}
```

## Updating Configuration

If the user asks to "refresh" or "update" pre-commit config:
1. Re-run detection
2. Preserve existing `mode` settings from current config
3. Update commands if tools changed
4. Report what changed
