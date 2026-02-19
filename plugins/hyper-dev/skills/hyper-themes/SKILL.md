---
name: hyper-themes
description: This skill should be used when the user asks to "create hyper theme", "hyper theme", "hyper color scheme", "custom hyper theme", "publish hyper theme", or mentions creating or customizing themes for Hyper terminal.
version: 0.3.7
---

# Hyper Theme Development

Create and publish color themes for Hyper terminal.

## Theme Structure

Themes are plugins that modify colors via `decorateConfig`:

```
hyper-theme-name/
├── package.json
├── index.js
└── README.md
```

## package.json

```json
{
  "name": "hyper-theme-name",
  "version": "1.0.0",
  "description": "A beautiful theme for Hyper",
  "main": "index.js",
  "keywords": ["hyper", "hyper-plugin", "hyper-theme"],
  "author": "Your Name",
  "license": "MIT"
}
```

**Required:** Include both `hyper-plugin` and `hyper-theme` keywords.

## Theme Implementation

### index.js

```javascript
exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    // Background and foreground
    foregroundColor: '#eff0eb',
    backgroundColor: '#282a36',
    borderColor: '#222430',

    // Cursor
    cursorColor: '#97979b',
    cursorAccentColor: '#282a36',

    // Selection
    selectionColor: 'rgba(151, 151, 155, 0.3)',

    // ANSI colors (16 colors)
    colors: {
      black: '#282a36',
      red: '#ff5c57',
      green: '#5af78e',
      yellow: '#f3f99d',
      blue: '#57c7ff',
      magenta: '#ff6ac1',
      cyan: '#9aedfe',
      white: '#f1f1f0',
      lightBlack: '#686868',
      lightRed: '#ff5c57',
      lightGreen: '#5af78e',
      lightYellow: '#f3f99d',
      lightBlue: '#57c7ff',
      lightMagenta: '#ff6ac1',
      lightCyan: '#9aedfe',
      lightWhite: '#eff0eb',
    },

    // Optional: Tab bar colors
    css: `
      ${config.css || ''}
      .tabs_nav {
        background-color: #282a36;
      }
      .tab_tab {
        color: #6272a4;
        border: none;
      }
      .tab_active {
        color: #f8f8f2;
        background-color: #44475a;
      }
    `,
  });
};
```

## Color Palette Guidelines

### Essential Colors
- `foregroundColor` - Main text color
- `backgroundColor` - Terminal background
- `cursorColor` - Cursor color
- `selectionColor` - Selection highlight (use rgba for transparency)

### ANSI Color Mapping
| Color | Normal | Bright |
|-------|--------|--------|
| Black | `black` | `lightBlack` |
| Red | `red` | `lightRed` |
| Green | `green` | `lightGreen` |
| Yellow | `yellow` | `lightYellow` |
| Blue | `blue` | `lightBlue` |
| Magenta | `magenta` | `lightMagenta` |
| Cyan | `cyan` | `lightCyan` |
| White | `white` | `lightWhite` |

### UI Colors
Use CSS to style:
- `.tabs_nav` - Tab bar background
- `.tab_tab` - Inactive tabs
- `.tab_active` - Active tab
- `.hyper_main` - Main container

## Popular Theme Examples

### Dracula
```javascript
foregroundColor: '#f8f8f2',
backgroundColor: '#282a36',
cursorColor: '#f8f8f2',
colors: {
  black: '#21222c',
  red: '#ff5555',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  blue: '#bd93f9',
  magenta: '#ff79c6',
  cyan: '#8be9fd',
  white: '#f8f8f2',
  lightBlack: '#6272a4',
  // ... bright variants
}
```

### One Dark
```javascript
foregroundColor: '#abb2bf',
backgroundColor: '#282c34',
cursorColor: '#528bff',
colors: {
  black: '#282c34',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#abb2bf',
  // ... bright variants
}
```

## Testing Themes

1. Add to `localPlugins` in `.hyper.js`:
   ```javascript
   localPlugins: ['/path/to/hyper-theme-name'],
   ```

2. Reload: `Cmd+Shift+R` / `Ctrl+Shift+R`

3. Test with various content:
   - Colored output (git status, ls with colors)
   - Syntax highlighting
   - Selection visibility

## Publishing

1. Test thoroughly across content types
2. Add preview screenshots to README
3. Publish: `npm publish`
4. Submit to Hyper Store (optional)

Users install via:
```javascript
plugins: ['hyper-theme-name'],
```
