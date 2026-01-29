---
name: hyper-ecosystem
description: This skill should be used when the user asks about "popular hyper plugins", "best hyper plugins", "find hyper plugin", "plugin recommendations", "hyper plugin examples", "what plugins", or mentions discovering and evaluating Hyper terminal plugins.
version: 0.3.1
---

# Hyper Plugin Ecosystem

Discover, evaluate, and use popular Hyper terminal plugins.

## First Action: Check Plugin Cache

Read the cached plugin ecosystem data:

```
${CLAUDE_PLUGIN_ROOT}/.cache/plugin-ecosystem.json
```

This file is automatically refreshed weekly by the SessionStart hook and contains:
- Top 25 most popular Hyper plugins
- Download counts and patterns
- Key exports for each plugin

## Popular Plugin Categories

### Terminal Enhancement

| Plugin | Purpose | Key Pattern |
|--------|---------|-------------|
| `hypercwd` | Open new tabs in current directory | cwd detection |
| `hyper-search` | Search terminal content | search |
| `hyper-pane` | Enhanced pane navigation | pane management |
| `hyperlinks` | Clickable URLs in terminal | link handling |

### Visual & Themes

| Plugin | Purpose | Key Pattern |
|--------|---------|-------------|
| `hyper-opacity` | Window transparency control | window effects |
| `hyper-dracula` | Dracula color theme | theme |
| `hyper-one-dark` | One Dark theme | theme |
| `hyper-snazzy` | Snazzy color scheme | theme |

### Status & Information

| Plugin | Purpose | Key Pattern |
|--------|---------|-------------|
| `hyper-statusline` | Status bar with git info | status bar |
| `hyper-tab-icons` | Icons in tab titles | tab customization |
| `hyper-tabs-enhanced` | Enhanced tab management | tab customization |

### Remote & SSH

| Plugin | Purpose | Key Pattern |
|--------|---------|-------------|
| `hyper-sshd` | SSH connection management | remote/ssh |
| `hyperterm-safepaste` | Safe paste for SSH | security |

## Evaluating Plugins

When recommending plugins, consider:

1. **Download count** - Higher downloads indicate stability and community trust
2. **Last update** - Recent updates suggest active maintenance
3. **Patterns used** - Match patterns to user needs
4. **Key exports** - Understand what the plugin modifies

## Installing Plugins

Add plugin names to `.hyper.js`:

```javascript
module.exports = {
  plugins: [
    'hypercwd',
    'hyper-search',
    'hyper-dracula'
  ],
  // ...
};
```

Reload with `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux).

## Finding More Plugins

### npm Registry

Search for plugins on npm:
```
https://www.npmjs.com/search?q=keywords:hyper-plugin
```

### Hyper Plugin Store

Official plugin directory:
```
https://hyper.is/plugins
```

### GitHub Topics

Search by topic:
```
https://github.com/topics/hyper-plugin
```

## Plugin Compatibility

Check compatibility before installing:

1. **Hyper version** - Some plugins require specific versions
2. **Platform support** - Not all plugins work on all platforms
3. **Conflicts** - Some plugins modify the same areas

Common conflicts:
- Multiple theme plugins (only use one)
- Tab customization plugins may conflict
- Window effect plugins may have platform limitations

## Creating Custom Plugins

For plugin development guidance, use the **hyper-plugins** skill.

For theme creation, use the **hyper-themes** skill.

## Refreshing the Cache

The plugin ecosystem cache refreshes automatically every 7 days.

To force a refresh, delete the cache file:
```bash
rm "${CLAUDE_PLUGIN_ROOT}/.cache/plugin-ecosystem.json"
```

Then start a new Claude session.

## Example: Finding a Plugin

**User request:** "I want tabs that show the current directory"

**Recommendation process:**
1. Check `plugin-ecosystem.json` for plugins with "cwd" or "tab" patterns
2. `hypercwd` - Opens new tabs in current directory
3. `hyper-tab-icons` - Shows process icons in tabs
4. Suggest combination based on user preference
