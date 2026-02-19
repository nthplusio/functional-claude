---
name: gemini-review
description: This skill should be used when the user asks to "review with gemini", "gemini code review", "analyze large file with gemini", "gemini review codebase", "large context review", "second opinion from gemini", or wants to use Gemini CLI for reviewing code, documents, logs, or other large context items.
version: 0.6.2
---

# Gemini Large Context Review

Use Gemini CLI's large context window (up to 2M tokens) for reviewing code, documents, logs, and other large content that benefits from a second AI perspective or exceeds practical limits.

## Prerequisites

**API key required.** The gemini-review agent requires `GEMINI_API_KEY` or `GOOGLE_API_KEY` to be set as an environment variable. OAuth and Vertex AI are not supported for headless review execution — the agent needs deterministic API key auth to fail fast on auth issues.

```bash
# Set one of these before using gemini-review:
export GEMINI_API_KEY="your-api-key-here"
# or
export GOOGLE_API_KEY="your-api-key-here"
```

Get a key at: https://aistudio.google.com/apikey

## When to Use This

- **Large codebases**: Review entire directories or modules at once
- **Log analysis**: Process large log files for patterns and errors
- **Document review**: Analyze lengthy specs, docs, or reports
- **Second opinion**: Get an independent AI review of code or architecture
- **Diff review**: Review large diffs or PRs with full context
- **Migration analysis**: Assess large-scale migration impact across files

## Critical Rules

### Gemini is Advisory Only — No Edits

**Gemini MUST NEVER modify source files, configuration, or any project content.** Its role is strictly advisory: review code, analyze logs, provide recommendations. All review output is returned to Claude Code for the user to act on. Gemini does not implement fixes, refactor code, or make any changes.

**Always use `--sandbox` mode for reviews** to enforce read-only access. Never use `--yolo` for reviews — it auto-approves file writes and can lead to unauthorized modifications.

### Gemini Does the Review, Not Claude

**You MUST execute every review via `gemini -p` in a Bash command.** Do NOT read files with Read/Grep/Glob and analyze them yourself — that defeats the entire purpose. The value of this skill is Gemini's independent perspective and 2M token context window. Pipe content directly to the CLI in a single command.

## Core Pattern: Headless Review

All reviews use Gemini's headless mode (`-p` flag) with `--sandbox` for read-only, non-interactive execution. Content gathering and the gemini call should be a **single piped Bash command**:

```bash
# Pipe files directly to gemini — do NOT read them yourself first
cat files... | gemini --sandbox -m gemini-3-pro-preview -p "REVIEW_PROMPT" 2>&1
```

## Review Recipes

### Code Review (Single File)

```bash
cat src/api/handler.ts | gemini --sandbox -m gemini-3-pro-preview -p "Review this TypeScript file for:
1. Security vulnerabilities (injection, auth bypass, data exposure)
2. Error handling gaps
3. Performance issues
4. Type safety concerns
Provide specific line references and severity ratings."
```

### Code Review (Multiple Files)

```bash
# Concatenate with file markers for context
for f in src/api/*.ts; do
  echo "=== FILE: $f ==="
  cat "$f"
done | gemini --sandbox -m gemini-3-pro-preview -p "Review these API endpoint files as a cohesive module. Check for:
1. Inconsistent error handling patterns
2. Missing input validation
3. Authentication/authorization gaps
4. Shared state issues"
```

### Code Review (Diff / PR)

```bash
# Review a git diff
git diff main...feature-branch | gemini --sandbox -m gemini-3-pro-preview -p "Review this diff for:
1. Correctness of changes
2. Potential regressions
3. Missing edge cases
4. Test coverage gaps"

# Review specific PR changes
git log main..HEAD --oneline -p | gemini --sandbox -m gemini-3-pro-preview -p "Review all changes in this branch. Summarize what changed and flag any concerns."
```

### Architecture Review

```bash
# Feed project structure + key files
{
  echo "=== Project Structure ==="
  find src/ -type f -name "*.ts" | head -100
  echo ""
  echo "=== Package Dependencies ==="
  cat package.json
  echo ""
  echo "=== Entry Point ==="
  cat src/index.ts
  echo ""
  echo "=== Key Types ==="
  cat src/types.ts
} | gemini --sandbox -m gemini-3-pro-preview -p "Review this project architecture. Assess:
1. Directory organization
2. Dependency health (outdated, redundant, security)
3. Module boundaries and coupling
4. Scalability concerns"
```

### Log Analysis

```bash
# Analyze application logs
tail -10000 /var/log/app.log | gemini --sandbox -m gemini-3-pro-preview -p "Analyze these application logs:
1. Identify error patterns and frequency
2. Flag any security-relevant events
3. Note performance degradation signals
4. Suggest monitoring improvements"

# Analyze build output
npm run build 2>&1 | gemini --sandbox -m gemini-3-pro-preview -p "Analyze this build output. Identify:
1. Warnings that should be addressed
2. Bundle size concerns
3. Deprecation notices
4. Suggested optimizations"
```

### Document / Spec Review

```bash
# Review a technical spec
cat docs/rfc-authentication.md | gemini --sandbox -m gemini-3-pro-preview -p "Review this technical specification for:
1. Completeness - are there gaps in the spec?
2. Security considerations
3. Edge cases not addressed
4. Implementation feasibility"
```

### Database Schema Review

```bash
cat prisma/schema.prisma | gemini --sandbox -m gemini-3-pro-preview -p "Review this Prisma schema for:
1. Normalization issues
2. Missing indexes for common query patterns
3. Relationship modeling concerns
4. Data integrity gaps (missing unique constraints, etc.)"
```

### Migration Impact Analysis

```bash
# Assess impact of a migration across the codebase
{
  echo "=== Migration File ==="
  cat migrations/0042_add_user_roles.sql
  echo ""
  echo "=== Affected Models ==="
  grep -r "user" src/models/ --include="*.ts"
  echo ""
  echo "=== Affected Routes ==="
  grep -r "user" src/routes/ --include="*.ts"
} | gemini --sandbox -m gemini-3-pro-preview -p "Analyze the impact of this database migration on the codebase. Identify:
1. Code that needs updating
2. Potential breaking changes
3. Required data backfills
4. Rollback considerations"
```

## Model Selection for Reviews

**Always use the preferred model first.** Only fallback if it errors (quota, capacity, unavailable).

| Model | Role | Context Window |
|-------|------|---------------|
| `gemini-3-pro-preview` | **Default** — all reviews | 2M tokens |
| `gemini-2.5-pro` | **Fallback** — on error or if user requests speed | 2M tokens |

```bash
# Default: always use pro
cat large-codebase.ts | gemini --sandbox -m gemini-3-pro-preview -p "Deep review..."

# Fallback: only if pro fails or user explicitly asks for speed
cat app.log | gemini -m gemini-2.5-pro -p "Summarize errors..."
```

**Error handling:** If gemini returns a quota/capacity/model error, automatically retry with `gemini-2.5-pro` and tell the user which model was used.

## Structured Output

For machine-readable review results:

```bash
cat src/api.ts | gemini --sandbox -m gemini-3-pro-preview -p "Review this code and output findings as JSON with this schema:
{
  \"findings\": [{
    \"severity\": \"critical|high|medium|low\",
    \"category\": \"security|performance|correctness|style\",
    \"line\": number,
    \"description\": \"string\",
    \"suggestion\": \"string\"
  }]
}"
```

## Saving Review Output

For large reviews, redirect stdout to a file for later reference:

```bash
# Redirect review output to a file (Gemini stays read-only via --sandbox)
find src/ -name "*.ts" -exec cat {} + | gemini --sandbox -m gemini-3-pro-preview -p "Review this codebase for security issues." 2>&1 | tee /tmp/gemini-review-$(date +%s).md
```

**Never use `--yolo` for reviews.** The `--yolo` flag auto-approves all tool calls including file edits. Gemini's role is advisory only — it must never modify source files. Use stdout redirection (`| tee` or `>`) to save output instead.

## Timeout Configuration

Reviews have configurable timeouts to prevent hanging on large content or slow network conditions.

### Default Timeouts

| Content Size | Timeout | Description |
|-------------|---------|-------------|
| Single file (< 1000 lines) | 5 minutes (300s) | Quick file review |
| Multiple files (< 10 files) | 10 minutes (600s) | Module-level review |
| Large directory | 15 minutes (900s) | Directory-level review |
| Full codebase | 20 minutes (1200s) | Complete codebase review |

### How Timeouts Work

Commands are wrapped with `timeout N bash -c '...'`:

```bash
# 10-minute timeout for a multi-file review
timeout 600 bash -c 'find src/api/ -name "*.ts" -type f | sort | while read f; do echo "=== FILE: $f ==="; cat "$f"; done | gemini --sandbox -m gemini-3-pro-preview -p "Review these files" 2>&1'
```

### Timeout Recovery

If a review times out (exit code 124):
- **Reduce scope**: Review a single directory or file instead of the full codebase
- **Use file-output**: The file-output pattern can handle longer reviews
- **Split the review**: Break large codebases into module-by-module reviews using `/gemini-batch`

## Output Validation

The review agent validates output quality before returning results.

### Validation Checks

| Check | What It Detects | Result |
|-------|----------------|--------|
| Minimum length | Output < 100 chars | Warning added to output header |
| Error contamination | "Error:", "Exception:", "Traceback" as primary content | Warning added to output header |
| Markdown structure | Missing headings/bullets in structured reviews | Warning added to output header |
| JSON validity | Invalid JSON when JSON format was requested | Warning added to output header |
| File existence | Missing or empty file for file-output pattern | Automatic retry with stdout |

### What Happens on Failure

- **Warnings** are added to the output header but do NOT block results — you still see Gemini's output
- **File-output failures** trigger an automatic retry using stdout capture instead
- **No automatic re-runs** for other validation failures — the warning lets you decide whether to re-run

### Troubleshooting

- **"Output unusually short"**: The review may have hit a content filter or the input was too small. Try a more specific prompt.
- **"Output may contain error messages"**: Check your API key, model availability, and network. The output itself may contain diagnostic information.
- **"Output lacks expected structure"**: Try adding "Format your response with markdown headings and bullet points" to the prompt.
- **"Requested JSON output is not valid JSON"**: Gemini sometimes wraps JSON in markdown code blocks. Try adding "Output raw JSON only, no markdown formatting" to the prompt.

## Combining with Claude Code

The most powerful pattern is using Gemini review output as input for Claude Code actions:

1. **Run Gemini review** to get findings across a large codebase
2. **Parse the output** to identify specific files and issues
3. **Use Claude Code** to implement the fixes with full IDE integration

```bash
# Step 1: Get review findings
FINDINGS=$(find src/ -name "*.ts" -exec cat {} + | gemini --sandbox -m gemini-3-pro-preview -p "List files and line numbers with security issues as JSON")

# Step 2: Claude Code fixes the issues identified
# (The user can then ask Claude Code to fix specific findings)
```

## Tips

- **Be specific in prompts**: "Review for security" is less useful than "Check for SQL injection, XSS, and auth bypass"
- **Provide context**: Include relevant config files, types, and package.json alongside the code
- **Use file markers**: When concatenating files, add `=== FILE: path ===` headers
- **Chunk if needed**: Even with 2M token context, very large codebases may need chunking by module
- **Save output**: Redirect review output to a file for reference: `... | gemini --sandbox -m gemini-3-pro-preview -p "..." > review-findings.md`
