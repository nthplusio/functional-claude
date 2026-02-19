---
name: prisma-queries
description: This skill should be used when the user asks about "prisma client", "findMany", "findUnique", "create", "update", "delete", "prisma query", "include", "select", "where", "prisma transactions", "nested writes", or mentions database queries and CRUD operations with Prisma.
version: 0.1.7
---

# Prisma Queries

Query and mutate data using Prisma Client with type-safe operations.

## Client Setup

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// With logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

## CRUD Operations

### Create

```typescript
// Create single record
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
})

// Create with relations
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' },
      ],
    },
  },
  include: { posts: true },
})

// Create many
const count = await prisma.user.createMany({
  data: [
    { email: 'alice@example.com' },
    { email: 'bob@example.com' },
  ],
  skipDuplicates: true,
})
```

### Read

```typescript
// Find unique (by unique field)
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
})

// Find first matching
const user = await prisma.user.findFirst({
  where: { name: { contains: 'Alice' } },
})

// Find many
const users = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
})

// Find or throw
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
})
```

### Update

```typescript
// Update single
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'New Name' },
})

// Update many
const count = await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { verified: true },
})

// Upsert (update or create)
const user = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice Updated' },
  create: { email: 'alice@example.com', name: 'Alice' },
})
```

### Delete

```typescript
// Delete single
const user = await prisma.user.delete({
  where: { id: 1 },
})

// Delete many
const count = await prisma.user.deleteMany({
  where: { verified: false },
})
```

## Filtering

### Basic Filters

```typescript
const users = await prisma.user.findMany({
  where: {
    email: 'alice@example.com',        // Exact match
    name: { contains: 'Ali' },         // Contains
    age: { gte: 18 },                  // Greater than or equal
    role: { in: ['ADMIN', 'MOD'] },    // In list
    verified: { not: false },          // Not equal
  },
})
```

### Filter Operators

| Operator | Description |
|----------|-------------|
| `equals` | Exact match |
| `not` | Not equal |
| `in` | In array |
| `notIn` | Not in array |
| `lt`, `lte` | Less than (or equal) |
| `gt`, `gte` | Greater than (or equal) |
| `contains` | String contains |
| `startsWith` | String starts with |
| `endsWith` | String ends with |
| `mode: 'insensitive'` | Case-insensitive |

### Combining Filters

```typescript
const users = await prisma.user.findMany({
  where: {
    AND: [
      { verified: true },
      { role: 'ADMIN' },
    ],
  },
})

const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@company.com' } },
      { role: 'ADMIN' },
    ],
  },
})

const users = await prisma.user.findMany({
  where: {
    NOT: { role: 'BANNED' },
  },
})
```

### Relation Filters

```typescript
// Filter by relation existence
const usersWithPosts = await prisma.user.findMany({
  where: {
    posts: { some: {} },  // Has at least one post
  },
})

// Filter by relation field
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
})
```

## Select and Include

### Select Specific Fields

```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    // Only these fields returned
  },
})
```

### Include Relations

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true,            // All posts
    profile: true,          // Profile relation
  },
})

// Nested includes
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      include: { comments: true },
    },
  },
})

// Filtered includes
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
})
```

## Pagination

```typescript
// Offset pagination
const users = await prisma.user.findMany({
  skip: 20,
  take: 10,
  orderBy: { createdAt: 'desc' },
})

// Cursor pagination
const users = await prisma.user.findMany({
  take: 10,
  cursor: { id: lastUserId },
  orderBy: { id: 'asc' },
})
```

## Aggregations

```typescript
// Count
const count = await prisma.user.count({
  where: { verified: true },
})

// Aggregate
const stats = await prisma.order.aggregate({
  _sum: { amount: true },
  _avg: { amount: true },
  _min: { amount: true },
  _max: { amount: true },
})

// Group by
const grouped = await prisma.user.groupBy({
  by: ['role'],
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
})
```

## Transactions

### Sequential Transactions

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'new@example.com' } }),
  prisma.post.create({ data: { title: 'New Post', authorId: 1 } }),
])
```

### Interactive Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: 1 } })

  if (!user) throw new Error('User not found')

  const updated = await tx.user.update({
    where: { id: 1 },
    data: { balance: user.balance - 100 },
  })

  return updated
})
```

### Transaction Options

```typescript
await prisma.$transaction(
  async (tx) => {
    // operations
  },
  {
    maxWait: 5000,      // Max time to acquire lock
    timeout: 10000,     // Max transaction duration
    isolationLevel: 'Serializable',
  }
)
```

## Nested Writes

```typescript
// Create with nested relations
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    profile: {
      create: { bio: 'Hello!' },
    },
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' },
      ],
    },
  },
})

// Update nested relations
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: 'New Post' },
      update: {
        where: { id: 1 },
        data: { published: true },
      },
      delete: { id: 2 },
    },
  },
})
```

## Raw Queries

```typescript
// Raw SQL query
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email = ${email}
`

// Raw SQL execute
const result = await prisma.$executeRaw`
  UPDATE "User" SET verified = true WHERE id = ${id}
`
```

## Best Practices

1. **Use `select` to limit fields** - Reduce payload size
2. **Paginate large results** - Use `take` and `skip`/`cursor`
3. **Use transactions for consistency** - Multiple related operations
4. **Handle errors gracefully** - Catch Prisma errors by code
5. **Disconnect on shutdown** - Call `prisma.$disconnect()`
