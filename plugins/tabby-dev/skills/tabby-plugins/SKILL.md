---
name: tabby-plugins
description: This skill should be used when the user asks to "tabby plugin", "install tabby plugin", "tabby extension", "develop tabby plugin", "tabby plugin api", "tabby marketplace", or mentions discovering, installing, or developing plugins for Tabby terminal.
version: 0.1.3
---

# Tabby Plugins

Discover, install, and develop plugins for Tabby terminal.

## Installing Plugins

Plugins are installed through the Tabby Settings UI:

1. Open Settings (Ctrl+,)
2. Navigate to Plugins
3. Search for the plugin
4. Click Install

Plugins can also be configured in `config.yaml`:

```yaml
plugins:
  - name: "tabby-docker"
    version: "latest"
  - name: "tabby-save-output"
    version: "latest"
```

## Popular Plugins

### Connection & Session

| Plugin | Description |
|--------|-------------|
| tabby-docker | Connect to Docker containers |
| tabby-quick-cmds | Send commands to multiple tabs simultaneously |
| tabby-save-output | Record terminal output to file |
| tabby-workspace-manager | Save and restore workspace layouts |

### Appearance & UI

| Plugin | Description |
|--------|-------------|
| tabby-background | Custom background images |
| tabby-highlight | Keyword highlighting in terminal output |
| tabby-title-control | Customize tab titles |

### Integration

| Plugin | Description |
|--------|-------------|
| tabby-sftp-tab | SFTP file browser tab |
| tabby-sync-config | Sync config via Gist or Gitee |
| tabby-search-in-browser | Search selected text in browser |
| tabby-mcp-server | Model Context Protocol AI integration |

## Plugin Development

Tabby plugins are npm packages built with Angular and TypeScript.

### Plugin Structure

```
tabby-my-plugin/
├── package.json        # npm manifest with tabby keywords
├── tsconfig.json       # TypeScript configuration
├── webpack.config.js   # Webpack build configuration
├── src/
│   ├── index.ts        # Module entry point
│   ├── components/     # Angular components
│   └── services/       # Angular services
└── README.md
```

### package.json

```json
{
  "name": "tabby-my-plugin",
  "version": "1.0.0",
  "description": "My Tabby plugin",
  "keywords": ["tabby-plugin"],
  "main": "dist/index.js",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch"
  },
  "peerDependencies": {
    "tabby-core": "*",
    "tabby-terminal": "*"
  },
  "devDependencies": {
    "@angular/core": "^17.0.0",
    "typescript": "^5.0.0",
    "webpack": "^5.0.0"
  }
}
```

**Required:** The `tabby-plugin` keyword is needed for plugin discovery.

### Module Entry Point

```typescript
// src/index.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [],
})
export default class MyPluginModule {
  // Plugin initialization
}
```

### Adding Tab Types

```typescript
import { NgModule } from '@angular/core';
import { TabRecoveryProvider, NewTabParameters } from 'tabby-core';

@Injectable()
export class MyTabRecoveryProvider extends TabRecoveryProvider {
  async recover(token: any): Promise<NewTabParameters | null> {
    // Recover tab state after restart
    return null;
  }
}

@NgModule({
  providers: [
    { provide: TabRecoveryProvider, useClass: MyTabRecoveryProvider, multi: true },
  ],
})
export default class MyPluginModule {}
```

### Adding Settings

```typescript
import { ConfigProvider, Platform } from 'tabby-core';

@Injectable()
export class MyConfigProvider extends ConfigProvider {
  defaults = {
    myPlugin: {
      enabled: true,
      option1: 'default',
    },
  };

  platformDefaults = {
    [Platform.Windows]: {},
    [Platform.macOS]: {},
    [Platform.Linux]: {},
  };
}
```

### Adding Terminal Decorators

```typescript
import { TerminalDecorator, BaseTerminalTabComponent } from 'tabby-terminal';

@Injectable()
export class MyTerminalDecorator extends TerminalDecorator {
  attach(tab: BaseTerminalTabComponent): void {
    // Subscribe to terminal events
    tab.sessionChanged$.subscribe(() => {
      // React to session changes
    });

    tab.output$.subscribe(data => {
      // Process terminal output
    });
  }

  detach(tab: BaseTerminalTabComponent): void {
    // Cleanup
  }
}
```

### Adding Hotkeys

```typescript
import { HotkeyProvider, HotkeyDescription } from 'tabby-core';

@Injectable()
export class MyHotkeyProvider extends HotkeyProvider {
  hotkeys: HotkeyDescription[] = [
    {
      id: 'my-plugin:action',
      name: 'My Plugin Action',
    },
  ];
}
```

## Plugin API Core Concepts

| Concept | Description |
|---------|-------------|
| `TabRecoveryProvider` | Restore tab state after restart |
| `ConfigProvider` | Define default configuration |
| `TerminalDecorator` | Hook into terminal events |
| `HotkeyProvider` | Register custom hotkeys |
| `ToolbarButtonProvider` | Add toolbar buttons |
| `ProfileProvider` | Add new profile types |
| `SettingsTabProvider` | Add settings UI sections |

## Local Development

1. Clone the Tabby repository
2. Create your plugin in a separate directory
3. Link it: `npm link` in plugin dir, `npm link tabby-my-plugin` in Tabby
4. Build: `npm run build` or `npm run dev` for watch mode
5. Restart Tabby to load changes

## Publishing

1. Ensure `tabby-plugin` keyword in package.json
2. Build: `npm run build`
3. Publish to npm: `npm publish`
4. Plugin appears in Tabby Settings > Plugins search

## Plugin API Documentation

Full API reference: https://docs.tabby.sh/

## Best Practices

1. **Use peerDependencies** for tabby-core and tabby-terminal
2. **Handle errors gracefully** - Don't crash the terminal
3. **Clean up on unload** - Unsubscribe from observables
4. **Test across platforms** - Windows, macOS, Linux
5. **Support configuration** - Use ConfigProvider for user settings
6. **Follow Angular patterns** - Dependency injection, modules, services
