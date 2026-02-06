---
name: tabby-visual
description: This skill should be used when the user asks about "tabby theme", "tabby colors", "tabby font", "tabby appearance", "tabby background", "tabby cursor", "tabby opacity", "color scheme tabby", or mentions visual customization of Tabby terminal.
version: 0.1.0
---

# Tabby Visual Customization

Configure visual appearance: themes, colors, fonts, cursor, and window styling.

## Theme Selection

Tabby supports built-in and community themes installed via the plugin system.

### Built-in Themes

Select a theme in Settings > Appearance or via config:

```yaml
appearance:
  theme: Standard  # Standard, or a plugin theme name
```

### Popular Community Themes

Install from Settings > Plugins:

| Theme | Description |
|-------|-------------|
| tabby-theme-hype | Hyper-inspired theme |
| tabby-theme-relaxed | Relaxed color palette |
| tabby-theme-gruvbox | Gruvbox color scheme |
| tabby-theme-catppuccin | Pastel color theme |
| tabby-theme-noctis | VS Code Noctis-inspired |
| tabby-theme-windows10 | Windows 10 terminal style |
| tabby-theme-altair | Altair-inspired theme |

## Color Scheme Format

Color schemes use YAML with ANSI SGR color ordering:

```yaml
# Custom color scheme in config.yaml
terminal:
  colorScheme:
    name: "My Custom Theme"
    foreground: "#c5c8c6"
    background: "#1d1f21"
    cursor: "#c5c8c6"
    selection: "rgba(248, 28, 229, 0.3)"
    colors:
      - "#282a2e"    # black
      - "#a54242"    # red
      - "#8c9440"    # green
      - "#de935f"    # yellow
      - "#5f819d"    # blue
      - "#85678f"    # magenta
      - "#5e8d87"    # cyan
      - "#707880"    # white
      - "#373b41"    # brightBlack
      - "#cc6666"    # brightRed
      - "#b5bd68"    # brightGreen
      - "#f0c674"    # brightYellow
      - "#81a2be"    # brightBlue
      - "#b294bb"    # brightMagenta
      - "#8abeb7"    # brightCyan
      - "#c5c8c6"    # brightWhite
```

### Color Properties

| Property | Description |
|----------|-------------|
| `foreground` | Default text color |
| `background` | Terminal background color |
| `cursor` | Cursor color |
| `selection` | Selection highlight (supports rgba) |
| `colors` | Array of 16 ANSI colors in order |

### ANSI Color Order

The `colors` array follows standard ANSI SGR ordering:
0. black, 1. red, 2. green, 3. yellow, 4. blue, 5. magenta, 6. cyan, 7. white,
8. brightBlack, 9. brightRed, 10. brightGreen, 11. brightYellow, 12. brightBlue, 13. brightMagenta, 14. brightCyan, 15. brightWhite

## Font Configuration

```yaml
terminal:
  fontSize: 14
  fontFamily: "Fira Code"
  fontWeight: 400
  fontWeightBold: 700
  ligatures: true
  lineHeight: 1.2
```

**Note:** Font ligatures require a font that supports them (Fira Code, JetBrains Mono, Cascadia Code).

### Popular Developer Fonts

| Font | Ligatures | Description |
|------|-----------|-------------|
| Fira Code | Yes | Popular with wide glyph coverage |
| JetBrains Mono | Yes | Designed for code readability |
| Cascadia Code | Yes | Microsoft's developer font |
| Hack | No | Clean monospace font |
| Source Code Pro | No | Adobe's monospace font |

## Cursor Styling

```yaml
terminal:
  cursor: block     # block, beam, underline
  cursorBlink: true  # true or false
```

## Window Appearance

```yaml
appearance:
  theme: Standard
  tabsOnTop: true       # Tabs position
  frame: full            # full, thin, native
  dock: off              # off, top, bottom, left, right
  dockScreen: current    # Which screen for docked mode
  opacity: 1.0           # Window opacity (0.0 to 1.0)
  vibrancy: false        # macOS vibrancy effect
```

### Quake Console Mode

Tabby supports a "quake console" docked window:

```yaml
appearance:
  dock: top          # Dock to top of screen
  dockFill: 0.5      # Fill half the screen height
  dockScreen: current
```

Toggle with the global hotkey (default: configurable per platform).

## Tab Appearance

```yaml
appearance:
  tabsOnTop: true
  tabsWidth: 0        # 0 = auto, or fixed pixel width
```

## CSS Customization

For advanced styling, Tabby supports custom CSS via plugins or the appearance section in config.

## Popular Theme Colors

### Dracula
```yaml
terminal:
  colorScheme:
    name: Dracula
    foreground: "#f8f8f2"
    background: "#282a36"
    cursor: "#f8f8f2"
    colors:
      - "#21222c"
      - "#ff5555"
      - "#50fa7b"
      - "#f1fa8c"
      - "#bd93f9"
      - "#ff79c6"
      - "#8be9fd"
      - "#f8f8f2"
      - "#6272a4"
      - "#ff6e6e"
      - "#69ff94"
      - "#ffffa5"
      - "#d6acff"
      - "#ff92df"
      - "#a4ffff"
      - "#ffffff"
```

### One Dark
```yaml
terminal:
  colorScheme:
    name: One Dark
    foreground: "#abb2bf"
    background: "#282c34"
    cursor: "#528bff"
    colors:
      - "#282c34"
      - "#e06c75"
      - "#98c379"
      - "#e5c07b"
      - "#61afef"
      - "#c678dd"
      - "#56b6c2"
      - "#abb2bf"
      - "#545862"
      - "#e06c75"
      - "#98c379"
      - "#e5c07b"
      - "#61afef"
      - "#c678dd"
      - "#56b6c2"
      - "#c8ccd4"
```

## Reload Changes

After modifying visual settings, restart Tabby or press `Ctrl+Shift+R` to reload.
