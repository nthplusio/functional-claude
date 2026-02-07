---
name: prisma-recon
description: This skill should be used when the user asks to "analyze prisma", "prisma setup", "schema recon", "check prisma config", "prisma structure", "what models exist", "show prisma schema", or when first starting work in a Prisma project to understand the existing setup.
version: 0.1.6
---

# Prisma Repository Recon

Analyze and document Prisma configuration and schema in the current repository.

## When to Use

Run this skill:
- When first working in a Prisma project
- When the SessionStart hook detects Prisma but no cached recon exists
- When the user asks about the project's Prisma setup
- After significant schema changes to update the cache

## Reconnaissance Process

### Step 1: Locate Prisma Configuration

Search for Prisma schema files:

```bash
# Find schema files
find . -name "schema.prisma" -o -name "*.prisma" 2>/dev/null | head -20

# Check package.json for custom schema path
grep -A5 '"prisma"' package.json 2>/dev/null
```

Common locations:
- `prisma/schema.prisma` (default)
- `src/prisma/schema.prisma`
- Custom path in `package.json`

### Step 2: Parse Datasource Configuration

Extract from schema.prisma:

```prisma
datasource db {
  provider = "postgresql"  // Database type
  url      = env("DATABASE_URL")
}
```

Document:
- **Provider**: postgresql, mysql, sqlite, sqlserver, mongodb, cockroachdb
- **URL source**: Environment variable name
- **Connection string format** (without credentials)

### Step 3: Analyze Generator Configuration

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
  binaryTargets   = ["native", "linux-musl"]
}
```

Document:
- **Provider**: Usually `prisma-client-js`
- **Preview features**: Enabled experimental features
- **Binary targets**: Deployment platforms

### Step 4: Extract Models

For each model, document:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}
```

Parse and record:
- **Model name**: User
- **Table name**: users (if `@@map` exists)
- **Fields**: id, email, name, role, posts, profile, createdAt, updatedAt
- **Primary key**: id
- **Unique fields**: email
- **Optional fields**: name, profile
- **Relations**: posts (Post[]), profile (Profile?)
- **Indexes**: [email]
- **Enums used**: Role

### Step 5: Map Relations

Create a relation map:

```
User <-> Post (one-to-many)
  User.posts -> Post[]
  Post.author -> User (via authorId)

User <-> Profile (one-to-one)
  User.profile -> Profile?
  Profile.user -> User (via userId)
```

### Step 6: Document Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

List all enums with their values.

### Step 7: Check Migration Status

```bash
# Check for migrations directory
ls -la prisma/migrations/ 2>/dev/null

# Count migrations
ls prisma/migrations/ 2>/dev/null | grep -E "^[0-9]+" | wc -l

# Check migration lock
cat prisma/migrations/migration_lock.toml 2>/dev/null
```

### Step 8: Identify Environment Configuration

```bash
# Check for .env files
ls -la .env* 2>/dev/null

# Check for DATABASE_URL in .env.example (safe to read)
grep "DATABASE_URL" .env.example 2>/dev/null
```

## Cache Output Format

Write findings to `${CLAUDE_PLUGIN_ROOT}/.cache/recon.json`:

```json
{
  "lastUpdated": "2024-01-15T10:30:00Z",
  "schemaPath": "prisma/schema.prisma",
  "datasource": {
    "provider": "postgresql",
    "urlEnvVar": "DATABASE_URL"
  },
  "generator": {
    "provider": "prisma-client-js",
    "previewFeatures": ["fullTextSearch"]
  },
  "models": [
    {
      "name": "User",
      "tableName": "users",
      "fields": [
        {"name": "id", "type": "Int", "attributes": ["@id", "@default(autoincrement())"]},
        {"name": "email", "type": "String", "attributes": ["@unique"]},
        {"name": "posts", "type": "Post[]", "relation": true}
      ],
      "primaryKey": ["id"],
      "uniqueFields": ["email"],
      "indexes": [["email"]]
    }
  ],
  "enums": [
    {"name": "Role", "values": ["USER", "ADMIN", "MODERATOR"]}
  ],
  "relations": [
    {"from": "User", "to": "Post", "type": "one-to-many", "field": "posts"},
    {"from": "User", "to": "Profile", "type": "one-to-one", "field": "profile"}
  ],
  "migrations": {
    "count": 5,
    "latest": "20240115_add_user_role",
    "provider": "postgresql"
  }
}
```

## Summary Output

After analysis, provide a human-readable summary:

```markdown
## Prisma Configuration Summary

**Schema**: prisma/schema.prisma
**Database**: PostgreSQL
**Environment**: DATABASE_URL

### Models (4)

| Model | Table | Fields | Relations |
|-------|-------|--------|-----------|
| User | users | 7 | posts, profile |
| Post | posts | 6 | author, comments |
| Profile | profiles | 4 | user |
| Comment | comments | 5 | post, author |

### Enums (2)
- Role: USER, ADMIN, MODERATOR
- Status: DRAFT, PUBLISHED, ARCHIVED

### Migrations
- 5 migrations applied
- Latest: 20240115_add_user_role
- Lock provider: postgresql

### Key Relations
- User -> Post (one-to-many)
- User -> Profile (one-to-one)
- Post -> Comment (one-to-many)
```

## Updating Cache

Invalidate and refresh cache when:
- Schema file is modified
- New migrations are created
- User explicitly requests refresh

Check cache freshness:
```bash
# Compare schema modification time with cache
stat prisma/schema.prisma
stat ${CLAUDE_PLUGIN_ROOT}/.cache/recon.json
```

## Integration with Other Skills

The recon data enables other skills to provide context-aware guidance:

- **prisma-schema**: Know existing models when adding new ones
- **prisma-queries**: Suggest queries based on actual model structure
- **prisma-migrations**: Understand current schema state
