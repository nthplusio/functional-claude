---
name: prisma-dev
description: This skill should be used when the user asks to "configure prisma", "prisma config", "set up prisma", "prisma orm", "work with prisma", or mentions general Prisma ORM questions. For specific topics, focused skills may be more appropriate.
version: 0.1.7
---

# Prisma Development

Configure and work with Prisma ORM in Node.js/TypeScript projects, focusing on schema design, migrations, and query patterns.

## First Actions

### 1. Check Repository Recon

Before proceeding with any Prisma work, verify the repository has been analyzed:

1. Read `${CLAUDE_PLUGIN_ROOT}/.cache/recon.json` (if it exists)
2. Check if schema location and model structure are cached
3. If missing or stale, run the prisma-recon skill to analyze the repository
4. Use cached information to provide context-aware guidance

## Prisma Project Structure

Standard Prisma setup in a project:

```
project/
├── prisma/
│   ├── schema.prisma      # Main schema file
│   ├── migrations/        # Migration history (managed by prisma migrate)
│   │   ├── 20240101_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── seed.ts           # Optional seed script
├── node_modules/
│   └── .prisma/client/   # Generated client
└── package.json
```

## Core Prisma Commands

| Command | Purpose |
|---------|---------|
| `npx prisma init` | Initialize Prisma in a project |
| `npx prisma generate` | Generate Prisma Client from schema |
| `npx prisma db push` | Push schema to database (no migration) |
| `npx prisma migrate dev` | Create and apply migration (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma studio` | Open database GUI |
| `npx prisma format` | Format schema file |

## Focused Skills

For specific Prisma topics, use these focused skills:

| Topic | Skill | Trigger Phrases |
|-------|-------|-----------------|
| Schema Design | `/prisma-dev:prisma-schema` | "prisma model", "schema.prisma", "relations", "@@index" |
| Migrations | `/prisma-dev:prisma-migrations` | "prisma migrate", "migration", "database changes" |
| Queries | `/prisma-dev:prisma-queries` | "prisma client", "findMany", "create", "transactions" |
| Repository Analysis | `/prisma-dev:prisma-recon` | "analyze prisma", "prisma setup", "schema recon" |

## Migration Safety

**Important:** This plugin blocks manual creation of migration files in `prisma/migrations/`.

Always use the Prisma CLI to create migrations:

```bash
# Create a new migration (interactive - names the migration)
npx prisma migrate dev --name descriptive_name

# Create migration without applying (for review)
npx prisma migrate dev --create-only --name descriptive_name
```

Never manually create `.sql` files in the migrations folder.

## Common Workflows

### Initial Setup

```bash
# Initialize Prisma
npx prisma init

# Configure datasource in schema.prisma
# Add models to schema.prisma

# Generate client
npx prisma generate

# Push to development database
npx prisma db push
```

### Schema Changes

1. Modify `schema.prisma`
2. Run `npx prisma migrate dev --name change_description`
3. Prisma Client auto-regenerates
4. Update application code if needed

### Production Deployment

```bash
# Apply pending migrations
npx prisma migrate deploy

# Generate client (if not in build step)
npx prisma generate
```

## Troubleshooting

For debugging Prisma issues, the prisma-troubleshoot agent can autonomously diagnose and fix common problems.

## Reference Files

- **`references/cli-reference.md`** - Complete CLI command reference
- **`references/common-patterns.md`** - Common schema and query patterns

## Resources

- Official docs: https://www.prisma.io/docs
- GitHub: https://github.com/prisma/prisma
- Prisma Examples: https://github.com/prisma/prisma-examples
