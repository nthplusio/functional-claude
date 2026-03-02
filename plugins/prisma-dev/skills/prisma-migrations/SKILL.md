---
name: prisma-migrations
description: This skill should be used when the user is working with Prisma schema changes or database migrations — including "prisma migrate", "migrate dev", "migrate deploy", "migration history", "rollback migration", "schema migration", "database migration", "db push", "prisma db push", "schema change", "schema update", "schema evolution", "add field", "add column", "add model", "rename field", "drop column", "change schema", "update schema", "alter table", "schema drift", "migration file", "pending migration", "apply migration", "create migration", "new table", "schema version", or any time a schema.prisma file is modified or the database structure needs to change.
version: 0.1.8
---

# Prisma Migrations

Manage database schema changes with Prisma Migrate for version-controlled, reproducible migrations.

## CRITICAL: Migration-First Policy

**Every schema change must go through `prisma migrate dev`. Do NOT use `prisma db push` on projects with existing migration history.**

`db push` bypasses the migration system entirely. When `migrate deploy` runs in Docker, CI/CD, or staging, it only executes existing migration files — it does not apply any schema that was pushed with `db push`. This causes schema drift across environments.

| Scenario | Use |
|----------|-----|
| Any schema change (add field, model, index, enum, etc.) | `prisma migrate dev` |
| Production/CI/CD/Docker deployment | `prisma migrate deploy` |
| Initial prototyping with zero data (disposable DB) | `prisma db push` is acceptable |
| Schema experimentation before committing | `prisma migrate dev --create-only` |

## Migration Commands

| Command | Environment | Purpose |
|---------|-------------|---------|
| `prisma migrate dev` | Development | Create and apply migrations — **default for all schema changes** |
| `prisma migrate deploy` | Production/CI | Apply pending migrations only |
| `prisma migrate reset` | Development | Reset database and replay all migrations |
| `prisma migrate status` | Any | Show migration status and drift |
| `prisma db push` | Prototyping only | Push schema without migration (avoid on established projects) |

## Development Workflow

### Create a Migration

```bash
# Interactive: prompts for migration name
npx prisma migrate dev

# Non-interactive: provide name
npx prisma migrate dev --name add_user_email

# Create without applying (for review)
npx prisma migrate dev --create-only --name add_user_email
```

### Migration File Structure

```
prisma/migrations/
├── 20240101120000_init/
│   └── migration.sql
├── 20240115143000_add_user_email/
│   └── migration.sql
└── migration_lock.toml
```

**Important:** Never manually create or edit files in `prisma/migrations/`. Always use `prisma migrate dev`.

### Check Migration Status

```bash
npx prisma migrate status
```

Output shows:
- Applied migrations
- Pending migrations
- Failed migrations
- Database drift

## Production Workflow

### Deploy Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy
```

Use in CI/CD pipeline or deployment scripts:

```bash
# Example deployment script
npx prisma migrate deploy
npx prisma generate
npm run start
```

### Migration Status in Production

```bash
# Check without applying
npx prisma migrate status
```

## Common Scenarios

### Adding a Required Field

When adding a required field to existing data:

```prisma
model User {
  id    Int    @id
  email String  // New required field
}
```

Options:
1. **Provide default in migration** - Edit generated SQL
2. **Make nullable first** - Add as optional, backfill, then make required
3. **Use `@default`** - Add default value in schema

```bash
# Create migration, then edit SQL before applying
npx prisma migrate dev --create-only --name add_email

# Edit prisma/migrations/xxx_add_email/migration.sql
# Then apply
npx prisma migrate dev
```

### Renaming a Field

Prisma detects renames as drop+create. For data preservation:

```bash
# 1. Create migration with --create-only
npx prisma migrate dev --create-only --name rename_field

# 2. Edit migration.sql to use ALTER COLUMN RENAME
# 3. Apply migration
npx prisma migrate dev
```

### Renaming a Model

Similar to field rename - edit the generated SQL:

```sql
-- Generated (destructive)
DROP TABLE "OldName";
CREATE TABLE "NewName" (...);

-- Manual fix (preserves data)
ALTER TABLE "OldName" RENAME TO "NewName";
```

### Handling Failed Migrations

```bash
# Check status
npx prisma migrate status

# If migration failed, you may need to:
# 1. Fix the database manually
# 2. Mark migration as applied
npx prisma migrate resolve --applied "20240101120000_migration_name"

# Or mark as rolled back
npx prisma migrate resolve --rolled-back "20240101120000_migration_name"
```

## Database Reset

### Development Only

```bash
# Drop database, recreate, apply all migrations, run seed
npx prisma migrate reset

# Skip seed
npx prisma migrate reset --skip-seed

# Force (skip confirmation)
npx prisma migrate reset --force
```

## Seeding

### Configure Seed Script

In `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Example Seed File

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com', name: 'Bob' },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Run Seed

```bash
# Run seed script
npx prisma db seed

# Seed runs automatically with:
npx prisma migrate reset
npx prisma migrate dev (on empty database)
```

## db push vs migrate dev

| Feature | `db push` | `migrate dev` |
|---------|-----------|---------------|
| Creates migration files | No | Yes |
| Version control | No | Yes |
| Works with `migrate deploy` | No | Yes |
| Safe for team use | No | Yes |
| Safe for Docker/CI/CD | **No — causes drift** | Yes |
| Data loss warning | Yes | Yes |

**`db push` is ONLY acceptable when:**
- No `prisma/migrations/` directory exists yet (initial schema exploration)
- The database is completely disposable (no shared state, no CI/CD)

**Use `migrate dev` for everything else:**
- Any project with existing migrations
- Team collaboration
- Projects deployed via Docker, CI/CD, or any environment other than your local machine
- Any change you want to persist across environments

## Baseline Existing Database

For existing databases without Prisma migrations:

```bash
# 1. Pull existing schema
npx prisma db pull

# 2. Create baseline migration
npx prisma migrate dev --name init --create-only

# 3. Mark as applied (without running)
npx prisma migrate resolve --applied "20240101120000_init"
```

## Safety Notes

1. **Never edit applied migrations** - Create new migrations instead
2. **Test migrations locally** - Before deploying to production
3. **Backup before deploying** - Especially for destructive changes
4. **Review generated SQL** - Use `--create-only` for complex changes
