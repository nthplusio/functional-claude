---
name: opentui-scaffold
description: Scaffold a new OpenTUI project with framework selection. Use when user wants to "create TUI", "start OpenTUI project", "new TUI app", or "scaffold opentui".
tools:
  - AskUserQuestion
  - Bash
  - Write
  - Read
---

# OpenTUI Project Scaffold

Create a new OpenTUI terminal interface project with the appropriate framework.

## Workflow

### Step 1: Gather Requirements

Use AskUserQuestion to determine:

1. **Project name** - What should the project be called?

2. **Framework choice:**
   - **React** (Recommended) - Familiar patterns, large ecosystem, declarative
   - **Solid** - Fine-grained reactivity, smaller bundle, optimal updates
   - **Core** - Maximum control, imperative API, for libraries/frameworks

3. **Project type:**
   - Simple TUI app
   - Interactive form/wizard
   - Dashboard/monitoring tool
   - Menu-based application
   - Custom (describe)

### Step 2: Create Project

Use `bunx create-tui` with the selected template:

```bash
# CRITICAL: Options MUST come before the project name
bunx create-tui@latest -t <template> <project-name>

# Examples:
bunx create-tui@latest -t react my-tui-app
bunx create-tui@latest -t solid my-tui-app
bunx create-tui@latest -t core my-tui-app
```

**Important:**
- Directory must NOT already exist
- Options (`-t`) must come BEFORE the project name
- Use `@latest` to ensure fresh template

### Step 3: Verify Setup

```bash
cd <project-name>
bun install
bun run src/index.tsx  # or .ts for core
```

### Step 4: Add Starter Code (Optional)

Based on project type, offer to add starter components:

#### Menu-based Application

```tsx
// React example
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useRenderer } from "@opentui/react"
import { useState } from "react"

function App() {
  const renderer = useRenderer()
  const [selected, setSelected] = useState(0)
  const items = ["Dashboard", "Settings", "Help", "Quit"]

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
        if (items[selected] === "Quit") renderer.destroy()
        break
      case "escape":
      case "q":
        renderer.destroy()
        break
    }
  })

  return (
    <box
      flexDirection="column"
      border
      borderStyle="rounded"
      padding={2}
      width={40}
    >
      <text fg="#00FFFF">
        <strong>My TUI App</strong>
      </text>
      <box height={1} />
      {items.map((item, i) => (
        <text
          key={item}
          fg={i === selected ? "#00FF00" : "#FFFFFF"}
        >
          {i === selected ? "> " : "  "}{item}
        </text>
      ))}
      <box height={1} />
      <text fg="#666666">j/k to navigate, Enter to select, q to quit</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

#### Form/Wizard

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard } from "@opentui/react"
import { useState } from "react"

function App() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useKeyboard((key) => {
    if (key.name === "tab") {
      setStep(s => (s + 1) % 2)
    }
  })

  return (
    <box flexDirection="column" border padding={2} gap={1}>
      <text fg="#00FFFF"><strong>User Registration</strong></text>
      <box flexDirection="row" gap={1}>
        <text width={8}>Name:</text>
        <input
          value={name}
          onChange={setName}
          placeholder="Your name"
          width={30}
          focused={step === 0}
        />
      </box>
      <box flexDirection="row" gap={1}>
        <text width={8}>Email:</text>
        <input
          value={email}
          onChange={setEmail}
          placeholder="your@email.com"
          width={30}
          focused={step === 1}
        />
      </box>
      <text fg="#666666">Tab to switch fields</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

#### Dashboard

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react"

function App() {
  const renderer = useRenderer()
  const { width, height } = useTerminalDimensions()

  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <box height={3} borderBottom padding={1}>
        <text fg="#00FFFF"><strong>Dashboard</strong></text>
      </box>

      {/* Main content */}
      <box flexGrow={1} flexDirection="row">
        {/* Sidebar */}
        <box width={20} borderRight padding={1} flexDirection="column">
          <text>Menu</text>
          <text fg="#666">───────</text>
          <text fg="#00FF00">> Home</text>
          <text>  Stats</text>
          <text>  Logs</text>
        </box>

        {/* Content area */}
        <box flexGrow={1} padding={2}>
          <text>Welcome to your dashboard!</text>
        </box>
      </box>

      {/* Footer */}
      <box height={1} borderTop paddingLeft={1}>
        <text fg="#666666">Press 'q' to quit</text>
      </box>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

### Step 5: Next Steps

After scaffolding, suggest:

1. **Run the app:** `bun run src/index.tsx`
2. **Explore components:** Use `opentui-components` skill
3. **Add layout:** Use `opentui-layout` skill
4. **Handle input:** Use `opentui-keyboard` skill
5. **Add animations:** Use `opentui-animation` skill

### Error Handling

If `create-tui` fails:

1. **Directory exists:**
   ```
   Error: Directory already exists
   ```
   Solution: Use a different name or remove existing directory

2. **Bun not installed:**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Zig not installed (for builds):**
   ```bash
   # macOS
   brew install zig

   # Other platforms: https://ziglang.org/download/
   ```
