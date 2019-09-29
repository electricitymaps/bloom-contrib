module.exports = {
  'presets': ['@babel/preset-env'],
  'plugins': [
    [
      '@babel/plugin-proposal-class-properties'
    ],
    ['@babel/plugin-transform-runtime', {
      'regenerator': true,
    }],
    ['wildcard', {
      'exts': ['js', 'es6', 'es', 'jsx', 'javascript', 'png'],
      'useCamelCase': true,
    }],
  ],
};
