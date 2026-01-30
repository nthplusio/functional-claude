# OpenTUI Solid (@opentui/solid)

A SolidJS reconciler for building terminal user interfaces with fine-grained reactivity. Get optimal re-renders without virtual DOM overhead.

## Overview

OpenTUI Solid provides:
- **Solid reconciler**: Components render to OpenTUI renderables
- **JSX intrinsics**: `<text>`, `<box>`, `<input>`, etc.
- **Fine-grained reactivity**: Only affected nodes update
- **Signals**: Reactive primitives without useState batching

## When to Use Solid

Use the Solid reconciler when:
- You want optimal re-render performance
- You prefer fine-grained reactivity over virtual DOM diffing
- You want smaller bundle than React
- You're familiar with or want to learn Solid patterns

## Quick Start

```bash
bunx create-tui@latest -t solid my-app
cd my-app
bun run src/index.tsx
```

Or manual setup:

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/solid @opentui/core solid-js
```

```tsx
import { render } from "@opentui/solid"
import { createSignal } from "solid-js"

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <box border padding={2}>
      <text>Count: {count()}</text>
      <box
        border
        onMouseDown={() => setCount(c => c + 1)}
      >
        <text>Click me!</text>
      </box>
    </box>
  )
}

render(() => <App />)
```

## JSX Element Differences

Solid uses underscores where React uses hyphens:

| Concept | React | Solid |
|---------|-------|-------|
| Tab Select | `<tab-select>` | `<tab_select>` |
| ASCII Font | `<ascii-font>` | `<ascii_font>` |
| Line Number | `<line-number>` | `<line_number>` |

## Signals vs State

```tsx
// React
const [count, setCount] = useState(0)
<text>Count: {count}</text>

// Solid - note the () to read signal
const [count, setCount] = createSignal(0)
<text>Count: {count()}</text>
```

## Input Handling

Solid uses `onInput` instead of `onChange`:

```tsx
// React
<input value={value} onChange={setValue} />

// Solid
<input value={value()} onInput={setValue} />
```

## Available Components

### Layout & Display
- `<text>` - Styled text content
- `<box>` - Container with borders and layout
- `<scrollbox>` - Scrollable container
- `<ascii_font>` - ASCII art text (note underscore)

### Input
- `<input>` - Single-line text input
- `<textarea>` - Multi-line text input
- `<select>` - List selection
- `<tab_select>` - Tab-based selection (note underscore)

### Code & Diff
- `<code>` - Syntax-highlighted code
- `<line_number>` - Code with line numbers (note underscore)
- `<diff>` - Unified or split diff viewer

## Essential Hooks

```tsx
import {
  useRenderer,
  useKeyboard,
  useOnResize,
  useTerminalDimensions,
  useTimeline,
} from "@opentui/solid"
```

### useKeyboard

```tsx
function App() {
  const renderer = useRenderer()
  useKeyboard((key) => {
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return <text>Press ESC to exit</text>
}
```

### useTimeline

```tsx
function AnimatedBox() {
  const [width, setWidth] = createSignal(0)

  const timeline = useTimeline({
    duration: 2000,
  })

  onMount(() => {
    timeline.add(
      { width: 0 },
      {
        width: 50,
        duration: 2000,
        ease: "easeOutQuad",
        onUpdate: (anim) => {
          setWidth(Math.round(anim.targets[0].width))
        },
      }
    )
  })

  return <box width={width()} height={3} backgroundColor="#6a5acd" />
}
```

## Patterns

### Form with Focus Management

```tsx
function LoginForm() {
  const [username, setUsername] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [focusField, setFocusField] = createSignal<"username" | "password">("username")

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocusField(f => f === "username" ? "password" : "username")
    }
  })

  return (
    <box flexDirection="column" gap={1} border padding={2}>
      <box flexDirection="row" gap={1}>
        <text>Username:</text>
        <input
          value={username()}
          onInput={setUsername}
          focused={focusField() === "username"}
          width={20}
        />
      </box>
      <box flexDirection="row" gap={1}>
        <text>Password:</text>
        <input
          value={password()}
          onInput={setPassword}
          focused={focusField() === "password"}
          width={20}
        />
      </box>
    </box>
  )
}
```

### Reactive List

```tsx
function TodoList() {
  const [todos, setTodos] = createSignal([
    { id: 1, text: "Learn OpenTUI", done: false },
    { id: 2, text: "Build TUI app", done: false },
  ])

  const toggle = (id: number) => {
    setTodos(todos => todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ))
  }

  return (
    <box flexDirection="column">
      <For each={todos()}>
        {(todo) => (
          <text fg={todo.done ? "#666" : "#fff"}>
            [{todo.done ? "x" : " "}] {todo.text}
          </text>
        )}
      </For>
    </box>
  )
}
```

### Conditional Rendering

```tsx
function ConditionalUI() {
  const [showDetails, setShowDetails] = createSignal(false)

  return (
    <box flexDirection="column">
      <text>Press 'd' to toggle details</text>
      <Show when={showDetails()}>
        <box border padding={1}>
          <text>Detailed information here...</text>
        </box>
      </Show>
    </box>
  )
}
```

## Testing

Solid exports `testRender` directly from the main package:

```tsx
import { testRender } from "@opentui/solid"

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

**Note**: Unlike React, Solid's `testRender` takes a **function component** (not a JSX element).

## Gotchas

### Signal Access Requires ()

```tsx
// WRONG - signal not read
const [count, setCount] = createSignal(0)
<text>Count: {count}</text>  // Shows [Function]

// CORRECT
<text>Count: {count()}</text>
```

### Underscores Not Hyphens

```tsx
// WRONG
<tab-select />

// CORRECT
<tab_select />
```

### onInput vs onChange

```tsx
// React pattern (doesn't work)
<input value={value()} onChange={setValue} />

// Solid pattern
<input value={value()} onInput={setValue} />
```

### Focus Required for Input

```tsx
// WRONG - won't receive input
<input placeholder="Type here" />

// CORRECT
<input placeholder="Type here" focused />
```
