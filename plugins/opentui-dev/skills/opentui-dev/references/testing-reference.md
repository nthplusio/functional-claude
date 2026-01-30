# Testing OpenTUI Applications

How to test terminal user interfaces built with OpenTUI.

## Overview

OpenTUI provides:
- **Test Renderer**: Headless renderer for testing
- **Snapshot Testing**: Verify visual output
- **Interaction Testing**: Simulate user input

## Test Setup

### Bun Test Runner

OpenTUI uses Bun's built-in test runner:

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test"
```

### Test Renderer

```typescript
import { createTestRenderer } from "@opentui/core/testing"

const testSetup = await createTestRenderer({
  width: 80,     // Terminal width
  height: 24,    // Terminal height
})
```

## React Testing

### Test Utilities

```tsx
import { testRender } from "@opentui/react/test-utils"
```

### Basic Component Test

```tsx
import { test, expect } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

function Greeting({ name }: { name: string }) {
  return <text>Hello, {name}!</text>
}

test("Greeting renders name", async () => {
  const testSetup = await testRender(
    <Greeting name="World" />,
    { width: 80, height: 24 }
  )

  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()

  expect(frame).toContain("Hello, World!")
})
```

### Snapshot Testing

```tsx
import { test, expect, afterEach } from "bun:test"
import { testRender } from "@opentui/react/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("component matches snapshot", async () => {
  testSetup = await testRender(
    <box style={{ width: 20, height: 5, border: true }}>
      <text>Content</text>
    </box>,
    { width: 25, height: 8 }
  )

  await testSetup.renderOnce()
  expect(testSetup.captureCharFrame()).toMatchSnapshot()
})
```

## Solid Testing

### Test Utilities

```tsx
import { testRender } from "@opentui/solid"
```

**Note**: Unlike React, Solid's `testRender` takes a **function component** (not a JSX element).

### Basic Component Test

```tsx
import { test, expect } from "bun:test"
import { testRender } from "@opentui/solid"

function Greeting(props: { name: string }) {
  return <text>Hello, {props.name}!</text>
}

test("Greeting renders name", async () => {
  const testSetup = await testRender(
    () => <Greeting name="World" />,
    { width: 80, height: 24 }
  )

  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()

  expect(frame).toContain("Hello, World!")
})
```

## Core Testing

### Basic Test

```typescript
import { test, expect } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"
import { TextRenderable } from "@opentui/core"

test("renders text", async () => {
  const testSetup = await createTestRenderer({
    width: 40,
    height: 10,
  })

  const text = new TextRenderable(testSetup.renderer, {
    id: "greeting",
    content: "Hello, World!",
  })

  testSetup.renderer.root.add(text)
  await testSetup.renderOnce()

  expect(testSetup.captureCharFrame()).toContain("Hello, World!")
})
```

## Test Setup Return Object

The test setup object has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `renderer` | `Renderer` | The headless renderer instance |
| `renderOnce` | `() => Promise<void>` | Triggers a single render cycle |
| `captureCharFrame` | `() => string` | Captures current output as text |
| `resize` | `(width, height) => void` | Resize the virtual terminal |

## Interaction Testing

### Simulating Key Presses

```typescript
testSetup.renderer.keyInput.emit("keypress", {
  name: "enter",
  sequence: "\r",
  ctrl: false,
  shift: false,
  meta: false,
  option: false,
  eventType: "press",
  repeated: false,
})

await testSetup.renderOnce()
expect(testSetup.captureCharFrame()).toContain("Selected")
```

### Testing Focus

```typescript
const input = new InputRenderable(testSetup.renderer, {
  id: "test-input",
  placeholder: "Type here",
})
testSetup.renderer.root.add(input)

input.focus()

expect(input.isFocused()).toBe(true)
```

## Cleanup Pattern

Always destroy the renderer after each test:

```typescript
let testSetup: Awaited<ReturnType<typeof testRender>>

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy()
  }
})

test("test 1", async () => {
  testSetup = await testRender(<Component1 />, { width: 40, height: 10 })
  // ...
})

test("test 2", async () => {
  testSetup = await testRender(<Component2 />, { width: 40, height: 10 })
  // ...
})
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/components/Button.test.tsx

# Run with filter
bun test --filter "Button"

# Watch mode
bun test --watch

# Update snapshots
bun test --update-snapshots
```

## Debugging Tests

### Print Frame Output

```tsx
test("debug output", async () => {
  const testSetup = await testRender(<MyComponent />, { width: 40, height: 10 })

  await testSetup.renderOnce()
  const frame = testSetup.captureCharFrame()

  console.log(frame)  // Print to see what's rendered

  expect(frame).toContain("expected")
})
```

## Gotchas

### Async Rendering

Always call `renderOnce()` after setting up your component:

```typescript
const testSetup = await testRender(<MyComponent />, { width: 40, height: 10 })
await testSetup.renderOnce()  // Required!
const frame = testSetup.captureCharFrame()
```

### Snapshot Dimensions

Be consistent with test dimensions for stable snapshots:

```typescript
const testSetup = await createTestRenderer({
  width: 80,   // Standard width
  height: 24,  // Standard height
})
```

### Run from Package Directory

```bash
cd packages/core
bun test

# Not from repo root for package-specific tests
```
