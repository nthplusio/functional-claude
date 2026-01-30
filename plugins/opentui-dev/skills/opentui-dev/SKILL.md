---
name: opentui-dev
description: This skill should be used when the user asks to "build a TUI", "create terminal UI", "OpenTUI", "opentui", "terminal interface", or needs guidance on TUI development with TypeScript/Bun. Covers Core imperative API, React reconciler, and Solid reconciler.
version: 0.1.0
---

# OpenTUI Development

Build terminal user interfaces with OpenTUI - a TypeScript library for creating modern TUIs with Bun.

## First Action: Check Reference Cache

Before proceeding, check if the cache needs refreshing:

1. Read `${CLAUDE_PLUGIN_ROOT}/.cache/learnings.md` (if it exists)
2. Check the `last_refresh` date in the YAML frontmatter
3. If missing or older than 7 days, suggest refreshing documentation
4. Preserve any existing Learnings section when refreshing

## Critical Rules

**Follow these rules in all OpenTUI code:**

1. **Use `create-tui` for new projects.** Always use `bunx create-tui@latest -t <template> <name>`
2. **`create-tui` options must come before arguments.** `bunx create-tui -t react my-app` works, `bunx create-tui my-app -t react` does NOT
3. **Never call `process.exit()` directly.** Use `renderer.destroy()` for cleanup
4. **Text styling requires nested tags in React/Solid.** Use modifier elements (`<strong>`, `<em>`), not props

## Quick Decision Trees

### "Which framework should I use?"

```
Which framework?
├─ Maximum control, no framework overhead
│  └─ Core (imperative API)
├─ Familiar with React patterns
│  └─ React reconciler
├─ Fine-grained reactivity, optimal re-renders
│  └─ Solid reconciler
└─ Building a library/framework on top
   └─ Core (imperative API)
```

### "I need to display content"

```
Display content?
├─ Plain or styled text -> opentui-components skill
├─ Container with borders -> opentui-components skill
├─ Scrollable content -> opentui-components skill
├─ ASCII art banner -> opentui-components skill
├─ Code with syntax highlighting -> opentui-components skill
└─ Diff viewer -> opentui-components skill
```

### "I need user input"

```
User input?
├─ Single-line text field -> opentui-components skill (input)
├─ Multi-line editor -> opentui-components skill (textarea)
├─ Select from list -> opentui-components skill (select)
├─ Tab selection -> opentui-components skill (tab-select)
└─ Custom keyboard shortcuts -> opentui-keyboard skill
```

### "I need layout/positioning"

```
Layout?
├─ Flexbox layouts -> opentui-layout skill
├─ Absolute positioning -> opentui-layout skill
├─ Responsive to terminal -> opentui-layout skill
└─ Complex nested layouts -> opentui-layout skill
```

### "I need animations"

```
Animations?
├─ Timeline-based -> opentui-animation skill
├─ Easing functions -> opentui-animation skill
└─ Looping animations -> opentui-animation skill
```

## Quick Start

### Create New Project (Recommended)

```bash
# React template
bunx create-tui@latest -t react my-app
cd my-app
bun run src/index.tsx

# Solid template
bunx create-tui@latest -t solid my-app

# Core (imperative) template
bunx create-tui@latest -t core my-app
```

**Important:** The directory must NOT already exist.

### Manual Setup

```bash
mkdir my-tui && cd my-tui
bun init
bun install @opentui/react @opentui/core react
```

## Framework Comparison

| Feature | Core | React | Solid |
|---------|------|-------|-------|
| API Style | Imperative | Declarative | Declarative |
| Learning Curve | Higher | Familiar | Moderate |
| Bundle Size | Smallest | Larger | Medium |
| Reactivity | Manual | useState/useEffect | Fine-grained |
| Best For | Libraries, performance | Apps, teams | Apps, optimal renders |

## Focused Skills

| Topic | Skill | When to Use |
|-------|-------|-------------|
| Components | opentui-components | text, box, input, select, code, diff |
| Layout | opentui-layout | flexbox, positioning, spacing |
| Keyboard | opentui-keyboard | shortcuts, focus, input handling |
| Animation | opentui-animation | timelines, easing, transitions |

## Reference Files

Detailed documentation cached in `./references/`:

| File | Contents |
|------|----------|
| `core-reference.md` | Core imperative API, Renderables, Constructs |
| `react-reference.md` | React reconciler, hooks, JSX elements |
| `solid-reference.md` | Solid reconciler, signals, JSX elements |
| `components-reference.md` | All components by category |
| `layout-reference.md` | Yoga/Flexbox layout system |
| `keyboard-reference.md` | Keyboard input handling |
| `animation-reference.md` | Timeline animations and easing |
| `testing-reference.md` | Test renderer and snapshots |
| `cache-management.md` | Cache refresh strategy and learnings capture |

## Troubleshooting

For debugging issues, the **opentui-troubleshoot** agent can autonomously diagnose:
- Runtime errors and crashes
- Layout misalignment
- Input/focus issues
- Build/bundling problems

## Resources

- **Repository**: https://github.com/anomalyco/opentui
- **Examples**: https://github.com/anomalyco/opentui/tree/main/packages/core/src/examples
- **Awesome List**: https://github.com/msmps/awesome-opentui
