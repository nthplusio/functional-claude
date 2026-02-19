#!/usr/bin/env node
// shadcn-session-start.js
// SessionStart hook that detects shadcn/ui setup and triggers cache refresh if stale
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing status
//
// Cache refresh is delegated to the shadcn-cache-update agent via systemMessage
// rather than done inline, so the hook never blocks on network requests.

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
    const projectDir = data.cwd || process.cwd();
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;

    if (!pluginRoot) {
      console.log(JSON.stringify({ continue: true }));
      process.exit(0);
    }

    const cacheDir = path.join(pluginRoot, '.cache');
    const configCachePath = path.join(cacheDir, 'shadcn-config.json');

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Detect shadcn/ui setup in project
    const shadcnInfo = detectShadcnSetup(projectDir);

    // Update config cache
    const now = new Date();
    const newConfig = {
      detected: shadcnInfo.detected,
      style: shadcnInfo.style,
      base_color: shadcnInfo.baseColor,
      components_path: shadcnInfo.componentsPath,
      installed_components: shadcnInfo.installedComponents,
      detection_timestamp: now.toISOString(),
      config_path: shadcnInfo.configPath
    };

    fs.writeFileSync(configCachePath, JSON.stringify(newConfig, null, 2));

    // No shadcn config found - exit early
    if (!shadcnInfo.detected) {
      console.log(JSON.stringify({
        continue: true,
        systemMessage: '[shadcn-dev] No components.json found'
      }));
      process.exit(0);
    }

    // Build status message
    const parts = [];

    if (shadcnInfo.style) {
      parts.push(`shadcn/ui (${shadcnInfo.style})`);
    } else {
      parts.push('shadcn/ui ready');
    }

    if (shadcnInfo.installedComponents.length > 0) {
      const compWord = shadcnInfo.installedComponents.length === 1 ? 'component' : 'components';
      parts.push(`${shadcnInfo.installedComponents.length} ${compWord}`);
    }

    let systemMessage = `[shadcn-dev] ${parts.join(', ')}`;

    console.log(JSON.stringify({
      continue: true,
      systemMessage
    }));

  } catch (err) {
    // On any error, continue without blocking
    console.log(JSON.stringify({ continue: true }));
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect shadcn/ui setup in project
 */
function detectShadcnSetup(projectDir) {
  const result = {
    detected: false,
    style: null,
    baseColor: null,
    componentsPath: null,
    configPath: null,
    installedComponents: []
  };

  // Look for components.json
  const configPaths = [
    path.join(projectDir, 'components.json'),
    path.join(projectDir, 'src', 'components.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      result.configPath = configPath;
      result.detected = true;

      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        result.style = config.style || null;
        result.baseColor = config.tailwind?.baseColor || null;

        // Get components path from aliases
        if (config.aliases?.components) {
          const alias = config.aliases.components;
          if (alias.startsWith('@/')) {
            result.componentsPath = path.join(projectDir, alias.slice(2));
          } else {
            result.componentsPath = path.join(projectDir, alias);
          }
        }
      } catch (e) {
        // Config exists but can't be parsed
      }
      break;
    }
  }

  // Find installed components
  if (result.componentsPath) {
    const uiPath = path.join(result.componentsPath, 'ui');
    if (fs.existsSync(uiPath)) {
      try {
        const files = fs.readdirSync(uiPath);
        result.installedComponents = files
          .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'))
          .map(f => f.replace(/\.(tsx|jsx)$/, ''));
      } catch (e) {
        // Can't read directory
      }
    }
  }

  return result;
}
