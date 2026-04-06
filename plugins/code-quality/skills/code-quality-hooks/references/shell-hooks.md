# Simple Shell Script Hooks

**Best for:** Non-JS/Python projects, minimal dependencies, full control.

## Setup

```bash
# Create hooks directory
mkdir -p .githooks

# Tell git to use it
git config core.hooksPath .githooks
```

## Hook Scripts

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

## Sharing with the Team

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

## Troubleshooting

- **Hooks not running:** Check `git config core.hooksPath` -- should output `.githooks`
- **Permission denied:** `chmod +x .githooks/*`
- **`core.hooksPath` not set:** Run `git config core.hooksPath .githooks` again
- **Hooks not shared:** Commit `.githooks/` to the repo and document the setup step
