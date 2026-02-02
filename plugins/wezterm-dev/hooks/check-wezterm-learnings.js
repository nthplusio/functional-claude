#!/usr/bin/env node
// Check if session involved WezTerm config work and prompt for learnings capture
// JavaScript version with enhanced pattern matching for:
// - Successful Patterns
// - Mistakes to Avoid
// - Plugin Patterns
// - Configuration Discoveries

const fs = require('fs');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // Check if stop_hook_active is true (already continuing from a stop hook)
    if (data.stop_hook_active === true) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Read transcript and check for WezTerm-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Config file and paths
      config: /wezterm\.lua|\.wezterm\.lua|\.config\/wezterm|wezterm\.config_builder/i,

      // Skill names
      skills: /wezterm-dev|wezterm-keybindings|wezterm-visual|wezterm-tabs|wezterm-agent-deck|wezterm-troubleshoot/i,

      // Keybindings and leader key
      keybindings: /config\.leader|config\.keys|SendKey|SplitVertical|SplitHorizontal|ActivatePaneDirection|AdjustPaneSize|ActivateTab|CloseCurrentPane|SpawnTab|key\s*=\s*['"][^'"]+['"]\s*,\s*mods\s*=/i,

      // Visual customization
      visual: /window_background_opacity|window_decorations|color_scheme|font_size|font\s*=\s*wezterm\.font|tab_bar_at_bottom|use_fancy_tab_bar|window_frame|cursor_blink/i,

      // Tab bar and status
      tabs: /format-tab-title|update-status|tab_bar_style|wezterm\.format|wezterm\.nerdfonts|process_icons|get_cwd|get_process_name/i,

      // Plugin development
      plugins: /wezterm\.plugin|plugin\.require|plugin:require|wezterm\.on\s*\(|wezterm\.action\.|wezterm\.action_callback/i,

      // Agent Deck integration
      agentDeck: /agent_deck|get_agent_state|count_agents_by_status|agent-deck|AgentDeck/i,

      // Multiplexing and panes
      multiplexing: /mux:get_active|mux:get_domain|spawn|PaneSelect|RotatePanes|TogglePaneZoom|unix_domain|ssh_domain/i,

      // Events and callbacks
      events: /wezterm\.on\s*\(['"]|update-right-status|bell|window-config-reloaded|window-resized|window-focus-changed/i,

      // General mentions
      general: /\bwezterm\s*(terminal|config|configuration|theme)\b/i
    };

    // Check if any pattern matches
    let matched = false;
    const matchedCategories = [];

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(transcript)) {
        matched = true;
        matchedCategories.push(category);
      }
    }

    if (matched) {
      // Build contextual message based on what was detected
      let reason = "This session involved WezTerm work";

      if (matchedCategories.includes('keybindings')) {
        reason += " (keybindings)";
      } else if (matchedCategories.includes('plugins') || matchedCategories.includes('events')) {
        reason += " (plugin/event development)";
      } else if (matchedCategories.includes('visual')) {
        reason += " (visual customization)";
      } else if (matchedCategories.includes('tabs')) {
        reason += " (tab bar customization)";
      } else if (matchedCategories.includes('agentDeck')) {
        reason += " (Agent Deck integration)";
      } else if (matchedCategories.includes('multiplexing')) {
        reason += " (multiplexing/panes)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Working configurations or Lua code\n";
      reason += "- Mistakes to Avoid: Errors encountered and solutions\n";
      reason += "- Plugin Patterns: Reusable plugin techniques\n";
      reason += "- Configuration Discoveries: Useful options or settings";

      // Output reminder to stderr (visible but not a blocking error)
      console.error(`[wezterm-dev] ${reason}`);
    }

    // Always allow - learnings capture is just a reminder, not a block
    console.log(JSON.stringify({}));
    process.exit(0);

  } catch (err) {
    // On any error, return ok to avoid blocking
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});
