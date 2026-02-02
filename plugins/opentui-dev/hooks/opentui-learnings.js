#!/usr/bin/env node
// Check if session involved OpenTUI work and prompt for learnings capture
// Enhanced pattern matching for:
// - Successful Patterns
// - Mistakes to Avoid
// - Component Patterns
// - Layout Discoveries

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

    // Read transcript and check for OpenTUI-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Core package references
      core: /@opentui\/core|@opentui\/react|@opentui\/solid|opentui.*import|from\s*['"]@opentui/i,

      // Skill names
      skills: /opentui-dev|opentui-components|opentui-layout|opentui-keyboard|opentui-animation|opentui-troubleshoot/i,

      // Components
      components: /<text|<input|<select|<button|<box|<scroll|<progress|<spinner|<ascii[_-]font|<tab[_-]select|<figlet/i,

      // Layout and flexbox
      layout: /flexDirection|alignItems|justifyContent|flexGrow|flexShrink|flexBasis|paddingTop|paddingBottom|paddingLeft|paddingRight|marginTop|marginBottom|width\s*:|height\s*:/i,

      // Keyboard input
      keyboard: /useKeyboard|onKeyPress|focused\s*=|KeyboardEvent|inputMode|onSubmit/i,

      // Animation
      animation: /Timeline|useTimeline|animation\s*=|easing\s*:|duration\s*:|loop\s*:|from\s*:|to\s*:/i,

      // Renderer and testing
      renderer: /createRenderer|renderer\.destroy|testRenderer|captureCharFrame|renderOnce|mockKeyPress/i,

      // React/Solid reconciler
      reconciler: /reconcileToNode|createTextNode|commitUpdate|finalizeChildren|useForceUpdate/i,

      // Build and runtime
      build: /bun\s+run|bun\s+build|zig\s+|@opentui.*error|TUI\s+crash|terminal\s+cleanup/i,

      // General mentions
      general: /\bopentui\s*(component|layout|app|interface)\b|\bTUI\s+(app|application|interface)\b/i
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
      let reason = "This session involved OpenTUI work";

      if (matchedCategories.includes('components')) {
        reason += " (component development)";
      } else if (matchedCategories.includes('layout')) {
        reason += " (layout and styling)";
      } else if (matchedCategories.includes('keyboard')) {
        reason += " (keyboard input handling)";
      } else if (matchedCategories.includes('animation')) {
        reason += " (animation)";
      } else if (matchedCategories.includes('renderer') || matchedCategories.includes('reconciler')) {
        reason += " (renderer/internals)";
      } else if (matchedCategories.includes('build')) {
        reason += " (build/runtime)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Working component or layout patterns\n";
      reason += "- Mistakes to Avoid: Errors encountered and solutions\n";
      reason += "- Component Patterns: Reusable TUI components\n";
      reason += "- Layout Discoveries: Flexbox tips and tricks";

      // Output reminder to stderr (visible but not a blocking error)
      console.error(`[opentui-dev] ${reason}`);
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
