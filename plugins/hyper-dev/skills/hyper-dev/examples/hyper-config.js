// Example Hyper Configuration
// Location: ~/.hyper.js (Linux), ~/Library/Application Support/Hyper/.hyper.js (macOS),
//           %APPDATA%\Hyper\.hyper.js (Windows)

module.exports = {
  config: {
    // ============================================
    // Font Settings
    // ============================================
    fontSize: 13,
    fontFamily: '"Fira Code", "JetBrains Mono", Menlo, "DejaVu Sans Mono", Consolas, monospace',
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.2,
    letterSpacing: 0,

    // ============================================
    // Cursor Settings
    // ============================================
    cursorColor: '#f8f8f2',
    cursorAccentColor: '#000',
    cursorShape: 'BLOCK', // 'BEAM', 'UNDERLINE', 'BLOCK'
    cursorBlink: true,

    // ============================================
    // Colors - Dracula Theme
    // ============================================
    foregroundColor: '#f8f8f2',
    backgroundColor: '#282a36',
    selectionColor: 'rgba(248,28,229,0.3)',
    borderColor: '#44475a',

    colors: {
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      lightBlack: '#6272a4',
      lightRed: '#ff6e6e',
      lightGreen: '#69ff94',
      lightYellow: '#ffffa5',
      lightBlue: '#d6acff',
      lightMagenta: '#ff92df',
      lightCyan: '#a4ffff',
      lightWhite: '#ffffff',
    },

    // ============================================
    // Window Settings
    // ============================================
    padding: '12px 14px',

    // Window decorations (macOS only)
    // showWindowControls: '',

    // ============================================
    // Shell Settings
    // ============================================
    shell: '', // Empty = default shell
    shellArgs: ['--login'],

    // Environment variables
    env: {},

    // ============================================
    // Bell Settings
    // ============================================
    bell: 'SOUND', // 'SOUND', 'false'
    bellSoundURL: null, // Custom bell sound URL
    bellSound: null,

    // ============================================
    // Copy/Paste
    // ============================================
    copyOnSelect: false,

    // macOS only
    // macOptionSelectionMode: 'vertical',

    // ============================================
    // Scrollback
    // ============================================
    scrollback: 10000,

    // ============================================
    // Quick Edit Mode (Windows)
    // ============================================
    quickEdit: false,

    // ============================================
    // Screen Reader Mode
    // ============================================
    screenReaderMode: false,

    // ============================================
    // Update Settings
    // ============================================
    updateChannel: 'stable', // 'stable', 'canary'

    // ============================================
    // Web GL Renderer
    // ============================================
    webGLRenderer: true,

    // ============================================
    // Links
    // ============================================
    webLinksActivationKey: '', // '', 'ctrl', 'alt', 'meta', 'shift'

    // Disable ligatures
    disableLigatures: false,

    // ============================================
    // Plugin-specific Config
    // ============================================
    // hypercwd: {
    //   initialWorkingDirectory: '~'
    // },
  },

  // ============================================
  // Plugins
  // ============================================
  plugins: [
    // Core functionality
    'hypercwd',           // Open new tabs in current directory
    'hyper-search',       // Search terminal content
    'hyper-pane',         // Enhanced pane navigation

    // Visual enhancements
    // 'hyper-opacity',   // Window opacity
    // 'hyperpower',      // Particle effects
  ],

  // ============================================
  // Local Plugins (Development)
  // ============================================
  localPlugins: [
    // Add absolute paths to local plugins for development
    // '/Users/username/projects/hyper-my-plugin'
  ],

  // ============================================
  // Keymaps
  // ============================================
  keymaps: {
    // Window management
    'window:devtools': 'cmd+alt+i',
    'window:reload': 'cmd+shift+r',
    'window:reloadFull': 'cmd+shift+f5',
    'window:preferences': 'cmd+,',
    'window:new': 'cmd+n',
    'window:minimize': 'cmd+m',
    'window:close': 'cmd+shift+w',
    'window:toggleFullScreen': 'cmd+ctrl+f',

    // Zoom
    'zoom:reset': 'cmd+0',
    'zoom:in': 'cmd+plus',
    'zoom:out': 'cmd+minus',

    // Tabs
    'tab:new': 'cmd+t',
    'tab:next': 'cmd+shift+]',
    'tab:prev': 'cmd+shift+[',
    'tab:jump:prefix': 'cmd',

    // Panes
    'pane:splitVertical': 'cmd+d',
    'pane:splitHorizontal': 'cmd+shift+d',
    'pane:close': 'cmd+w',
    'pane:prev': 'cmd+alt+left',
    'pane:next': 'cmd+alt+right',

    // Editor
    'editor:copy': 'cmd+c',
    'editor:paste': 'cmd+v',
    'editor:selectAll': 'cmd+a',
    'editor:search': 'cmd+f',
    'editor:search-close': 'esc',

    // Plugins (if hyper-pane installed)
    // 'pane:splitDown': 'cmd+shift+d',
    // 'pane:splitRight': 'cmd+d',
  },
};
