/// <reference types="vitest" />

// Editor-only shim: the per-package editor tsconfigs use node10 module
// resolution, which cannot see vitest's export map, so VS Code would flag
// every `import { describe } from 'vitest'`. Declaring the test globals as
// `any` keeps the editor quiet; real type checking of tests happens under
// tsconfig.test.json and vitest itself.
declare module 'vitest' {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const test: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const beforeAll: any;
  export const afterAll: any;
  export const vi: any;
}
