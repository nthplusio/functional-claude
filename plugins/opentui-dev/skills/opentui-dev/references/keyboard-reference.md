# OpenTUI Keyboard Input Handling

How to handle keyboard input in OpenTUI applications.

## Overview

OpenTUI provides keyboard input handling through:
- **Core**: `renderer.keyInput` EventEmitter
- **React**: `useKeyboard()` hook
- **Solid**: `useKeyboard()` hook

## KeyEvent Object

All keyboard handlers receive a `KeyEvent` object:

```typescript
interface KeyEvent {
  name: string          // Key name: "a", "escape", "f1", etc.
  sequence: string      // Raw escape sequence
  ctrl: boolean         // Ctrl modifier held
  shift: boolean        // Shift modifier held
  meta: boolean         // Alt modifier held
  option: boolean       // Option modifier held (macOS)
  eventType: "press" | "release" | "repeat"
  repeated: boolean     // Key is being held (repeat event)
}
```

## Basic Usage

### Core

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  if (key.name === "escape") {
    renderer.destroy()
    return
  }

  if (key.ctrl && key.name === "s") {
    saveDocument()
  }
})
```

### React

```tsx
import { useKeyboard, useRenderer } from "@opentui/react"

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

### Solid

```tsx
import { useKeyboard, useRenderer } from "@opentui/solid"

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

## Key Names

### Special Keys

| Key Name | Description |
|----------|-------------|
| `escape` | Escape key |
| `enter` | Enter/Return |
| `tab` | Tab key |
| `backspace` | Backspace |
| `delete` | Delete key |
| `space` | Spacebar |

### Arrow Keys

| Key Name | Description |
|----------|-------------|
| `up` | Up arrow |
| `down` | Down arrow |
| `left` | Left arrow |
| `right` | Right arrow |

### Navigation Keys

| Key Name | Description |
|----------|-------------|
| `home` | Home key |
| `end` | End key |
| `pageup` | Page Up |
| `pagedown` | Page Down |

### Function Keys

`f1`, `f2`, `f3`, ... `f12`

### Alphabetic/Numeric

Lowercase: `a`, `b`, `c`, ... `z`
Numbers: `0`, `1`, `2`, ... `9`

## Modifier Keys

```typescript
renderer.keyInput.on("keypress", (key) => {
  if (key.ctrl && key.name === "c") {
    // Ctrl+C
  }

  if (key.shift && key.name === "tab") {
    // Shift+Tab
  }

  if (key.meta && key.name === "s") {
    // Alt+S
  }

  // Combinations
  if (key.ctrl && key.shift && key.name === "s") {
    saveAs()
  }
})
```

## Event Types

### Press Events (Default)

```typescript
if (key.eventType === "press") {
  // Initial key press
}
```

### Repeat Events

```typescript
if (key.eventType === "repeat" || key.repeated) {
  // Key is being held
}
```

### Release Events (Opt-in)

```tsx
// React
useKeyboard(
  (key) => {
    if (key.eventType === "release") {
      // Key released
    }
  },
  { release: true }
)
```

## Patterns

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

### Vim-style Modes

```tsx
function Editor() {
  const [mode, setMode] = useState<"normal" | "insert">("normal")

  useKeyboard((key) => {
    if (mode === "normal") {
      switch (key.name) {
        case "i":
          setMode("insert")
          break
        case "j":
          moveCursorDown()
          break
        case "k":
          moveCursorUp()
          break
      }
    } else if (mode === "insert") {
      if (key.name === "escape") {
        setMode("normal")
      }
    }
  })

  return (
    <box flexDirection="column">
      <text>Mode: {mode}</text>
      <textarea focused={mode === "insert"} />
    </box>
  )
}
```

### Keyboard Shortcuts Help

```tsx
function ShortcutsHelp() {
  const shortcuts = [
    { keys: "Ctrl+S", action: "Save" },
    { keys: "Ctrl+Q", action: "Quit" },
    { keys: "Tab", action: "Next field" },
  ]

  return (
    <box border padding={1} flexDirection="column">
      {shortcuts.map(({ keys, action }) => (
        <box key={keys} flexDirection="row">
          <text width={15} fg="#00FFFF">{keys}</text>
          <text>{action}</text>
        </box>
      ))}
    </box>
  )
}
```

## Focus and Input Components

Input components capture keyboard events when focused:

```tsx
<input focused />  // Receives keyboard input
```

To prevent conflicts, check focus state:

```tsx
function App() {
  const [inputFocused, setInputFocused] = useState(false)

  useKeyboard((key) => {
    if (inputFocused) return  // Let input handle it

    // Global shortcuts
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <input
      focused={inputFocused}
      onFocus={() => setInputFocused(true)}
      onBlur={() => setInputFocused(false)}
    />
  )
}
```

## Gotchas

### Terminal Limitations

Some key combinations are captured by the terminal or OS:
- `Ctrl+C` often sends SIGINT
- `Ctrl+Z` suspends the process
- Some function keys may be intercepted

### SSH and Remote Sessions

Key detection may vary over SSH. Test on target environments.

### Multiple Handlers

Multiple `useKeyboard` calls all receive events. Coordinate to prevent conflicts.
