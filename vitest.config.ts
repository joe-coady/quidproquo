import { defineConfig } from 'vitest/config'

import packageJson from './package.json'

const packagesToSkip = [
  'quidproquo-tsconfig'
];

export default defineConfig({
  test: {
    // Node 25+ enables the experimental Web Storage API by default, injecting a
    // global `localStorage` that shadows jsdom's and is non-functional without a
    // `--localstorage-file`. Disable it in the test workers so jsdom owns storage.
    poolOptions: {
      forks: { execArgv: ['--no-experimental-webstorage'] },
    },
    // Hide console output from passing tests (the library logs on expected error paths),
    // but keep it for failing tests so debugging output is never lost.
    silent: 'passed-only',
    projects: packageJson.workspaces.filter(
      (workspace: string) => !packagesToSkip.includes(workspace)
    ),
    coverage: {
      reportsDirectory: './.coverage',
      reporter: ['text', 'html', 'json'],
      exclude: [
        '**/lib/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.*',
        '**/coverage/**',
        '**/.coverage/**',
        '**/scripts/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      include: [
        '**/src/**/*.ts',
        '**/src/**/*.tsx'
      ]
    }
  }
})