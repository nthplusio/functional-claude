---
name: opentui-keyboard
description: This skill should be used when the user asks about OpenTUI keyboard handling, shortcuts, key events, focus management, or input handling in TUIs.
version: 0.1.2
---

# OpenTUI Keyboard Input Handling

Handle keyboard input in OpenTUI applications.

## Basic Usage

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

### Core

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  if (key.name === "escape") {
    renderer.destroy()
  }
})
```

## KeyEvent Object

```typescript
interface KeyEvent {
  name: string          // "a", "escape", "f1", etc.
  sequence: string      // Raw escape sequence
  ctrl: boolean         // Ctrl held
  shift: boolean        // Shift held
  meta: boolean         // Alt held
  option: boolean       // Option held (macOS)
  eventType: "press" | "release" | "repeat"
  repeated: boolean     // Key held down
}
```

## Key Names

| Category | Keys |
|----------|------|
| Special | `escape`, `enter`, `tab`, `backspace`, `delete`, `space` |
| Arrow | `up`, `down`, `left`, `right` |
| Navigation | `home`, `end`, `pageup`, `pagedown` |
| Function | `f1`, `f2`, ... `f12` |
| Alphabetic | `a`, `b`, ... `z` |
| Numeric | `0`, `1`, ... `9` |

## Modifier Combinations

```typescript
useKeyboard((key) => {
  if (key.ctrl && key.name === "s") {
    // Ctrl+S
    save()
  }

  if (key.shift && key.name === "tab") {
    // Shift+Tab
    focusPrevious()
  }

  if (key.meta && key.name === "a") {
    // Alt+A
  }

  if (key.ctrl && key.shift && key.name === "s") {
    // Ctrl+Shift+S
    saveAs()
  }
})
```

## Event Types

### Press (Default)

```typescript
if (key.eventType === "press") {
  // Initial key press
}
```

### Repeat

```typescript
if (key.repeated) {
  // Key being held
}
```

### Release (Opt-in)

```tsx
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
  const [selected, setSelected] = useState(0)
  const items = ["Home", "Settings", "Quit"]

  useKeyboard((key) => {
    switch (key.name) {
      case "up":
      case "k":
        setSelected(i => Math.max(0, i - 1))
        break
      case "down":
      case "j":
        setSelected(i => Math.min(items.length - 1, i + 1))
        break
      case "enter":
        handleSelect(items[selected])
        break
    }
  })

  return (
    <box flexDirection="column">
      {items.map((item, i) => (
        <text fg={i === selected ? "#00FF00" : "#FFF"}>
          {i === selected ? "> " : "  "}{item}
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
      if (key.name === "i") setMode("insert")
      if (key.name === "j") moveCursorDown()
      if (key.name === "k") moveCursorUp()
    } else if (mode === "insert") {
      if (key.name === "escape") setMode("normal")
    }
  })

  return (
    <box>
      <text>Mode: {mode}</text>
      <textarea focused={mode === "insert"} />
    </box>
  )
}
```

### Focus-Aware Shortcuts

```tsx
function App() {
  const [inputFocused, setInputFocused] = useState(false)

  useKeyboard((key) => {
    if (inputFocused) return  // Let input handle it

    // Global shortcuts only when input not focused
    if (key.ctrl && key.name === "q") {
      quit()
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

### Tab Navigation

```tsx
function Form() {
  const [focusIndex, setFocusIndex] = useState(0)
  const fields = ["name", "email", "message"]

  useKeyboard((key) => {
    if (key.name === "tab") {
      if (key.shift) {
        setFocusIndex(i => (i - 1 + fields.length) % fields.length)
      } else {
        setFocusIndex(i => (i + 1) % fields.length)
      }
    }
  })

  return (
    <box flexDirection="column" gap={1}>
      {fields.map((field, i) => (
        <input
          key={field}
          placeholder={field}
          focused={i === focusIndex}
        />
      ))}
    </box>
  )
}
```

## Gotchas

### Terminal Limitations

Some keys are captured by the terminal/OS:
- `Ctrl+C` often sends SIGINT
- `Ctrl+Z` suspends process
- Some function keys may be intercepted

### Multiple Handlers

Multiple `useKeyboard` calls all receive events. Coordinate to prevent conflicts.

### Input Focus

When an input is focused, it captures character keys. Use focus-aware shortcuts pattern.

## Detailed Reference

See `${CLAUDE_PLUGIN_ROOT}/skills/opentui-dev/references/keyboard-reference.md` for full documentation.
