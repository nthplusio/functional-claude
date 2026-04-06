# Python Linting

## Ruff (Recommended)

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

## Black + Flake8 (Legacy Alternative)

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
