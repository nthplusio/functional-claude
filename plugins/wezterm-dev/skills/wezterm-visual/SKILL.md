---
name: wezterm-visual
description: This skill should be used when the user asks about "terminal opacity", "terminal blur", "wezterm opacity", "acrylic", "background blur", "cursor style", "cursor blink", "terminal theme", "color scheme", "catppuccin", "wezterm colors", "inactive pane", "window padding", or mentions visual customization of WezTerm.
version: 0.7.10
---

# WezTerm Visual Customization

Configure visual appearance: opacity, blur, cursor, colors, and themes.

## Background Opacity and Blur

### Windows 11 Acrylic Effect

```lua
config.window_background_opacity = 0.92
config.win32_system_backdrop = 'Acrylic'  -- Windows 11 acrylic blur
```

### macOS Blur

```lua
config.window_background_opacity = 0.9
config.macos_window_background_blur = 20
```

### Values
- `window_background_opacity`: 0.0 (transparent) to 1.0 (opaque)
- `macos_window_background_blur`: 0 to 100+

## Inactive Pane Dimming

Dim inactive panes for visual focus:

```lua
config.inactive_pane_hsb = {
    saturation = 0.8,  -- 0.0 = grayscale, 1.0 = full color
    brightness = 0.7,  -- 0.0 = black, 1.0 = normal
}
```

## Cursor Styling

```lua
config.default_cursor_style = 'BlinkingBar'  -- Bar, Block, Underline + Blinking variants
config.cursor_blink_rate = 500               -- milliseconds
config.cursor_blink_ease_in = 'Constant'     -- or 'Linear', 'EaseIn', 'EaseOut'
config.cursor_blink_ease_out = 'Constant'
config.force_reverse_video_cursor = true     -- cursor color inverts text
```

### Cursor Shapes
- `SteadyBlock` / `BlinkingBlock`
- `SteadyBar` / `BlinkingBar`
- `SteadyUnderline` / `BlinkingUnderline`

## Window Padding

```lua
config.window_padding = {
    left = 4,
    right = 4,
    top = 4,
    bottom = 4,
}
```

## Color Scheme

### Built-in Schemes

```lua
config.color_scheme = 'Catppuccin Mocha'
```

Popular options: `Catppuccin Mocha`, `Dracula`, `One Dark`, `Gruvbox Dark`, `Tokyo Night`

### Catppuccin Mocha Palette

```lua
local colors = {
    base = '#1e1e2e',
    surface0 = '#313244',
    surface1 = '#45475a',
    overlay0 = '#6c7086',
    text = '#cdd6f4',
    subtext0 = '#a6adc8',
    green = '#a6e3a1',
    yellow = '#f9e2af',
    blue = '#89b4fa',
    mauve = '#cba6f7',
    peach = '#fab387',
    red = '#f38ba8',
    teal = '#94e2d5',
}
```

### Custom Colors

```lua
config.colors = {
    foreground = '#cdd6f4',
    background = '#1e1e2e',
    cursor_bg = '#f5e0dc',
    cursor_fg = '#1e1e2e',
    selection_bg = '#45475a',
    selection_fg = '#cdd6f4',

    ansi = {
        '#45475a', '#f38ba8', '#a6e3a1', '#f9e2af',
        '#89b4fa', '#f5c2e7', '#94e2d5', '#bac2de',
    },
    brights = {
        '#585b70', '#f38ba8', '#a6e3a1', '#f9e2af',
        '#89b4fa', '#f5c2e7', '#94e2d5', '#a6adc8',
    },
}
```

## Font Configuration

```lua
config.font = wezterm.font('FiraCode Nerd Font')
config.font_size = 10

-- Font with fallbacks
config.font = wezterm.font_with_fallback({
    'FiraCode Nerd Font',
    'JetBrainsMono Nerd Font',
    'Cascadia Code',
})
```

## Window Settings

```lua
config.initial_cols = 120
config.initial_rows = 28
config.window_decorations = 'RESIZE'  -- or 'NONE', 'TITLE', 'INTEGRATED_BUTTONS'
config.enable_scroll_bar = false
```

## Testing Changes

1. Make changes to `~/.wezterm.lua`
2. Reload config: `Ctrl+Shift+R`
3. Check debug overlay: `Ctrl+Shift+L` for any errors
