---
name: hyper-plugins
description: This skill should be used when the user asks to "create hyper plugin", "hyper plugin", "hyper extension", "decorateConfig", "hyper middleware", "hyper redux", "hyper react", "hyper electron", "hyper api", or mentions developing plugins for Hyper terminal.
version: 0.3.1
---

# Hyper Plugin Development

Develop plugins for Hyper terminal using JavaScript, React, and Redux.

## Plugin Architecture

Hyper plugins are npm packages that run in both Electron main process and renderer. They use a composition-based API with decorators and hooks.

## Plugin Structure

```
hyper-plugin-name/
├── package.json        # npm package manifest
├── index.js           # Main entry point
├── README.md          # Documentation
└── lib/               # Optional: additional modules
```

## package.json

```json
{
  "name": "hyper-your-plugin",
  "version": "1.0.0",
  "description": "Brief description",
  "main": "index.js",
  "keywords": ["hyper", "hyper-plugin"],
  "author": "Your Name",
  "license": "MIT"
}
```

**Required:** The `hyper` keyword is needed for plugin discovery.

## Configuration Decoration

### decorateConfig

Modify user configuration:

```javascript
exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    // Your config modifications
    myPluginOption: config.myPluginOption || 'default',
  });
};
```

Always preserve user config with spread:
```javascript
exports.decorateConfig = (config) => ({
  ...config,
  css: `${config.css || ''} .custom { color: red; }`,
});
```

## Lifecycle Hooks

### onApp
Called when Electron app is ready:
```javascript
exports.onApp = (app) => {
  app.on('before-quit', () => {
    // Cleanup
  });
};
```

### onWindow
Called when window is created:
```javascript
exports.onWindow = (window) => {
  window.on('focus', () => {
    // Handle window focus
  });
};
```

### onUnload
Called before plugin is unloaded:
```javascript
exports.onUnload = (window) => {
  // Cleanup resources, remove listeners
};
```

## Component Decorators

### decorateTerm
Wrap the terminal component:
```javascript
exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    render() {
      return React.createElement(Term, this.props);
    }
  };
};
```

### Other Decorators
- `decorateHeader` - Window header
- `decorateTabs` - Tab bar
- `decorateTab` - Individual tabs
- `decorateHyper` - Main Hyper component

## Redux Integration

### middleware
Intercept Redux actions:
```javascript
exports.middleware = (store) => (next) => (action) => {
  if (action.type === 'SESSION_ADD') {
    console.log('New session:', action.uid);
  }
  return next(action);
};
```

### Custom Reducers
```javascript
exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'CUSTOM_ACTION':
      return state.set('customState', action.payload);
    default:
      return state;
  }
};
```

## Common Action Types

| Action | Description |
|--------|-------------|
| `SESSION_ADD` | Session created |
| `SESSION_PTY_DATA` | Terminal output |
| `SESSION_PTY_EXIT` | Session ended |
| `SESSION_SET_ACTIVE` | Session focused |

See `references/api.md` for complete action reference.

## Local Development

1. Create plugin directory
2. Add to `.hyper.js`:
   ```javascript
   localPlugins: ['/path/to/your/plugin'],
   ```
3. Reload: `Cmd+Shift+R` / `Ctrl+Shift+R`
4. Debug in DevTools: `Cmd+Alt+I` / `Ctrl+Shift+I`

## Publishing

1. Ensure `hyper` keyword in package.json
2. Publish to npm: `npm publish`
3. Users add plugin name to `plugins` array

## Best Practices

1. **Preserve user config** - Always spread existing config
2. **Clean up on unload** - Remove listeners, clear timers
3. **Handle errors gracefully** - Don't crash the terminal
4. **Test across platforms** - macOS, Windows, Linux
5. **Minimize performance impact** - Avoid heavy middleware operations

## Related Skills

- **hyper-ecosystem** - Discover and evaluate existing plugins before building
- **hyper-themes** - Theme-specific plugin development
