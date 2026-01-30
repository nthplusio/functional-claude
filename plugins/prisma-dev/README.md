# prisma-dev

A Claude Code plugin for working with Prisma ORM, providing schema analysis, migration safety, and query guidance.

## Features

- **Schema Reconnaissance**: Automatically analyzes Prisma schema on session start
- **Migration Safety**: Blocks manual migration file creation, enforcing use of `prisma migrate`
- **Focused Skills**: Modular skills for schema design, migrations, and queries
- **Troubleshooting Agent**: Autonomous debugging for Prisma issues

## Installation

### From Marketplace

```
/plugin marketplace add nthplusio/functional-claude
/plugin install prisma-dev@functional-claude
```

### Local Development

```bash
claude --plugin-dir ./plugins/prisma-dev
```

## Skills

| Skill | Trigger Phrases | Purpose |
|-------|-----------------|---------|
| prisma-dev | "configure prisma", "prisma orm" | Overview and general guidance |
| prisma-schema | "prisma model", "schema.prisma", "relations" | Schema design and syntax |
| prisma-migrations | "prisma migrate", "migration" | Migration workflows |
| prisma-queries | "prisma client", "findMany", "create" | Query patterns and CRUD |
| prisma-recon | "analyze prisma", "schema recon" | Repository analysis |

## Agents

| Agent | Trigger Phrases | Purpose |
|-------|-----------------|---------|
| prisma-troubleshoot | "prisma not working", "prisma error", "P2002" | Autonomous debugging |

## Hooks

### PreToolUse: Migration Blocking

Blocks manual creation of `.sql` files and `migration_lock.toml` in `prisma/migrations/`.

**Allowed files:**
- README.md
- .gitkeep
- .gitignore

**Blocked files:**
- *.sql
- migration_lock.toml

When blocked, provides instructions to use `npx prisma migrate dev --name <name>`.

### SessionStart: Schema Recon

On session start, analyzes the Prisma schema and caches:
- Datasource configuration
- Generator settings
- Model definitions with fields and relations
- Enum definitions
- Migration status

Cache is stored in `.cache/recon.json` and refreshes every hour.

## Usage Examples

### General Prisma Work

```
User: How do I set up Prisma in my project?
Claude: [Loads prisma-dev skill with setup instructions]
```

### Schema Design

```
User: I need to add a many-to-many relationship between posts and tags
Claude: [Loads prisma-schema skill with relation patterns]
```

### Migration Safety

```
User: Create a migration file for adding an email column
Claude: [Attempts to create file, hook blocks with instructions]
Claude: Run `npx prisma migrate dev --name add_email_column` to create the migration.
```

### Troubleshooting

```
User: I'm getting a P2002 error when creating users
Claude: [prisma-troubleshoot agent diagnoses unique constraint violation]
```

## Cache Directory

The plugin stores cached data in `.cache/`:
- `recon.json` - Repository schema analysis
- `learnings.md` - Accumulated knowledge and patterns

Cache directory is gitignored.

## Requirements

- Node.js 16+
- Prisma CLI (`npx prisma`)
- A Prisma project with `schema.prisma`

## Version

0.1.3
