# Common Component Patterns

Reusable patterns for composing shadcn/ui components effectively.

## Component Composition

### Compound Components

shadcn components use compound component patterns extensively:

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### asChild Pattern

The `asChild` prop merges component behavior with custom elements:

```tsx
// Trigger renders as your custom button
<DialogTrigger asChild>
  <Button variant="outline" size="lg">
    Custom Trigger
  </Button>
</DialogTrigger>

// Without asChild, renders default button
<DialogTrigger>Open Dialog</DialogTrigger>
```

## Loading States

### Button with Loading

```tsx
import { Loader2 } from "lucide-react"

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Processing..." : "Submit"}
</Button>
```

### Skeleton Loading

```tsx
import { Skeleton } from "@/components/ui/skeleton"

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  )
}
```

## Modal Patterns

### Controlled Dialog

```tsx
function ControlledDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogHeader>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  )
}
```

### Alert Dialog for Destructive Actions

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Form Patterns

### Input with Label and Error

```tsx
<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="email@example.com"
    className={errors.email ? "border-destructive" : ""}
  />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email.message}</p>
  )}
</div>
```

### Select with Placeholder

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

## Navigation Patterns

### Tabs with Router Integration

```tsx
// Next.js App Router
"use client"

import { usePathname, useRouter } from "next/navigation"

function TabNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Tabs value={pathname} onValueChange={router.push}>
      <TabsList>
        <TabsTrigger value="/dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="/settings">Settings</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
```

### Breadcrumb Pattern

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Toast Notifications

### Using Sonner (Recommended)

```tsx
import { toast } from "sonner"

// Success
toast.success("Changes saved successfully")

// Error
toast.error("Failed to save changes")

// With action
toast("Event created", {
  action: {
    label: "Undo",
    onClick: () => undoCreate()
  }
})

// Promise
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save"
})
```

## Layout Patterns

### Card Grid

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Responsive Sidebar

```tsx
<div className="flex min-h-screen">
  <aside className="hidden w-64 border-r md:block">
    <Sidebar />
  </aside>
  <main className="flex-1 p-6">
    {children}
  </main>
</div>
```

## Accessibility Patterns

### Focus Management

```tsx
// Auto-focus first input in dialog
<DialogContent>
  <Input autoFocus />
</DialogContent>

// Focus trap is automatic in Radix dialogs
```

### Keyboard Navigation

All shadcn components support keyboard navigation:
- `Tab` - Move between interactive elements
- `Enter/Space` - Activate buttons/links
- `Escape` - Close dialogs/dropdowns
- `Arrow keys` - Navigate menus/selects

### Screen Reader Announcements

```tsx
// Visually hidden but announced
<span className="sr-only">Loading, please wait</span>

// Live region for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {status}
</div>
```

## Error Handling Patterns

### Error Boundary Fallback

```tsx
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{error.message}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </CardFooter>
    </Card>
  )
}
```

### Empty State

```tsx
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No items found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first item.
      </p>
      <Button className="mt-4">Create Item</Button>
    </div>
  )
}
```
