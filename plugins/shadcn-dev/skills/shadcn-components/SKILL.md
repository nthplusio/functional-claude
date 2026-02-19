---
name: shadcn-components
description: This skill should be used when the user asks to "add a button", "create a dialog", "use card component", "shadcn accordion", "dropdown menu", "add alert", "tooltip component", or mentions specific shadcn/ui component usage, customization, or implementation patterns.
version: 0.2.0
---

# shadcn/ui Component Usage

Guide for using, customizing, and composing shadcn/ui components in React applications.

## Adding Components

### CLI Installation

```bash
# Add single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button card dialog input

# Add with dependencies
npx shadcn@latest add form  # Adds form + label + input
```

### Manual Installation

Components can be copied directly from https://ui.shadcn.com/docs/components

## Component Categories

### Form Components

| Component | Use Case |
|-----------|----------|
| `input` | Text input fields |
| `textarea` | Multi-line text |
| `select` | Dropdown selection |
| `checkbox` | Boolean toggle |
| `radio-group` | Single selection from options |
| `switch` | On/off toggle |
| `slider` | Range selection |
| `form` | Form validation wrapper |

### Layout Components

| Component | Use Case |
|-----------|----------|
| `card` | Content container |
| `separator` | Visual divider |
| `aspect-ratio` | Fixed aspect container |
| `scroll-area` | Custom scrollbars |
| `resizable` | Resizable panels |

### Feedback Components

| Component | Use Case |
|-----------|----------|
| `alert` | Important messages |
| `badge` | Status indicators |
| `progress` | Loading progress |
| `skeleton` | Loading placeholders |
| `toast/sonner` | Notifications |

### Overlay Components

| Component | Use Case |
|-----------|----------|
| `dialog` | Modal windows |
| `alert-dialog` | Confirmation dialogs |
| `sheet` | Side panels |
| `drawer` | Bottom/side drawers |
| `popover` | Floating content |
| `tooltip` | Hover information |
| `hover-card` | Rich hover content |

### Navigation Components

| Component | Use Case |
|-----------|----------|
| `tabs` | Tabbed interfaces |
| `navigation-menu` | Main navigation |
| `breadcrumb` | Location breadcrumbs |
| `pagination` | Page navigation |
| `command` | Command palette |
| `menubar` | Application menu |
| `context-menu` | Right-click menu |
| `dropdown-menu` | Action menus |

### Data Display

| Component | Use Case |
|-----------|----------|
| `table` | Data tables |
| `data-table` | Advanced tables (TanStack) |
| `accordion` | Collapsible sections |
| `collapsible` | Single collapse |
| `avatar` | User images |
| `calendar` | Date picker |
| `carousel` | Image galleries |

## Component Variants

Most components support variants via `variant` prop:

### Button Variants

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes

```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

## Component Customization

### Using cn() for Custom Classes

```tsx
import { cn } from "@/lib/utils"

<Button className={cn(
  "w-full",
  isActive && "ring-2 ring-primary",
  disabled && "opacity-50"
)}>
  Custom Button
</Button>
```

### Extending Components

Create wrapper components for reusable customizations:

```tsx
// components/ui/button-loading.tsx
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ButtonLoadingProps extends ButtonProps {
  loading?: boolean
}

export function ButtonLoading({
  loading,
  children,
  disabled,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

### Adding New Variants

Edit the component's cva() definition:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "...", // base styles
  {
    variants: {
      variant: {
        // existing variants...
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
)
```

## Common Patterns

### Dialog with Form

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="John Doe" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Dropdown Menu with Icons

```tsx
import {
  User, Settings, LogOut, Plus
} from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs with Content

```tsx
<Tabs defaultValue="account" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Make changes to your account here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Account form */}
      </CardContent>
    </Card>
  </TabsContent>
  <TabsContent value="password">
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Password form */}
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

## Reference Files

- **`references/component-catalog.md`** - Full component list with props
- **`references/icon-patterns.md`** - Lucide icon usage patterns

## Resources

- Component docs: https://ui.shadcn.com/docs/components
- Examples: https://ui.shadcn.com/examples
- Blocks: https://ui.shadcn.com/blocks
