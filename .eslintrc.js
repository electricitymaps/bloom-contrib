/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'prettier/react',
  ],
  parser: 'babel-eslint',
  plugins: ['jest', 'react-hooks', 'simple-import-sort', 'prettier'],
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.ios.js', '.android.js'],
      },
    },
  },
  overrides: [
    {
      files: ['*.spec.js', '*.spec.ts', '*.spec.tsx', '*.test.js', '*.test.ts', '*.test.tsx'],
      env: {
        node: true,
        browser: true,
        'jest/globals': true,
      },
    },
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        semi: true,
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info', 'debug'],
      },
    ],
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
    ],
    curly: 'error',
    'dot-notation': 'error',
    'no-await-in-loop': 'error',
    'no-duplicate-imports': 'error',
    'no-implicit-coercion': 'error',
    'no-nested-ternary': 'error',
    'no-param-reassign': 'error',
    'no-unused-vars': [
      'error',
      { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-use-before-define': ['error', { variables: true, functions: false, classes: true }],
    'prefer-const': 'error',
    'prefer-template': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/self-closing-comp': 'error',
    'simple-import-sort/sort': 'error',
    'object-shorthand': 'error',

    // Rules that doesn't make sense:
    'jest/no-standalone-expect': 'off', // afterEach not covered
    'import/prefer-default-export': 'off',
    'import/named': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'sort-imports': 'off', // replaced by simple-import-sort/sort
    'import/order': 'off', // replaced by simple-import-sort/sort
  },
};
