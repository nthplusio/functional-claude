# OpenTUI Core (@opentui/core)

The foundational library for building terminal user interfaces. Provides an imperative API with all primitives, giving maximum control over rendering, state, and behavior.

## Overview

OpenTUI Core runs on Bun with native Zig bindings for performance-critical operations:
- **Renderer**: Manages terminal output, input events, and the rendering loop
- **Renderables**: Hierarchical UI building blocks with Yoga layout
- **Constructs**: Declarative wrappers for composing Renderables
- **FrameBuffer**: Low-level 2D rendering surface for custom graphics

## When to Use Core

Use the core imperative API when:
- Building a library or framework on top of OpenTUI
- Need maximum control over rendering and state
- Want smallest possible bundle size (no React/Solid runtime)
- Building performance-critical applications
- Integrating with existing imperative codebases

## Quick Start

### Using create-tui (Recommended)

```bash
bunx create-tui@latest -t core my-app
cd my-app
bun run src/index.ts
```

The CLI creates the `my-app` directory for you - it must **not already exist**.

**Agent guidance**: Always use autonomous mode with `-t <template>` flag. Never use interactive mode (`bunx create-tui@latest my-app` without `-t`) as it requires user prompts.

### Manual Setup

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/core
```

```typescript
import { createCliRenderer, TextRenderable, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

// Create a box container
const container = new BoxRenderable(renderer, {
  id: "container",
  width: 40,
  height: 10,
  border: true,
  borderStyle: "rounded",
  padding: 1,
})

// Create text inside the box
const greeting = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
})

// Compose the tree
container.add(greeting)
renderer.root.add(container)
```

## Core Concepts

### Renderer

The `CliRenderer` orchestrates everything:
- Manages the terminal viewport and alternate screen
- Handles input events (keyboard, mouse, paste)
- Runs the rendering loop (configurable FPS)
- Provides the root node for the renderable tree

### Renderables vs Constructs

| Renderables (Imperative) | Constructs (Declarative) |
|--------------------------|--------------------------|
| `new TextRenderable(renderer, {...})` | `Text({...})` |
| Requires renderer at creation | Creates VNode, instantiated later |
| Direct mutation via methods | Chained calls recorded, replayed |
| Full control | Cleaner composition |

## Renderable Classes

### TextRenderable

```typescript
const text = new TextRenderable(renderer, {
  id: "my-text",
  content: "Hello, World!",
  fg: "#00FF00",           // Foreground color
  bg: "#000000",           // Background color
  bold: true,
  italic: false,
  underline: false,
})
```

### BoxRenderable

```typescript
const box = new BoxRenderable(renderer, {
  id: "my-box",
  width: 40,
  height: 10,
  border: true,
  borderStyle: "rounded",  // "single", "double", "rounded", "heavy"
  borderColor: "#FFFFFF",
  backgroundColor: "#1a1a1a",
  padding: 1,
  paddingTop: 1,
  paddingRight: 2,
  paddingBottom: 1,
  paddingLeft: 2,
})
```

### InputRenderable

```typescript
const input = new InputRenderable(renderer, {
  id: "my-input",
  placeholder: "Enter text...",
  width: 30,
})

input.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Value:", value)
})

input.focus()
```

### SelectRenderable

```typescript
const select = new SelectRenderable(renderer, {
  id: "menu",
  options: [
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ],
  height: 8,
})

select.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)
})

select.focus()
```

## Keyboard Handling

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

## Runtime Requirements

OpenTUI runs on Bun and uses Zig for native builds.

```bash
# Package management
bun install @opentui/core

# Running
bun run src/index.ts
bun test

# Building (only needed for native code changes)
bun run build
```

**Zig** is required for building native components.

## Gotchas

### Never Call process.exit()

```typescript
// WRONG - leaves terminal in bad state
if (done) process.exit(0)

// CORRECT - proper cleanup
if (done) renderer.destroy()
```

### Cleanup on Signals

```typescript
process.on("SIGINT", () => {
  renderer.destroy()
})

process.on("SIGTERM", () => {
  renderer.destroy()
})
```
