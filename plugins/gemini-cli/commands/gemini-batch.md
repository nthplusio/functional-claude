---
name: gemini-batch
description: Run sequential Gemini reviews across multiple targets with rate limit awareness, model fallback, and an aggregate summary table. Use when reviewing multiple directories, modules, or files in batch.
allowed-tools:
  - Bash
argument-hint: <review-type> <target1> [target2] ... [--delay=30] [--timeout=600]
---

# Gemini Batch Review

Run sequential Gemini CLI reviews across multiple targets with automatic rate limit handling, model fallback, and a summary table.

## Usage

```
/gemini-batch <review-type> <target1> [target2] ... [--delay=30] [--timeout=600]
```

**Examples:**
```
/gemini-batch security src/api/ src/auth/ src/middleware/
/gemini-batch general src/components/ src/hooks/ --delay=45
/gemini-batch performance src/api/ --timeout=900
/gemini-batch architecture src/ --delay=60 --timeout=1200
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `review-type` | Yes | One of: `security`, `performance`, `general`, `architecture` |
| `target1 ...` | Yes | One or more file or directory paths to review |
| `--delay=N` | No | Seconds to wait between reviews (default: 30) |
| `--timeout=N` | No | Timeout per review in seconds (default: 600) |

## Workflow

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- **review-type**: First positional argument
- **targets**: All subsequent positional arguments (not starting with `--`)
- **delay**: Value of `--delay=N` (default: 30)
- **timeout**: Value of `--timeout=N` (default: 600)

Validate:
- review-type is one of: `security`, `performance`, `general`, `architecture`
- At least one target is provided
- All targets exist (file or directory)

If validation fails, print usage and stop.

### Step 2: Pre-flight

Run the same pre-flight check as the gemini-review agent:

```bash
gemini --version 2>&1 && echo "GEMINI_API_KEY: ${GEMINI_API_KEY:+SET}" && echo "GOOGLE_API_KEY: ${GOOGLE_API_KEY:+SET}"
```

If gemini is not found or no auth is detected, print the error and stop.

### Step 3: Sequential Review Loop

For each target, execute a gemini review command:

```bash
# For a directory target
timeout ${TIMEOUT} bash -c 'find ${TARGET} -type f -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" | sort | while read f; do echo "=== FILE: $f ==="; cat "$f"; done | gemini -m gemini-3-pro-preview -p "${PROMPT}" 2>&1'

# For a single file target
timeout ${TIMEOUT} bash -c 'cat ${TARGET} | gemini -m gemini-3-pro-preview -p "${PROMPT}" 2>&1'
```

**Rate limit handling per target:**
1. If output contains rate limit indicators ("429", "quota", "rate limit", "resource exhausted"):
   - Increase delay to 60 seconds for remaining targets
   - Wait 60 seconds, then retry with same model
   - If retry fails, fall back to `gemini-2.5-pro`
2. If output contains model unavailable indicators:
   - Switch to `gemini-2.5-pro` for remaining targets (no retry)
3. If timeout (exit 124):
   - Record as "timed out" in results, continue to next target

**Between targets:** Wait `delay` seconds (default 30, increased to 60 after any rate limit).

**Track results for each target:**
- Target path
- Model used
- Status (success / rate-limited / fallback / timed out / error)
- Key findings count or summary (first 100 chars of output)

### Step 4: Present Results

For each target, present the review output:

```
## Target 1: src/api/ (model: gemini-3-pro-preview)

<gemini's verbatim output>

---

## Target 2: src/auth/ (model: gemini-2.5-pro — fallback after rate limit)

<gemini's verbatim output>
```

### Step 5: Aggregate Summary

After all reviews complete, present a summary table:

```
## Batch Review Summary

| # | Target | Model | Status | Key Findings |
|---|--------|-------|--------|--------------|
| 1 | src/api/ | gemini-3-pro-preview | Success | 3 critical, 5 high severity |
| 2 | src/auth/ | gemini-2.5-pro | Fallback | 2 high, 4 medium severity |
| 3 | src/middleware/ | gemini-3-pro-preview | Timed out | Review incomplete |

**Total targets:** 3 | **Successful:** 2 | **Failed:** 1
**Models used:** gemini-3-pro-preview (2), gemini-2.5-pro (1)
```

## Review Prompt Templates

Use these prompts based on the review-type argument:

**security:** "Review this code for security vulnerabilities: injection attacks, auth bypass, data exposure, input validation gaps, CSRF/SSRF. For each finding: severity (critical/high/medium/low), file, location, description, suggested fix."

**performance:** "Review this code for performance issues: N+1 queries, memory leaks, blocking I/O, missing caching, inefficient algorithms. For each finding: severity, location, description, optimization."

**general:** "Review this code for quality and correctness: logic errors, edge cases, error handling gaps, type safety, duplication. For each finding: severity, location, description, suggestion."

**architecture:** "Review this codebase architecture: module boundaries, coupling, dependency health, scalability, separation of concerns. Provide an overall assessment with specific recommendations."

## Important

- **Do NOT analyze code yourself.** Every review MUST go through `gemini -p`.
- **Return Gemini's output verbatim.** Do not rewrite or summarize.
- **Respect rate limits.** The delay between targets prevents quota exhaustion.
- **Continue on failure.** If one target fails, record the failure and continue to the next.
