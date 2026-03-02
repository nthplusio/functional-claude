---
name: update-prisma-claude-md
description: Inject or update Prisma best practices in the project CLAUDE.md to enforce migration-first workflows. Run once after installing prisma-dev to make the rules permanent for all future sessions.
allowed-tools: Read, Edit, Write, Glob, Bash
---

# Update Prisma CLAUDE.md Command

Scan the current project's CLAUDE.md and add or update a Prisma best practices section that enforces migration-first workflows.

## Steps

### Step 1: Find the Project CLAUDE.md

Look for CLAUDE.md in the current working directory:

```bash
ls -la CLAUDE.md 2>/dev/null || echo "NOT FOUND"
```

If it does not exist, note that you will create it.

### Step 2: Check for Existing Prisma Rules

If CLAUDE.md exists, read it and check whether it already contains a Prisma section (look for `## Prisma` or `prisma migrate` or `db push`).

- If a Prisma section **already exists**, update it with the canonical content below.
- If no Prisma section exists, append it.
- If CLAUDE.md does not exist, create it with just the Prisma section.

### Step 3: Write the Prisma Best Practices Section

The section to insert or replace is:

```markdown
## Prisma Development

**Migration-First Policy**: NEVER use `prisma db push` on this project. Always use `prisma migrate dev` for schema changes.

### Required Workflow for Schema Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <describe_the_change>` to create a versioned migration
3. Commit both `schema.prisma` AND the generated files in `prisma/migrations/`

### Why This Matters

- `prisma db push` bypasses the migration system entirely
- `prisma migrate deploy` (used in Docker, CI/CD, staging) only runs committed migration files — it will NOT see schema pushed with `db push`
- Using `db push` on an established project causes schema drift across environments

### Prisma Command Reference

| Task | Command |
|------|---------|
| Apply schema change | `npx prisma migrate dev --name description` |
| Check migration status | `npx prisma migrate status` |
| Deploy in production/CI | `npx prisma migrate deploy` |
| Preview migration SQL only | `npx prisma migrate dev --create-only --name description` |
| Regenerate client | `npx prisma generate` |
| Open data browser | `npx prisma studio` |

### Never Do

- `prisma db push` (when any migration files exist)
- Manually create `.sql` files in `prisma/migrations/`
- Edit or delete applied migration files
```

### Step 4: Confirm

After writing, confirm to the user:
- Whether CLAUDE.md was created, updated, or had the section appended
- The path to the file
- A note that these rules will now be active in all future sessions in this project

Do NOT commit the file — the user decides when to commit.
