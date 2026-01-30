---
name: opentui-layout
description: This skill should be used when the user asks about OpenTUI layout, flexbox, positioning, spacing, dimensions, or needs help arranging components in their TUI.
version: 0.1.0
---

# OpenTUI Layout System

Yoga-based Flexbox layout for terminal interfaces.

## Overview

- **Flexbox model**: CSS Flexbox-like properties
- **Yoga engine**: Facebook's cross-platform layout engine
- **Terminal units**: Dimensions in character cells (columns x rows)

## Flex Container Properties

### flexDirection

```tsx
<box flexDirection="row">      {/* Horizontal (default) */}
<box flexDirection="column">   {/* Vertical */}
<box flexDirection="row-reverse">
<box flexDirection="column-reverse">
```

### justifyContent (Main Axis)

```tsx
<box justifyContent="flex-start">    {/* Start (default) */}
<box justifyContent="flex-end">      {/* End */}
<box justifyContent="center">        {/* Center */}
<box justifyContent="space-between"> {/* First/last at edges */}
<box justifyContent="space-around">  {/* Equal space around */}
<box justifyContent="space-evenly">  {/* Equal space between */}
```

### alignItems (Cross Axis)

```tsx
<box alignItems="flex-start">  {/* Top (for row) */}
<box alignItems="flex-end">    {/* Bottom */}
<box alignItems="center">      {/* Center */}
<box alignItems="stretch">     {/* Fill height */}
```

### flexWrap

```tsx
<box flexWrap="nowrap">   {/* No wrap (default) */}
<box flexWrap="wrap">     {/* Wrap to next line */}
```

### gap

```tsx
<box gap={2}>  {/* 2 character spaces between children */}
```

## Flex Item Properties

### flexGrow

```tsx
<box flexDirection="row" width={30}>
  <box flexGrow={1}><text>1</text></box>
  <box flexGrow={2}><text>2</text></box>
  <box flexGrow={1}><text>1</text></box>
</box>
{/* Widths: 7.5 | 15 | 7.5 (1:2:1 ratio) */}
```

### flexShrink

```tsx
<box width={15} flexShrink={1}>Shrinks</box>
<box width={15} flexShrink={0}>Fixed</box>
```

### flexBasis

```tsx
<box flexBasis={20} flexGrow={1}>Starts at 20, can grow</box>
<box flexBasis="50%">Half of parent</box>
```

### alignSelf

Override parent's alignItems:

```tsx
<box alignItems="center">
  <text alignSelf="flex-start">Top</text>
  <text>Center</text>
  <text alignSelf="flex-end">Bottom</text>
</box>
```

## Dimensions

### Fixed

```tsx
<box width={40} height={10}>
  {/* Exactly 40 columns by 10 rows */}
</box>
```

### Percentage (Parent must have size)

```tsx
<box width="100%" height="100%">
  <box width="50%" height="50%">Half</box>
</box>
```

### Min/Max Constraints

```tsx
<box minWidth={20} maxWidth={60} minHeight={5} maxHeight={20}>
  {/* Constrained sizing */}
</box>
```

## Spacing

### Padding (Inside)

```tsx
<box padding={2}>Content</box>
<box paddingTop={1} paddingRight={2} paddingBottom={1} paddingLeft={2}>
```

### Margin (Outside)

```tsx
<box margin={1}>Content</box>
<box marginTop={1} marginRight={2}>
```

## Positioning

### Absolute

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
  <box width={20} borderRight>Sidebar</box>
  <box flexGrow={1}>Main content</box>
</box>
```

### Header/Content/Footer

```tsx
<box flexDirection="column" width="100%" height="100%">
  <box height={3} borderBottom>Header</box>
  <box flexGrow={1}>Content</box>
  <box height={3} borderTop>Footer</box>
</box>
```

### Grid-like Layout

```tsx
<box flexDirection="row" flexWrap="wrap" width={60}>
  {items.map(item => (
    <box width={20} height={5} border key={item}>
      <text>{item}</text>
    </box>
  ))}
</box>
```

### Two-Column Form

```tsx
<box flexDirection="column" gap={1}>
  <box flexDirection="row" gap={2}>
    <text width={10}>Name:</text>
    <input width={20} focused />
  </box>
  <box flexDirection="row" gap={2}>
    <text width={10}>Email:</text>
    <input width={20} />
  </box>
</box>
```

## Detailed Reference

See `${CLAUDE_PLUGIN_ROOT}/skills/opentui-dev/references/layout-reference.md` for full documentation.
