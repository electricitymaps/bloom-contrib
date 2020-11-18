module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
    'convert-to-json',
  ],
  ignore: ['**/*.test.js'],
};
