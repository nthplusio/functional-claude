---
name: code-quality-lint
description: This skill should be used when the user asks to "set up eslint",
  "configure prettier", "add biome", "set up ruff", "configure lint-staged",
  "add formatter", "configure linter", or needs reference for linter/formatter/lint-staged
  configuration in their project.
version: 1.1.0
---

# Linter, Formatter, and lint-staged Reference

Configuration reference for code quality tools across ecosystems. Use this skill when you need to set up, modify, or troubleshoot specific linting and formatting tools.

## Ecosystem Guide

| Ecosystem | Recommended Tool | Reference |
|-----------|-----------------|-----------|
| JavaScript/TypeScript | Biome (new) or ESLint + Prettier | Below |
| Python | Ruff | [references/python-linting.md](references/python-linting.md) |
| Rust | Clippy + rustfmt | [references/rust-linting.md](references/rust-linting.md) |
| Go | golangci-lint + gofmt | [references/go-linting.md](references/go-linting.md) |

---

## JavaScript / TypeScript

### Biome (Recommended for New Projects)

Biome is a single tool that replaces ESLint + Prettier -- faster, zero-config defaults, consistent formatting.

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

---

## lint-staged Configuration

lint-staged runs linters/formatters only on staged files, making pre-commit hooks fast regardless of project size.

### Installation

```bash
npm add -D lint-staged
```

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

For advanced patterns, monorepo config, and non-JS ecosystems: see [references/lint-staged-advanced.md](references/lint-staged-advanced.md)

---

## Reference Files

| File | Contents | Read when... |
|------|----------|-------------|
| [references/python-linting.md](references/python-linting.md) | Ruff config, Black/Flake8 legacy | Setting up Python linting or formatting |
| [references/rust-linting.md](references/rust-linting.md) | Clippy + rustfmt config | Setting up Rust linting or formatting |
| [references/go-linting.md](references/go-linting.md) | golangci-lint + gofmt config | Setting up Go linting or formatting |
| [references/lint-staged-advanced.md](references/lint-staged-advanced.md) | Config locations, custom functions, monorepo patterns, non-JS ecosystems, ESLint+Prettier conflicts, troubleshooting | Advanced lint-staged setup, debugging, or polyglot projects |
