import { expectGenerator } from 'quidproquo-testing'

import { describe, expect,it } from 'vitest'

import { ConfigActionType } from './ConfigActionType'
import { askConfigGetParameter, ConfigGetParameterErrorTypeEnum } from './ConfigGetParameterActionRequester'

describe('ConfigGetParameterActionRequester', () => {
  describe('askConfigGetParameter', () => {
    it('should yield an action with correct type and payload', () => {
      const parameterName = 'my-parameter'
      
      expectGenerator(askConfigGetParameter(parameterName))
        .toYield({
          type: ConfigActionType.GetParameter,
          payload: { parameterName }
        })
    })

    it('should return the value passed to next()', () => {
      const parameterName = 'test-param'
      const mockParameterValue = 'parameter-value'
      
      expectGenerator(askConfigGetParameter(parameterName))
        .toYield({
          type: ConfigActionType.GetParameter,
          payload: { parameterName }
        })
        .whenGiven(mockParameterValue)
        .thenReturn(mockParameterValue)
    })

    it('should handle hierarchical parameter names', () => {
      const parameterName = '/app/db/connection-string'
      const mockValue = 'mongodb://localhost:27017'
      
      expectGenerator(askConfigGetParameter(parameterName))
        .toYield({
          type: ConfigActionType.GetParameter,
          payload: { parameterName }
        })
        .whenGiven(mockValue)
        .thenReturn(mockValue)
    })

    it('should handle parameter names with special characters', () => {
      const parameterName = 'config.param-name_123'
      const mockValue = 'special-value'
      
      expectGenerator(askConfigGetParameter(parameterName))
        .toYield({
          type: ConfigActionType.GetParameter,
          payload: { parameterName }
        })
        .whenGiven(mockValue)
        .thenReturn(mockValue)
    })
  })

  describe('ConfigGetParameterErrorTypeEnum', () => {
    it('should have Throttling error type', () => {
      expect(ConfigGetParameterErrorTypeEnum.Throttling).toBeDefined()
      expect(ConfigGetParameterErrorTypeEnum.Throttling).toContain('Throttling')
    })

    it('should be prefixed with the action type', () => {
      expect(ConfigGetParameterErrorTypeEnum.Throttling).toContain(ConfigActionType.GetParameter)
    })
  })
})