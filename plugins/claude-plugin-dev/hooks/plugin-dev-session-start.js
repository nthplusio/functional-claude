#!/bin/sh
":" //; export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/aliases/default/bin:$HOME/.asdf/shims:$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"
":" //; command -v node >/dev/null 2>&1 || { [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ] && . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" 2>/dev/null; }
":" //; exec node "$0" "$@"
// plugin-dev-session-start.js
// SessionStart hook: silent — marketplace context is in CLAUDE.md,
// plugin status available via /plugin-status.

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  console.log(JSON.stringify({ continue: true }));
});

process.stdin.on('error', () => {
  console.log(JSON.stringify({ continue: true }));
});
