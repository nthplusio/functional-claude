# Nerd Font Icons Reference

Comprehensive reference for Nerd Font icons used in WezTerm configuration.

## Icon Ranges

Nerd Fonts include icons from multiple sources:

| Source | Range | Notes |
|--------|-------|-------|
| Devicons | E700-E7C5 | Language/tool logos |
| Font Awesome | F000-F2E0 | General icons |
| Material Design | F0000+ | Extended range, comprehensive |
| Octicons | F400-F532 | GitHub-style icons |
| Powerline | E0A0-E0D4 | Terminal status line |

**Recommendation**: Use Material Design Icons (U+F0000+) for consistent styling and comprehensive coverage.

## Process Icons (Material Design)

### Shells

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰨊 | F0A0A | powershell, pwsh |
| 󰆍 | F018D | cmd, terminal |
|  | E795 | bash, zsh, sh, fish |

### JavaScript/Node

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰎙 | F0399 | node, npm, npx, yarn, pnpm, bun, deno |

### Python

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰌠 | F0320 | python, pip, conda, poetry, pytest |
| 󰠮 | F082E | jupyter |

### Other Languages

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰴭 | F0D2D | ruby, irb, gem, rails |
| 󰟓 | F07D3 | go |
| 󱘗 | F1617 | cargo, rustc, rustup |
| 󰬷 | F0B37 | java, javac, gradle, maven |
| 󰪮 | F0AAE | dotnet, csc, fsc |
| 󰙱 | F0671 | gcc, clang (C) |
| 󰙲 | F0672 | g++, clang++ (C++) |

### Editors

| Icon | Codepoint | Process |
|------|-----------|---------|
|  | E62B | vim, nvim, vi |
| 󰨞 | F0A1E | code (VS Code) |
| 󰷈 | F0DC8 | nano, micro, helix |
|  | E632 | emacs |

### Git & Version Control

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰊢 | F02A2 | git, lazygit, tig, gitui |
| 󰊤 | F02A4 | gh (GitHub CLI) |
| 󰮠 | F0BA0 | glab (GitLab CLI) |
| 󰘬 | F062C | git branch (status bar) |

### AI / Claude

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰚩 | F06A9 | claude, aider, copilot |

### Containers & Orchestration

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰡨 | F0868 | docker, podman, containerd |
| 󱃾 | F10FE | kubectl, k9s, helm, minikube |

### Cloud CLIs

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰸏 | F0E0F | aws, cdk |
| 󰠅 | F0805 | az (Azure) |
| 󱇶 | F11F6 | gcloud |
| 󱁢 | F1062 | terraform |
| 󰜫 | F072B | pulumi, cloud |

### Network & SSH

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰣀 | F08C0 | ssh, scp, sftp |
| 󰖟 | F059F | curl, wget, http |

### System Monitoring

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰄪 | F012A | htop, top, btop, glances |

### Search & Text

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰍉 | F0349 | grep, rg, ag, fd, fzf |
| 󰘦 | F0626 | jq, yq |

### File Managers

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰉋 | F024B | mc, ranger, lf, nnn, yazi |

### Databases

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰆼 | F01BC | mysql, psql, mongo, redis, sqlite |

### Compression

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰗄 | F05C4 | tar, zip, 7z, gzip |

### Package Managers

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰏖 | F03D6 | apt, yum, pacman, brew, choco |
| 󱄅 | F1105 | nix |

### Misc

| Icon | Codepoint | Process |
|------|-----------|---------|
| 󰮥 | F0BA5 | man, tldr |
| 󰈙 | F0219 | cat, bat, less, more |
| 󰥔 | F0954 | watch, time, clock |
| 󰌽 | F033D | neofetch, linux |
| 󰕧 | F0567 | asciinema, video |

## Status Bar Icons

| Icon | Codepoint | Use |
|------|-----------|-----|
| 󰚩 | F06A9 | Agent status (robot) |
| 󰘬 | F062C | Git branch |
| 󰥔 | F0954 | Clock/time |
| ● | 25CF | Working/waiting dot |
| ○ | 25CB | Idle circle |
| │ | 2502 | Separator |

## Testing Icons

Create a PowerShell script to test icon rendering:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Shells"
Write-Host ("  {0}  PowerShell" -f [char]::ConvertFromUtf32(0xF0A0A))
Write-Host ("  {0}  Terminal" -f [char]::ConvertFromUtf32(0xF018D))

Write-Host "Languages"
Write-Host ("  {0}  Python" -f [char]::ConvertFromUtf32(0xF0320))
Write-Host ("  {0}  Node.js" -f [char]::ConvertFromUtf32(0xF0399))

Write-Host "AI"
Write-Host ("  {0}  Claude" -f [char]::ConvertFromUtf32(0xF06A9))
```

Note: PowerShell 5 requires `[char]::ConvertFromUtf32()` for codepoints above U+FFFF.

## Font Requirements

Install a Nerd Font that includes Material Design Icons:
- **FiraCode Nerd Font** (recommended)
- **JetBrainsMono Nerd Font**
- **Hack Nerd Font**

Download from: https://www.nerdfonts.com/font-downloads

Configure in WezTerm:
```lua
config.font = wezterm.font('FiraCode Nerd Font')
```

## Troubleshooting

### Icons Show as Boxes

1. Verify Nerd Font is installed
2. Check font name matches exactly
3. Restart WezTerm after font installation

### Extended Unicode Not Rendering

Material Design Icons (U+F0000+) require proper font support. If issues persist:
1. Try a different Nerd Font variant
2. Use BMP-range icons (U+E000-U+F8FF) as fallback

### Finding New Icons

1. Visit https://www.nerdfonts.com/cheat-sheet
2. Search for icon by name
3. Copy the icon character or note codepoint
4. Add to process_icons table in config
