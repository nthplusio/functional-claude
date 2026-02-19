---
name: opentui-components
description: This skill should be used when the user asks about OpenTUI components like "text", "box", "input", "select", "textarea", "code", "diff", "ascii-font", or needs help with specific UI elements in OpenTUI TUIs.
version: 0.1.5
---

# OpenTUI Components

Reference for all OpenTUI UI components.

## Component Naming Across Frameworks

| Concept | Core (Class) | React (JSX) | Solid (JSX) |
|---------|--------------|-------------|-------------|
| Text | `TextRenderable` | `<text>` | `<text>` |
| Box | `BoxRenderable` | `<box>` | `<box>` |
| ScrollBox | `ScrollBoxRenderable` | `<scrollbox>` | `<scrollbox>` |
| Input | `InputRenderable` | `<input>` | `<input>` |
| Textarea | `TextareaRenderable` | `<textarea>` | `<textarea>` |
| Select | `SelectRenderable` | `<select>` | `<select>` |
| Tab Select | `TabSelectRenderable` | `<tab-select>` | `<tab_select>` |
| ASCII Font | `ASCIIFontRenderable` | `<ascii-font>` | `<ascii_font>` |
| Code | `CodeRenderable` | `<code>` | `<code>` |
| Line Number | `LineNumberRenderable` | `<line-number>` | `<line_number>` |
| Diff | `DiffRenderable` | `<diff>` | `<diff>` |

**Note**: Solid uses underscores, React uses hyphens.

## Text & Display

### text

```tsx
<text fg="#00FF00" bg="#000000">Styled text</text>

// With modifiers
<text>
  <strong>Bold</strong>, <em>italic</em>, <u>underlined</u>
  <span fg="red">Colored</span>
  <br />
  New line
</text>
```

### ascii-font / ascii_font

```tsx
// React
<ascii-font text="HELLO" />

// Solid
<ascii_font text="HELLO" />
```

## Containers

### box

```tsx
<box
  width={40}
  height={10}
  border={true}
  borderStyle="rounded"
  borderColor="#FFFFFF"
  backgroundColor="#1a1a1a"
  padding={1}
  flexDirection="column"
  gap={1}
>
  <text>Content</text>
</box>
```

Border styles: `"single"`, `"double"`, `"rounded"`, `"heavy"`

### scrollbox

```tsx
<scrollbox width={40} height={10} overflow="scroll">
  {longContent}
</scrollbox>
```

## Input Components

### input

Single-line text input. **Must be `focused` to receive input.**

```tsx
// React
<input
  value={value}
  onChange={setValue}
  placeholder="Enter text..."
  width={30}
  focused
/>

// Solid
<input
  value={value()}
  onInput={setValue}
  placeholder="Enter text..."
  focused
/>
```

### textarea

Multi-line text input.

```tsx
<textarea
  value={text}
  onChange={setText}
  width={40}
  height={10}
  showLineNumbers
  wrapText
  focused
/>
```

### select

List selection with navigation.

```tsx
<select
  options={[
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ]}
  onSelect={(index, option) => {
    // Enter key pressed - selection confirmed
    handleSelect(option)
  }}
  onChange={(index, option) => {
    // Arrow keys - navigating
    showPreview(option)
  }}
  height={8}
  focused
/>
```

**Navigation**: Up/k, Down/j, Enter

**Events**:
- `onSelect` - Enter pressed (confirmed)
- `onChange` - Arrow keys (browsing)

### tab-select / tab_select

Horizontal tab selection.

```tsx
// React
<tab-select
  options={[
    { name: "Home", description: "Dashboard" },
    { name: "Settings", description: "Config" },
  ]}
  onSelect={(index, option) => setActiveTab(index)}
  tabWidth={20}
  focused
/>

// Solid
<tab_select options={[...]} onSelect={...} focused />
```

**Navigation**: Left/[, Right/], Enter

## Code & Diff

### code

```tsx
<code language="typescript" value={sourceCode} />
```

### line-number / line_number

```tsx
// React
<line-number value={sourceCode} startLine={1} />

// Solid
<line_number value={sourceCode} startLine={1} />
```

### diff

```tsx
<diff
  oldValue={original}
  newValue={modified}
  mode="unified"  // or "split"
/>
```

## Critical Gotchas

### Focus Required

```tsx
// WRONG - won't receive input
<input placeholder="Type here" />

// CORRECT
<input placeholder="Type here" focused />
```

### Options Format

```tsx
// WRONG
<select options={["a", "b", "c"]} />

// CORRECT
<select options={[{ name: "A" }, { name: "B" }]} />
```

### Text Modifiers

```tsx
// WRONG - bold prop doesn't exist
<text bold>Bold</text>

// CORRECT - use nested element
<text><strong>Bold</strong></text>
```

### Solid Underscores

```tsx
// React
<tab-select />
<ascii-font />

// Solid
<tab_select />
<ascii_font />
```

## Detailed Reference

See `${CLAUDE_PLUGIN_ROOT}/skills/opentui-dev/references/components-reference.md` for full documentation.
