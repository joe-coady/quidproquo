interface GeneratorStep {
  type: 'yield' | 'return'
  value: any
  input?: any
}

export class GeneratorExpectChain<T = any> {
  private steps: GeneratorStep[] = []
  private lastInput: any
  private expect: any
  
  constructor(private generator: Generator<any, any, any>, expect?: any) {
    // Use global expect if available, otherwise use provided expect
    this.expect = expect || (globalThis as any).expect
    if (!this.expect) {
      throw new Error('expect function not found. Please ensure Vitest or another test framework is available.')
    }
  }

  toYield(expected: any): this {
    const { value, done } = this.generator.next()
    this.expect(done).toBe(false)
    this.expect(value).toEqual(expected)
    this.steps.push({ type: 'yield', value })
    return this
  }

  toYieldAction(expected: any): this {
    return this.toYield(expected)
  }

  // Multiple name options for clarity in different contexts
  whenGiven(input: any): this {
    this.lastInput = input
    return this
  }
  
  andReceive(input: any): this {
    return this.whenGiven(input)
  }
  
  withResponse(input: any): this {
    return this.whenGiven(input)
  }

  thenYield(expected: any): this {
    const { value, done } = this.generator.next(this.lastInput)
    this.expect(done).toBe(false)
    this.expect(value).toEqual(expected)
    this.steps.push({ type: 'yield', value, input: this.lastInput })
    this.lastInput = undefined
    return this
  }

  thenReturn(expected: any): void {
    const { value, done } = this.generator.next(this.lastInput)
    this.expect(done).toBe(true)
    this.expect(value).toStrictEqual(expected)
    this.steps.push({ type: 'return', value, input: this.lastInput })
  }

  // Alternative terminator that doesn't check the return value
  thenComplete(): void {
    const { done } = this.generator.next(this.lastInput)
    this.expect(done).toBe(true)
  }

  // For debugging - returns current execution steps
  getSteps(): GeneratorStep[] {
    return [...this.steps]
  }

  // Snapshot support for recording generator behavior
  toMatchSnapshot(name?: string): void {
    this.expect(this.steps).toMatchSnapshot(name)
  }
}

export function expectGenerator<T>(gen: Generator<any, T, any>, expect?: any): GeneratorExpectChain<T> {
  return new GeneratorExpectChain(gen, expect)
}

/**
 * Helper to create a generator that returns immediately without yielding
 * Useful for mocking sub-generators in tests
 */
export function mockGeneratorReturn<T>(value: T): Generator<any, T, any> {
  return (function*() {
    return value
  })()
}

/**
 * Helper to create a generator that yields once then returns
 * Useful for mocking sub-generators that need to yield an action
 */
export function mockGeneratorYieldReturn<Y, R>(yieldValue: Y, returnValue: R): Generator<Y, R, any> {
  return (function*() {
    yield yieldValue
    return returnValue
  })()
}