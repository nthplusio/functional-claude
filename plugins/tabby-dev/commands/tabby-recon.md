---
name: tabby-recon
description: Analyze Tabby terminal configuration and recommend optimizations
argument-hint: [focus-area]
tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Tabby Configuration Reconnaissance

Analyze the user's Tabby terminal configuration to provide setup recommendations and optimization suggestions.

## Analysis Steps

### 1. Detect Tabby Installation

Check for Tabby installation and version:

```bash
# Check for Tabby CLI
tabby --version 2>/dev/null || echo "Tabby CLI not found"
```

### 2. Locate Configuration

Find the Tabby config file:

**Paths to check:**
- macOS/Linux: `~/.config/tabby/config.yaml`
- Windows: `%APPDATA%\tabby\config.yaml`
- Portable: `data/config.yaml`

### 3. Analyze Configuration

Read `config.yaml` and check:

- **Terminal settings**: Font, font size, ligatures, cursor style
- **Appearance**: Theme, tab position, window frame, opacity
- **SSH connections**: Profiles count, auth methods, groups
- **Serial connections**: Port configurations
- **Keybindings**: Custom hotkeys defined
- **Plugins**: Installed plugins list

### 4. Check Installed Plugins

List plugins configured in the config file and assess:
- Are essential plugins installed?
- Are there deprecated or conflicting plugins?
- Are there recommended plugins for the user's use case?

### 5. Security Audit

Check for potential security issues:
- Passwords stored in plaintext (should use vault)
- Private key permissions
- Agent forwarding on untrusted hosts
- Open port forwarding configurations

### 6. Performance Check

Look for performance-impacting settings:
- Font ligatures on slow machines
- Many active plugins
- Large terminal scrollback buffer

## Output Format

Provide a structured report:

```markdown
## Tabby Configuration Analysis

### Installation
- **Version**: X.Y.Z
- **Config path**: /path/to/config.yaml
- **Platform**: Windows/macOS/Linux

### Terminal Settings
- **Font**: Fira Code, 14px
- **Ligatures**: Enabled
- **Cursor**: Block, blinking

### Connections
- **SSH profiles**: X profiles in Y groups
- **Serial profiles**: X profiles
- **Auth methods used**: publicKey, password

### Plugins
- **Installed**: X plugins
- **List**: [plugin names]

### Recommendations

#### Immediate Actions
1. [Action item]
2. [Action item]

#### Security
1. [Security recommendation]

#### Performance
1. [Performance recommendation]

#### Suggested Plugins
Based on your setup, consider:
- `tabby-docker` - If you work with containers
- `tabby-save-output` - For session recording
- `tabby-sync-config` - For config backup/sync
```

## Tips

- Check for unused SSH connections that could be cleaned up
- Look for connections without groups and suggest organization
- Verify SSH key paths actually exist
- Check if jump host chains are optimal
- Recommend vault usage if passwords are stored in config
