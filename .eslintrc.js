const fs = require('fs');
const path = require('path');

const cspell = fs.readFileSync(path.resolve(__dirname, 'project-words.txt')).toString().split('\n');

module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  plugins: ['spellcheck'],
  env: {
    browser: true,
    jest: true,
    jquery: true,
    mocha: true,
    node: true,
  },
  globals: {
    ErrorUtils: true,
    JSX: true,
    NodeJS: true,
    __DEV__: true,
  },
  ignorePatterns: ['!.storybook'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-lines': ['error', 500],
    complexity: ['error', 50],
    'max-lines-per-function': ['warn', 200],
    'no-empty-function': ['warn', { allow: ['constructors'] }],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'spellcheck/spell-checker': [
      'warn',
      {
        comments: true,
        strings: true,
        identifiers: true,
        lang: 'en_US',
        skipWords: cspell,
        skipIfMatch: ['http?://[^s]*', '^[-\\w]+/[-\\w\\.]+$'],
        skipWordIfMatch: [],
        minLength: 3,
      },
    ],
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'max-params': 'off',
    'no-param-reassign': 'off',
    'no-promise-executor-return': 'off',
  },
};
