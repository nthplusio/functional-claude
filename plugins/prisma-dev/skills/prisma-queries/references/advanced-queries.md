# Advanced Prisma Query Patterns

Complex query patterns beyond basic CRUD operations. Each section includes complete code examples.

## Table of Contents

- [Combining Filters](#combining-filters) -- AND, OR, NOT patterns
- [Relation Filters](#relation-filters) -- some, every, none
- [Nested Includes](#nested-includes) -- Deeply nested and filtered includes
- [Aggregations](#aggregations) -- count, aggregate, groupBy
- [Transactions](#transactions) -- Sequential, interactive, and options
- [Nested Writes](#nested-writes) -- Create with relations, update with connect/disconnect
- [Raw Queries](#raw-queries) -- Direct SQL with security guidance

---

## Combining Filters

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

## Relation Filters

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

## Nested Includes

```typescript
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

> **Security Warning:** Always use parameterized queries (tagged template literals) to prevent SQL injection. Never concatenate user input directly into query strings.

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
