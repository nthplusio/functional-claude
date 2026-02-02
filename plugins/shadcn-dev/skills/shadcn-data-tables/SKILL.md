---
name: shadcn-data-tables
description: This skill should be used when the user asks about "data table", "tanstack table", "sortable table", "filterable table", "table pagination", "column sorting", "row selection", or mentions building data tables, grids, or TanStack Table integration with shadcn.
version: 0.1.6
---

# shadcn/ui Data Tables

Build powerful data tables with TanStack Table and shadcn/ui components.

## Setup

### Install Dependencies

```bash
npm install @tanstack/react-table
npx shadcn@latest add table
```

### Basic Structure

Data tables consist of:
1. **Column definitions** - Define columns and their behavior
2. **Table instance** - TanStack Table hook
3. **Render** - shadcn Table components

## Basic Data Table

### 1. Define Columns

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
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
]
```

### 2. Create DataTable Component

```tsx
// data-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### 3. Use the Table

```tsx
// page.tsx
import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from API
  return [
    { id: "1", amount: 100, status: "pending", email: "m@example.com" },
    { id: "2", amount: 125, status: "success", email: "n@example.com" },
  ]
}

export default async function Page() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

## Adding Features

### Sorting

```tsx
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// In column definition
{
  accessorKey: "email",
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
}

// In useReactTable
import { getSortedRowModel, SortingState } from "@tanstack/react-table"

const [sorting, setSorting] = useState<SortingState>([])

const table = useReactTable({
  // ...
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  state: {
    sorting,
  },
})
```

### Filtering

```tsx
import { getFilteredRowModel, ColumnFiltersState } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"

const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

const table = useReactTable({
  // ...
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    columnFilters,
  },
})

// Filter input
<Input
  placeholder="Filter emails..."
  value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
  onChange={(event) =>
    table.getColumn("email")?.setFilterValue(event.target.value)
  }
  className="max-w-sm"
/>
```

### Pagination

```tsx
import { getPaginationRowModel } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

const table = useReactTable({
  // ...
  getPaginationRowModel: getPaginationRowModel(),
})

// Pagination controls
<div className="flex items-center justify-end space-x-2 py-4">
  <Button
    variant="outline"
    size="sm"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </Button>
</div>
```

### Row Selection

```tsx
// Add checkbox column
import { Checkbox } from "@/components/ui/checkbox"

{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
}

// In useReactTable
const [rowSelection, setRowSelection] = useState({})

const table = useReactTable({
  // ...
  onRowSelectionChange: setRowSelection,
  state: {
    rowSelection,
  },
})

// Show selection count
<div className="text-sm text-muted-foreground">
  {table.getFilteredSelectedRowModel().rows.length} of{" "}
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```

### Column Visibility

```tsx
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="ml-auto">
      Columns
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {table
      .getAllColumns()
      .filter((column) => column.getCanHide())
      .map((column) => (
        <DropdownMenuCheckboxItem
          key={column.id}
          className="capitalize"
          checked={column.getIsVisible()}
          onCheckedChange={(value) => column.toggleVisibility(!!value)}
        >
          {column.id}
        </DropdownMenuCheckboxItem>
      ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### Row Actions

```tsx
import { MoreHorizontal } from "lucide-react"

{
  id: "actions",
  cell: ({ row }) => {
    const payment = row.original

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(payment.id)}
          >
            Copy payment ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```

## Server-Side Tables

For large datasets, use server-side pagination:

```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
}

const table = useReactTable({
  data,
  columns,
  pageCount,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  manualFiltering: true,
  manualSorting: true,
  state: {
    pagination,
    sorting,
    columnFilters,
  },
})

// Sync state with URL
const searchParams = useSearchParams()
const router = useRouter()

useEffect(() => {
  router.push(`?page=${pagination.pageIndex}&size=${pagination.pageSize}`)
}, [pagination])
```

## Reference Files

- **`references/table-patterns.md`** - Advanced table patterns
- **`references/column-types.md`** - Column definition examples

## Resources

- TanStack Table: https://tanstack.com/table
- shadcn Data Table: https://ui.shadcn.com/docs/components/data-table
