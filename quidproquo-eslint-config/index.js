module.exports = {
  extends: [
    './config/base.js',
    // './config/functions.js',
    // './config/generators.js',
    // './config/imports.js',
    // './config/overrides.js',
    // './config/typescript.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'lib/'],
};
