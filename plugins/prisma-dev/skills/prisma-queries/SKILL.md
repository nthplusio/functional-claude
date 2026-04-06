---
name: prisma-queries
description: This skill should be used when the user asks about "prisma client", "findMany", "findUnique", "create", "update", "delete", "prisma query", "include", "select", "where", "prisma transactions", "nested writes", or mentions database queries and CRUD operations with Prisma.
version: 0.2.0
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

## Advanced Operations

For complex query patterns beyond basic CRUD, see [references/advanced-queries.md](references/advanced-queries.md):

| Topic | Use When |
|-------|----------|
| Combining Filters | Building complex AND/OR/NOT conditions |
| Relation Filters | Filtering by related record properties |
| Nested Includes | Loading deeply nested or filtered relations |
| Aggregations | count, sum, avg, min, max, groupBy |
| Transactions | Multi-operation atomicity (sequential or interactive) |
| Nested Writes | Creating/updating related records in one call |
| Raw Queries | Complex SQL the Prisma Client can't express |

## Best Practices

1. **Use `select` to limit fields** - Reduce payload size
2. **Paginate large results** - Use `take` and `skip`/`cursor`
3. **Use transactions for consistency** - Multiple related operations
4. **Handle errors gracefully** - Catch Prisma errors by code
5. **Disconnect on shutdown** - Call `prisma.$disconnect()`

## Reference Files

| File | Contents |
|------|----------|
| [references/advanced-queries.md](references/advanced-queries.md) | Combining filters, relation filters, nested includes, aggregations, transactions, nested writes, raw queries |
