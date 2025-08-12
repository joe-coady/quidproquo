// Extend Vitest's expect with custom matchers for generators
interface CustomMatchers<R = unknown> {
  toYieldValue(expected: any): R
  toCompleteWith(expected: any): R
  toYieldSequence(sequence: Array<{ yields?: any, given?: any, returns?: any }>): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Only register matchers if expect is available
if (typeof globalThis !== 'undefined' && (globalThis as any).expect) {
  const expect = (globalThis as any).expect
  expect.extend({
  toYieldValue(received: Generator, expected: any) {
    const { value, done } = received.next()
    
    if (done) {
      return {
        pass: false,
        message: () => `Expected generator to yield a value, but it completed`,
        actual: { done: true, value },
        expected
      }
    }
    
    const pass = this.equals(value, expected)
    return {
      pass,
      message: () => 
        pass 
          ? `Expected generator not to yield ${this.utils.printExpected(expected)}`
          : `Expected generator to yield ${this.utils.printExpected(expected)}, but yielded ${this.utils.printReceived(value)}`,
      actual: value,
      expected
    }
  },

  toCompleteWith(received: Generator, expected: any) {
    const { value, done } = received.next(expected)
    
    if (!done) {
      return {
        pass: false,
        message: () => `Expected generator to complete, but it yielded ${this.utils.printReceived(value)}`,
        actual: { done: false, value },
        expected: { done: true, value: expected }
      }
    }
    
    const pass = value === expected
    return {
      pass,
      message: () =>
        pass
          ? `Expected generator not to return ${this.utils.printExpected(expected)}`
          : `Expected generator to return ${this.utils.printExpected(expected)}, but returned ${this.utils.printReceived(value)}`,
      actual: value,
      expected
    }
  },

  toYieldSequence(received: Generator, sequence: any[]) {
    const results: any[] = []
    let currentStep = 0
    
    for (const step of sequence) {
      if (step.yields !== undefined) {
        const { value, done } = received.next()
        results.push({ step: currentStep, yielded: value, done })
        
        if (done) {
          return {
            pass: false,
            message: () => `Expected generator to yield at step ${currentStep}, but it completed`,
            actual: results,
            expected: sequence
          }
        }
        
        if (!this.equals(value, step.yields)) {
          return {
            pass: false,
            message: () => 
              `At step ${currentStep}: expected to yield ${this.utils.printExpected(step.yields)}, ` +
              `but yielded ${this.utils.printReceived(value)}`,
            actual: value,
            expected: step.yields
          }
        }
      }
      
      if (step.given !== undefined) {
        // Input will be used in next iteration
      }
      
      if (step.returns !== undefined) {
        const input = sequence[currentStep - 1]?.given
        const { value, done } = received.next(input)
        results.push({ step: currentStep, returned: value, done })
        
        if (!done) {
          return {
            pass: false,
            message: () => `Expected generator to complete at step ${currentStep}, but it yielded`,
            actual: results,
            expected: sequence
          }
        }
        
        if (!this.equals(value, step.returns)) {
          return {
            pass: false,
            message: () =>
              `At step ${currentStep}: expected to return ${this.utils.printExpected(step.returns)}, ` +
              `but returned ${this.utils.printReceived(value)}`,
            actual: value,
            expected: step.returns
          }
        }
      }
      
      currentStep++
    }
    
    return {
      pass: true,
      message: () => `Expected generator not to match sequence`,
      actual: results,
      expected: sequence
    }
  }
  })
}