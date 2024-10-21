module.exports = {
  extends: [
    './config/base.js',
    './config/generators.js',
    './config/imports.js',
    './config/overrides.js',
    './config/typescript.js',
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'lib/'],
};
