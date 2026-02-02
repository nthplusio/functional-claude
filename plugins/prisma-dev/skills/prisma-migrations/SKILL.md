---
name: prisma-migrations
description: This skill should be used when the user asks about "prisma migrate", "database migration", "schema migration", "migrate dev", "migrate deploy", "migration history", "prisma db push", "rollback migration", or mentions database schema changes and versioning with Prisma.
version: 0.1.5
---

# Prisma Migrations

Manage database schema changes with Prisma Migrate for version-controlled, reproducible migrations.

## Migration Commands

| Command | Environment | Purpose |
|---------|-------------|---------|
| `prisma migrate dev` | Development | Create and apply migrations |
| `prisma migrate deploy` | Production | Apply pending migrations |
| `prisma migrate reset` | Development | Reset database and apply all migrations |
| `prisma migrate status` | Any | Show migration status |
| `prisma db push` | Development | Push schema without migration history |

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
| Production safe | No | Yes |
| Faster iteration | Yes | No |
| Data loss warning | Yes | Yes |

**Use `db push` for:**
- Rapid prototyping
- Schema experimentation
- Local development without history

**Use `migrate dev` for:**
- Team collaboration
- Production deployment
- Audit trail requirements

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
