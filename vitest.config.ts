import { defineConfig } from 'vitest/config'
import packageJson from './package.json'

const packagesToSkip = [
  'quidproquo-tsconfig',
  'quidproquo-eslint-config'
];

export default defineConfig({
  test: {
    projects: packageJson.workspaces.filter(
      workspace => !packagesToSkip.includes(workspace)
    )
  }
})