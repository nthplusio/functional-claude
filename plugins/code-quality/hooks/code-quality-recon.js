#!/usr/bin/env node
// code-quality-recon.js
// SessionStart hook that detects quality infrastructure and provides status/suggestions
//
// Output: { "continue": true, "systemMessage": "..." } or { "continue": true }

const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace(/[/\\]hooks$/, '');
const cacheDir = path.join(pluginRoot, '.cache');
const cachePath = path.join(cacheDir, 'recon.json');

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectDir, relativePath));
}

function dirExists(relativePath) {
  try {
    return fs.statSync(path.join(projectDir, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function isExecutable(relativePath) {
  try {
    const fullPath = path.join(projectDir, relativePath);
    fs.accessSync(fullPath, fs.constants.X_OK);
    const content = fs.readFileSync(fullPath, 'utf8');
    // Ignore sample hooks (default git hooks contain "sample" in filename or are templates)
    return !content.includes('This hook is invoked by') || content.includes('#!/');
  } catch {
    return false;
  }
}

function packageJsonHas(key) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    // Check nested keys like "lint-staged" or "scripts.prepare"
    const keys = key.split('.');
    let obj = pkg;
    for (const k of keys) {
      if (obj && typeof obj === 'object' && k in obj) {
        obj = obj[k];
      } else {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

try {
  const recon = {
    timestamp: new Date().toISOString(),
    ecosystems: [],
    hookFramework: null,
    linters: [],
    formatters: [],
    lintStaged: false,
    legacyConfig: false,
    ci: []
  };

  // Detect ecosystems
  if (fileExists('package.json')) recon.ecosystems.push('javascript');
  if (fileExists('tsconfig.json')) recon.ecosystems.push('typescript');
  if (fileExists('pyproject.toml') || fileExists('setup.py')) recon.ecosystems.push('python');
  if (fileExists('Cargo.toml')) recon.ecosystems.push('rust');
  if (fileExists('go.mod')) recon.ecosystems.push('go');

  // Detect hook frameworks
  if (dirExists('.husky')) {
    recon.hookFramework = 'husky';
  } else if (fileExists('lefthook.yml') || fileExists('lefthook.yaml')) {
    recon.hookFramework = 'lefthook';
  } else if (fileExists('.pre-commit-config.yaml')) {
    recon.hookFramework = 'pre-commit';
  } else if (dirExists('.githooks')) {
    recon.hookFramework = 'githooks';
  } else if (isExecutable('.git/hooks/pre-commit') || isExecutable('.git/hooks/pre-push')) {
    recon.hookFramework = 'custom-git-hooks';
  }

  // Detect linters
  if (fileExists('eslint.config.js') || fileExists('eslint.config.mjs') || fileExists('eslint.config.ts') || fileExists('.eslintrc.json') || fileExists('.eslintrc.js') || fileExists('.eslintrc.yml')) {
    recon.linters.push('eslint');
  }
  if (fileExists('biome.json') || fileExists('biome.jsonc')) {
    recon.linters.push('biome');
  }
  if (fileExists('ruff.toml') || fileExists('.ruff.toml')) {
    recon.linters.push('ruff');
  }
  if (fileExists('.golangci.yml') || fileExists('.golangci.yaml')) {
    recon.linters.push('golangci-lint');
  }

  // Detect formatters
  if (fileExists('.prettierrc') || fileExists('.prettierrc.json') || fileExists('.prettierrc.js') || fileExists('.prettierrc.yml') || fileExists('prettier.config.js') || fileExists('prettier.config.mjs')) {
    recon.formatters.push('prettier');
  }
  if (recon.linters.includes('biome')) {
    recon.formatters.push('biome'); // Biome is dual-use
  }
  if (recon.linters.includes('ruff')) {
    recon.formatters.push('ruff'); // Ruff has a formatter
  }
  if (fileExists('rustfmt.toml') || fileExists('.rustfmt.toml')) {
    recon.formatters.push('rustfmt');
  }

  // Detect lint-staged
  if (packageJsonHas('lint-staged') || fileExists('.lintstagedrc') || fileExists('.lintstagedrc.json') || fileExists('.lintstagedrc.js') || fileExists('.lintstagedrc.yml') || fileExists('lint-staged.config.js') || fileExists('lint-staged.config.mjs')) {
    recon.lintStaged = true;
  }

  // Detect legacy config
  if (fileExists('.claude/pre-commit.json')) {
    recon.legacyConfig = true;
  }

  // Detect CI
  if (dirExists('.github/workflows')) recon.ci.push('github-actions');
  if (fileExists('.gitlab-ci.yml')) recon.ci.push('gitlab-ci');

  // Cache results
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(cachePath, JSON.stringify(recon, null, 2));
  } catch {
    // Cache write failure is non-fatal
  }

  // Build status message
  const parts = [];

  if (recon.legacyConfig && !recon.hookFramework) {
    // Migration scenario: legacy config but no real hooks
    parts.push('[code-quality] Legacy `.claude/pre-commit.json` detected without real git hooks. These checks only run when Claude pushes — not when developers push from their terminal. Run `/code-quality-setup` to migrate to deterministic git hooks that run for everyone.');
  } else if (!recon.hookFramework && recon.ecosystems.length > 0) {
    // No quality infra detected
    const eco = recon.ecosystems.join(', ');
    parts.push(`[code-quality] No git hook framework detected (${eco} project). Run \`/code-quality-setup\` to add pre-commit and pre-push hooks.`);
  } else if (recon.hookFramework) {
    // Quality infra exists — brief status
    const items = [recon.hookFramework];
    if (recon.lintStaged) items.push('lint-staged');
    if (recon.linters.length > 0) items.push(recon.linters.join(', '));
    if (recon.formatters.length > 0) {
      const uniqueFormatters = recon.formatters.filter(f => !recon.linters.includes(f));
      if (uniqueFormatters.length > 0) items.push(uniqueFormatters.join(', '));
    }
    parts.push(`[code-quality] Hooks: ${items.join(' + ')}`);

    if (recon.legacyConfig) {
      parts.push('Legacy `.claude/pre-commit.json` also found — consider removing it since real hooks are in place.');
    }
  }

  if (parts.length > 0) {
    console.log(JSON.stringify({ continue: true, systemMessage: parts.join(' ') }));
  } else {
    console.log(JSON.stringify({ continue: true }));
  }
} catch (err) {
  // Fail open — never block session start
  console.log(JSON.stringify({ continue: true }));
}
