import { describe, it, expect } from 'vitest'
import { expectGenerator } from 'quidproquo-testing'
import { askConfigListParameters, ConfigListParametersErrorTypeEnum } from './ConfigListParametersActionRequester'
import { ConfigActionType } from './ConfigActionType'

describe('ConfigListParametersActionRequester', () => {
  describe('askConfigListParameters', () => {
    const standardListParametersAction = { type: ConfigActionType.ListParameters }

    it('should yield an action with correct type and no payload', () => {
      expectGenerator(askConfigListParameters())
        .toYield(standardListParametersAction)
    })

    it('should return the value passed to next()', () => {
      const mockParameterList = [
        'param1',
        'param2',
        '/app/config/param3',
        '/app/db/connection'
      ]
      
      expectGenerator(askConfigListParameters())
        .toYield(standardListParametersAction)
        .whenGiven(mockParameterList)
        .thenReturn(mockParameterList)
    })

    it('should handle empty list return', () => {
      const mockEmptyList: string[] = []
      
      expectGenerator(askConfigListParameters())
        .toYield(standardListParametersAction)
        .whenGiven(mockEmptyList)
        .thenReturn(mockEmptyList)
    })

    it('should handle large parameter list return', () => {
      const mockLargeList = Array.from({ length: 100 }, (_, i) => `param-${i}`)
      
      expectGenerator(askConfigListParameters())
        .toYield(standardListParametersAction)
        .whenGiven(mockLargeList)
        .thenReturn(mockLargeList)
    })
  })

  describe('ConfigListParametersErrorTypeEnum', () => {
    it('should have Throttling error type', () => {
      expect(ConfigListParametersErrorTypeEnum.Throttling).toBeDefined()
      expect(ConfigListParametersErrorTypeEnum.Throttling).toContain('Throttling')
    })

    it('should be prefixed with the action type', () => {
      expect(ConfigListParametersErrorTypeEnum.Throttling).toContain(ConfigActionType.ListParameters)
    })
  })
})