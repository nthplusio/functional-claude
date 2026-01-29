# Lucide Icon Usage Patterns

Patterns for using Lucide React icons with shadcn/ui components.

## Installation

```bash
npm install lucide-react
```

## Basic Usage

```tsx
import { Home, Settings, User } from "lucide-react"

<Home className="h-4 w-4" />
<Settings className="h-6 w-6" />
<User className="h-8 w-8" />
```

## Icons in Buttons

### Icon Only Button

```tsx
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>

<Button size="icon" variant="outline">
  <Settings className="h-4 w-4" />
</Button>
```

### Icon with Text

```tsx
import { Mail } from "lucide-react"

// Icon before text
<Button>
  <Mail className="mr-2 h-4 w-4" />
  Send Email
</Button>

// Icon after text
<Button>
  View All
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

### Loading State

```tsx
import { Loader2 } from "lucide-react"

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

## Icons in Dropdowns

```tsx
import {
  User,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  UserPlus,
  Mail,
} from "lucide-react"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <User className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <CreditCard className="mr-2 h-4 w-4" />
      Billing
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Icons in Navigation

```tsx
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
} from "lucide-react"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: FileText, label: "Documents", href: "/docs" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

{navItems.map((item) => (
  <Link
    key={item.href}
    href={item.href}
    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary"
  >
    <item.icon className="h-4 w-4" />
    {item.label}
  </Link>
))}
```

## Icons in Alerts

```tsx
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Info alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

// Success alert
<Alert className="border-green-500">
  <CheckCircle className="h-4 w-4 text-green-500" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>

// Warning alert
<Alert className="border-yellow-500">
  <AlertCircle className="h-4 w-4 text-yellow-500" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review before continuing.</AlertDescription>
</Alert>
```

## Icons in Inputs

```tsx
import { Search, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"

// Search input
<div className="relative">
  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input placeholder="Search..." className="pl-8" />
</div>

// Password toggle
const [showPassword, setShowPassword] = useState(false)

<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2.5 top-2.5"
  >
    {showPassword ? (
      <EyeOff className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Eye className="h-4 w-4 text-muted-foreground" />
    )}
  </button>
</div>
```

## Icons in Cards

```tsx
import { Package, DollarSign, Users, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { title: "Total Revenue", icon: DollarSign, value: "$45,231.89" },
  { title: "Subscriptions", icon: Users, value: "+2350" },
  { title: "Sales", icon: Package, value: "+12,234" },
  { title: "Active Now", icon: Activity, value: "+573" },
]

{stats.map((stat) => (
  <Card key={stat.title}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
      <stat.icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stat.value}</div>
    </CardContent>
  </Card>
))}
```

## Icons in Badges

```tsx
import { Check, Clock, AlertTriangle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

<Badge variant="default" className="gap-1">
  <Check className="h-3 w-3" />
  Completed
</Badge>

<Badge variant="secondary" className="gap-1">
  <Clock className="h-3 w-3" />
  Pending
</Badge>

<Badge variant="outline" className="gap-1 text-yellow-600">
  <AlertTriangle className="h-3 w-3" />
  Warning
</Badge>

<Badge variant="destructive" className="gap-1">
  <X className="h-3 w-3" />
  Failed
</Badge>
```

## Common Icon Categories

### Navigation
```tsx
import {
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react"
```

### Actions
```tsx
import {
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash,
  Copy,
  Download,
  Upload,
  Share,
  Refresh,
  RotateCw,
} from "lucide-react"
```

### Files & Media
```tsx
import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Folder,
  FolderOpen,
  Archive,
  Paperclip,
} from "lucide-react"
```

### Communication
```tsx
import {
  Mail,
  MessageSquare,
  Phone,
  Video,
  Bell,
  Send,
  Inbox,
  AtSign,
} from "lucide-react"
```

### User & Profile
```tsx
import {
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react"
```

### Status & Feedback
```tsx
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Loader2,
  Clock,
} from "lucide-react"
```

## Icon Styling

### Colors

```tsx
// Using text color classes
<Check className="h-4 w-4 text-green-500" />
<X className="h-4 w-4 text-red-500" />
<AlertCircle className="h-4 w-4 text-yellow-500" />
<Info className="h-4 w-4 text-blue-500" />

// Using CSS variables
<Check className="h-4 w-4 text-primary" />
<X className="h-4 w-4 text-destructive" />
<Info className="h-4 w-4 text-muted-foreground" />
```

### Stroke Width

```tsx
// Default is 2
<Home className="h-4 w-4" strokeWidth={2} />

// Thinner
<Home className="h-4 w-4" strokeWidth={1.5} />

// Thicker
<Home className="h-4 w-4" strokeWidth={2.5} />
```

### Animation

```tsx
// Spin
<Loader2 className="h-4 w-4 animate-spin" />

// Pulse
<Bell className="h-4 w-4 animate-pulse" />

// Bounce
<ArrowDown className="h-4 w-4 animate-bounce" />
```

## Resources

- Lucide Icons: https://lucide.dev
- Icon search: https://lucide.dev/icons
- React package: https://lucide.dev/guide/packages/lucide-react
