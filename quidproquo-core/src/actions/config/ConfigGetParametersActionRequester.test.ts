import { expectGenerator } from 'quidproquo-testing'

import { describe, expect,it } from 'vitest'

import { ConfigActionType } from './ConfigActionType'
import { askConfigGetParameters, ConfigGetParametersErrorTypeEnum } from './ConfigGetParametersActionRequester'

describe('ConfigGetParametersActionRequester', () => {
  describe('askConfigGetParameters', () => {
    it('should yield an action with correct type and payload', () => {
      const parameterNames = ['param1', 'param2', 'param3']
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames }
        })
    })

    it('should return the value passed to next()', () => {
      const parameterNames = ['test-param-1', 'test-param-2']
      const mockParameterValues = ['value1', 'value2'] // Returns array of strings, not object
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames }
        })
        .whenGiven(mockParameterValues)
        .thenReturn(mockParameterValues)
    })

    it('should handle empty array', () => {
      const parameterNames: string[] = []
      const mockValues: string[] = []
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames: [] }
        })
        .whenGiven(mockValues)
        .thenReturn(mockValues)
    })

    it('should handle single parameter in array', () => {
      const parameterNames = ['single-param']
      const mockValues = ['single-value']
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames }
        })
        .whenGiven(mockValues)
        .thenReturn(mockValues)
    })

    it('should handle hierarchical parameter names', () => {
      const parameterNames = [
        '/app/db/host',
        '/app/db/port',
        '/app/db/username',
        '/app/cache/ttl'
      ]
      const mockValues = ['localhost', '5432', 'admin', '3600']
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames }
        })
        .whenGiven(mockValues)
        .thenReturn(mockValues)
    })

    it('should handle duplicate parameter names in array', () => {
      const parameterNames = ['param1', 'param2', 'param1']
      const mockValues = ['value1', 'value2', 'value1']
      
      expectGenerator(askConfigGetParameters(parameterNames))
        .toYield({
          type: ConfigActionType.GetParameters,
          payload: { parameterNames }
        })
        .whenGiven(mockValues)
        .thenReturn(mockValues)
    })
  })

  describe('ConfigGetParametersErrorTypeEnum', () => {
    it('should have Throttling error type', () => {
      expect(ConfigGetParametersErrorTypeEnum.Throttling).toBeDefined()
      expect(ConfigGetParametersErrorTypeEnum.Throttling).toContain('Throttling')
    })

    it('should be prefixed with the action type', () => {
      expect(ConfigGetParametersErrorTypeEnum.Throttling).toContain(ConfigActionType.GetParameters)
    })
  })
})