# OpenTUI Components Reference

All OpenTUI components organized by category. Components are available in Core, React, and Solid with slight API differences.

## Component Naming

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

**Note**: Solid uses underscores (`tab_select`) while React uses hyphens (`tab-select`).

## Text & Display

### text

Styled text content.

```tsx
// React/Solid
<text fg="#00FF00" bg="#000000">Green on black</text>

// With modifiers
<text>
  <strong>Bold</strong>, <em>italic</em>, <u>underlined</u>
  <span fg="red">Colored</span>
  <br />
  New line
</text>

// Core
const text = new TextRenderable(renderer, {
  content: "Hello!",
  fg: "#00FF00",
  bg: "#000000",
})
```

### ascii-font / ascii_font

ASCII art text for banners.

```tsx
// React
<ascii-font text="HELLO" />

// Solid
<ascii_font text="HELLO" />
```

## Containers

### box

Container with borders and flexbox layout.

```tsx
<box
  width={40}
  height={10}
  border={true}
  borderStyle="rounded"  // "single", "double", "rounded", "heavy"
  borderColor="#FFFFFF"
  backgroundColor="#1a1a1a"
  padding={1}
  flexDirection="column"
  justifyContent="center"
  alignItems="center"
  gap={1}
>
  <text>Content</text>
</box>
```

### scrollbox

Scrollable container.

```tsx
<scrollbox width={40} height={10} overflow="scroll">
  {longContent}
</scrollbox>
```

## Input Components

### input

Single-line text input.

```tsx
// React
<input
  value={value}
  onChange={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  width={30}
  focused
/>

// Solid
<input
  value={value()}
  onInput={(newValue) => setValue(newValue)}
  placeholder="Enter text..."
  focused
/>

// Core
const input = new InputRenderable(renderer, {
  id: "name",
  placeholder: "Enter text...",
})
input.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Value:", value)
})
input.focus()
```

**Important**: `focused` prop required to receive keyboard input.

### textarea

Multi-line text input.

```tsx
<textarea
  value={text}
  onChange={setText}
  placeholder="Enter multiple lines..."
  width={40}
  height={10}
  showLineNumbers
  wrapText
  focused
/>
```

### select

List selection.

```tsx
<select
  options={[
    { name: "Option 1", description: "First option", value: "1" },
    { name: "Option 2", description: "Second option", value: "2" },
  ]}
  onSelect={(index, option) => {
    // Called when Enter is pressed
    console.log("Selected:", option.name)
  }}
  onChange={(index, option) => {
    // Called when navigating with arrows
    console.log("Browsing:", option.name)
  }}
  height={8}
  focused
/>
```

**Events**:
- `onSelect` - Enter key pressed (selection confirmed)
- `onChange` - Arrow keys (navigating list)

**Navigation**: Up/k, Down/j, Enter

### tab-select / tab_select

Horizontal tab-based selection.

```tsx
// React
<tab-select
  options={[
    { name: "Home", description: "Dashboard" },
    { name: "Settings", description: "Configuration" },
  ]}
  onSelect={(index, option) => setActiveTab(index)}
  tabWidth={20}
  focused
/>

// Solid
<tab_select
  options={[...]}
  onSelect={(index, option) => setActiveTab(index)}
  focused
/>
```

**Navigation**: Left/[, Right/], Enter

## Code & Diff

### code

Syntax-highlighted code.

```tsx
<code
  language="typescript"
  value={sourceCode}
/>
```

### line-number / line_number

Code with line numbers and diagnostics.

```tsx
// React
<line-number
  value={sourceCode}
  startLine={1}
/>

// Solid
<line_number
  value={sourceCode}
  startLine={1}
/>
```

### diff

Unified or split diff viewer.

```tsx
<diff
  oldValue={original}
  newValue={modified}
  mode="unified"  // or "split"
/>
```

## Common Properties

All components share layout properties:

```tsx
// Positioning
position="relative" | "absolute"
left, top, right, bottom

// Dimensions
width, height
minWidth, maxWidth, minHeight, maxHeight

// Flexbox
flexDirection, flexGrow, flexShrink, flexBasis
justifyContent, alignItems, alignSelf
flexWrap, gap

// Spacing
padding, paddingTop, paddingRight, paddingBottom, paddingLeft
margin, marginTop, marginRight, marginBottom, marginLeft

// Display
display="flex" | "none"
overflow="visible" | "hidden" | "scroll"
zIndex
```

## Gotchas

### Focus Required

Inputs must be focused to receive keyboard input:

```tsx
// WRONG - won't receive input
<input placeholder="Type here" />

// CORRECT
<input placeholder="Type here" focused />
```

### Select Options Format

Options must be objects with `name` property:

```tsx
// WRONG
<select options={["a", "b", "c"]} />

// CORRECT
<select options={[
  { name: "A", description: "Option A" },
  { name: "B", description: "Option B" },
]} />
```

### Text Modifiers

Style text with nested elements, not props:

```tsx
// WRONG
<text bold>Bold text</text>

// CORRECT
<text><strong>Bold text</strong></text>
```
