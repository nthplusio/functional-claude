# Rust Linting

## Clippy (Linter) + rustfmt (Formatter)

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
