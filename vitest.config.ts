import { defineConfig } from 'vitest/config'
import packageJson from './package.json'

const packagesToSkip = [
  'quidproquo-tsconfig',
  'quidproquo-eslint-config'
];

export default defineConfig({
  test: {
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