# OpenTUI React (@opentui/react)

A React reconciler for building terminal user interfaces with familiar React patterns. Write TUIs using JSX, hooks, and component composition.

## Overview

OpenTUI React provides:
- **Custom reconciler**: React components render to OpenTUI renderables
- **JSX intrinsics**: `<text>`, `<box>`, `<input>`, etc.
- **Hooks**: `useKeyboard`, `useRenderer`, `useTimeline`, etc.
- **Full React compatibility**: useState, useEffect, context, and more

## When to Use React

Use the React reconciler when:
- You're familiar with React patterns
- You want declarative UI composition
- You need React's ecosystem (context, state management libraries)
- Building applications with complex state
- Team knows React already

## Quick Start

```bash
bunx create-tui@latest -t react my-app
cd my-app
bun run src/index.tsx
```

Or manual setup:

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/react @opentui/core react
```

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  return (
    <box border padding={2}>
      <text>Count: {count}</text>
      <box
        border
        onMouseDown={() => setCount(c => c + 1)}
      >
        <text>Click me!</text>
      </box>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

## JSX Elements

React maps JSX intrinsic elements to OpenTUI renderables:

```tsx
// These are not HTML elements!
<text>Hello</text>           // TextRenderable
<box border>Content</box>    // BoxRenderable
<input placeholder="..." />  // InputRenderable
<select options={[...]} />   // SelectRenderable
```

## Text Modifiers

Inside `<text>`, use modifier elements:

```tsx
<text>
  <strong>Bold</strong>, <em>italic</em>, and <u>underlined</u>
  <span fg="red">Colored text</span>
  <br />
  New line with <a href="https://example.com">link</a>
</text>
```

## Styling

Two approaches to styling:

```tsx
// Direct props
<box backgroundColor="blue" padding={2} border>
  <text fg="#00FF00">Green text</text>
</box>

// Style prop
<box style={{ backgroundColor: "blue", padding: 2, border: true }}>
  <text style={{ fg: "#00FF00" }}>Green text</text>
</box>
```

## Available Components

### Layout & Display
- `<text>` - Styled text content
- `<box>` - Container with borders and layout
- `<scrollbox>` - Scrollable container
- `<ascii-font>` - ASCII art text

### Input
- `<input>` - Single-line text input
- `<textarea>` - Multi-line text input
- `<select>` - List selection
- `<tab-select>` - Tab-based selection

### Code & Diff
- `<code>` - Syntax-highlighted code
- `<line-number>` - Code with line numbers
- `<diff>` - Unified or split diff viewer

### Text Modifiers (inside `<text>`)
- `<span>` - Inline styled text
- `<strong>`, `<b>` - Bold
- `<em>`, `<i>` - Italic
- `<u>` - Underline
- `<br>` - Line break
- `<a>` - Link

## Essential Hooks

```tsx
import {
  useRenderer,
  useKeyboard,
  useOnResize,
  useTerminalDimensions,
  useTimeline,
} from "@opentui/react"
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

### useTerminalDimensions

```tsx
function ResponsiveApp() {
  const { width, height } = useTerminalDimensions()

  return (
    <box width={width} height={height}>
      <text>Terminal: {width}x{height}</text>
    </box>
  )
}
```

### useTimeline

```tsx
function AnimatedBox() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
  })

  useEffect(() => {
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
  }, [])

  return <box width={width} height={3} backgroundColor="#6a5acd" />
}
```

## Patterns

### Form with Focus Management

```tsx
function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [focusField, setFocusField] = useState<"username" | "password">("username")

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
          value={username}
          onChange={setUsername}
          focused={focusField === "username"}
          width={20}
        />
      </box>
      <box flexDirection="row" gap={1}>
        <text>Password:</text>
        <input
          value={password}
          onChange={setPassword}
          focused={focusField === "password"}
          width={20}
        />
      </box>
    </box>
  )
}
```

### Navigation Menu

```tsx
function Menu() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const items = ["Home", "Settings", "Help", "Quit"]

  useKeyboard((key) => {
    switch (key.name) {
      case "up":
      case "k":
        setSelectedIndex(i => Math.max(0, i - 1))
        break
      case "down":
      case "j":
        setSelectedIndex(i => Math.min(items.length - 1, i + 1))
        break
      case "enter":
        handleSelect(items[selectedIndex])
        break
    }
  })

  return (
    <box flexDirection="column">
      {items.map((item, i) => (
        <text
          key={item}
          fg={i === selectedIndex ? "#00FF00" : "#FFFFFF"}
        >
          {i === selectedIndex ? "> " : "  "}{item}
        </text>
      ))}
    </box>
  )
}
```

## Gotchas

### Focus Required for Input

```tsx
// WRONG - won't receive input
<input placeholder="Type here" />

// CORRECT
<input placeholder="Type here" focused />
```

### Text Modifiers Require Nesting

```tsx
// WRONG - bold prop doesn't exist
<text bold>Bold text</text>

// CORRECT - use modifier element
<text><strong>Bold text</strong></text>
```

### Select Options Format

```tsx
// WRONG
<select options={["a", "b", "c"]} />

// CORRECT
<select options={[
  { name: "A", description: "Option A" },
  { name: "B", description: "Option B" },
]} />
```
