module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', '@eslint-community/eslint-comments'],
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Cross Platform Dev
    'linebreak-style': 'off',

    indent: 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
