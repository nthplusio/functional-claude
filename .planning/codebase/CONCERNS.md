# Codebase Concerns

**Analysis Date:** 2026-03-10

## Tech Debt

**Version Synchronization Complexity:**
- Issue: Plugin versions must be manually kept in sync across 4 locations (plugin.json, marketplace.json, SKILL.md frontmatter, docs/memory.md). The auto-sync hook in `.claude/hooks/check-version-bump.js` attempts to enforce this but relies on regex matching and silent fallback behavior.
- Files: `.claude/hooks/check-version-bump.js`, `scripts/sync-version.js`, `.claude-plugin/marketplace.json`, `docs/memory.md`
- Impact: If any of the 4 sync locations are corrupted or out of sync, the hook silently ignores errors (lines 55, 87, 107). Users may not realize version numbers are inconsistent, leading to confusion about which version is actually deployed.
- Fix approach: Implement strict version validation with clear error reporting. Create a dedicated validation script that runs on every commit and reports all version mismatches before allowing the commit. Add unit tests for version sync logic.

**Silent Error Absorption in Hooks:**
- Issue: Multiple hook files (check-version-bump.js, pm-session-start.js, pm-session-end.js, prisma-recon.js) wrap errors in try-catch blocks that silently ignore failures (e.g., "Ignore marketplace errors", "Ignore skill errors"). This "fail open" approach prevents blocking sessions but masks real problems.
- Files: `.claude/hooks/check-version-bump.js` (lines 55, 87, 107), `plugins/project-manager/hooks/pm-session-start.js` (lines 35-38), `plugins/project-manager/hooks/pm-session-end.js` (lines 27-30), `plugins/prisma-dev/hooks/prisma-recon.js` (lines 72-74)
- Impact: When JSON parsing fails, file reads fail, or git commands fail, the hooks continue silently. Corrupt cache files, missing config, or transient errors are never reported to the user. Problems compound over time as stale data persists.
- Fix approach: Log errors to a persistent hook-error log file. On session end, summarize any errors encountered during startup. Use stderr for critical path failures while maintaining fail-open behavior.

**Monolithic Hook Files:**
- Issue: Several hook files exceed 300 lines (pm-session-end.js: 356 lines, prisma-recon.js: 310 lines, check-version-bump.js: 310 lines, tabby-session-start.js: 242 lines, hyper-session-start.js: 222 lines).
- Files: `plugins/project-manager/hooks/pm-session-end.js`, `plugins/prisma-dev/hooks/prisma-recon.js`, `.claude/hooks/check-version-bump.js`, `plugins/tabby-dev/hooks/tabby-session-start.js`, `plugins/hyper-dev/hooks/hyper-session-start.js`
- Impact: Large hook files are hard to test, maintain, and debug. The code mixes concerns (signal collection, scoring, directive building, formatting) in a single file, making isolated testing impossible.
- Fix approach: Extract signal collection (collectSignals), scoring (computeTrackingScore), and formatting (buildDirectives, formatStopReason) into separate, testable modules. Use a central hook orchestrator that composes these components.

**Regex-Based Frontmatter Parsing:**
- Issue: Version synchronization uses regex patterns to find and replace version numbers in YAML frontmatter (`/^version:\s*.+$/m`). If frontmatter format varies, the regex fails silently.
- Files: `.claude/hooks/check-version-bump.js` (lines 73-81), `scripts/sync-version.js` (lines 88-100)
- Impact: If a SKILL.md file has non-standard frontmatter (extra spaces, different key order, missing version), the regex won't match, version won't sync, but no error is reported. Over time, skills drift out of version sync.
- Fix approach: Use a proper YAML parser (js-yaml or similar) instead of regex. Validate frontmatter structure against a schema before attempting modifications.

**No Test Coverage:**
- Issue: The codebase contains no automated tests (.test.js, .spec.js, or test files).
- Files: Entire hooks directory, all scripts
- Impact: Hooks and scripts modify the user's environment (staging files, deleting cache, writing config). Changes are risky and regressions go undetected until users report issues.
- Fix approach: Add unit test framework (Jest, Vitest, or Mocha). Test hooks in isolation with mocked filesystem and git operations. Add integration tests for complex flows (version bump, session start/end).

## Known Bugs

**Hook Debug Log Accumulation:**
- Symptoms: The check-version-bump hook writes to `.claude/hooks/debug.log` indefinitely (line 124). The log grows without bound and is never rotated or cleaned.
- Files: `.claude/hooks/check-version-bump.js` (line 124)
- Trigger: Run any git commit command with staged plugin files
- Workaround: Manually delete `.claude/hooks/debug.log` when it grows too large (no automatic cleanup)

**Stale Cleanup Edge Case with Preserved Directories:**
- Symptoms: The stale-cleanup hook may fail to clean some files if a directory prefix is preserved but sub-files are added outside the manifest.
- Files: `plugins/agent-teams/hooks/stale-cleanup.js` (lines 59-60, 99-100)
- Trigger: Add files to a preserved directory, then delete them from the manifest, then update the plugin
- Workaround: Manually delete unwanted files from the preserved directory

**Cache Expiration Logic Uses Hard-Coded Timeouts:**
- Symptoms: Multiple hooks use hard-coded cache expiration times (1 hour in prisma-recon.js, 24 hours in pm-session-end.js, version check on each commit in check-version-bump.js) with no user configuration.
- Files: `plugins/prisma-dev/hooks/prisma-recon.js` (line 42), `plugins/project-manager/hooks/pm-session-end.js` (line 337)
- Trigger: Work on multiple projects rapidly; cache ages out unpredictably
- Workaround: No workaround; users cannot customize cache expiration

## Security Considerations

**File Path Traversal in Stale Cleanup:**
- Risk: The stale-cleanup hook walks the plugin directory using relative paths (line 57). If an attacker can control the preserve list in plugin-manifest.json, they could preserve unexpected directories.
- Files: `plugins/agent-teams/hooks/stale-cleanup.js` (lines 47-69)
- Current mitigation: The hook uses relative paths and checks against a preserved list, so traversal is limited to within the plugin directory
- Recommendations: Add explicit validation that all preserved paths stay within `pluginRoot`. Reject any paths containing `..` or absolute paths.

**Arbitrary Code Execution via Git Commands:**
- Risk: Multiple hooks execute git commands using execFileSync without strict argument validation. If user input (branch names, commit messages) is passed to git commands, command injection is possible.
- Files: `plugins/project-manager/hooks/pm-session-start.js` (line 93), `plugins/project-manager/hooks/pm-session-end.js` (line 143), `plugins/repo-sme/hooks/repo-sme-session-start.js`
- Current mitigation: Git commands are called with fixed arguments (no user input in command args), so injection risk is low. However, cwd parameter could be controlled by hook input.
- Recommendations: Validate cwd is a valid directory path before passing to execFileSync. Reject paths containing suspicious characters or `..`.

**JSON Parsing Without Type Validation:**
- Risk: Multiple hooks parse JSON from untrusted sources (user cache, plugin manifests) without validating structure. Malformed JSON or unexpected fields could cause unexpected behavior.
- Files: `.claude/hooks/check-version-bump.js` (line 48), `plugins/project-manager/hooks/pm-session-start.js` (line 74), `plugins/agent-teams/hooks/dedup-guard.js` (line 75)
- Current mitigation: Most files use try-catch to ignore parse errors, so invalid JSON doesn't crash the process
- Recommendations: Define JSON schemas for all config files. Use a validation library (zod, joi) to check structure before using parsed data.

## Performance Bottlenecks

**File System Traversal in Stale Cleanup:**
- Problem: The stale-cleanup hook recursively walks the entire plugin directory (lines 47-69). For large plugins with many files, this could be slow on slow storage.
- Files: `plugins/agent-teams/hooks/stale-cleanup.js` (lines 47-69)
- Cause: No early exit or filtering before traversal; walks all files including potentially large node_modules or similar
- Improvement path: Add a file count threshold. If the plugin has many files, skip cleanup or cache the walk result. Filter out known large directories (node_modules, .git) before traversal.

**Repeated Git Diff Calculations:**
- Problem: The pm-session-end hook calls `git diff --stat` and `git diff --diff-filter=A` separately (lines 148, 163) instead of combining them into a single git command.
- Files: `plugins/project-manager/hooks/pm-session-end.js` (lines 148-165)
- Cause: Each diff operation rescans the entire commit history from sessionStartHead to HEAD
- Improvement path: Combine git commands or cache diff results. Use `git diff --raw --name-status` to get all changes in one pass.

**Memory Usage in Session Insights Scripts:**
- Problem: The session-insights scripts (extract-session.js: 257 lines, list-sessions.js: 175 lines, aggregate-stats.js: 214 lines) may load entire session history into memory for processing.
- Files: `plugins/session-insights/scripts/extract-session.js`, `plugins/session-insights/scripts/list-sessions.js`, `plugins/session-insights/scripts/aggregate-stats.js`
- Cause: No streaming processing; scripts likely read full JSONL files into arrays before iterating
- Improvement path: Process session files as streams. Yield results incrementally instead of accumulating in memory.

## Fragile Areas

**Version Synchronization System:**
- Files: `.claude/hooks/check-version-bump.js`, `scripts/sync-version.js`, `.claude-plugin/marketplace.json`, `docs/memory.md`, all plugin SKILL.md files
- Why fragile: The system depends on 4 independent files staying in sync. There are multiple ways to break it:
  1. Direct edits to marketplace.json without running sync-version.js
  2. Merge conflicts in marketplace.json that don't trigger the hook
  3. SKILL.md files with non-standard frontmatter that regex doesn't match
  4. docs/memory.md table edited manually, breaking the row regex
  5. Plugin renamed without updating all 4 locations
- Safe modification: Before any version-related changes, run `node scripts/sync-version.js` explicitly. Add pre-commit validation (beyond the current hook) that verifies all 4 locations match before allowing commit.
- Test coverage: Add tests that verify all 4 locations are updated when any one changes. Test edge cases: missing SKILL.md, malformed frontmatter, table rows with different formatting.

**Project Manager Cache and Context Matching:**
- Files: `plugins/project-manager/hooks/pm-session-start.js` (lines 312-355), `plugins/project-manager/hooks/pm-session-end.js` (lines 100-189)
- Why fragile: The context is matched by remote URL normalization. If a repo URL format changes or is ambiguous, the wrong project context loads. The backup fallback is "newest by loadedAt", which can be wrong if multiple projects are accessed in rapid succession.
- Safe modification: When modifying context matching logic, add explicit logging of which context was selected and why. Test with multiple repos having similar URLs (different orgs with same repo name).
- Test coverage: Test context matching with edge cases: missing .git, detached HEAD, multiple remotes, SSH vs HTTPS URLs.

**Session Start Hook Initialization Order:**
- Files: All SessionStart hooks (pm-session-start.js, prisma-recon.js, wezterm-session-start.js, hyper-session-start.js, tabby-session-start.js)
- Why fragile: Multiple hooks may depend on each other (e.g., pm-session-start sets GitHub credentials before other tools run). If hooks run in wrong order, context is lost. The hook execution order is not documented.
- Safe modification: Document hook execution order explicitly. Add explicit dependencies between hooks (e.g., pm-session-start must run before anything that needs GitHub auth).
- Test coverage: Test running hooks in different orders. Verify that context from one hook is available to dependent hooks.

**Agent Teams Dedup Guard Logic:**
- Files: `plugins/agent-teams/hooks/dedup-guard.js` (lines 57-65)
- Why fragile: The dedup guard detects tool type by checking for specific fields (teamName, prompt, name). If the tool input structure changes, detection fails. The guard silently allows through unrecognized patterns, which could be duplicate operations that should have been blocked.
- Safe modification: When adding new team operations, update the tool type detection logic. Add explicit logging of which operation was detected.
- Test coverage: Test dedup guard with actual TeamCreate and teammate spawn inputs. Test edge cases: missing fields, extra fields, null values.

## Scaling Limits

**Version Synchronization with Many Plugins:**
- Current capacity: 15 plugins (as of docs/memory.md)
- Limit: The version sync regex patterns work plugin-by-plugin but don't scale if plugins are added frequently. The check-version-bump hook reads marketplace.json fully into memory for each commit.
- Scaling path: If adding 100+ plugins, rewrite to use streaming JSON parsing and batch updates. Instead of updating each location separately, collect all changes and write once.

**Hook Execution Time at Session Start:**
- Current capacity: Multiple hooks run sequentially on session start (pm-session-start, prisma-recon, wezterm-session-start, etc.)
- Limit: Each hook that calls git or filesystem operations adds 100-500ms. With 10+ hooks, session start could take 2-5 seconds.
- Scaling path: Parallelize SessionStart hooks that don't depend on each other. Use Promise.all for concurrent hooks instead of sequential execution.

**Cache Directory Growth:**
- Current capacity: `.cache/` directories across all plugins accumulate session data, recon results, and learnings
- Limit: No cleanup mechanism exists beyond the stale-cleanup hook (which only removes files not in the manifest). Cache could grow to gigabytes over months of use.
- Scaling path: Implement cache size limits with LRU eviction. Add a background cleanup job that removes cache older than 30 days. Document cache retention policy.

## Dependencies at Risk

**Node.js Runtime Compatibility:**
- Risk: All hooks are written in Node.js with no version pinning. Some use polyglot shebangs to find node dynamically, others rely on PATH.
- Impact: If node version changes significantly, older syntax or APIs might break. The project uses `require()` (CommonJS) which is deprecated in favor of ES modules in Node 18+.
- Migration plan: Pin Node version in .nvmrc or similar. Document minimum and maximum supported Node versions. Gradually migrate to ES modules.

**Regex Patterns for File Matching:**
- Risk: Multiple files use regex for critical operations (version sync, stale cleanup, git diff filtering)
- Impact: If regex patterns are incomplete or incorrect, operations fail silently or corrupt data
- Migration plan: Add comprehensive test coverage for all regex patterns. Use a dedicated pattern library or explicit string parsing instead of complex regex.

## Missing Critical Features

**Hook Error Reporting:**
- Problem: When hooks fail, users are not notified. Errors are silently absorbed to avoid blocking sessions.
- Blocks: Users cannot diagnose why session context isn't loading, why versions didn't sync, or why cache isn't refreshing.
- Recommendations: Implement a hook error log that persists across sessions. On session end, summarize critical errors (not trivial ones like "no git repo"). Expose error log via a CLI command.

**Version Validation Before Deployment:**
- Problem: No validation ensures all 4 version sync points are correct before pushing to marketplace.
- Blocks: Marketplace could be published with mismatched versions, breaking user installations.
- Recommendations: Add a strict pre-release check that validates versions match before allowing marketplace publish. Fail hard instead of silently allowing mismatches.

**Cache Management CLI:**
- Problem: Cache accumulates in .cache/ directories with no way to inspect, clean, or invalidate it.
- Blocks: Users cannot diagnose stale cache issues or free up disk space.
- Recommendations: Add CLI commands: `claude-plugin cache-list [plugin]`, `claude-plugin cache-clear [plugin]`, `claude-plugin cache-invalidate [plugin] [pattern]`.

**Async Context Propagation:**
- Problem: Hooks are synchronous Node scripts, but may need to handle async operations (file writes, git commands). The polyglot shebangs and stdin-based input/output add complexity.
- Blocks: Hard to add async operations without major refactoring. Promise rejection handling is missing in some hooks.
- Recommendations: Consider migrating hooks to a handler library that supports async/await natively instead of stdin-based input.

## Test Coverage Gaps

**Hook Functionality:**
- What's not tested: All hooks (version sync, project manager, dedup guard, stale cleanup, recon) lack unit tests
- Files: `.claude/hooks/*.js`, `plugins/*/hooks/*.js`
- Risk: Changes to hook logic could break silently. Edge cases (missing files, corrupt JSON, git failures) are untested.
- Priority: High — hooks modify user environment and must be reliable

**Script Functionality:**
- What's not tested: sync-version.js, generate-plugin-manifest.js, and other utility scripts lack tests
- Files: `scripts/*.js`
- Risk: Version sync is unreliable and difficult to debug without automated checks
- Priority: High — versioning is critical to marketplace integrity

**Integration Between Hooks and CLI:**
- What's not tested: End-to-end flows like "bump version → auto-sync → stage files → commit"
- Files: All files in version sync system
- Risk: The entire version sync pipeline could be broken while individual parts appear to work
- Priority: Medium — critical for marketplace releases but less frequent

**Error Handling in Complex Functions:**
- What's not tested: Signal collection, score computation, and directive building in pm-session-end.js
- Files: `plugins/project-manager/hooks/pm-session-end.js` (lines 119-274)
- Risk: Subtle bugs in pattern matching or score calculation could silently produce wrong recommendations
- Priority: Medium — affects issue lifecycle management but doesn't block core functionality

---

*Concerns audit: 2026-03-10*
