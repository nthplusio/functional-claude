---
name: hyper-visual
description: This skill should be used when the user asks about "hyper opacity", "hyper blur", "hyper colors", "hyper theme", "hyper background", "hyper cursor", "hyper font", "hyper padding", or mentions visual customization of Hyper terminal.
version: 0.3.5
---

# Hyper Visual Customization

Configure visual appearance: colors, opacity, cursor, and fonts.

## Background Opacity

Use rgba for transparent background:

```javascript
config: {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',  // 85% opacity
}
```

Values: 0.0 (transparent) to 1.0 (opaque)

## Cursor Styling

```javascript
config: {
  cursorColor: 'rgba(248,28,229,0.8)',
  cursorShape: 'BLOCK',  // BLOCK, BEAM, UNDERLINE
  cursorBlink: true,
}
```

## Selection Color

```javascript
config: {
  selectionColor: 'rgba(248,28,229,0.3)',
}
```

## Color Palette

```javascript
config: {
  foregroundColor: '#fff',
  backgroundColor: '#000',
  borderColor: '#333',

  colors: {
    black: '#000000',
    red: '#C51E14',
    green: '#1DC121',
    yellow: '#C7C329',
    blue: '#0A2FC4',
    magenta: '#C839C5',
    cyan: '#20C5C6',
    white: '#C7C7C7',
    lightBlack: '#686868',
    lightRed: '#FD6F6B',
    lightGreen: '#67F86F',
    lightYellow: '#FFFA72',
    lightBlue: '#6A76FB',
    lightMagenta: '#FD7CFC',
    lightCyan: '#68FDFE',
    lightWhite: '#FFFFFF',
  },
}
```

## Font Configuration

```javascript
config: {
  fontSize: 12,
  fontFamily: '"Fira Code", Menlo, monospace',
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  lineHeight: 1.2,
  letterSpacing: 0,
}
```

**Note:** Wrap font names with spaces in quotes.

## Window Padding

```javascript
config: {
  padding: '12px 14px',  // top/bottom, left/right
}
```

Or use CSS-style values:
```javascript
padding: '10px 15px 10px 15px',  // top, right, bottom, left
```

## CSS Customization

Add custom CSS via the `css` property:

```javascript
config: {
  css: `
    .hyper_main {
      border: none;
    }
    .tabs_nav {
      background-color: #1a1a1a;
    }
    .tab_tab {
      border: none;
    }
  `,
}
```

## Terminal CSS

Target terminal content specifically:

```javascript
config: {
  termCSS: `
    .terminal {
      background-color: rgba(0, 0, 0, 0.9) !important;
    }
    .terminal-cursor {
      background-color: #ff0000 !important;
    }
  `,
}
```

## Popular Theme Colors

### Dracula
```javascript
foregroundColor: '#f8f8f2',
backgroundColor: '#282a36',
colors: {
  black: '#21222c',
  red: '#ff5555',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  blue: '#bd93f9',
  magenta: '#ff79c6',
  cyan: '#8be9fd',
  white: '#f8f8f2',
}
```

### One Dark
```javascript
foregroundColor: '#abb2bf',
backgroundColor: '#282c34',
colors: {
  black: '#282c34',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#abb2bf',
}
```

## Reload Changes

After modifying visual settings:
- **macOS**: `Cmd+Shift+R`
- **Windows/Linux**: `Ctrl+Shift+R`
