---
name: code-quality-lint
description: This skill should be used when the user asks to "set up eslint",
  "configure prettier", "add biome", "set up ruff", "configure lint-staged",
  "add formatter", "configure linter", or needs reference for linter/formatter/lint-staged
  configuration in their project.
version: 1.0.0
---

# Linter, Formatter, and lint-staged Reference

Configuration reference for code quality tools across ecosystems. Use this skill when you need to set up, modify, or troubleshoot specific linting and formatting tools.

## JavaScript / TypeScript

### Biome (Recommended for New Projects)

Biome is a single tool that replaces ESLint + Prettier — faster, zero-config defaults, consistent formatting.

```bash
# Install
npm add -D @biomejs/biome

# Initialize
npx biome init
```

`biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

**lint-staged config:**
```json
{
  "*.{js,jsx,ts,tsx,json,jsonc,css}": ["biome check --write --no-errors-on-unmatched"]
}
```

**When to choose Biome over ESLint + Prettier:**
- New projects without existing ESLint config
- Want simpler toolchain (one tool, one config)
- Performance-sensitive CI (Biome is significantly faster)

### ESLint 9 (Flat Config)

ESLint 9 uses flat config (`eslint.config.js`) instead of the legacy `.eslintrc.*` format.

```bash
npm add -D eslint @eslint/js typescript-eslint
```

`eslint.config.js`:
```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', '.next/']
  }
);
```

**lint-staged config:**
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix"]
}
```

### Prettier

```bash
npm add -D prettier
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

**lint-staged config (with ESLint):**
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml,css}": ["prettier --write"]
}
```

### ESLint + Prettier Conflict Resolution

When using both, ensure Prettier runs **after** ESLint to avoid formatting conflicts:

```bash
npm add -D eslint-config-prettier
```

Add to `eslint.config.js`:
```javascript
import prettierConfig from 'eslint-config-prettier';

export default [
  // ... other configs
  prettierConfig, // Must be last to disable conflicting rules
];
```

---

## Python

### Ruff (Recommended)

Ruff replaces Flake8, isort, Black, and many other Python tools. Single binary, extremely fast.

```bash
pip install ruff
```

`ruff.toml` (or `[tool.ruff]` in `pyproject.toml`):
```toml
line-length = 88
target-version = "py312"

[lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM"]
ignore = []
fixable = ["ALL"]

[format]
quote-style = "double"
indent-style = "space"
```

**Usage:**
```bash
# Lint
ruff check .

# Lint and fix
ruff check --fix .

# Format
ruff format .
```

**lint-staged equivalent (via pre-commit framework):**
```yaml
- repo: https://github.com/astral-sh/ruff-pre-commit
  rev: v0.8.0
  hooks:
    - id: ruff
      args: [--fix]
    - id: ruff-format
```

**When to choose Ruff over Black + Flake8:**
- Always, for new Python projects (it's faster and consolidates tools)
- For existing projects, Ruff is a drop-in replacement with matching defaults

### Black + Flake8 (Legacy Alternative)

```bash
pip install black flake8
```

`pyproject.toml`:
```toml
[tool.black]
line-length = 88
target-version = ["py312"]

[tool.flake8]
max-line-length = 88
extend-ignore = ["E203", "W503"]
```

---

## Rust

### Clippy (Linter) + rustfmt (Formatter)

Both ship with Rust via `rustup`. No installation needed.

**Check formatting:**
```bash
cargo fmt -- --check
```

**Run linter:**
```bash
cargo clippy -- -D warnings
```

`rustfmt.toml` (optional customization):
```toml
edition = "2021"
max_width = 100
tab_spaces = 4
use_field_init_shorthand = true
```

`.clippy.toml` (optional):
```toml
cognitive-complexity-threshold = 30
```

**Git hook commands:**
```bash
# Pre-commit: format check + lint
cargo fmt -- --check && cargo clippy -- -D warnings

# Pre-push: full check + tests
cargo check && cargo test
```

---

## Go

### golangci-lint (Linter) + gofmt (Formatter)

```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
# Or: brew install golangci-lint
```

`.golangci.yml`:
```yaml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports

linters-settings:
  gofmt:
    simplify: true

run:
  timeout: 5m
```

**Git hook commands:**
```bash
# Pre-commit: format check + lint
gofmt -l . | grep -q . && echo "Files need formatting" && exit 1
golangci-lint run

# Pre-push: vet + tests
go vet ./...
go test ./...
```

---

## lint-staged Configuration

lint-staged runs linters/formatters only on staged files, making pre-commit hooks fast regardless of project size.

### Installation

```bash
npm add -D lint-staged
```

### Configuration Locations

lint-staged config can live in (in priority order):
1. `lint-staged` key in `package.json`
2. `.lintstagedrc.json` or `.lintstagedrc.js`
3. `lint-staged.config.js` or `lint-staged.config.mjs`

### Configuration Examples

**Minimal (Biome):**
```json
{
  "*.{js,jsx,ts,tsx,json}": ["biome check --write --no-errors-on-unmatched"]
}
```

**ESLint + Prettier:**
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml,css,html}": ["prettier --write"]
}
```

**TypeScript-aware (with type checking on staged files):**
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"]
}
```

> **Note:** Running `tsc` in lint-staged is usually not recommended because TypeScript type checking requires the full project context, not just staged files. Put `tsc --noEmit` in your pre-push hook instead.

### Advanced Patterns

**Custom function (lint-staged.config.mjs):**
```javascript
export default {
  '*.{ts,tsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
  '*.css': ['prettier --write'],
};
```

**Monorepo-aware:**
```json
{
  "packages/frontend/**/*.{ts,tsx}": ["eslint --fix --config packages/frontend/eslint.config.js"],
  "packages/backend/**/*.{ts,tsx}": ["eslint --fix --config packages/backend/eslint.config.js"]
}
```

### Incremental Checking for Non-JS Ecosystems

For Python, Rust, and Go, lint-staged isn't available. Use framework-native file filtering instead:

**Lefthook `{staged_files}`:**
```yaml
pre-commit:
  commands:
    ruff:
      glob: "*.py"
      run: ruff check --fix {staged_files}
    rustfmt:
      glob: "*.rs"
      run: rustfmt {staged_files}
```

**Pre-commit framework** automatically passes only matching staged files to each hook.

**Shell scripts (manual):**
```bash
#!/bin/sh
# Get staged .py files
STAGED_PY=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$')
if [ -n "$STAGED_PY" ]; then
    ruff check --fix $STAGED_PY
    ruff format $STAGED_PY
    git add $STAGED_PY
fi
```

### Troubleshooting lint-staged

- **"No staged files match any configured task"** — Check glob patterns match your file extensions
- **Files not re-staged after fix:** Ensure commands include the fix flag (e.g., `--fix`, `--write`)
- **Debug mode:** `npx lint-staged --debug`
- **Partial staging issues:** lint-staged handles partial staging (hunks) correctly — it stashes unstaged changes, runs commands, then restores
