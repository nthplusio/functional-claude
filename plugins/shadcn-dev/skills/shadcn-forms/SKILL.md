---
name: shadcn-forms
description: This skill should be used when the user asks about "form validation", "react-hook-form", "zod schema", "form submission", "input validation", "form errors", "useForm hook", "form field", or mentions form handling, validation, or react-hook-form integration with shadcn.
version: 0.3.0
---

# shadcn/ui Forms

Build validated forms with react-hook-form, zod, and shadcn/ui components.

## Setup

```bash
npm install react-hook-form zod @hookform/resolvers
npx shadcn@latest add form input label
```

shadcn's Form component wraps react-hook-form with accessible fields:
`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`

## Basic Form Pattern

### 1. Define Zod Schema

```tsx
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

type FormValues = z.infer<typeof formSchema>
```

### 2. Create Form with useForm + FormField

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  })

  async function onSubmit(data: FormValues) {
    // Handle submission
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  )
}
```

For complete form examples (Login, Registration, Profile, Contact, Multi-Step), see [references/form-examples.md](references/form-examples.md).

## Form Field Types

Each field type follows the same `FormField` → `render` pattern with different components:

| Field Type | Component | Install |
|-----------|-----------|---------|
| Text Input | `Input` | `npx shadcn@latest add input` |
| Select | `Select` + `SelectContent` + `SelectItem` | `npx shadcn@latest add select` |
| Checkbox | `Checkbox` | `npx shadcn@latest add checkbox` |
| Textarea | `Textarea` | `npx shadcn@latest add textarea` |
| Switch | `Switch` | `npx shadcn@latest add switch` |
| Date Picker | `Calendar` + `Popover` | `npx shadcn@latest add popover calendar` |

For field-specific implementation patterns, see [references/form-examples.md](references/form-examples.md).

## Zod Validation Patterns

Common schema patterns:

- **Registration** — Password confirmation with `.refine()`, regex rules
- **Contact** — Required strings with min lengths
- **Profile** — Optional fields with `.optional()`, arrays with `z.array()`

For 15+ validation patterns (string, number, date, array, object, async, transform, discriminated union, file, error customization), see [references/validation-patterns.md](references/validation-patterns.md).

## Form Patterns

| Pattern | Key Technique |
|---------|--------------|
| Async Validation | `mode: "onBlur"` + `form.setError()` after API check |
| Multi-Step | `form.trigger(fields)` to validate current step before advancing |
| Loading State | `useState(isLoading)` + disable submit button during request |

For implementations, see [references/form-examples.md](references/form-examples.md).

## Reference Files

| File | Contents | Read when... |
|------|----------|-------------|
| [references/form-examples.md](references/form-examples.md) | Login, Registration, Profile Settings, Contact with File Upload, Multi-Step Form, Date Picker, Loading State | Building a complete form or looking for field-type patterns |
| [references/validation-patterns.md](references/validation-patterns.md) | 15+ Zod patterns: string, number, date, array, object, async, transform, discriminated union, file, error customization | Writing complex validation schemas |

## Resources

- react-hook-form: https://react-hook-form.com
- Zod: https://zod.dev
- shadcn Form docs: https://ui.shadcn.com/docs/components/form
