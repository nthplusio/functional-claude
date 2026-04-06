---
name: code-quality-hooks
description: This skill should be used when the user asks to "configure husky",
  "set up lefthook", "add pre-push hook", "add pre-commit hook", "git hooks not running",
  "husky not working", "modify git hooks", or needs deep reference for a specific
  git hook framework.
version: 1.1.0
---

# Git Hook Framework Reference

Deep reference for managing git hooks across frameworks. Use `/code-quality-setup` for initial setup; this skill is for modifying, extending, or understanding existing hook configurations.

## Framework Selection

| Framework | Best For | Parallel | Staged Files | Install |
|-----------|---------|----------|--------------|---------|
| Husky | JS/TS single-package | No | via lint-staged | npm |
| Lefthook | Monorepos, polyglot | Yes | {staged_files} | standalone/npm |
| Pre-commit | Python, polyglot | Limited | Built-in | pip |
| Shell Scripts | Rust/Go, minimal | No | Manual | None |

---

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
- `.husky/pre-commit` -- default pre-commit hook
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

## Other Frameworks

For other frameworks, see:
- [references/lefthook.md](references/lefthook.md) -- Monorepo and polyglot projects
- [references/pre-commit-framework.md](references/pre-commit-framework.md) -- Python and polyglot projects
- [references/shell-hooks.md](references/shell-hooks.md) -- Minimal dependencies, full control

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

---

## Reference Files

| File | Contents | Read when... |
|------|----------|-------------|
| [references/lefthook.md](references/lefthook.md) | Full Lefthook setup, config, monorepo patterns | Using Lefthook for monorepo or polyglot projects |
| [references/pre-commit-framework.md](references/pre-commit-framework.md) | Pre-commit framework setup, config, commands | Using pre-commit for Python or polyglot projects |
| [references/shell-hooks.md](references/shell-hooks.md) | Shell script hooks for Rust/Go, team sharing | Using minimal shell scripts for git hooks |
