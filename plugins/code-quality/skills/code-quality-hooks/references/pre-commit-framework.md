# Pre-commit Framework

**Best for:** Python projects, polyglot repos. Manages hook dependencies automatically.

## Setup

```bash
pip install pre-commit
pre-commit install
```

## Configuration

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

## Adding Pre-push Hooks

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

## Key Commands

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

## Troubleshooting

- **Hook fails on first run:** `pre-commit run --all-files` to initialize environments
- **Stale hook versions:** `pre-commit autoupdate`
- **Slow first run:** Pre-commit creates isolated environments per hook. First run installs them.
- **Cache issues:** `pre-commit clean` to clear cached environments
