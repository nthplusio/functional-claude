# External Integrations

**Analysis Date:** 2026-03-10

## APIs & External Services

**Google Gemini:**
- Gemini CLI integration (`gemini-cli` plugin, v0.6.9)
  - SDK/Client: `@google/gemini-cli` (npm package or npx)
  - Auth: `GEMINI_API_KEY` (API key), `GOOGLE_APPLICATION_CREDENTIALS` (service account), or OAuth via `gemini auth login`
  - Models: `gemini-3-pro-preview` (preferred), `gemini-2.5-pro` (fallback), `gemini-3-pro-image-preview` (image generation)
  - Purpose: Large context review, batch processing, image generation via nano-banana extension
  - Settings file: `~/.gemini/settings.json` with preview features flag
  - Reference: `plugins/gemini-cli/skills/gemini-cli/SKILL.md`

**GitHub:**
- GitHub API integration via project-manager plugin (`project-manager`, v0.7.0)
  - Purpose: PR creation, branch operations, issue linking
  - Auth: Per-repo GitHub credentials stored in `~/.claude/project-manager/projects.json`
  - Integration: Session-start hook detects git repo, switches GitHub context
  - Reference: `plugins/project-manager/hooks/pm-session-start.js`
- GitHub repository cloning via repo-sme plugin (`repo-sme`, v0.2.3)
  - Purpose: Local repo analysis for API docs, architecture patterns
  - Auth: SSH or HTTPS (uses git credentials)
  - Registry: `~/.claude/repo-sme/registry.json`
  - Storage: Cloned repos in `~/.claude/repo-sme/repos/`
  - Reference: `plugins/repo-sme/skills/repo-sme/SKILL.md`

**Linear:**
- Linear issue management via project-manager plugin (`project-manager`, v0.7.0)
  - Integration: Claude MCP server (Model Context Protocol)
  - Purpose: Issue lifecycle, session briefings, branch naming with Linear IDs
  - Auth: Linear MCP validates on session start, cached fallback in `~/.claude/project-manager/cache/<slug>/context.json`
  - Branch naming: `feat/ENG-42-description` format with Linear issue ID extraction
  - Reference: `plugins/project-manager/skills/project-manager/SKILL.md`

## Data Storage

**Databases:**
- Prisma ORM integration (`prisma-dev` plugin, v0.1.11)
  - Purpose: Schema design, migration safety, query patterns
  - Client: Prisma Client (auto-generated)
  - Schema location: `prisma/schema.prisma` (user's project)
  - Migrations: `prisma/migrations/` with safety validation against manual `.sql` creation
  - Hooks: `block-manual-migration.js`, `block-db-push.js` for migration safety
  - Reference: `plugins/prisma-dev/skills/`

**File Storage:**
- Local filesystem only - No cloud storage integration detected in marketplace
- Plugins use local cache: `plugins/<name>/.cache/` (gitignored)

**Caching:**
- Plugin-level runtime caches: `.cache/` directories in each plugin (gitignored)
- User config caches:
  - `~/.claude/project-manager/cache/<slug>/context.json` - Last-known Linear issue state
  - `~/.claude/repo-sme/registry.json` - Registered repository metadata
  - `~/.gemini/settings.json` - Gemini CLI settings and model configuration

## Authentication & Identity

**Auth Provider:**
- No centralized auth provider - Each service uses its own credentials:
  - **GitHub:** SSH key or HTTPS token (standard git credentials)
  - **Linear:** Claude MCP server (API-based, validated on session start)
  - **Gemini:** API key, OAuth login, or service account JSON
  - **Obsidian:** Plugin API tokens stored in vault

**Implementation:**
- Per-repo GitHub credentials: `~/.claude/project-manager/projects.json`
- Linear MCP server: Built-in to Claude Code, no explicit credential storage
- Environment variable patterns:
  - `GEMINI_API_KEY` - Gemini API authentication
  - `GOOGLE_APPLICATION_CREDENTIALS` - Vertex AI service account
  - `GOOGLE_CLOUD_PROJECT` - GCP project ID
  - `NANOBANANA_GEMINI_API_KEY` - Alternative Gemini key for nano-banana extension

## Monitoring & Observability

**Error Tracking:**
- None detected at marketplace level
- Individual plugins may use CLI error handling (e.g., Gemini CLI fallback models)

**Logs:**
- Hook debug logs: `.claude/hooks/debug.log` (version-bump validation)
- Gemini CLI session logs: Part of interactive CLI output (non-persistent)
- Project-manager session logs: Hook output only (no persistent logging configured)

## CI/CD & Deployment

**Hosting:**
- GitHub public repository: `nthplusio/functional-claude`
- Claude Code Marketplace: Installed via `/plugin marketplace add nthplusio/functional-claude`

**CI Pipeline:**
- None detected (no GitHub Actions workflows)
- Pre-commit hook validation: `check-version-bump.js` validates version consistency before git commits
- Manual version sync: `scripts/sync-version.js` for updating all 4 version sync points

## Environment Configuration

**Required env vars (conditional by plugin):**

**Gemini CLI (optional for image generation):**
- `GEMINI_API_KEY` - API key authentication (simplest)
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account path (Vertex AI)
- `GOOGLE_CLOUD_PROJECT` - GCP project ID (Vertex AI)
- `NANOBANANA_GEMINI_API_KEY` - Alternative key for image generation
- `NANOBANANA_MODEL` - Model override for image generation

**GitHub (optional for project-manager):**
- Stored in `~/.claude/project-manager/projects.json`, not in env vars

**Linear (optional for project-manager):**
- Accessed via Claude MCP, no env var configuration needed

**Secrets location:**
- User home: `~/.claude/` - Project manager, repo-sme registry
- Git credentials: Standard git credential helper
- API keys: Environment variables (not committed to repo)
- Sensitive data blocking: Pre-commit hook in `.claude/settings.json` prevents committing API keys, tokens, secrets

## Webhooks & Callbacks

**Incoming:**
- GitHub PR webhooks: Supported by project-manager (PR linking to Linear)
- None explicitly configured in marketplace

**Outgoing:**
- Linear issue updates: project-manager writes issue state on session start/end
- GitHub PR creation: project-manager can create PRs with Linear issue links
- No persistent webhook infrastructure (event-driven via hooks only)

## Hook Integration Points

**SessionStart Hooks:**
- `pm-session-start.js` (project-manager) - Detects repo, switches GitHub context, injects project context
- `tabby-session-start.js` (tabby-dev) - Detects version, refreshes caches
- `plugin-dev-session-start.js` (claude-plugin-dev) - Cache refresh for plugin development
- `gemini-session-start.js` (gemini-cli) - Validates Gemini settings, enables preview features

**PreToolUse Hooks:**
- `check-version-bump.js` (marketplace root) - Validates version sync before git commits, auto-syncs files
- `verify-tabby-backup.js` (tabby-dev) - Verifies backup before edits
- `verify-hyper-backup.js` (hyper-dev) - Verifies backup before edits
- `block-manual-migration.js` (prisma-dev) - Blocks manual SQL creation in migrations/
- `block-db-push.js` (prisma-dev) - Blocks `prisma db push` on projects with migrations

**PostToolUse Hooks:**
- `remind-migrate-after-schema-change.js` (prisma-dev) - Reminds to run migrations after schema edits

**Stop Hooks:**
- `pm-session-end.js` (project-manager) - Prompts for session wrap-up, updates Linear if configured
- `check-tabby-learnings.js` (tabby-dev) - Captures learnings from session
- `check-hyper-learnings.js` (hyper-dev) - Captures learnings from session
- `plugin-dev-learnings.js` (claude-plugin-dev) - Captures plugin development learnings
- `check-prisma-learnings.js` (prisma-dev) - Captures schema/migration learnings

## MCP Integration

**Model Context Protocol Servers:**
- **Linear MCP** - Managed by Claude Code (built-in)
  - Tools: `get_user`, `list_teams`, issue query/create/update
  - Reference: `plugins/project-manager/skills/project-manager/SKILL.md`
  - Validation: At skill start, verify MCP responds before proceeding

**No explicit .mcp.json files detected** - All MCP integration is via Claude Code's built-in servers or implicit integration

---

*Integration audit: 2026-03-10*
