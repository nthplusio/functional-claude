# OpenTUI Layout System

OpenTUI uses the Yoga layout engine, providing CSS Flexbox-like capabilities for positioning and sizing components in the terminal.

## Overview

- **Flexbox model**: Familiar CSS Flexbox properties
- **Yoga engine**: Facebook's cross-platform layout engine
- **Terminal units**: Dimensions in character cells (columns x rows)
- **Percentage support**: Relative sizing based on parent

## Flex Container Properties

### flexDirection

Controls the main axis direction:

```tsx
// Row (default) - children flow horizontally
<box flexDirection="row">
  <text>1</text>
  <text>2</text>
  <text>3</text>
</box>
// Output: 1 2 3

// Column - children flow vertically
<box flexDirection="column">
  <text>1</text>
  <text>2</text>
  <text>3</text>
</box>
// Output:
// 1
// 2
// 3

// Reverse variants
<box flexDirection="row-reverse">...</box>     // 3 2 1
<box flexDirection="column-reverse">...</box>  // Bottom to top
```

### justifyContent

Aligns children along the main axis:

```tsx
<box flexDirection="row" width={40} justifyContent="flex-start">
  {/* Children at start (left for row) */}
</box>

<box flexDirection="row" width={40} justifyContent="flex-end">
  {/* Children at end (right for row) */}
</box>

<box flexDirection="row" width={40} justifyContent="center">
  {/* Children centered */}
</box>

<box flexDirection="row" width={40} justifyContent="space-between">
  {/* First at start, last at end, rest evenly distributed */}
</box>

<box flexDirection="row" width={40} justifyContent="space-around">
  {/* Equal space around each child */}
</box>

<box flexDirection="row" width={40} justifyContent="space-evenly">
  {/* Equal space between all children and edges */}
</box>
```

### alignItems

Aligns children along the cross axis:

```tsx
<box flexDirection="row" height={10} alignItems="flex-start">
  {/* Children at top */}
</box>

<box flexDirection="row" height={10} alignItems="flex-end">
  {/* Children at bottom */}
</box>

<box flexDirection="row" height={10} alignItems="center">
  {/* Children vertically centered */}
</box>

<box flexDirection="row" height={10} alignItems="stretch">
  {/* Children stretch to fill height */}
</box>
```

### flexWrap

Controls whether children wrap to new lines:

```tsx
<box flexDirection="row" flexWrap="wrap" width={20}>
  {/* Children wrap to next row */}
</box>
```

### gap

Space between children:

```tsx
<box flexDirection="row" gap={2}>
  <text>A</text>
  <text>B</text>
  <text>C</text>
</box>
// Output: A  B  C (2 spaces between)
```

## Flex Item Properties

### flexGrow

How much a child should grow relative to siblings:

```tsx
<box flexDirection="row" width={30}>
  <box flexGrow={1}><text>1</text></box>
  <box flexGrow={2}><text>2</text></box>
  <box flexGrow={1}><text>1</text></box>
</box>
// Widths: 7.5 | 15 | 7.5 (1:2:1 ratio)
```

### flexShrink

How much a child should shrink when space is limited:

```tsx
<box flexDirection="row" width={20}>
  <box width={15} flexShrink={1}><text>Shrinks</text></box>
  <box width={15} flexShrink={0}><text>Fixed</text></box>
</box>
```

### flexBasis

Initial size before growing/shrinking:

```tsx
<box flexDirection="row">
  <box flexBasis={20} flexGrow={1}>Starts at 20, can grow</box>
  <box flexBasis="50%">Half of parent</box>
</box>
```

### alignSelf

Override parent's alignItems for this child:

```tsx
<box flexDirection="row" height={10} alignItems="center">
  <text>Centered</text>
  <text alignSelf="flex-start">Top</text>
  <text alignSelf="flex-end">Bottom</text>
</box>
```

## Dimensions

### Fixed Dimensions

```tsx
<box width={40} height={10}>
  {/* Exactly 40 columns by 10 rows */}
</box>
```

### Percentage Dimensions

Parent must have explicit size:

```tsx
<box width="100%" height="100%">
  <box width="50%" height="50%">
    {/* Half of parent */}
  </box>
</box>
```

### Min/Max Constraints

```tsx
<box
  minWidth={20}
  maxWidth={60}
  minHeight={5}
  maxHeight={20}
>
  {/* Constrained sizing */}
</box>
```

## Spacing

### Padding (inside)

```tsx
// All sides
<box padding={2}>Content</box>

// Individual sides
<box
  paddingTop={1}
  paddingRight={2}
  paddingBottom={1}
  paddingLeft={2}
>
  Content
</box>
```

### Margin (outside)

```tsx
// All sides
<box margin={1}>Content</box>

// Individual sides
<box
  marginTop={1}
  marginRight={2}
  marginBottom={1}
  marginLeft={2}
>
  Content
</box>
```

## Positioning

### Relative (default)

Element flows in normal document order.

### Absolute

Element positioned relative to nearest positioned ancestor:

```tsx
<box position="relative" width="100%" height="100%">
  <box
    position="absolute"
    left={10}
    top={5}
    width={20}
    height={5}
  >
    Positioned at (10, 5)
  </box>
</box>
```

## Common Patterns

### Centered Content

```tsx
<box
  width="100%"
  height="100%"
  justifyContent="center"
  alignItems="center"
>
  <text>Centered</text>
</box>
```

### Sidebar Layout

```tsx
<box flexDirection="row" width="100%" height="100%">
  <box width={20} borderRight>
    {/* Sidebar */}
  </box>
  <box flexGrow={1}>
    {/* Main content */}
  </box>
</box>
```

### Header/Content/Footer

```tsx
<box flexDirection="column" width="100%" height="100%">
  <box height={3} borderBottom>
    {/* Header */}
  </box>
  <box flexGrow={1}>
    {/* Content */}
  </box>
  <box height={3} borderTop>
    {/* Footer */}
  </box>
</box>
```

### Grid-like Layout

```tsx
<box flexDirection="row" flexWrap="wrap" width={60}>
  {items.map(item => (
    <box width={20} height={5} border>
      <text>{item}</text>
    </box>
  ))}
</box>
```
