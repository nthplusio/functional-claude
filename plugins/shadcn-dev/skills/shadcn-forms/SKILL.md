---
name: shadcn-forms
description: This skill should be used when the user asks about "form validation", "react-hook-form", "zod schema", "form submission", "input validation", "form errors", "useForm hook", "form field", or mentions form handling, validation, or react-hook-form integration with shadcn.
version: 0.1.5
---

# shadcn/ui Forms

Build validated forms with react-hook-form, zod, and shadcn/ui components.

## Setup

### Install Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers
npx shadcn@latest add form input label
```

### Form Component Overview

shadcn's Form component wraps react-hook-form with accessible form fields:

- `Form` - FormProvider wrapper
- `FormField` - Controller wrapper
- `FormItem` - Field container
- `FormLabel` - Accessible label
- `FormControl` - Input wrapper
- `FormDescription` - Helper text
- `FormMessage` - Error message

## Basic Form Pattern

### 1. Define Zod Schema

```tsx
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormValues = z.infer<typeof formSchema>
```

### 2. Create Form Component

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function SignupForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: FormValues) {
    console.log(data)
    // Handle form submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                Your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  )
}
```

## Form Field Types

### Select Field

```tsx
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="guest">Guest</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox Field

```tsx
<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Accept terms and conditions</FormLabel>
        <FormDescription>
          You agree to our Terms of Service and Privacy Policy.
        </FormDescription>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea Field

```tsx
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Tell us about yourself"
          className="resize-none"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Max 500 characters.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Switch Field

```tsx
<FormField
  control={form.control}
  name="notifications"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Email Notifications</FormLabel>
        <FormDescription>
          Receive emails about your account.
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

### Date Picker Field

```tsx
<FormField
  control={form.control}
  name="dob"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Date of birth</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Common Zod Schemas

### User Registration

```tsx
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

### Contact Form

```tsx
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})
```

### Profile Settings

```tsx
const profileSchema = z.object({
  username: z.string().min(2).max(30),
  bio: z.string().max(500).optional(),
  urls: z.array(z.string().url()).optional(),
  notifications: z.boolean().default(true),
})
```

## Form Patterns

### Async Validation

```tsx
const schema = z.object({
  username: z.string().min(2),
})

// In form
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur", // Validate on blur
})

// Custom async validation
async function checkUsername(username: string) {
  const response = await fetch(`/api/check-username?u=${username}`)
  const { available } = await response.json()
  if (!available) {
    form.setError("username", { message: "Username already taken" })
  }
}
```

### Multi-Step Forms

```tsx
const [step, setStep] = useState(1)

function onNext() {
  const fields = step === 1
    ? ["email", "password"]
    : ["name", "bio"]

  form.trigger(fields).then((valid) => {
    if (valid) setStep(step + 1)
  })
}
```

### Form with Loading State

```tsx
const [isLoading, setIsLoading] = useState(false)

async function onSubmit(data: FormValues) {
  setIsLoading(true)
  try {
    await submitForm(data)
    toast.success("Form submitted!")
  } catch (error) {
    toast.error("Something went wrong")
  } finally {
    setIsLoading(false)
  }
}
```

## Reference Files

- **`references/validation-patterns.md`** - Advanced zod patterns
- **`references/form-examples.md`** - Complete form examples

## Resources

- react-hook-form: https://react-hook-form.com
- Zod: https://zod.dev
- shadcn Form docs: https://ui.shadcn.com/docs/components/form
