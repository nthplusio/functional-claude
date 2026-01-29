# Column Definition Examples

Complete column definition patterns for TanStack Table.

## Basic Columns

### Text Column

```tsx
{
  accessorKey: "name",
  header: "Name",
}
```

### With Custom Cell

```tsx
{
  accessorKey: "name",
  header: "Name",
  cell: ({ row }) => (
    <div className="font-medium">{row.getValue("name")}</div>
  ),
}
```

## Sortable Column

```tsx
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

{
  accessorKey: "email",
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    )
  },
}
```

## Selection Column

```tsx
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
```

## Status Column with Badge

```tsx
import { Badge } from "@/components/ui/badge"

const statusMap = {
  pending: { label: "Pending", variant: "outline" },
  processing: { label: "Processing", variant: "default" },
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
}

{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status") as keyof typeof statusMap
    const { label, variant } = statusMap[status]
    return <Badge variant={variant}>{label}</Badge>
  },
  filterFn: (row, id, value) => {
    return value.includes(row.getValue(id))
  },
}
```

## Currency Column

```tsx
{
  accessorKey: "amount",
  header: () => <div className="text-right">Amount</div>,
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue("amount"))
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

    return <div className="text-right font-medium">{formatted}</div>
  },
}
```

## Date Column

```tsx
import { format } from "date-fns"

{
  accessorKey: "createdAt",
  header: "Created",
  cell: ({ row }) => {
    const date = new Date(row.getValue("createdAt"))
    return format(date, "MMM d, yyyy")
  },
}
```

## Date-Time Column

```tsx
{
  accessorKey: "updatedAt",
  header: "Last Updated",
  cell: ({ row }) => {
    const date = new Date(row.getValue("updatedAt"))
    return (
      <div className="flex flex-col">
        <span>{format(date, "MMM d, yyyy")}</span>
        <span className="text-xs text-muted-foreground">
          {format(date, "h:mm a")}
        </span>
      </div>
    )
  },
}
```

## Relative Time Column

```tsx
import { formatDistanceToNow } from "date-fns"

{
  accessorKey: "lastActive",
  header: "Last Active",
  cell: ({ row }) => {
    const date = new Date(row.getValue("lastActive"))
    return (
      <span title={format(date, "PPpp")}>
        {formatDistanceToNow(date, { addSuffix: true })}
      </span>
    )
  },
}
```

## Avatar Column

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

{
  accessorKey: "user",
  header: "User",
  cell: ({ row }) => {
    const user = row.original.user
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
    )
  },
}
```

## Actions Column

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, Copy } from "lucide-react"

{
  id: "actions",
  cell: ({ row }) => {
    const item = row.original

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
            onClick={() => navigator.clipboard.writeText(item.id)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(item)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```

## Progress Column

```tsx
import { Progress } from "@/components/ui/progress"

{
  accessorKey: "progress",
  header: "Progress",
  cell: ({ row }) => {
    const progress = row.getValue("progress") as number
    return (
      <div className="flex items-center gap-2">
        <Progress value={progress} className="w-[60px]" />
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
    )
  },
}
```

## Boolean Column

```tsx
import { Check, X } from "lucide-react"

{
  accessorKey: "isActive",
  header: "Active",
  cell: ({ row }) => {
    const isActive = row.getValue("isActive")
    return isActive ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    )
  },
}
```

## Link Column

```tsx
import Link from "next/link"

{
  accessorKey: "title",
  header: "Title",
  cell: ({ row }) => {
    const id = row.original.id
    const title = row.getValue("title") as string
    return (
      <Link
        href={`/items/${id}`}
        className="font-medium underline-offset-4 hover:underline"
      >
        {title}
      </Link>
    )
  },
}
```

## Truncated Text Column

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

{
  accessorKey: "description",
  header: "Description",
  cell: ({ row }) => {
    const description = row.getValue("description") as string
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="line-clamp-2 max-w-[200px]">
              {description}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[300px]">
            {description}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
}
```

## Tags Column

```tsx
import { Badge } from "@/components/ui/badge"

{
  accessorKey: "tags",
  header: "Tags",
  cell: ({ row }) => {
    const tags = row.getValue("tags") as string[]
    return (
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    )
  },
  filterFn: (row, id, value) => {
    const tags = row.getValue(id) as string[]
    return value.some((v: string) => tags.includes(v))
  },
}
```

## Priority Column

```tsx
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"

const priorities = {
  low: { icon: ArrowDown, label: "Low", color: "text-blue-500" },
  medium: { icon: ArrowRight, label: "Medium", color: "text-yellow-500" },
  high: { icon: ArrowUp, label: "High", color: "text-red-500" },
}

{
  accessorKey: "priority",
  header: "Priority",
  cell: ({ row }) => {
    const priority = row.getValue("priority") as keyof typeof priorities
    const { icon: Icon, label, color } = priorities[priority]
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
    )
  },
  filterFn: (row, id, value) => {
    return value.includes(row.getValue(id))
  },
}
```

## Computed Column

```tsx
{
  id: "fullName",
  header: "Full Name",
  accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  cell: ({ getValue }) => getValue(),
}
```

## Column with Global Filter

```tsx
{
  accessorKey: "searchableContent",
  header: "Content",
  enableGlobalFilter: true,
  cell: ({ row }) => row.getValue("searchableContent"),
}
```

## Hidden by Default Column

```tsx
{
  accessorKey: "internalId",
  header: "Internal ID",
  enableHiding: true,
  // This column will be hidden by default
  // Set in initial columnVisibility state: { internalId: false }
}
```
