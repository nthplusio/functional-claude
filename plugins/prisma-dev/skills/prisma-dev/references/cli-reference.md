# Prisma CLI Reference

Complete reference for Prisma CLI commands.

## Database Commands

### prisma db push

Push schema to database without creating migrations.

```bash
npx prisma db push [options]

# Options:
--accept-data-loss    Accept data loss from destructive changes
--force-reset         Reset database before push
--skip-generate       Skip client generation
```

**Use for:** Rapid prototyping, local development

### prisma db pull

Pull schema from existing database (introspection).

```bash
npx prisma db pull [options]

# Options:
--force               Overwrite existing schema
--print               Print to stdout instead of file
```

**Use for:** Reverse engineering existing database

### prisma db seed

Run seed script.

```bash
npx prisma db seed

# Configure in package.json:
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### prisma db execute

Execute raw SQL.

```bash
npx prisma db execute --file ./script.sql
npx prisma db execute --stdin < script.sql
```

## Migration Commands

### prisma migrate dev

Create and apply migrations (development).

```bash
npx prisma migrate dev [options]

# Options:
--name <name>         Migration name
--create-only         Create without applying
--skip-seed           Skip seed after migration
--skip-generate       Skip client generation
```

### prisma migrate deploy

Apply pending migrations (production).

```bash
npx prisma migrate deploy
```

### prisma migrate reset

Reset database and reapply all migrations.

```bash
npx prisma migrate reset [options]

# Options:
--force               Skip confirmation
--skip-seed           Skip seed
--skip-generate       Skip client generation
```

### prisma migrate status

Show migration status.

```bash
npx prisma migrate status
```

### prisma migrate resolve

Mark migration as applied or rolled back.

```bash
npx prisma migrate resolve --applied <migration_name>
npx prisma migrate resolve --rolled-back <migration_name>
```

### prisma migrate diff

Show SQL diff between states.

```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

## Schema Commands

### prisma validate

Validate schema syntax.

```bash
npx prisma validate
```

### prisma format

Format schema file.

```bash
npx prisma format
```

## Client Commands

### prisma generate

Generate Prisma Client.

```bash
npx prisma generate [options]

# Options:
--watch               Watch mode
--data-proxy          Generate for Prisma Data Proxy
```

## Other Commands

### prisma studio

Open database GUI.

```bash
npx prisma studio [options]

# Options:
--browser <browser>   Browser to open
--port <port>         Port number (default: 5555)
```

### prisma version

Show version information.

```bash
npx prisma --version
npx prisma -v
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Primary database connection |
| SHADOW_DATABASE_URL | Shadow database for migrations |
| PRISMA_HIDE_UPDATE_MESSAGE | Hide update notifications |
| DEBUG | Enable debug logging |

## Common Workflows

### Initial Setup

```bash
npx prisma init
# Edit schema.prisma
npx prisma generate
npx prisma db push  # or migrate dev
```

### Schema Change (Development)

```bash
# Edit schema.prisma
npx prisma migrate dev --name change_description
# Client auto-generates
```

### Schema Change (Production)

```bash
# Locally: create migration
npx prisma migrate dev --name change_description

# Commit migration files
git add prisma/migrations
git commit -m "Add migration"

# In production:
npx prisma migrate deploy
```

### Introspect Existing Database

```bash
npx prisma db pull
npx prisma generate
```
