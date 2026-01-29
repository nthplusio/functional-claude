# Component Catalog

Complete reference of shadcn/ui components with props and usage.

## Installation Reference

All components can be installed via CLI:

```bash
npx shadcn@latest add [component-name]
```

## Form Components

### Button

```bash
npx shadcn@latest add button
```

**Props:**
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `asChild`: boolean - Merge props with child element

```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline" size="lg">Click me</Button>
```

### Input

```bash
npx shadcn@latest add input
```

**Props:** Extends HTMLInputElement props

```tsx
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />
```

### Textarea

```bash
npx shadcn@latest add textarea
```

```tsx
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Type your message" rows={4} />
```

### Select

```bash
npx shadcn@latest add select
```

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

```bash
npx shadcn@latest add checkbox
```

```tsx
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

### Radio Group

```bash
npx shadcn@latest add radio-group
```

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <label htmlFor="option1">Option 1</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <label htmlFor="option2">Option 2</label>
  </div>
</RadioGroup>
```

### Switch

```bash
npx shadcn@latest add switch
```

```tsx
import { Switch } from "@/components/ui/switch"

<Switch id="airplane-mode" />
```

### Slider

```bash
npx shadcn@latest add slider
```

```tsx
import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[50]} max={100} step={1} />
```

## Layout Components

### Card

```bash
npx shadcn@latest add card
```

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Separator

```bash
npx shadcn@latest add separator
```

```tsx
import { Separator } from "@/components/ui/separator"

<Separator orientation="horizontal" />
```

### Scroll Area

```bash
npx shadcn@latest add scroll-area
```

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-72 w-48 rounded-md border">
  {/* Long content */}
</ScrollArea>
```

### Resizable

```bash
npx shadcn@latest add resizable
```

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Two</ResizablePanel>
</ResizablePanelGroup>
```

## Overlay Components

### Dialog

```bash
npx shadcn@latest add dialog
```

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Alert Dialog

```bash
npx shadcn@latest add alert-dialog
```

For destructive confirmations.

### Sheet

```bash
npx shadcn@latest add sheet
```

Side panel overlay.

### Drawer

```bash
npx shadcn@latest add drawer
```

Mobile-friendly bottom drawer (uses Vaul).

### Popover

```bash
npx shadcn@latest add popover
```

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

### Tooltip

```bash
npx shadcn@latest add tooltip
```

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Navigation Components

### Tabs

```bash
npx shadcn@latest add tabs
```

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Navigation Menu

```bash
npx shadcn@latest add navigation-menu
```

Complex navigation with dropdowns.

### Breadcrumb

```bash
npx shadcn@latest add breadcrumb
```

### Pagination

```bash
npx shadcn@latest add pagination
```

### Command (cmdk)

```bash
npx shadcn@latest add command
```

Command palette / search.

### Dropdown Menu

```bash
npx shadcn@latest add dropdown-menu
```

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Feedback Components

### Alert

```bash
npx shadcn@latest add alert
```

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>Important message here.</AlertDescription>
</Alert>
```

### Badge

```bash
npx shadcn@latest add badge
```

**Variants:** "default" | "secondary" | "destructive" | "outline"

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="secondary">Badge</Badge>
```

### Progress

```bash
npx shadcn@latest add progress
```

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={33} />
```

### Skeleton

```bash
npx shadcn@latest add skeleton
```

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[250px]" />
```

### Sonner (Toast)

```bash
npx shadcn@latest add sonner
```

```tsx
import { toast } from "sonner"

toast("Event has been created")
toast.success("Success!")
toast.error("Error!")
```

## Data Display

### Table

```bash
npx shadcn@latest add table
```

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Accordion

```bash
npx shadcn@latest add accordion
```

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes.</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Avatar

```bash
npx shadcn@latest add avatar
```

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Calendar

```bash
npx shadcn@latest add calendar
```

Uses react-day-picker.

### Carousel

```bash
npx shadcn@latest add carousel
```

Uses embla-carousel-react.
