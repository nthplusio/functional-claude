# Common Prisma Patterns

Frequently used patterns for schema design and queries.

## Schema Patterns

### Soft Delete

```prisma
model Post {
  id        Int       @id @default(autoincrement())
  title     String
  deletedAt DateTime?

  @@index([deletedAt])
}
```

Query with soft delete:
```typescript
// Find non-deleted
const posts = await prisma.post.findMany({
  where: { deletedAt: null }
})

// Soft delete
await prisma.post.update({
  where: { id: 1 },
  data: { deletedAt: new Date() }
})
```

### Timestamps

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### UUID Primary Key

```prisma
model User {
  id String @id @default(uuid())
  // or cuid()
  // id String @id @default(cuid())
}
```

### Polymorphic Relations (via enum)

```prisma
enum CommentableType {
  POST
  VIDEO
  IMAGE
}

model Comment {
  id             Int             @id @default(autoincrement())
  content        String
  commentableId  Int
  commentableType CommentableType

  @@index([commentableId, commentableType])
}
```

### Tags (Many-to-Many)

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

### Audit Log

```prisma
model AuditLog {
  id        Int      @id @default(autoincrement())
  action    String   // CREATE, UPDATE, DELETE
  tableName String
  recordId  Int
  oldData   Json?
  newData   Json?
  userId    Int?
  createdAt DateTime @default(now())

  @@index([tableName, recordId])
  @@index([userId])
  @@index([createdAt])
}
```

## Query Patterns

### Pagination

```typescript
// Offset pagination
const page = 1
const pageSize = 10

const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

// Cursor pagination (more efficient)
const posts = await prisma.post.findMany({
  take: 10,
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
})
```

### Full-text Search (PostgreSQL)

```prisma
model Post {
  id      Int    @id
  title   String
  content String

  @@fulltext([title, content])
}
```

```typescript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { search: 'database' } },
      { content: { search: 'database' } }
    ]
  }
})
```

### Conditional Include

```typescript
const includeComments = true

const posts = await prisma.post.findMany({
  include: {
    comments: includeComments
  }
})
```

### Nested Create with Connect

```typescript
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    author: {
      connect: { id: userId }
    },
    tags: {
      connectOrCreate: [
        {
          where: { name: 'prisma' },
          create: { name: 'prisma' }
        }
      ]
    }
  }
})
```

### Bulk Operations with Transactions

```typescript
const result = await prisma.$transaction([
  prisma.user.deleteMany({ where: { verified: false } }),
  prisma.post.updateMany({
    where: { authorId: { in: deletedUserIds } },
    data: { status: 'ORPHANED' }
  })
])
```

### Optimistic Concurrency

```prisma
model Post {
  id      Int @id
  version Int @default(0)
  title   String
}
```

```typescript
const updated = await prisma.post.updateMany({
  where: {
    id: postId,
    version: currentVersion
  },
  data: {
    title: newTitle,
    version: { increment: 1 }
  }
})

if (updated.count === 0) {
  throw new Error('Concurrent modification detected')
}
```

### Raw Query with Type Safety

```typescript
const users = await prisma.$queryRaw<User[]>`
  SELECT * FROM "User"
  WHERE email LIKE ${`%${domain}`}
`
```

## Error Handling Patterns

### Catch Specific Errors

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

try {
  await prisma.user.create({ data: { email } })
} catch (e) {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists')
    }
  }
  throw e
}
```

### findUniqueOrThrow Pattern

```typescript
// Throws if not found
const user = await prisma.user.findUniqueOrThrow({
  where: { id: userId }
})

// Custom error handling
const user = await prisma.user.findUnique({
  where: { id: userId }
})
if (!user) {
  throw new NotFoundError('User not found')
}
```

## Connection Patterns

### Singleton Instance

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Graceful Shutdown

```typescript
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```
