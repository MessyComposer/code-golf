// Monaco Editor integration with tree-shaking support
import * as monaco from 'monaco-editor';

// The Monaco Webpack Plugin will handle language and features registration
// No need to manually import language contributions

// Configure Monaco Editor worker
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  }
};

/**
 * Create Monaco Editor instance with optimized configuration
 * @param {HTMLElement} container - The DOM element to mount the editor
 * @param {Object} options - Editor configuration options
 * @returns {monaco.editor.IStandaloneCodeEditor} Monaco Editor instance
 */
export function createEditor(container, options = {}) {
  const defaultOptions = {
    theme: 'vs-dark',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    autoIndent: 'full',
    automaticLayout: true,
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    renderLineHighlight: 'gutter',
    selectOnLineNumbers: true,
    matchBrackets: 'always',
    contextmenu: true,
    mouseWheelZoom: true,
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    ...options
  };

  return monaco.editor.create(container, defaultOptions);
}

/**
 * Get available languages for Monaco Editor
 * @returns {Array} Array of language configurations
 */
export function getAvailableLanguages() {
  return [
    { id: 'javascript', label: 'JavaScript', extension: '.js' },
    { id: 'typescript', label: 'TypeScript', extension: '.ts' },
    // { id: 'python', label: 'Python', extension: '.py' },
    // { id: 'html', label: 'HTML', extension: '.html' },
    // { id: 'css', label: 'CSS', extension: '.css' }
  ];
}

/**
 * Set language for Monaco Editor instance
 * @param {monaco.editor.IStandaloneCodeEditor} editor - Editor instance
 * @param {string} language - Language identifier
 */
export function setLanguage(editor, language) {
  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelLanguage(model, language);
  }
}

/**
 * Configure Monaco Editor themes
 */
export function defineCustomThemes() {
  // Define a custom dark theme optimized for code golf
  monaco.editor.defineTheme('code-golf-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'namespace', foreground: '4EC9B0' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'struct', foreground: '4EC9B0' },
      { token: 'class', foreground: '4EC9B0' },
      { token: 'interface', foreground: '4EC9B0' },
      { token: 'enum', foreground: '4EC9B0' },
      { token: 'typeParameter', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'method', foreground: 'DCDCAA' },
      { token: 'decorator', foreground: 'DCDCAA' },
      { token: 'macro', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'variable.predefined', foreground: '4FC1FF' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'property', foreground: '9CDCFE' },
      { token: 'enumMember', foreground: '4FC1FF' },
      { token: 'event', foreground: '4FC1FF' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorCursor.foreground': '#AEAFAD',
      'editor.lineHighlightBackground': '#2D2D30',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#C6C6C6',
      'editor.selectionBackground': '#264F78',
      'editor.selectionHighlightBackground': '#ADD6FF26',
      'editor.wordHighlightBackground': '#575757B8',
      'editor.wordHighlightStrongBackground': '#004972B8',
      'editor.findMatchBackground': '#515C6A',
      'editor.findMatchHighlightBackground': '#EA5C0055',
      'editor.findRangeHighlightBackground': '#3A3D4166',
      'editor.hoverHighlightBackground': '#264F7840',
      'editorBracketMatch.background': '#0064001A',
      'editorBracketMatch.border': '#888888',
      'editorGutter.background': '#1E1E1E',
      'editorGutter.modifiedBackground': '#1B81A8',
      'editorGutter.addedBackground': '#487E02',
      'editorGutter.deletedBackground': '#F85149'
    }
  });

  // Define a custom light theme
  monaco.editor.defineTheme('code-golf-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '09885A' },
      { token: 'regexp', foreground: '800000' },
      { token: 'operator', foreground: '000000' },
      { token: 'namespace', foreground: '267F99' },
      { token: 'type', foreground: '267F99' },
      { token: 'struct', foreground: '267F99' },
      { token: 'class', foreground: '267F99' },
      { token: 'interface', foreground: '267F99' },
      { token: 'enum', foreground: '267F99' },
      { token: 'typeParameter', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'method', foreground: '795E26' },
      { token: 'decorator', foreground: '795E26' },
      { token: 'macro', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
      { token: 'variable.predefined', foreground: '0000FF' },
      { token: 'constant', foreground: '0000FF' },
      { token: 'property', foreground: '001080' },
      { token: 'enumMember', foreground: '0000FF' },
      { token: 'event', foreground: '0000FF' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editorCursor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F0F0F0',
      'editorLineNumber.foreground': '#237893',
      'editorLineNumber.activeForeground': '#0B216F',
      'editor.selectionBackground': '#ADD6FF',
      'editor.selectionHighlightBackground': '#ADD6FF80',
      'editor.wordHighlightBackground': '#57575740',
      'editor.wordHighlightStrongBackground': '#00497240',
      'editor.findMatchBackground': '#A8AC94',
      'editor.findMatchHighlightBackground': '#EA5C0055',
      'editor.findRangeHighlightBackground': '#3A3D4166',
      'editor.hoverHighlightBackground': '#264F7840',
      'editorBracketMatch.background': '#0064001A',
      'editorBracketMatch.border': '#B9B9B9',
      'editorGutter.background': '#FFFFFF',
      'editorGutter.modifiedBackground': '#1B81A8',
      'editorGutter.addedBackground': '#487E02',
      'editorGutter.deletedBackground': '#F85149'
    }
  });
}

// Export Monaco namespace for advanced usage
export { monaco };
