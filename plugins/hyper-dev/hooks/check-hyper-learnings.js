#!/usr/bin/env node
// Check if session involved Hyper config work and prompt for learnings capture
// JavaScript version of check-hyper-learnings.sh
//
// Enhanced pattern matching for:
// - Successful Patterns
// - Mistakes to Avoid
// - Plugin Patterns
// - Ecosystem Discoveries

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

    // Read transcript and check for Hyper-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Config file and paths
      config: /\.hyper\.js|hyper\.config|\.config\/Hyper|%APPDATA%\\Hyper/i,

      // Skill names
      skills: /hyper-dev|hyper-keybindings|hyper-visual|hyper-plugins|hyper-themes|hyper-ecosystem|hyper-troubleshoot/i,

      // Plugin development API
      pluginApi: /decorateConfig|decorateTerm|decorateHyper|decorateHeader|decorateTabs|decorateTab|mapTermsState|reduceUI|reduceSessions|mapHyperState|getTermGroupProps|getTermProps|onApp|onWindow|onUnload/i,

      // Redux and middleware
      redux: /hyper.*middleware|SESSION_ADD|SESSION_PTY_DATA|SESSION_PTY_EXIT|SESSION_SET_ACTIVE/i,

      // Plugin ecosystem
      ecosystem: /hyper-\w+[-\w]*|npm.*hyper|hyper.*plugin|keywords.*hyper/i,

      // xterm.js integration
      xterm: /xterm\.js|Terminal\s*buffer|ITerminalOptions|xterm.*addon/i,

      // Electron integration
      electron: /BrowserWindow.*hyper|electron.*hyper|ipc.*hyper/i,

      // Visual customization
      visual: /hyper.*opacity|hyper.*blur|hyper.*theme|hyper.*color|cursorColor|backgroundColor.*hyper/i,

      // Keybindings
      keybindings: /keymaps\s*:|hyper.*shortcut|hyper.*keybind/i,

      // General mentions
      general: /\bhyper\s*(terminal|config|configuration|plugin|extension|theme)\b/i
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
      let reason = "This session involved Hyper work";

      if (matchedCategories.includes('pluginApi') || matchedCategories.includes('redux')) {
        reason += " (plugin development)";
      } else if (matchedCategories.includes('ecosystem')) {
        reason += " (plugin ecosystem)";
      } else if (matchedCategories.includes('visual')) {
        reason += " (visual customization)";
      } else if (matchedCategories.includes('keybindings')) {
        reason += " (keybindings)";
      } else if (matchedCategories.includes('xterm') || matchedCategories.includes('electron')) {
        reason += " (terminal internals)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Working configurations or code\n";
      reason += "- Mistakes to Avoid: Errors encountered and solutions\n";
      reason += "- Plugin Patterns: Reusable plugin techniques\n";
      reason += "- Ecosystem Discoveries: Useful plugins or integrations";

      // Allow stop but show message to user via stopReason
      console.log(JSON.stringify({
        stopReason: `[hyper-dev] ${reason}`
      }));
      process.exit(0);
    }

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
