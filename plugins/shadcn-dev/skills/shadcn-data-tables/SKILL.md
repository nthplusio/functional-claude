---
name: shadcn-data-tables
description: This skill should be used when the user asks about "data table", "tanstack table", "sortable table", "filterable table", "table pagination", "column sorting", "row selection", or mentions building data tables, grids, or TanStack Table integration with shadcn.
version: 0.3.0
---

# shadcn/ui Data Tables

Build powerful data tables with TanStack Table and shadcn/ui components.

## Setup

```bash
npm install @tanstack/react-table
npx shadcn@latest add table
```

Data tables consist of three parts:
1. **Column definitions** (`columns.tsx`) — Define columns and their behavior
2. **DataTable component** (`data-table.tsx`) — Reusable table with TanStack Table hook
3. **Page** (`page.tsx`) — Fetch data and render the table

## Column Definitions

```tsx
// columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    },
  },
]
```

For 15+ column patterns (sortable, selection, status badge, currency, date, avatar, actions, progress, boolean, link, tags), see [references/column-types.md](references/column-types.md).

## Using the Table

```tsx
// page.tsx
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default async function Page() {
  const data = await getData()
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

For the full reusable `DataTable` component implementation, see [references/table-patterns.md](references/table-patterns.md).

## Adding Features

Each feature adds state + a TanStack Table model function to the DataTable component:

| Feature | State Hook | Model Function | Details |
|---------|-----------|----------------|---------|
| Sorting | `useState<SortingState>` | `getSortedRowModel()` | [column-types.md](references/column-types.md) |
| Filtering | `useState<ColumnFiltersState>` | `getFilteredRowModel()` | [table-patterns.md](references/table-patterns.md) |
| Pagination | — | `getPaginationRowModel()` | [table-patterns.md](references/table-patterns.md) |
| Row Selection | `useState({})` | `onRowSelectionChange` | [column-types.md](references/column-types.md) |
| Column Visibility | `useState<VisibilityState>` | `onColumnVisibilityChange` | [table-patterns.md](references/table-patterns.md) |
| Row Actions | — | — (column def only) | [column-types.md](references/column-types.md) |

## Server-Side Tables

For large datasets, set `manualPagination`, `manualFiltering`, and `manualSorting` to `true` and sync table state with URL search params. Full implementation in [references/table-patterns.md](references/table-patterns.md).

## Reference Files

| File | Contents | Read when... |
|------|----------|-------------|
| [references/table-patterns.md](references/table-patterns.md) | Reusable DataTable component, toolbar, pagination controls, column visibility toggle, server-side tables, inline editing, expandable rows, drag-and-drop | Building or customizing the DataTable component |
| [references/column-types.md](references/column-types.md) | 15+ column definition patterns: sortable, selection checkbox, status badge, currency, date, avatar, actions dropdown, progress bar, boolean toggle, link, tags, priority, computed | Defining column behavior and cell rendering |

## Resources

- TanStack Table: https://tanstack.com/table
- shadcn Data Table: https://ui.shadcn.com/docs/components/data-table
