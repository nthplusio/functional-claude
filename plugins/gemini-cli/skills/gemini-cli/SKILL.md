---
name: gemini-cli
description: This skill should be used when the user asks to "use gemini", "gemini cli", "configure gemini", "set up gemini", "gemini review", "gemini images", or mentions general Gemini CLI usage. For specific topics, focused skills may be more appropriate.
version: 0.3.0
---

# Gemini CLI Development

Use the Gemini CLI as a complementary AI tool for large context review and image generation tasks, orchestrated from within Claude Code.

## First Action: Check Session Status

The SessionStart hook automatically validates:
1. **Gemini CLI installed** - checks for `gemini` binary
2. **Authentication** - checks `GEMINI_API_KEY`, `GOOGLE_API_KEY`, OAuth, or Vertex AI
3. **nano-banana extension** - checks for image generation capability

If warnings appeared at session start, resolve them before proceeding.

## Prerequisites

### Install Gemini CLI

```bash
npm install -g @google/gemini-cli
```

Or via npx (no install):
```bash
npx @google/gemini-cli
```

### Authentication (choose one)

**Option 1: API Key (simplest)**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

**Option 2: Google OAuth**
```bash
gemini auth login
```

**Option 3: Vertex AI**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### Install nano-banana Extension

```bash
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
```

For nano-banana image generation, also set (if using a separate key):
```bash
export NANOBANANA_GEMINI_API_KEY="your-key"
```

## Critical Rule: Always Use the CLI

**Every task in this plugin MUST execute the Gemini CLI via Bash.** The entire purpose of this plugin is to delegate work to Gemini — not to do it with Claude. If you find yourself reading files with Read/Grep/Glob and analyzing them, you are doing it wrong. Instead, pipe content directly to `gemini -p` in a single Bash command.

## Core Usage: Headless Mode

The key integration pattern is Gemini's **headless mode** (`-p` flag), which accepts a prompt and returns output non-interactively. All content gathering and the gemini call should be a **single piped Bash command**:

```bash
# Simple prompt
gemini -p --model gemini-2.5-pro "Explain this error: ..."

# Pipe file content for review
cat large-file.ts | gemini -p --model gemini-2.5-pro "Review this code for bugs and security issues" 2>&1

# Pipe a directory of files
find src/ -name "*.ts" -type f | sort | while read f; do echo "=== FILE: $f ==="; cat "$f"; done | gemini -p --model gemini-2.5-pro "Review this codebase" 2>&1

# Use sandbox mode for untrusted operations
gemini -p --sandbox "Analyze this codebase"
```

### Model Selection

```bash
# Use a specific model
gemini -p --model gemini-2.5-pro "Your prompt here"

# Available models: gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash
```

### Configuration

Gemini CLI uses `GEMINI.md` files (similar to `CLAUDE.md`) for project context:
```bash
# Create project context file
echo "# Project: My App\nStack: React, TypeScript, Node.js" > GEMINI.md
```

Settings file location: `~/.gemini/settings.json`

## Focused Skills

For specific tasks, use these focused skills:

| Topic | Skill | Trigger Phrases |
|-------|-------|-----------------|
| Large Context Review | `gemini-cli:gemini-review` | "review with gemini", "gemini code review", "analyze large file" |
| Image Generation | `gemini-cli:gemini-images` | "generate image", "create icon", "nano-banana", "gemini image" |

## Common Patterns

### Delegating to Gemini for Large Context

When a task involves reviewing more context than is practical in the current session:

```bash
# Review an entire codebase directory
find src/ -name "*.ts" -exec cat {} + | gemini -p "Review this TypeScript codebase for: 1) Security vulnerabilities 2) Performance issues 3) Code quality"

# Review a large log file
gemini -p "Summarize errors and patterns in this log" < /var/log/app.log

# Compare implementations
diff -u old.ts new.ts | gemini -p "Review this diff for correctness and potential regressions"
```

### Using Gemini with File Context

```bash
# Pass specific files as context
gemini -p "Given these files, suggest improvements" --file src/api.ts --file src/types.ts

# Review with project context
gemini -p "Review the architecture of this project" --file package.json --file tsconfig.json --file src/index.ts
```

## Troubleshooting

For debugging issues, the gemini-troubleshoot agent can diagnose common problems:
- CLI not found
- Authentication failures
- Extension issues
- Model availability

## Documentation Cache

The plugin automatically maintains a documentation cache at `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md`. This cache is refreshed automatically via SessionStart hook when stale (>7 days) or missing.

**To use cached documentation:** Read the cache file for up-to-date CLI options and patterns.

**Cache sources are defined in:** `${CLAUDE_PLUGIN_ROOT}/.cache/sources.json`

## Resources

- Gemini CLI docs: https://geminicli.com/docs/
- nano-banana extension: https://github.com/gemini-cli-extensions/nanobanana
- Gemini models: https://ai.google.dev/gemini-api/docs/models
