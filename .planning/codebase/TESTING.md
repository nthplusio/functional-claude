# Testing Patterns

**Analysis Date:** 2026-03-10

## Test Framework

**Status:** No formal test framework in use

**Why:**
- Codebase consists of hook scripts and documentation
- Hook scripts are event-driven (SessionStart, Stop, PreToolUse) and run in Claude Code environment
- Testing would require mocking Claude Code's plugin system itself
- Instead: plugins use manual validation and skill reviewers (autonomous agents)

**Validation Approach:**
- Pre-publish validation via `plugin-validator` agent: `plugins/claude-plugin-dev/agents/plugin-validator.md`
- Hook syntax validation: `check-version-bump.js` PreToolUse hook
- Skill convention checking: `skill-reviewer.md` agent

**Run Commands:**
```bash
# No automated test suite
# Instead: use validation agents in Claude Code

# Manual: Use plugin-validator agent when completing a plugin
/claude-plugin-dev:plugin-validator

# Manual: Check plugin status and version sync
/plugin-status [plugin-name]

# Manual: Test a plugin locally in Claude Code
claude --plugin-dir ./plugins/wezterm-dev
```

## Validation Strategy

**Instead of unit tests, this codebase uses:**

### 1. Pre-Commit Hook Validation (check-version-bump.js)

**Location:** `.claude/hooks/check-version-bump.js`

**What it validates:**
- When code changes are committed, version in `plugin.json` must be bumped
- Auto-syncs version to 3 other locations on success:
  - `marketplace.json`
  - `SKILL.md` frontmatter
  - `docs/memory.md` plugin table
- Blocks commit with detailed reason if version wasn't bumped

**Validation Logic (lines 189-281):**
```javascript
// For each modified plugin:
1. Get version from plugin.json
2. Compare with last commit's version
3. Categorize file changes as "significant" vs "trivial":
   - Significant: SKILL.md, agents/*.md, hooks.json, hooks/*.js, plugin.json, .mcp.json, commands/*.md
   - Trivial: README.md, .gitignore, .cache/, references/*.md, examples/
4. If version not bumped BUT significant files changed → deny commit
5. If version WAS bumped → auto-stage synced files
```

**Error Handling Pattern:**
```javascript
// Fail open — never block session
try {
  // validation logic
} catch (err) {
  respond("allow", "Error during check, allowing to avoid blocking");
}
```

### 2. Plugin Validator Agent

**Location:** `plugins/claude-plugin-dev/agents/plugin-validator.md`

**Purpose:** Autonomous validation before publishing

**Checklist (from agent lines 44-73):**
- Structure: `.claude-plugin/plugin.json` exists, has name/version/description
- Version format: Follows semver (MAJOR.MINOR.PATCH)
- Skills: Located in `skills/skill-name/SKILL.md`, match directory name, description has trigger phrases
- Agents: Located in `agents/agent-name/agent.md`, has name/description, tools list appropriate
- Hooks: Located in `hooks/hooks.json`, uses `${CLAUDE_PLUGIN_ROOT}`, timeout values reasonable
- MCP: Located in `.mcp.json`, server commands valid, env vars use `${VAR}` syntax

**Validation Process:**
1. Read plugin.json to understand the plugin
2. List all directories to identify components
3. For each component type found: check file locations and conventions
4. Verify all referenced files exist
5. Report findings with recommendations

### 3. Skill Reviewer Agent

**Location:** `plugins/claude-plugin-dev/agents/skill-reviewer.md`

**Purpose:** Review skill content for quality and correctness

**Checks:**
- Description has trigger phrases (helps Claude invoke at right time)
- Skill names match directory names
- File size < 2000 words (keeps skills focused)
- Referenced files in `references/` exist
- Code examples are correct
- Instructions are clear and action-oriented

### 4. Hook-Specific Validation

**Pattern (from all hook files):**
```javascript
// Input validation
const data = JSON.parse(input || '{}');

// Guard conditions
if (!data.transcript_path || !fs.existsSync(data.transcript_path)) {
  console.log(JSON.stringify({}));
  process.exit(0);
}

// Type checking with optional chaining
const filePath = data.tool_input?.file_path;
if (!filePath) {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
}
```

## Test File Organization

**Not Applicable:** No test files present

**If tests were added:**
- Co-locate with source: `plugins/<name>/hooks/<hook-name>.test.js`
- Use Jest or Vitest
- Mock: stdin/stdout, fs module, environment variables

## Validation Scenarios

### Hook Scenario: Permission Decision

**Example Hook** (from `block-manual-migration.js`):
```javascript
// Test case 1: File NOT in prisma/migrations/ → allow
// Test case 2: File in prisma/migrations/ but is allowed file (README.md) → allow
// Test case 3: File in prisma/migrations/ and is .sql file → deny with reason
// Test case 4: No file_path in input → allow
// Test case 5: Parse error on input → allow
```

**Manual Validation:**
1. Try creating a file in `prisma/migrations/` directory
2. Expect hook to deny with helpful error message
3. Try creating README.md in same directory
4. Expect hook to allow
5. Try with corrupted stdin
6. Expect graceful allow (fail-open)

### Hook Scenario: Version Sync

**Example Hook** (from `check-version-bump.js`):
```javascript
// Test case 1: Commit non-plugin files → allow
// Test case 2: Commit plugin code WITHOUT version bump → deny
// Test case 3: Commit plugin code WITH version bump → allow AND auto-stage synced files
// Test case 4: New plugin (no previous commit) → allow
// Test case 5: git command is not commit → allow
```

**Manual Validation:**
1. Modify a skill file without bumping plugin.json version
2. Try to commit → blocked with version message
3. Bump version in plugin.json
4. Try to commit again → allowed, marketplace.json and memory.md auto-synced
5. Verify git status shows new staged files

### Skill Scenario: Trigger Coverage

**Example** (from `tabby-dev` main skill):
- Trigger phrases listed in skill description
- Agent should invoke when user says any trigger phrase
- If trigger phrase missing, skill is harder to discover

**Manual Validation:**
1. Ask Claude about "configure Tabby" → should invoke `tabby-dev` skill
2. Ask about "tabby theme" → should invoke `tabby-visual` focused skill
3. Ask about "ssh profile" → should invoke `tabby-connections` focused skill

## Testing Patterns (Used in Validation)

### Pattern 1: Guard Clauses

**Where:** Every hook file

**Purpose:** Prevent cascading errors

**Example (from `pm-session-end.js` lines 74-88):**
```javascript
// No transcript → nothing to scan
const transcriptPath = data.transcript_path;
if (!transcriptPath || !fs.existsSync(transcriptPath)) {
  console.log(JSON.stringify({}));
  process.exit(0);
  return;
}
```

**Test by:** Passing stdin with missing or invalid transcript_path

### Pattern 2: Regex Pattern Matching

**Where:** Hooks that scan transcripts or files

**Purpose:** Detect work categories, file patterns, and intent

**Example (from `plugin-dev-learnings.js` lines 61-88):**
```javascript
const patterns = {
  structure: /\.claude-plugin|plugin\.json|SKILL\.md|AGENT\.md/i,
  skills: /claude-plugin-dev|plugin-structure|skill-development/i,
  hookEvents: /PreToolUse|PostToolUse|SessionStart|SessionEnd/i
};

let matched = false;
for (const [category, pattern] of Object.entries(patterns)) {
  if (pattern.test(transcript)) {
    matched = true;
    matchedCategories.push(category);
  }
}
```

**Test by:** Creating transcript with/without matching keywords

### Pattern 3: Optional Chaining & Null Checks

**Where:** All hooks handling tool_input

**Purpose:** Safely access nested fields without crashes

**Example (from `block-manual-migration.js` lines 26-33):**
```javascript
const filePath = data.tool_input?.file_path;

// If no file_path found, allow (not a file operation we care about)
if (!filePath) {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
}
```

**Test by:** Passing malformed JSON, missing properties

### Pattern 4: Path Normalization

**Where:** Hooks that check file locations

**Purpose:** Handle Windows and Unix paths uniformly

**Example (from `block-manual-migration.js` lines 35-39):**
```javascript
// Normalize path for comparison (handle Windows and Unix paths)
const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

// Check if this is in a prisma/migrations directory
if (!normalizedPath.includes('prisma/migrations/') && !normalizedPath.includes('prisma\\migrations\\')) {
  console.log(JSON.stringify({ permissionDecision: "allow" }));
  process.exit(0);
}
```

**Test by:** Creating files with Windows paths (`C:\proj\prisma\migrations\...`)

### Pattern 5: Configuration File Detection

**Where:** Reconnaissance hooks (SessionStart)

**Purpose:** Detect what tools are configured in the project

**Example (from `code-quality-recon.js` lines 73-79):**
```javascript
function fileExists(relativePath) {
  return fs.existsSync(path.join(projectDir, relativePath));
}

// Detect ecosystems
if (fileExists('package.json')) recon.ecosystems.push('javascript');
if (fileExists('tsconfig.json')) recon.ecosystems.push('typescript');
if (fileExists('pyproject.toml') || fileExists('setup.py')) recon.ecosystems.push('python');
```

**Test by:** Creating dummy config files, observing recon output

## Coverage

**Unit Tests:** None (hook-based architecture makes unit testing impractical)

**Integration Points:**
- Hook system (Claude Code plugin system — tested via manual plugin load)
- Git integration (tested via `git diff`, `git show` commands in check-version-bump.js)
- File system (tested via fs.existsSync, fs.readFileSync)

**What's NOT Tested:**
- Stdin/stdout piping (tested manually in Claude Code)
- Hook response format (verified by hook system when it parses JSON)
- Permission decisions (verified when user tries to trigger blocked action)

## Pre-Publish Checklist

**Use before committing new plugins or major changes:**

1. Run the `plugin-validator` agent: `/claude-plugin-dev:plugin-validator`
2. Check plugin status: `/plugin-status <plugin-name>`
3. Verify version was bumped: Look for version field in `plugin.json`
4. Inspect hook test scenarios:
   - Load plugin locally: `claude --plugin-dir ./plugins/<name>`
   - Trigger hook events (SessionStart, Stop, or test PreToolUse guards)
   - Verify no stack traces, graceful exit on errors
5. Run skill reviewer agent on new skills: `/claude-plugin-dev:skill-reviewer`
6. Manually test in Claude Code:
   - Ask trigger phrases → correct skill should invoke
   - Load plugin → all files should be accessible
   - Trigger hooks → should complete without errors

---

*Testing analysis: 2026-03-10*
