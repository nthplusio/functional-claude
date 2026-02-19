#!/usr/bin/env node
// gemini-session-start.js
// SessionStart hook that validates Gemini CLI installation, environment variables,
// and nano-banana extension availability.
//
// Input: JSON with session info on stdin
// Output: JSON with systemMessage containing validation status

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    // 1. Check if Gemini CLI is installed
    const geminiInfo = detectGeminiCli();

    // 2. Check authentication / environment variables
    const authInfo = checkAuth();

    // 3. Check if nano-banana extension is installed
    const nanoBananaInfo = checkNanoBanana();

    // 4. Check Gemini CLI settings for Gemini 3 Pro support
    const settingsInfo = checkSettings();

    // Build status message
    const statusParts = [];
    const warnings = [];

    if (!settingsInfo.previewFeatures) {
      warnings.push('Gemini 3 Pro requires Preview Features enabled. Run `gemini` then `/settings` and enable Preview Features, or add `"general": { "previewFeatures": true }` to ~/.gemini/settings.json');
    }

    if (geminiInfo.installed) {
      statusParts.push(geminiInfo.version ? `Gemini CLI ${geminiInfo.version}` : 'Gemini CLI ready');
    } else {
      warnings.push('Gemini CLI not found. Install: npm install -g @google/gemini-cli or see https://geminicli.com/docs/');
    }

    if (authInfo.authenticated) {
      statusParts.push(`auth: ${authInfo.method}`);
    } else {
      warnings.push('No Gemini authentication detected. Set GEMINI_API_KEY or GOOGLE_API_KEY env var, or run `gemini auth login` for OAuth');
    }

    if (settingsInfo.previewFeatures) {
      statusParts.push('Gemini 3 Pro enabled');
    }

    // Preferred models (newest first) — used as default and fallback
    const PREFERRED_IMAGE_MODEL = 'gemini-3-pro-image-preview';
    const FALLBACK_IMAGE_MODEL = 'gemini-2.5-flash-image';
    const PREFERRED_TEXT_MODEL = 'gemini-3-pro-preview';
    const FALLBACK_TEXT_MODEL = 'gemini-2.5-pro';

    if (nanoBananaInfo.installed) {
      const model = process.env.NANOBANANA_MODEL;
      const hasApiKey = !!(process.env.NANOBANANA_GEMINI_API_KEY || process.env.NANOBANANA_GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

      if (model) {
        statusParts.push(`nano-banana (${model})`);
      } else {
        statusParts.push(`nano-banana (default: ${PREFERRED_IMAGE_MODEL})`);
      }

      if (!hasApiKey) {
        warnings.push('nano-banana requires an API key (OAuth alone is not sufficient for MCP extensions). Set: export GEMINI_API_KEY=your-key or export NANOBANANA_GEMINI_API_KEY=your-key');
      }
    } else {
      warnings.push('nano-banana extension not installed. Install: gemini extensions install https://github.com/gemini-cli-extensions/nanobanana');
    }

    let systemMessage;

    if (warnings.length > 0 && statusParts.length === 0) {
      systemMessage = `[gemini-cli] Not ready - ${warnings.join('. ')}`;
    } else if (warnings.length > 0) {
      systemMessage = `[gemini-cli] ${statusParts.join(', ')}. Warnings: ${warnings.join('. ')}`;
    } else {
      systemMessage = `[gemini-cli] ${statusParts.join(', ')}`;
    }

    // Inject model policy — tells Claude which models to use by default
    const modelEnv = process.env.NANOBANANA_MODEL;
    const modelPolicy = [];
    modelPolicy.push(`[gemini-cli] Model policy: For image generation, always prepend NANOBANANA_MODEL=${modelEnv || PREFERRED_IMAGE_MODEL} to gemini commands. For text reviews, use --model ${PREFERRED_TEXT_MODEL}.`);
    modelPolicy.push(`If a model returns an error (quota, unavailable, or capacity), retry with the fallback: images=${FALLBACK_IMAGE_MODEL}, text=${FALLBACK_TEXT_MODEL}. Inform the user which model was used.`);
    systemMessage += '\n' + modelPolicy.join(' ');

    console.log(JSON.stringify({
      continue: true,
      systemMessage
    }));

  } catch (err) {
    console.log(JSON.stringify({ continue: true }));
  }
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});

/**
 * Detect Gemini CLI installation and version
 */
function detectGeminiCli() {
  const result = { installed: false, version: null, method: 'none' };

  try {
    const output = execFileSync('gemini', ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    result.installed = true;
    result.method = 'cli';

    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }
  } catch (e) {
    // CLI not available
  }

  return result;
}

/**
 * Check for Gemini authentication
 */
function checkAuth() {
  const result = { authenticated: false, method: null };

  const envVars = [
    { name: 'GEMINI_API_KEY', label: 'GEMINI_API_KEY' },
    { name: 'GOOGLE_API_KEY', label: 'GOOGLE_API_KEY' },
    { name: 'NANOBANANA_GEMINI_API_KEY', label: 'NANOBANANA_GEMINI_API_KEY' },
    { name: 'NANOBANANA_GOOGLE_API_KEY', label: 'NANOBANANA_GOOGLE_API_KEY' }
  ];

  for (const { name, label } of envVars) {
    if (process.env[name] && process.env[name].length > 0) {
      result.authenticated = true;
      result.method = label;
      return result;
    }
  }

  // Check for Google OAuth (look for cached credentials)
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const oauthPaths = [
    path.join(home, '.gemini', 'oauth_creds.json'),
    path.join(home, '.config', 'gemini', 'oauth_creds.json'),
    path.join(home, '.gemini', 'credentials.json'),
    path.join(home, '.config', 'gemini', 'credentials.json'),
    path.join(home, '.config', 'google-cloud', 'application_default_credentials.json')
  ];

  for (const oauthPath of oauthPaths) {
    if (fs.existsSync(oauthPath)) {
      result.authenticated = true;
      result.method = 'OAuth';
      return result;
    }
  }

  // Check for Vertex AI
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
    result.authenticated = true;
    result.method = 'Vertex AI';
    return result;
  }

  return result;
}

/**
 * Check Gemini CLI settings for Gemini 3 Pro support
 */
function checkSettings() {
  const result = { previewFeatures: false, settingsFound: false };

  const home = process.env.HOME || process.env.USERPROFILE || '';
  const settingsPaths = [
    path.join(home, '.gemini', 'settings.json'),
    path.join(home, '.config', 'gemini', 'settings.json')
  ];

  for (const settingsPath of settingsPaths) {
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        result.settingsFound = true;
        result.previewFeatures = !!(settings.general && settings.general.previewFeatures);
        return result;
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  return result;
}

/**
 * Check if nano-banana extension is installed
 */
function checkNanoBanana() {
  const result = { installed: false };

  const home = process.env.HOME || process.env.USERPROFILE || '';
  const extensionPaths = [
    path.join(home, '.gemini', 'extensions', 'nanobanana'),
    path.join(home, '.config', 'gemini', 'extensions', 'nanobanana'),
    path.join(home, '.gemini', 'extensions', 'nano-banana'),
    path.join(home, '.config', 'gemini', 'extensions', 'nano-banana')
  ];

  for (const extPath of extensionPaths) {
    if (fs.existsSync(extPath)) {
      result.installed = true;
      return result;
    }
  }

  // Try listing extensions via CLI
  try {
    const output = execFileSync('gemini', ['extensions', 'list'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    if (output.toLowerCase().includes('nanobanana') || output.toLowerCase().includes('nano-banana')) {
      result.installed = true;
    }
  } catch (e) {
    // Can't check via CLI
  }

  return result;
}
