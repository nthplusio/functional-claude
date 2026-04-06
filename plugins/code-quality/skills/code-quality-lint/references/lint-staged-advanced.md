# lint-staged Advanced Patterns

## Configuration Locations

lint-staged config can live in (in priority order):
1. `lint-staged` key in `package.json`
2. `.lintstagedrc.json` or `.lintstagedrc.js`
3. `lint-staged.config.js` or `lint-staged.config.mjs`

## Advanced Patterns

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

## Incremental Checking for Non-JS Ecosystems

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

## ESLint + Prettier Conflict Resolution

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

## Troubleshooting

- **"No staged files match any configured task"** -- Check glob patterns match your file extensions
- **Files not re-staged after fix:** Ensure commands include the fix flag (e.g., `--fix`, `--write`)
- **Debug mode:** `npx lint-staged --debug`
- **Partial staging issues:** lint-staged handles partial staging (hunks) correctly -- it stashes unstaged changes, runs commands, then restores
