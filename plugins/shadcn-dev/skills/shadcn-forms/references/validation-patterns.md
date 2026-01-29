# Advanced Zod Validation Patterns

Comprehensive validation patterns for forms with react-hook-form and zod.

## String Validations

### Email with Custom Error

```typescript
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
```

### Password with Requirements

```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
```

### Username Rules

```typescript
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
  .refine((val) => !val.startsWith("_"), "Username cannot start with underscore")
```

### URL Validation

```typescript
const urlSchema = z
  .string()
  .url("Invalid URL")
  .refine((url) => url.startsWith("https://"), "URL must use HTTPS")
```

### Phone Number

```typescript
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (E.164 format)")
```

## Number Validations

### Price Field

```typescript
const priceSchema = z
  .number()
  .min(0, "Price cannot be negative")
  .max(1000000, "Price exceeds maximum")
  .multipleOf(0.01, "Price must have at most 2 decimal places")
```

### Age Validation

```typescript
const ageSchema = z
  .number()
  .int("Age must be a whole number")
  .min(13, "Must be at least 13 years old")
  .max(120, "Invalid age")
```

### Quantity

```typescript
const quantitySchema = z
  .number()
  .int()
  .positive("Quantity must be positive")
  .max(99, "Maximum quantity is 99")
```

## Date Validations

### Future Date

```typescript
const futureDateSchema = z
  .date()
  .min(new Date(), "Date must be in the future")
```

### Date Range

```typescript
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
)
```

### Age from Birthdate

```typescript
const birthDateSchema = z
  .date()
  .max(new Date(), "Birthdate cannot be in the future")
  .refine(
    (date) => {
      const age = Math.floor(
        (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
      return age >= 18
    },
    "Must be at least 18 years old"
  )
```

## Array Validations

### Tags Array

```typescript
const tagsSchema = z
  .array(z.string().min(1))
  .min(1, "At least one tag is required")
  .max(5, "Maximum 5 tags allowed")
```

### Unique Items

```typescript
const uniqueItemsSchema = z
  .array(z.string())
  .refine(
    (items) => new Set(items).size === items.length,
    "All items must be unique"
  )
```

### Array of Objects

```typescript
const itemsSchema = z.array(
  z.object({
    name: z.string().min(1, "Name required"),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })
).min(1, "At least one item required")
```

## Object Validations

### Conditional Fields

```typescript
const formSchema = z.object({
  type: z.enum(["individual", "company"]),
  name: z.string().min(1),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "company") {
      return !!data.companyName && !!data.taxId
    }
    return true
  },
  {
    message: "Company name and Tax ID required for company accounts",
    path: ["companyName"],
  }
)
```

### Password Confirmation

```typescript
const passwordFormSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
)
```

### At Least One Field

```typescript
const contactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine(
  (data) => data.email || data.phone || data.address,
  "At least one contact method is required"
)
```

## Async Validations

### Check Username Availability

```typescript
const usernameSchema = z
  .string()
  .min(3)
  .refine(
    async (username) => {
      const response = await fetch(`/api/check-username?u=${username}`)
      const { available } = await response.json()
      return available
    },
    "Username is already taken"
  )
```

### Validate with API

```typescript
const formSchema = z.object({
  couponCode: z.string().optional(),
}).superRefine(async (data, ctx) => {
  if (data.couponCode) {
    const valid = await validateCoupon(data.couponCode)
    if (!valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid coupon code",
        path: ["couponCode"],
      })
    }
  }
})
```

## Transform and Preprocess

### Trim Whitespace

```typescript
const nameSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(z.string().min(1, "Name required"))
```

### Parse Number from String

```typescript
const numberSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number().positive())
```

### Normalize Email

```typescript
const emailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase().trim())
```

### Default Values

```typescript
const settingsSchema = z.object({
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark"]).default("light"),
  pageSize: z.number().default(10),
})
```

## Discriminated Unions

### Payment Method

```typescript
const paymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string().length(16),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/),
    cvv: z.string().length(3),
  }),
  z.object({
    method: z.literal("paypal"),
    email: z.string().email(),
  }),
  z.object({
    method: z.literal("bank"),
    accountNumber: z.string(),
    routingNumber: z.string(),
  }),
])
```

### Notification Settings

```typescript
const notificationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    emailAddress: z.string().email(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
  }),
  z.object({
    type: z.literal("sms"),
    phoneNumber: z.string(),
  }),
  z.object({
    type: z.literal("push"),
    deviceToken: z.string(),
  }),
])
```

## File Validations

### Image Upload

```typescript
const imageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPEG, PNG, and WebP images are allowed"
  )
```

### Multiple Files

```typescript
const filesSchema = z
  .array(z.instanceof(File))
  .min(1, "At least one file required")
  .max(5, "Maximum 5 files allowed")
  .refine(
    (files) => files.every((f) => f.size <= 10 * 1024 * 1024),
    "Each file must be less than 10MB"
  )
```

## Error Customization

### Custom Error Map

```typescript
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "This field is required" }
    }
  }
  return { message: ctx.defaultError }
}

z.setErrorMap(customErrorMap)
```

### Field-Specific Messages

```typescript
const schema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }).email({ message: "Invalid email format" }),
})
```
