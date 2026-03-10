# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- JavaScript - Plugin hooks, version management scripts
- Markdown - Skill documentation, plugin manifests, agent definitions
- JSON - Configuration, plugin definitions, marketplace metadata
- Shell - Polyglot shebangs for cross-platform hook execution

**Ecosystem Focus:**
- TypeScript - Referenced extensively in plugin skills and guides (shadcn-dev, prisma-dev, opentui-dev, claude-plugin-dev)
- Python - Referenced in code-quality plugin (pyproject.toml detection, ruff linting)
- Rust - Referenced in code-quality plugin (.golangci.yml, rustfmt.toml)
- Go - Referenced in code-quality plugin linting support

## Runtime

**Environment:**
- Node.js - Hook execution, version sync scripts
- Polyglot shebang support - Executes shell on macOS/Linux, node on Windows

**Package Manager:**
- npm/yarn/pnpm/bun - Detected per project via package managers in code-quality plugin
- No root-level package.json (this is a plugin marketplace, not a Node app)

## Frameworks

**Core:**
- Claude Code Plugin Framework - All 15 plugins target Claude Code (claude.ai/code) environment
- Claude MCP (Model Context Protocol) - Referenced for external tool integration in claude-plugin-dev plugin

**Testing:**
- No testing framework enforced at marketplace level (each plugin documents its own patterns)

**Build/Dev:**
- Marketplace schema validation - JSON schema at `https://anthropic.com/claude-code/marketplace.schema.json`
- Version synchronization hook - `check-version-bump.js` validates version consistency across 4 locations before git commits

## Key Dependencies

**Runtime:**
- Node.js built-ins: `child_process`, `fs`, `path` - Used in hooks and scripts
- No external npm dependencies at marketplace level

**Infrastructure:**
- Git - Version control with custom pre-commit hooks for version validation
- GitHub - Source control and integration point for project-manager and repo-sme plugins

## Configuration

**Environment:**
- Project configuration stored in user home: `~/.claude/project-manager/projects.json`
- Repo registry (repo-sme): `~/.claude/repo-sme/registry.json`
- Gemini settings: `~/.gemini/settings.json`
- Hook debug logs: `.claude/hooks/debug.log`

**Build:**
- `.claude-plugin/marketplace.json` - Root manifest listing all 15 plugins with versions, descriptions, and sources
- Individual plugin manifests: `plugins/<name>/.claude-plugin/plugin.json` (name, version, description)
- Plugin hooks: `plugins/<name>/hooks/hooks.json` - PreToolUse, PostToolUse, SessionStart, Stop events

**Version Sync Points:**
The `check-version-bump.js` hook enforces version consistency across these 4 locations:
1. `plugins/<name>/.claude-plugin/plugin.json` - Primary source
2. `.claude-plugin/marketplace.json` - Marketplace listing
3. `plugins/<name>/skills/*/SKILL.md` - Skill frontmatter version
4. `docs/memory.md` - Plugin table row

## Platform Requirements

**Development:**
- Git repository with remote origin
- Node.js (v14+) for hook execution and scripts
- Bash shell for hook shebangs (cross-platform polyglot execution)
- Access to user home directory for credential/config storage

**Production/Installation:**
- Claude Code (claude.ai/code) - Target platform for all plugins
- User installation via marketplace: `/plugin marketplace add nthplusio/functional-claude` then `/plugin install <plugin>@functional-claude`
- GitHub credentials for project-manager plugin (stored per-repo in user config)
- Google API credentials for gemini-cli plugin (optional, supports API key or OAuth)

## Marketplace Schema

**Reference:** `https://anthropic.com/claude-code/marketplace.schema.json`

**Current Plugins (15 total):**
- **Terminal Config:** wezterm-dev, hyper-dev, tabby-dev
- **Dev Workflows:** prisma-dev, shadcn-dev, opentui-dev, code-quality, dev-workflow
- **Plugin Authoring:** claude-plugin-dev, agent-teams
- **External Integration:** gemini-cli, project-manager, repo-sme, session-insights, obsidian-dev

---

*Stack analysis: 2026-03-10*
