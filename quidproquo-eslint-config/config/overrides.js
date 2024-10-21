module.exports = {
  rules: {
    '@eslint-community/eslint-comments/no-unused-disable': 'error',

    // Anoying rules that slow dev
    'no-unused-vars': 'off',

    // index.js ~ export { default } from './Module';
    'no-restricted-exports': 'off',
  },
};
