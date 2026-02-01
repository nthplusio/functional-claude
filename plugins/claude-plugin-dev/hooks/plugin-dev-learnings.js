#!/usr/bin/env node
// plugin-dev-learnings.js
// Stop hook that checks if session involved Claude Code plugin development work
// and prompts for learnings capture
//
// Input: JSON with session info and transcript_path on stdin
// Output: Informational feedback via stderr, allows stop via stdout
//
// Note: Using stderr for feedback + {} on stdout avoids the "error" display
// while still showing the learnings reminder to Claude.

const fs = require('fs');
const path = require('path');

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

    // Check if capture_learnings is disabled
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
    if (pluginRoot) {
      const learningsPath = path.join(pluginRoot, '.cache', 'learnings.md');
      if (fs.existsSync(learningsPath)) {
        const content = fs.readFileSync(learningsPath, 'utf8');
        if (/capture_learnings:\s*false/i.test(content)) {
          console.log(JSON.stringify({}));
          process.exit(0);
        }
      }
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Read transcript and check for plugin development work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // Plugin structure
      structure: /\.claude-plugin|plugin\.json|SKILL\.md|AGENT\.md|hooks\.json|\.mcp\.json/i,

      // Skills
      skills: /claude-plugin-dev|plugin-structure|skill-development|agent-development|hook-development|mcp-integration/i,

      // Plugin concepts
      concepts: /CLAUDE_PLUGIN_ROOT|CLAUDE_PROJECT_DIR|frontmatter|progressive disclosure|trigger phrases/i,

      // Hook events
      hookEvents: /PreToolUse|PostToolUse|SessionStart|SessionEnd|Stop|SubagentStop|UserPromptSubmit|PreCompact|Notification/i,

      // Hook types
      hookTypes: /type.*command|type.*prompt|permissionDecision|hookSpecificOutput/i,

      // MCP
      mcp: /Model Context Protocol|MCP server|mcpServers|stdio|sse/i,

      // Agent definition
      agents: /subagent|agent.*tools|agent.*model|autonomous agent/i,

      // Validation
      validation: /plugin-validator|validate plugin|plugin structure|convention/i,

      // Marketplace
      marketplace: /marketplace\.json|plugin marketplace|--plugin-dir/i
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
      let context = "";

      if (matchedCategories.includes('hookEvents') || matchedCategories.includes('hookTypes')) {
        context = " (hooks)";
      } else if (matchedCategories.includes('mcp')) {
        context = " (MCP integration)";
      } else if (matchedCategories.includes('agents')) {
        context = " (agent development)";
      } else if (matchedCategories.includes('validation')) {
        context = " (plugin validation)";
      } else if (matchedCategories.includes('structure')) {
        context = " (plugin structure)";
      }

      // Output feedback to stderr (shown to Claude but not as "error")
      // Then allow stop with empty object on stdout
      process.stderr.write(`[claude-plugin-dev] Session involved plugin development${context}. Consider capturing learnings to .cache/learnings.md\n`);
      console.log(JSON.stringify({}));
      process.exit(0);
    }

    // Allow stop - no plugin development detected
    console.log(JSON.stringify({}));
    process.exit(0);

  } catch (err) {
    // On any error, allow stop
    console.log(JSON.stringify({}));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({}));
  process.exit(0);
});
