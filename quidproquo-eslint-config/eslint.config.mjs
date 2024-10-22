import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import { overrides } from './config/overrides.mjs';

export default [
  { ignores: ['dist/', 'lib/'] },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  overrides,
];
