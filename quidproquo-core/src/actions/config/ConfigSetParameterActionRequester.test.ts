import { expectGenerator } from 'quidproquo-testing'

import { describe, it } from 'vitest'

import { ConfigActionType } from './ConfigActionType'
import { askConfigSetParameter } from './ConfigSetParameterActionRequester'

describe('ConfigSetParameterActionRequester', () => {
  describe('askConfigSetParameter', () => {
    it('should yield an action with correct type and payload', () => {
      const parameterName = 'my-parameter'
      const parameterValue = 'my-value'
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue }
        })
    })

    it('should return void when complete', () => {
      const parameterName = 'test-param'
      const parameterValue = 'test-value'
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue }
        })
        .thenComplete()
    })

    it('should handle empty string values', () => {
      const parameterName = 'empty-param'
      const parameterValue = ''
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue: '' }
        })
        .thenComplete()
    })

    it('should handle complex JSON string values', () => {
      const parameterName = 'json-config'
      const parameterValue = JSON.stringify({ key: 'value', nested: { data: 123 } })
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue }
        })
        .thenComplete()
    })

    it('should handle hierarchical parameter names', () => {
      const parameterName = '/app/config/database/connection'
      const parameterValue = 'postgres://localhost:5432/mydb'
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue }
        })
        .thenComplete()
    })

    it('should handle multiline string values', () => {
      const parameterName = 'multiline-config'
      const parameterValue = `line1
line2
line3`
      
      expectGenerator(askConfigSetParameter(parameterName, parameterValue))
        .toYield({
          type: ConfigActionType.SetParameter,
          payload: { parameterName, parameterValue }
        })
        .thenComplete()
    })
  })
})