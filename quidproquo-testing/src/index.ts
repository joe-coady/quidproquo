export { expectGenerator, GeneratorExpectChain } from './generatorExpect'
export * from './types'

// Export vitestMatchers for explicit import by Vitest users
// Users should import this explicitly: import 'quidproquo-testing/vitest'
// We don't auto-import since not all users may be using Vitest
