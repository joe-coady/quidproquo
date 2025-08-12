import { describe, it, expect } from 'vitest'
import { expectGenerator } from './generatorExpect'

describe('expectGenerator', () => {
  describe('basic generator testing', () => {
    function* simpleGenerator(): Generator<any, string, string> {
      const first = yield { type: 'ACTION_1', payload: 'test' }
      return first
    }

    it('should test a simple yield and return', () => {
      expectGenerator(simpleGenerator())
        .toYield({ type: 'ACTION_1', payload: 'test' })
        .whenGiven('result')
        .thenReturn('result')
    })

    it('should support alternative method names', () => {
      expectGenerator(simpleGenerator())
        .toYieldAction({ type: 'ACTION_1', payload: 'test' })
        .andReceive('result')
        .thenReturn('result')
    })
  })

  describe('complex generator flows', () => {
    function* complexGenerator(): Generator<any, string, any> {
      const random = yield { type: 'GET_RANDOM' }
      if (random > 0.5) {
        yield { type: 'LOG', payload: 'high' }
        return 'high'
      } else {
        yield { type: 'LOG', payload: 'low' }
        return 'low'
      }
    }

    it('should handle conditional flow - high path', () => {
      expectGenerator(complexGenerator())
        .toYield({ type: 'GET_RANDOM' })
        .whenGiven(0.75)
        .thenYield({ type: 'LOG', payload: 'high' })
        .whenGiven(undefined)
        .thenReturn('high')
    })

    it('should handle conditional flow - low path', () => {
      expectGenerator(complexGenerator())
        .toYield({ type: 'GET_RANDOM' })
        .whenGiven(0.25)
        .thenYield({ type: 'LOG', payload: 'low' })
        .whenGiven(undefined)
        .thenReturn('low')
    })
  })

  describe('multiple yields', () => {
    function* multiYieldGenerator(): Generator<any, any, any> {
      const a = yield { type: 'ACTION_A' }
      const b = yield { type: 'ACTION_B', payload: a }
      const c = yield { type: 'ACTION_C', payload: b }
      return { a, b, c }
    }

    it('should handle multiple sequential yields', () => {
      expectGenerator(multiYieldGenerator())
        .toYield({ type: 'ACTION_A' })
        .whenGiven('valueA')
        .thenYield({ type: 'ACTION_B', payload: 'valueA' })
        .whenGiven('valueB')
        .thenYield({ type: 'ACTION_C', payload: 'valueB' })
        .whenGiven('valueC')
        .thenReturn({ a: 'valueA', b: 'valueB', c: 'valueC' })
    })
  })

  describe('void returns', () => {
    function* voidGenerator(): Generator<any, void, any> {
      yield { type: 'SIDE_EFFECT' }
      // Returns undefined implicitly
    }

    it('should handle generators that return void', () => {
      expectGenerator(voidGenerator())
        .toYield({ type: 'SIDE_EFFECT' })
        .thenComplete()
    })
  })

})