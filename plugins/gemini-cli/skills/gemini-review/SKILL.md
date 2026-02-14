---
name: gemini-review
description: This skill should be used when the user asks to "review with gemini", "gemini code review", "analyze large file with gemini", "gemini review codebase", "large context review", "second opinion from gemini", or wants to use Gemini CLI for reviewing code, documents, logs, or other large context items.
version: 0.4.1
---

# Gemini Large Context Review

Use Gemini CLI's large context window (up to 2M tokens) for reviewing code, documents, logs, and other large content that benefits from a second AI perspective or exceeds practical limits.

## When to Use This

- **Large codebases**: Review entire directories or modules at once
- **Log analysis**: Process large log files for patterns and errors
- **Document review**: Analyze lengthy specs, docs, or reports
- **Second opinion**: Get an independent AI review of code or architecture
- **Diff review**: Review large diffs or PRs with full context
- **Migration analysis**: Assess large-scale migration impact across files

## Critical Rule: Gemini Does the Review, Not Claude

**You MUST execute every review via `gemini -p` in a Bash command.** Do NOT read files with Read/Grep/Glob and analyze them yourself — that defeats the entire purpose. The value of this skill is Gemini's independent perspective and 2M token context window. Pipe content directly to the CLI in a single command.

## Core Pattern: Headless Review

All reviews use Gemini's headless mode (`-p` flag) for non-interactive execution. Content gathering and the gemini call should be a **single piped Bash command**:

```bash
# Pipe files directly to gemini — do NOT read them yourself first
cat files... | gemini -m gemini-3-pro-preview -p "REVIEW_PROMPT" 2>&1
```

## Review Recipes

### Code Review (Single File)

```bash
cat src/api/handler.ts | gemini -m gemini-3-pro-preview -p "Review this TypeScript file for:
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
done | gemini -m gemini-3-pro-preview -p "Review these API endpoint files as a cohesive module. Check for:
1. Inconsistent error handling patterns
2. Missing input validation
3. Authentication/authorization gaps
4. Shared state issues"
```

### Code Review (Diff / PR)

```bash
# Review a git diff
git diff main...feature-branch | gemini -m gemini-3-pro-preview -p "Review this diff for:
1. Correctness of changes
2. Potential regressions
3. Missing edge cases
4. Test coverage gaps"

# Review specific PR changes
git log main..HEAD --oneline -p | gemini -m gemini-3-pro-preview -p "Review all changes in this branch. Summarize what changed and flag any concerns."
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
} | gemini -m gemini-3-pro-preview -p "Review this project architecture. Assess:
1. Directory organization
2. Dependency health (outdated, redundant, security)
3. Module boundaries and coupling
4. Scalability concerns"
```

### Log Analysis

```bash
# Analyze application logs
tail -10000 /var/log/app.log | gemini -m gemini-3-pro-preview -p "Analyze these application logs:
1. Identify error patterns and frequency
2. Flag any security-relevant events
3. Note performance degradation signals
4. Suggest monitoring improvements"

# Analyze build output
npm run build 2>&1 | gemini -m gemini-3-pro-preview -p "Analyze this build output. Identify:
1. Warnings that should be addressed
2. Bundle size concerns
3. Deprecation notices
4. Suggested optimizations"
```

### Document / Spec Review

```bash
# Review a technical spec
cat docs/rfc-authentication.md | gemini -m gemini-3-pro-preview -p "Review this technical specification for:
1. Completeness - are there gaps in the spec?
2. Security considerations
3. Edge cases not addressed
4. Implementation feasibility"
```

### Database Schema Review

```bash
cat prisma/schema.prisma | gemini -m gemini-3-pro-preview -p "Review this Prisma schema for:
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
} | gemini -m gemini-3-pro-preview -p "Analyze the impact of this database migration on the codebase. Identify:
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
cat large-codebase.ts | gemini -m gemini-3-pro-preview -p "Deep review..."

# Fallback: only if pro fails or user explicitly asks for speed
cat app.log | gemini -m gemini-2.5-pro -p "Summarize errors..."
```

**Error handling:** If gemini returns a quota/capacity/model error, automatically retry with `gemini-2.5-pro` and tell the user which model was used.

## Structured Output

For machine-readable review results:

```bash
cat src/api.ts | gemini -m gemini-3-pro-preview -p "Review this code and output findings as JSON with this schema:
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

## Combining with Claude Code

The most powerful pattern is using Gemini review output as input for Claude Code actions:

1. **Run Gemini review** to get findings across a large codebase
2. **Parse the output** to identify specific files and issues
3. **Use Claude Code** to implement the fixes with full IDE integration

```bash
# Step 1: Get review findings
FINDINGS=$(find src/ -name "*.ts" -exec cat {} + | gemini -m gemini-3-pro-preview -p "List files and line numbers with security issues as JSON")

# Step 2: Claude Code fixes the issues identified
# (The user can then ask Claude Code to fix specific findings)
```

## Tips

- **Be specific in prompts**: "Review for security" is less useful than "Check for SQL injection, XSS, and auth bypass"
- **Provide context**: Include relevant config files, types, and package.json alongside the code
- **Use file markers**: When concatenating files, add `=== FILE: path ===` headers
- **Chunk if needed**: Even with 2M token context, very large codebases may need chunking by module
- **Save output**: Redirect review output to a file for reference: `... | gemini -m gemini-3-pro-preview -p "..." > review-findings.md`
