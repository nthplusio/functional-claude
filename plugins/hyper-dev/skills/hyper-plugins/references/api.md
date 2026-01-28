# Hyper Plugin Development Reference

Complete reference for developing Hyper terminal plugins.

## Plugin Architecture

Hyper plugins are Node.js modules that run in both the main Electron process and the renderer process. They use a composition-based API with decorators and hooks.

## Directory Structure

```
hyper-plugin-name/
├── package.json        # npm package manifest
├── index.js           # Main entry point (or use "main" in package.json)
├── README.md          # Documentation
├── lib/               # Optional: additional modules
│   └── utils.js
└── assets/            # Optional: static assets
    └── icon.png
```

## package.json Requirements

```json
{
  "name": "hyper-your-plugin",
  "version": "1.0.0",
  "description": "Brief description of your plugin",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/hyper-your-plugin"
  },
  "keywords": [
    "hyper",
    "hyper-plugin",
    "hyper-theme"
  ],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/username/hyper-your-plugin/issues"
  },
  "homepage": "https://github.com/username/hyper-your-plugin#readme"
}
```

**Important:** The `hyper` keyword is required for plugin discovery. Use `hyper-theme` for themes.

## Configuration Decoration

### decorateConfig

Modify the user's configuration:

```javascript
exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    // Override or extend config
    css: `
      ${config.css || ''}
      .term_term {
        opacity: 0.95;
      }
    `,
    termCSS: `
      ${config.termCSS || ''}
      .terminal-cursor {
        background-color: #ff0000 !important;
      }
    `,
  });
};
```

### Preserving User Config

Always spread existing config to preserve user settings:

```javascript
exports.decorateConfig = (config) => {
  return {
    ...config,
    // Your additions
    myPluginOption: config.myPluginOption || 'default',
  };
};
```

## Lifecycle Hooks

### onApp

Called when the main Electron app is ready:

```javascript
exports.onApp = (app) => {
  // app is the Electron app instance
  app.on('before-quit', () => {
    // Cleanup before app quits
  });
};
```

### onWindow

Called when a new window is created:

```javascript
exports.onWindow = (window) => {
  // window is the Electron BrowserWindow instance
  window.on('focus', () => {
    // Handle window focus
  });
};
```

### onUnload

Called before the plugin is unloaded (during reload):

```javascript
exports.onUnload = (window) => {
  // Cleanup resources
  // Remove event listeners
  // Clear intervals/timeouts
};
```

## Component Decorators

### decorateTerm

Wrap the terminal component:

```javascript
exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.onTerminal = this.onTerminal.bind(this);
    }

    onTerminal(term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term);
      }
      // Access xterm instance
      term.on('data', (data) => {
        // Handle terminal data
      });
    }

    render() {
      return React.createElement(Term, {
        ...this.props,
        onTerminal: this.onTerminal,
      });
    }
  };
};
```

### decorateHeader

Customize the window header:

```javascript
exports.decorateHeader = (Header, { React }) => {
  return class extends React.Component {
    render() {
      return React.createElement(
        'div',
        {},
        React.createElement(Header, this.props),
        React.createElement('div', { className: 'custom-status' }, 'Custom')
      );
    }
  };
};
```

### decorateTabs / decorateTab

Customize tab bar and individual tabs:

```javascript
exports.decorateTabs = (Tabs, { React }) => {
  return class extends React.Component {
    render() {
      return React.createElement(Tabs, {
        ...this.props,
        customProp: 'value',
      });
    }
  };
};

exports.decorateTab = (Tab, { React }) => {
  return class extends React.Component {
    render() {
      const { isActive, hasActivity } = this.props;
      return React.createElement(Tab, {
        ...this.props,
        // Modify tab appearance based on state
      });
    }
  };
};
```

### Other Decorators

- `decorateHyper` - Main Hyper component
- `decorateNotification` - Notification component
- `decorateNotifications` - Notifications container
- `decorateSplitPane` - Split pane component
- `decorateTermGroup` - Terminal group component

## Redux Integration

### middleware

Intercept and modify Redux actions:

```javascript
exports.middleware = (store) => (next) => (action) => {
  const { type, ...rest } = action;

  switch (type) {
    case 'SESSION_ADD':
      console.log('New session:', rest.uid);
      break;

    case 'SESSION_PTY_DATA':
      // rest.data contains terminal output
      break;

    case 'SESSION_PTY_EXIT':
      console.log('Session closed:', rest.uid);
      break;
  }

  return next(action);
};
```

### Dispatching Actions

```javascript
exports.middleware = (store) => (next) => (action) => {
  if (action.type === 'SOME_TRIGGER') {
    // Dispatch custom action
    store.dispatch({
      type: 'CUSTOM_ACTION',
      payload: { /* data */ },
    });
  }
  return next(action);
};
```

### Custom Reducers

```javascript
exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'CUSTOM_UI_ACTION':
      return state.set('customState', action.payload);
    default:
      return state;
  }
};

exports.reduceSessions = (state, action) => {
  switch (action.type) {
    case 'CUSTOM_SESSION_ACTION':
      return state.setIn(['sessions', action.uid, 'custom'], action.payload);
    default:
      return state;
  }
};
```

## Common Action Types

### Session Actions

| Action | Properties | Description |
|--------|------------|-------------|
| `SESSION_ADD` | `uid`, `shell`, `pid` | Session created |
| `SESSION_RESIZE` | `uid`, `cols`, `rows` | Terminal resized |
| `SESSION_PTY_DATA` | `uid`, `data` | Output received |
| `SESSION_PTY_EXIT` | `uid` | Session ended |
| `SESSION_SET_ACTIVE` | `uid` | Session focused |
| `SESSION_SET_XTERM_TITLE` | `uid`, `title` | Title changed |
| `SESSION_USER_DATA` | `uid`, `data` | User input |

### UI Actions

| Action | Properties | Description |
|--------|------------|-------------|
| `UI_FONT_SIZE_SET` | `value` | Font size changed |
| `UI_FONT_SIZE_INCR` | - | Font size increased |
| `UI_FONT_SIZE_DECR` | - | Font size decreased |
| `UI_FONT_SIZE_RESET` | - | Font size reset |
| `UI_WINDOW_MAXIMIZE` | - | Window maximized |
| `UI_WINDOW_UNMAXIMIZE` | - | Window unmaximized |

### Tab/Pane Actions

| Action | Properties | Description |
|--------|------------|-------------|
| `TERM_GROUP_REQUEST` | `activeUid`, `splitDirection` | Pane split requested |
| `TERM_GROUP_EXIT` | `uid` | Pane closed |
| `TAB_SET_ACTIVE` | `uid` | Tab activated |

## Helper Functions

### notify

Show system notifications:

```javascript
exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    componentDidMount() {
      notify('Plugin loaded!', 'Plugin is now active');
    }
    render() {
      return React.createElement(Term, this.props);
    }
  };
};
```

### getState

Access current Redux state:

```javascript
exports.middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const activeSession = state.sessions.activeUid;
  const sessions = state.sessions.sessions;
  return next(action);
};
```

## CSS Styling

### config.css

Apply CSS to the entire app:

```javascript
exports.decorateConfig = (config) => ({
  ...config,
  css: `
    ${config.css || ''}
    .hyper_main {
      border: none;
    }
    .tabs_nav {
      background-color: #1a1a1a;
    }
  `,
});
```

### config.termCSS

Apply CSS to terminal content:

```javascript
exports.decorateConfig = (config) => ({
  ...config,
  termCSS: `
    ${config.termCSS || ''}
    .terminal {
      background-color: rgba(0, 0, 0, 0.9) !important;
    }
  `,
});
```

## Development Workflow

### Local Development

1. Create plugin directory
2. Add to `.hyper.js`:
   ```javascript
   localPlugins: ['/path/to/your/plugin'],
   ```
3. Make changes
4. Reload: `Cmd+Shift+R` / `Ctrl+Shift+R`

### Debugging

1. Open DevTools: `Cmd+Alt+I` / `Ctrl+Shift+I`
2. Check Console for errors
3. Use React DevTools for component inspection
4. Add breakpoints in Sources panel

### Publishing

1. Ensure `package.json` has `hyper` keyword
2. Publish to npm:
   ```bash
   npm publish
   ```
3. Users install via `plugins` array in config

## Best Practices

1. **Preserve user config** - Always spread existing config
2. **Clean up on unload** - Remove listeners, clear timers
3. **Handle errors gracefully** - Don't crash the terminal
4. **Test across platforms** - macOS, Windows, Linux
5. **Document configuration** - Explain any config options
6. **Use semantic versioning** - Follow semver for updates
7. **Minimize performance impact** - Avoid heavy operations in middleware
