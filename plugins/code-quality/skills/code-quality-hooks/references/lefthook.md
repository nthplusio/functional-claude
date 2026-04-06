# Lefthook

**Best for:** Monorepos, polyglot projects, teams wanting parallel hook execution. No npm lifecycle dependency.

## Setup

```bash
# Install via npm
npm add -D lefthook

# Or install standalone (no Node dependency)
# brew install lefthook
# go install github.com/evilmartians/lefthook@latest

# Initialize
npx lefthook install
```

## Configuration

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

## Key Features

- **`{staged_files}`** -- Expands to list of staged files matching the glob
- **`{all_files}`** -- All tracked files matching the glob
- **`{push_files}`** -- Files changed between local and remote
- **`parallel: true`** -- Run commands concurrently (faster)
- **`glob:`** -- Filter which files trigger the command
- **`root:`** -- Run command from a subdirectory (monorepo packages)
- **`exclude:`** -- Regex to exclude files

## Monorepo Configuration

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

## Troubleshooting

- **Hooks not running:** `npx lefthook install` (re-installs git hooks)
- **Command not found:** Commands run in the repo root by default. Use `root:` for subdirectories.
- **Slow hooks:** Add `parallel: true` to the hook group
- **Debug output:** `LEFTHOOK_VERBOSE=1 git commit -m "test"`
