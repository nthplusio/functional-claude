# Coding Conventions

**Analysis Date:** 2026-03-10

## Language & Runtime

**Primary Language:** JavaScript (Node.js)
- Hook scripts use Node.js exclusively
- All hook files are executable scripts with polyglot shebang headers
- Markdown files for documentation and skill/agent definitions

**Markdown Files:**
- SKILL.md, AGENT.md, command definitions: structured documentation with YAML frontmatter
- References are kept in `references/` subdirectories
- Examples in `examples/` subdirectories

## Naming Patterns

**Files:**
- Hook files: `<plugin>-<purpose>.js` or `<verb>-<noun>.js` (e.g., `plugin-dev-learnings.js`, `block-manual-migration.js`, `dedup-guard.js`)
- Skill definitions: `SKILL.md` (exact name, uppercase)
- Agent definitions: `<agent-name>.md` (kebab-case filename)
- Plugin manifest: `plugin.json` (exact name, lowercase)
- Hook configuration: `hooks.json` (exact name, lowercase)
- Configuration files: `<name>.json` or `<name>.yml`/`<name>.yaml`

**Functions:**
- camelCase for all function names (e.g., `fileExists()`, `autoSyncVersion()`, `normalizeRemoteUrl()`)
- Helper functions with descriptor prefix: `<action><Target>()` (e.g., `escapeRegex()`, `toGitPath()`)
- Callback handlers: `on<Event>` (e.g., `on('data', chunk => ...)`, `on('end', () => ...)`)

**Variables:**
- camelCase for all variables and constants (e.g., `projectDir`, `pluginVersion`, `synced`)
- ALL_CAPS for immutable constants defined at module level (e.g., `PRESERVE = [...]`)
- Descriptive names with clear intent: `stagedFiles`, `modifiedPlugins`, `versionWasBumped` (not `f`, `p`, `v`)
- Boolean flags prefixed with `is`, `has`, or `should`: `isTeamCreate`, `hasFiles`, `shouldBlock`

**Types (Markdown frontmatter):**
- PascalCase: `Agent`, `Skill`, `Hook` (when describing types)
- Plugin names use kebab-case: `claude-plugin-dev`, `wezterm-dev`

## Code Style

**Formatting:**
- No linter or formatter configured (projects are heterogeneous — plugins can have any stack)
- Spaces: 2 spaces per indentation level (observed standard in all hook files)
- Line length: Prefer readability, no strict limit enforced
- Semicolons: Required at end of statements (see all hook examples)

**Strings:**
- Single quotes for JavaScript code: `'use strict'` (see `pm-session-end.js` line 12)
- Template literals with backticks for interpolation: `` `${variable}` ``
- Avoid unnecessary string concatenation — prefer template literals

**Object/JSON:**
- 2-space indentation in JSON output: `JSON.stringify(obj, null, 2)`
- Keys unquoted in object literals where possible
- Consistent spacing: `{ key: value }` with spaces around braces

## Import Organization

**Order (CommonJS):**
```javascript
// 1. Standard library modules (Node.js built-ins)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 2. Third-party packages (rarely used, but follow same pattern)
// [third-party if any]

// 3. Environment/Config setup
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 4. Constants/Helpers (defined at module level)
const PRESERVE = [...];
function helper() { }
```

**Path Aliases:**
- Use `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PROJECT_DIR}` environment variables (not relative paths)
- These are expanded by the plugin system before hook execution
- Absolute paths preferred over relative paths in hook scripts

## Error Handling

**Strategy:** Fail-open, never block sessions

**Patterns:**
- All try-catch blocks at module level (see hook pattern in `plugin-dev-learnings.js`)
- Catch clauses are minimalist: `catch (err) { }` or `catch (_err) { }` (underscore indicates intentionally unused)
- On error: log nothing to stdout/stderr, respond with empty JSON `{}` or `{ continue: true }`
- Never throw — always exit gracefully with `process.exit(0)`
- Timeouts are specified in hook configuration: `"timeout": 10` (seconds)

**Example (from `block-manual-migration.js` lines 92-96):**
```javascript
} catch (err) {
  // On any error, allow to avoid blocking unexpectedly
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
}
```

**Hook Response Format (PreToolUse):**
```javascript
{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "allow" | "deny",
    permissionDecisionReason?: "explanation"
  }
}
```

**Hook Response Format (Stop/SessionStart):**
```javascript
{ continue: true, systemMessage?: "message" }
// OR for Stop hooks that want to prompt:
{ stopReason: "user-facing message" }
```

## Logging

**Framework:** `console.log()` for structured output, stderr avoided

**Patterns:**
- Hooks output JSON to stdout: `console.log(JSON.stringify(response))`
- Debug output goes to files, not stderr: `fs.appendFileSync(debugPath, 'message\n')`
- No structured logging library (each hook is self-contained)

**When to Log:**
- Only log to stdout if it's JSON output (required by hook system)
- Debug info in hook-specific files: `.claude/hooks/debug.log` (see `check-version-bump.js` line 123)
- Never log warnings or errors to stderr in production hooks (causes hook failures)

## Comments

**When to Comment:**
- File header with purpose: lines 5-13 (see `plugin-dev-learnings.js`)
- Complex logic blocks: explain the "why", not the "what"
- Non-obvious regex patterns: inline comment explaining the pattern
- State guards and early returns: comment the condition (e.g., "Guard: prevent infinite loop")

**JSDoc/TSDoc:**
- Not used (project is JavaScript, not TypeScript)
- Use inline comments instead of doc blocks
- For functions, comment the signature and purpose in the file header

**Example (from `block-manual-migration.js` lines 5-10):**
```javascript
// block-manual-migration.js
// PreToolUse hook that blocks manual creation of migration files in prisma/migrations/
// Forces use of 'prisma migrate dev' for proper migration management
//
// Input: JSON with tool parameters on stdin (file_path in tool_input)
// Output: JSON response with permissionDecision for PreToolUse hooks
```

## Function Design

**Size:** Typically 10-50 lines per function

**Parameters:**
- Input via stdin piped as JSON: `process.stdin.on('data', chunk => { input += chunk; })`
- Extract specific fields from JSON: `const filePath = data.tool_input?.file_path;` (optional chaining)
- No more than 2-3 complex parameters per function

**Return Values:**
- Hooks return void (exit via `process.exit(0)`)
- Helper functions return data or boolean for guards: `fileExists()` returns boolean
- JSON stringify before returning to stdout: always wrap in `JSON.stringify()`

**Guards:**
- Early returns for error conditions (see `pm-session-end.js` lines 74-88)
- Check preconditions before main logic
- Pattern: `if (!condition) { respond/exit; }`

## Module Design

**Exports:**
- Hook scripts don't export (they run as standalone scripts via shebang)
- Utility scripts export functions via `module.exports` (if any)
- Each script is responsible for its own input/output

**File Structure (Hook Pattern):**
```javascript
#!/usr/bin/env node       // (or polyglot shebang)
// File header comment
const fs = require('fs');  // Imports
const helper = () => {};   // Helper functions
let input = '';            // Stdin accumulator
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('error', () => { respond/exit; });
process.stdin.on('end', () => { main logic; });
```

**Barrel Files:**
- Not used (hooks are standalone, skills are flat files)

## Markdown Conventions

**Frontmatter (SKILL.md):**
```yaml
---
name: skill-name
description: One-line description with trigger phrases
version: X.Y.Z  # Must match plugin version
---
```

**Frontmatter (AGENT.md):**
```yaml
---
name: agent-name
description: |
  Multi-line description with examples
  Uses <example> blocks for trigger guidance
tools:
  - ToolName
  - OtherTool
model: haiku | opus | sonnet
color: green | blue | etc
---
```

**Frontmatter (Command):**
```yaml
---
name: command-name
description: What the command does
allowed-tools: Tool1, Tool2, Tool3
---
```

**Conventions:**
- Links to specific files use backticks: `` `path/to/file.ts` ``
- Code blocks use triple backticks with language: `` ```javascript `` or `` ```bash ``
- Tables for comparisons or reference data
- Trigger phrases in skill descriptions help Claude decide when to invoke them

## Cross-Cutting Concerns

**Logging:** Debug to files (`.cache/debug.log` or `.claude/hooks/debug.log`), JSON to stdout

**Validation:**
- Input validation: null checks with optional chaining `?.`
- File existence: `fs.existsSync(path)`
- JSON parsing: wrap in try-catch
- Pattern matching: precompiled regex constants at module level

**Authentication:**
- Env vars for secrets: never hardcode keys
- Reading from files: use `process.env.HOME` or `process.env.USERPROFILE`
- Cache paths: `path.join(os.homedir(), '.claude', ...)`

**Path Handling:**
- Cross-platform: normalize with `path.join()` and `.replace(/\\/g, '/')`
- Git paths: use forward slashes in git commands
- Windows compatibility: handle both `\` and `/`

---

*Convention analysis: 2026-03-10*
