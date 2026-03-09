#!/usr/bin/env node
// check-tabby-learnings.js
// Stop hook that checks if session involved Tabby work and prompts for learnings capture
//
// Enhanced pattern matching for:
// - Successful Patterns
// - Mistakes to Avoid
// - Connection Patterns
// - Plugin Discoveries

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

    // Read transcript and check for Tabby-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Config file and paths
      config: /config\.yaml.*tabby|tabby.*config\.yaml|\.config\/tabby|%APPDATA%\\tabby/i,

      // Skill names
      skills: /tabby-dev|tabby-keybindings|tabby-visual|tabby-connections|tabby-plugins|tabby-troubleshoot/i,

      // SSH configuration
      ssh: /tabby.*ssh|ssh.*tabby|ssh\s*connections|jump\s*host|port\s*forwarding|agent\s*forwarding|ssh.*profile/i,

      // Serial configuration
      serial: /tabby.*serial|serial.*tabby|baud\s*rate|serial\s*port|COM\d|\/dev\/tty/i,

      // Plugin development
      pluginDev: /tabby-plugin|tabby.*plugin.*develop|TerminalDecorator|ConfigProvider|TabRecoveryProvider|HotkeyProvider/i,

      // Plugin ecosystem
      ecosystem: /tabby-\w+[-\w]*|tabby.*plugin.*install|tabby.*marketplace/i,

      // Theming and appearance
      visual: /tabby.*theme|tabby.*color|tabby.*font|tabby.*opacity|colorScheme.*tabby/i,

      // Keybindings
      keybindings: /tabby.*hotkey|tabby.*keybind|tabby.*shortcut|multi-chord/i,

      // Terminal operations
      terminal: /tabby.*terminal|tabby.*cursor|tabby.*ligature/i,

      // General mentions
      general: /\btabby\s*(terminal|config|configuration|plugin|extension|theme|connection)\b/i
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
      let reason = "This session involved Tabby work";

      if (matchedCategories.includes('ssh')) {
        reason += " (SSH connections)";
      } else if (matchedCategories.includes('serial')) {
        reason += " (serial connections)";
      } else if (matchedCategories.includes('pluginDev')) {
        reason += " (plugin development)";
      } else if (matchedCategories.includes('ecosystem')) {
        reason += " (plugin ecosystem)";
      } else if (matchedCategories.includes('visual')) {
        reason += " (visual customization)";
      } else if (matchedCategories.includes('keybindings')) {
        reason += " (keybindings)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Working configurations or code\n";
      reason += "- Mistakes to Avoid: Errors encountered and solutions\n";
      reason += "- Connection Patterns: SSH/serial setup tips\n";
      reason += "- Plugin Discoveries: Useful plugins or integrations";

      // Allow stop but show message to user via stopReason
      console.log(JSON.stringify({
        stopReason: `[tabby-dev] ${reason}`
      }));
      process.exit(0);
    }

    console.log(JSON.stringify({}));
    process.exit(0);

  } catch (err) {
    // On any error, return empty to avoid blocking
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});
