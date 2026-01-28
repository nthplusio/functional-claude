---
name: prisma-schema
description: This skill should be used when the user asks about "prisma model", "schema.prisma", "prisma relations", "@@index", "prisma attributes", "@id", "@unique", "prisma enum", "prisma types", or mentions schema design and model definitions in Prisma.
version: 0.1.2
---

# Prisma Schema

Design and configure Prisma schema files with models, relations, and attributes.

## Schema File Location

Default: `prisma/schema.prisma`

Custom location via `package.json`:
```json
{
  "prisma": {
    "schema": "db/schema.prisma"
  }
}
```

## Schema Structure

```prisma
// Datasource configuration
datasource db {
  provider = "postgresql"  // postgresql, mysql, sqlite, sqlserver, mongodb, cockroachdb
  url      = env("DATABASE_URL")
}

// Generator configuration
generator client {
  provider = "prisma-client-js"
}

// Models
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}
```

## Field Types

### Scalar Types

| Prisma Type | PostgreSQL | MySQL | SQLite |
|-------------|------------|-------|--------|
| String | TEXT | VARCHAR(191) | TEXT |
| Int | INTEGER | INT | INTEGER |
| BigInt | BIGINT | BIGINT | BIGINT |
| Float | DOUBLE PRECISION | DOUBLE | REAL |
| Decimal | DECIMAL(65,30) | DECIMAL(65,30) | DECIMAL |
| Boolean | BOOLEAN | BOOLEAN | INTEGER |
| DateTime | TIMESTAMP(3) | DATETIME(3) | DATETIME |
| Json | JSONB | JSON | TEXT |
| Bytes | BYTEA | LONGBLOB | BLOB |

### Optional and List Types

```prisma
model Example {
  required   String      // Required field
  optional   String?     // Optional field (nullable)
  list       String[]    // Array/list (not all DBs support)
}
```

## Field Attributes

### Primary Key

```prisma
model User {
  id        Int      @id @default(autoincrement())  // Auto-increment
  uuid      String   @id @default(uuid())           // UUID
  cuid      String   @id @default(cuid())           // CUID
}
```

### Composite Primary Key

```prisma
model PostTag {
  postId Int
  tagId  Int

  @@id([postId, tagId])
}
```

### Unique Constraints

```prisma
model User {
  email String @unique                    // Single field unique

  firstName String
  lastName  String
  @@unique([firstName, lastName])         // Composite unique
}
```

### Default Values

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  uuid      String   @default(uuid())
  createdAt DateTime @default(now())
  status    Status   @default(DRAFT)
  views     Int      @default(0)
}
```

### Database Mapping

```prisma
model User {
  id Int @id @map("user_id")      // Column name mapping

  @@map("users")                   // Table name mapping
}
```

## Relations

### One-to-Many

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
```

### Many-to-Many (Implicit)

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

### Many-to-Many (Explicit)

```prisma
model Post {
  id       Int        @id @default(autoincrement())
  postTags PostTag[]
}

model Tag {
  id       Int        @id @default(autoincrement())
  postTags PostTag[]
}

model PostTag {
  postId    Int
  tagId     Int
  assignedAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
```

### Self-Relations

```prisma
model User {
  id         Int     @id @default(autoincrement())
  followedBy User[]  @relation("UserFollows")
  following  User[]  @relation("UserFollows")
}
```

### Referential Actions

```prisma
model Post {
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  authorId Int
}
```

Options: `Cascade`, `Restrict`, `NoAction`, `SetNull`, `SetDefault`

## Indexes

```prisma
model Post {
  id        Int      @id
  title     String
  content   String
  authorId  Int
  createdAt DateTime

  @@index([authorId])                          // Single column
  @@index([authorId, createdAt])               // Composite
  @@index([title], type: Hash)                 // Hash index (PostgreSQL)
  @@index([content], type: Gin)                // GIN index (PostgreSQL)
  @@fulltext([title, content])                 // Full-text (MySQL)
}
```

## Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   Int  @id
  role Role @default(USER)
}
```

## Model Attributes

```prisma
model Post {
  // Fields...

  @@id([field1, field2])           // Composite primary key
  @@unique([field1, field2])       // Composite unique
  @@index([field1, field2])        // Index
  @@map("posts")                    // Table name
  @@schema("blog")                  // Schema (multi-schema)
  @@ignore                          // Ignore model in client
}
```

## Validation Commands

```bash
# Validate schema syntax
npx prisma validate

# Format schema file
npx prisma format

# View current database schema
npx prisma db pull
```
