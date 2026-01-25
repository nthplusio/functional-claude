# New Plugin Checklist

Use this checklist when adding a new plugin to functional-claude.

## Required Files

- [ ] `plugins/<name>/.claude-plugin/plugin.json` with name, version, description
- [ ] At least one skill in `plugins/<name>/skills/<skill>/SKILL.md`
- [ ] Entry in `.claude-plugin/marketplace.json` plugins array

## Optional Files

- [ ] `plugins/<name>/hooks/hooks.json` for plugin-specific hooks
- [ ] `plugins/<name>/skills/<skill>/references/` for detailed documentation
- [ ] `plugins/<name>/skills/<skill>/examples/` for working examples

## Version Sync Check

- [ ] Version in `plugin.json` matches `marketplace.json`
- [ ] Version in `SKILL.md` frontmatter matches (if present)

## Content Quality

- [ ] SKILL.md has valid YAML frontmatter with name and description
- [ ] Description uses third person ("This skill should be used when...")
- [ ] Description includes specific trigger phrases
- [ ] SKILL.md body is lean (1,500-2,000 words)
- [ ] Detailed content moved to references/

## Security Check

- [ ] No API keys, tokens, or credentials
- [ ] No .env files or environment configurations
- [ ] No personal information or private data
- [ ] No internal URLs or private endpoints

## Testing

- [ ] Plugin loads with `claude --plugin-dir ./plugins/<name>`
- [ ] Skill triggers on expected phrases
- [ ] Hooks function correctly (if any)
